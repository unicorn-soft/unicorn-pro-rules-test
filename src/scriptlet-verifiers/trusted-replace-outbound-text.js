import { verifyTrustedReplaceBase } from './trusted-replace.js';

export function verifyTrustedReplaceOutboundText(
    targetEl,
    verification,
    parentBox
) {
    return verifyTrustedReplaceBase(targetEl, verification, parentBox, {
        logLabel: 'trusted-replace-outbound-text',
    });
}
