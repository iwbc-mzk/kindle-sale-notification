import React, { useState } from 'react';
import { Button } from '@mui/material';
import Popover from '@mui/material/Popover';

import { productInfoListener, registerListener } from './listener';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    register,
} from './urils';

function App() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

    const isPoooverOpen = Boolean(anchorEl);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const registerProduct = async () => {
        const productInfo = { id, title, price, point, url };
        const resJson = await register(productInfo);
        console.log(resJson);

        if (resJson.ok) {
            alert(`Register Seccess!\n${JSON.stringify(productInfo)}`);
        } else {
            alert(`Register Faild.\n${resJson.message}`);
        }
    };

    return (
        <div>
            <Button
                onClick={() => registerProduct()}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
            >
                Kindle Sale Notification
            </Button>
            <Popover
                sx={{
                    pointerEvents: 'none',
                }}
                open={isPoooverOpen}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <div style={{ margin: '10px' }}>
                    id: {id}
                    <br />
                    title: {title}
                    <br />
                    price: {price}
                    <br />
                    point: {point}
                    <br />
                    url: {url}
                    <br />
                </div>
            </Popover>
        </div>
    );
}

chrome.runtime.onMessage.addListener(productInfoListener);
chrome.runtime.onMessage.addListener(registerListener);

export default App;
