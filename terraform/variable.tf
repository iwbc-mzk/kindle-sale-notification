variable "aws_account_id" {
  type     = string
  nullable = false
}

variable "aws_region" {
  type     = string
  nullable = false
  default  = "ap-northeast-1"
}
