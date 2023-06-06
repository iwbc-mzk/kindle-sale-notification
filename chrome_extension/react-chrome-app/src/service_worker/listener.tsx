import { BaseMessage, ChangeIconStateMessage, ProductInfo } from '../types';
import { MESSAGE_TYPES } from '../const';
import { setIconDisabled, setIconEnabled } from './utils';
import { getItems } from '../api';

export const listener = (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => {
    console.log('message resieved.', msg);
    if (msg?.type === MESSAGE_TYPES.ChangeIconStateMessage) {
        return changeIconStateListener(msg, sender, sendResponse);
    }
    if (msg?.type === MESSAGE_TYPES.FetchItems) {
        return fetchItems(msg, sender, sendResponse);
    }
};

const changeIconStateListener = (
    msg: ChangeIconStateMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: null) => void
) => {
    const { type, state } = msg;
    if (type !== MESSAGE_TYPES.ChangeIconStateMessage) {
        return;
    }

    if (state) {
        setIconEnabled();
    } else {
        setIconDisabled();
    }

    sendResponse();
};

const fetchItems = (
    msg: BaseMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProductInfo[]) => void
) => {
    getItems()
        .then((res) => res.json())
        .then((resJson) => sendResponse(resJson));

    return true;
};
