/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import {
    ProductInfo,
    ProductInfoMessage,
    ProductInfoResponse,
    RegisterMessage,
    RegisterResponse,
    UnregisterMessage,
    UnregisterResponse,
} from '../types';
import { MESSAGE_TYPES, ID_STORAGE_KEY } from '../const';
import { sleep, sendMessageToActiveTab } from '../utils';

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

const Popup = () => {
    const [id, setId] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [point, setPoint] = useState<number>(0);
    const [url, setUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tooltipTitle, setTooltipTitle] = useState<string>('');
    const [registeredItems, setRegisteredItems] = useState<ProductInfo[]>([]);

    const isTooltipOpen = Boolean(tooltipTitle);
    const isRegistered = registeredItems.map((item) => item.id).includes(id);

    useEffect(() => {
        setProductInfo();
        chrome.storage.session.get([ID_STORAGE_KEY]).then((result) => {
            if (result?.[ID_STORAGE_KEY]) {
                setRegisteredItems(result[ID_STORAGE_KEY] as ProductInfo[]);
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

        sendMessageToActiveTab(message)
            .then(callback)
            .catch((err) => console.log(err));
    };

    const sendRegisterMessage = () => {
        setIsLoading(true);

        const productInfo: ProductInfo = { id, title, price, point, url };
        const message: RegisterMessage = {
            type: MESSAGE_TYPES.RegisterMessage,
            productInfo,
        };
        const callback = (response: RegisterResponse) => {
            setIsLoading(false);

            const { ok } = response;
            if (ok) {
                const newItems = [productInfo, ...registeredItems];
                setRegisteredItems(newItems);
                chrome.storage.session.set({ [ID_STORAGE_KEY]: newItems });
            }
            const msg = ok ? 'Success!!' : 'Failed';
            setTooltipTitle(msg);
            sleep(5000).then(() => setTooltipTitle(''));
        };

        sendMessageToActiveTab(message)
            .then(callback)
            .catch((err) => console.log(err));
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
                const newItems = registeredItems.filter(
                    (item) => item.id != id
                );
                setRegisteredItems(newItems);
                chrome.storage.session.set({ [ID_STORAGE_KEY]: newItems });
            }
            const msg = ok ? 'Success!!' : 'Failed';
            setTooltipTitle(msg);
            sleep(5000).then(() => setTooltipTitle(''));
        };

        sendMessageToActiveTab(message)
            .then(callback)
            .catch((err) => console.log(err));
    };

    const isIdEntered = () => {
        return id != null && id !== '';
    };

    const onClickRegistered = () => {
        window.open(chrome.runtime.getURL('list.html'));
    };

    return (
        <div style={{ width: '300px' }}>
            <div style={{ textAlign: 'right' }}>
                <span
                    style={{ color: '#1d3994', cursor: 'pointer' }}
                    onClick={onClickRegistered}
                >
                    登録済一覧
                </span>
            </div>
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
                        登録
                    </RegisterButton>
                )}
            </Tooltip>
        </div>
    );
};

export default Popup;
