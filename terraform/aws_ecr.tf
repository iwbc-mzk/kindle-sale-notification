# ---------------------------------------------------------
# ECR
#----------------------------------------------------------
resource "aws_ecr_repository" "price_checker" {
  name                 = "price_checker"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

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
# Authorization Token
#----------------------------------------------------------
data "aws_ecr_authorization_token" "token" {}

# ---------------------------------------------------------
# Null Resource
#----------------------------------------------------------
resource "null_resource" "build_push" {
  triggers = {
    price_check_hash = sha1(join("", [for f in fileset(".", "${local.lambda_dir}/price_checker/*") : filesha1(f)]))
    image_base_hash  = sha1(join("", [for f in fileset(".", "${local.lambda_dir}/image_base/*") : filesha1(f)]))
  }
  provisioner "local-exec" {
    working_dir = local.lambda_dir
    command     = "python3 ${local.lambda_dir}/price_checker/buildpush.py ${aws_ecr_repository.price_checker.repository_url} ${data.aws_ecr_authorization_token.token.password} ${data.aws_ecr_authorization_token.token.proxy_endpoint}"
  }
}
