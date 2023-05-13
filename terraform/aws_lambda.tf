# ------------------------------------------------------------------------------------------------------
# Local Variables
# ------------------------------------------------------------------------------------------------------
locals {
  runtime    = "python3.10"
  lambda_dir = "${path.module}/../aws_lambda"
}

# ------------------------------------------------------------------------------------------------------
# Archive Files
# ------------------------------------------------------------------------------------------------------
data "archive_file" "archive_fetch_items" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/fetch_items.py"
  output_path      = "${local.lambda_dir}/fetch_items.zip"
  output_file_mode = "0666"
}

data "archive_file" "archive_publish_sns_message" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/publish_sns_message.py"
  output_path      = "${local.lambda_dir}/publish_sns_message.zip"
  output_file_mode = "0666"
}

data "archive_file" "archive_register_item" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/api/register_item.py"
  output_path      = "${local.lambda_dir}/api/register_item.zip"
  output_file_mode = "0666"
}

data "archive_file" "archive_get_items" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/api/get_items.py"
  output_path      = "${local.lambda_dir}/api/get_items.zip"
  output_file_mode = "0666"
}

data "archive_file" "archive_delete_item" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/api/delete_item.py"
  output_path      = "${local.lambda_dir}/api/delete_item.zip"
  output_file_mode = "0666"
}

# ------------------------------------------------------------------------------------------------------
# Lambda Functions
# ------------------------------------------------------------------------------------------------------
resource "aws_lambda_function" "fetch_items" {
  filename      = data.archive_file.archive_fetch_items.output_path
  function_name = "ksn_fetch_items"
  role          = aws_iam_role.ksn_fetch_items.arn

  source_code_hash = data.archive_file.archive_fetch_items.output_base64sha256
  runtime          = local.runtime
  handler          = "fetch_items.lambda_handler"
  timeout          = 10

  environment {
    variables = {
      queue_url : aws_sqs_queue.ksn_queue.url,
      table_name : aws_dynamodb_table.ksn.name
    }
  }
}

resource "aws_lambda_function" "price_checker" {
  function_name = "ksn_price_checker"
  role          = aws_iam_role.ksn_price_checker.arn
  image_uri     = "${aws_ecr_repository.price_checker.repository_url}:latest"
  package_type  = "Image"

  source_code_hash = base64sha256("${join("", [for f in fileset(".", "${local.lambda_dir}/price_checker/*") : filesha1(f)])}${join("", [for f in fileset(".", "${local.lambda_dir}/image_base/*") : filesha1(f)])}")
  memory_size      = 1024
  timeout          = 60

  environment {
    variables = {
      queue_url : aws_sqs_queue.ksn_queue.url,
      table_name : aws_dynamodb_table.ksn.name,
    }
  }

  depends_on = [
    aws_ecr_repository.price_checker,
    null_resource.build_push,
  ]
}

resource "aws_lambda_function" "publish_sns_message" {
  filename      = data.archive_file.archive_publish_sns_message.output_path
  function_name = "ksn_publish_sns_message"
  role          = aws_iam_role.ksn_publish_sns_message.arn

  source_code_hash = data.archive_file.archive_publish_sns_message.output_base64sha256
  runtime          = local.runtime
  handler          = "publish_sns_message.lambda_handler"
  timeout          = 10

  environment {
    variables = {
      table_name = aws_dynamodb_table.ksn.name,
      topic_arn  = aws_sns_topic.kindle_sale_notification.arn
    }
  }
}

resource "aws_lambda_function" "register_item" {
  filename      = data.archive_file.archive_register_item.output_path
  function_name = "ksn_register_item"
  role          = aws_iam_role.ksn_register_item.arn

  source_code_hash = data.archive_file.archive_register_item.output_base64sha256
  runtime          = local.runtime
  handler          = "register_item.lambda_handler"
  timeout          = 10

  environment {
    variables = {
      table_name = aws_dynamodb_table.ksn.name
    }
  }
}

resource "aws_lambda_function" "get_items" {
  filename      = data.archive_file.archive_get_items.output_path
  function_name = "ksn_get_items"
  role          = aws_iam_role.ksn_get_items.arn

  source_code_hash = data.archive_file.archive_get_items.output_base64sha256
  runtime          = local.runtime
  handler          = "get_items.lambda_handler"
  timeout          = 10

  environment {
    variables = {
      table_name = aws_dynamodb_table.ksn.name
    }
  }
}

resource "aws_lambda_function" "delete_item" {
  filename      = data.archive_file.archive_delete_item.output_path
  function_name = "ksn_delete_item"
  role          = aws_iam_role.ksn_delete_item.arn

  source_code_hash = data.archive_file.archive_delete_item.output_base64sha256
  runtime          = local.runtime
  handler          = "delete_item.lambda_handler"
  timeout          = 10

  environment {
    variables = {
      table_name = aws_dynamodb_table.ksn.name
    }
  }
}

# ------------------------------------------------------------------------------------------------------
# Lambda Function URL
# ------------------------------------------------------------------------------------------------------
resource "aws_lambda_function_url" "register_item" {
  function_name      = aws_lambda_function.register_item.function_name
  authorization_type = "AWS_IAM"

  cors {
    allow_credentials = false
    allow_origins     = ["https://www.amazon.co.jp"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
  }
}
