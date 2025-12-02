const mockResponses = {
    '/api/data1': { ads1: 123, content1: 'test', tracking1: 'seoul' },
    '/api/data2': { ads2: 1, tracking2: { banner2: 'seoul', popup2: 'kr' } },
    '/api/data3': { ads3: 1, tracking3: { banner3: 'seoul', popup3: 'kr' } },
    '/api/data4': [
        { ads4: 1, tracking4: 'seoul' },
        { ads4: 2, tracking4: 'busan' },
    ],
    '/api/data5': {
        tracking5: {
            video5: { ads5: 1, content5: '집' },
            display5: { ads5: 2, content5: '회사' },
        },
    },
    '/api/data6': { ads6: 123, content6: 'test', tracking6: 'seoul' },
};

export function verifyJsonPruneXhrResponse(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl && actualValue) {
            jsonResultEl.textContent = JSON.stringify(actualValue, null, 2);
        }
    };

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) {
                return false;
            }

            updateUI(actualValue);

            let isMatch = false;

            switch (type) {
                case 'jsonEquals':
                    const actualStr = JSON.stringify(actualValue);
                    isMatch = actualStr === expected;

                    break;

                default:
            }

            if (isMatch) {
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
            if (actualValue === null || actualValue === undefined) {
                return;
            }

            updateUI(actualValue);

            let isMatch = false;

            switch (type) {
                case 'jsonEquals':
                    const actualStr = JSON.stringify(actualValue);
                    isMatch = actualStr === expected;

                    break;

                default:
            }

            if (isMatch) {
                parentBox.setAttribute('success', '');
                clearInterval(checkInterval);
            }
        } catch (e) {}
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}
