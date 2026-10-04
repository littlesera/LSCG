import { h } from "tsx-dom";
import { DomOverlayHost } from "Dom/host";
import { KitContext, SelectRow, drawUnaffected } from "Dom/kit";
import { Outfits } from "modules";
import { OUTFIT_APPLY_ID, CopyCharacter, WearOutfit } from "utils";
import { StripLevel } from "./Models/cursed-item";
import { OutfitOption } from "./Models/magic";
import { SPEECH_OUTFIT_OPTIONS } from "./Models/speech-analysis";
import { STRIP_LABELS } from "./speech-analysis-pages";

const css = `
.lscg-apply { position: absolute; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgb(0 0 0 / 70%); color: var(--lscg-text-color); font-size: var(--lscg-font-small); }
.lscg-apply-panel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: minmax(0, 1fr); gap: 3%; width: 90%; height: 92%; padding: 2%; box-sizing: border-box; background: var(--lscg-background-color); border: var(--lscg-border-width) solid var(--lscg-border-color); box-shadow: var(--lscg-shadow); }
.lscg-apply-list { display: flex; flex-direction: column; gap: 0.6dvh; overflow-y: auto; min-height: 0; }
.lscg-apply button { flex: none; height: auto; min-height: 0; padding: 0.8dvh 1dvw; font: inherit; color: inherit; background: var(--lscg-button-color); border: var(--lscg-border-width) solid var(--lscg-border-color); }
.lscg-apply button:hover { background: var(--lscg-hover-color); }
.lscg-apply-list button[aria-selected="true"] { background: var(--lscg-checked-color); }
.lscg-apply-side { display: flex; flex-direction: column; gap: 1.5dvh; min-height: 0; overflow-y: auto; }
.lscg-apply-side select { width: 100%; font: inherit; }
.lscg-apply-side .lscg-apply-gap { flex: 1; }
.lscg-apply-preview { position: static; inset: auto; width: 100%; height: 100%; min-height: 0; object-fit: contain; }
`;

// ponytail: remembered for the session only; persist in OutfitSettings if people want them kept across logins
const last = { option: OutfitOption.both, strip: StripLevel.NONE };
let dialog: DomOverlayHost | undefined;
let unlistenEscape: (() => void) | undefined;

export function CloseApplyOutfitDialog() {
    unlistenEscape?.();
    unlistenEscape = undefined;
    dialog?.unmount();
    dialog = undefined;
}

/** A dialog to preview an outfit from the collection on your own character and put it on, with the same part and strip
 *  choices as cursed items and speech reactions. */
export function OpenApplyOutfitDialog(preselect?: string) {
    CloseApplyOutfitDialog();
    const names = Outfits().GetOutfitNames().sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
    if (!names.length) {
        ToastManager.info("You have no outfits in your collection yet.");
        return;
    }

    let key = names.find(n => n.toLocaleLowerCase() === preselect?.toLocaleLowerCase()) ?? names[0];
    const ctx = new KitContext();
    const preview = CopyCharacter(Player, `${OUTFIT_APPLY_ID}-${Player.MemberNumber}`, false, false);
    const bundles = () => Outfits().GetOutfitBundle(key);

    const refreshPreview = () => {
        preview.Appearance = AppearanceItemParse(CharacterAppearanceStringify(Player));
        WearOutfit(preview, bundles(), last.option, last.strip);
        CharacterRefresh(preview, false, false);
        buttons.forEach(([name, b]) => b.setAttribute("aria-selected", String(name === key)));
    };
    const buttons: [string, HTMLButtonElement][] = names.map(name => [name, <button type="button" onClick={() => { key = name; refreshPreview(); }}>{name}</button> as HTMLButtonElement]);

    const canvas = <canvas class="lscg-apply-preview" width={500} height={1000} role="img" aria-label="Outfit preview" /> as HTMLCanvasElement;
    const draw = canvas.getContext("2d")!;
    const frame = () => {
        if (!canvas.isConnected) return CharacterDelete(preview, false);
        drawUnaffected(() => {
            const main = MainCanvas;
            MainCanvas = draw;
            try {
                draw.clearRect(0, 0, 500, 1000);
                DrawCharacter(preview, 0, 0, 1, false, draw);
            } finally {
                MainCanvas = main;
            }
        });
        requestAnimationFrame(frame);
    };

    const apply = () => {
        WearOutfit(Player, bundles(), last.option, last.strip);
        CharacterRefresh(Player, CurrentScreen !== "Appearance");
        ToastManager.info(`Wearing outfit: ${key}`);
        CloseApplyOutfitDialog();
    };

    dialog = new DomOverlayHost("lscg-apply-outfit", [0, 0, 2000, 1000], () => (
        <div class="lscg-apply" role="dialog" aria-label="Apply outfit">
            <style>{css}</style>
            <div class="lscg-apply-panel">
                <div class="lscg-apply-list" role="listbox">{buttons.map(([, b]) => b)}</div>
                {canvas}
                <div class="lscg-apply-side">
                    {SelectRow(ctx, {
                        label: "Parts to put on",
                        options: SPEECH_OUTFIT_OPTIONS.map(o => ({ value: o, label: o })),
                        get: () => last.option, set: v => { last.option = v as OutfitOption; refreshPreview(); },
                    })}
                    {SelectRow(ctx, {
                        label: "Take off first",
                        options: STRIP_LABELS.map(([level, label]) => ({ value: String(level), label })),
                        get: () => String(last.strip), set: v => { last.strip = Number(v) as StripLevel; refreshPreview(); },
                    })}
                    <div class="lscg-apply-gap" />
                    <button type="button" onClick={apply}>Wear outfit</button>
                    <button type="button" onClick={CloseApplyOutfitDialog}>Cancel</button>
                </div>
            </div>
        </div>
    ), { injectKitStyles: true });
    dialog.mount();
    const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        e.stopImmediatePropagation(); // not also BC's own exit
        CloseApplyOutfitDialog();
    };
    window.addEventListener("keydown", onKey, true);
    unlistenEscape = () => window.removeEventListener("keydown", onKey, true);
    refreshPreview();
    requestAnimationFrame(frame);
}
