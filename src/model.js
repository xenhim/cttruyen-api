import cheerio from 'cheerio';
import { baseUrl } from './constants.js';
import { dencodeImageUrl, encodeImageUrl, fetchImageWithAuth } from './services.js';

export const getCategories = (html) => {
    const categories = [];
    const $ = cheerio.load(html);

    $('.ModuleContent .module-title + .nav li').each((index, element) => {
        const categoryName = $(element).find('a').text();
        const categoryId =
            $(element)
                .find('a')
                .attr('href')
                .replace(baseUrl + '/tim-truyen', '')
                .replace('/', '') || 'all';

        categories.push({
            name: categoryName,
            id: categoryId,
        });
    });
    return categories;
};

export const getFilter = (html) => {
    const categories = getCategories(html);

    const status = [
        {
            name: 'Tất cả',
            id: '-1',
        },
        {
            name: 'Hoàn thành',
            id: '2',
        },
        {
            name: 'Đang tiến hành',
            id: '1',
        },
    ];
    const sort = [
        {
            name: 'Ngày cập nhật',
            id: '0',
        },
        {
            name: 'Truyện mới',
            id: '15',
        },
        {
            name: 'Top all',
            id: '10',
        },
        {
            name: 'Top tháng',
            id: '11',
        },
        {
            name: 'Top tuần',
            id: '12',
        },
        {
            name: 'Top ngày',
            id: '13',
        },
        {
            name: 'Số chapter',
            id: '30',
        },
    ];

    return [
        {
            title: 'Sắp xếp',
            id: 'sort',
            filtersValue: sort,
        },
        {
            title: 'Trạng thái',
            id: 'status',
            filtersValue: status,
        },
        {
            title: 'Thể loại',
            id: 'category',
            filtersValue: categories,
        },
    ];
};

export const getList = (html, page, currentHref) => {
    const $ = cheerio.load(html);
    const data = [];
    $('.ModuleContent .items .row .item').each((index, element) => {
        const mangaName = $(element).find('.jtip').text();
        const posterUrl = $(element).find('.image a img').attr('data-original');
        const chapterName = $(element).find('ul .chapter:nth-child(1) a').text();
        const updatedAt = $(element).find('ul .chapter:nth-child(1) i').text();

        const id = $(element)
            .find('.image a')
            .attr('href')
            .replace(baseUrl + '/truyen-tranh/', '');
        const chapterId = $(element)
            .find('ul .chapter:nth-child(1) a')
            .attr('href')
            .replace(baseUrl + '/truyen-tranh/', '');

        data.push({
            id: id,
            mangaName,
            posterUrl,
            newestChapter: {
                chapterName,
                chapterId,
                updatedAt,
            },
        });
    });
    const lastPageHref = $('.pagination').find('li:last-child a').attr('href');
    let lastPageCount = lastPageHref ? lastPageHref.slice(lastPageHref.indexOf('page=') + 5, lastPageHref.length) : 1;
    const title = $('.Module-179 .ModuleContent .nav li.active a').text();

    lastPageCount = Number(lastPageCount);

    return {
        title,
        data: data,
        pagination: {
            currentPage: Number(page) > lastPageCount ? lastPageCount : Number(page),
            totalPage: lastPageCount,
        },
    };
};

export const getDetails = (html, id, currentHref) => {
    const $ = cheerio.load(html);
    const chapters = [];
    const categories = [];
    $('#nt_listchapter nav ul .row').each((index, element) => {
        const chapterName = $(element).find('.chapter a').text();
        const updatedAt = $(element).find('.no-wrap.small').text();
        const viewCount = $(element).find('.col-xs-3.text-center.small').text();
        const chapterId = $(element)
            .find('.chapter a')
            .attr('href')
            .replace(baseUrl + '/truyen-tranh/', '');

        chapters.push({
            chapterName,
            chapterId,
            updatedAt,
            viewCount,
        });
    });

    $('.kind.row .col-xs-8 a').each((index, element) => {
        const categoryName = $(element).text();
        const categoryHref = $(element).attr('href');
        const categoryId = categoryHref.slice(categoryHref.lastIndexOf('/the-loai') + 10, categoryHref.length);

        categories.push({ categoryName, categoryId });
    });

    const mangaName = $('#item-detail .title-detail').text();
    const posterUrl = $('.col-xs-4.col-image img').attr('src');
    const updatedAtText = $('#item-detail time').text();
    const updatedAt = updatedAtText.slice(updatedAtText.indexOf(':') + 2, updatedAtText.length - 2);
    const authorName = $('.author.row .col-xs-8').text();
    const status = $('.status.row .col-xs-8').text();
    const ratingCount = $('[itemprop="ratingCount"]').text();
    const ratingValue = $('[itemprop="ratingValue"]').text();

    const description = $('.detail-content p').text();

    return {
        id,
        mangaName,
        description,
        posterUrl,
        chapters,
        categories,
        otherDetails: {
            authorName,
            status,
            ratingValue,
            ratingCount,
            ratingValue,
        },
        updatedAt,
    };
};

export const getChapters = (html, chapterId, currentHref) => {
    const $ = cheerio.load(html);
    const chapterImages = [];

    $('.reading-detail .page-chapter').each((index, element) => {
        const title = $(element).find('img').attr('alt');
        const imgUrl = $(element).find('img').attr('data-original');

        chapterImages.push({
            title,
            imgUrl: currentHref + '/image/' + encodeImageUrl(imgUrl),
            // imgUrl,
        });
    });

    const mangaName = $('.top .txt-primary a').text();
    const id = $('.top .txt-primary a')
        .attr('href')
        .replace(baseUrl + '/truyen-tranh/', '');
    const chapterName = $('.top .txt-primary span').text().replace('-', '').trim();
    const updatedAt = $('.top i').text();

    return {
        id,
        mangaName,
        chapterImages,
        currentChapter: {
            chapterName,
            chapterId,
            updatedAt,
        },
    };
};

export const getImageBase64 = async (imageId) => {
    const imgUrl = dencodeImageUrl(imageId);
    // const imgUrl = imageId;
    return await fetchImageWithAuth(imgUrl);
};
