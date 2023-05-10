import React from 'react';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { MessageType, ProductInfoResponse } from '../types';
import { MESSAGE_TYPES } from '../const';

const Popup = () => {
    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);
    const [point, setPoint] = useState(0);
    const [url, setUrl] = useState('');

    useEffect(() => {
        chrome.tabs &&
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true,
                },
                (tabs) => {
                    chrome.tabs.sendMessage(
                        tabs[0].id || 0,
                        {
                            type: MESSAGE_TYPES.ProductInfoMessage,
                        } as MessageType,
                        (response: ProductInfoResponse) => {
                            const { id, title, price, point, url } =
                                response.productInfo;
                            setId(id);
                            setTitle(title);
                            setPrice(price);
                            setPoint(point);
                            setUrl(url);
                        }
                    );
                }
            );
    }, []);

    return (
        <div style={{ width: '300px' }}>
            <header>
                <h5>Kindle Sale Notification</h5>
                <TextField
                    label="AWS Lambda Functions URL"
                    id="lambda_functions_url"
                    size="small"
                    margin="normal"
                    variant="standard"
                    fullWidth
                />
                <TextField
                    label="Id"
                    id="product_id"
                    value={id}
                    size="small"
                    margin="dense"
                    onChange={(e) => setId(e.target.value)}
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
            </header>
        </div>
    );
};

export default Popup;
