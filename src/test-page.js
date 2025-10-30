import "./style/global.css";
import "./style/test-page.css";
import testCase from "./index"
import { addDomainPrefix } from "./util";
import { verifySetConstant } from "./scriptlet-verifiers/set-constant.js";
import { verifyJsonPrune } from "./scriptlet-verifiers/json-prune.js";
import { verifyJsonPruneXhrResponse, setupXhrMock } from "./scriptlet-verifiers/json-prune-xhr-response.js";
import { verifyJsonPruneFetchResponse, setupFetchMock } from "./scriptlet-verifiers/json-prune-fetch-response.js";
import { verifyTrustedReplaceFetchResponse, setupReplaceFetchMock } from "./scriptlet-verifiers/trusted-replace-fetch-response.js";

;(function () {
    const type = new URLSearchParams(location.search).get('type')
    const currentCase = testCase[type];
    if (Array.isArray(currentCase) === false) return

    // json-prune-xhr-response인 경우 xhr-mock을 먼저 설정
    if (type === 'json-prune-xhr-response') {
        setupXhrMock();
    }
    
    // json-prune-fetch-response인 경우 fetch-mock을 먼저 설정
    if (type === 'json-prune-fetch-response') {
        setupFetchMock();
    }

    // trusted-replace-fetch-response인 경우 replace-fetch-mock을 먼저 설정
    if (type === 'trusted-replace-fetch-response') {
        setupReplaceFetchMock();
    }

    currentCase.forEach((c) => createTestSection(c, type));
    if (navigator && navigator.clipboard) {
        window.copyId = null;
        document.addEventListener("click", (event) => {
            const el = event.target;
            if (
                el.classList.contains("filter-code") &&
                window.copyId === null
            ) {
                const textToCopy = el.textContent.trim();
                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => {
                        el.textContent = "복사 완료!";
                        window.copyId = setTimeout(() => {
                            el.textContent = textToCopy;
                            window.copyId = null;
                        }, 300);
                    })
                    .catch((err) => {
                        // 복사 실패
                    });
            }
        });
    }
})()

function createTestSection({ id, title, desc, target, filter, checkStyle, scriptlet, scriptletParams, verification }, pageType) {
    const section = document.createElement("section");
    section.id = `s_${id}`;

    const divTitle = document.createElement("div");
    divTitle.className = "title";
    const h1El = document.createElement("h1");
    h1El.textContent = `${id}. ${title}`;
    divTitle.appendChild(h1El);
    section.appendChild(divTitle);

    const pDesc = document.createElement("p");
    pDesc.className = "description";
    pDesc.innerHTML = desc;
    section.appendChild(pDesc);

    const contentRow = document.createElement("div");
    contentRow.className = "content-row";

    const targetBox = document.createElement("div");
    targetBox.className = "box target-box";
    targetBox.textContent = "타겟";

    const targetEl = createCase(target);
    targetBox.appendChild(targetEl);
    contentRow.appendChild(targetBox);

    const exampleBox = document.createElement("div");
    exampleBox.className = "box content-box";
    exampleBox.textContent = "콘텐츠";
    contentRow.appendChild(exampleBox);

    section.appendChild(contentRow);

    const filtersEl = document.createElement("div");
    filtersEl.className = "filter";

    const h2Filter = document.createElement("h2");
    h2Filter.textContent = "Filter";
    filtersEl.appendChild(h2Filter);

    const filterCode = document.createElement("div");
    filterCode.className = "filter-code";
    
    // 확장CSS 또는 스크립트릿 규칙 생성
    if (filter) {
        // 확장CSS 케이스
        filterCode.textContent = addDomainPrefix(filter);
    } else if (scriptlet && scriptletParams) {
        // 스크립트릿 케이스
        const scriptletRule = `##+js(${scriptlet}, ${scriptletParams.join(', ')})`;
        filterCode.textContent = window.location.hostname + scriptletRule;
    }
    
    filtersEl.appendChild(filterCode);

    section.appendChild(filtersEl);

    document.body.appendChild(section);

    observeTargetDisplay(targetEl, checkStyle, verification, pageType);
}

function createCase(htmlString) {
    const tmp = document.createElement("div");
    if (!htmlString) return tmp;

    tmp.innerHTML = htmlString;
    const node = tmp.childNodes[0];
    if (!node) return tmp;

    // HTML 내의 script 태그들을 실행
    const scripts = node.querySelectorAll('script');
    scripts.forEach(script => {
        try {
            eval(script.textContent);
        } catch (e) {
            // Script execution failed
        }
    });

    node.classList.add("case");
    return node.cloneNode(true);
}

function observeTargetDisplay(targetEl, checkStyle, verification, pageType) {
    const parentBox = targetEl.closest(".target-box");
    if (!parentBox) return;

    if (verification) {
        // 스크립트릿 검증
        observeScriptletResult(targetEl, verification, parentBox, pageType);
    } else if (checkStyle) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes"
                ) {
                    const targetStyle = getComputedStyle(mutation.target);
                    const result = Object.keys(checkStyle).every(
                        (key) => targetStyle[key] === checkStyle[key]
                    );

                    if (result) parentBox.setAttribute("success", "");
                    else parentBox.removeAttribute("success");
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
                    if (node.nodeType === 1 && node.classList.contains("target"))
                        parentBox.setAttribute("success", "");
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
    
    // 페이지 타입별 검증 함수 매핑
    if (pageType === 'json-prune-xhr-response') {
        if (verificationType === 'jsonEquals') {
            return verifyJsonPruneXhrResponse(targetEl, verification, parentBox);
        }
        // json-prune-xhr-response 페이지에서는 다른 검증 타입은 지원하지 않음
        return;
    }
    
    if (pageType === 'json-prune-fetch-response') {
        if (verificationType === 'jsonEquals') {
            return verifyJsonPruneFetchResponse(targetEl, verification, parentBox);
        }
        // json-prune-fetch-response 페이지에서는 다른 검증 타입은 지원하지 않음
        return;
    }
    
    // trusted-replace-fetch-response 페이지 처리
    if (pageType === 'trusted-replace-fetch-response') {
        // textEquals 등 텍스트 기반 검증 처리
        return verifyTrustedReplaceFetchResponse(targetEl, verification, parentBox);
    }

    // 검증 타입에 따라 적절한 검증 함수 호출 (기타 페이지용)
    switch (verificationType) {
        case 'jsonEquals':
            return verifyJsonPrune(targetEl, verification, parentBox);
        default:
            return verifySetConstant(targetEl, verification, parentBox);
    }
}
