export function verifySetConstant(targetEl, verification, parentBox) {
    const [type, target, expected, successMessage] = verification.split(':');
    console.log(type, target, expected, successMessage)
    // 범용 검증 로직
    const checkInterval = setInterval(() => {
        try {
            const actualValue = eval(target);
            let isMatch = false;
            
            // 검증 타입별 처리
            switch (type) {
                case 'equals':
                    // 값 비교 (문자열 처리 포함)
                    let expectedValue = expected;
                    if (expected === 'undefined') expectedValue = undefined;
                    else if (expected === 'true') expectedValue = true;
                    else if (expected === 'false') expectedValue = false;
                    else if (expected === 'null') expectedValue = null;
                    else if (expected === '') expectedValue = '';
                    else if (!isNaN(expected)) expectedValue = Number(expected);
                    
                    isMatch = actualValue === expectedValue;
                    break;
                    
                case 'functionCall':
                    // 함수 호출 결과 확인
                    if (typeof actualValue === 'function') {
                        const result = actualValue();
                        let expectedResult = expected;
                        if (expected === 'undefined') expectedResult = undefined;
                        else if (expected === 'true') expectedResult = true;
                        else if (expected === 'false') expectedResult = false;
                        
                        isMatch = result === expectedResult;
                    }
                    break;
                    
                case 'arrayEmpty':
                    // 빈 배열 확인
                    isMatch = Array.isArray(actualValue) && actualValue.length === 0;
                    break;
                    
                case 'objectEmpty':
                    // 빈 객체 확인
                    isMatch = typeof actualValue === 'object' && 
                             actualValue !== null && 
                             !Array.isArray(actualValue) && 
                             Object.keys(actualValue).length === 0;
                    break;
                    
                default:
                    console.warn(`Unknown verification type: ${type}`);
            }
            
            if (isMatch) {
                parentBox.setAttribute("success", "");
                clearInterval(checkInterval);
                
                // 성공 메시지 업데이트
                const statusEl = targetEl.querySelector('.status');
                if (statusEl && successMessage) {
                    statusEl.textContent = successMessage;
                }
            }
        } catch (e) {
            // 변수가 아직 존재하지 않는 경우 무시
        }
    }, 100); // 100ms마다 체크
    
    // 10초 후 타임아웃
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}