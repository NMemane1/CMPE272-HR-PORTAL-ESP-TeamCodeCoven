locals {
  primary_vpc_id = module.vpc_primary.vpc_id
}

resource "aws_security_group" "allow_egress_primary" {
  name        = "allow-egress-primary"
  description = "Allow all outbound traffic in primary vpc"
  vpc_id      = local.primary_vpc_id

  tags = {
    Name = "allow_egress_primary"
  }
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_primary" {
  security_group_id = aws_security_group.allow_egress_primary.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}


#backend ec2 sg
resource "aws_security_group" "backend" {
  name        = "backend-sg"
  description = "SSH from anywhere; 8080 from anywhere"
  vpc_id      = local.primary_vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "backend_ssh_in_any" {
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"   
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
}

resource "aws_vpc_security_group_ingress_rule" "backend_http_in_any" {
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"   
  ip_protocol       = "tcp"
  from_port         = 8080
  to_port           = 8080
}

resource "aws_vpc_security_group_ingress_rule" "backend_http" {
  security_group_id = aws_security_group.backend.id
  cidr_ipv4         = "0.0.0.0/0"   
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_security_group" "db_primary" {
  name        = "db-primary"
  description = "allow traffic from ec2 subnets in primary vpc"
  vpc_id      = local.primary_vpc_id

  tags = {
    Name = "db-primary"
  }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_ec2_primary" {
   security_group_id = aws_security_group.db_primary.id
   referenced_security_group_id = aws_security_group.backend.id
   from_port         = 3306
   ip_protocol       = "tcp"
   to_port           = 3306
}
















  



