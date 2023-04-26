locals {
  runtime    = "python3.10"
  lambda_dir = "${path.module}/../aws_lambda"
}

# layer用事前準備
data "external" "prepare_layer_archive" {
  program = ["python3", "${local.lambda_dir}/price_checker/prepare_archive.py"]
  query = {
    layer_dir         = "${local.lambda_dir}/price_checker/layer",
    requirements_path = "${local.lambda_dir}/price_checker/requirements.txt",
  }
}

# template file
data "template_file" "price_checker_template" {
  template = file("${local.lambda_dir}/price_checker/price_checker.py")
}

data "template_file" "amazon_template" {
  template = file("${local.lambda_dir}/price_checker/amazon.py")
}

# archive file
data "archive_file" "lambda_function_fetch_items" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/fetch_items.py"
  output_path      = "${local.lambda_dir}/lambda_function_fetch_items.zip"
  output_file_mode = "0666"
}

data "archive_file" "lambda_function_price_checker" {
  type             = "zip"
  output_path      = "${local.lambda_dir}/lambda_function_price_checker.zip"
  output_file_mode = "0666"

  source {
    content  = data.template_file.price_checker_template.rendered
    filename = "price_checker.py"
  }
  source {
    content  = data.template_file.amazon_template.rendered
    filename = "amazon.py"
  }
}

data "archive_file" "lambda_function_publish_sns_message" {
  type             = "zip"
  source_file      = "${local.lambda_dir}/publish_sns_message.py"
  output_path      = "${local.lambda_dir}/publish_sns_message.zip"
  output_file_mode = "0666"
}

data "archive_file" "lambda_layer_scraping" {
  type             = "zip"
  source_dir       = data.external.prepare_layer_archive.result.path
  output_path      = "${local.lambda_dir}/layer_scraping.zip"
  output_file_mode = "0666"
}

# layer
resource "aws_lambda_layer_version" "scraping_layer" {
  filename   = data.archive_file.lambda_layer_scraping.output_path
  layer_name = "scraping_layer"

  source_code_hash    = data.archive_file.lambda_layer_scraping.output_base64sha256
  compatible_runtimes = [local.runtime]
}

# lambda functions
resource "aws_lambda_function" "fetch_items" {
  filename      = data.archive_file.lambda_function_fetch_items.output_path
  function_name = "ksn_fetch_items"
  role          = aws_iam_role.ksn_fetch_items.arn

  source_code_hash = data.archive_file.lambda_function_fetch_items.output_base64sha256
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
  filename      = data.archive_file.lambda_function_price_checker.output_path
  function_name = "ksn_price_checker"
  role          = aws_iam_role.ksn_price_checker.arn

  source_code_hash = data.archive_file.lambda_function_price_checker.output_base64sha256
  runtime          = local.runtime
  handler          = "price_checker.lambda_handler"
  timeout          = 10

  layers = [aws_lambda_layer_version.scraping_layer.arn]

  environment {
    variables = {
      queue_url : aws_sqs_queue.ksn_queue.url,
      table_name : aws_dynamodb_table.ksn.name
    }
  }
}
