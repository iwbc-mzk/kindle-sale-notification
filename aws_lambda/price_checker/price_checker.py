import json
import os
from datetime import datetime
from contextlib import contextmanager
from typing import Union

import boto3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

try:
    from amazon import AmazonScraper
except ImportError:
    from aws_lambda.image_base.amazon import AmazonScraper


CHROMIUM_PATH = "/opt/chrome-linux/chrome"
CHROME_DRIVER_PATH = "/opt/chromedriver"


@contextmanager
def init_chrome_webdriver() -> webdriver.Chrome:
    options = Options()
    options.binary_location = CHROMIUM_PATH
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--single-process")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--user-data-dir=/tmp/user_data")
    # AWS Lambdaがインスタンスを再利用する関係上、下記オプションがないとゾンビプロセスが発生する
    options.add_argument("--no-zygote")

    service = Service(executable_path=CHROME_DRIVER_PATH)

    try:
        wd = webdriver.Chrome(service=service, options=options)
        wd.implicitly_wait(2)
        wd.set_page_load_timeout(10)
        wd.set_script_timeout(5)

        # 初期プロファイルの作成
        if not os.path.exists("/tmp/user_data/Default/Session Storage"):
            wd.get("https://google.co.jp")

        assert os.path.exists("/tmp/user_data/Default/") is True

        wd.execute_script(
            "const newProto = navigator.__proto__;delete newProto.webdriver;navigator.__proto__ = newProto;"
        )
        assert wd.execute_script("return navigator.webdriver") is None

        yield wd
    except Exception as e:
        print(e)
        print("Failed process.")
        raise e
    finally:
        wd.close()


def is_discounted(
    item: dict, updated_item: dict, discoute_rate: Union[int, float]
) -> bool:
    """
    discouinte_rate: 0以上1未満の時に値引き率、1以上の時は値引き額を指定する
    """
    item_actual_price = item["price"] - item["point"]
    updated_item_actual_price = updated_item["price"] - updated_item["point"]
    if 0 <= discoute_rate < 1:
        return (
            item_actual_price - updated_item_actual_price
        ) / item_actual_price >= discoute_rate
    else:
        return item_actual_price - updated_item_actual_price >= discoute_rate


def lambda_handler(event, context):
    response = {**event}

    queue_url = os.environ["queue_url"]
    discount_rate = float(os.environ["discount_rate"])

    sqs = boto3.resource("sqs")
    queue = sqs.Queue(queue_url)

    messages = queue.receive_messages(MaxNumberOfMessages=1)
    if not messages:
        print("No messages.")
        response["ApproximateNumberOfMessages"] = 0
        return response

    message = messages[0]
    item: dict = json.loads(message.body)
    id = item.get("id")
    if not id:
        print("No item id.")
        response["ApproximateNumberOfMessages"] -= 1
        return response

    print("id:", id)

    with init_chrome_webdriver() as wd:
        sc = AmazonScraper(wd)

        values = {**item}
        url = sc.get_url(id)
        if url:
            values["url"] = url

        sc.fetch(url)

        params = [
            ("title", sc.get_title),
            ("price", sc.get_price),
            ("point", sc.get_point),
        ]

        try:
            for key, f in params:
                v = f()
                if type(v) == str and v:
                    values[key] = v
                elif type(v) == int and v >= 0:
                    values[key] = v
        except Exception as e:
            return response

    need_update = False
    updated_item = item.copy()
    for key, val in values.items():
        if item.get(key) != val:
            updated_item[key] = val
            need_update = True

    discounted = is_discounted(item, updated_item, discount_rate)
    updated_item["discounted"] = "Y" if discounted else "N"
    need_update |= discounted | discounted is not item.get("discounted")

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
        queue.delete_messages(
            Entries=[
                {"Id": message.message_id, "ReceiptHandle": message.receipt_handle}
            ]
        )

    response["ApproximateNumberOfMessages"] -= 1
    return response
