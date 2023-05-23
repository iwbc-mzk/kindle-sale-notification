export type LambdaResponse = {
    ok: boolean;
    message: string;
    body?: LambdaResponseBody;
};

export type LambdaResponseBody = {
    items?: string;
};

export type BaseMessage = {
    type: string;
};

export type ProductInfoMessage = BaseMessage;

export type ProductInfoResponse = {
    productInfo: ProductInfo;
};

export type RegisterMessage = BaseMessage & {
    productInfo: ProductInfo;
};

export type RegisterResponse = LambdaResponse;

export type UnregisterMessage = BaseMessage & {
    id: string;
};

export type UnregisterResponse = LambdaResponse;

export type ChangeIconStateMessage = BaseMessage & {
    state: boolean;
};

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
