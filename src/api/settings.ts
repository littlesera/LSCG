import { LSCGSettingsApi, LSCGSettingsScreenDefinition, LSCGSettingsUi } from "./types";
import { Registry } from "./registry";
import { ErrorOwner, safeInvoke } from "./safeInvoke";

/** A settings screen an extension registered. */
export interface ExtensionScreen {
    /** "<extension id>.<name>" */
    id: string;
    /** The extension's display name. */
    source: string;
    label: string;
    /** The extension that registered it, so the page can contain errors from its row callbacks. */
    owner: ErrorOwner;
    /** Builds the screen's content with extension errors contained; undefined if it failed. */
    build(ui: LSCGSettingsUi): HTMLElement[] | undefined;
}

/** Shown on the Extensions settings page, which watches this to stay up to date. */
export const extensionScreens = new Registry<ExtensionScreen>("settings screen");

/** Builds the `settings` member of an extension handle. */
export function createSettingsApi(owner: ErrorOwner & { readonly info: { name: string } }, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGSettingsApi {
    const mine = new Map<string, () => void>();

    return {
        registerScreen(def: LSCGSettingsScreenDefinition): () => void {
            if (!def || typeof def.build !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: a settings screen needs a build(ui) function.`);
            const id = scopedId(typeof def.name === "string" ? def.name : "");
            const unregister = extensionScreens.register({
                id,
                source: owner.info.name,
                label: typeof def.label === "string" && def.label.trim() !== "" ? def.label.trim() : def.name,
                owner,
                build: ui => {
                    const built = safeInvoke(owner, () => def.build(ui));
                    const list = Array.isArray(built) ? built : built ? [built] : [];
                    const elements = list.filter((el): el is HTMLElement => el instanceof HTMLElement);
                    // A throw, or something that isn't an element: don't present an empty page as if it were fine.
                    return built !== undefined && elements.length === list.length ? elements : undefined;
                },
            });
            const remove = () => {
                if (mine.delete(def.name)) unregister();
            };
            mine.set(def.name, remove);
            track(remove);
            return remove;
        },

        unregisterScreen(name: string): boolean {
            const remove = mine.get(name);
            if (!remove) return false;
            remove();
            return true;
        },
    };
}
