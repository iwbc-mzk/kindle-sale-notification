import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { getEnvVariables, createAwsCredentialsFromEnv } from './urils';

const apiRequest = async (
    method: string,
    path: string,
    body: string
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

    const req = await signer.sign(
        new HttpRequest({
            method: method,
            protocol: 'https',
            path: path,
            hostname: hostname,
            headers: {
                host: hostname,
            },
            body: body,
        })
    );
    console.log(req);

    return fetch(url, { ...req });
};

export const registerItem = async (body: string): Promise<Response> => {
    return apiRequest('POST', '/items', body);
};
