import { worker } from './mocks/browser';
import './style/global.css';
import './style/test-page.css';
import testCase from './index';
import { createRuleString } from './utils/createRuleString.js';
import { verifyGlobalValue } from './scriptlet-verifiers/global-value-check.js';
import { verifyJsonPrune } from './scriptlet-verifiers/json-prune.js';
import { verifyJsonPruneXhrResponse } from './scriptlet-verifiers/json-prune-xhr-response.js';
import { verifyJsonPruneFetchResponse } from './scriptlet-verifiers/json-prune-fetch-response.js';
import { verifyTrustedReplaceFetchResponse } from './scriptlet-verifiers/trusted-replace-fetch-response.js';
import { verifyTrustedReplaceNodeText } from './scriptlet-verifiers/trusted-replace-node-text.js';
import { verifyTrustedReplaceOutboundText } from './scriptlet-verifiers/trusted-replace-outbound-text.js';
import { verifyNoXhrIf } from './scriptlet-verifiers/no-xhr-if.js';
import { verifyNoFetchIf } from './scriptlet-verifiers/no-fetch-if.js';
import { verifyRemoveNodeText } from './scriptlet-verifiers/remove-node-text.js';
import { verifyTrustedJsonEditFetchRequest } from './scriptlet-verifiers/trusted-json-edit-fetch-request.js';
import { verifyTrustedJsonEditXhrRequest } from './scriptlet-verifiers/trusted-json-edit-xhr-request.js';

async function enableMocking() {
    await worker.start();
}

(function () {
    const type = new URLSearchParams(location.search).get('type');
    const currentCase = testCase[type];
    if (Array.isArray(currentCase) === false) return;

    renderRulesCopy(type, currentCase);

    const buildPage = () => {
        currentCase.forEach((c) => createTestSection(c, type));
    };

    if (type === 'trusted-replace-node-text' || type === 'remove-node-text') {
        buildPage();
        enableMocking();
    } else {
        enableMocking().then(buildPage);
    }

    if (navigator && navigator.clipboard) {
        window.copyId = null;
        document.addEventListener('click', (event) => {
            const el = event.target;
            if (
                el.classList.contains('filter-code') &&
                window.copyId === null
            ) {
                const textToCopy = el.textContent.trim();
                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => {
                        el.textContent = '복사 완료!';
                        window.copyId = setTimeout(() => {
                            el.textContent = textToCopy;
                            window.copyId = null;
                        }, 300);
                    })
                    .catch((err) => {});
            }
        });
    }
})();

function renderRulesCopy(type, currentCase) {
    if (!Array.isArray(currentCase) || currentCase.length === 0) return;

    const rules = [`! type : ${type}`];
    currentCase.forEach((c) => {
        const ruleString = createRuleString(c);
        if (ruleString) rules.push(ruleString);
    });
    const rulesText = rules.join('\n');

    const section = document.createElement('section');
    section.className = 'rules-copy-section';

    const title = document.createElement('h1');
    title.className = 'copy-title';
    title.textContent = `${type} 규칙 복사`;

    const desc = document.createElement('p');
    desc.className = 'copy-desc';
    desc.textContent =
        '이 페이지에 포함된 모든 테스트 규칙을 확인하고 복사할 수 있습니다.';

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = '모두보기';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.textContent = '복사하기';

    buttons.appendChild(toggleButton);
    buttons.appendChild(copyButton);

    const rulesContainer = document.createElement('div');
    rulesContainer.className = 'rules-container';
    const pre = document.createElement('pre');
    pre.textContent = rulesText;
    rulesContainer.appendChild(pre);

    let isOpen = false;
    toggleButton.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            rulesContainer.classList.add('open');
            toggleButton.textContent = '숨기기';
        } else {
            rulesContainer.classList.remove('open');
            toggleButton.textContent = '모두보기';
        }
    });

    if (navigator && navigator.clipboard) {
        copyButton.addEventListener('click', () => {
            const textToCopy = rulesText.trim();
            navigator.clipboard
                .writeText(textToCopy)
                .then(() => {
                    alert('규칙이 복사되었습니다!');
                })
                .catch((err) => {});
        });
    }

    section.appendChild(title);
    section.appendChild(desc);
    section.appendChild(buttons);
    section.appendChild(rulesContainer);

    document.body.insertBefore(section, document.body.firstChild);
}

function createTestSection(
    {
        id,
        title,
        desc,
        target,
        filter,
        checkStyle,
        scriptlet,
        scriptletParams,
        verification,
    },
    pageType
) {
    const section = document.createElement('section');
    section.id = `s_${id}`;

    const divTitle = document.createElement('div');
    divTitle.className = 'title';
    const h1El = document.createElement('h1');
    h1El.textContent = `${id}. ${title}`;
    divTitle.appendChild(h1El);

    if (
        (pageType === 'json-prune-xhr-response' && String(id) === '9') ||
        (pageType === 'json-prune-fetch-response' && String(id) === '9')
    ) {
        const actionBtn = document.createElement('button');
        actionBtn.id =
            pageType === 'json-prune-xhr-response'
                ? 'jpxr_9_btn'
                : 'jpfr_9_btn';
        actionBtn.textContent =
            pageType === 'json-prune-xhr-response'
                ? '/api/data9 요청'
                : '/api/fetch-data9 요청';
        actionBtn.style.marginLeft = 'auto';
        actionBtn.style.fontSize = '12px';
        actionBtn.style.padding = '4px 8px';
        actionBtn.style.cursor = 'pointer';
        divTitle.appendChild(actionBtn);
    }
    if (pageType === 'trusted-replace-fetch-response' && String(id) === '5') {
        const actionBtn = document.createElement('button');
        actionBtn.id = 'trfr_5_btn';
        actionBtn.textContent = '/api/replace-data5 요청';
        actionBtn.style.marginLeft = 'auto';
        actionBtn.style.fontSize = '12px';
        actionBtn.style.padding = '4px 8px';
        actionBtn.style.cursor = 'pointer';
        divTitle.appendChild(actionBtn);
    }
    if (pageType === 'trusted-json-edit-fetch-request' && String(id) === '14') {
        const actionBtn = document.createElement('button');
        actionBtn.id = 'tjefr_14_btn';
        actionBtn.textContent = '/api/edit-request-14 요청';
        actionBtn.style.marginLeft = 'auto';
        actionBtn.style.fontSize = '12px';
        actionBtn.style.padding = '4px 8px';
        actionBtn.style.cursor = 'pointer';
        divTitle.appendChild(actionBtn);
    }
    if (pageType === 'trusted-json-edit-xhr-request' && String(id) === '14') {
        const actionBtn = document.createElement('button');
        actionBtn.id = 'tjexr_14_btn';
        actionBtn.textContent = '/api/edit-xhr-request-14 요청';
        actionBtn.style.marginLeft = 'auto';
        actionBtn.style.fontSize = '12px';
        actionBtn.style.padding = '4px 8px';
        actionBtn.style.cursor = 'pointer';
        divTitle.appendChild(actionBtn);
    }
    section.appendChild(divTitle);

    const pDesc = document.createElement('p');
    pDesc.className = 'description';
    pDesc.innerHTML = desc;
    section.appendChild(pDesc);

    const contentRow = document.createElement('div');
    contentRow.className = 'content-row';

    const targetBox = document.createElement('div');
    targetBox.className = 'box target-box';
    targetBox.textContent = '타겟';

    const targetEl = createCase(target);
    targetBox.appendChild(targetEl);
    contentRow.appendChild(targetBox);

    const exampleBox = document.createElement('div');
    exampleBox.className = 'box content-box';
    exampleBox.textContent = '콘텐츠';
    contentRow.appendChild(exampleBox);

    section.appendChild(contentRow);

    const filtersEl = document.createElement('div');
    filtersEl.className = 'filter';

    const h2Filter = document.createElement('h2');
    h2Filter.textContent = 'Filter';
    filtersEl.appendChild(h2Filter);

    const filterCode = document.createElement('div');
    filterCode.className = 'filter-code';

    filterCode.textContent = createRuleString({
        filter,
        scriptlet,
        scriptletParams,
    });

    filtersEl.appendChild(filterCode);

    section.appendChild(filtersEl);

    document.body.appendChild(section);

    observeTargetDisplay(targetEl, checkStyle, verification, pageType);
}

function createCase(htmlString) {
    const tmp = document.createElement('div');
    if (!htmlString) return tmp;

    tmp.innerHTML = htmlString;
    const node = tmp.childNodes[0];
    if (!node) return tmp;

    const scripts = Array.from(node.querySelectorAll('script'));
    scripts.forEach((script) => {
        try {
            const scriptText = script.textContent;
            script.remove();
            const s = document.createElement('script');
            s.text = scriptText;
            node.appendChild(s);
        } catch (e) {}
    });

    node.classList.add('case');
    return node;
}

function observeTargetDisplay(targetEl, checkStyle, verification, pageType) {
    const parentBox = targetEl.closest('.target-box');
    if (!parentBox) return;

    if (verification) {
        observeScriptletResult(targetEl, verification, parentBox, pageType);
    } else if (checkStyle) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    const targetStyle = getComputedStyle(mutation.target);
                    const result = Object.keys(checkStyle).every(
                        (key) => targetStyle[key] === checkStyle[key]
                    );

                    if (result) parentBox.setAttribute('success', '');
                    else parentBox.removeAttribute('success');
                }
            });
        });

        observer.observe(targetEl, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    } else {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (
                        node.nodeType === 1 &&
                        node.classList.contains('target')
                    )
                        parentBox.setAttribute('success', '');
                });
            });
        });

        observer.observe(parentBox, {
            childList: true,
            subtree: true,
        });
    }
}

function observeScriptletResult(targetEl, verification, parentBox, pageType) {
    const [verificationType] = verification.split(':');

    if (pageType === 'json-prune-xhr-response') {
        if (verificationType === 'jsonEquals') {
            return verifyJsonPruneXhrResponse(
                targetEl,
                verification,
                parentBox
            );
        }

        return;
    }

    if (pageType === 'json-prune-fetch-response') {
        if (verificationType === 'jsonEquals') {
            return verifyJsonPruneFetchResponse(
                targetEl,
                verification,
                parentBox
            );
        }

        return;
    }

    if (pageType === 'trusted-replace-fetch-response') {
        return verifyTrustedReplaceFetchResponse(
            targetEl,
            verification,
            parentBox
        );
    }

    if (pageType === 'trusted-replace-node-text') {
        return verifyTrustedReplaceNodeText(targetEl, verification, parentBox);
    }

    if (pageType === 'trusted-replace-outbound-text') {
        return verifyTrustedReplaceOutboundText(
            targetEl,
            verification,
            parentBox
        );
    }

    if (pageType === 'no-xhr-if') {
        return verifyNoXhrIf(targetEl, verification, parentBox);
    }

    if (pageType === 'no-fetch-if') {
        return verifyNoFetchIf(targetEl, verification, parentBox);
    }

    if (pageType === 'remove-node-text') {
        return verifyRemoveNodeText(targetEl, verification, parentBox);
    }

    if (pageType === 'trusted-json-edit-fetch-request') {
        if (verificationType === 'jsonEquals') {
            return verifyTrustedJsonEditFetchRequest(
                targetEl,
                verification,
                parentBox
            );
        }
        return;
    }

    if (pageType === 'trusted-json-edit-xhr-request') {
        if (verificationType === 'jsonEquals') {
            return verifyTrustedJsonEditXhrRequest(
                targetEl,
                verification,
                parentBox
            );
        }
        return;
    }

    switch (verificationType) {
        case 'jsonEquals':
            return verifyJsonPrune(targetEl, verification, parentBox);
        default:
            return verifyGlobalValue(targetEl, verification, parentBox);
    }
}
