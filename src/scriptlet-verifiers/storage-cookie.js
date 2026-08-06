const POLL_INTERVAL = 100;
const DEFAULT_TIMEOUT = 10000;

function getCookieValue(name) {
    const prefix = `${name}=`;
    const entry = document.cookie
        .split('; ')
        .find((item) => item.startsWith(prefix));
    return entry ? entry.slice(prefix.length) : null;
}

function setStatus(parentBox, status, message, { keepVisible = false } = {}) {
    parentBox.removeAttribute('success');
    parentBox.dataset.status = status;

    let statusEl = parentBox.querySelector('.verification-status');
    if (!statusEl) {
        statusEl = document.createElement('span');
        statusEl.className = 'verification-status';
        parentBox.appendChild(statusEl);
    }
    statusEl.textContent = message;

    if (status === 'success' && !keepVisible) {
        parentBox.setAttribute('success', '');
    }
}

function poll(check, parentBox, { timeout = DEFAULT_TIMEOUT, onTimeout } = {}) {
    const startedAt = Date.now();

    const run = async () => {
        try {
            if (await check()) return;
        } catch (error) {
            setStatus(parentBox, 'fail', `검증 오류: ${error.message}`);
            return;
        }

        if (Date.now() - startedAt >= timeout) {
            if (onTimeout) onTimeout();
            setStatus(parentBox, 'fail', '제한 시간 안에 조건을 만족하지 못함');
            return;
        }

        setTimeout(run, POLL_INTERVAL);
    };

    run();
}

function navigationType() {
    const [entry] = performance.getEntriesByType('navigation');
    return entry ? entry.type : '';
}

function defaultCookiePath(pathname) {
    if (!pathname || pathname[0] !== '/') return '/';
    if (pathname.indexOf('/', 1) === -1) return '/';
    return pathname.slice(0, pathname.lastIndexOf('/')) || '/';
}

async function getCookieWithAttributes(name, value) {
    if (
        !window.cookieStore ||
        typeof window.cookieStore.getAll !== 'function'
    ) {
        return { unsupported: true };
    }

    const cookies = await window.cookieStore.getAll({ name });
    const cookie = cookies.find((item) => item.value === value);
    return { cookie };
}

function verifyCookieAttribute(parentBox, name, value, attribute, expected) {
    poll(async () => {
        if (getCookieValue(name) !== value) return false;

        const result = await getCookieWithAttributes(name, value);
        if (result.unsupported) {
            setStatus(
                parentBox,
                'unsupported',
                '이 브라우저는 쿠키 속성 조회를 지원하지 않음'
            );
            return true;
        }

        const cookie = result.cookie;
        if (!cookie) return false;
        if (!Object.prototype.hasOwnProperty.call(cookie, attribute)) {
            setStatus(
                parentBox,
                'unsupported',
                '이 브라우저는 해당 쿠키 속성을 공개하지 않음'
            );
            return true;
        }

        let isMatch = false;
        if (attribute === 'path') {
            const expectedPath =
                expected === 'default'
                    ? defaultCookiePath(location.pathname)
                    : expected;
            isMatch = cookie.path === expectedPath;
        } else if (attribute === 'domain') {
            const expectedDomain =
                expected === 'hostname' ? location.hostname : expected;
            const actualDomain = String(cookie.domain || '')
                .replace(/^\./, '')
                .toLowerCase();
            isMatch = actualDomain === expectedDomain.toLowerCase();
        } else if (attribute === 'expires') {
            const expectedDuration = Number(expected);
            const remaining = Number(cookie.expires) - Date.now();
            isMatch =
                Number.isFinite(remaining) &&
                Math.abs(remaining - expectedDuration) <= 5 * 60 * 1000;
        }

        if (isMatch) {
            setStatus(parentBox, 'success', '쿠키 값과 속성 확인 완료');
            return true;
        }

        setStatus(parentBox, 'fail', `${attribute} 속성이 예상값과 다름`);
        return true;
    });
}

function updateRun(activeRun, values) {
    if (!activeRun || !activeRun.storageKey) return;

    const nextRun = { ...activeRun, ...values };
    sessionStorage.setItem(activeRun.storageKey, JSON.stringify(nextRun));
    Object.assign(activeRun, nextRun);
}

function completeRun(activeRun) {
    if (!activeRun || !activeRun.storageKey) return;
    sessionStorage.removeItem(activeRun.storageKey);
}

function verifyReload(
    parentBox,
    activeRun,
    valueCheck,
    timeout,
    { delayed = false } = {}
) {
    if (!activeRun) {
        setStatus(
            parentBox,
            'unsupported',
            '메인 페이지에서 테스트 페이지로 다시 진입해 검사'
        );
        return;
    }

    const navType = navigationType();

    if (navType !== 'reload' && !activeRun.pageObservedAt) {
        updateRun(activeRun, { pageObservedAt: Date.now() });
    }

    poll(
        () => {
            if (!valueCheck() || navigationType() !== 'reload') return false;

            if (!delayed && activeRun.pageObservedAt) {
                completeRun(activeRun);
                setStatus(
                    parentBox,
                    'fail',
                    '값은 변경됐지만 규칙의 즉시 리로드는 확인되지 않음'
                );
                return true;
            }

            if (delayed) {
                if (!activeRun.pageObservedAt) return false;
                const elapsed = Date.now() - activeRun.pageObservedAt;
                if (elapsed < 4000) {
                    completeRun(activeRun);
                    setStatus(
                        parentBox,
                        'fail',
                        '설정한 지연 시간보다 너무 일찍 리로드됨'
                    );
                    return true;
                }
            }

            completeRun(activeRun);
            setStatus(
                parentBox,
                'success',
                '값 변경과 페이지 리로드 확인 완료'
            );
            return true;
        },
        parentBox,
        { timeout, onTimeout: () => completeRun(activeRun) }
    );
}

function verifyTimeValue(parentBox, readValue, format) {
    poll(() => {
        const value = readValue();
        if (value === null) return false;

        let timestamp = Number.NaN;
        if (format === 'now') {
            timestamp = Number(value);
        } else if (format === 'date') {
            timestamp = Date.parse(value);
            if (
                Number.isFinite(timestamp) &&
                new Date(timestamp).toString() !== value
            ) {
                timestamp = Number.NaN;
            }
        } else if (format === 'utc') {
            const compactValue = value.replace(/\s+/g, '');
            timestamp = Date.parse(value);
            if (
                Number.isFinite(timestamp) &&
                new Date(timestamp).toUTCString().replace(/\s+/g, '') !==
                    compactValue
            ) {
                timestamp = Number.NaN;
            }
        } else if (format === 'iso') {
            timestamp = Date.parse(value);
            if (
                Number.isFinite(timestamp) &&
                new Date(timestamp).toISOString() !== value
            ) {
                timestamp = Number.NaN;
            }
        }

        const age = Date.now() - timestamp;
        if (!Number.isFinite(timestamp) || age < 0 || age > DEFAULT_TIMEOUT) {
            return false;
        }

        setStatus(parentBox, 'success', '시간 토큰 변환값 확인 완료');
        return true;
    }, parentBox);
}

function deleteCookie(name) {
    const paths = [...new Set(['/', defaultCookiePath(location.pathname)])];
    const domains = ['', `; Domain=${location.hostname}`];
    const secure = window.isSecureContext ? '; Secure' : '';

    paths.forEach((path) => {
        domains.forEach((domain) => {
            document.cookie = `${name}=; Max-Age=0; Path=${path}${domain}${secure}`;
        });
    });
    document.cookie = `${name}=; Max-Age=0${secure}`;
}

function setCookie(name, value) {
    document.cookie = `${name}=${value}; Path=/`;
}

function loadStorageProbe() {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        const url = new URL(location.href);
        url.searchParams.set('storageProbe', `${Date.now()}`);
        iframe.hidden = true;

        const timeoutId = setTimeout(() => {
            iframe.remove();
            reject(new Error('검사용 페이지 실행 시간 초과'));
        }, 10000);

        iframe.addEventListener(
            'load',
            () => {
                clearTimeout(timeoutId);
                setTimeout(() => {
                    iframe.remove();
                    resolve();
                }, 200);
            },
            { once: true }
        );
        iframe.addEventListener(
            'error',
            () => {
                clearTimeout(timeoutId);
                iframe.remove();
                reject(new Error('검사용 페이지를 불러오지 못함'));
            },
            { once: true }
        );

        iframe.src = url.href;
        document.body.appendChild(iframe);
    });
}

function createProbeButton(parentBox, run) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '테스트 실행';
    parentBox.appendChild(button);

    button.addEventListener('click', async () => {
        button.disabled = true;
        setStatus(parentBox, 'pending', '검증 중', { keepVisible: true });

        try {
            await run();
        } catch (error) {
            setStatus(parentBox, 'fail', `검증 오류: ${error.message}`, {
                keepVisible: true,
            });
        } finally {
            button.disabled = false;
        }
    });

    setStatus(parentBox, 'pending', '테스트 실행 버튼을 누르세요', {
        keepVisible: true,
    });
}

function verifyDontOverwriteProbe(parentBox, name, expected, replacement) {
    createProbeButton(parentBox, async () => {
        deleteCookie(name);
        await loadStorageProbe();

        const createdValue = getCookieValue(name);
        if (createdValue !== replacement) {
            setStatus(
                parentBox,
                'fail',
                createdValue === null
                    ? '규칙이 실행되지 않음'
                    : `쿠키 없음 단계의 값이 ${createdValue}로 예상과 다름`,
                { keepVisible: true }
            );
            return;
        }

        setCookie(name, expected);
        await loadStorageProbe();

        const preservedValue = getCookieValue(name);
        if (preservedValue !== expected) {
            setStatus(
                parentBox,
                'fail',
                `기존 값이 ${preservedValue ?? '없음'}으로 변경됨`,
                { keepVisible: true }
            );
            return;
        }

        setStatus(
            parentBox,
            'success',
            `규칙 실행 확인 및 ${name}=${expected} 유지`,
            { keepVisible: true }
        );
    });
}

function verifyRemovedStorageProbe(parentBox, namesValue) {
    const names = namesValue.split(',').filter(Boolean);

    createProbeButton(parentBox, async () => {
        names.forEach((name) => localStorage.setItem(name, 'seed'));

        await loadStorageProbe();

        const remaining = names.filter(
            (name) => localStorage.getItem(name) !== null
        );
        if (remaining.length > 0) {
            setStatus(
                parentBox,
                'fail',
                `삭제되지 않은 키: ${remaining.join(', ')}`,
                { keepVisible: true }
            );
            return;
        }

        setStatus(parentBox, 'success', '정규표현식 일치 키 3개 삭제 확인', {
            keepVisible: true,
        });
    });
}

export function verifyStorageCookie(
    verification,
    parentBox,
    { pageType, activeRun } = {}
) {
    const [type, name, expected, option, optionValue] = verification.split(':');

    if (pageType === 'trusted-set-cookie' && !window.isSecureContext) {
        setStatus(
            parentBox,
            'unsupported',
            '보안 컨텍스트(HTTPS)에서만 검사 가능'
        );
        return;
    }

    setStatus(parentBox, 'pending', '검증 중');

    switch (type) {
        case 'cookieValue':
            poll(() => {
                if (getCookieValue(name) !== expected) return false;
                setStatus(parentBox, 'success', '쿠키 값 확인 완료');
                return true;
            }, parentBox);
            break;

        case 'secureCookie':
            poll(() => {
                if (getCookieValue(name) !== expected) return false;
                setStatus(parentBox, 'success', 'Secure 쿠키 생성 확인 완료');
                return true;
            }, parentBox);
            break;

        case 'cookieAttribute':
            verifyCookieAttribute(
                parentBox,
                name,
                expected,
                option,
                optionValue
            );
            break;

        case 'storageValue':
            poll(() => {
                if (localStorage.getItem(name) !== expected) return false;
                setStatus(parentBox, 'success', 'localStorage 값 확인 완료');
                return true;
            }, parentBox);
            break;

        case 'storageTimeValue':
            verifyTimeValue(
                parentBox,
                () => localStorage.getItem(name),
                expected
            );
            break;

        case 'cookieTimeValue':
            verifyTimeValue(parentBox, () => getCookieValue(name), expected);
            break;

        case 'probeDontOverwriteCookie':
            verifyDontOverwriteProbe(parentBox, name, expected, option);
            break;

        case 'probeRemovedStorage':
            verifyRemovedStorageProbe(parentBox, name);
            break;

        case 'reloadCookie':
            verifyReload(
                parentBox,
                activeRun,
                () => getCookieValue(name) === expected,
                Number(option) || DEFAULT_TIMEOUT
            );
            break;

        case 'reloadStorage':
            verifyReload(
                parentBox,
                activeRun,
                () => localStorage.getItem(name) === expected,
                Number(option) || DEFAULT_TIMEOUT,
                { delayed: true }
            );
            break;

        default:
            setStatus(parentBox, 'fail', '알 수 없는 검증 방식');
    }
}
