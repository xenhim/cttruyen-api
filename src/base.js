import axios from 'axios';
import { baseUrl } from './constants.js';

export const getHtmlData = async (path, options) => {
    const res = await axios.get(baseUrl + path, options);
    return res.data;
};
