import React from 'react';
import Button from '@mui/material/Button/Button';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { messageFromPopup } from './listener';
import {
    getProductId,
    getProductTitle,
    getProductPrice,
    getProductPoint,
    getProductUrl,
    createAwsCredentialsFromEnv,
    getEnvVariables,
} from './urils';

function App() {
    const id = getProductId();
    const title = getProductTitle();
    const price = getProductPrice();
    const point = getProductPoint();
    const url = getProductUrl();

    const register = async () => {
        const {
            AWS_REGIN: awsRegion,
            AWS_ACCESS_KEY_ID: awsAccessKeyId,
            AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
            AWS_LAMBDA_FUNCTIONS_URL: awsLambdaFunctionUrl,
        } = process.env;

        if (
            !awsRegion ||
            !awsAccessKeyId ||
            !awsSecretAccessKey ||
            !awsLambdaFunctionUrl
        ) {
            alert(
                'Can not find Aws region or access key id or secret access key or lambda functions url.'
            );
        }

        const env = getEnvVariables();
        const lambdaUrlHostname = new URL(env.awsLambdaFunctionUrl).host;
        const credentials = createAwsCredentialsFromEnv();

        const signer = new SignatureV4({
            region: env.awsRegion,
            service: 'lambda',
            sha256: Sha256,
            credentials: credentials,
        });

        const body = JSON.stringify({
            id,
            title,
            price,
            point,
            url,
        });

        const req = await signer.sign(
            new HttpRequest({
                method: 'POST',
                protocol: 'https',
                path: '/',
                hostname: lambdaUrlHostname,
                headers: {
                    host: lambdaUrlHostname,
                },
                body: body,
            })
        );
        console.log(req);

        const res = await fetch(env.awsLambdaFunctionUrl, { ...req });
        const resJson = await res.json();
        console.log(resJson);
        if (resJson.ok) {
            alert(`Register Seccess!\n${body}`);
        } else {
            alert(`Register Faild.\n${resJson.message}`);
        }
    };

    return (
        <div>
            <Button variant="outlined" onClick={() => register()}>
                Sale Notification
            </Button>
        </div>
    );
}

chrome.runtime.onMessage.addListener(messageFromPopup);

export default App;
