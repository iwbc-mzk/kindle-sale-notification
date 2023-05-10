import Button from "@mui/material/Button/Button";

import { MessageType, ProductInfoResponse, ProductInfo } from "./types";
import { MESSAGE_TYPES } from "./const";


const isKindleUnlimited = () => {
    const xpath = "/html/body/div[2]/div[2]/div[3]/div[1]/div[10]/div[4]/div[2]/div[2]/ul/li[1]/span/span[1]/span/a/span[2]/i";

    const xpathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const unlimitedElement = xpathResult.snapshotItem(0);
    return unlimitedElement !== null
}


const getProductTitle = () => {
    const titleElement = document.getElementById("productTitle");
    const title = titleElement ? titleElement.textContent ? titleElement.textContent : "" : "";

    return title.trim();
}

const getProductPrice = () => {
    const yen = "￥";

    var xpath: string;
    if (isKindleUnlimited()) {
        xpath = "//*[@id=\"tmmSwatches\"]/ul/li[1]/span[1]/span[4]/span[1]/a";
    } else {
        xpath = "//*[@id=\"tmmSwatches\"]/ul/li[1]/span/span[1]/span/a/span[2]/span[1]";
    }

    const xPathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const priceElement = xPathResult.snapshotItem(0);
    const text = priceElement?.firstChild?.nodeValue || "";

    const re = new RegExp(`^${yen}([0-9]+,{0,1})+`);
    const priceMatch = text.trim().match(re);
    const priceText = priceMatch ? priceMatch[0].replace(yen, "").replaceAll(",", "") : "0";
    const price: number = Number(priceText);

    return price;
}

const getProductPoint = () => {
    const pt = "pt";

    var xpath: string;
    if (isKindleUnlimited()) {
        xpath = "//*[@id=\"tmmSwatches\"]/ul/li[1]/span[1]/span[4]/span[2]";
    } else {
        xpath = "//*[@id=\"tmmSwatches\"]/ul/li[1]/span/span[1]/span/a/span[2]/span[2]";
    }
    
    const xPathResult = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const pointElement = xPathResult.snapshotItem(0);
    const rawText = pointElement?.firstChild?.nodeValue || "";

    const re = new RegExp(`[0-9]*${pt}`);
    const pointMatch = rawText.match(re) || "";
    const pointText = pointMatch ? pointMatch[0].replace(pt, "") : "0";
    const point: number = Number(pointText);

    return point;
}

const getUrl = () => {
    const { protocol, hostname } = window.location;
    const id = getId();

    return `${protocol}//${hostname}/dp/${id}`;
}

const getId = () => {
    const { pathname } = window.location;

    const dpReg = new RegExp("/dp/[A-Z0-9]*/");
    const dpMatch = pathname.match(dpReg);
    if (dpMatch) {
        return dpMatch[0]?.replace("/dp/", "").replace("/", "");
    } else {
        const gp_re = new RegExp("/gp/product/[A-Z0-9]*$");
        const gp_match = pathname.match(gp_re);

        return gp_match ? gp_match[0].replace("/gp/product/", "").replace("/", "") : "";
    }
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
