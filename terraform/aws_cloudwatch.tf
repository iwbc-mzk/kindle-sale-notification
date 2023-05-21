# ----------------------------------------------------------------------------------
# CloudWatch Metric Alarm
# ----------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "kindel_sale_notification_error" {
  alarm_name          = "ksn-dlq-recieved-message"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfMessagesSent"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  treat_missing_data  = "missing"
  alarm_actions       = [aws_sns_topic.kindle_sale_notification_error.arn]
  dimensions = {
    QueueName = aws_sqs_queue.ksn_deadletter_queue.name
  }
}
