export function verifyJsonPrune(targetEl, verification, parentBox) {
    // verification 파싱: "jsonEquals:window.jsonPruneParsedData1:{"content1":"test"}:속성 제거됨"
    const parts = verification.split(':');
    const type = parts[0];
    const target = parts[1];
    const successMessage = parts[parts.length - 1];
    const expected = parts.slice(2, -1).join(':'); // 중간 부분들을 다시 합침

    // UI 업데이트 함수
    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector('.json-result');
        if (jsonResultEl && actualValue) {
            jsonResultEl.textContent = JSON.stringify(actualValue, null, 2);
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
                case 'jsonEquals':
                    // expected는 이미 JSON 문자열이므로 직접 비교
                    const actualStr = JSON.stringify(actualValue);
                    isMatch = actualStr === expected;
                    
                    break;

                default:
                    console.warn(`Unknown verification type: ${type}`);
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
                case 'jsonEquals':
                    // expected는 이미 JSON 문자열이므로 직접 비교
                    const actualStr = JSON.stringify(actualValue);
                    isMatch = actualStr === expected;
                    
                    break;

                default:
                    console.warn(`Unknown verification type: ${type}`);
            }

            if (isMatch) {
                console.log('성공! 박스를 초록색으로 변경 중...');
                parentBox.setAttribute("success", "");
                clearInterval(checkInterval);

                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) {
                    statusEl.textContent = successMessage;
                    console.log('상태 메시지 업데이트 완료:', successMessage);
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
