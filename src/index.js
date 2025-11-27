import './style/global.css';
import './style/index.css';
import { addDomainPrefix } from './util';

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
};

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
                if (c.filter) {
                    rules.push(addDomainPrefix(c.filter));
                } else if (c.scriptlet && c.scriptletParams) {
                    let scriptletRule;
                    if (
                        c.scriptlet === 'trusted-json-edit-fetch-request' ||
                        c.scriptlet === 'trusted-json-edit-xhr-request'
                    ) {
                        if (
                            c.scriptletParams.length > 1 &&
                            c.scriptletParams[1] &&
                            c.scriptletParams[1].startsWith('=')
                        ) {
                            scriptletRule = `scriptlet(${c.scriptlet}, ${c.scriptletParams[0]}${c.scriptletParams[1]})`;
                        } else {
                            scriptletRule = `scriptlet(${c.scriptlet}, ${c.scriptletParams.join(', ')})`;
                        }
                    } else {
                        scriptletRule = `scriptlet(${c.scriptlet}, ${c.scriptletParams.join(', ')})`;
                    }
                    rules.push(addDomainPrefix(scriptletRule));
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
});
