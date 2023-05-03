from datetime import datetime
import os

import boto3

ATTRIBUTES = [
    "id",
    "title",
    "price",
    "point",
    "url"
]


def lambda_handler(event, context):
    qs = event["rawQueryString"]
    params = {s.split("=")[0]: s.split("=")[1] for s in [eq for eq in qs.split(",")]}
    print(params)

    item = {
        "discounted": "N",
        "updated_at": int(datetime.now().timestamp())
    }
    for attr in ATTRIBUTES:
        item[attr] = params.get(attr)

    try:
        dynamodb = boto3.resource("dynamodb")
        dynamodb_table = dynamodb.Table(os.environ["table_name"])
        dynamodb_table.put_item(Item=item)
        print(f"registered item: {item}")
    except Exception as e:
        print(e)
        return {"ok": False}

    return {
        "ok": True,
        "item": item
    }
