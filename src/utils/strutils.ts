function isEmpty(s: string | undefined | null): boolean {
    return s == null || s.length === 0;
}

function isBlank(s: string): boolean {
    return s.trim().length === 0;
}

function isString(s: any): boolean {
    return s != null && (typeof (s) === 'string' || s instanceof String);
}

function isdigit(ch: string): boolean {
    return /^[0-9]$/.test(ch);
}

function isalpha(ch: string): boolean {
    return /^[a-zA-Z]$/.test(ch);
}

export { isBlank, isEmpty, isString, isdigit, isalpha };
