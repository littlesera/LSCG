import { h } from "tsx-dom";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { DomSettingsHost } from "./domSettingsHost";
import { KitContext, Notice, SelectRow } from "Dom/kit";
import { extensionScreens, type ExtensionScreen } from "api/settings";
import { createExtensionKit } from "./extensionKit";

/** One page, "Extensions", that holds every settings screen an extension registered, so the main menu needs a
 *  single button however many extensions there are. A picker chooses which extension's screen to show. */
export class GuiExtensions extends GuiSubscreen {
    private _host = new DomSettingsHost("lscg-extension-settings", () => this.build());
    private _selected: string | undefined;
    private _unwatch: (() => void) | undefined;

    get name(): string {
        return "Extensions";
    }

    get hidden(): boolean {
        return extensionScreens.all().length === 0;
    }

    get help(): HelpInfo {
        return { label: "Open LSCG Wiki on GitHub", link: "https://github.com/littlesera/LSCG/wiki" };
    }

    private build(): Node[] {
        const screens = extensionScreens.all();
        if (screens.length === 0)
            return [Notice("No installed extension has settings here.")];
        if (!screens.some(s => s.id === this._selected))
            this._selected = screens[0].id;

        const panels = new Map<string, HTMLElement>();
        const show = () => panels.forEach((panel, id) => { panel.hidden = id !== this._selected; });

        for (const screen of screens)
            panels.set(screen.id, this.buildPanel(screen));
        show();

        const picker = SelectRow(new KitContext(), {
            label: "Extension",
            description: screens.length > 1 ? "Each extension adds its own settings here." : undefined,
            options: screens.map(s => ({ value: s.id, label: `${s.source}: ${s.label}` })),
            get: () => this._selected ?? "",
            set: id => { this._selected = id; show(); },
        });

        return [
            <div class="lscg-kit-tabs">
                {picker}
                <div class="lscg-kit-body scroll-box">{[...panels.values()]}</div>
            </div> as HTMLElement,
        ];
    }

    /** One screen's content. Its rows share a context, so a change in one re-evaluates the others' disabled/hidden. */
    private buildPanel(screen: ExtensionScreen): HTMLElement {
        const panel = <div class="lscg-kit-panel" role="tabpanel" /> as HTMLElement;
        const ctx = new KitContext();
        const kit = createExtensionKit(ctx, screen.owner, () => panel);
        const content = screen.build({ kit, refresh: () => ctx.refresh() });
        panel.append(...(content ?? [Notice(`${screen.source}'s settings couldn't be loaded. See the browser console for details.`)]));
        return panel;
    }

    Load(): void {
        super.Load();
        this._host.mount();
        // Screens registered or removed while the page is open show up straight away.
        this._unwatch = extensionScreens.onChange(() => this._host.remount());
    }

    Exit(): void {
        this.stop();
        super.Exit();
    }

    Unload(): void {
        this.stop();
    }

    private stop(): void {
        this._unwatch?.();
        this._unwatch = undefined;
        this._host.unmount();
    }
}
