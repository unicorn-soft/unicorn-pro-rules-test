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

const DOMAIN_EXCLUSION_TYPE = 'domain-exclusion';
const DOMAIN_EXCLUSION_RESULT_MESSAGE = 'domain-exclusion-frame-result';
const DOMAIN_EXCLUSION_CURRENT_HOST_KEY = '{hostname}';
const DOMAIN_EXCLUSION_SYNOLOGY_HOST = 'unicornsoft.synology.me';

async function enableMocking() {
    // GitHub Pages(project pages)는 보통 /<repo>/ 경로에서 서비스됨.
    // MSW 기본값은 /mockServiceWorker.js 를 찾기 때문에, 현재 페이지 기준으로 url/scope를 명시한다.
    const serviceWorkerUrl = new URL(
        'mockServiceWorker.js',
        window.location.href
    ).pathname;
    const serviceWorkerScope = new URL('./', window.location.href).pathname;

    await worker.start({
        serviceWorker: {
            url: serviceWorkerUrl,
            options: {
                scope: serviceWorkerScope,
            },
        },
    });
}

(function () {
    const type = new URLSearchParams(location.search).get('type');
    const currentCase = testCase[type];
    if (Array.isArray(currentCase) === false) return;

    renderRulesCopy(type, currentCase);

    if (type === DOMAIN_EXCLUSION_TYPE) {
        renderDomainExclusionPage(currentCase);
        return;
    }

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

function renderDomainExclusionPage(cases) {
    const hosts = getDomainExclusionHosts();
    const state = hosts.reduce((acc, host) => {
        acc[host.hostname] = {};
        return acc;
    }, {});

    window.addEventListener('message', (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type !== DOMAIN_EXCLUSION_RESULT_MESSAGE) return;
        if (!state[data.host] || !Array.isArray(data.results)) return;

        data.results.forEach((result) => {
            state[data.host][String(result.id)] = result.hidden;
        });
        updateDomainExclusionResults(cases, hosts, state);
    });

    cases.forEach((item) => createDomainExclusionSection(item, hosts));
    createDomainExclusionFrames(hosts);
}

function getDomainExclusionHosts() {
    return [
        {
            key: DOMAIN_EXCLUSION_CURRENT_HOST_KEY,
            hostname: window.location.hostname,
            label: '현재 페이지',
            frameUrl: new URL(
                'domain-exclusion-frame.html',
                window.location.href
            ).href,
        },
        {
            key: DOMAIN_EXCLUSION_SYNOLOGY_HOST,
            hostname: DOMAIN_EXCLUSION_SYNOLOGY_HOST,
            label: 'Synology',
            frameUrl: `https://${DOMAIN_EXCLUSION_SYNOLOGY_HOST}/qa/domain-exclusion-frame.html`,
        },
    ];
}

function createDomainExclusionSection(item, hosts) {
    const section = document.createElement('section');
    section.id = `s_${item.id}`;
    section.className = 'domain-exclusion-section';

    const divTitle = document.createElement('div');
    divTitle.className = 'title';

    const h1El = document.createElement('h1');
    h1El.textContent = `${item.id}. ${item.title}`;
    divTitle.appendChild(h1El);

    const status = document.createElement('span');
    status.className = 'domain-case-status';
    status.dataset.status = 'pending';
    status.textContent = '대기';
    divTitle.appendChild(status);

    section.appendChild(divTitle);

    const pDesc = document.createElement('p');
    pDesc.className = 'description';
    pDesc.innerHTML = item.desc;
    section.appendChild(pDesc);

    const resultRow = document.createElement('div');
    resultRow.className = 'domain-result-row';
    hosts.forEach((host) => {
        resultRow.appendChild(createDomainResultCard(item, host));
    });
    section.appendChild(resultRow);

    const filtersEl = document.createElement('div');
    filtersEl.className = 'filter';

    const h2Filter = document.createElement('h2');
    h2Filter.textContent = 'Filter';
    filtersEl.appendChild(h2Filter);

    const filterCode = document.createElement('div');
    filterCode.className = 'filter-code';
    filterCode.textContent = createRuleString(item);
    filtersEl.appendChild(filterCode);

    section.appendChild(filtersEl);
    document.body.appendChild(section);
}

function createDomainResultCard(item, host) {
    const card = document.createElement('div');
    card.className = 'domain-result-card';
    card.dataset.caseId = String(item.id);
    card.dataset.host = host.hostname;
    card.dataset.status = 'pending';

    const hostTitle = document.createElement('h2');
    hostTitle.className = 'domain-result-host';
    hostTitle.textContent = host.label;
    card.appendChild(hostTitle);

    const expected = document.createElement('p');
    expected.className = 'domain-result-expected';
    expected.textContent = `기대: ${formatDomainResult(
        getDomainExclusionExpectedHidden(item, host)
    )}`;
    card.appendChild(expected);

    const actual = document.createElement('p');
    actual.className = 'domain-result-actual';
    actual.textContent = '결과: 대기';
    card.appendChild(actual);

    const status = document.createElement('p');
    status.className = 'domain-result-status';
    status.textContent = '대기';
    card.appendChild(status);

    return card;
}

function createDomainExclusionFrames(hosts) {
    const container = document.createElement('div');
    container.className = 'domain-frame-container';

    hosts.forEach((host) => {
        const iframe = document.createElement('iframe');
        iframe.className = 'domain-exclusion-frame';
        iframe.title = `${host.label} 도메인 제외 테스트 프레임`;
        iframe.src = host.frameUrl;
        container.appendChild(iframe);
    });

    document.body.appendChild(container);
}

function updateDomainExclusionResults(cases, hosts, state) {
    cases.forEach((item) => {
        const hostResults = hosts.map((host) => {
            const hidden = state[host.hostname][String(item.id)];
            const expectedHidden = getDomainExclusionExpectedHidden(item, host);
            return {
                host,
                hidden,
                expectedHidden,
                completed: hidden !== undefined,
                passed: hidden === expectedHidden,
            };
        });

        hostResults.forEach(({ host, hidden, passed, completed }) => {
            const card = document.querySelector(
                `.domain-result-card[data-case-id="${item.id}"][data-host="${host.hostname}"]`
            );
            if (!card) return;

            const actual = card.querySelector('.domain-result-actual');
            const status = card.querySelector('.domain-result-status');

            if (!completed) {
                card.dataset.status = 'pending';
                actual.textContent = '결과: 대기';
                status.textContent = '대기';
                return;
            }

            card.dataset.status = passed ? 'success' : 'failure';
            actual.textContent = `결과: ${formatDomainResult(hidden)}`;
            status.textContent = passed ? '성공' : '실패';
        });

        const sectionStatus = document.querySelector(
            `#s_${item.id} .domain-case-status`
        );
        if (!sectionStatus) return;

        const isCompleted = hostResults.every((result) => result.completed);
        const isPassed = hostResults.every((result) => result.passed);

        if (!isCompleted) {
            sectionStatus.dataset.status = 'pending';
            sectionStatus.textContent = '대기';
        } else {
            sectionStatus.dataset.status = isPassed ? 'success' : 'failure';
            sectionStatus.textContent = isPassed ? '성공' : '실패';
        }
    });
}

function getDomainExclusionExpectedHidden(item, host) {
    return item.expectedHidden[host.key];
}

function formatDomainResult(hidden) {
    if (hidden === true) return '차단됨';
    if (hidden === false) return '차단 안 됨';
    return '확인 불가';
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
        domainPrefix,
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
        domainPrefix,
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
