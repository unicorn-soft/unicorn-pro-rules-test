function addDomainPrefix(text) {
    return window.location.hostname + '##' + text;
}

export function createRuleString({ filter, scriptlet, scriptletParams }) {
    if (filter) {
        return addDomainPrefix(filter);
    }
    if (scriptlet && scriptletParams) {
        const formattedParams = scriptletParams.map((param) => {
            if (typeof param === 'string') {
                if (param === '') return '""';
                if (param.startsWith('json:')) {
                    return `"${param.replace(/"/g, '\\"')}"`;
                }
                if (
                    param.startsWith('url:') ||
                    param.startsWith('method:') ||
                    param.startsWith('war:')
                ) {
                    return param;
                }
                if (param.includes(',') || param.includes(':')) {
                    return `"${param.replace(/"/g, '\\"')}"`;
                }
            }
            return param;
        });
        const scriptletText = `+js(${scriptlet}, ${formattedParams.join(', ')})`;
        return addDomainPrefix(scriptletText);
    }
    return '';
}
