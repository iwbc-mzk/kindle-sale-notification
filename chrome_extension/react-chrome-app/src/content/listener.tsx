import { MessageType, ProductInfoResponse, ProductInfo } from '../types';
import { MESSAGE_TYPES } from '../const';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
} from './urils';

export const messageFromPopup = (
    msg: MessageType,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProductInfoResponse) => void
) => {
    if (msg.type !== MESSAGE_TYPES.ProductInfoMessage) {
        return;
    }

    console.log('message resieved.', msg);

    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

    const productInfo: ProductInfo = {
        id,
        title,
        price,
        point,
        url,
    };

    const response: ProductInfoResponse = { productInfo };
    console.log('response: ', response);

    sendResponse(response);
};
