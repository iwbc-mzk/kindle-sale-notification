import React, { useState } from 'react';
import { Button } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';

import { productInfoListener, registerListener } from './listener';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    register,
} from './urils';

const RegisterButton = styled(Button)({
    margin: '10px 0px',
    width: '100%',
    height: '30px',
    border: '1px solid #888C8C',
    borderRadius: '8px',
    boxShadow: '0 2px 5px 0 rgba(213, 217, 217, .5)',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: '#0F1111',
});

function App() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setIsLoading(true);

        const productInfo = { id, title, price, point, url };
        const resJson = await register(productInfo);
        console.log(resJson);

        if (resJson.ok) {
            alert(`Register Seccess!\n${JSON.stringify(productInfo)}`);
        } else {
            alert(`Register Faild.\n${resJson.message}`);
        }
        setIsLoading(false);
    };

    return (
        <div>
            <RegisterButton
                onClick={() => registerProduct()}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                disabled={isLoading}
            >
                セール時に通知
            </RegisterButton>
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
