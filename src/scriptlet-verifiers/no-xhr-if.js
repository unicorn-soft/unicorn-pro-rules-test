import { noXhrIfMockResponses } from '../mocks/handlers.js';
import { runWithPolling } from './polling.js';

const targetToPath = {
    'window.nxif_noXhrIfTestData1': '/api/block1',
    'window.nxif_noXhrIfTestData2': '/api/track-analytics',
    'window.nxif_noXhrIfTestData3': '/api/post-data',
    'window.nxif_noXhrIfTestData4': '/api/block4',
    'window.nxif_noXhrIfTestData5': '/api/block-implicit',
    'window.nxif_noXhrIfTestData6': '/api/block-json',
    'window.nxif_noXhrIfTestData7': '/api/block-buffer',
    'window.nxif_noXhrIfTestData8': '/api/block-blob',
    'window.nxif_noXhrIfTestData9': '/api/block-doc',
    'window.nxif_noXhrIfTestData10': '/api/block-multi',
    'window.nxif_noXhrIfTestData11': '/api/block-rand',
    'window.nxif_noXhrIfTestData12': '/api/block-method-rand',
};

export function verifyNoXhrIf(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const checkMatch = (actualValue) => {
        if (type === 'textBlocked') {
            const path = targetToPath[target];
            const expectedServerResponse = path && noXhrIfMockResponses[path];

            if (typeof actualValue === 'string') {
                if (actualValue.length === 0) return true;
                const isRandomString = /^[a-z0-9]{1,10}$/i.test(actualValue);
                const isDifferentFromServer =
                    expectedServerResponse &&
                    actualValue !== expectedServerResponse;
                return isDifferentFromServer && isRandomString;
            }

            if (
                actualValue &&
                typeof actualValue === 'object' &&
                !Array.isArray(actualValue) &&
                !(actualValue instanceof ArrayBuffer) &&
                !(actualValue instanceof Blob) &&
                !(actualValue instanceof Document)
            ) {
                return Object.keys(actualValue).length === 0;
            }

            if (
                typeof ArrayBuffer !== 'undefined' &&
                actualValue instanceof ArrayBuffer
            ) {
                return actualValue.byteLength === 0;
            }

            if (typeof Blob !== 'undefined' && actualValue instanceof Blob) {
                return actualValue.size === 0;
            }

            if (
                typeof Document !== 'undefined' &&
                actualValue instanceof Document
            ) {
                const text =
                    actualValue.body && actualValue.body.textContent
                        ? actualValue.body.textContent.trim()
                        : '';
                return text.length === 0;
            }
        } else if (type === 'surrogateLoaded') {
            const path = targetToPath[target];
            const expectedServerResponse = path && noXhrIfMockResponses[path];

            if (typeof actualValue === 'string') {
                return (
                    actualValue.length > 0 &&
                    expectedServerResponse &&
                    actualValue !== expectedServerResponse
                );
            }

            if (
                actualValue &&
                typeof actualValue === 'object' &&
                !Array.isArray(actualValue) &&
                !(actualValue instanceof ArrayBuffer) &&
                !(actualValue instanceof Blob) &&
                !(actualValue instanceof Document)
            ) {
                return (
                    Object.keys(actualValue).length > 0 &&
                    expectedServerResponse &&
                    JSON.stringify(actualValue) !==
                        JSON.stringify(expectedServerResponse)
                );
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
