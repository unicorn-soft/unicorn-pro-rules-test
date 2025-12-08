export function verifyTrustedReplaceBase(
    targetEl,
    verification,
    parentBox,
    { logLabel = 'trusted-replace' } = {}
) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            if (actualValue !== undefined) {
                console.log(`[${logLabel}] value:`, actualValue);
            }

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
        if (runCheck()) clearInterval(checkInterval);
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 10000);
}
