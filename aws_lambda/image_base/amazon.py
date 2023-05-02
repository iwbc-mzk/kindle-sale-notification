import re
from urllib import robotparser, parse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

class AmazonScraper:
    def __init__(self) -> None:
        self._base_url = "https://www.amazon.co.jp"
        self._user_agent = "*"

        self._prepare_webdriver()
        self._prepare_robots()

    def _prepare_robots(self):
        self._robots = robotparser.RobotFileParser()
        robots_url = parse.urljoin(self._base_url, "robots.txt")
        self._robots.set_url(robots_url)
        self._robots.read()

    def _prepare_webdriver(self) -> None:
        options = Options()
        options.binary_location = "/opt/chrome-linux/chrome"
        options.add_argument("--headless")
        options.add_argument('--no-sandbox')
        options.add_argument("--single-process")
        options.add_argument("--disable-dev-shm-usage")

        service = Service(executable_path="/opt/chromedriver")

        self._webdriver = webdriver.Chrome(service=service, options=options)

        # クッキー保存用
        self._webdriver.get("https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=GQ6B6RH72AX8D2TD&ref_=hp_ss_qs_v3_rt_prices")

    def fetch(self, url: str) -> None:
        if not self._robots.can_fetch(self._user_agent, url):
            raise ConnectionRefusedError(f"This url is not allowed to requests. [{url}]")

        self._webdriver.get(url)
        return

    def get_price(self) -> int:
        price_selector = "#a-autoid-1-announce > span.a-color-base > span.a-size-base.a-color-price.a-color-price"
        price_element = self._webdriver.find_element(by=By.CSS_SELECTOR, value=price_selector)
        text = price_element.text

        yen_unit = "￥"
        re_yen = f"{yen_unit}[0-9,]*"
        price = int(re.search(re_yen, text)[0].replace(yen_unit, "").replace(",", ""))

        return price if price else -1

    def get_point(self) -> int:
        point_selector = "#a-autoid-1-announce > span.a-color-base > span.a-color-price.a-text-normal"
        point_element = self._webdriver.find_element(by=By.CSS_SELECTOR, value=point_selector)
        text = point_element.text

        pt_unit = "pt"
        re_pt = f"[0-9,]*{pt_unit}"
        pt = int(re.search(re_pt, text)[0].replace(pt_unit, "").replace(",", ""))
        
        return pt if pt else -1

    def get_title(self) -> str:
        title_selector = "#productTitle"
        title_element = self._webdriver.find_element(by=By.CSS_SELECTOR, value=title_selector)
        title = title_element.text
        
        return title if title else ""
    
    def get_url(self, item_id: str) -> str:
        return parse.urljoin(self._base_url, f"dp/{item_id}")
