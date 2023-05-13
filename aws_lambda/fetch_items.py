import json
import os
from decimal import Decimal

import boto3


def decimal_default_proc(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError


def lambda_handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    dynamodb_table = dynamodb.Table(os.environ["table_name"])
    items = dynamodb_table.scan()["Items"]

    sqs = boto3.resource("sqs")
    queue = sqs.Queue(os.environ["queue_url"])

    step = 10
    for n in range(0, len(items), step):
        entries = []
        for item in items[n : n + step]:
            entry = {
                "Id": item["id"],
                "MessageBody": json.dumps(item, default=decimal_default_proc),
            }
            entries.append(entry)
        queue.send_messages(Entries=entries)

    return {"statusCode": 200, "body": json.dumps(items, default=decimal_default_proc)}
