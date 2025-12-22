import { runWithRestartablePolling } from './polling.js';
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
        } catch (e) {}
        return false;
    };

    runWithRestartablePolling(runCheck, {
        interval: 100,
        timeout: 10000,
        resetFlagKeys: ['__jpxr9_resetPolling', '__jpfr9_resetPolling'],
        restartListKeys: ['__jpxr9_restartList', '__jpfr9_restartList'],
    });
}
