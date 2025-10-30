// webpack dev server에서 실제 mock API를 제공하므로
// 복잡한 모킹 로직이 필요 없습니다.
// 템퍼몽키가 이미 fetch를 Proxy로 감쌌으므로,
// 실제 네트워크 요청이 발생하면 템퍼몽키가 자동으로 처리합니다.
export function setupReplaceFetchMock() {
    // webpack dev server가 mock API 제공
}

export function teardownReplaceFetchMock() {
    // webpack dev server가 처리하므로 teardown이 필요 없음
}

export function verifyTrustedReplaceFetchResponse(targetEl, verification, parentBox) {
    // verification 파싱: "textEquals:window.trustedReplaceFetchTestData1:This content has removed content:기본 치환 성공"
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const successMessage = parts[parts.length - 1];
    const expected = parts.slice(2, -1).join(':'); // 중간 부분들을 다시 합침

    // UI 업데이트 함수
    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl && actualValue) {
            jsonResultEl.textContent = actualValue;
        }
    };

    // 즉시 한 번 실행
    const runCheck = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) {
                return false;
            }

            // UI 업데이트
            updateUI(actualValue);

            let isMatch = false;

            switch (type) {
                case 'textEquals':
                    // 텍스트 직접 비교
                    isMatch = String(actualValue) === expected;
                    
                    break;

                default:
                    // Unknown verification type
            }

            if (isMatch) {
                parentBox.setAttribute("success", "");

                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) {
                    statusEl.textContent = successMessage;
                }
                return true;
            }
        } catch (e) {
            // 오류 무시
        }
        return false;
    };

    // 즉시 실행
    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) {
                return;
            }

            // UI 업데이트
            updateUI(actualValue);

            let isMatch = false;

            switch (type) {
                case 'textEquals':
                    // 텍스트 직접 비교
                    isMatch = String(actualValue) === expected;
                    
                    break;

                default:
                    // Unknown verification type
            }

            if (isMatch) {
                parentBox.setAttribute("success", "");
                clearInterval(checkInterval);

                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) {
                    statusEl.textContent = successMessage;
                }
            }
        } catch (e) {
            // 변수가 아직 존재하지 않을 수 있음, 무시
        }
    }, 100);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}

