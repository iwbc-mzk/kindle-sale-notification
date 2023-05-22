import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/material/styles';

import { listener } from './listener';
import { ProductInfo } from '../types';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    register,
    unregister,
    fetchItems,
} from './urils';
import { ID_STORAGE_KEY } from '../const';

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

const UnregisterButton = styled(RegisterButton)({
    // backgroundColor: 'black',
});

function App() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [registeredItems, setRegisteredItems] = useState<ProductInfo[]>([]);

    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

    const isPopoverOpen = Boolean(anchorEl);
    const isRegistered = registeredItems.map((item) => item.id).includes(id);

    // 他コンテキストでの変更を含む、登録済IDの変更を反映する
    // 自身でのストレージ登録時も実行されるので、不必要なState変更をしないように注意
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'session') {
            if (changes?.[ID_STORAGE_KEY]) {
                const newItems: ProductInfo[] =
                    changes[ID_STORAGE_KEY].newValue;
                setRegisteredItems(newItems);
            }
        }
    });

    useEffect(() => {
        chrome.storage.session.get([ID_STORAGE_KEY]).then((result) => {
            if (!result?.[ID_STORAGE_KEY]) {
                fetchItems().then((res) => {
                    if (res.body) {
                        const items_str = res.body?.items ?? '';
                        const items: ProductInfo[] = JSON.parse(items_str);
                        chrome.storage.session.set({
                            [ID_STORAGE_KEY]: items,
                        });
                    }
                });
            } else {
                setRegisteredItems(result[ID_STORAGE_KEY] as ProductInfo[]);
            }
        });
    }, []);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const registerProduct = async () => {
        setIsLoading(true);

        // 登録前にポップオーバーを消しておかないと、登録後にスクロールバーが消える
        handlePopoverClose();

        const productInfo = { id, title, price, point, url };
        const resJson = await register(productInfo);

        if (resJson.ok) {
            const newItems = [productInfo, ...registeredItems];
            chrome.storage.session
                .set({ [ID_STORAGE_KEY]: newItems })
                .then(() => {
                    alert(`Register Seccess!\n${JSON.stringify(productInfo)}`);
                });
        } else {
            alert(`Register Faild.\n${resJson.message}`);
        }
        setIsLoading(false);
    };

    const unregisterProduct = async () => {
        setIsLoading(true);

        const resJson = await unregister(id);
        if (resJson.ok) {
            const newItems = registeredItems.filter((item) => item.id != id);
            chrome.storage.session.set({ [ID_STORAGE_KEY]: newItems });
            alert('Unregister Seccess!');
        } else {
            alert('Unregister Faild.');
        }

        setIsLoading(false);
    };

    return (
        <div>
            {isRegistered ? (
                <UnregisterButton
                    onClick={() => unregisterProduct()}
                    disabled={isLoading}
                >
                    通知解除
                </UnregisterButton>
            ) : (
                <RegisterButton
                    onClick={() => registerProduct()}
                    onMouseEnter={handlePopoverOpen}
                    onMouseLeave={handlePopoverClose}
                    disabled={isLoading}
                >
                    セール時に通知
                </RegisterButton>
            )}
            <Popover
                sx={{
                    pointerEvents: 'none',
                }}
                open={isPopoverOpen}
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

chrome.runtime.onMessage.addListener(listener);

export default App;
