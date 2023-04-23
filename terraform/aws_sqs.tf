resource "aws_sqs_queue" "ksn_queue" {
  name                       = "ksn_queue"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 60 * 60 * 3
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.ksn_deadletter_queue.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "ksn_deadletter_queue" {
  name                       = "ksn_deadletter_queue"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 60 * 60 * 24 * 5
}
