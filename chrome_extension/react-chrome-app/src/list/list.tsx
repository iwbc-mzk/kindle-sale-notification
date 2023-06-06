/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useEffect, useState } from 'react';
import {
    DataGrid,
    GridColDef,
    GridToolbar,
    GridRenderCellParams,
} from '@mui/x-data-grid';

import { ID_STORAGE_KEY, MESSAGE_TYPES } from '../const';
import { ProductInfo } from '../types';

const List = () => {
    const [registeredItems, setRegisteredItems] = useState<ProductInfo[]>([]);

    useEffect(() => {
        addSessionStorageListener();

        chrome.runtime
            .sendMessage({ type: MESSAGE_TYPES.FetchItems })
            .then((res) => {
                if (res.ok && res.body) {
                    if (res.body.items) {
                        const items: ProductInfo[] = JSON.parse(res.body.items);
                        setRegisteredItems(items);
                    }
                }
            });
    }, []);

    const addSessionStorageListener = () => {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'session') {
                if (changes?.[ID_STORAGE_KEY]) {
                    const newItems: ProductInfo[] =
                        changes[ID_STORAGE_KEY].newValue;
                    setRegisteredItems(newItems);
                }
            }
        });
    };

    const colums: GridColDef[] = [
        { field: 'id', headerName: 'ID', headerAlign: 'center', width: 150 },
        {
            field: 'title',
            headerName: 'Title',
            headerAlign: 'center',
            width: 500,
        },
        {
            field: 'price',
            headerName: 'Price',
            headerAlign: 'center',
            type: 'number',
            width: 100,
        },
        {
            field: 'point',
            headerName: 'Point',
            headerAlign: 'center',
            type: 'number',
            width: 100,
        },
        {
            field: 'url',
            headerName: 'URL',
            headerAlign: 'center',
            width: 350,
            renderCell: (params: GridRenderCellParams<ProductInfo>) => (
                <a
                    href={params.value}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {params.value}
                </a>
            ),
        },
    ];

    return (
        <div style={{ width: 1200, margin: 'auto' }}>
            <DataGrid
                rows={registeredItems}
                columns={colums}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 50 },
                    },
                }}
                pageSizeOptions={[20, 50, 100]}
                slots={{
                    toolbar: GridToolbar,
                }}
                disableRowSelectionOnClick
            />
        </div>
    );
};

export default List;
