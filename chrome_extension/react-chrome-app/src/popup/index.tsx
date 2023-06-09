import React from 'react';
import ReactDOM from 'react-dom';
import Popup from './popup';

import { sendMessageToActiveTab } from '../utils';
import { BaseMessage } from '../types';
import { MESSAGE_TYPES } from '../const';
import NotKindlePage from './not_kindle';

const message: BaseMessage = {
    type: MESSAGE_TYPES.KindlePageMessage,
};

const callback = (response: boolean) => {
    const isKindlePage = response ?? false;

    const root = document.getElementById('root');
    ReactDOM.render(
        <React.StrictMode>
            {isKindlePage ? <Popup /> : <NotKindlePage />}
        </React.StrictMode>,
        root
    );
};

sendMessageToActiveTab(message)
    .then(callback)
    .catch((err) => {
        console.log(err);
        callback(false);
    });
