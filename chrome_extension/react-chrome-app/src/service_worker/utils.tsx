export const setIconDisabled = () => {
    chrome.action.setIcon({
        path: chrome.runtime.getURL('images/icon128_not_active.png'),
    });
};

export const setIconEnabled = () => {
    chrome.action.setIcon({
        path: chrome.runtime.getURL('images/icon128.png'),
    });
};

export const setInitAccessLevel = () => {
    chrome.storage.session.setAccessLevel({
        accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
    });
};
