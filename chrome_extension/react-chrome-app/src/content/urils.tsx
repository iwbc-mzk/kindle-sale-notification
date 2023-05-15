import aws from 'aws-sdk';

import { EnvVariables, ProductInfo, LambdaResponse } from '../types';
import api from './api';

export const isKindleUnlimited = (): boolean => {
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

export const getProductTitle = (): string => {
    const titleElement = document.getElementById('productTitle');
    const title = titleElement?.textContent ?? '';

    return title.trim();
};

export const getProductPrice = (): number => {
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
    const text = priceElement?.firstChild?.nodeValue ?? '';

    const re = new RegExp(`^${yen}([0-9]+,{0,1})+`);
    const priceMatch = text.trim().match(re);
    if (priceMatch) {
        const priceText = priceMatch[0].replace(yen, '').replaceAll(',', '');
        const price = Number(priceText);
        return price;
    } else {
        return 0;
    }
};

export const getProductPoint = (): number => {
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
    const rawText = pointElement?.firstChild?.nodeValue ?? '';

    const re = new RegExp(`[0-9]*${pt}`);
    const pointMatch = rawText.match(re) ?? '';
    const pointText = pointMatch ? pointMatch[0].replace(pt, '') : '0';
    const point = Number(pointText);

    return point;
};

export const getProductUrl = (): string => {
    const { protocol, hostname } = window.location;
    const id = getProductId();

    return `${protocol}//${hostname}/dp/${id}`;
};

export const getProductId = (): string => {
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

export const getEnvVariables = (): EnvVariables => {
    const {
        AWS_REGIN: awsRegion,
        AWS_ACCESS_KEY_ID: awsAccessKeyId,
        AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
        AWS_API_ENDPOINT: awsApiEndpoint,
    } = process.env;

    const env: EnvVariables = {
        awsRegion: awsRegion ?? '',
        awsAccessKeyId: awsAccessKeyId ?? '',
        awsSecretAccessKey: awsSecretAccessKey ?? '',
        awsApiEndpoint: awsApiEndpoint ?? '',
    };

    return env;
};

export const createAwsCredentials = (
    awsAccessKeyId: string,
    awsSecretAccessKey: string
): aws.Credentials => {
    return new aws.Credentials(awsAccessKeyId, awsSecretAccessKey);
};

export const createAwsCredentialsFromEnv = () => {
    const env = getEnvVariables();
    return createAwsCredentials(env.awsAccessKeyId, env.awsSecretAccessKey);
};

export const register = async (
    productInfo: ProductInfo
): Promise<LambdaResponse> => {
    const res = await api.postItem(JSON.stringify(productInfo));
    const resJson = await res.json();

    return resJson;
};

export const fetchItems = async (id?: string): Promise<LambdaResponse> => {
    const res = await api.getItems(id);
    const resJson = await res.json();

    return resJson;
};

export const unregister = async (id: string): Promise<LambdaResponse> => {
    const res = await api.deleteItem(id);
    const resJson = await res.json();

    return resJson;
};
