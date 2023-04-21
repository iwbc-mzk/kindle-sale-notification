provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_dynamodb_table" "kindle_sale_notificator" {
  name = "kindle_sale_notificator"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "price"
    type = "N"
  }
  attribute {
    name = "point"
    type = "N"
  }
  attribute {
    name = "last_update_date"
    type = "S"
  }
  attribute {
    name = "last_update_time"
    type = "S"
  }
}
