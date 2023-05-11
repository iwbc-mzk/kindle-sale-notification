import {
    ProductInfoMessage,
    ProductInfoResponse,
    RegisterMessage,
    ProductInfo,
    RegisterResponse,
} from '../types';
import { MESSAGE_TYPES } from '../const';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    register,
} from './urils';

export const productInfoListener = (
    msg: ProductInfoMessage,
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

export const registerListener = async (
    msg: RegisterMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (Response: RegisterResponse) => void
) => {
    if (msg.type !== MESSAGE_TYPES.RegisterMessage) {
        return;
    }

    console.log('message resieved.', msg);

    const { productInfo } = msg;
    const resJson = await register(productInfo);

    sendResponse(resJson);
};
