import { CharSequence, makeCharSequences } from '../scanner/preprocessor';
function printCharSequences(seqs: CharSequence[]) {
    const sb = seqs.map(s => s.data.toString());
    return sb.join(' ');
}
export { printCharSequences };
