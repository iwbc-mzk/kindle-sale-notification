import re
from urllib import robotparser, parse

from bs4 import BeautifulSoup
import requests

class AmazonScraper:
    def __init__(self) -> None:
        self._base_url = "https://www.amazon.co.jp"
        self._user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
        self._headers = {
            "User-Agent": self._user_agent,
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8"
        }
        self._prepare_robots()

        self._swatch_selector = "#tmmSwatches > ul > li.swatchElement"

    def _prepare_robots(self):
        self._robots = robotparser.RobotFileParser()
        robots_url = parse.urljoin(self._base_url, "robots.txt")
        self._robots.set_url(robots_url)
        self._robots.read()

    def fetch_html(self, item_id: str) -> None:
        url = self.get_url(item_id)
        if not self._robots.can_fetch(self._user_agent, url):
            raise ConnectionRefusedError(f"This url is not allowed to requests. [{url}]")
        
        res = requests.get(url, headers=self._headers)
        if res.ok:
            self._soup = BeautifulSoup(res.content, "html.parser")
        else:
            res.raise_for_status()

    def get_price(self) -> int:
        swatch_elements = self._soup.select(self._swatch_selector)
        for ele in swatch_elements[0].find_all("span"):
            text = ele.text
            yen_unit = "￥"

            if yen_unit in text:
                re_yen = f"{yen_unit}[0-9,]*"
                price = int(re.search(re_yen, text)[0].replace(yen_unit, "").replace(",", ""))
        
        return price

    def get_point(self) -> int:
        swatch_elements = self._soup.select(self._swatch_selector)
        for ele in swatch_elements[0].find_all("span"):
            text = ele.text
            pt_unit = "pt"

            if pt_unit in text:
                re_pt = f"[0-9,]*{pt_unit}"
                pt = int(re.search(re_pt, text)[0].replace(pt_unit, "").replace(",", ""))
        
        return pt

    def get_title(self) -> str:
        title_element = self._soup.find(id="productTitle")
        return title_element.text if title_element else ""
    
    def get_url(self, item_id: str) -> str:
        return parse.urljoin(self._base_url, f"dp/{item_id}")
