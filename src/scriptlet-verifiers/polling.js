export function runWithPolling(
    runCheck,
    { interval = 100, timeout = 10000 } = {}
) {
    if (typeof runCheck !== 'function') return;

    if (runCheck()) return;

    const checkInterval = setInterval(() => {
        if (runCheck()) clearInterval(checkInterval);
    }, interval);

    setTimeout(() => {
        clearInterval(checkInterval);
    }, timeout);
}

export function runWithRestartablePolling(
    runCheck,
    {
        interval = 100,
        timeout = 10000,
        resetFlagKeys = [],
        restartListKeys = [],
    } = {}
) {
    if (typeof runCheck !== 'function') return;

    const startPolling = () => runWithPolling(runCheck, { interval, timeout });

    startPolling();

    restartListKeys.forEach((key) => {
        const listKey = String(key);
        const list = (window[listKey] = window[listKey] || []);
        list.push(startPolling);
    });

    if (resetFlagKeys.length === 0) return;

    const flagChecker = setInterval(() => {
        const hasReset = resetFlagKeys.some((key) => window[key]);
        if (hasReset) {
            resetFlagKeys.forEach((key) => {
                if (window[key]) window[key] = false;
            });
            startPolling();
        }
    }, interval * 2);

    setTimeout(() => {
        clearInterval(flagChecker);
    }, timeout * 5);
}
