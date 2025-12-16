import { runWithPolling } from './polling.js';
import { createOnceLogger } from './logger.js';

export function verifyJsonPrune(targetEl, verification, parentBox) {
    const logger = createOnceLogger('[json-prune]');
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) {
                return false;
            }

            logger.logInitial(actualValue);

            const isMatch =
                type === 'jsonEquals' &&
                JSON.stringify(actualValue) === expected;

            if (isMatch) {
                logger.logSuccess(actualValue);
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (e) { }
        return false;
    };

    const startPolling = () => {
        runWithPolling(runCheck, { interval: 100, timeout: 10000 });
    };

    startPolling();

    window.__jpxr9_restartList = window.__jpxr9_restartList || [];
    window.__jpfr9_restartList = window.__jpfr9_restartList || [];
    window.__jpxr9_restartList.push(startPolling);
    window.__jpfr9_restartList.push(startPolling);

    const resetFlagKeys = ['__jpxr9_resetPolling', '__jpfr9_resetPolling'];
    const flagChecker = setInterval(() => {
        const hasReset = resetFlagKeys.some((key) => window[key]);
        if (hasReset) {
            resetFlagKeys.forEach((key) => {
                if (window[key]) window[key] = false;
            });
            startPolling();
        }
    }, 200);
}
