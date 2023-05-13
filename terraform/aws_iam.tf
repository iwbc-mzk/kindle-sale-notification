# ------------------------------------------------------------------------
# IAM Policy Document
# ------------------------------------------------------------------------
data "aws_iam_policy_document" "lambda_assume_policy_document" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "states_assume_policy_document" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "scheduler_assume_policy_document" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "sqs_access_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:DeleteMessage",
      "sqs:ReceiveMessage",
      "sqs:SendMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [
      aws_sqs_queue.ksn_queue.arn,
      aws_sqs_queue.ksn_deadletter_queue.arn
    ]
  }
}

data "aws_iam_policy_document" "dynamodb_access_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      # 読み込み
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      # 書き込み
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:UpdateItem"
    ]
    resources = [
      aws_dynamodb_table.ksn.arn,
      "${aws_dynamodb_table.ksn.arn}/index/*"
    ]
  }
}

data "aws_iam_policy_document" "sns_publish_policy_document" {
  statement {
    effect    = "Allow"
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.kindle_sale_notification.arn]
  }
}

data "aws_iam_policy_document" "x_ray_access_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets"
    ]
    resources = ["*"]
  }
}

data "aws_iam_policy_document" "lambda_invoke_scope_access_policy_document" {
  statement {
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      aws_lambda_function.fetch_items.arn,
      aws_lambda_function.price_checker.arn,
      aws_lambda_function.publish_sns_message.arn
    ]
  }
}

data "aws_iam_policy_document" "invoke_step_functions_policy_document" {
  statement {
    effect    = "Allow"
    actions   = ["states:StartExecution"]
    resources = [aws_sfn_state_machine.ksn_state_machine.arn]
  }
}

# ------------------------------------------------------------------------
# IAM Policy
# ------------------------------------------------------------------------
resource "aws_iam_policy" "sqs_access_policy" {
  name   = "sqs_access_policy"
  policy = data.aws_iam_policy_document.sqs_access_policy_document.json
}

resource "aws_iam_policy" "dynamodb_access_policy" {
  name   = "dynamodb_access_policy"
  policy = data.aws_iam_policy_document.dynamodb_access_policy_document.json
}

resource "aws_iam_policy" "sns_publish_policy" {
  name   = "sns_publish_policy"
  policy = data.aws_iam_policy_document.sns_publish_policy_document.json
}

resource "aws_iam_policy" "x_ray_access_policy" {
  name   = "x_ray_access_policy"
  policy = data.aws_iam_policy_document.x_ray_access_policy_document.json
}

resource "aws_iam_policy" "lambda_invoke_scope_access_policy" {
  name   = "lambda_invoke_scope_access_policy"
  policy = data.aws_iam_policy_document.lambda_invoke_scope_access_policy_document.json
}

resource "aws_iam_policy" "invoke_step_functions_policy" {
  name   = "invoke_step_functions_policy_document"
  policy = data.aws_iam_policy_document.invoke_step_functions_policy_document.json
}

# ------------------------------------------------------------------------
# Attach Policy
# ------------------------------------------------------------------------
# Fetch Items
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_fetch_items" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_sqs_access_policy_fetch_items" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = aws_iam_policy.sqs_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_fetch_items" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

# Price Checker
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_price_checker" {
  role       = aws_iam_role.ksn_price_checker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_sqs_access_policy_price_checker" {
  role       = aws_iam_role.ksn_price_checker.name
  policy_arn = aws_iam_policy.sqs_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_price_checker" {
  role       = aws_iam_role.ksn_price_checker.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

# Publish SNS Message
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_publish_sns_message" {
  role       = aws_iam_role.ksn_publish_sns_message.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_publish_sns_message" {
  role       = aws_iam_role.ksn_publish_sns_message.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_sns_publish_policy_publish_sns_message" {
  role       = aws_iam_role.ksn_publish_sns_message.name
  policy_arn = aws_iam_policy.sns_publish_policy.arn
}

# Rregister Item
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_register_item" {
  role       = aws_iam_role.ksn_register_item.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_register_item" {
  role       = aws_iam_role.ksn_register_item.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

# Get Items
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_get_items" {
  role       = aws_iam_role.ksn_get_items.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_get_items" {
  role       = aws_iam_role.ksn_get_items.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

# Delete Item
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole_delete_item" {
  role       = aws_iam_role.ksn_delete_item.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy_delete_item" {
  role       = aws_iam_role.ksn_delete_item.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

# Step Functions
resource "aws_iam_role_policy_attachment" "attach_xray_access_policy_to_ksn_state_machine" {
  role       = aws_iam_role.ksn_state_machine.name
  policy_arn = aws_iam_policy.x_ray_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_sqs_access_policy_to_ksn_state_machine" {
  role       = aws_iam_role.ksn_state_machine.name
  policy_arn = aws_iam_policy.sqs_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_sns_publish_policy_to_ksn_state_machine" {
  role       = aws_iam_role.ksn_state_machine.name
  policy_arn = aws_iam_policy.sns_publish_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_lambda_invoke_scope_access_policy_to_ksn_state_machine" {
  role       = aws_iam_role.ksn_state_machine.name
  policy_arn = aws_iam_policy.lambda_invoke_scope_access_policy.arn
}

# Event Bridge
resource "aws_iam_role_policy_attachment" "attach_invoke_step_functions_policy_to_ksn_scheduler" {
  role       = aws_iam_role.ksn_scheduler.name
  policy_arn = aws_iam_policy.invoke_step_functions_policy.arn
}

# ------------------------------------------------------------------------
# IAM Role
# ------------------------------------------------------------------------
resource "aws_iam_role" "ksn_fetch_items" {
  name               = "ksn_fetch_items"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}

resource "aws_iam_role" "ksn_price_checker" {
  name               = "ksn_price_checker"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}

resource "aws_iam_role" "ksn_publish_sns_message" {
  name               = "ksn_publish_sns_message"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}

resource "aws_iam_role" "ksn_state_machine" {
  name               = "ksn_state_machine"
  assume_role_policy = data.aws_iam_policy_document.states_assume_policy_document.json
}

resource "aws_iam_role" "ksn_scheduler" {
  name               = "ksn_scheduler"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_policy_document.json
}

resource "aws_iam_role" "ksn_register_item" {
  name               = "ksn_register_item"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}

resource "aws_iam_role" "ksn_get_items" {
  name               = "ksn_get_items"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}

resource "aws_iam_role" "ksn_delete_item" {
  name               = "ksn_delete_item"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_policy_document.json
}
