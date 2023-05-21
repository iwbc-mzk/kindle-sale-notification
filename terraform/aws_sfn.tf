locals {
  interval_sec                  = 5
  wait_all_process_finished_sec = aws_sqs_queue.ksn_queue.visibility_timeout_seconds
}

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
                "Next": "Wait Queue"
            },
            "Wait Queue": {
                "Type": "Wait",
                "Seconds": 3,
                "Next": "Get Number Of Messages"
            },
            "Get Number Of Messages": {
                "Type": "Task",
                "Parameters": {
                    "QueueUrl": "${aws_sqs_queue.ksn_queue.url}",
                    "AttributeNames": [
                        "ApproximateNumberOfMessages",
                        "ApproximateNumberOfMessagesNotVisible"
                    ]
                },
                "Resource": "arn:aws:states:::aws-sdk:sqs:getQueueAttributes",
                "Next": "Check Number Of Messages",
                "ResultSelector": {
                    "ApproximateNumberOfMessages.$": "States.StringToJson($.Attributes.ApproximateNumberOfMessages)",
                    "ApproximateNumberOfMessagesNotVisible.$": "States.StringToJson($.Attributes.ApproximateNumberOfMessagesNotVisible)"
                }
            },
            "Check Number Of Messages": {
               "Type": "Choice",
                "Choices": [
                    {
                    "Variable": "$.ApproximateNumberOfMessages",
                    "NumericGreaterThan": 0,
                    "Next": "price check"
                    }
                ],
                "Default": "Wait All Queue Process Finish"
            },
            "Wait All Queue Process Finish": {
                "Type": "Wait",
                "Seconds": ${local.wait_all_process_finished_sec},
                "Next": "Get Number Of Messages Not Visible"
            },
            "Get Number Of Messages Not Visible": {
                "Type": "Task",
                "Parameters": {
                    "QueueUrl": "${aws_sqs_queue.ksn_queue.url}",
                    "AttributeNames": [
                        "ApproximateNumberOfMessages",
                        "ApproximateNumberOfMessagesNotVisible"
                    ]
                },
                "Resource": "arn:aws:states:::aws-sdk:sqs:getQueueAttributes",
                "Next": "Check Number Of Messages Not Visible",
                "ResultSelector": {
                    "ApproximateNumberOfMessages.$": "States.StringToJson($.Attributes.ApproximateNumberOfMessages)",
                    "ApproximateNumberOfMessagesNotVisible.$": "States.StringToJson($.Attributes.ApproximateNumberOfMessagesNotVisible)"
                }
            },
            "Check Number Of Messages Not Visible": {
                "Type": "Choice",
                "Choices": [
                    {
                        "Variable": "$.ApproximateNumberOfMessages",
                        "NumericGreaterThan": 0,
                        "Next": "Check Number Of Messages"
                    },
                    {
                        "Variable": "$.ApproximateNumberOfMessagesNotVisible",
                        "NumericGreaterThan": 0,
                        "Next": "Wait All Queue Process Finish"
                    }
                ],
                "Default": "publish sns message"
            },
            "price check": {
                "Type": "Task",
                "Resource": "${aws_lambda_function.price_checker.arn}",
                "Next": "Wait Interval",
                "Catch": [
                    {
                        "ErrorEquals": [
                            "Lambda.Unknown",
                            "WebDriverException"
                        ],
                        "Next": "Wait Interval",
                        "ResultPath": null
                    }
                ]
            },
            "Wait Interval": {
                "Type": "Wait",
                "Seconds": ${local.interval_sec},
                "Next": "Check Number Of Messages"
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
