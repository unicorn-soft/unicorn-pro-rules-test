export function verifySetConstant(targetEl, verification, parentBox) {
    const [type, target, expected, successMessage] = verification.split(':');

    const checkInterval = setInterval(() => {
        try {
            const actualValue = eval(target);
            let isMatch = false;

            switch (type) {
                case 'equals':
                    let expectedValue = expected;
                    if (expected === 'undefined') expectedValue = undefined;
                    else if (expected === 'true') expectedValue = true;
                    else if (expected === 'false') expectedValue = false;
                    else if (expected === 'null') expectedValue = null;
                    else if (expected === '') expectedValue = '';
                    else if (!isNaN(expected)) expectedValue = Number(expected);

                    isMatch = actualValue === expectedValue;
                    break;

                case 'functionCall':
                    if (typeof actualValue === 'function') {
                        const result = actualValue();
                        let expectedResult = expected;
                        if (expected === 'undefined')
                            expectedResult = undefined;
                        else if (expected === 'true') expectedResult = true;
                        else if (expected === 'false') expectedResult = false;

                        isMatch = result === expectedResult;
                    }
                    break;

                case 'arrayEmpty':
                    isMatch =
                        Array.isArray(actualValue) && actualValue.length === 0;
                    break;

                case 'objectEmpty':
                    isMatch =
                        typeof actualValue === 'object' &&
                        actualValue !== null &&
                        !Array.isArray(actualValue) &&
                        Object.keys(actualValue).length === 0;
                    break;

                default:
            }

            if (isMatch) {
                parentBox.setAttribute('success', '');
                clearInterval(checkInterval);

                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) {
                    statusEl.textContent = successMessage;
                }
            }
        } catch (e) {}
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}
