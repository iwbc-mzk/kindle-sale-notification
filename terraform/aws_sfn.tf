resource "aws_sfn_state_machine" "ksn_state_machine" {
  name     = "ksn_state_machine"
  role_arn = aws_iam_role.ksn_state_machine.arn

  definition = <<EOF
    {
        "Comment": "state machine of kindle sale notification",
        "StartAt": "fetch items",
        "States": {
            "fetch items": {
                "Type": "Task",
                "Resource": "${aws_lambda_function.fetch_items.arn}",
                "Retry": [
                    {
                        "ErrorEquals": [
                            "Lambda.ServiceException",
                            "Lambda.AWSLambdaException",
                            "Lambda.SdkClientException",
                            "Lambda.TooManyRequestsException"
                        ],
                        "IntervalSeconds": 2,
                        "MaxAttempts": 6,
                        "BackoffRate": 2
                    }
                ],
                "Next": "GetQueueAttributes"
            },
            "GetQueueAttributes": {
                "Type": "Task",
                "Parameters": {
                    "QueueUrl": "${aws_sqs_queue.ksn_queue.url}",
                    "AttributeNames": [
                        "ApproximateNumberOfMessages",
                        "ApproximateNumberOfMessagesNotVisible"
                    ]
                },
                "Resource": "arn:aws:states:::aws-sdk:sqs:getQueueAttributes",
                "Next": "Choice"
            },
            "Choice": {
                "Type": "Choice",
                "Choices": [
                    {
                        "Not": {
                            "Variable": "$.Attributes.ApproximateNumberOfMessages",
                            "StringEquals": "0"
                        },
                        "Next": "price check"
                    },
                    {
                        "And": [
                            {
                                "Variable": "$.Attributes.ApproximateNumberOfMessages",
                                "StringEquals": "0"
                            },
                            {
                                "Not": {
                                    "Variable": "$.Attributes.ApproximateNumberOfMessagesNotVisible",
                                    "StringEquals": "0"
                                }
                            }
                        ],
                        "Next": "Wait"
                    }
                ],
                "Default": "publish sns message"
            },
            "price check": {
                "Type": "Task",
                "Resource": "${aws_lambda_function.price_checker.arn}",
                "Retry": [
                    {
                        "ErrorEquals": [
                            "Lambda.ServiceException",
                            "Lambda.AWSLambdaException",
                            "Lambda.SdkClientException",
                            "Lambda.TooManyRequestsException"
                        ],
                        "IntervalSeconds": 2,
                        "MaxAttempts": 6,
                        "BackoffRate": 2
                    }
                ],
                "Next": "Wait"
            },
            "Wait": {
                "Type": "Wait",
                "Seconds": 5,
                "Next": "GetQueueAttributes"
            },
            "publish sns message": {
                "Type": "Task",
                "Resource": "${aws_lambda_function.publish_sns_message.arn}",
                "Retry": [
                    {
                        "ErrorEquals": [
                            "Lambda.ServiceException",
                            "Lambda.AWSLambdaException",
                            "Lambda.SdkClientException",
                            "Lambda.TooManyRequestsException"
                        ],
                        "IntervalSeconds": 2,
                        "MaxAttempts": 6,
                        "BackoffRate": 2
                    }
                ],
                "End": true
            }
        }
    }
  EOF
}
