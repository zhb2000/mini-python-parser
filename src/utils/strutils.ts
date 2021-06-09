/** 是否为空串或 `null` 或 `undefined` */
function isEmpty(s: string | undefined | null): boolean {
    return s == null || s.length === 0;
}

/** 是否为空白串（空串也算） */
function isBlank(s: string): boolean {
    return s.trim().length === 0;
}

/** 是否为 `string` 或 `String` 类型 */
function isString(s: any): boolean {
    return s != null && (typeof (s) === 'string' || s instanceof String);
}

/** 是否为数字字符 */
function isdigit(ch: string): boolean {
    console.assert(ch.length === 1, 'ch is not a char');
    return /^[0-9]$/.test(ch);
}

/** 是否为英文字母字符 */
function isalpha(ch: string): boolean {
    console.assert(ch.length === 1, 'ch is not a char');
    return /^[a-zA-Z]$/.test(ch);
}

export { isBlank, isEmpty, isString, isdigit, isalpha };
