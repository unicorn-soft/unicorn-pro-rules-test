const expectedServerResponses = {
    'window.nfif_noFetchIfTestData1': 'original-response-fetch-block1',
    'window.nfif_noFetchIfTestData2': 'original-response-fetch-track',
    'window.nfif_noFetchIfTestData3': 'original-response-fetch-post',
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
            if (typeof actualValue === 'string' && actualValue.length > 0) {
                const expectedServerResponse = expectedServerResponses[target];
                const isRandomString = /^[a-z0-9]{1,}$/i.test(actualValue);
                const isDifferentFromServer =
                    expectedServerResponse &&
                    actualValue !== expectedServerResponse;
                return isDifferentFromServer && isRandomString;
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
