import React from 'react';

import ListButton from './list_button';

const NotKindlePage = () => {
    return (
        <div
            style={{
                width: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
            }}
        >
            <ListButton />
            <div
                style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '13px',
                }}
            >
                Kindleの商品ページではありません。
            </div>
        </div>
    );
};

export default NotKindlePage;
