variable "aws_region" {
  type     = string
  nullable = false
  default  = "ap-northeast-1"
}

variable "email" {
  type     = list(string)
  nullable = false
  default  = []
}

variable "schedule_expression_timezone" {
  type     = string
  nullable = false
  default  = "Asia/Tokyo"
}

variable "schedule_expression" {
  type     = string
  nullable = false
  default  = "cron(0 19 * * ? *)"
}
