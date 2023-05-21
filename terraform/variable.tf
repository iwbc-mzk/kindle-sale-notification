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
