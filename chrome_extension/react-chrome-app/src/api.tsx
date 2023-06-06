import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { getEnvVariables, createAwsCredentialsFromEnv } from './content/urils';

const apiRequest = async (
    method: string,
    path: string,
    body?: string
): Promise<Response> => {
    const env = getEnvVariables();
    const endpoint = env.awsApiEndpoint;
    const hostname = new URL(endpoint).host;
    const region = env.awsRegion;

    const credentials = createAwsCredentialsFromEnv();

    const url = new URL(path, endpoint);

    const signer = new SignatureV4({
        region,
        service: 'execute-api',
        sha256: Sha256,
        credentials: credentials,
    });

    const httpReq = new HttpRequest({
        method: method,
        protocol: 'https',
        path: path,
        hostname: hostname,
        headers: {
            host: hostname,
        },
    });
    if (body) {
        httpReq.body = body;
    }

    const req = await signer.sign(httpReq);
    console.log(req);

    return fetch(url, { ...req });
};

export const postItem = async (body: string): Promise<Response> => {
    return apiRequest('POST', '/items', body);
};

export const getItems = async (id?: string): Promise<Response> => {
    if (id) {
        return apiRequest('GET', `/items${id}`);
    } else {
        return apiRequest('GET', '/items');
    }
};

export const deleteItem = async (id: string): Promise<Response> => {
    return apiRequest('DELETE', `/items/${id}`);
};

export default {
    postItem,
    getItems,
    deleteItem,
};
