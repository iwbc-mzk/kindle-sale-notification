import React from 'react';
import { Button } from '@mui/material';

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
    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

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
            <Button variant="outlined" onClick={() => registerProduct()}>
                Sale Notification
            </Button>
        </div>
    );
}

chrome.runtime.onMessage.addListener(productInfoListener);
chrome.runtime.onMessage.addListener(registerListener);

export default App;
