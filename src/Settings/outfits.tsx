import { h } from "tsx-dom";
import { ApplyItem, BC_ItemsToItemBundles, CopyCharacter, OUTFIT_CREATOR_ID, OUTFIT_PREVIEW_ID, hookFunction, onCanvasResize, ICONS, isBind, isBody, isCloth, isCosplay, isGenitals, isHair, isPronouns, isSkin, smartGetAssetGroup } from "utils";
import { GuiSubscreen, HelpInfo } from "./settingBase";
import { OutfitSettings } from "./Models/base";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { craftKeywords } from "Modules/chaotic-item";
import { InjectorModule } from "Modules/injector";
import { getModule } from "modules";
import styles from "./outfits.scss?inline";
import editorStyles from "./outfitEditor.scss?inline";
import { clamp, entries, toArray } from "lodash-es";
import { Outfit } from "./OutfitCollection/outfitCollection";
import { drawTooltip } from "./settingUtils";
import { setSubscreen } from "./setting_definitions";
import { CheckboxRow, drawUnaffected, IconButton, KitContext } from "Dom/kit";
import { DomSettingsHost } from "./domSettingsHost";
import { OutfitStorageStrategy } from "./OutfitCollection/IOutfitCollection";

function createButton(screen: GuiOutfits, key: string, i: number, onClick: (key: string) => void) {
    return (
        <button
            class="lscg-button"
            id={ID.button + i.toString()}
            style={{ height: "min(7dvh, 3.5dvw)" }}
            onClick={() => onClick(key)}
        >{key}</button>
    );
}

function byteToKB(nByte: number) {
    return Math.round(nByte / 100) / 10;
}

const MAX_DATA = 180_000;
const root = "lscg-outfits";
const ID = Object.freeze({
    root,
    styles: `${root}-style`,

    exit: `${root}-exit`,
    exitButton: `${root}-exit-button`,
    exitTooltip: `${root}-exit-tooltip`,
    storage: `${root}-storage`,
    storageInner: `${root}-storage-cover`,
    storageTooltip: `${root}-storage-tooltip`,
    storageFooter: `${root}-storage-footer`,
    storageType: `${root}-storage-type`,
    storageTypeSelect: `${root}-storage-type-select`,

    newOutfit: `${root}-new-outfit`,
    newOutfitButton: `${root}-new-outfit-button`,

    buttonOuterGrid: `${root}-button-grid-outer`,
    buttonInnerGrid0: `${root}-button-grid-inner0`,
    buttonInnerGrid1: `${root}-button-grid-inner1`,
    outfitEditor: `${root}-outfit-edit`,
    outfitDisplay: `${root}-outfit-display`,
    outfitInputs: `${root}-outfit-inputs`,
    button: `${root}-button`,
    itemSets: `${root}-header0`,
    commandSets: `${root}-header1`,
});

/** Editor state parked while BC's Appearance screen replaces Preferences; restored by `Load`. */
interface CreatorResume {
    key: string | undefined;
    outfit: Outfit;
    incoming: string;
    changed: boolean;
    /** JSON of each group's bundle as the creator started, to tell what the user changed. */
    start: Record<string, string>;
    /** Groups the outfit had before; these are kept even if unchanged. */
    groups: string[];
    filter: GuiOutfits["_outfitFilter"];
    returnScreen: ScreenSpecifier;
    edit: Character;
}
let creatorResume: CreatorResume | undefined;
let appearanceHook: (() => void) | undefined;

/** Where BC's own item and colour widgets draw: the right half of the screen, as in its item dialog. */
/** Pixel size of an item cell's preview canvas; BC's own item previews are 225 wide. */
const ITEM_PREVIEW_SIZE = 225;
/** An item grid cell's tooltip: the name, then optional base item, description and LSCG attribute lines. */
type GridTab = "items" | "crafted";

/** One cell of a popup's item grid. `icon` stands in for an asset's preview (e.g. "No lock"). */
interface GridEntry {
    asset?: Asset;
    icon?: string;
    label: string;
    tip: ItemTip;
    worn: boolean;
    pick: () => void;
}

/** A lock setting the modal edits directly, validated like BC's own lock screens. */
interface LockField {
    label: string;
    prop: string;
    max: number;
    valid: RegExp;
    rule: string;
    upper?: boolean;
}

const PASSWORD_FIELDS: LockField[] = [
    { label: "Password", prop: "Password", max: 8, valid: /^[A-Z]{1,8}$/, rule: "1 to 8 letters, A to Z", upper: true },
    { label: "Hint", prop: "Hint", max: 140, valid: /^.{0,140}$/, rule: "Up to 140 characters" },
];

/** The locks that have settings, by asset name; the others (metal, owner, family...) have nothing to set. */
const LOCK_SETTINGS: Record<string, LockField[] | undefined> = {
    CombinationPadlock: [{ label: "Combination", prop: "CombinationNumber", max: 4, valid: /^\d{4}$/, rule: "4 digits" }],
    PasswordPadlock: PASSWORD_FIELDS,
    SafewordPadlock: PASSWORD_FIELDS,
    HighSecurityPadlock: [{ label: "Keys (member numbers, comma separated)", prop: "MemberNumberListKeys", max: 250, valid: /^\d+(,\d+)*$/, rule: "Member numbers separated by commas" }],
};

interface ItemTip {
    title: string;
    sub?: string;
    body?: string;
    attrs?: string[];
}

const COLOR_RECT = [1090, 15, 885, 970] as const;
/** Where BC's Appearance screen draws the player while a colour picker is open: x, y, zoom. */
const COLOR_CHARACTER = [660, 90, 0.95] as const;
const PERMISSIONS_BUTTON = [1775, 25, 90, 90] as const;
const BACK_BUTTON = [1885, 25, 90, 90] as const;

const editorRoot = "lscg-outfit-edit";
const EDITOR_ID = Object.freeze({
    root: editorRoot,
    styles: `${editorRoot}-style`,

    delete: `${editorRoot}-delete`,
    accept: `${editorRoot}-accept`,
    cancel: `${editorRoot}-cancel`,
    clone: `${editorRoot}-clone`,
    build: `${editorRoot}-build`,
    exit: `${editorRoot}-exit`,
    header: `${editorRoot}-header`,
    midDiv: `${editorRoot}-mid-grid`,
    botDiv: `${editorRoot}-bot-grid`,

    outfitName: `${editorRoot}-outfit-name`,
    outfitInput: `${editorRoot}-outfit-input`,
    optionsButton: `${editorRoot}-options-button`,
    outfitButton: `${editorRoot}-outfit-button`,
    combinationSelect: `${editorRoot}-combinations`,
    combinationLabel: `${editorRoot}-combination-label`,

    items: `${editorRoot}-items`,
    itemGroup: `${editorRoot}-item-group`,
    itemAsset: `${editorRoot}-item-asset`,
    itemOpen: `${editorRoot}-item-open`,
    itemGrid: `${editorRoot}-item-grid`,
    itemGridTitle: `${editorRoot}-item-grid-title`,
    itemTabItems: `${editorRoot}-item-tab-items`,
    itemTabCrafted: `${editorRoot}-item-tab-crafted`,
    itemLock: `${editorRoot}-item-lock`,
    lockModal: `${editorRoot}-lock-modal`,
    lockTitle: `${editorRoot}-lock-title`,
    lockCells: `${editorRoot}-lock-cells`,
    lockSettings: `${editorRoot}-lock-settings`,
    lockClose: `${editorRoot}-lock-close`,
    lockTip: `${editorRoot}-lock-tip`,
    itemCells: `${editorRoot}-item-cells`,
    itemClose: `${editorRoot}-item-close`,
    itemTip: `${editorRoot}-item-tip`,
    itemConfigure: `${editorRoot}-item-configure`,
    itemColor: `${editorRoot}-item-color`,
    itemRemove: `${editorRoot}-item-remove`,

    checkboxes: `${editorRoot}-checkboxes`,
});

export class GuiOutfits extends GuiSubscreen {
	static readonly ids = ID;	
    SelectedKey: string | undefined = undefined;
    SelectedOutfit: Outfit | undefined = undefined;
    IncomingCode: string = "";
    
    preview: Character | undefined = undefined;

	get name(): string {
		return "Outfit Collection";
	}

	get icon(): string {
		return ICONS.LEASH_HANDLE;
	}

	get settings(): OutfitSettings {
		return super.settings as OutfitSettings;
	}

	get outfitModule(): OutfitCollectionModule {
		return this.module as OutfitCollectionModule;
	}

    get help(): HelpInfo {
        return {
            label: "Open Outfit Collection Wiki on GitHub",
            link: "https://github.com/littlesera/LSCG/wiki/Outfit-Collection",
        };
    }

    OrderedKeys(): string[] {
        return this.outfitModule.data.GetOutfitNames().sort((a,b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
    }

    _outfitFilter: {
        clothes: boolean,
        items: boolean,
        cosplay: boolean,
        hair: boolean,
        skin: boolean,
        body: boolean,
        gender: boolean
    } = {
        clothes: true,
        items: true,
        cosplay: true,
        hair: true,
        skin: true,
        body: true,
        gender: true,
    };

    screens = {
        [root]: Object.freeze({
            shape: [GuiSubscreen.START_X, GuiSubscreen.START_Y - 25, 1900 - GuiSubscreen.START_X + 4, 740] as RectTuple,
            visibility: "visible",
            dom: <div id={ID.root} class="lscg-screen">
                <style id={ID.styles}>{styles}</style>
                <div id={ID.buttonOuterGrid}>
                    <h1 id={ID.itemSets} z-index={1}>Outfits</h1>
                    <div id={ID.buttonInnerGrid0}>
                        {this.OrderedKeys().map((key, i, arr) => createButton(this, key, i, key => this.clickOutfit(key)))}
                    </div>
                </div>

                <div id={ID.storage}>
                    <div id={ID.storageInner}/>
                </div>
                <div id={ID.storageFooter}/>
                <div id={ID.newOutfit}>
                    {IconButton("./Icons/Plus.png", "New Outfit", () => this.NewOutfit(), { id: ID.newOutfitButton, tooltipPosition: "left" })}
                </div>
                <div id={ID.storageType}>
                    <label>
                        Storage: 
                        <select id={ID.storageTypeSelect} value={OutfitStorageStrategy[this.outfitModule.data.strategy]} onChange={(evt) => this.SelectStorageStrategy(evt.currentTarget)}>
                            <option value={OutfitStorageStrategy[OutfitStorageStrategy.SERVER]}>BC Server</option>
                            <option value={OutfitStorageStrategy[OutfitStorageStrategy.LOCALSTORE]}>Local Storage</option>
                        </select>
                        <span class="lscg-button-tooltip" id={ID.storageTooltip}>
                            Change Storage Location
                        </span>
                    </label>
                </div>
            </div>,
        }),
        [editorRoot]: Object.freeze({
            shape: [GuiSubscreen.START_X + 500, GuiSubscreen.START_Y - 130, 1300 - GuiSubscreen.START_X, 850] as RectTuple,
            visibility: "hidden",
            dom: <div id={EDITOR_ID.root} class="lscg-screen">
                <style id={EDITOR_ID.styles}>{editorStyles}</style>
                {
                    ElementMenu.Create(
                        "lscg-outfit-edit-menubar",
                        [
                            <h1 id={EDITOR_ID.header}>{"Edit Outfit"}</h1>,
                            ElementButton.Create(
                                EDITOR_ID.delete,
                                () => this.DeleteOutfit(),
                                { image: "./Icons/Trash.png", tooltip: "Delete Outfit", tooltipPosition: "right" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.build,
                                () => this.#startCreator(),
                                { image: "./Icons/Dress.png", tooltip: "Edit in Wardrobe", tooltipPosition: "right" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.clone,
                                () => this.CloneOutfit(),
                                { image: "./Icons/Layering.png", tooltip: "Clone Outfit", tooltipPosition: "right" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.accept,
                                () => this.SaveOutfit(),
                                { image: "./Icons/Accept.png", tooltip: "Save Outfit:\nMissing outfit", tooltipPosition: "left" },
                                { button: { attributes: { form: "lscg-outfit-edit-form", type: "submit", "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.cancel,
                                () => this.CancelOutfit(),
                                { image: "./Icons/Cancel.png", tooltip: "Cancel", tooltipPosition: "left" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            ),
                        ],
                        { direction: "ltr" },
                    )
                }
                <div id={EDITOR_ID.itemGrid} class="lscg-popup" role="dialog" aria-label="Items" hidden>
                    <div class="lscg-item-head">
                        <h2 id={EDITOR_ID.itemGridTitle}>Items</h2>
                        <div class="lscg-item-tabs" role="tablist">
                            <button id={EDITOR_ID.itemTabItems} role="tab" aria-selected="true" onClick={() => this.#setGridTab("items")}>Items</button>
                            <button id={EDITOR_ID.itemTabCrafted} role="tab" aria-selected="false" onClick={() => this.#setGridTab("crafted")}>Crafted</button>
                        </div>
                        <button id={EDITOR_ID.itemClose} class="lscg-popup-close" aria-label="Close" title="Close" onClick={() => this.#closeGrid()}>×</button>
                    </div>
                    <div id={EDITOR_ID.itemCells} class="lscg-item-cells scroll-box" role="listbox" onScroll={() => this.#hideItemTips()}/>
                    <div id={EDITOR_ID.itemTip} class="lscg-item-tip" role="tooltip" hidden/>
                </div>
                <div id={EDITOR_ID.lockModal} class="lscg-popup" role="dialog" aria-label="Lock" hidden>
                    <div class="lscg-item-head">
                        <h2 id={EDITOR_ID.lockTitle}>Lock</h2>
                        <button id={EDITOR_ID.lockClose} class="lscg-popup-close" aria-label="Close" title="Close" onClick={() => this.#closeLockModal()}>×</button>
                    </div>
                    <div id={EDITOR_ID.lockCells} class="lscg-item-cells scroll-box" role="listbox" onScroll={() => this.#hideItemTips()}/>
                    <div id={EDITOR_ID.lockSettings} class="lscg-lock-settings"/>
                    <div id={EDITOR_ID.lockTip} class="lscg-item-tip" role="tooltip" hidden/>
                </div>
                <div id="lscg-outfit-edit-form" role="form" class="scroll-box" aria-labelledby={EDITOR_ID.header}>
                    <input
                        type="text"
                        id={EDITOR_ID.outfitName}
                        placeholder="Outfit name"
                        aria-label="Outfit name"
                        maxLength={70}
                        onInput={(e) => {
                            if (this.SelectedOutfit) {
                                this.SelectedOutfit.key = (e.target as HTMLInputElement).value;
                            }
                            this.#updateButton(EDITOR_ID.accept);
                        }}
                    />
                    <input
                        type="text"
                        id={EDITOR_ID.outfitInput}
                        placeholder="Outfit code"
                        aria-label="Outfit code"
                        onInput={(e) => {
                            this.IncomingCode = (e.target as HTMLInputElement).value;
                            this.#updateButton(EDITOR_ID.outfitButton);
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                    />
                    {ElementButton.Create(
                        EDITOR_ID.optionsButton,
                        () => this.#showParseOptions(),
                        {
                            tooltip: "Filter Options",
                            label: "⚙️",
                            labelPosition: "center",
                            tooltipPosition: "bottom",
                            tooltipRole: "label",
                        },
                        {
                            label: { attributes: { "aria-hidden": "true" } },
                        },
                    )}
                    {ElementButton.Create(
                        EDITOR_ID.outfitButton,
                        () => {
                            this.setFilteredIncoming();
                            this.#updateButton(EDITOR_ID.accept, true);
                        },
                        {
                            tooltip: "Parse the outfit code",
                            label: "Parse ✅",
                            labelPosition: "center",
                            disabled: true,
                            tooltipPosition: "bottom",
                            tooltipRole: "label",
                        },
                        {
                            label: { attributes: { "aria-hidden": "true" } },
                        },
                    )}
                    <div id={EDITOR_ID.combinationSelect}>
                    </div>
                    <label id={EDITOR_ID.combinationLabel}>Inherited Outfits:</label>
                    <div id={EDITOR_ID.checkboxes}>
                        {this.createCheckboxes()}
                    </div>
                    <div id={EDITOR_ID.items}>
                        <select id={EDITOR_ID.itemGroup} aria-label="Item group" onChange={() => this.#groupChosen()}/>
                        <select id={EDITOR_ID.itemAsset} aria-label="Item" hidden onChange={() => this.#updateItemPanel()}/>
                        <button class="lscg-button" id={EDITOR_ID.itemOpen} aria-label="Choose item" onClick={() => this.#gridOpen() ? this.#closeGrid() : this.#openGrid()}>Choose item</button>
                        {ElementButton.Create(
                            EDITOR_ID.itemConfigure,
                            () => this.#focusItem("extended"),
                            { image: "./Icons/Extensions.png", tooltip: "Item options", tooltipPosition: "top" },
                            { button: { attributes: { "screen-generated": undefined } } },
                        )}
                        {ElementButton.Create(
                            EDITOR_ID.itemColor,
                            () => this.#focusItem("color"),
                            { image: "./Icons/Color.png", tooltip: "Color", tooltipPosition: "top" },
                            { button: { attributes: { "screen-generated": undefined } } },
                        )}
                        {ElementButton.Create(
                            EDITOR_ID.itemLock,
                            () => this.#openLockModal(),
                            { image: "./Icons/Security.png", tooltip: "Lock", tooltipPosition: "top" },
                            { button: { attributes: { "screen-generated": undefined } } },
                        )}
                        {ElementButton.Create(
                            EDITOR_ID.itemRemove,
                            () => this.#removeItem(),
                            { image: "./Icons/Trash.png", tooltip: "Remove from outfit", tooltipPosition: "top" },
                            { button: { attributes: { "screen-generated": undefined } } },
                        )}
                    </div>
                </div>
            </div>,
        }),
    };

    #showScreen(screenId: string) {
        for (const [id] of entries(this.screens)) {
            const ele = document.getElementById(id);
            if (!ele) return;
            if (id === screenId) ele.style["visibility"] = "visible";
            else ele.style["visibility"] = "hidden";
        }
    }

    charHook: (() => void) | undefined;
    #leaveHook: (() => void) | undefined;
    #focusHooks: (() => void)[] = [];
    #chrome = new DomSettingsHost("lscg-outfit-chrome", this, () => []);
    /** BC's own extended-item or colour widget is open on the preview; it takes over Run/Click until it exits. */
    #focus: { kind: "extended" | "color", group: AssetGroupName } | undefined;

    _unhookResize: (() => void) | undefined;
    Load(): void {
        CommonPhotoMode = true;
        this.charHook = hookFunction("CharacterGetCurrent", 1, (args, next) => {
            return this.preview ?? next(args);
        });

        // BC's leave would also switch dialog modes, which means nothing here
        this.#leaveHook = hookFunction("DialogLeaveFocusItem", 1, (args, next) => {
            if (!this.#focus) return next(args);
            if (DialogTightenLoosenItem) TightenLoosenItemExit();
            else ExtendedItemExit();
        });

        // The preview is a scratch copy, so the wearer's own restraints and the item's lock don't apply to editing it: BC
        // would otherwise refuse (locked, or the real player unable to interact) what the editor is allowed to change
        this.#focusHooks = [
            hookFunction("DialogCanUnlock", 1, (args, next) => this.#focus && args[0] === this.preview ? true : next(args)),
            hookFunction("Player.CanInteract", 1, (args, next) => this.#focus ? true : next(args)),
        ];

        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.preview = undefined;

        for (const [, { dom }] of entries(this.screens)) {
            document.body.appendChild(dom);
        }
        // Title, exit and help, like the other settings pages (mounted last, so over the screens)
        this.#chrome.mount();
        
        this.#refreshListing();
        
        this.#updateElements();
        this._unhookResize?.();
        this._unhookResize = onCanvasResize(load => this.Resize(load));

        const r = creatorResume;
        creatorResume = undefined;
        if (r) {
            this.SelectedKey = r.key;
            this.SelectedOutfit = r.outfit;
            this._outfitFilter = r.filter;
            this.#openEditor(r.incoming);
            // The editor's own input events clobber IncomingCode, so set it before filtering and again after
            this.IncomingCode = r.incoming;
            if (r.changed) {
                this.setFilteredIncoming();
                ElementValue(EDITOR_ID.outfitInput, this.SelectedOutfit.code);
                this.#updateButton(EDITOR_ID.accept);
            }
            this.IncomingCode = r.incoming;
        }
    }

    /** Edits the outfit as it is now: the preview, which for a new outfit is just your naked character. */
    #startCreator() {
        if (!this.SelectedOutfit || !this.preview) return;

        const id = `${OUTFIT_CREATOR_ID}-${Player.MemberNumber}`;
        const stale = Character.find(c => c.CharacterID === `LSCG-${id}`);
        if (stale) CharacterDelete(stale, false);

        const edit = CopyCharacter(Player, id);
        edit.Appearance = AppearanceItemParse(CharacterAppearanceStringify(this.preview));
        CharacterRefresh(edit, false, false);

        creatorResume = {
            key: this.SelectedKey,
            outfit: { ...this.SelectedOutfit },
            incoming: this.IncomingCode,
            changed: false,
            start: Object.fromEntries(BC_ItemsToItemBundles(edit.Appearance).map(b => [b.Group, JSON.stringify(b)])),
            groups: this.outfitModule.data.ConvertToBundle(this.IncomingCode).map(b => b.Group),
            filter: { ...this._outfitFilter },
            returnScreen: InformationSheetReturnScreen ?? ["Room", "MainHall"],
            edit,
        };
        // The Player's blindness, hypnosis tint and the like belong to the chat room, not to the character being edited
        appearanceHook = hookFunction("AppearanceRun", 1, (args, next) => drawUnaffected(() => next(args)));
        CharacterAppearanceLoadCharacter(edit, ok => this.#finishCreator(ok));
    }

    /** Appearance screen closed: capture the result, then rebuild Preferences > LSCG > Outfit Collection. */
    async #finishCreator(accepted: boolean) {
        appearanceHook?.();
        appearanceHook = undefined;
        const r = creatorResume;
        if (!r) return;
        if (accepted) {
            // Keep what the outfit already had, plus whatever the user changed or added, but not the starting body's untouched groups
            const kept = BC_ItemsToItemBundles(r.edit.Appearance).filter(b => r.groups.includes(b.Group) || r.start[b.Group] !== JSON.stringify(b));
            r.incoming = this.outfitModule.data.EncodeBundle(kept);
        }
        r.changed = accepted;
        CharacterDelete(r.edit, false);
        await CommonSetScreen("Character", "Preference");
        // ponytail: CommonSetScreen doesn't wait for PreferenceLoad's own open of "Main", which would land after ours; settle first
        for (let i = 0; i < 100 && (CurrentScreen !== "Preference" || PreferenceSubscreen?.name !== "Main" || !document.getElementById("preference-subscreen")); i++)
            await new Promise(resolve => setTimeout(resolve, 50));
        await new Promise(resolve => setTimeout(resolve, 300));
        await PreferenceSubscreenExtensionsOpen("LSCG", r.returnScreen);
        setSubscreen(this.name);
    }

    Resize(load: boolean) {
        // Different positions based on the width/height ratio
        const heightRatio = MainCanvas.canvas.clientHeight / 1000;
        const widthRatio = MainCanvas.canvas.clientWidth / 2000;
        for (const [id, { shape, visibility }] of entries(this.screens)) {
            const left = MainCanvas.canvas.offsetLeft + shape[0] * widthRatio;
            const top = MainCanvas.canvas.offsetTop + shape[1] * heightRatio;
            const width = shape[2] * widthRatio;
            const height = shape[3] * heightRatio;

            const style: Partial<CSSStyleDeclaration> = {
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
            };
            if (load) {
                style.fontFamily = CommonGetFontName();
                style.visibility = visibility;
            }

            const elem = document.getElementById(id) as HTMLElement;
            if (elem)
                Object.assign(elem.style, style);
        }
    }

    Exit(): void {
        // Escape and the exit door back out one layer at a time: item widget, item grid, editor, then the screen
        if (this.#focus) {
            if (this.#focus.kind === "color") ItemColorExitClick();
            else DialogLeaveFocusItem();
            return;
        }
        if (this.#lockModalOpen()) {
            this.#closeLockModal();
            return;
        }
        if (this.#gridOpen()) {
            this.#closeGrid();
            return;
        }
        if (this.SelectedOutfit) {
            this.CancelOutfit();
            return;
        }
        this.#teardown();
        super.Exit();
    }

    /** BC unloads the screen without an Exit when it leaves Preferences itself (e.g. being led out of the room). */
    Unload(): void {
        this.#teardown();
    }

    #teardown() {
        if (!this.charHook) return; // not loaded, or already torn down
        document.activeElement?.dispatchEvent(new FocusEvent("blur"));
        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.#clearFocus();
        this.#dropPreview();
        for (const [id] of entries(this.screens)) {
            ElementRemove(id);
        }
        this.charHook();
        this.charHook = undefined;
        this.#leaveHook?.();
        this.#leaveHook = undefined;
        this.#chrome.unmount();
        this.#focusHooks.forEach(unhook => unhook());
        this.#focusHooks = [];
        CommonPhotoMode = false;
        this._unhookResize?.();
        this._unhookResize = undefined;
    }

    #refreshListing() {
        const existing = document.getElementById(ID.buttonInnerGrid0);
        if (existing)
            existing.replaceChildren(...this.OrderedKeys().map((key, i, arr) => createButton(this, key, i, key => this.clickOutfit(key))));
    }

    #updateElements() {
        const storageOuter = document.getElementById(ID.storage) as HTMLElement;
        const storageInner = document.getElementById(ID.storageInner) as HTMLElement;

        const storageFooter = document.getElementById(ID.storageFooter) as HTMLElement;
        const storageSelect = document.getElementById(ID.storageTypeSelect) as HTMLSelectElement;
        const strategy = this.outfitModule.data.strategy;

        const nKBTotal = clamp(byteToKB(this.outfitModule.data.GetOutfitCollectionBytes()), 0, 9999);
        const percentage = strategy == OutfitStorageStrategy.SERVER ? Math.min(100, 100 * nKBTotal / (MAX_DATA / 1000)) : 0;
        storageFooter.innerText = `${nKBTotal} / ${strategy == OutfitStorageStrategy.SERVER ? (MAX_DATA / 1000) : "♾️"} KB`;
        storageInner.style.height = `${100 - percentage}%`;
        storageInner.style.backgroundColor = "var(--lscg-background-color)";
        storageInner.style.borderBottom = "min(0.3dvh, 0.15dvw) solid var(--lscg-border-color)";
        storageOuter.style.boxShadow = percentage >= 90 ? "0 0 min(2dvh, 1dvw) red" : "";

        storageSelect.value = OutfitStorageStrategy[strategy];
    }

    clickOutfit(key: string) {
        if (!key) return;
        this.SelectedKey = key.toLocaleLowerCase();
        this.SelectedOutfit = Object.assign({}, this.outfitModule.data.GetOutfit(key));
        this.#openEditor();
    }

    NewOutfit() {
        this.SelectedKey = "";
        this.SelectedOutfit = {
            key: "",
            code: "",
            inherit: [],
        } as Outfit;
        this.#openEditor();
    }

    /********************* EDITOR *****************************/

    /** Where the preview is drawn. Lifted just enough that the lowest item zone still fits on the screen, as a character
     *  who's kneeling or posed puts zones further down than a standing one. */
    get coords() {
        const base = { x: 200, y: 175, zoom: 0.78 };
        const bottomLimit = base.y + 1000 * base.zoom;
        if (!this.preview) return base;
        const bottom = Math.max(0, ...this.#zoneGroups().flatMap(g => g.Zone!.map(z => {
            const [, y, , h] = DialogGetCharacterZone(this.preview!, z, base.x, base.y, base.zoom, 1);
            return y + h;
        })));
        return { ...base, y: base.y - Math.max(0, bottom - bottomLimit) };
    }

    Run(): void {
        super.Run();
        if (this.#focus && this.preview) {
            const preview = this.preview;
            // The colour picker gets BC's dark dialog look over the whole screen: the transparent controls LSCG's opacity
            // module adds to it (layer checkboxes, opacity slider) are made for that, not for the parchment
            const color = this.#focus.kind === "color";
            if (color) DrawRect(0, 0, 2000, 1000, "Black");
            // Colouring draws the character where BC's Appearance screen does, at centre: LSCG's click-and-drag translation
            // only listens there (x 700-1200) and counts drag distance at that scale
            drawUnaffected(() => color
                ? DrawCharacter(preview, ...COLOR_CHARACTER, false)
                : DrawCharacter(preview, this.coords.x, this.coords.y, this.coords.zoom, false));
            MainCanvas.textAlign = "center"; // the Preferences wrapper leaves it left, BC's widgets expect centered
            try {
                this.#drawFocus(preview, this.#focus);
            } finally {
                MainCanvas.textAlign = "left";
            }
            return;
        }
        if (this.preview) {
            //DrawText("- LSCG Edit Outfit -", GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
            const preview = this.preview;
            drawUnaffected(() => DrawCharacter(preview, this.coords.x, this.coords.y, this.coords.zoom, false));

            // Every item zone, filled when it has something on; click one to pick its group
            const selected = this.#itemGroup()?.Name;
            let hover: AssetGroup | undefined;
            for (const Group of this.#zoneGroups()) {
                const picked = Group.Name === selected;
                const occupied = !!InventoryGet(preview, Group.Name);
                DrawAssetGroupZone(preview, Group.Zone!, this.coords.zoom, this.coords.x, this.coords.y, 1, picked ? "#00d5d5" : "#808080", 3, picked ? "#00d5d533" : occupied ? "#00FF0022" : "#80808011");
                if (!hover && this.#inZone(Group)) hover = Group;
            }
            if (hover) {
                const worn = InventoryGet(preview, hover.Name);
                drawTooltip(150, 900, 550, `${hover.Description}: ${worn?.Craft?.Name ?? worn?.Asset.Description ?? "empty"}`, "left");
            }

            // if (!!this.preview?.FocusGroup) {
            //     DrawRect(1000, 0, 1000, 1000, "Black");
            // }
        }
    }

    Click(): void {
        if (this.#focus && this.preview) {
            this.#clickFocus(this.preview, this.#focus);
            return;
        }
        // A click outside the item picker only closes it, rather than also picking the zone under the mouse
        if (this.#gridOpen()) {
            this.#closeGrid();
            return;
        }
        if (this.preview) {
            const group = this.#zoneGroups().find(g => this.#inZone(g));
            if (group) this.#pickGroup(group.Name);
        }
        super.Click();
    }

    #zoneGroups(): AssetGroup[] {
        return AssetGroup.filter(g => g.IsItem() && g.Zone?.length);
    }

    /** Zones follow the character that's drawn: the player's own pose (kneeling, say) would shift them off the preview. */
    #inZone(group: AssetGroup): boolean {
        return !!this.preview && !!group.Zone?.some(z => DialogClickedInZone(this.preview!, z, this.coords.zoom, this.coords.x, this.coords.y, 1));
    }

    #pickGroup(name: AssetGroupName) {
        const sel = document.getElementById(EDITOR_ID.itemGroup) as HTMLSelectElement | null;
        if (!sel) return;
        sel.value = name;
        this.#groupChosen();
    }

    /** A group was picked. An empty one opens the item grid; one that already has an item waits for a click on the item box. */
    #groupChosen() {
        this.#fillAssets();
        const group = this.#itemGroup();
        const occupied = !!group && !!this.preview && !!InventoryGet(this.preview, group.Name);
        if (!occupied || this.#gridOpen()) this.#openGrid();
    }

    setFilteredIncoming() {
        if (!this.IncomingCode || !this.SelectedOutfit) return;
        let itemList = this.outfitModule.data.ConvertToBundle(this.IncomingCode);
        itemList = this.filterItems(itemList);
        this.SelectedOutfit.code = this.outfitModule.data.EncodeBundle(itemList);
        this.reloadPreviewAppearance();
    }

    filterItems(itemList: ItemBundle[]): ItemBundle[] {
        return itemList.filter(item => {
            let assetGroup: AssetGroup | undefined;
            try {
                assetGroup = smartGetAssetGroup(item.Group);
            } catch (e) { /* ignore */ }

            if (!assetGroup) return false;

            const defaultCheck = (assetGroup.IsAppearance() || assetGroup.IsItem());

            const bodyFilter = 
                (this._outfitFilter.body && isBody(assetGroup)) ||
                (this._outfitFilter.hair && isHair(assetGroup)) ||
                (this._outfitFilter.skin && isSkin(assetGroup)) ||
                (this._outfitFilter.gender && (isGenitals(assetGroup) || isPronouns(assetGroup)));
            
            const itemClothesFilter = 
                (this._outfitFilter.clothes && isCloth(assetGroup)) ||
                (this._outfitFilter.items && isBind(assetGroup, [])) ||
                (this._outfitFilter.cosplay && isCosplay(assetGroup));

            return defaultCheck &&
                    (itemClothesFilter || bodyFilter);
        });
    }

    /********************* ITEM PANEL *****************************/

    #itemGroup(): AssetGroup | undefined {
        const name = (document.getElementById(EDITOR_ID.itemGroup) as HTMLSelectElement | null)?.value;
        return AssetGroup.find(g => g.Name === name);
    }

    #fillGroups() {
        const sel = document.getElementById(EDITOR_ID.itemGroup) as HTMLSelectElement | null;
        if (!sel || sel.options.length) return;
        sel.replaceChildren(...AssetGroup.filter(g => g.IsItem()).map(g => <option value={g.Name}>{g.Description}</option>));
        this.#fillAssets();
    }

    #fillAssets() {
        const sel = document.getElementById(EDITOR_ID.itemAsset) as HTMLSelectElement | null;
        const group = this.#itemGroup();
        if (!sel || !group) return;
        // ponytail: permissions wide open on purpose; only skips assets BC itself hides or disables
        sel.replaceChildren(...group.Asset.filter(a => a.Enable && a.Visible).map(a => <option value={a.Name}>{a.Description}</option>));
        const worn = this.preview && InventoryGet(this.preview, group.Name);
        if (worn) sel.value = worn.Asset.Name;
        this.#updateItemPanel();
    }

    /** Bumped on every open, so an older grid's redraw timer notices it was replaced. */
    #gridGen = 0;

    #gridOpen(): boolean {
        const grid = document.getElementById(EDITOR_ID.itemGrid);
        return !!grid && !grid.hidden;
    }

    #closeGrid() {
        const grid = document.getElementById(EDITOR_ID.itemGrid);
        if (grid) grid.hidden = true;
        this.#hideItemTips();
    }

    /** The hovered cell's tooltip, whose own label is truncated. Below the cell, or above it when there's no room below. */
    #showItemTip(cell: HTMLElement, content: ItemTip, tip: HTMLElement, popup: HTMLElement) {
        tip.replaceChildren(
            <b>{content.title}</b>,
            ...(content.sub ? [<div class="lscg-tip-sub">{content.sub}</div>] : []),
            ...(content.body ? [<div class="lscg-tip-body">{content.body}</div>] : []),
            ...(content.attrs?.length ? [<div class="lscg-tip-attrs">LSCG: {content.attrs.join(", ")}</div>] : []),
        );
        tip.hidden = false;
        const root = popup.getBoundingClientRect();
        const at = cell.getBoundingClientRect();
        const below = at.bottom - root.top + 4;
        const top = below + tip.offsetHeight <= root.height ? below : at.top - root.top - tip.offsetHeight - 4;
        tip.style.top = `${Math.max(0, top)}px`;
        const left = at.left - root.left + (at.width - tip.offsetWidth) / 2;
        tip.style.left = `${Math.max(0, Math.min(left, root.width - tip.offsetWidth))}px`;
    }

    #hideItemTips() {
        for (const id of [EDITOR_ID.itemTip, EDITOR_ID.lockTip]) {
            const tip = document.getElementById(id);
            if (tip) tip.hidden = true;
        }
    }

    /** Which tab the item grid shows: BC's items for the group, or the player's own crafted items that fit it. */
    #gridTab: GridTab = "items";

    /** The player's crafted items (from their crafting lists) whose item belongs to `group`. */
    #craftsFor(group: AssetGroup): { craft: CraftingItem, asset: Asset }[] {
        return (Player.Crafting ?? []).flatMap(craft => {
            const asset = craft && (CraftingAssets[craft.Item] ?? []).find(a => a.Group.Name === group.Name && a.Enable);
            return craft && asset ? [{ craft, asset }] : [];
        });
    }

    /** What a crafted item's tooltip says: its name, base item and description, plus any LSCG behavior its text gives it. */
    #craftTip(craft: CraftingItem, asset: Asset): ItemTip {
        const description = (typeof CraftingDescription === "undefined" ? craft.Description : CraftingDescription.Decode(craft.Description)).trim();
        const drugs = getModule<InjectorModule>("InjectorModule")?.GetDrugTypes(craft) ?? [];
        return {
            title: craft.Name,
            sub: asset.Description,
            body: description,
            attrs: [...craftKeywords(craft).map(k => k.slice(1, -1)), ...drugs.map(d => `${d} drug`)],
        };
    }

    #setGridTab(tab: GridTab) {
        this.#gridTab = tab;
        this.#openGrid();
    }

    /** BC-style scrollable grid of the group's items or crafted items, using BC's own preview images; picking one puts it on. */
    #openGrid() {
        const grid = document.getElementById(EDITOR_ID.itemGrid);
        const cells = document.getElementById(EDITOR_ID.itemCells);
        const tip = document.getElementById(EDITOR_ID.itemTip);
        const group = this.#itemGroup();
        if (!grid || !cells || !tip || !group || !this.preview) return;
        this.#closeLockModal();
        const wornItem = InventoryGet(this.preview, group.Name);
        const crafts = this.#craftsFor(group);
        if (!crafts.length) this.#gridTab = "items";

        (document.getElementById(EDITOR_ID.itemGridTitle) as HTMLElement).innerText = group.Description;
        const tabs: [string, GridTab, string, string | undefined][] = [
            [EDITOR_ID.itemTabItems, "items", "Items", undefined],
            [EDITOR_ID.itemTabCrafted, "crafted", `Crafted (${crafts.length})`, crafts.length ? undefined : "None of your crafted items fit this group"],
        ];
        for (const [id, tab, label, disabledReason] of tabs) {
            const button = document.getElementById(id) as HTMLButtonElement;
            button.innerText = label;
            button.setAttribute("aria-selected", String(this.#gridTab === tab));
            button.disabled = !!disabledReason;
            button.title = disabledReason ?? "";
        }

        const entries: GridEntry[] = this.#gridTab === "crafted"
            ? crafts.map(({ craft, asset }) => ({
                asset, label: craft.Name, tip: this.#craftTip(craft, asset),
                worn: wornItem?.Asset.Name === asset.Name && wornItem.Craft?.Name === craft.Name,
                pick: () => this.#wearCraft(group, asset, craft),
            }))
            : group.Asset.filter(a => a.Enable && a.Visible).map(a => ({
                asset: a, label: a.Description, tip: { title: a.Description },
                worn: wornItem?.Asset.Name === a.Name && !wornItem.Craft,
                pick: () => this.#pickAsset(a.Name),
            }));

        grid.hidden = false;
        this.#renderCells(grid, cells, tip, entries);
    }

    /**
     * Fills a popup's scrolling cell grid. Previews are drawn by BC's own item preview, so images come through the same loader
     * (and any mod hooks on it) as in its dialogs, and then scrolls to the selected cell.
     */
    #renderCells(popup: HTMLElement, cells: HTMLElement, tip: HTMLElement, entries: GridEntry[]) {
        const preview = this.preview;
        const gen = String(++this.#gridGen);
        cells.dataset.gen = gen;
        const previews: [Asset | string, CanvasRenderingContext2D][] = [];
        cells.replaceChildren(...entries.map(e => {
            const canvas = <canvas width={ITEM_PREVIEW_SIZE} height={ITEM_PREVIEW_SIZE} aria-hidden="true"/> as HTMLCanvasElement;
            previews.push([(e.asset ?? e.icon)!, canvas.getContext("2d")!]);
            return (
                <button class={`lscg-item-cell${e.worn ? " worn" : ""}`} role="option" aria-selected={e.worn} aria-label={e.tip.sub ? `${e.tip.title} (${e.tip.sub})` : e.tip.title} onClick={e.pick} onMouseEnter={ev => this.#showItemTip(ev.currentTarget, e.tip, tip, popup)} onMouseLeave={() => this.#hideItemTips()}>
                    {canvas}
                    <span>{e.label}</span>
                </button>
            );
        }));
        const drawAll = () => {
            const main = MainCanvas;
            try {
                for (const [asset, ctx] of previews) {
                    MainCanvas = ctx;
                    // Transparent, so the cell's own color (white, the selected teal, hover) shows behind the image and its label
                    ctx.clearRect(0, 0, ITEM_PREVIEW_SIZE, ITEM_PREVIEW_SIZE);
                    if (typeof asset === "string")
                        DrawImageResize(asset, ITEM_PREVIEW_SIZE * 0.2, ITEM_PREVIEW_SIZE * 0.2, ITEM_PREVIEW_SIZE * 0.6, ITEM_PREVIEW_SIZE * 0.6);
                    else
                        DrawAssetPreview(0, 0, asset, { C: preview, Description: "", Background: "transparent", Width: ITEM_PREVIEW_SIZE, Height: ITEM_PREVIEW_SIZE });
                }
            } finally {
                MainCanvas = main;
            }
        };
        drawAll();
        // ponytail: images arrive asynchronously, so redraw every 250ms for ~10s while the popup stays open
        let ticks = 0;
        const timer = setInterval(() => {
            if (cells.dataset.gen !== gen || !cells.isConnected || popup.hidden || ++ticks > 40) clearInterval(timer);
            else drawAll();
        }, 250);
        // Land on what's selected, so it isn't off-screen below the first rows
        const selected = cells.querySelector<HTMLElement>(".worn");
        cells.scrollTop = selected ? Math.max(0, selected.offsetTop - cells.offsetTop - cells.clientHeight / 2 + selected.offsetHeight / 2) : 0;
    }

    /********************* LOCK MODAL *****************************/

    #lockModalOpen(): boolean {
        const modal = document.getElementById(EDITOR_ID.lockModal);
        return !!modal && !modal.hidden;
    }

    #closeLockModal() {
        const modal = document.getElementById(EDITOR_ID.lockModal);
        if (modal) modal.hidden = true;
        this.#hideItemTips();
    }

    /** The lock chooser, with the chosen lock's own settings (combination, password...) as plain fields underneath. */
    #openLockModal() {
        const modal = document.getElementById(EDITOR_ID.lockModal);
        const cells = document.getElementById(EDITOR_ID.lockCells);
        const tip = document.getElementById(EDITOR_ID.lockTip);
        const group = this.#itemGroup();
        const item = group && this.preview ? InventoryGet(this.preview, group.Name) : null;
        if (!modal || !cells || !tip || !group || !item || !InventoryDoesItemAllowLock(item)) return;
        this.#closeGrid();

        (document.getElementById(EDITOR_ID.lockTitle) as HTMLElement).innerText = `${group.Description}: ${item.Craft?.Name ?? item.Asset.Description}`;
        const wornLock = item.Property?.LockedBy;
        const entries: GridEntry[] = [
            ...(wornLock ? [{ icon: "Icons/Cancel.png", label: "No lock", tip: { title: "No lock", sub: "Take the lock off" }, worn: false, pick: () => this.#chooseLock(group, null) }] : []),
            // Timer locks keep an absolute expiry time, which would already have passed whenever the outfit is applied
            ...Asset.filter(a => a.IsLock && a.Enable && a.RemoveTimer <= 0 && !/Timer/.test(a.Name)).map(a => ({
                asset: a, label: a.Description, tip: { title: a.Description }, worn: a.Name === wornLock, pick: () => this.#chooseLock(group, a),
            })),
        ];
        modal.hidden = false;
        this.#renderCells(modal, cells, tip, entries);
        this.#renderLockSettings(group, item);
    }

    /** Puts a lock on the group's item, or takes it off. The modal stays open so the lock's settings are right there. */
    #chooseLock(group: AssetGroup, lock: Asset | null) {
        if (!this.preview) return;
        const item = InventoryGet(this.preview, group.Name);
        if (!item) return;
        if (!lock) {
            InventoryUnlock(this.preview, item, false);
        } else if (item.Property?.LockedBy !== lock.Name) {
            InventoryLock(this.preview, item, lock.Name as AssetLockType, Player, false);
            if (item.Property?.LockedBy !== lock.Name) {
                ToastManager.info(`${lock.Description} doesn't fit that item.`);
                return;
            }
        }
        this.#commitGroup(group.Name, true);
        this.#openLockModal();
    }

    /** The settings fields of the lock on `item`, written straight into its properties (no old code needed: this is the editor). */
    #renderLockSettings(group: AssetGroup, item: Item) {
        const box = document.getElementById(EDITOR_ID.lockSettings);
        if (!box) return;
        const lockName = item.Property?.LockedBy;
        const fields = lockName ? LOCK_SETTINGS[lockName] : undefined;
        if (!lockName) {
            box.replaceChildren(<p class="lscg-lock-note">Pick a lock. It goes on the {item.Craft?.Name ?? item.Asset.Description}.</p>);
        } else if (!fields) {
            box.replaceChildren(<p class="lscg-lock-note">{InventoryGetLock(item)?.Asset.Description ?? lockName} has no settings.</p>);
        } else {
            box.replaceChildren(...fields.map(f => {
                const id = `${EDITOR_ID.lockSettings}-${f.prop}`;
                const input = <input
                    id={id} type="text" maxLength={f.max} value={String(item.Property?.[f.prop as keyof ItemProperties] ?? "")}
                    onChange={() => this.#setLockField(group, f, input)}
                /> as HTMLInputElement;
                return <label class="lscg-lock-field" for={id}><span>{f.label}</span>{input}</label>;
            }));
        }
    }

    #setLockField(group: AssetGroup, field: LockField, input: HTMLInputElement) {
        const item = this.preview && InventoryGet(this.preview, group.Name);
        if (!item?.Property) return;
        const value = field.upper ? input.value.toUpperCase() : input.value;
        const valid = field.valid.test(value);
        input.toggleAttribute("aria-invalid", !valid);
        input.title = valid ? "" : field.rule;
        if (!valid) return; // keep the old value in the item; the field shows what's wrong
        input.value = value;
        (item.Property as Record<string, unknown>)[field.prop] = value;
        this.#commitGroup(group.Name, true);
        this.#openLockModal();
    }

    /** Wears a crafted item: BC applies the craft's color, type and lock. A copy, so the player's own list isn't touched. */
    #wearCraft(group: AssetGroup, asset: Asset, craft: CraftingItem) {
        if (!this.preview) return;
        this.#closeGrid();
        InventoryWear(this.preview, asset.Name, group.Name, undefined, 0, Player.MemberNumber, structuredClone(craft));
        this.#commitGroup(group.Name, true);
    }

    #pickAsset(name: string) {
        const sel = document.getElementById(EDITOR_ID.itemAsset) as HTMLSelectElement | null;
        if (!sel) return;
        sel.value = name;
        this.#setItem();
    }

    #updateItemPanel() {
        const group = this.#itemGroup();
        const worn = group && this.preview ? InventoryGet(this.preview, group.Name) : null;
        const set = (id: string, disabled: boolean) => { (document.getElementById(id) as HTMLButtonElement | null)?.toggleAttribute("disabled", disabled); };
        const open = document.getElementById(EDITOR_ID.itemOpen);
        if (open) open.innerText = worn ? (worn.Craft?.Name ?? worn.Asset.Description) : "Choose item";
        set(EDITOR_ID.itemConfigure, !worn?.Asset.Extended);
        set(EDITOR_ID.itemColor, !worn || worn.Asset.ColorableLayerCount < 1);
        set(EDITOR_ID.itemLock, !worn || !InventoryDoesItemAllowLock(worn));
        set(EDITOR_ID.itemRemove, !worn);
    }

    /** Rewrites one group's bundle in the incoming code from the preview (or drops it), then reloads the preview from the result. */
    #commitGroup(group: AssetGroupName, keep: boolean) {
        if (!this.SelectedOutfit || !this.preview) return;
        const data = this.outfitModule.data;
        const bundles = data.ConvertToBundle(this.IncomingCode).filter(b => b.Group !== group);
        const item = keep ? InventoryGet(this.preview, group) : null;
        if (item) bundles.push(BC_ItemsToItemBundles([item])[0]);
        const incoming = data.EncodeBundle(bundles);
        this.IncomingCode = incoming;
        this.setFilteredIncoming();
        ElementValue(EDITOR_ID.outfitInput, this.SelectedOutfit.code);
        this.IncomingCode = incoming; // the input's own handler just overwrote it
        if (item && !data.ConvertToBundle(this.SelectedOutfit.code).some(b => b.Group === group))
            ToastManager.info("That item is hidden by the filter options, so it isn't in the outfit.");
        this.#updateButton(EDITOR_ID.accept);
        this.#updateButton(EDITOR_ID.outfitButton);
        this.#updateItemPanel();
    }

    #setItem() {
        const group = this.#itemGroup();
        const name = (document.getElementById(EDITOR_ID.itemAsset) as HTMLSelectElement | null)?.value;
        if (!group || !name || !this.preview) return;
        this.#closeGrid();
        InventoryWear(this.preview, name, group.Name, undefined, 0, Player.MemberNumber);
        this.#commitGroup(group.Name, true);
    }

    #removeItem() {
        const group = this.#itemGroup();
        if (group) this.#commitGroup(group.Name, false);
    }

    #focusItem(kind: "extended" | "color") {
        const group = this.#itemGroup();
        const item = group && this.preview ? InventoryGet(this.preview, group.Name) : null;
        if (!group || !item || !this.preview) return;
        this.#focus = { kind, group: group.Name };
        this.#closeGrid();
        this.#closeLockModal();
        this.#setChrome(false);
        if (kind === "color") {
            ItemColorLoad(this.preview, item, ...COLOR_RECT, true).then(() => ItemColorOnExit(() => setTimeout(() => this.#endFocus()))).catch(() => this.#endFocus());
        } else {
            DialogFocusItem = item;
            DialogFocusItemName = group.Name + item.Asset.Name;
            ExtendedItemInit(this.preview, item, false, true);
            CommonDynamicFunction(`Inventory${DialogFocusItemName}Load()`);
        }
    }

    /** The widget closed: write the (possibly changed) item back into the outfit and show the editor again. */
    #endFocus() {
        const focus = this.#focus;
        if (!focus) return;
        this.#clearFocus();
        this.#commitGroup(focus.group, true);
    }

    #clearFocus() {
        if (!this.#focus) return;
        if (this.#focus.kind === "extended") {
            DialogFocusItem = null;
            DialogFocusItemName = null;
            DialogTightenLoosenItem = null;
            ExtendedItemSubscreen = null;
        }
        this.#focus = undefined;
        this.#setChrome(true);
    }

    /** Shows the editor and Preferences' exit door, or hides them while one of BC's item widgets is up. */
    #setChrome(visible: boolean) {
        document.getElementById(editorRoot)?.style.setProperty("visibility", visible ? "visible" : "hidden");
        document.getElementById("preference-exit")?.style.setProperty("visibility", visible ? "visible" : "hidden");
        this.#chrome.root?.style.setProperty("visibility", visible ? "visible" : "hidden");
    }

    #drawFocus(preview: Character, focus: { kind: "extended" | "color", group: AssetGroupName }) {
        if (focus.kind === "color") {
            ItemColorDraw(preview, focus.group, ...COLOR_RECT);
        } else if (DialogTightenLoosenItem) {
            DrawRect(1000, 0, 1000, 1000, "Black"); // BC's item screens assume its dark dialog background
            TightenLoosenItemDraw(DialogTightenLoosenItem);
        } else if (DialogFocusItem) {
            DrawRect(1000, 0, 1000, 1000, "Black");
            // BC's permissions button means nothing here: keep its hover and tooltip from showing, then cover it
            const mouseX = MouseX;
            if (MouseIn(...PERMISSIONS_BUTTON)) MouseX = -9999;
            try {
                CommonDynamicFunction(`Inventory${DialogFocusItemName}Draw()`);
            } finally {
                MouseX = mouseX;
            }
            DrawRect(...PERMISSIONS_BUTTON, "Black");
            DrawButton(...BACK_BUTTON, "", "White", "Icons/Exit.png", "Back");
        } else {
            this.#endFocus(); // the item's own screens closed it
        }
    }

    #clickFocus(preview: Character, focus: { kind: "extended" | "color", group: AssetGroupName }) {
        if (focus.kind === "color") ItemColorClick(preview, focus.group, ...COLOR_RECT);
        else if (DialogTightenLoosenItem) TightenLoosenItemClick(preview, DialogTightenLoosenItem);
        else if (MouseIn(...PERMISSIONS_BUTTON)) return;
        else if (MouseIn(...BACK_BUTTON)) DialogLeaveFocusItem();
        else if (DialogFocusItem) CommonDynamicFunction(`Inventory${DialogFocusItemName}Click()`);
    }

    #nameTaken() {
        const key = this.SelectedOutfit?.key.toLocaleLowerCase();
        return !!key && key != this.SelectedKey && this.outfitModule.data.GetOutfitKeys().includes(key);
    }

    #canSave() {
        return (
            !!this.SelectedOutfit &&
            !!this.SelectedOutfit.key &&
            !this.#nameTaken() &&
            (this.outfitModule.data.strategy == OutfitStorageStrategy.LOCALSTORE || this.outfitModule.data.GetOutfitCollectionBytes() < (MAX_DATA * .9))
        );
    }

    #showParseOptions() {
        const checks = document.getElementById(EDITOR_ID.checkboxes);
        if (checks) {
            if (!checks.classList.contains("show"))
                checks.classList.add("show");
            else
                checks.classList.remove("show");
        }
    }

    #updateButton(type: typeof EDITOR_ID.accept | typeof EDITOR_ID.outfitButton, loadOutfit=false) {
        const button = document.getElementById(type) as HTMLButtonElement;
        const validOutfit = !!this.SelectedOutfit?.code || (this.SelectedOutfit?.inherit ?? []).length > 0;
        switch (type) {
            case EDITOR_ID.accept: {
                button.disabled = !(validOutfit && this.#canSave());
                if (validOutfit) {
                    this.reloadPreviewAppearance();
                }
                break;
            }
            case EDITOR_ID.outfitButton: {
                button.disabled = !this.IncomingCode;
                break;
            }
            default:
                throw new Error(`Unsupported tooltip type: ${type}`);
        }
        this.#updateTooltip(button);
    }

    #updateTooltip(parentButton: HTMLButtonElement) {
        const tooltip = parentButton.querySelector("[role='tooltip']") as null | HTMLElement;
        const validOutfit = !!this.SelectedOutfit?.code || (this.SelectedOutfit?.inherit ?? []).length > 0;
        const dataSize = this.outfitModule.data.GetOutfitCollectionBytes();
        if (!tooltip) {
            return;
        }

        switch (parentButton.id) {
            case EDITOR_ID.accept: {
                const prefix = "Save item set";
                if (!validOutfit) {
                    tooltip.innerText = `${prefix}:\nMissing outfit or combination`;
                } else if (!this.#canSave()) {
                    if (!this.SelectedOutfit?.key) {
                        tooltip.innerText = `${prefix}:\nMissing key`;
                    } else if (this.#nameTaken()) {
                        tooltip.innerText = `${prefix}:\nDuplicate name`;
                    } else if (dataSize >= (MAX_DATA * .9)) {
                        tooltip.innerText = `${prefix}:\nMax allowed Outfit storage size exceeded (${byteToKB(dataSize)} / ${byteToKB(MAX_DATA)} KB)`;
                    }
                } else {
                    tooltip.innerText = prefix;
                }
                break;
            }

            case EDITOR_ID.outfitButton: {
                const prefix = "Parse outfit code";
                if (this.IncomingCode) {
                    tooltip.innerText = prefix;
                } else {
                    tooltip.innerText = `${prefix}:\nMissing code`;
                }
                break;
            }

            default:
                throw new Error(`Unsupported tooltip type: ${parentButton.id}`);
        }
    }

    #previewUpdate = false;

    /** Reload the appearance of the review character based on the current settings. */
    reloadPreviewAppearance(): void {
        if (this.#previewUpdate || !this.preview || !this.SelectedOutfit) {
            return;
        }

        const itemList = this.outfitModule.data.ExpandOutfit(this.SelectedOutfit);
        this.#previewUpdate = true;
        this.preview.Appearance = [...this.character.Appearance];
        this.preview.OnlineSharedSettings = this.character.OnlineSharedSettings;
        if (itemList === null) {
            this.#previewUpdate = false;
            this.#stand(this.preview);
            CharacterRefresh(this.preview, false, false);
            return;
        }
        this.#reloadPreviewAppearance(itemList);
    }

    async #reloadPreviewAppearance(itemList: readonly ItemBundle[]) {
        if (!this.preview) return;

        CharacterReleaseTotal(this.preview, false);
        const family = this.preview.AssetFamily;
        const items = itemList.filter(({ Name, Group }) => {
            const asset = AssetGet(family, Group, Name);
            if (asset == null) {
                return false;
            } else {
                return true;
            }
        });
        
        try {
            this.DrawPreview(items);
        } finally {
            // A malformed (hand-edited) code must not wedge every later preview (#840)
            this.#previewUpdate = false;
        }
    }

    /** The filter checkboxes, built from the DOM kit; the kit context keeps them in step with the filter
     *  (including the body box locking and ticking the three below it), so they're never rebuilt after a click. */
    createCheckboxes() {
        const ctx = new KitContext();
        const f = this._outfitFilter;
        const box = (key: keyof typeof f, label: string, underBody = false) => CheckboxRow(ctx, {
            label,
            get: () => underBody ? (f[key] || f.body) : f[key],
            set: v => { f[key] = v; this.setFilteredIncoming(); },
            disabled: underBody ? () => f.body : undefined,
        });
        return <fieldset>
                    {box("clothes", "Clothing")}
                    {box("items", "Restraints/Items")}
                    {box("cosplay", "Cosplay Items")}
                    <fieldset>
                        <legend>{box("body", "All Body Items")}</legend>
                        {box("hair", "Hair/Eyebrows", true)}
                        {box("skin", "Skin/Body", true)}
                        {box("gender", "Genitals/Pronouns", true)}
                    </fieldset>
                </fieldset>;
    }

    /** Rebuilds the checkboxes from the current filter (the filter is replaced when the editor opens). */
    rebuildCheckboxes() {
        document.getElementById(EDITOR_ID.checkboxes)?.replaceChildren(this.createCheckboxes());
    }

    createOption(key: string) {
        return (
            <option 
                onClick={(evt) => this.clickCombination(evt)}
                value={key}
                selected={this.SelectedOutfit?.inherit.map(k => k.toLocaleLowerCase()).includes(key.toLocaleLowerCase())}>{key}</option>
        );
    }

    /** @param resumeIncoming - restoring after the creator: keep the parked code and filters */
    #openEditor(resumeIncoming?: string) {
        if (this.SelectedOutfit) {
            this.IncomingCode = resumeIncoming ?? this.SelectedOutfit.code;
            this.#showScreen(editorRoot);

            const comboEle = document.getElementById(EDITOR_ID.combinationSelect);
            if (comboEle)
                comboEle.replaceChildren(...this.OrderedKeys().filter(key =>!!key && key.toLocaleLowerCase() != this.SelectedKey?.toLocaleLowerCase()).map(key => this.createOption(key)));

            const header = document.getElementById(EDITOR_ID.header);
            if (header) header.innerText = this.SelectedOutfit?.key ? "Edit Outfit" : "New Outfit";
            ElementValue(EDITOR_ID.outfitName, this.SelectedOutfit?.key ?? "");
            ElementValue(EDITOR_ID.outfitInput, this.SelectedOutfit?.code ?? "");

            this.#updateButton(EDITOR_ID.accept);
            this.#updateButton(EDITOR_ID.outfitButton);
            if (resumeIncoming === undefined) this._outfitFilter = {
                clothes: true,
                items: true,
                cosplay: true,
                body: true,
                hair: true,
                skin: true,
                gender: true,
            };
            this.rebuildCheckboxes();
            this.preview = this.InitializePreview();
            this.reloadPreviewAppearance();
            this.#fillGroups();
            this.#updateItemPanel();
        } else this.#closeEditor();
    }

    #dropPreview() {
        if (this.preview) CharacterDelete(this.preview, false);
        this.preview = undefined;
    }

    #closeEditor() {
        this.#closeGrid();
        this.#closeLockModal();
        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.#dropPreview();
        this.#refreshListing();
        this.#updateElements();
        this.#showScreen(root);
    }

    CloneOutfit() {
        if (!this.SelectedOutfit) return;
        const newName = prompt("Enter a name for the new outfit:");
        if (!newName) return;
        else if (this.OrderedKeys().map(key => key.toLocaleLowerCase()).includes(newName.toLocaleLowerCase())) {
            if (confirm("Invalid name: Already exists! \nTry Again?"))
                this.CloneOutfit();
        } else {
            this.SelectedKey = newName;
            this.SelectedOutfit.key = newName;
            if (this.#canSave()) {
                this.SaveOutfit();
                this.clickOutfit(newName);
            } else {
                alert(`Not enough space to clone ${newName}`);
            }
        }
    }

    DeleteOutfit() {
        if (!confirm(`Are you sure you want to delete the outfit: ${this.SelectedOutfit?.key}`)) return;
        if (this.SelectedKey)
            this.outfitModule.data.RemoveOutfit(this.SelectedKey, true);
        this.#closeEditor();
    }

    SaveOutfit() {
        if (this.SelectedOutfit){
            // Also catches a change of case only, which keeps the same lowercased key.
            if (!!this.SelectedKey && this.outfitModule.data.GetOutfit(this.SelectedKey)?.key !== this.SelectedOutfit.key)
                this.outfitModule.RenameOutfit(this.SelectedKey, this.SelectedOutfit.key);
            this.outfitModule.data.SetOutfitCode(this.SelectedOutfit?.key, this.SelectedOutfit?.code, this.SelectedOutfit?.inherit, true);
        }
        this.#closeEditor();
    }

    CancelOutfit() {
        this.#closeEditor();
    }

    InitializePreview(): Character {
        const newCharacter = CopyCharacter(Player, `${OUTFIT_PREVIEW_ID}-${Player.MemberNumber}`);
	    
        newCharacter.Owner = Player.Name;
        newCharacter.Ownership = { MemberNumber: Player.MemberNumber, Name: Player.Name, Start: CommonTime(), Stage: 1 };
        newCharacter.Lovership = [
            { MemberNumber: Player.MemberNumber, Name: Player.Name, Start: CommonTime(), Stage: 2 },
        ];
        // @ts-expect-error: partially initialized interface
        newCharacter.OnlineSharedSettings = {
            ItemsAffectExpressions: false,
        };

        return newCharacter;
    }

    DrawPreview(itemList: readonly ItemBundle[]) {
        if (!this.preview) this.preview = this.InitializePreview();
        this.preview.Appearance = Player.Appearance.slice();
        CharacterNaked(this.preview, false);
        CharacterReleaseTotal(this.preview, false);

        itemList.forEach(item => {
            ApplyItem(item, Player.MemberNumber, true, false, this.preview);
        });

        this.#stand(this.preview);
        CharacterRefresh(this.preview, false, false);
    }

    /** The preview always stands, whatever the player is doing: kneeling would push the item zones off the bottom of the screen. */
    #stand(C: Character) {
        PoseSetActive(C, "BaseUpper", true);
        PoseSetActive(C, "BaseLower", true);
    }

    clickCombination(evt: MouseEvent | null) {
        if (!evt || !this.SelectedOutfit) return;
        const opt = evt.target as HTMLOptionElement;
        if (opt.selected){
            opt.removeAttribute("selected");
            opt.selected = false;
        } else {
            opt.setAttribute("selected", "");
            opt.selected = true;
        }
        this.SelectedOutfit.inherit = toArray(opt.parentElement?.children).filter(o => (o as HTMLOptionElement).selected).map(o => (o as HTMLOptionElement).value);
        this.reloadPreviewAppearance();
    }

    SelectStorageStrategy(ele: HTMLSelectElement) {
        if (!ele) return;
        const newStrategy = ele.value as keyof typeof OutfitStorageStrategy;
        const newStratEnum = OutfitStorageStrategy[newStrategy];

        if (newStratEnum == this.outfitModule.data.strategy) return;

        if (newStratEnum == OutfitStorageStrategy.SERVER && (this.outfitModule.data.GetOutfitCollectionBytes() >= (MAX_DATA * .9))) {
            alert("Unable to change Storage Location: Not enough space.");
            ele.value = OutfitStorageStrategy[OutfitStorageStrategy.LOCALSTORE];
            return;
        }

        if (newStratEnum !== undefined && confirm("Are you sure you want to change storage locations?\nNOTE: While Local Storage is unlimited, it will be lost in incognito browsers")) {
            ToastManager.info(`Converting Outfit Storage to: ${newStrategy}`);
            this.outfitModule.data.SetStrategy(newStratEnum);
            this.#updateElements();
        }
    }
}