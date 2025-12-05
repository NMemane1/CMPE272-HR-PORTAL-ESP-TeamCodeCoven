resource "random_password" "db" {
  length  = 20
  special = true
  override_special = "_%@#-+="
}

module "db_primary" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "rds-primary"

  engine            = "mysql"
  engine_version    = "8.0"
  major_engine_version = "8.0"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20

  db_name  = "employees"
  username = "root"
  password = random_password.db.result
  manage_master_user_password = false
  port     = 3306

  multi_az = false
  vpc_security_group_ids = [aws_security_group.db_primary.id]

  backup_retention_period  = 1
  apply_immediately       = true


  # DB subnet group
  create_db_subnet_group = true
  subnet_ids  = module.vpc_primary.private_subnets

  # DB parameter group
  family = "mysql8.0"

  storage_encrypted = true

  publicly_accessible = false

  skip_final_snapshot = true
  deletion_protection = false

}

output "rds_endpoint_primary" {
  value = module.db_primary.db_instance_endpoint
}


resource "null_resource" "db_init" {
  depends_on = [module.db_primary, aws_instance.backend]

  connection {
    type        = "ssh"
    host        = aws_instance.backend.public_ip
    user        = "ubuntu"
    private_key = tls_private_key.key_primary.private_key_pem
  }

provisioner "file" {
  content     = templatefile("${path.module}/db_init.sh.tpl", {
    db_host = module.db_primary.db_instance_address
    db_user = "root"
    db_pass = random_password.db.result
  })
  destination = "/home/ubuntu/db_init.sh"
}

  provisioner "remote-exec" {
    inline = [
      "chmod +x /home/ubuntu/db_init.sh",
      "sudo /home/ubuntu/db_init.sh"
    ]
  }
}
