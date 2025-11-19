// trusted-json-edit-fetch-request 전용 검증기
// 요청 body가 수정되어 서버에서 반환된 JSON과 기대값을 비교한다.

export function setupJsonEditFetchRequestMock() {
    // webpack dev server가 POST 에코 엔드포인트를 제공하므로 별도 작업 없음
}

export function verifyTrustedJsonEditFetchRequest(targetEl, verification, parentBox) {
    const parts = verification.split(":");
    const type = parts[0];
    const target = parts[1];
    const successMessage = parts[parts.length - 1];
    const expectedRaw = parts.slice(2, -1).join(":");

    let expected;
    try {
        expected = JSON.parse(expectedRaw);
    } catch (e) {
        expected = expectedRaw;
    }

    const updateUI = (actualValue) => {
        const jsonResultEl = targetEl.querySelector(".json-result");
        if (jsonResultEl && actualValue !== undefined) {
            jsonResultEl.textContent = JSON.stringify(actualValue, null, 2);
        }
    };

    const deepEqual = (a, b) => {
        if (a === b) return true;
        if (typeof a !== typeof b) return false;
        if (a && b && typeof a === "object") {
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!deepEqual(a[i], b[i])) return false;
                }
                return true;
            }
            const aKeys = Object.keys(a);
            const bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) return false;
            for (const key of aKeys) {
                if (!deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        return false;
    };

    const check = () => {
        try {
            const actualValue = eval(target);
            if (actualValue === null || actualValue === undefined) return false;

            updateUI(actualValue);

            if (type === "jsonEquals") {
                if (!deepEqual(actualValue, expected)) return false;
                parentBox.setAttribute("success", "");
                const statusEl = targetEl.querySelector(".status");
                if (statusEl && successMessage) statusEl.textContent = successMessage;
                return true;
            }
        } catch (_) {
            parentBox.removeAttribute("success");
            return false;
        }
        parentBox.removeAttribute("success");
        return false;
    };

    if (check()) return;

    const interval = setInterval(() => {
        if (check()) {
            clearInterval(interval);
        }
    }, 100);

    setTimeout(() => clearInterval(interval), 10000);
}
