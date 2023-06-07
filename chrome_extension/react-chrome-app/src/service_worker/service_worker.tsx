import { MESSAGE_TYPES } from '../const';
import { setInitAccessLevel, setIconDisabled, setIconEnabled } from './utils';
import { listener } from './listener';

chrome.runtime.onInstalled.addListener(() => {
    setInitAccessLevel();
    setIconDisabled();
});

// タブ切り替え時
chrome.tabs.onActivated.addListener((activeInfo) => {
    changeIconStatus(activeInfo.tabId ?? 0).catch((err) => {
        console.log(err);
        setIconDisabled();
    });
});

// ページ更新時
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        changeIconStatus(tab.id ?? 0).catch((err) => {
            console.log(err);
            setIconDisabled();
        });
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const changeIconStatus = async (tabId: number): Promise<any> => {
    const message = { type: MESSAGE_TYPES.KindlePageMessage };
    return chrome.tabs
        .sendMessage(tabId ?? 0, message)
        .then((iconState: boolean) => {
            if (iconState ?? false) {
                setIconEnabled();
            } else {
                setIconDisabled();
            }
        });
};

chrome.runtime.onMessage.addListener(listener);

export {};
