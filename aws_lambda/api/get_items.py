import os
import json
from decimal import Decimal

import boto3


def decimal_default_proc(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError


def lambda_handler(event, context):
    print(event)

    path_params = event.get("pathParameters")
    id = path_params.get("id") if path_params else ""

    try:
        dynamodb = boto3.resource("dynamodb")
        dynamodb_table = dynamodb.Table(os.environ["table_name"])

        if id:
            items = [dynamodb_table.get_item(Key={"id": id})["Item"]]
        else:
            items = dynamodb_table.scan()["Items"]
        print(f"scan items: {items}")
    except Exception as e:
        print(e)
        return {
            "isBase64Encoded": False,
            "statusCode": 500,
            "body": json.dumps({"ok": False, "message": "Failed to fetch items."}),
        }

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "body": json.dumps(
            {
                "ok": True,
                "message": "Successfully fetch items.",
                "body": {"items": json.dumps(items, default=decimal_default_proc)},
            }
        ),
    }
