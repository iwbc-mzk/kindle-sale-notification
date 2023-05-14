export type LambdaResponse = {
    ok: boolean;
    message: string;
    body: unknown;
};

export type ProductInfoMessage = {
    type: string;
};

export type ProductInfoResponse = {
    productInfo: ProductInfo;
};

export type RegisterMessage = {
    type: string;
    productInfo: ProductInfo;
};

export type RegisterResponse = LambdaResponse;

export type ProductInfo = {
    id: string;
    title: string;
    price: number;
    point: number;
    url: string;
};

export type EnvVariables = {
    awsRegion: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsApiEndpoint: string;
};
