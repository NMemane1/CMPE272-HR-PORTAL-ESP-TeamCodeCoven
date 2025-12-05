resource "aws_ecr_repository" "hr_backend" {
  name                 = "hr-backend"
  region = "us-west-1"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "hr_frontend" {
  name                 = "hr-frontend"
  region = "us-west-1"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

# GitHub OIDC Provider
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # GitHub OIDC thumbprint
}

# allow workflow of the repo to AssumeRole
data "aws_iam_policy_document" "gha_oidc_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals { 
        type = "Federated"
        identifiers = [aws_iam_openid_connect_provider.github.arn] 
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:NMemane1/CMPE272-HR-PORTAL-ESP-TeamCodeCoven:*"]
    }
  }
}


data "aws_iam_policy_document" "ecr_push" {
  statement {
    sid     = "EcrAuth"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    sid = "EcrUpload"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = [
      aws_ecr_repository.hr_backend.arn,
      aws_ecr_repository.hr_frontend.arn
    ]
  }
}

resource "aws_iam_policy" "ecr_push" {
  name   = "ecr-push-policy"
  policy = data.aws_iam_policy_document.ecr_push.json
}

resource "aws_iam_role" "gha_ecr_push" {
  name               = "gha-ecr-push-role"
  assume_role_policy = data.aws_iam_policy_document.gha_oidc_trust.json
}


resource "aws_iam_role_policy_attachment" "gha_ecr_push_attach" {
  role       = aws_iam_role.gha_ecr_push.name
  policy_arn = aws_iam_policy.ecr_push.arn
}

output "gha_ecr_role_arn" {
  value = aws_iam_role.gha_ecr_push.arn
}

# ec2 role（AssumeRole policy for EC2）
data "aws_iam_policy_document" "ec2_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals { 
        type = "Service"
        identifiers = ["ec2.amazonaws.com"] 
    }
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "ec2-ecr-readonly-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_trust.json
}

# AWS policy：ECR readonly
resource "aws_iam_role_policy_attachment" "ec2_ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ec2-ecr-readonly-profile"
  role = aws_iam_role.ec2_role.name
}