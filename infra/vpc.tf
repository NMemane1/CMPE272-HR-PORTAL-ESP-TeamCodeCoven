module "vpc_primary" {
  source = "terraform-aws-modules/vpc/aws"

  tags = {
  Name = "vpc-primary"
  Environment = "dev"
  Project = "hr-portal"
  }

  name = "my-vpc-primary"
  cidr = "172.16.0.0/16"


  azs              = ["us-west-1a","us-west-1c"]
  public_subnets   = ["172.16.1.0/24","172.16.2.0/24"]
  private_subnets       = ["172.16.3.0/24", "172.16.4.0/24" ] // for db use

  create_igw = true
  enable_nat_gateway = false 
  single_nat_gateway = false

}

output "vpc_primary_id" {
  value = module.vpc_primary.vpc_id
}

resource "tls_private_key" "key_primary" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "key_pair_primary" {
  key_name   = "key_primary"
  public_key = tls_private_key.key_primary.public_key_openssh

  provisioner "local-exec" {
    command = "echo '${tls_private_key.key_primary.private_key_pem}' > ${path.module}/key_primary.pem && chmod 0700 ${path.module}/key_primary.pem"
  }
}

resource "aws_instance" "backend" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.micro"
  subnet_id                   = module.vpc_primary.public_subnets[0]
  vpc_security_group_ids      = [aws_security_group.backend.id, 
                                aws_security_group.allow_egress_primary.id]
  key_name                    = aws_key_pair.key_pair_primary.key_name
  associate_public_ip_address = true
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  
  user_data = templatefile("${path.module}/user_data.sh", {
    db_host = module.db_primary.db_instance_address,
    db_user = "root",
    db_pass = random_password.db.result
  })

  tags = { Name = "backend-primary" }
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  owners = ["099720109477"] # Canonical
}