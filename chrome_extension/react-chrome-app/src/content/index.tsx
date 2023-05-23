import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './content';
import { isKindlePage } from './urils';
import { MESSAGE_TYPES } from '../const';

const rootElement = document.createElement('div');
rootElement.id = 'register-button';

const ele = document.getElementById('wishlistButtonStack');
ele?.appendChild(rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.ChangeIconStateMessage,
    state: isKindlePage(),
});
