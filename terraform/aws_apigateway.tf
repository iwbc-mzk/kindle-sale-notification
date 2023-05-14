# ------------------------------------------------------------------------
# API Gateway v2
# ------------------------------------------------------------------------
resource "aws_apigatewayv2_api" "api" {
  name          = "kindle-sale-notification-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_credentials = false
    allow_origins     = ["https://www.amazon.co.jp"]
    allow_methods     = ["POST", "GET", "DELETE"]
    allow_headers     = ["*"]
  }
}

# ------------------------------------------------------------------------
# API Gateway v2 Stage
# ------------------------------------------------------------------------
resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# ------------------------------------------------------------------------
# API Gateway v2 Integration
# ------------------------------------------------------------------------
resource "aws_apigatewayv2_integration" "get_items" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.get_items.invoke_arn
}

resource "aws_apigatewayv2_integration" "register_item" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.register_item.invoke_arn
}

resource "aws_apigatewayv2_integration" "delete_item" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"

  connection_type    = "INTERNET"
  integration_method = "POST"
  integration_uri    = aws_lambda_function.delete_item.invoke_arn
}

# ------------------------------------------------------------------------
# API Gateway v2 Route
# ------------------------------------------------------------------------
resource "aws_apigatewayv2_route" "get_items" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "GET /items"
  authorization_type = "AWS_IAM"

  target = "integrations/${aws_apigatewayv2_integration.get_items.id}"
}

resource "aws_apigatewayv2_route" "register_item" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "POST /items"
  authorization_type = "AWS_IAM"

  target = "integrations/${aws_apigatewayv2_integration.register_item.id}"
}

resource "aws_apigatewayv2_route" "delete_item" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "DELETE /items/{id}"
  authorization_type = "AWS_IAM"

  target = "integrations/${aws_apigatewayv2_integration.delete_item.id}"
}

resource "aws_apigatewayv2_route" "get_ites" {
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = "GET /items/{id}"
  authorization_type = "AWS_IAM"

  target = "integrations/${aws_apigatewayv2_integration.get_items.id}"
}
