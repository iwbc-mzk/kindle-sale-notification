import os
import boto3


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
            "ok": False,
            "message": "Failed to fetch items."
        }

    return {
        "ok": True,
        "message": "Successfully fetch items.",
        "items": items
    }
