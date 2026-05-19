provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions_deploy" {
  name = "GitHubActionsS3DeployRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:akhileshmvn/MechTechAccelerators:ref:refs/heads/main"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "s3_deploy" {
  name        = "GitHubActionsS3DeployPolicy"
  description = "Allows minimal S3 operations for site deploy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "ListBucket"
        Effect = "Allow"
        Action = ["s3:ListBucket"]
        Resource = ["arn:aws:s3:::mechtechaccelerators.com"]
      },
      {
        Sid = "ObjectOps"
        Effect = "Allow"
        Action = ["s3:GetObject","s3:PutObject","s3:DeleteObject"]
        Resource = ["arn:aws:s3:::mechtechaccelerators.com/*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.github_actions_deploy.name
  policy_arn = aws_iam_policy.s3_deploy.arn
}

output "role_arn" {
  value = aws_iam_role.github_actions_deploy.arn
}
