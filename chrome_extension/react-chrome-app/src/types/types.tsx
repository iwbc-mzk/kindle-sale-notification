export type MessageType = {
    type: string
};

export type ProductInfoResponse = {
    productInfo: ProductInfo;
};

export type ProductInfo = {
    id: string,
    title: string,
    price: number,
    point: number,
    url: string,
};
