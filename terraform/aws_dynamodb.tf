resource "aws_dynamodb_table" "ksn" {
  name         = "ksn_table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
  attribute {
    name = "discounted"
    type = "S"
  }

  global_secondary_index {
    name            = "discounted"
    hash_key        = "discounted"
    range_key       = "id"
    projection_type = "ALL"
  }
}
