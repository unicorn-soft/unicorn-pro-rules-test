// 각 테스트 케이스별 응답 데이터 정의
const mockResponses = {
    '/api/data1': { ads1: 123, content1: 'test', tracking1: 'seoul' },
    '/api/data2': { ads2: 1, tracking2: { banner2: 'seoul', popup2: 'kr' } },
    '/api/data3': { ads3: 1, tracking3: { banner3: 'seoul', popup3: 'kr' } },
    '/api/data4': [
        { ads4: 1, tracking4: 'seoul' },
        { ads4: 2, tracking4: 'busan' }
    ],
    '/api/data5': {
        tracking5: {
            video5: { ads5: 1, content5: '집' },
            display5: { ads5: 2, content5: '회사' }
        }
    },
    '/api/data6': { ads6: 123, content6: 'test', tracking6: 'seoul' }
};

export function verifyJsonPruneXhrResponse(targetEl, verification, parentBox) {
    // verification 파싱: "jsonEquals:window.jsonPruneXhrTestData1:{"content1":"test"}:속성 제거됨"
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
                case 'jsonEquals':
                    // expected는 이미 JSON 문자열이므로 직접 비교
                    const actualStr = JSON.stringify(actualValue);
                    isMatch = actualStr === expected;
                    
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

