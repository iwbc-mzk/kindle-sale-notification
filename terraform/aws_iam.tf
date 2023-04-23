# AWS Lambda
## policy document
data "aws_iam_policy_document" "assume_policy_document" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "sqs_access_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "sqs:DeleteMessage",
      "sqs:PurgeQueue",
      "sqs:ReceiveMessage",
      "sqs:DeleteQueue",
      "sqs:SendMessage",
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
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem"
    ]
    resources = [aws_dynamodb_table.ksn_db.arn]
  }
}

## policy
resource "aws_iam_policy" "sqs_access_policy" {
  name   = "sqs_access_policy"
  policy = data.aws_iam_policy_document.sqs_access_policy_document.json
}

resource "aws_iam_policy" "dynamodb_access_policy" {
  name = "dynamodb_access_policy"
  policy = data.aws_iam_policy_document.dynamodb_access_policy_document.json
}

## attach policy
resource "aws_iam_role_policy_attachment" "attach_AWSLambdaBasicExecutionRole" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "attach_sqs_access_policy" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = aws_iam_policy.sqs_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_dynamodb_access_policy" {
  role       = aws_iam_role.ksn_fetch_items.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
}

## role
resource "aws_iam_role" "ksn_fetch_items" {
  name               = "ksn_fetch_items"
  assume_role_policy = data.aws_iam_policy_document.assume_policy_document.json
}
