/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import {
    ProductInfoMessage,
    ProductInfoResponse,
    RegisterMessage,
    RegisterResponse,
    UnregisterMessage,
    UnregisterResponse,
} from '../types';
import { MESSAGE_TYPES, ID_STORAGE_KEY } from '../const';
import { sleep } from '../utils';

const RegisterButton = styled(Button)({
    boxShadow: 'none',
    margin: '10px 0px',
    backgroundColor: 'rgba(42, 64, 115, 0.9)',
    '&:hover': {
        backgroundColor: 'rgba(42, 64, 115, 1)',
    },
});

const UnregisterButton = styled(RegisterButton)({
    outline: '3px solid rgba(42, 64, 115, 1)',
    backgroundColor: 'white',
    color: 'rgba(42, 64, 115, 1)',
    '&:hover': {
        backgroundColor: 'rgba(42, 64, 115, 0.1)',
    },
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
    const [id, setId] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [point, setPoint] = useState<number>(0);
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tooltipTitle, setTooltipTitle] = useState<string>('');
    const [registeredIds, setRegisteredIds] = useState<string[]>([]);

    const isTooltipOpen = Boolean(tooltipTitle);
    const isRegistered = registeredIds.includes(id);

    useEffect(() => {
        setProductInfo();
        chrome.storage.sync.get([ID_STORAGE_KEY]).then((result) => {
            if (result?.ids) {
                setRegisteredIds(result.ids as string[]);
            }
        });
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
        setIsLoading(true);

        const message: RegisterMessage = {
            type: MESSAGE_TYPES.RegisterMessage,
            productInfo: { id, title, price, point, url },
        };
        const callback = (response: RegisterResponse) => {
            setIsLoading(false);

            const { ok } = response;
            if (ok) {
                const newIds = [id, ...registeredIds];
                setRegisteredIds(newIds);
                chrome.storage.sync.set({ [ID_STORAGE_KEY]: newIds });
            }
            const msg = ok ? 'Success!!' : 'Failed';
            setTooltipTitle(msg);
            sleep(5000).then(() => setTooltipTitle(''));
        };

        sendMessageToActiveTab(message, callback);
    };

    const sendUnregisterMessage = () => {
        setIsLoading(true);

        const message: UnregisterMessage = {
            type: MESSAGE_TYPES.UnregisterMessage,
            id,
        };
        const callback = (response: UnregisterResponse) => {
            setIsLoading(false);

            const { ok } = response;
            if (ok) {
                const newIds = registeredIds.filter((v) => v != id);
                setRegisteredIds(newIds);
                chrome.storage.sync.set({ [ID_STORAGE_KEY]: newIds });
            }
            const msg = ok ? 'Success!!' : 'Failed';
            setTooltipTitle(msg);
            sleep(5000).then(() => setTooltipTitle(''));
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
            <Tooltip
                title={tooltipTitle}
                open={isTooltipOpen}
                disableFocusListener
                disableHoverListener
                disableTouchListener
            >
                {isRegistered ? (
                    <UnregisterButton
                        variant="contained"
                        disabled={!isIdEntered() || isLoading}
                        onClick={() => sendUnregisterMessage()}
                        fullWidth
                    >
                        通知解除
                    </UnregisterButton>
                ) : (
                    <RegisterButton
                        variant="contained"
                        disabled={!isIdEntered() || isLoading}
                        onClick={() => sendRegisterMessage()}
                        fullWidth
                    >
                        登録{sessionStorage.getItem('ids') && 'aaaa'}
                    </RegisterButton>
                )}
            </Tooltip>
        </div>
    );
};

export default Popup;
