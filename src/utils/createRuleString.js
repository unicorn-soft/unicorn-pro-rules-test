function addDomainPrefix(text) {
    return window.location.hostname + '##' + text;
}

export function createRuleString({ filter, scriptlet, scriptletParams }) {
    if (filter) {
        return addDomainPrefix(filter);
    }
    if (scriptlet && scriptletParams) {
        const formattedParams = scriptletParams.map((param) => {
            if (typeof param === 'string' && param.includes(',')) {
                return `"${param.replace(/"/g, '\\"')}"`;
            }
            return param;
        });
        const scriptletText = `+js(${scriptlet}, ${formattedParams.join(', ')})`;
        return addDomainPrefix(scriptletText);
    }
    return '';
}
