import re
from urllib import robotparser, parse

from bs4 import BeautifulSoup
import requests

class AmazonScraper:
    def __init__(self) -> None:
        self._base_url = "https://www.amazon.co.jp"
        self._user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/31.0.1650.18 Mobile/11B554a Safari/8536.25"
        ]
        self._headers = {
            "User-Agent": self._user_agents[0],
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
        max_retry = len(self._user_agents)
        for i, user_agent in enumerate(self._user_agents, 1):
            if not self._robots.can_fetch(user_agent, url):
                raise ConnectionRefusedError(f"This url is not allowed to requests. [{url}]")
            
            headers = {
                **self._headers,
                "User-Agent": user_agent
            }
            res = requests.get(url, headers)
            if res.ok:
                print(f"successed to requet: user_agent={user_agent} url={url}")
                self._soup = BeautifulSoup(res.content, "html.parser")
                break
            else:
                print(f"failed to requet: user_agent={user_agent} url={url}")
                if i < max_retry:
                    continue
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
