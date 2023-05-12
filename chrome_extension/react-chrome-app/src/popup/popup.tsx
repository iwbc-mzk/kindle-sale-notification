/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
    ProductInfoMessage,
    ProductInfoResponse,
    RegisterMessage,
    RegisterResponse,
} from '../types';
import { MESSAGE_TYPES } from '../const';

const RegisterButton = styled(Button)({
    boxShadow: 'none',
    margin: '10px 0px',
});

const sendMessageToActiveTab = (
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

const Popup = () => {
    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [point, setPoint] = useState(0);
    const [url, setUrl] = useState('');

    useEffect(() => {
        setProductInfo();
    }, []);

    const setProductInfo = () => {
        const message: ProductInfoMessage = {
            type: MESSAGE_TYPES.ProductInfoMessage,
        };
        const callback = (response: ProductInfoResponse) => {
            const { id, title, price, point, url } = response.productInfo;
            setId(id);
            setTitle(title);
            setPrice(price);
            setPoint(point);
            setUrl(url);
        };

        sendMessageToActiveTab(message, callback);
    };

    const sendRegisterMessage = () => {
        const message: RegisterMessage = {
            type: MESSAGE_TYPES.RegisterMessage,
            productInfo: { id, title, price, point, url },
        };
        const callback = (response: RegisterResponse) => {
            const { ok, message } = response;
        };

        sendMessageToActiveTab(message, callback);
    };

    const isIdEntered = () => {
        return id != null && id !== '';
    };

    return (
        <div style={{ width: '300px' }}>
            <header>
                <h5>Kindle Sale Notification</h5>
            </header>
            <div>
                <TextField
                    label="Id"
                    id="product_id"
                    value={id}
                    size="small"
                    margin="dense"
                    onChange={(e) => setId(e.target.value)}
                    error={!isIdEntered()}
                    helperText={isIdEntered() ? '' : 'Id is required.'}
                    fullWidth
                />
                <TextField
                    label="Title"
                    id="product_title"
                    value={title}
                    size="small"
                    margin="dense"
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Price"
                    id="product_price"
                    value={price}
                    size="small"
                    margin="dense"
                    onChange={(e) => setPrice(Number(e.target.value))}
                    fullWidth
                />
                <TextField
                    label="point"
                    id="product_point"
                    value={point}
                    size="small"
                    margin="dense"
                    onChange={(e) => setPoint(Number(e.target.value))}
                    fullWidth
                />
                <TextField
                    label="URL"
                    id="product_url"
                    value={url}
                    size="small"
                    margin="dense"
                    onChange={(e) => setUrl(e.target.value)}
                    fullWidth
                />
            </div>
            <RegisterButton
                variant="contained"
                disabled={!isIdEntered()}
                onClick={() => sendRegisterMessage()}
                fullWidth
            >
                REGISTER
            </RegisterButton>
        </div>
    );
};

export default Popup;
