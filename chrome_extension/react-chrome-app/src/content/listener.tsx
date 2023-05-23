import {
    ProductInfoMessage,
    ProductInfoResponse,
    RegisterMessage,
    ProductInfo,
    RegisterResponse,
    UnregisterMessage,
    UnregisterResponse,
    BaseMessage,
} from '../types';
import { MESSAGE_TYPES } from '../const';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    register,
    unregister,
    isKindlePage,
} from './urils';

export const listener = (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => {
    console.log('message resieved.', msg);
    if (msg?.type === MESSAGE_TYPES.ProductInfoMessage) {
        return productInfoListener(msg, sender, sendResponse);
    }
    if (msg?.type === MESSAGE_TYPES.RegisterMessage) {
        return registerListener(msg, sender, sendResponse);
    }
    if (msg?.type === MESSAGE_TYPES.UnregisterMessage) {
        return unregisterListener(msg, sender, sendResponse);
    }
    if (msg?.type === MESSAGE_TYPES.KindlePageMessage) {
        return kindlePageListener(msg, sender, sendResponse);
    }
};

export const productInfoListener = (
    msg: ProductInfoMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProductInfoResponse) => void
) => {
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

    sendResponse(response);
};

export const registerListener = (
    msg: RegisterMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (Response: RegisterResponse) => void
) => {
    const { productInfo } = msg;
    register(productInfo).then((res) => {
        sendResponse(res as RegisterResponse);
    });

    // 非同期通信を行う場合はtrueを返し、メッセージ送信元に非同期通信することを知らせる必要がある。
    // https://developer.chrome.com/docs/extensions/mv3/messaging/#:~:text=In%20the%20above%20example%2C%20sendResponse()%20was%20called%20synchronously.%20If%20you%20want%20to%20asynchronously%20use%20sendResponse()%2C%20add%20return%20true%3B%20to%20the%20onMessage%20event%20handler.
    return true;
};

export const unregisterListener = (
    msg: UnregisterMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (Response: UnregisterResponse) => void
) => {
    const { id } = msg;
    unregister(id).then((res) => {
        sendResponse(res as UnregisterResponse);
    });

    // 非同期通信を行う場合はtrueを返し、メッセージ送信元に非同期通信することを知らせる必要がある。
    // https://developer.chrome.com/docs/extensions/mv3/messaging/#:~:text=In%20the%20above%20example%2C%20sendResponse()%20was%20called%20synchronously.%20If%20you%20want%20to%20asynchronously%20use%20sendResponse()%2C%20add%20return%20true%3B%20to%20the%20onMessage%20event%20handler.
    return true;
};

export const kindlePageListener = (
    msg: BaseMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (Response: boolean) => void
) => {
    const IsKindlePage = isKindlePage();
    sendResponse(IsKindlePage);
};

export default listener;
