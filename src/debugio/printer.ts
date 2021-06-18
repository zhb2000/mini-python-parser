import { CharSequence } from '../scanner/preprocessor.js';
function printCharSequences(sequences: CharSequence[]) {
    const sj = sequences.map(s => s.data.toString());
    return sj.join(' ');
}

function jsonString(obj: any): string {
    return JSON.stringify(obj, (key, value) =>
        typeof value === "bigint" ? value.toString() : value);
}

export { printCharSequences, jsonString };
