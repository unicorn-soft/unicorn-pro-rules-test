import { runWithPolling } from './polling.js';

export function verifyRemoveNodeText(targetEl, verification, parentBox) {
    const qaEl = targetEl?.querySelector?.('#rnt_9_el');
    if (qaEl && typeof window.rnt_9 === 'undefined') {
        window.rnt_9 = null; // 초기값 null - 600ms 후 실제 값 설정
        const childId = 'rnt_9_child';
        const update = () => {
            const child = qaEl.querySelector?.(`#${childId}`);
            window.rnt_9 = child
                ? child.textContent
                : qaEl.textContent;
        };

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
                newChild.textContent = 'rnt_Later9 arrived';
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
        if (type === 'equals') {
            let expectedValue = expected;
            if (expected === 'undefined') expectedValue = undefined;
            else if (expected === 'null') expectedValue = null;
            else if (expected === 'true') expectedValue = true;
            else if (expected === 'false') expectedValue = false;
            else if (expected === '') expectedValue = '';
            else if (!isNaN(expected)) expectedValue = Number(expected);
            return actualValue === expectedValue;
        }
        return false;
    };

    const runCheck = () => {
        try {
            const actualValue = eval(target);
            
            // equals 타입에서 undefined 체크
            if (type === 'equals' && expected === 'undefined') {
                if (actualValue === undefined) {
                    parentBox.setAttribute('success', '');
                    return true;
                }
                parentBox.removeAttribute('success');
                return false;
            }
            
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
