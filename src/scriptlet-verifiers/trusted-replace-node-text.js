import { verifyTrustedReplaceBase } from './trusted-replace.js';

export function verifyTrustedReplaceNodeText(
    targetEl,
    verification,
    parentBox
) {
    const qaEl = targetEl?.querySelector?.('#rpnt_9_el');
    if (qaEl && typeof window.rpnt_9_flag === 'undefined') {
        const childId = 'rpnt_9_child';
        const update = () => {
            const child = qaEl.querySelector?.(`#${childId}`);
            window.rpnt_9_flag = child ? child.textContent : qaEl.textContent;
        };
        update();

        const mo = new MutationObserver(() => update());
        mo.observe(qaEl, { characterData: true, subtree: true, childList: true });

        const onDcl = () => {
            setTimeout(() => {
                const child = document.createElement('div');
                child.id = childId;
                child.textContent = 'RPNT_QA_TXT';
                qaEl.appendChild(child);
            }, 50);

            setTimeout(() => {
                update();
                mo.disconnect();
            }, 600);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDcl, { once: true });
        } else {
            onDcl();
        }
    }

    return verifyTrustedReplaceBase(targetEl, verification, parentBox, {
        logLabel: 'trusted-replace-node-text',
    });
}
