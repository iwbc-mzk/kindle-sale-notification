# topic
resource "aws_sns_topic" "kindle_sale_notification" {
  name = "kindle_sale_notification"
}

# subscription
# システム構成時にサブスクリプションも設定したい場合は、endpointに送信先メールアドレスを設定しコメントアウトを解除する。
# resource "aws_sns_topic_subscription" "email" {
#   topic_arn = aws_sns_topic.kindle_sale_notification.arn
#   protocol  = "email"
#   endpoint  = ""
# }
