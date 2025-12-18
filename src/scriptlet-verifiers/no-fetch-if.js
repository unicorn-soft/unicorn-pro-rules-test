import { noFetchIfMockResponses } from '../mocks/handlers.js';
import { runWithPolling } from './polling.js';

const targetToPath = {
    'window.nfif_noFetchIfTestData1': '/api/fetch-block1',
    'window.nfif_noFetchIfTestData2': '/api/fetch-track-analytics',
    'window.nfif_noFetchIfTestData3': '/api/fetch-put-data',
    'window.nfif_noFetchIfTestData4': '/api/fetch-block-implicit',
    'window.nfif_noFetchIfTestData5': '/api/fetch-block-multi',
    'window.nfif_noFetchIfTestData6': '/api/fetch-block6-request',
    'window.nfif_noFetchIfTestData7': '/api/fetch-block7-request',
};

export function verifyNoFetchIf(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const checkMatch = (actualValue) => {
        if (type === 'textBlocked') {
            const path = targetToPath[target];
            const expectedServerResponse = path && noFetchIfMockResponses[path];

            if (typeof actualValue === 'string') {
                if (actualValue.length === 0) return true;
                const isDifferentFromServer =
                    expectedServerResponse &&
                    actualValue !== expectedServerResponse;
                return isDifferentFromServer;
            }
        } else if (type === 'jsonEquals') {
            return JSON.stringify(actualValue) === expected;
        }
        return false;
    };

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            if (checkMatch(actualValue)) {
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (e) {}
        return false;
    };

    runWithPolling(runCheck);
}
