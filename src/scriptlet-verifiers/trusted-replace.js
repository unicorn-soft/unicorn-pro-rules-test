import { runWithRestartablePolling } from './polling.js';
import { createOnceLogger } from './logger.js';

export function verifyTrustedReplaceBase(
    targetEl,
    verification,
    parentBox,
    { logLabel = 'trusted-replace' } = {}
) {
    const logger = createOnceLogger(`[${logLabel}]`);
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            logger.logInitial(actualValue);

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
                logger.logSuccess(actualValue);
                parentBox.setAttribute('success', '');
                return true;
            }
            parentBox.removeAttribute('success');
        } catch (e) {}
        parentBox.removeAttribute('success');
        return false;
    };

    runWithRestartablePolling(runCheck, {
        resetFlagKeys: ['__trfr_resetPolling'],
        restartListKeys: ['__trfr_restartList'],
    });
}
