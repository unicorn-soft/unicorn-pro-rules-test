import { http, HttpResponse } from 'msw';

const xhrMockResponses = {
    '/api/data1': {
        jpxr_ads1: 1,
        jpxr_tracking1: { banner1: 'seoul', popup1: 'kr' },
    },
    '/api/data2': {
        jpxr_ads2: 1,
        jpxr_tracking2: { banner2: 'seoul', popup2: 'kr' },
        jpxr_content2: 'test',
    },
    '/api/data3': [
        { jpxr_ads3: 1, jpxr_tracking3: 'seoul' },
        { jpxr_ads3: 2, jpxr_tracking3: 'busan' },
    ],
    '/api/data4': {
        jpxr_tracking4: {
            video4: { ads4: 1, content4: '집' },
            display4: { ads4: 2, content4: '회사' },
        },
    },
    '/api/data5': {
        jpxr_ads5: 123,
        jpxr_content5: 'test',
        jpxr_tracking5: 'seoul',
    },
    '/api/data6': {
        jpxr_ads6: [
            { id6: 1, banner6: 'top', popup6: 'modal' },
            { id6: 2, video6: 'play', popup6: 'overlay' },
            { id6: 3, banner6: 'bottom', popup6: 'toast' },
        ],
    },
    '/api/data7': {
        jpxr_ads7: 1,
        jpxr_content7: 'keep',
        jpxr_tracking7: 'seoul',
    },
    '/api/data8': {
        jpxr_ads8: 1,
        jpxr_content8: 'keep',
        jpxr_tracking8: 'kr',
    },
    '/api/data9': {
        jpxr_ads9: 1,
        jpxr_content9: 'keep',
        jpxr_tracking9: 'ok',
    },
    '/api/skip': {
        jpxr_ads9: 99,
        jpxr_content9: 'skip',
        jpxr_tracking9: 'skip',
    },
    '/api/data10': {
        jpxr_ads10: 1,
        jpxr_content10: 'keep',
        jpxr_tracking10: 'ok',
    },
};

const xhrHandlers = Object.keys(xhrMockResponses)
    .map((path) => {
        const responder = () => HttpResponse.json(xhrMockResponses[path]);
        // /api/data8: method:POST 매칭 케이스 전용으로 POST만 응답
        if (path === '/api/data8') {
            return http.post(path, responder);
        }
        return http.get(path, responder);
    })
    .flat();

const fetchMockResponses = {
    '/api/fetch-data1': {
        ads1: 1,
        tracking1: { banner1: 'seoul', popup1: 'kr' },
    },
    '/api/fetch-data2': {
        ads2: 1,
        tracking2: { banner2: 'seoul', popup2: 'kr' },
        content2: 'test',
    },
    '/api/fetch-data3': [
        { ads3: 1, tracking3: 'seoul' },
        { ads3: 2, tracking3: 'busan' },
    ],
    '/api/fetch-data4': {
        tracking4: {
            video4: { ads4: 1, content4: '집' },
            display4: { ads4: 2, content4: '회사' },
        },
    },
    '/api/fetch-data5': { ads5: 123, content5: 'test', tracking5: 'seoul' },
};

const fetchHandlers = Object.keys(fetchMockResponses).map((path) => {
    return http.get(path, () => {
        return HttpResponse.json(fetchMockResponses[path]);
    });
});

const replaceFetchMockResponses = {
    '/api/replace-data1': 'This content has ads content',
    '/api/replace-data2': 'Price is 123 dollars',
    '/api/replace-data3': 'This has tracking code',
    '/api/replace-data4': 'secret information',
    '/api/replace-data5': 'This is bad content with ads items',
};

const replaceFetchHandlers = Object.keys(replaceFetchMockResponses).map(
    (path) => {
        return http.all(path, () => {
            return HttpResponse.text(replaceFetchMockResponses[path]);
        });
    }
);

const noXhrIfMockResponses = {
    '/api/block1': 'original-response-block1',
    '/api/track-analytics': 'original-response-track',
    '/api/post-data': 'original-response-post',
    '/api/block4': 'original-response-block4',
    '/api/surrogate-data': { content: 'surrogate' },
};

const noXhrIfHandlers = Object.keys(noXhrIfMockResponses).map((path) => {
    return http.all(path, () => {
        const response = noXhrIfMockResponses[path];
        if (typeof response === 'object') {
            return HttpResponse.json(response);
        }
        return HttpResponse.text(response);
    });
});

const noFetchIfMockResponses = {
    '/api/fetch-block1': 'original-response-fetch-block1',
    '/api/fetch-track-analytics': 'original-response-fetch-track',
    '/api/fetch-post-data': 'original-response-fetch-post',
    '/api/fetch-block4': 'original-response-fetch-block4',
    '/api/fetch-surrogate-data': { content: 'surrogate' },
};

const noFetchIfHandlers = Object.keys(noFetchIfMockResponses).map((path) => {
    return http.all(path, () => {
        const response = noFetchIfMockResponses[path];
        if (typeof response === 'object') {
            return HttpResponse.json(response);
        }
        return HttpResponse.text(response);
    });
});

const echoPaths = [
    '/api/edit-request-1',
    '/api/edit-request-2',
    '/api/edit-request-3',
    '/api/edit-request-4',
    '/api/edit-request-5',
    '/api/edit-request-6',
    '/api/edit-request-7',
    '/api/edit-request-8',
    '/api/edit-request-9',
    '/api/edit-request-10',
    '/api/edit-request-11',
    '/api/edit-request-12',
    '/api/edit-request-13',
    '/api/edit-request-14',
    '/api/edit-request-15',
    '/api/edit-request-16',
    '/api/edit-xhr-request-1',
    '/api/edit-xhr-request-2',
    '/api/edit-xhr-request-3',
    '/api/edit-xhr-request-4',
    '/api/edit-xhr-request-5',
    '/api/edit-xhr-request-6',

    '/api/echo',
];

const echoHandlers = echoPaths.map((path) => {
    return http.post(path, async ({ request }) => {
        try {
            const body = await request.json();
            return HttpResponse.json(body);
        } catch (e) {
            const textBody = await request.text();
            if (!textBody) {
                return HttpResponse.json({});
            }

            return HttpResponse.json({ data: textBody });
        }
    });
});

export const handlers = [
    ...xhrHandlers,
    ...fetchHandlers,
    ...replaceFetchHandlers,
    ...noXhrIfHandlers,
    ...noFetchIfHandlers,
    ...echoHandlers,
];
