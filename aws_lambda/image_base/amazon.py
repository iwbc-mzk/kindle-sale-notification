import re
from urllib import robotparser, parse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.remote.webelement import WebElement

class AmazonScraper:
    def __init__(self) -> None:
        self._base_url = "https://www.amazon.co.jp"
        self._user_agent = "*"

        self._prepare_webdriver()
        self._prepare_robots()

    def _prepare_robots(self) -> None:
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

        self._webdriver.execute_script('const newProto = navigator.__proto__;delete newProto.webdriver;navigator.__proto__ = newProto;')
        assert self._webdriver.execute_script('return navigator.webdriver') is None

    def fetch(self, url: str) -> None:
        if not self._robots.can_fetch(self._user_agent, url):
            raise ConnectionRefusedError(f"This url is not allowed to requests. [{url}]")

        self._webdriver.get(url)
        return
    
    def _get_price_point_element(self):
        swatch_selector = "#tmmSwatches > ul > li.swatchElement.selected"
        kindle_swatch_element = self._webdriver.find_elements(by=By.CSS_SELECTOR, value=swatch_selector)[0]

        price_element, point_element, *_ = kindle_swatch_element.find_elements(by=By.CLASS_NAME, value="a-color-price")

        return price_element, point_element

    def get_price(self) -> int:
        price_element, _ = self._get_price_point_element()
        text = price_element.text

        yen_unit = "￥"
        re_yen = f"{yen_unit}[0-9,]*"
        price = int(re.search(re_yen, text)[0].replace(yen_unit, "").replace(",", ""))

        return price if price else -1

    def get_point(self) -> int:
        _, point_element = self._get_price_point_element()
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
