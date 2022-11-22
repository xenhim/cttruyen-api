import fetch from 'node-fetch';
import { baseUrl } from './constants.js';

export const decodeImageUrl = (imgUrl) => {};

export const encodeImageUrl = (imgUrl) => {};

export const fetchImageWithAuth = async (url, referer) => {
    const options = {
        responseType: 'arraybuffer',
        headers: {
            Referer: baseUrl,
        },
    };
    const response = await fetch(url, options);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer, 'base64');
};
