#!/bin/bash
# deploy-aws.sh — builds the Docker image, pushes to ECR, and creates/updates
# the App Runner service.
#
# Prerequisites:
#   - AWS CLI installed & configured (aws configure)
#   - Docker Desktop running
#   - An AWS RDS SQL Server instance (or SQL Server Express on RDS Free Tier)
#
# Usage:
#   chmod +x deploy-aws.sh
#   ./deploy-aws.sh

set -e

# ── Config ────────────────────────────────────────────────────────────────
APP_NAME="prosight"
AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$APP_NAME"
IMAGE_TAG="latest"

echo "==> Account : $ACCOUNT_ID"
echo "==> Region  : $AWS_REGION"
echo "==> ECR repo: $ECR_REPO"

# ── Create ECR repository (safe to run repeatedly) ────────────────────────
aws ecr describe-repositories --repository-names "$APP_NAME" --region "$AWS_REGION" \
  > /dev/null 2>&1 || \
  aws ecr create-repository --repository-name "$APP_NAME" --region "$AWS_REGION"

# ── Authenticate Docker to ECR ────────────────────────────────────────────
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# ── Build & push image ────────────────────────────────────────────────────
echo "==> Building Docker image..."
docker build -t "$APP_NAME:$IMAGE_TAG" .

docker tag "$APP_NAME:$IMAGE_TAG" "$ECR_REPO:$IMAGE_TAG"

echo "==> Pushing to ECR..."
docker push "$ECR_REPO:$IMAGE_TAG"

# ── Create or update App Runner service ──────────────────────────────────
SERVICE_EXISTS=$(aws apprunner list-services --region "$AWS_REGION" \
  --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" \
  --output text)

if [ -z "$SERVICE_EXISTS" ]; then
  echo "==> Creating App Runner service..."

  # NOTE: Set these environment variables to your actual values before running.
  # You can also set them in the App Runner console after creation.
  cat <<INFO

  ----------------------------------------------------------------
  IMPORTANT — set these as App Runner environment variables:
    ConnectionStrings__DefaultConnection  = Server=<RDS_HOST>,1433;Database=ProSightDb;User Id=<USER>;Password=<PASS>;TrustServerCertificate=True;
    Jwt__Secret                           = <strong-random-string-min-32-chars>
    Jwt__Issuer                           = ProSightAPI
    Jwt__Audience                         = ProSightClient
  ----------------------------------------------------------------

INFO

  aws apprunner create-service \
    --region "$AWS_REGION" \
    --service-name "$APP_NAME" \
    --source-configuration "{
      \"ImageRepository\": {
        \"ImageIdentifier\": \"$ECR_REPO:$IMAGE_TAG\",
        \"ImageConfiguration\": {\"Port\": \"8080\"},
        \"ImageRepositoryType\": \"ECR\"
      },
      \"AutoDeploymentsEnabled\": true
    }" \
    --instance-configuration "{
      \"Cpu\": \"1 vCPU\",
      \"Memory\": \"2 GB\"
    }" \
    --query "Service.ServiceUrl" \
    --output text

  echo "==> Service created. Add the environment variables above in the AWS console:"
  echo "    https://console.aws.amazon.com/apprunner/home?region=$AWS_REGION"
else
  echo "==> Updating existing App Runner service (ECR auto-deploy will pick up new image)..."
  aws apprunner start-deployment \
    --region "$AWS_REGION" \
    --service-arn "$SERVICE_EXISTS"
  echo "==> Deployment triggered for $SERVICE_EXISTS"
fi

echo ""
echo "Done! Your app will be live at the App Runner URL in ~2 minutes."
