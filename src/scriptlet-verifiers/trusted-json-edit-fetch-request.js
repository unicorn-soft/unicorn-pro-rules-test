import { runWithPolling } from './polling.js';

export function verifyTrustedJsonEditFetchRequest(
    targetEl,
    verification,
    parentBox
) {
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expectedRaw = parts.slice(2).join(':');

    let expected;
    try {
        expected = JSON.parse(expectedRaw);
    } catch (e) {
        expected = expectedRaw;
    }

    const deepEqual = (a, b) => {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (a && b && typeof a === 'object') {
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!deepEqual(a[i], b[i])) return false;
                }
                return true;
            }
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            for (const key of aKeys) {
                if (!deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        return false;
    };

    const check = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            if (type === 'jsonEquals') {
                if (!deepEqual(actualValue, expected)) return false;
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (_) {
            parentBox.removeAttribute('success');
            return false;
        }
        parentBox.removeAttribute('success');
        return false;
    };

    runWithPolling(check);
}
