import { runWithPolling } from './polling.js';

export function verifyRemoveNodeText(targetEl, verification, parentBox) {
    const qaEl = targetEl?.querySelector?.('#rnt_7_el');
    if (qaEl && typeof window.removeNodeTextData7 === 'undefined') {
        const childId = 'rnt_7_child';
        const update = () => {
            const child = qaEl.querySelector?.(`#${childId}`);
            window.removeNodeTextData7 = child
                ? child.textContent
                : qaEl.textContent;
        };
        update();

        const mo = new MutationObserver(() => update());
        mo.observe(qaEl, {
            characterData: true,
            subtree: true,
            childList: true,
        });

        const onDcl = () => {
            setTimeout(() => {
                const child = qaEl.querySelector?.(`#${childId}`);
                if (child) child.remove();
                const newChild = document.createElement('div');
                newChild.id = childId;
                newChild.textContent = 'rnt_Later7 arrived';
                qaEl.appendChild(newChild);
            }, 50);

            setTimeout(() => {
                update();
                mo.disconnect();
            }, 600);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDcl, {
                once: true,
            });
        } else {
            onDcl();
        }
    }

    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const expected = parts.slice(2).join(':');

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

            if (checkMatch(actualValue)) {
                parentBox.setAttribute('success', '');

                return true;
            }
        } catch (e) {}
        try {
            parentBox.removeAttribute('success');
        } catch (e) {}
        return false;
    };

    runWithPolling(runCheck);
}
