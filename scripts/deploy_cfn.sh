#!/usr/bin/env bash
set -euo pipefail

TEMPLATE=infra/cloudformation/create-oidc-role.yml
STACK_NAME=github-oidc-deploy

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <GitHubRepo> <BucketName> [--region REGION]"
  echo "Example: $0 akhileshmvn/MechTechAccelerators mechtechaccelerators.com --region us-east-1"
  exit 2
fi

GITHUB_REPO=$1
BUCKET_NAME=$2
REGION="us-east-1"

if [ "${3-}" = "--region" ] && [ -n "${4-}" ]; then
  REGION=$4
fi

aws cloudformation deploy \
  --template-file "$TEMPLATE" \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region "$REGION" \
  --parameter-overrides GitHubRepo="$GITHUB_REPO" BucketName="$BUCKET_NAME"

echo "CloudFormation deploy finished. To get the role ARN run:" \
  "aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs' --output table"
