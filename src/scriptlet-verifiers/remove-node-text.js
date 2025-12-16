import { runWithPolling } from './polling.js';

export function verifyRemoveNodeText(targetEl, verification, parentBox) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl && actualValue !== undefined && actualValue !== null) {
            jsonResultEl.textContent = String(actualValue);
        }
    };

    const checkMatch = (actualValue) => {
        if (type === 'textEquals') {
            return String(actualValue) === expected;
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

    runWithPolling(runCheck);
}
