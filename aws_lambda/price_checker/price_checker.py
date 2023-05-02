import json
import os
from datetime import datetime
from urllib.request import HTTPError

from amazon import AmazonScraper
import boto3


def lambda_handler(event, context):
    response = {**event}

    queue_url = os.environ["queue_url"]

    sqs = boto3.resource("sqs")
    queue = sqs.Queue(queue_url)

    messages = queue.receive_messages(MaxNumberOfMessages=1)
    if not messages:
        print("No messages.")
        return

    message = messages[0]
    item = json.loads(message.body)
    id = item.get("id")
    if not id:
        print("No item id.")
        return response

    sc = AmazonScraper()
    url = sc.get_url(id)
    values = {**item}
    for _ in range(2):
        try:
            sc.fetch(url)
            values["title"] = sc.get_title()
            values["price"] = sc.get_price()
            values["point"] = sc.get_point()
            values["url"] = url
        except Exception as e:
            print(e)
            continue
        else:
            break

    need_update = False
    updated_item = item.copy()
    for key, val in values.items():
        if item.get(key) != val:
            updated_item[key] = val
            need_update = True

    # 前回より100円以上安くなった場合
    is_discounted = (item.get("price") - item.get("point")) - \
        (updated_item.get("price") - updated_item.get("point")) >= 100
    updated_item["discounted"] = "Y" if is_discounted else "N"
    need_update |= is_discounted | is_discounted is not item.get("discounted")

    updated_item["updated_at"] = int(datetime.now().timestamp())

    try:
        if need_update:
            dynamodb = boto3.resource("dynamodb")
            dynamodb_table = dynamodb.Table(os.environ["table_name"])
            dynamodb_table.put_item(Item=updated_item)
            print(f"update item: {updated_item}")
    except Exception as e:
        print(e)
        raise e
    else:
        queue.delete_messages(Entries=[
            {
                "Id": message.message_id,
                "ReceiptHandle": message.receipt_handle
            }
        ])

    response["ApproximateNumberOfMessages"] -= 1
    return response
