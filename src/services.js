import { got, gotScraping } from 'got-scraping';
import { baseUrl } from './constants.js';

export const fetchImageWithAuth = async (url, referer) => {
    const options = {
        headers: {
            Referer: baseUrl,
        },
    };
    const buffer = await got(url, options).buffer();
    return Buffer.from(buffer, 'base64');
};

export const getHtmlData = async (path, options) => {
    const res = await gotScraping.get(baseUrl + path, options);
    return res.body;
};
