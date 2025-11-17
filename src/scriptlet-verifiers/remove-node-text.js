export function verifyRemoveNodeText(targetEl, verification, parentBox) {
  const parts = verification.split(':');
  const type = parts[0];
  const target = parts[1];
  const successMessage = parts[parts.length - 1];
  const expected = parts.slice(2, -1).join(':');

  const updateUI = (actualValue) => {
    const jsonResultEl = targetEl.querySelector('.json-result');
    if (jsonResultEl && actualValue !== undefined && actualValue !== null) {
      jsonResultEl.textContent = String(actualValue);
    }
  };

  const checkMatch = (actualValue) => {
    if (type === 'textEquals') {
      return String(actualValue) === expected;
    }
    return false;
  };

  const runCheck = () => {
    try {
      const actualValue = eval(target);
      if (actualValue === null || actualValue === undefined) return false;

      updateUI(actualValue);
      if (checkMatch(actualValue)) {
        parentBox.setAttribute('success', '');
        const statusEl = targetEl.querySelector('.status');
        if (statusEl && successMessage) statusEl.textContent = successMessage;
        return true;
      }
    } catch (e) {}
    return false;
  };

  if (runCheck()) return;

  const checkInterval = setInterval(() => {
    try {
      const actualValue = eval(target);
      if (actualValue === null || actualValue === undefined) return;

      updateUI(actualValue);
      if (checkMatch(actualValue)) {
        parentBox.setAttribute('success', '');
        clearInterval(checkInterval);
        const statusEl = targetEl.querySelector('.status');
        if (statusEl && successMessage) statusEl.textContent = successMessage;
      }
    } catch (e) {}
  }, 100);

  setTimeout(() => clearInterval(checkInterval), 10000);
}

