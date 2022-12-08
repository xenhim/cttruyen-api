import { got, gotScraping } from 'got-scraping';
import { baseUrl, secretKey } from './constants.js';

export const encodeImageUrl = (imgUrl) => {
    return Buffer.from(imgUrl + secretKey).toString('base64');
};

export const dencodeImageUrl = (imgUrl) => {
    return Buffer.from(imgUrl, 'base64').toString('ascii').replace(secretKey, '');
};

export const fetchImageWithAuth = async (imgUrl) => {
    let myImgUrl = imgUrl;
    if (imgUrl.startsWith('//')) {
        myImgUrl = imgUrl.replace('//', 'https://');
    } else if (!imgUrl.startsWith('https://') && !imgUrl.startsWith('http://')) {
        myImgUrl += 'https://';
    }

    const options = {
        headers: {
            Referer: baseUrl,
        },
    };
    const buffer = await got(myImgUrl, options).buffer();
    return Buffer.from(buffer, 'base64');
};

export const getHtmlData = async (path, options) => {
    const res = await gotScraping.get(baseUrl + path, options);
    return res.body;
};
