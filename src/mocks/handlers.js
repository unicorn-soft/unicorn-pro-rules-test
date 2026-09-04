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
    '/api/control-data5': {
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
    '/api/control-data7': {
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
    '/api/data10': {
        jpxr_ads10: 1,
        jpxr_content10: 'keep',
        jpxr_tracking10: 'ok',
    },
    '/api/data10x': {
        jpxr_ads10: 1,
        jpxr_content10: 'keep',
        jpxr_tracking10: 'ok',
    },
    '/api/conflict-json': {
        jpxr_conflict_ads11: 1,
        jpxr_conflict_content11: 'keep',
    },
    '/api/conflict-json-reuse': {
        jpxr_conflict_ads12: 1,
        jpxr_conflict_content12: 'keep',
    },
    '/api/conflict-both': {
        jpxr_conflict_both_ads13: 1,
        jpxr_conflict_both_keep13: 2,
        nxif_conflict_both_marker: 1,
    },
};

const xhrHandlers = Object.keys(xhrMockResponses)
    .map((path) => {
        const responder = () => HttpResponse.json(xhrMockResponses[path]);
        // /api/data8: method:POST 매칭 케이스 검증을 위해 POST/GET 모두 응답
        if (path === '/api/data8') {
            return [http.post(path, responder), http.get(path, responder)];
        }
        return http.get(path, responder);
    })
    .flat()
    .concat(http.get('/api/skip', () => HttpResponse.json(skipMockResponse)));

const fetchMockResponses = {
    '/api/fetch-data1': {
        jpfr_ads1: 1,
        jpfr_tracking1: {
            banner1: 'seoul',
            popup1: 'kr',
        },
    },
    '/api/fetch-data2': {
        jpfr_ads2: 1,
        jpfr_tracking2: {
            banner2: 'seoul',
            popup2: 'kr',
        },
        jpfr_content2: 'test',
    },
    '/api/fetch-data3': [
        {
            jpfr_ads3: 1,
            jpfr_tracking3: 'seoul',
        },
        {
            jpfr_ads3: 2,
            jpfr_tracking3: 'busan',
        },
    ],
    '/api/fetch-data4': {
        jpfr_tracking4: {
            video4: {
                ads4: 1,
                content4: '집',
            },
            display4: {
                ads4: 2,
                content4: '회사',
            },
        },
    },
    '/api/fetch-data5': {
        jpfr_ads5: 123,
        jpfr_content5: 'test',
        jpfr_tracking5: 'seoul',
    },
    '/api/control-fetch-data5': {
        jpfr_ads5: 123,
        jpfr_content5: 'test',
        jpfr_tracking5: 'seoul',
    },
    '/api/fetch-data6': {
        jpfr_ads6: [
            {
                id6: 1,
                banner6: 'top',
                popup6: 'modal',
            },
            {
                id6: 2,
                video6: 'play',
                popup6: 'overlay',
            },
            {
                id6: 3,
                banner6: 'bottom',
                popup6: 'toast',
            },
        ],
    },
    '/api/fetch-data7': {
        jpfr_ads7: 1,
        jpfr_content7: 'keep',
        jpfr_tracking7: 'seoul',
    },
    '/api/control-fetch-data7': {
        jpfr_ads7: 1,
        jpfr_content7: 'keep',
        jpfr_tracking7: 'seoul',
    },
    '/api/fetch-data8': {
        jpfr_ads8: 1,
        jpfr_content8: 'keep',
        jpfr_tracking8: 'kr',
    },
    '/api/fetch-data9': {
        jpfr_ads9: 1,
        jpfr_content9: 'keep',
        jpfr_tracking9: 'ok',
    },
    '/api/fetch-data10': {
        jpfr_ads10: 1,
        jpfr_content10: 'keep',
        jpfr_tracking10: 'ok',
    },
    '/api/fetch-data10x': {
        jpfr_ads10: 1,
        jpfr_content10: 'keep',
        jpfr_tracking10: 'ok',
    },
    '/api/fetch-put-data': 'original-response-fetch-put',
};

const skipMockResponse = {
    jpxr_ads9: 99,
    jpxr_content9: 'skip',
    jpxr_tracking9: 'skip',
    jpfr_ads9: 999,
    jpfr_content9: 'skip',
    jpfr_tracking9: 'skip',
};

const fetchHandlers = Object.keys(fetchMockResponses)
    .map((path) => {
        const responder = () => HttpResponse.json(fetchMockResponses[path]);
        if (path === '/api/fetch-data8') {
            // method:POST 매칭 검증을 위해 POST/GET 모두 응답
            return [http.post(path, responder), http.get(path, responder)];
        }
        return http.get(path, responder);
    })
    .flat()
    .concat(http.get('/api/skip', () => HttpResponse.json(skipMockResponse)));

const replaceFetchMockResponses = {
    '/api/replace-data1': 'This content has ads content',
    '/api/replace-data2': 'Price is 123 dollars',
    '/api/replace-data3': 'This has tracking code',
    '/api/replace-control3': 'Control has tracking code',
    '/api/replace-data4': 'secret information',
    '/api/replace-data5': 'secret information',
    '/api/replace-control5': 'secret information',
    '/api/replace-data6': '{"role":"user"}',
    '/api/replace-control6': '{"role":"user"}',
    '/api/replace-data7': '{"role":"user"}',
    '/api/replace-control7': '{"role":"user"}',
    '/api/replace-skip': 'Skip request with ads inside',
};

const replaceFetchHandlers = Object.keys(replaceFetchMockResponses)
    .map((path) => {
        // /api/replace-data4는 POST로도 테스트
        if (path === '/api/replace-data4') {
            return [
                http.get(path, () =>
                    HttpResponse.text(replaceFetchMockResponses[path])
                ),
                http.post(path, () =>
                    HttpResponse.text(replaceFetchMockResponses[path])
                ),
            ];
        }
        return http.all(path, () => {
            return HttpResponse.text(replaceFetchMockResponses[path]);
        });
    })
    .flat();

export const noXhrIfMockResponses = {
    '/api/block1': 'original-response-block1',
    '/api/track-analytics': 'original-response-track',
    '/api/post-data': 'original-response-post',
    '/api/put-data': 'original-response-put',
    '/api/other-post': 'original-response-other-post',
    '/api/post-data-request': 'original-response-post-request',
    '/api/block4': 'original-response-block4',
    '/api/surrogate-data': { content: 'surrogate' },
    '/api/block-implicit': 'original-response-implicit',
    '/api/block-json': { content: 'json-response' },
    '/api/block-buffer': 'buffer-response',
    '/api/block-blob': 'blob-response',
    '/api/block-doc': '<html><body><div>doc-response</div></body></html>',
    '/api/block-multi': 'original-response-multi',
    '/api/block-rand': 'original-response-rand',
    '/api/block-method-rand': 'original-response-method-rand',
    '/api/conflict-nxif': 'original-response-conflict-nxif',
    '/api/conflict-nxif-reuse': 'original-response-conflict-nxif-reuse',
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

export const noFetchIfMockResponses = {
    '/api/fetch-block1': 'original-response-fetch-block1',
    '/api/fetch-block6-request': 'original-response-fetch-block6-request',
    '/api/fetch-allow6-request': 'original-response-fetch-allow6-request',
    '/api/fetch-track-analytics': 'original-response-fetch-track',
    '/api/fetch-post-data': 'original-response-fetch-post',
    '/api/fetch-put-data': 'original-response-fetch-put',
    '/api/fetch-post-data-request': 'original-response-fetch-post-request',
    '/api/fetch-allow-post-request':
        'original-response-fetch-allow-post-request',
    '/api/fetch-block7-request': 'original-response-fetch-block7-request',
    '/api/fetch-allow7-request': 'original-response-fetch-allow7-request',
    '/api/fetch-block-implicit': 'original-response-fetch-implicit',
    '/api/fetch-block-multi': 'original-response-fetch-multi',
    '/api/fetch-allow-multi': 'original-response-fetch-allow-multi',
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
    '/api/edit-control-request-5',
    '/api/edit-request-6',
    '/api/edit-request-7',
    '/api/edit-request-8',
    '/api/edit-request-9',
    '/api/edit-request-10',
    '/api/edit-request-11',
    '/api/edit-request-12',
    '/api/edit-request-13',
    '/api/edit-request-14',
    '/api/edit-xhr-request-1',
    '/api/edit-xhr-request-2',
    '/api/edit-xhr-request-3',
    '/api/edit-xhr-request-4',
    '/api/edit-control-xhr-request-4',
    '/api/edit-xhr-request-5',
    '/api/edit-xhr-request-6',
    '/api/edit-xhr-request-7',
    '/api/edit-xhr-request-8',
    '/api/edit-xhr-request-9',
    '/api/edit-xhr-request-10',
    '/api/edit-xhr-request-11',
    '/api/edit-xhr-request-12',
    '/api/edit-xhr-request-13',
    '/api/edit-xhr-request-14',

    '/api/echo',
    '/api/exclude-14',
    '/api/exclude-xhr-14',
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
