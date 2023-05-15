import os
import json

import boto3


def lambda_handler(event, context):
    print(event)

    path_params = event.get("pathParameters")
    id = path_params.get("id") if path_params else ""
    if not id:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "body": json.dumps({"ok": False, "message": "Id is required."}),
        }

    try:
        dynamodb = boto3.resource("dynamodb")
        dynamodb_table = dynamodb.Table(os.environ["table_name"])
        dynamodb_table.delete_item(Key={"id": id})
        print(f"delete item: {id}")
    except Exception as e:
        print(e)
        return {
            "isBase64Encoded": False,
            "statusCode": 500,
            "body": json.dumps({"ok": False, "message": "Failed to delete item."}),
        }

    return {
        "isBase64Encoded": False,
        "statusCode": 204,
        "body": json.dumps({"ok": True, "message": "Successfully deleted."}),
    }
