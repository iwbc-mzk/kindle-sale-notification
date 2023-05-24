/* eslint-disable @typescript-eslint/no-explicit-any */
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type SendMessageToActiveTab = {
    (message: any, callback: (response: any) => void): Promise<any>;
    (message: any): Promise<any>;
};

export const sendMessageToActiveTab: SendMessageToActiveTab = async (
    message: any,
    callback?: (response: any) => void
): Promise<any> => {
    const tab = await getActiveTab();
    if (callback) {
        return chrome.tabs
            .sendMessage(tab.id ?? 0, message)
            .then((response: any) => callback(response));
    } else {
        return chrome.tabs.sendMessage(tab.id ?? 0, message);
    }
};

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
    return await chrome.tabs
        .query({
            active: true,
            currentWindow: true,
        })
        .then(([tab]) => {
            return tab;
        });
};
