// 각 테스트 케이스별 예상 서버 응답 (규칙이 없을 때 반환되는 값)
const expectedServerResponses = {
    'window.noXhrIfTestData1': 'original-response-block1',
    'window.noXhrIfTestData2': 'original-response-track',
    'window.noXhrIfTestData3': 'original-response-post'
};

export function verifyNoXhrIf(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const successMessage = parts[parts.length - 1];
    const expected = parts.slice(2, -1).join(':');

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl) {
            jsonResultEl.textContent = typeof actualValue === 'object' && actualValue !== null
                ? JSON.stringify(actualValue, null, 2)
                : (actualValue || '');
        }
    };

    const checkMatch = (actualValue) => {
        if (type === 'textBlocked') {
            if (typeof actualValue === 'string' && actualValue.length > 0) {
                const expectedServerResponse = expectedServerResponses[target];
                const isRandomString = /^[a-z0-9]{10,}$/i.test(actualValue);
                const isDifferentFromServer = expectedServerResponse && actualValue !== expectedServerResponse;
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
                parentBox.setAttribute("success", "");
                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) statusEl.textContent = successMessage;
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
                parentBox.setAttribute("success", "");
                clearInterval(checkInterval);
                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) statusEl.textContent = successMessage;
            }
        } catch (e) {}
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 10000);
}

