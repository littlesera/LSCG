import { escapeRegExp } from "utils";

/** Scripts written without spaces between words, so a word edge can't be told by what is next to it. */
const UNSPACED = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

/** A letter or digit of a script that puts spaces between words (latin with its accents, cyrillic, ...): the only kind \`\b\`-style word edges mean anything for. */
export function isSpacedWordChar(c: string | undefined): boolean {
    return !!c && /[\p{L}\p{N}_]/u.test(c) && !UNSPACED.test(c);
}

/** Where `phrase` first appears in `text` as a whole word (case-insensitive), or -1. Phrases in unspaced scripts (Chinese, Japanese, ...)
 *  match anywhere, since there are no word edges to respect; an accented latin word still needs its edges. */
export function phraseIndex(text: string, phrase: string): number {
    if (!phrase)
        return -1;
    const re = new RegExp(escapeRegExp(phrase), "giu");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        const before = text[m.index - 1];
        const after = text[m.index + m[0].length];
        const startOk = !isSpacedWordChar(phrase[0]) || !isSpacedWordChar(before);
        const endOk = !isSpacedWordChar(phrase[phrase.length - 1]) || !isSpacedWordChar(after);
        if (startOk && endOk)
            return m.index;
        re.lastIndex = m.index + 1;
    }
    return -1;
}
