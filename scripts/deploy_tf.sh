#!/usr/bin/env bash
set -euo pipefail

cd infra/terraform
terraform init
terraform apply -auto-approve

echo "Terraform apply finished. The role ARN is printed in the outputs above (role_arn)."
