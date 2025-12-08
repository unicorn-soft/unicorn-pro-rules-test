export function verifyJsonPrune(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const updateUI = (actualValue) => {
        if (actualValue !== undefined) {
            console.log('[json-prune] value:', actualValue);
        }
    };

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) {
                return false;
            }

            updateUI(actualValue);

            const isMatch =
                type === 'jsonEquals' &&
                JSON.stringify(actualValue) === expected;

            if (isMatch) {
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (e) {}
        return false;
    };

    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        if (runCheck()) clearInterval(checkInterval);
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}
