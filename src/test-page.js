import "./style/global.css";
import "./style/test-page.css";
import testCase from "./index"
import { addDomainPrefix } from "./util";
import { verifySetConstant } from "./scriptlet-verifiers/set-constant.js";
import { verifyJsonPrune } from "./scriptlet-verifiers/json-prune.js";

;(function () {
    const type = new URLSearchParams(location.search).get('type')
    const currentCase = testCase[type];
    if (Array.isArray(currentCase) === false) return

    currentCase.forEach((c) => createTestSection(c));
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
                        console.error("Failed to copy:", err);
                    });
            }
        });
    }
})()

function createTestSection({ id, title, desc, target, filter, checkStyle, scriptlet, scriptletParams, verification }) {
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

    observeTargetDisplay(targetEl, checkStyle, verification);
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
            console.warn('Script execution failed:', e);
        }
    });

    node.classList.add("case");
    return node.cloneNode(true);
}

function observeTargetDisplay(targetEl, checkStyle, verification) {
    const parentBox = targetEl.closest(".target-box");
    if (!parentBox) return;

    if (verification) {
        // 스크립트릿 검증
        observeScriptletResult(targetEl, verification, parentBox);
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

function observeScriptletResult(targetEl, verification, parentBox) {
    const [type] = verification.split(':');
    
    // 검증 타입에 따라 적절한 검증 함수 호출
    switch (type) {
        case 'jsonEquals':
            return verifyJsonPrune(targetEl, verification, parentBox);
        default:
            return verifySetConstant(targetEl, verification, parentBox);
    }
}
