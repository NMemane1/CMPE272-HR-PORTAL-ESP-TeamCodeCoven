#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

sudo apt-get update -y
sudo apt-get install -y git mysql-client

sudo apt-get install -y wget curl jq 

#install awscli
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt-get install -y unzip
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf aws awscliv2.zip

echo "SPRING_DATASOURCE_URL=jdbc:mysql://${db_host}:3306/employees" >> /etc/environment
echo "SPRING_DATASOURCE_USERNAME=${db_user}" >> /etc/environment
echo "SPRING_DATASOURCE_PASSWORD=${db_pass}" >> /etc/environment
echo "SERVER_PORT=8080" >> /etc/environment

# install (Java 17)
wget -O- https://apt.corretto.aws/corretto.key | gpg --dearmor | tee /usr/share/keyrings/corretto.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/corretto.gpg] https://apt.corretto.aws stable main" > /etc/apt/sources.list.d/corretto.list
apt-get update -y
apt-get install -y java-17-amazon-corretto-jdk

# verify
java -version || true

# app directory
install -d -m 0755 /opt/hr-portal

# --- CloudWatch Agent (install & start) ---
cd /tmp
curl -fsS -o amazon-cloudwatch-agent.deb \
  https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# pull config from SSM and start
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -c ssm:/hr-portal/cwagent-config -s || true

