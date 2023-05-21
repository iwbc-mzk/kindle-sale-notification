# -----------------------------------------------------------------
# SNS Topic
# -----------------------------------------------------------------
resource "aws_sns_topic" "kindle_sale_notification" {
  name = "kindle_sale_notification"
}

resource "aws_sns_topic" "kindle_sale_notification_error" {
  name = "kindle_sale_notification_error"
}

# -----------------------------------------------------------------
# SNS Topic Subscription
# -----------------------------------------------------------------
resource "aws_sns_topic_subscription" "email" {
  for_each = toset(var.email)

  topic_arn = aws_sns_topic.kindle_sale_notification.arn
  protocol  = "email"
  endpoint  = each.key
}

resource "aws_sns_topic_subscription" "email" {
  for_each = toset(var.email)

  topic_arn = aws_sns_topic.kindle_sale_notification_error.arn
  protocol  = "email"
  endpoint  = each.key
}
