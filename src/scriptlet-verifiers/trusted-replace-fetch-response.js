import { verifyTrustedReplaceBase } from './trusted-replace.js';

export function verifyTrustedReplaceFetchResponse(
    targetEl,
    verification,
    parentBox
) {
    return verifyTrustedReplaceBase(targetEl, verification, parentBox, {
        logLabel: 'trusted-replace-fetch-response',
    });
}
