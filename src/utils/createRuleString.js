function addDomainPrefix(text) {
    return window.location.hostname + '##' + text;
}

export function createRuleString({ filter, scriptlet, scriptletParams }) {
    if (filter) {
        return addDomainPrefix(filter);
    }
    if (scriptlet && scriptletParams) {
        const scriptletText = `+js(${scriptlet}, ${scriptletParams.join(', ')})`;
        return addDomainPrefix(scriptletText);
    }
    return '';
}