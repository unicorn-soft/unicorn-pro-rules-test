import './style/global.css';
import './style/index.css';
import { createRuleString } from './utils/createRuleString.js';

import basicCases from './filter/extend-css/basic.json';
import styleCases from './filter/extend-css/style.json';
import removeCases from './filter/extend-css/remove.json';

import setConstantCases from './filter/scriptlet/set-constant.json';
import jsonPruneCases from './filter/scriptlet/json-prune.json';
import jsonPruneXhrCases from './filter/scriptlet/json-prune-xhr-response.json';
import jsonPruneFetchCases from './filter/scriptlet/json-prune-fetch-response.json';
import trustedReplaceFetchCases from './filter/scriptlet/trusted-replace-fetch-response.json';
import trustedReplaceNodeCases from './filter/scriptlet/trusted-replace-node-text.json';
import trustedReplaceOutboundCases from './filter/scriptlet/trusted-replace-outbound-text.json';
import abortScriptCases from './filter/scriptlet/abort-current-inline-script.json';
import noXhrCases from './filter/scriptlet/no-xhr-if.json';
import noFetchCases from './filter/scriptlet/no-fetch-if.json';
import removeNodeTextCases from './filter/scriptlet/remove-node-text.json';
import trustedJsonEditFetchRequestCases from './filter/scriptlet/trusted-json-edit-fetch-request.json';
import trustedJsonEditXhrRequestCases from './filter/scriptlet/trusted-json-edit-xhr-request.json';
import setCookieCases from './filter/scriptlet/set-cookie.json';
import trustedSetCookieCases from './filter/scriptlet/trusted-set-cookie.json';
import setLocalStorageItemCases from './filter/scriptlet/set-local-storage-item.json';
import trustedSetLocalStorageItemCases from './filter/scriptlet/trusted-set-local-storage-item.json';

const testCase = {
    basic: basicCases,
    style: styleCases,
    remove: removeCases,

    'set-constant': setConstantCases,
    'json-prune': jsonPruneCases,
    'json-prune-xhr-response': jsonPruneXhrCases,
    'json-prune-fetch-response': jsonPruneFetchCases,
    'trusted-replace-fetch-response': trustedReplaceFetchCases,
    'trusted-replace-node-text': trustedReplaceNodeCases,
    'trusted-replace-outbound-text': trustedReplaceOutboundCases,
    'abort-current-inline-script': abortScriptCases,
    'no-xhr-if': noXhrCases,
    'no-fetch-if': noFetchCases,
    'remove-node-text': removeNodeTextCases,
    'trusted-json-edit-fetch-request': trustedJsonEditFetchRequestCases,
    'trusted-json-edit-xhr-request': trustedJsonEditXhrRequestCases,
    'set-cookie': setCookieCases,
    'trusted-set-cookie': trustedSetCookieCases,
    'set-local-storage-item': setLocalStorageItemCases,
    'trusted-set-local-storage-item': trustedSetLocalStorageItemCases,
};

const STORAGE_COOKIE_TYPES = new Set([
    'set-cookie',
    'trusted-set-cookie',
    'set-local-storage-item',
    'trusted-set-local-storage-item',
]);

function entryStorageKey(type) {
    return `scriptlet-test-entry:${type}`;
}

function deleteCookie(name) {
    const secure = window.isSecureContext ? '; Secure' : '';
    const domains = ['', `; Domain=${location.hostname}`];

    domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain}${secure}`;
    });
}

function prepareStorageCookieTests(type) {
    if (!STORAGE_COOKIE_TYPES.has(type)) return;

    const isCookie = type.includes('cookie');
    const secure =
        type === 'trusted-set-cookie' && window.isSecureContext
            ? '; Secure'
            : '';

    testCase[type].forEach(({ setup = {} }) => {
        Object.entries(setup).forEach(([name, value]) => {
            if (isCookie) {
                deleteCookie(name);
                if (value !== null) {
                    document.cookie = `${name}=${value}; Path=/${secure}`;
                }
                return;
            }

            if (value === null) localStorage.removeItem(name);
            else localStorage.setItem(name, value);
        });
    });

    sessionStorage.setItem(
        entryStorageKey(type),
        JSON.stringify({ type, startedAt: Date.now() })
    );
}

export default testCase;

document.addEventListener('DOMContentLoaded', () => {
    const rulesText = document.getElementById('rulesText');
    const toggleButton = document.getElementById('toggleButton');
    const copyButton = document.getElementById('copyButton');
    const rulesContainer = document.getElementById('rulesContainer');

    if (rulesText && toggleButton && copyButton && rulesContainer) {
        const caseKeys = Object.keys(testCase);
        const rules = [];
        caseKeys.forEach((key) => {
            rules.push(`! type : ${key}`);
            testCase[key].forEach((c) => {
                const ruleString = createRuleString(c);
                if (ruleString) {
                    rules.push(ruleString);
                }
            });
        });
        rulesText.textContent = rules.join('\n');

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
                const textToCopy = rulesText.textContent.trim();
                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => {
                        alert('규칙이 복사되었습니다!');
                    })
                    .catch((err) => {});
            });
        }
    }

    document
        .querySelectorAll('.scriptlet-buttons .button-link')
        .forEach((link) => {
            const url = new URL(link.href);
            const type = url.searchParams.get('type');
            if (!STORAGE_COOKIE_TYPES.has(type)) return;

            link.addEventListener('click', () => {
                prepareStorageCookieTests(type);
            });
        });
});
