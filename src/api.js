import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { getCategories, getChapters, getDetails, getFilter, getImageBase64, getList } from './model.js';
import { getHtmlData } from './base.js';

const app = express();
const port = process.env.PORT || 8080;
dotenv.config();

/* CROS middleware */
const whitelist = JSON.parse(process.env.ALLOW_DOMAINS);
const environment = process.env.APP_ENV;

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else if (!origin && environment == 'development') {
            callback(null, true);
        } else {
            callback(new Error("You don't have permission to access this page"));
        }
    },
};

app.use(cors(corsOptions));

app.use(function (err, req, res, next) {
    console.error('Not allowed by CORS');
    res.status(404).send(err.message);
});

app.get('/', (req, res) => {
    const list = [
        {
            title: 'List truyện',
            path: '/list',
        },
        {
            title: 'Tìm truyện',
            path: '/search',
        },
        {
            title: 'Lọc truyện',
            path: '/filter',
        },
        {
            title: 'Thể loại',
            path: '/category',
        },
        {
            title: 'Thông tin truyện',
            path: '/details',
        },
        {
            title: 'Thông tin chapters',
            path: '/chapter',
        },
    ];
    res.status(200).json(list);
});

app.get('/filter', async (req, res) => {
    try {
        const html = await getHtmlData('/tim-truyen');
        const data = getFilter(html);

        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const html = await getHtmlData('/tim-truyen');
        const data = getCategories(html);

        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/list', async (req, res) => {
    try {
        const { page = 1, status, sort, category = 'all' } = req.query;

        let path = category !== 'all' ? `/tim-truyen/${category}` : '/tim-truyen';

        let myParams = {
            status: status,
            sort: sort,
            page: page,
        };

        const html = await getHtmlData(path, {
            params: {
                ...myParams,
            },
        });

        const data = getList(html, page);
        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/search', async (req, res) => {
    try {
        const { page = 1, q } = req.query;

        const html = await getHtmlData('/tim-truyen', {
            params: {
                keyword: q,
                page: page,
            },
        });

        const data = getList(html, page);
        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/details/*', async (req, res) => {
    try {
        const id = req.params[0];

        const html = await getHtmlData(`/truyen-tranh/${id}`);

        const data = getDetails(html, id);

        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/chapter/*', async (req, res) => {
    try {
        const chapterId = req.params[0];

        const html = await getHtmlData(`/truyen-tranh/${chapterId}`);
        const currentHref = req.protocol + '://' + req.get('host');
        const data = await getChapters(html, chapterId, currentHref);

        res.status(200).json(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.get('/image/*', async (req, res) => {
    try {
        const imageId = req.params[0];

        const data = await getImageBase64(imageId);

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': data.length,
        });
        res.end(data);
    } catch (error) {
        const { message, name } = error;
        res.status(400).json({
            message,
            name,
        });
    }
});

app.listen(port, console.log(`App listening at http://localhost:${port}`));
