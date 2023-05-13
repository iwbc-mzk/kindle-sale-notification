import os

import boto3
from boto3.dynamodb.conditions import Key

NO_DATA = "-"
SUBJECT = "Kindle Sale Notification"


def lambda_handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    dynamodb_table = dynamodb.Table(os.environ["table_name"])
    res = dynamodb_table.query(
        IndexName="discounted", KeyConditionExpression=Key("discounted").eq("Y")
    )
    items = res.get("Items", [])
    if not items:
        print("No discounted item.")
        return

    message = ""
    for i, item in enumerate(items, 1):
        title = item.get("title", NO_DATA)
        price = item.get("price", NO_DATA)
        point = item.get("point", NO_DATA)
        url = item.get("url", NO_DATA)
        sale_price = price - point if price != NO_DATA and point != NO_DATA else NO_DATA

        message += f"{i}. \n"
        message += f"タイトル: {title}\n"
        message += f"実質価格: {sale_price}円 ({price}円 {point}pt)\n"
        message += f"URL: {url}\n\n"

    sns = boto3.resource("sns")
    topic = sns.Topic(os.environ["topic_arn"])
    topic.publish(Subject=SUBJECT, Message=message)
