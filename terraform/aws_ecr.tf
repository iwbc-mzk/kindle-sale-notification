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
# external
#----------------------------------------------------------
data "external" "build_push_price_check" {
  program = ["sh", "../aws_lambda/price_checker/buildpush.sh"]
  query = {
    AWS_REGION     = "ap-northeast-1"
    AWS_ACCOUNT_ID = var.aws_account_id
    REPO_URL       = aws_ecr_repository.price_checker.repository_url
    CONTAINER_NAME = "price_checker"
  }
}