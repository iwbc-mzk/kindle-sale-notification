import { MESSAGE_TYPES } from '../const';
import { ChangeIconStateMessage } from '../types';

chrome.runtime.onInstalled.addListener(() => {
    setInitAccessLevel();

    chrome.runtime.onMessage.addListener(changeIconStateListener);
});

const setInitAccessLevel = () => {
    chrome.storage.session.setAccessLevel({
        accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
    });
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
        chrome.action.setIcon({ path: chrome.runtime.getURL('icon128.png') });
    } else {
        chrome.action.setIcon({
            path: chrome.runtime.getURL('icon128_not_active.png'),
        });
    }

    sendResponse();
};

export {};
