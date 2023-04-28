resource "aws_scheduler_schedule" "ksn_scheduler" {
  name       = "ksn_scheduler"
  group_name = "default"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression_timezone = "Asia/Tokyo"
  schedule_expression          = "cron(0 19 * * ? *)" # 日本時間で設定

  target {
    arn      = aws_sfn_state_machine.ksn_state_machine.arn
    role_arn = aws_iam_role.ksn_scheduler.arn
  }
}
