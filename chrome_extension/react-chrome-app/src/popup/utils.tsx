export const sendMessageToActiveTab = (
    message: any,
    callback: (response: any) => void
): void => {
    chrome.tabs &&
        chrome.tabs.query(
            {
                active: true,
                currentWindow: true,
            },
            (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id || 0, message, callback);
            }
        );
};
