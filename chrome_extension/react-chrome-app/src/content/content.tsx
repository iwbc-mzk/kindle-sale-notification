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
    const [registeredIds, setRegisteredIds] = useState<string[]>([]);

    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

    const isPopoverOpen = Boolean(anchorEl);
    const isRegistered = registeredIds.includes(id);

    // 他コンテキストでの変更を反映
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            if (changes?.ids) {
                const newIds: string[] = changes.ids.newValue;
                setRegisteredIds(newIds);
            }
        }
    });

    useEffect(() => {
        chrome.storage.sync.get([ID_STORAGE_KEY]).then((result) => {
            if (!result?.ids) {
                fetchItems().then((res) => {
                    if (res.body) {
                        const items_str = res.body?.items ?? '';
                        const items: ProductInfo[] = JSON.parse(items_str);
                        const ids = items.map((item) => item.id);
                        setRegisteredIds(ids);
                        chrome.storage.sync.set({ [ID_STORAGE_KEY]: ids });
                    }
                });
            } else {
                setRegisteredIds(result.ids as string[]);
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
            const newIds = [id, ...registeredIds];
            setRegisteredIds(newIds);
            chrome.storage.sync.set({ [ID_STORAGE_KEY]: newIds }).then(() => {
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
            const newIds = registeredIds.filter((n) => n != id);
            setRegisteredIds(newIds);
            chrome.storage.sync.set({ [ID_STORAGE_KEY]: newIds });
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
