import Button from "@mui/material/Button/Button";

import { MessageType, ProductInfoResponse, ProductInfo } from "./types";
import { MESSAGE_TYPES } from "./const";


const getProductTitle = () => {
    const titleElement = document.getElementById("productTitle");
    const title = titleElement ? titleElement.textContent ? titleElement.textContent : "" : "";

    return title.trim();
}

const getProductPrice = () => {
    const yen = "￥";
    const xpath = "/html/body/div[2]/div[2]/div[3]/div[1]/div[10]/div[4]/div[2]/div[2]/ul/li[1]/span/span[1]/span/a/span[2]/span[1]";

    const xPathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const priceElement = xPathResult.snapshotItem(0);
    const price_txt = priceElement?.firstChild?.nodeValue;
    const price: number = price_txt ? Number(price_txt.replace(yen, "")) : 0;

    return price;
}

const getProductPoint = () => {
    const pt = "pt";
    const xpath = "/html/body/div[2]/div[2]/div[3]/div[1]/div[10]/div[4]/div[2]/div[2]/ul/li[1]/span/span[1]/span/a/span[2]/span[2]";
    
    const xPathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const pointElement = xPathResult.snapshotItem(0);
    const raw_txt = pointElement?.firstChild?.nodeValue || "";

    const re = new RegExp(`[0-9]${pt}`);
    const point_txt_match = raw_txt.match(re);
    const point_txt = point_txt_match ? point_txt_match[0].replace(pt, "") : "0";
    const point: number = Number(point_txt);

    return point;
}

const getUrl = () => {
    const { protocol, hostname, search } = window.location;

    const searchParams = new URLSearchParams(search);
    const id = searchParams.get("pd_rd_i");

    return `${protocol}//${hostname}/dp/${id}`;
}

const getId = () => {
    const { search } = window.location;

    const searchParams = new URLSearchParams(search);
    return searchParams.get("pd_rd_i") || "";
}

const messageFromPopup = (msg: MessageType, sender: chrome.runtime.MessageSender, sendResponse: (response: ProductInfoResponse) => void) => {
    if (msg.type !== MESSAGE_TYPES.ProductInfoMessage) {
        return;
    }

    console.log("message resieved.", msg)

    const id = getId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getUrl();
    
    const productInfo: ProductInfo = {
        id,
        title,
        price,
        point,
        url
    }

    const response: ProductInfoResponse = { productInfo }
    console.log("response: ", response)

    sendResponse(response)
}

chrome.runtime.onMessage.addListener(messageFromPopup);

function App() {
    console.log(process.env)
    return (
        <div>
            <Button
                variant="outlined"
            >
                Sale Notification
            </Button>
        </div>
    );
}

export default App;
