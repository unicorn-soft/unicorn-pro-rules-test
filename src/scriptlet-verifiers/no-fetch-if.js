import { noFetchIfMockResponses } from '../mocks/handlers.js';

const targetToPath = {
    'window.nfif_noFetchIfTestData1': '/api/fetch-block1',
    'window.nfif_noFetchIfTestData2': '/api/fetch-track-analytics',
    'window.nfif_noFetchIfTestData3': '/api/fetch-post-data',
    'window.nfif_noFetchIfTestData4': '/api/fetch-block-implicit',
    'window.nfif_noFetchIfTestData5': '/api/fetch-block-multi',
};

export function verifyNoFetchIf(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl) {
            jsonResultEl.textContent =
                typeof actualValue === 'object' && actualValue !== null
                    ? JSON.stringify(actualValue, null, 2)
                    : actualValue || '';
        }
    };

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

            updateUI(actualValue);
            if (checkMatch(actualValue)) {
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (e) {}
        return false;
    };

    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return;

            updateUI(actualValue);
            if (checkMatch(actualValue)) {
                parentBox.setAttribute('success', '');
                clearInterval(checkInterval);
            }
        } catch (e) {}
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 10000);
}
