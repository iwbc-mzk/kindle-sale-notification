import Button from "@mui/material/Button/Button";

import { MessageType, ProductInfoResponse, ProductInfo } from "./types";
import { MESSAGE_TYPES } from "./const";


const messageFromPopup = (msg: MessageType, sender: chrome.runtime.MessageSender, sendResponse: (response: ProductInfoResponse) => void) => {
    if (msg.type !== MESSAGE_TYPES.ProductInfoMessage) {
        return;
    }

    console.log("message resieved.", msg)
    const titleElement = document.getElementById("productTitle");
    const title = titleElement ? titleElement.textContent ? titleElement.textContent : "" : "";

    const productInfo: ProductInfo = {
        id: "",
        title,
        price: 0,
        point: 0,
        url: ""
    }

    const response: ProductInfoResponse = {productInfo}
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
