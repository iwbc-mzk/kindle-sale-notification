import { MESSAGE_TYPES } from '../const';
import { ChangeIconStateMessage } from '../types';
import { sendMessageToActiveTab } from '../utils';
import { setInitAccessLevel, setIconDisabled, setIconEnabled } from './utils';

chrome.runtime.onInstalled.addListener(() => {
    setInitAccessLevel();
    setIconDisabled();

    const callback = (response: boolean) => {
        if (response ?? false) {
            setIconEnabled();
        } else {
            setIconDisabled();
        }
    };

    const changeIconStatus = async () => {
        const message = { type: MESSAGE_TYPES.KindlePageMessage };
        sendMessageToActiveTab(message)
            .then(callback)
            .catch(() => {
                setIconDisabled();
            });
    };

    // タブ切り替え時
    chrome.tabs.onActivated.addListener(() => {
        changeIconStatus();
    });

    // ページ更新時
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (tab.status === 'complete') {
            changeIconStatus();
        }
    });
});

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

chrome.runtime.onMessage.addListener(changeIconStateListener);

export {};
