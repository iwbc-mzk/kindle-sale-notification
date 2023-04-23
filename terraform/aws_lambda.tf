data "archive_file" "lambda_function_fetch_items" {
  type             = "zip"
  source_file      = "${path.module}/../aws_lambda/fetch_items.py"
  output_path      = "${path.module}/../aws_lambda/lambda_function_fetch_items.zip"
  output_file_mode = "0666"
}

resource "aws_lambda_function" "fetch_items" {
  filename      = data.archive_file.lambda_function_fetch_items.output_path
  function_name = "ksn_fetch_items"
  role          = aws_iam_role.ksn_fetch_items.arn

  source_code_hash = data.archive_file.lambda_function_fetch_items.output_base64sha256
  runtime          = "python3.10"
  handler          = "fetch_items.lambda_handler"

  environment {
    variables = {
      queue_url : aws_sqs_queue.ksn_queue.url
    }
  }
}
