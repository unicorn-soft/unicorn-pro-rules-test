import { verifyTrustedReplaceBase } from './trusted-replace.js';

export function verifyTrustedReplaceNodeText(targetEl, verification, parentBox) {
    return verifyTrustedReplaceBase(targetEl, verification, parentBox, {
        logLabel: 'trusted-replace-node-text',
    });
}
