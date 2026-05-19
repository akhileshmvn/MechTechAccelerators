# Deploy IAM Role for GitHub Actions (OIDC)

This folder contains templates and helper scripts to create an IAM role that GitHub Actions can assume via OIDC and a minimal S3 policy for site deploys.

Files:
- `cloudformation/create-oidc-role.yml` - CloudFormation template to create the OIDC provider + role (outputs role ARN).
- `terraform/main.tf` - Terraform configuration to create the OIDC provider + role and attach an S3 deploy policy.
- `../scripts/deploy_cfn.sh` - Simple wrapper to deploy the CloudFormation template.
- `../scripts/deploy_tf.sh` - Simple wrapper to deploy the Terraform configuration.

Before you run:
- Replace `mechtechaccelerators.com` and repository name values where noted.
- Ensure you have permission to create IAM resources.

CloudFormation quick deploy
```bash
aws cloudformation deploy \
  --template-file infra/cloudformation/create-oidc-role.yml \
  --stack-name github-oidc-deploy \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubRepo=akhileshmvn/MechTechAccelerators BucketName=mechtechaccelerators.com
```

Terraform quick deploy
```bash
cd infra/terraform
terraform init
terraform apply -auto-approve
```

After creating the role, copy the role ARN and add it to the repository secret `AWS_ROLE_TO_ASSUME`.

If you want, I can commit changes to adapt the templates to different repo names or branch patterns.
