/** Dice expressions like "2d6 + 2", "d8", "1d4+1d6-1" or a flat "5". Rolls come from spells other players made, so the
 *  sizes are capped: a spell can't ask for a thousand dice. */
export const MAX_DICE_PER_TERM = 50;
export const MAX_DIE_SIDES = 1000;
export const MAX_DICE_TERMS = 6;
export const MAX_ROLL_LENGTH = 40;

export type DiceTerm = { kind: "dice"; sign: 1 | -1; count: number; sides: number } | { kind: "flat"; sign: 1 | -1; value: number };

export interface DiceRoll {
    terms: DiceTerm[];
    /** The expression tidied up: "2D6+2" becomes "2d6 + 2". */
    text: string;
}

export interface DiceResult {
    total: number;
    /** What was rolled, e.g. "2d6 + 2 = [4, 3] + 2". */
    breakdown: string;
}

/** Parses an expression, or undefined when it isn't one (or asks for too much). */
export function parseDiceRoll(input: string | undefined): DiceRoll | undefined {
    // "2d6 2" would otherwise collapse into 2d62
    if (/\w\s+\w/.test(input ?? ""))
        return undefined;
    const source = (input ?? "").replace(/\s+/g, "").toLowerCase();
    if (!source || source.length > MAX_ROLL_LENGTH)
        return undefined;
    const pieces = source.match(/^[+-]?[^+-]+(?:[+-][^+-]+)*$/) ? source.match(/[+-]?[^+-]+/g) : null;
    if (!pieces || pieces.length > MAX_DICE_TERMS)
        return undefined;
    const terms: DiceTerm[] = [];
    for (const piece of pieces) {
        const sign = piece.startsWith("-") ? -1 : 1;
        const body = piece.replace(/^[+-]/, "");
        const dice = /^(\d*)d(\d+)$/.exec(body);
        if (dice) {
            const count = dice[1] === "" ? 1 : parseInt(dice[1], 10);
            const sides = parseInt(dice[2], 10);
            if (count < 1 || count > MAX_DICE_PER_TERM || sides < 2 || sides > MAX_DIE_SIDES)
                return undefined;
            terms.push({ kind: "dice", sign, count, sides });
        } else if (/^\d{1,6}$/.test(body)) {
            terms.push({ kind: "flat", sign, value: parseInt(body, 10) });
        } else {
            return undefined;
        }
    }
    const text = terms.map((t, i) => {
        const part = t.kind === "dice" ? `${t.count}d${t.sides}` : `${t.value}`;
        return i === 0 ? `${t.sign < 0 ? "-" : ""}${part}` : ` ${t.sign < 0 ? "-" : "+"} ${part}`;
    }).join("");
    return { terms, text };
}

/** Rolls a parsed expression. The total never goes below 0, whatever the modifiers. `random` returns [0, 1). */
export function rollDice(roll: DiceRoll, random: () => number = Math.random): DiceResult {
    let total = 0;
    const shown = roll.terms.map((t, i) => {
        const lead = i === 0 ? (t.sign < 0 ? "-" : "") : t.sign < 0 ? " - " : " + ";
        if (t.kind === "flat") {
            total += t.sign * t.value;
            return `${lead}${t.value}`;
        }
        const rolls = Array.from({ length: t.count }, () => Math.floor(random() * t.sides) + 1);
        total += t.sign * rolls.reduce((a, b) => a + b, 0);
        return `${lead}${t.count === 1 ? rolls[0] : `[${rolls.join(", ")}]`}`;
    }).join("");
    total = Math.max(0, total);
    return { total, breakdown: `${roll.text} = ${shown}` };
}
