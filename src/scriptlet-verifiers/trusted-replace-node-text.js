export function verifyTrustedReplaceNodeText(
    targetEl,
    verification,
    parentBox
) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2, -1).join(':');

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl && actualValue !== undefined && actualValue !== null) {
            jsonResultEl.textContent = String(actualValue);
        }
    };

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            updateUI(actualValue);

            let isMatch = false;
            switch (type) {
                case 'textEquals':
                    isMatch = String(actualValue) === expected;
                    break;
                case 'textContains':
                    isMatch = String(actualValue).includes(expected);
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
            if (actualValue === null || actualValue === undefined) return;

            updateUI(actualValue);

            let isMatch = false;
            switch (type) {
                case 'textEquals':
                    isMatch = String(actualValue) === expected;
                    break;
                case 'textContains':
                    isMatch = String(actualValue).includes(expected);
                    break;
                default:
            }

            if (isMatch) {
                parentBox.setAttribute('success', '');
                clearInterval(checkInterval);
                
            }
        } catch (e) {}
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 10000);
}
