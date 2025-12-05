# CloudWatch Log Group：store EC2 logs
resource "aws_cloudwatch_log_group" "hr_portal" {
  name              = "/hr-portal/app"
  retention_in_days = 14
}

data "aws_iam_instance_profile" "ec2_profile" {
  name = aws_iam_instance_profile.ec2_profile.name 
}

# attch CloudWatch Agent policy to instance role
resource "aws_iam_role_policy_attachment" "attach_cw_agent" {
  role       = aws_iam_role.ec2_role.name  
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# attch get SSM config policy to instance role
resource "aws_iam_role_policy_attachment" "attach_ssm_readonly" {
  role       = aws_iam_role.ec2_role.name  
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

# CloudWatch Agent config send to SSM params
resource "aws_ssm_parameter" "cw_agent_config" {
  name  = "/hr-portal/cwagent-config"
  type  = "String"
  value = jsonencode({
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path        = "/var/log/syslog"
              log_group_name   = aws_cloudwatch_log_group.hr_portal.name
              log_stream_name  = "{instance_id}/syslog"
              timestamp_format = "%b %d %H:%M:%S"
            },
            {
              file_path        = "/var/log/cloud-init-output.log"
              log_group_name   = aws_cloudwatch_log_group.hr_portal.name
              log_stream_name  = "{instance_id}/cloud-init-output"
              timestamp_format = "%Y-%m-%dT%H:%M:%S"
            },
            {
              file_path        = "/var/lib/docker/containers/*/*.log"
              log_group_name   = aws_cloudwatch_log_group.hr_portal.name
              log_stream_name  = "{instance_id}/docker"
              timestamp_format = "%Y-%m-%dT%H:%M:%S"
              multi_line_start_pattern = "^{"
            }
          ]
        }
      }
    }
    metrics = {
      append_dimensions = {
        InstanceId = "$${aws:InstanceId}"
      }
      metrics_collected = {
        statsd = { service_address = ":8125" }
      }
    }
  })
}
