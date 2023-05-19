import re
from urllib import robotparser, parse

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException


class AmazonScraper:
    def __init__(self, wb: WebDriver) -> None:
        self._base_url = "https://www.amazon.co.jp"
        self._user_agent = "*"

        self._webdriver = wb

        self._prepare_robots()

    def _prepare_robots(self) -> None:
        self._robots = robotparser.RobotFileParser()
        robots_url = parse.urljoin(self._base_url, "robots.txt")
        self._robots.set_url(robots_url)
        self._robots.read()

    def fetch(self, url: str) -> None:
        if not self._robots.can_fetch(self._user_agent, url):
            raise ConnectionRefusedError(
                f"This url is not allowed to requests. [{url}]"
            )

        self._webdriver.get(url)
        return

    def _get_price_point_element(self):
        swatch_selector = "#tmmSwatches > ul > li.swatchElement.selected"
        kindle_swatch_element = self._webdriver.find_elements(
            by=By.CSS_SELECTOR, value=swatch_selector
        )[0]
        price_element, point_element, *_ = kindle_swatch_element.find_elements(
            by=By.CLASS_NAME, value="a-color-price"
        )

        return price_element, point_element

    def get_price(self) -> int:
        try:
            price_element, _ = self._get_price_point_element()
        except NoSuchElementException as e:
            print(e)
            return -1

        text = price_element.text

        yen_unit = "￥"
        re_yen = f"{yen_unit}[0-9,]*"
        price = int(re.search(re_yen, text)[0].replace(yen_unit, "").replace(",", ""))

        return price if price else -1

    def get_point(self) -> int:
        try:
            _, point_element = self._get_price_point_element()
        except NoSuchElementException as e:
            print(e)
            return -1

        text = point_element.text

        pt_unit = "pt"
        re_pt = f"[0-9,]*{pt_unit}"
        pt = int(re.search(re_pt, text)[0].replace(pt_unit, "").replace(",", ""))

        return pt if pt else -1

    def get_title(self) -> str:
        title_selector = "#productTitle"

        try:
            title_element = self._webdriver.find_element(
                by=By.CSS_SELECTOR, value=title_selector
            )
        except NoSuchElementException as e:
            print(e)
            return ""

        title = title_element.text

        return title if title else ""

    def get_url(self, item_id: str) -> str:
        return parse.urljoin(self._base_url, f"dp/{item_id}")
