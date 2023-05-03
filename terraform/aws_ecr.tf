# ---------------------------------------------------------
# ECR
#----------------------------------------------------------
resource "aws_ecr_repository" "price_checker" {
  name                 = "price_checker"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

# ---------------------------------------------------------
# ECR Life Cycle Policy
#----------------------------------------------------------
resource "aws_ecr_lifecycle_policy" "price_checker_lifecycle_policy" {
  repository = aws_ecr_repository.price_checker.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "delete all but the latest image",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 1
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
  EOF
}

# ---------------------------------------------------------
# external
#----------------------------------------------------------
data "external" "build_push_price_check" {
  program     = ["python3", "${path.module}/../aws_lambda/price_checker/buildpush.py"]
  working_dir = "${path.module}/../aws_lambda"
  query = {
    AWS_REGION     = "ap-northeast-1"
    AWS_ACCOUNT_ID = var.aws_account_id
    REPO_URL       = aws_ecr_repository.price_checker.repository_url
    CONTAINER_NAME = "price_checker"
  }
}
