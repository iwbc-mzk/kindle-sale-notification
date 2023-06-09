import React from 'react';

const ListButton = () => {
    const onClick = () => {
        window.open(chrome.runtime.getURL('list.html'));
    };

    return (
        <div
            style={{
                cursor: 'pointer',
                fontSize: '12px',
                color: '#1d3994',
                textAlign: 'center',
            }}
            onClick={onClick}
        >
            登録済一覧
        </div>
    );
};

export default ListButton;
