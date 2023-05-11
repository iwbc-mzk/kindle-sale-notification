import aws from 'aws-sdk';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { EnvVariables, ProductInfo } from '../types';

export const isKindleUnlimited = () => {
    const xpath =
        '//*[@id="tmmSwatches"]/ul/li[1]/span[1]/span[1]/span/a/span[2]/i';

    const xpathResult = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    const unlimitedElement = xpathResult.snapshotItem(0);
    return unlimitedElement !== null;
};

export const getProductTitle = () => {
    const titleElement = document.getElementById('productTitle');
    const title = titleElement
        ? titleElement.textContent
            ? titleElement.textContent
            : ''
        : '';

    return title.trim();
};

export const getProductPrice = () => {
    const yen = '￥';

    let xpath: string;
    if (isKindleUnlimited()) {
        xpath = '//*[@id="tmmSwatches"]/ul/li[1]/span[1]/span[4]/span[1]/a';
    } else {
        xpath =
            '//*[@id="tmmSwatches"]/ul/li[1]/span/span[1]/span/a/span[2]/span[1]';
    }

    const xPathResult = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    const priceElement = xPathResult.snapshotItem(0);
    const text = priceElement?.firstChild?.nodeValue || '';

    const re = new RegExp(`^${yen}([0-9]+,{0,1})+`);
    const priceMatch = text.trim().match(re);
    const priceText = priceMatch
        ? priceMatch[0].replace(yen, '').replaceAll(',', '')
        : '0';
    const price = Number(priceText);

    return price;
};

export const getProductPoint = () => {
    const pt = 'pt';

    let xpath: string;
    if (isKindleUnlimited()) {
        xpath = '//*[@id="tmmSwatches"]/ul/li[1]/span[1]/span[4]/span[2]';
    } else {
        xpath =
            '//*[@id="tmmSwatches"]/ul/li[1]/span/span[1]/span/a/span[2]/span[2]';
    }

    const xPathResult = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    const pointElement = xPathResult.snapshotItem(0);
    const rawText = pointElement?.firstChild?.nodeValue || '';

    const re = new RegExp(`[0-9]*${pt}`);
    const pointMatch = rawText.match(re) || '';
    const pointText = pointMatch ? pointMatch[0].replace(pt, '') : '0';
    const point = Number(pointText);

    return point;
};

export const getProductUrl = () => {
    const { protocol, hostname } = window.location;
    const id = getProductId();

    return `${protocol}//${hostname}/dp/${id}`;
};

export const getProductId = () => {
    const { pathname } = window.location;

    const dpReg = new RegExp('/dp/[A-Z0-9]{10}');
    const dpMatch = pathname.match(dpReg);
    if (dpMatch) {
        return dpMatch[0]?.replace('/dp/', '').replace('/', '');
    } else {
        const gp_re = new RegExp('/gp/product/[A-Z0-9]{10}');
        const gp_match = pathname.match(gp_re);

        return gp_match
            ? gp_match[0].replace('/gp/product/', '').replace('/', '')
            : '';
    }
};

export const getEnvVariables = () => {
    const {
        AWS_REGIN: awsRegion,
        AWS_ACCESS_KEY_ID: awsAccessKeyId,
        AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
        AWS_LAMBDA_FUNCTIONS_URL: awsLambdaFunctionUrl,
    } = process.env;

    const env: EnvVariables = {
        awsRegion: awsRegion || '',
        awsAccessKeyId: awsAccessKeyId || '',
        awsSecretAccessKey: awsSecretAccessKey || '',
        awsLambdaFunctionUrl: awsLambdaFunctionUrl || '',
    };

    return env;
};

export const createAwsCredentials = (
    awsAccessKeyId: string,
    awsSecretAccessKey: string
) => {
    return new aws.Credentials(awsAccessKeyId, awsSecretAccessKey);
};

export const createAwsCredentialsFromEnv = () => {
    const env = getEnvVariables();
    return createAwsCredentials(env.awsAccessKeyId, env.awsSecretAccessKey);
};

export const register = async (productInfo: ProductInfo) => {
    const env = getEnvVariables();
    const lambdaUrlHostname = new URL(env.awsLambdaFunctionUrl).host;
    const region = env.awsRegion;
    const credentials = createAwsCredentialsFromEnv();

    if (
        !region ||
        !credentials.accessKeyId ||
        !credentials.secretAccessKey ||
        !lambdaUrlHostname
    ) {
        alert(
            'Can not find Aws region or access key id or secret access key or lambda functions url.'
        );
    }

    const signer = new SignatureV4({
        region: env.awsRegion,
        service: 'lambda',
        sha256: Sha256,
        credentials: credentials,
    });

    const body = JSON.stringify(productInfo);

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
    console.log('res: ', res);
    const resJson = await res.json();
    console.log('resJson: ', resJson);

    return resJson;
};
