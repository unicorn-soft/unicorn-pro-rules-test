export function verifyTrustedReplaceOutboundText(
    targetEl,
    verification,
    parentBox
) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const successMessage = parts[parts.length - 1];
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
                default:
                    break;
            }

            if (isMatch) {
                parentBox.setAttribute('success', '');
                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage)
                    statusEl.textContent = successMessage;
                return true;
            }
        } catch (e) {}
        return false;
    };

    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        if (runCheck()) clearInterval(checkInterval);
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 10000);
}
