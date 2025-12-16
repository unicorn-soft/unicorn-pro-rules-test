export function runWithPolling(runCheck, { interval = 100, timeout = 10000 } = {}) {
    if (typeof runCheck !== 'function') return;

    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        if (runCheck()) clearInterval(checkInterval);
    }, interval);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, timeout);
}
