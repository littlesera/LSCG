import { CheckboxRow, Expando, KitContext, NumberRow } from "Dom/kit";
import { MAX_STEP_DELAY, MIN_STEP_DELAY } from "stepDelay";

const delayText = (ms: number) => `wait ${ms / 1000}s`;

/** The thin connector between two steps of a sequence (a spell's effects, a suggestion's instructions): how long the step below it waits
 *  after the one above (its default, or a delay the author chose). Closed it is one short line in the gutter, so it reads as the link
 *  between the two steps; open it edits in place. Only for steps after the first, which always happen at once.
 *  `custom` is the author's delay in ms, undefined for the default, which is `normal()`. */
export function DelayConnector(ctx: KitContext, props: { custom: () => number | undefined; normal: () => number; set: (ms: number | undefined) => void }): HTMLElement {
    const section = Expando(ctx, {
        summary: () => {
            const custom = props.custom();
            return `↳ ${delayText(custom ?? props.normal())}${custom !== undefined ? " (custom)" : ""}`;
        },
        content: [
            CheckboxRow(ctx, {
                label: "Custom delay",
                description: `Default: ${delayText(props.normal())}.`,
                get: () => props.custom() !== undefined,
                set: v => props.set(v ? props.normal() : undefined),
            }),
            NumberRow(ctx, {
                label: "Wait (seconds)",
                min: MIN_STEP_DELAY / 1000, max: MAX_STEP_DELAY / 1000, step: 0.5,
                get: () => (props.custom() ?? props.normal()) / 1000,
                set: v => props.set(v * 1000),
                hidden: () => props.custom() === undefined,
            }),
        ],
    });
    section.classList.add("lscg-delay-connector");
    return section;
}
