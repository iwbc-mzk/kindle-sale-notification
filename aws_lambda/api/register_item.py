from datetime import datetime
import os
import base64
import urllib
import json

import boto3

ATTRIBUTES = ["id", "title", "price", "point", "url"]


def lambda_handler(event, context):
    print(event)

    is_base64_encoded = event.get("isBase64Encoded", False)
    if is_base64_encoded:
        body_str = base64.b64decode(event.get("body", "")).decode("utf-8")
        parse_qs = urllib.parse.parse_qs(body_str)
        body = {key: val[0] for key, val in parse_qs.items()}
    else:
        body = json.loads(event.get("body", ""))

    print(body)

    item = {"discounted": "N", "updated_at": int(datetime.now().timestamp())}
    for attr in ATTRIBUTES:
        item[attr] = body.get(attr)

    if not item.get("id"):
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "body": json.dumps({"ok": False, "message": "Id is required."}),
        }

    try:
        dynamodb = boto3.resource("dynamodb")
        dynamodb_table = dynamodb.Table(os.environ["table_name"])
        dynamodb_table.put_item(Item=item)
        print(f"registered item: {item}")
    except Exception as e:
        print(e)
        return {
            "isBase64Encoded": False,
            "statusCode": 500,
            "body": json.dumps({"ok": False, "message": "Failed to register item."}),
        }

    return {
        "isBase64Encoded": False,
        "statusCode": 201,
        "body": json.dumps({"ok": True, "message": "Successfully registered!"}),
    }
