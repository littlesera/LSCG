import { h } from "tsx-dom";
import { ApplyItem, GetDataSizeReport, hookFunction, ICONS, isBind, isBody, isCloth, isCosplay, isGenitals, isHair, isPronouns, isSkin, smartGetAssetGroup } from "utils";
import { GuiSubscreen } from "./settingBase";
import { OutfitSettings } from "./Models/base";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import styles from "./outfits.scss";
import editorStyles from "./outfitEditor.scss";
import { clamp, entries, toArray } from "lodash-es";
import { Outfit, OutfitCollection } from "./OutfitCollection/outfitCollection";
import { drawTooltip } from "./settingUtils";

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

    newOutfit: `${root}-new-outfit`,
    newOutfitButton: `${root}-new-outfit-button`,
    newOutfitTooltip: `${root}-new-outfit-tooltip`,

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

const editorRoot = "lscg-outfit-edit";
const EDITOR_ID = Object.freeze({
    root: editorRoot,
    styles: `${editorRoot}-style`,

    delete: `${editorRoot}-delete`,
    accept: `${editorRoot}-accept`,
    cancel: `${editorRoot}-cancel`,
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

    checkboxes: `${editorRoot}-checkboxes`,
    clothesCheck: `${editorRoot}-clothes-check`,
    itemsCheck: `${editorRoot}-items-check`,
    cosplayCheck: `${editorRoot}-cosplay-check`,
    hairCheck: `${editorRoot}-hair-check`,
    skinCheck: `${editorRoot}-skin-check`,
    bodyCheck: `${editorRoot}-body-check`,
    genderCheck: `${editorRoot}-gender-check`
});

const itemsRoot = "lscg-outfit-edit-items";
const ITEMS_ID = Object.freeze({
    root: itemsRoot,
    styles: `${itemsRoot}-style`,

    menu: `lscg-button-menu`,

    layering: `${itemsRoot}-layering`,
    color: `${itemsRoot}-color`,
    use: `${itemsRoot}-use`,
    remove: `${itemsRoot}-remove`,
    lock: `${itemsRoot}-lock`,
    tighten: `${itemsRoot}-tighten`,
    back: `${itemsRoot}-back`,
})

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
        gender: true
    };

    screens = {
        [root]: Object.freeze({
            shape: [GuiSubscreen.START_X, GuiSubscreen.START_Y, 1900 - GuiSubscreen.START_X, 800] as RectTuple,
            visibility: "visible",
            dom: <div id={ID.root} class="lscg-screen">
                <style id={ID.styles}>{styles.toString()}</style>
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
                    <button
                        class="lscg-button"
                        id={ID.newOutfitButton}
                        onClick={this.NewOutfit.bind(this)}
                        style={{ backgroundImage: "url('./Icons/Plus.png')" }}
                    />
                    <span class="lscg-button-tooltip" id={ID.newOutfitTooltip} style={{ justifySelf: "right" }}>
                        New Outfit
                    </span>
                </div>
            </div>
        }),
        [editorRoot]: Object.freeze({
            shape: [GuiSubscreen.START_X + 500, GuiSubscreen.START_Y - 130, 1300 - GuiSubscreen.START_X, 850] as RectTuple,
            visibility: "hidden",
            dom: <div id={EDITOR_ID.root} class="lscg-screen">
                <style id={EDITOR_ID.styles}>{editorStyles.toString()}</style>
                {
                    ElementMenu.Create(
                        "lscg-outfit-edit-menubar",
                        [
                            <h1 id={EDITOR_ID.header}>{`Edit Outfit`}</h1>,
                            ElementButton.Create(
                                EDITOR_ID.delete,
                                () => this.DeleteOutfit(),
                                { image: "./Icons/Trash.png", tooltip: "Delete item set", tooltipPosition: "right" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.accept,
                                () => this.SaveOutfit(),
                                { image: "./Icons/Accept.png", tooltip: "Save item set:\nMissing outfit", tooltipPosition: "left" },
                                { button: { attributes: { form: "lscg-outfit-edit-form", type: "submit", "screen-generated": undefined } } },
                            ),
                            ElementButton.Create(
                                EDITOR_ID.cancel,
                                () => this.CancelOutfit(),
                                { image: "./Icons/Cancel.png", tooltip: "Cancel", tooltipPosition: "left" },
                                { button: { attributes: { "screen-generated": undefined } } },
                            )
                        ],
                        { direction: "ltr" },
                    )
                }
                <div id="lscg-outfit-edit-form" role="form" class="scroll-box" aria-labelledby={EDITOR_ID.header}>
                    <input
                        type="text"
                        id={EDITOR_ID.outfitName}
                        placeholder="Outfit name"
                        aria-label="Outfit name"
                        maxLength={70}
                        onInput={(e) => {
                            if (!!this.SelectedOutfit) {
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
                            this.IncomingCode = (e.target as HTMLInputElement).value
                            this.setFilteredIncoming();
                            this.#updateButton(EDITOR_ID.outfitButton);
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).select()}
                    />
                    {ElementButton.Create(
                        EDITOR_ID.optionsButton,
                        () => this.#showParseOptions(),
                        {
                            tooltip: "Parse Options",
                            label: "Options",
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
                        () => this.#updateButton(EDITOR_ID.accept, true),
                        {
                            tooltip: "Parse the outfit code",
                            label: "Parse",
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
                    <label for={EDITOR_ID.combinationSelect} id={EDITOR_ID.combinationLabel}>Inherited Outfits:</label>
                    <div id={EDITOR_ID.checkboxes}>
                        {this.createCheckboxes()}
                    </div>
                </div>
            </div>
        }),
        // [itemsRoot]: Object.freeze({
        //     shape: [GuiSubscreen.START_X, GuiSubscreen.START_Y, 1800 - GuiSubscreen.START_X, 900 - GuiSubscreen.START_Y] as RectTuple,
        //     visibility: "hidden",
        //     dom: <div id={ITEMS_ID.root} class="lscg-screen">
        //         <style id={ITEMS_ID.styles}>{editorStyles.toString()}</style>
        //         {
        //             ElementMenu.Create(
        //                 "lscg-outfit-edit-menubar",
        //                 [
        //                     // ElementButton.Create(
        //                     //     ITEMS_ID.layering,
        //                     //     () => this.LayerItem(),
        //                     //     { image: "./Icons/Cancel.png", tooltip: "Cancel", tooltipPosition: "left" },
        //                     //     { button: { attributes: { "screen-generated": undefined } } },
        //                     // ),
        //                     // ElementButton.Create(
        //                     //     ITEMS_ID.cancel,
        //                     //     () => this.ExitItems(),
        //                     //     { image: "./Icons/Cancel.png", tooltip: "Cancel", tooltipPosition: "left" },
        //                     //     { button: { attributes: { "screen-generated": undefined } } },
        //                     // )
        //                 ],
        //                 { direction: "ltr" },
        //             )
        //         }
        //     </div>
        // })
    }

    #showScreen(screenId: string) {
        for (const [id, { shape, visibility, dom }] of entries(this.screens)) {
            let ele = document.getElementById(id);
            if (!ele) return;
            if (id === screenId) ele.style["visibility"] = "visible";
            else ele.style["visibility"] = "hidden";
        }
        DialogMenuMapping.items.Unload();
    }

    charHook: (() => void) | undefined;

    Load(): void {
        this.charHook = hookFunction("CharacterGetCurrent", 1, (args, next) => {
            return this.preview ?? next(args);
        });

        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.preview = undefined;

        for (const [id, { shape, visibility, dom }] of entries(this.screens)) {
            document.body.appendChild(dom);
        }
        
        this.#refreshListing();

        if (!CurrentScreenFunctions) {
            CurrentScreenFunctions = {} as ScreenFunctions;
        }
        
        this.#updateElements();
        CurrentScreenFunctions.Resize = (load) => this.Resize(load);
        CurrentScreenFunctions.Resize(true);
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
            if (!!elem)
                Object.assign(elem.style, style);
        }
        this.#resizeInventoryGrid(load);
    }

    Exit(): void {
        document.activeElement?.dispatchEvent(new FocusEvent("blur"));
        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.preview = undefined;
        for (const [id, { shape, visibility, dom }] of entries(this.screens)) {
            ElementRemove(id);
        }
        DialogMenuMapping.items.Unload();
        if (!!this.charHook) this.charHook();
        super.Exit();
    }

    #refreshListing() {
        let existing = document.getElementById(ID.buttonInnerGrid0);
        if (!!existing)
            existing.replaceChildren(...this.OrderedKeys().map((key, i, arr) => createButton(this, key, i, key => this.clickOutfit(key))))
    }

    #updateElements() {
        const isPlayer = this.character.IsPlayer();
        const storageOuter = document.getElementById(ID.storage) as HTMLElement;
        const storageInner = document.getElementById(ID.storageInner) as HTMLElement;

        const storageFooter = document.getElementById(ID.storageFooter) as HTMLElement;
        if (isPlayer) {
            const nKBTotal = clamp(byteToKB(GetDataSizeReport(Player.ExtensionSettings[OutfitCollection.STORAGE_KEY])), 0, 9999);
            const percentage = 100 * nKBTotal / (MAX_DATA / 1000);
            storageFooter.innerText = `${nKBTotal} / ${MAX_DATA / 1000} KB`;
            storageInner.style.height = `${100 - percentage}%`;
            storageInner.style.backgroundColor = "var(--lscg-background-color)";
            storageInner.style.borderBottom = "min(0.3dvh, 0.15dvw) solid var(--lscg-border-color)";
            if (percentage >= 90) {
                storageOuter.style.boxShadow = "0 0 min(2dvh, 1dvw) red";
            }
        } else {
            const storageTooltip = document.getElementById(ID.storageTooltip) as HTMLElement;
            storageFooter.innerText = `- / ${MAX_DATA / 1000} KB`;
            storageInner.style.height = "100%";
            storageInner.style.backgroundColor = "gray";
            storageTooltip.style.display = "none";
        }
    }

    clickOutfit(key: string) {
        console.info(`Clicked outfit: ${key}`);
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
            inherit: []
        } as Outfit;
        this.#openEditor();
    }

    /********************* EDITOR *****************************/

    coords = {
        x: 200,
        y: 175,
        zoom: 0.78
    };

    Run(): void {
        super.Run();
        if (!!this.preview) {
            //DrawText("- LSCG Edit Outfit -", GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
            DrawCharacter(this.preview, this.coords.x, this.coords.y, this.coords.zoom, false);

            // Draws all the available character zones
            let selectedGroupName = this.preview.FocusGroup?.Name ?? "";
            let tooltipToDraw = undefined;
            for (let Group of AssetGroup.sort((a, b) => b.Name == selectedGroupName ? -1 : 1)) {
                let occupied = InventoryGet(this.preview, Group.Name);
                let selected = false;// selectedGroupName == Group.Name;
                if (Group.IsItem() && occupied) {
                    DrawAssetGroupZone(Player, Group.Zone, this.coords.zoom, this.coords.x, this.coords.y, 1, selected ? "#00d5d5" : "#808080", 3, occupied ? "#00FF0022" : "#80808011");
                    const Zone = Group.Zone?.find(z => DialogClickedInZone(Player, z, this.coords.zoom, this.coords.x, this.coords.y, 1));
                    if (Zone) {
                        let tmp = this.preview.HeightModifier;
                        this.preview.HeightModifier = 0;
                        let CZ = DialogGetCharacterZone(this.preview, Zone, this.coords.x, this.coords.y, this.coords.zoom, 1);
                        this.preview.HeightModifier = tmp;
                        tooltipToDraw = {
                            x: CZ[0] - 100,
                            y: CZ[1] + CZ[3] - 20,
                            text: occupied?.Craft?.Name ?? occupied?.Asset.Description ?? ""
                        }
                    }
                }
            }
            if (!!tooltipToDraw)
                drawTooltip(tooltipToDraw.x, tooltipToDraw.y, 300, tooltipToDraw.text, "center");

            // if (!!this.preview?.FocusGroup) {
            //     DrawRect(1000, 0, 1000, 1000, "Black");
            // }
        }
    }

    // Click(): void {
    //     if (!!this.preview) {
    //         for (const Group of AssetGroup) {
    //             if (Group.IsItem()) {
    //                 const Zone = Group.Zone.find(z => DialogClickedInZone(Player, z, this.coords.zoom, this.coords.x, this.coords.y, 1));
    //                 if (Zone) {
    //                     this.#openItemList(Group);
    //                 }
    //             }
    //         }
    //     } else {
    //         super.Click();
    //     }
    // }

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
            } catch (e) {}

            if (!assetGroup) return false;

            let bodyFilter = this._outfitFilter.body ||
                (
                    (this._outfitFilter.hair || !isHair(assetGroup)) &&
                    (this._outfitFilter.skin || !isSkin(assetGroup)) &&
                    (this._outfitFilter.gender || (!isGenitals(assetGroup) && !isPronouns(assetGroup)))
                )

            return (assetGroup.IsAppearance() || assetGroup.IsItem()) &&
                    (this._outfitFilter.clothes || !isCloth(assetGroup)) &&
                    (this._outfitFilter.items || !isBind(assetGroup, [])) &&
                    (this._outfitFilter.cosplay || !isCosplay(assetGroup)) &&
                    bodyFilter
        })
    }

    #openItemList(group: AssetItemGroup) {
        if (!this.preview) return;
        console.info(`FocusGroup: ${group.Name}`);
        this.preview.FocusGroup = group;
        this.#showScreen(itemsRoot);
        var ele = DialogMenuMapping["items"].Init({ C: this.preview, focusGroup: this.preview.FocusGroup });
        DialogMenuButtonBuild(this.preview);
        var menuEle = document.getElementById(ITEMS_ID.menu) ?? <div id={ITEMS_ID.menu}></div>;
        menuEle.replaceChildren(...this.GetInventoryDrawMenu());
        if (!toArray(ele?.children).some(ele => ele.id == ITEMS_ID.menu))
            ele?.insertBefore(menuEle, ele.firstChild);
        this.#resizeInventoryGrid(false);
    }

    #closeItemList() {
        DialogMenuMapping["items"].Unload();
    }

    #canSave() {
        return (
            !!this.SelectedOutfit &&
            !!this.SelectedOutfit.key &&
            this.outfitModule.data.GetOutfitCollectionBytes() < (MAX_DATA * .9)
        );
    }

    #showParseOptions() {
        let checks = document.getElementById(EDITOR_ID.checkboxes);
        if (!!checks) {
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
                button.disabled = !this.SelectedOutfit?.code;
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
                    } else if (this.outfitModule.data.GetOutfitKeys().filter(x => x != this.SelectedKey).indexOf(this.SelectedOutfit.key.toLocaleLowerCase()) > -1) {
                        tooltip.innerText = `${prefix}:\nDuplicate name`;
                    } else if (dataSize >= (MAX_DATA * .9)) {
                        tooltip.innerText = `${prefix}:\nMax allowed Outfit storage size exceeded (${byteToKB(dataSize)} / ${byteToKB(dataSize)}`;
                    }
                } else {
                    tooltip.innerText = prefix;
                }
                break;
            }

            case EDITOR_ID.outfitButton: {
                const prefix = "Parse outfit code";
                if (this.SelectedOutfit?.code) {
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

        let itemList = this.outfitModule.data.ExpandOutfit(this.SelectedOutfit);
        this.#previewUpdate = true;
        this.preview.Appearance = [...this.character.Appearance];
        this.preview.OnlineSharedSettings = this.character.OnlineSharedSettings;
        if (itemList === null) {
            this.#previewUpdate = false;
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
        
        this.DrawPreview(itemList);

        this.#previewUpdate = false;
    }

    createCheckboxes() {
        return <fieldset>
                    {this.createCheckbox(EDITOR_ID.clothesCheck, this._outfitFilter.clothes, "Clothing", false)}
                    {this.createCheckbox(EDITOR_ID.itemsCheck, this._outfitFilter.items, "Restraints/Items", false)}
                    {this.createCheckbox(EDITOR_ID.cosplayCheck, this._outfitFilter.cosplay, "Cosplay Items", false)}
                    <fieldset>
                        <legend>
                            {this.createCheckbox(EDITOR_ID.bodyCheck, this._outfitFilter.body, "All Body Items", false)}
                        </legend>
                        {this.createCheckbox(EDITOR_ID.hairCheck, this._outfitFilter.hair || this._outfitFilter.body, "Hair/Eyebrows", this._outfitFilter.body)}
                        {this.createCheckbox(EDITOR_ID.skinCheck, this._outfitFilter.skin || this._outfitFilter.body, "Skin/Body", this._outfitFilter.body)}
                        {this.createCheckbox(EDITOR_ID.genderCheck, this._outfitFilter.gender || this._outfitFilter.body, "Genitals/Pronouns", this._outfitFilter.body)}
                    </fieldset>
                </fieldset>
    }

    createCheckbox(id: string, value: boolean, label: string, disabled: boolean = false) {
        return <label>
                <input id={id} type="checkbox" checked={value} disabled={disabled} onChange={evt => this.toggleCheckbox(evt.currentTarget)}/>
                {label}
            </label>
    }

    createOption(key: string) {
        return (
            <option 
                onClick={(evt) => this.clickCombination(evt)}
                value={key}
                selected={this.SelectedOutfit?.inherit.map(k => k.toLocaleLowerCase()).includes(key.toLocaleLowerCase())}>{key}</option>
        )
    }

    #openEditor() {
        if (!!this.SelectedOutfit) {
            this.#showScreen(editorRoot);

            let comboEle = document.getElementById(EDITOR_ID.combinationSelect);
            if (!!comboEle)
                comboEle.replaceChildren(...this.OrderedKeys().filter(key => key.toLocaleLowerCase() != this.SelectedKey?.toLocaleLowerCase()).map(key => this.createOption(key)))

            let header = document.getElementById(EDITOR_ID.header);
            if (!!header) header.innerText = !!this.SelectedOutfit?.key ? `Edit Outfit` : "New Outfit";
            ElementValue(EDITOR_ID.outfitName, this.SelectedOutfit?.key ?? "");
            ElementValue(EDITOR_ID.outfitInput, this.SelectedOutfit?.code ?? "");

            this.#updateButton(EDITOR_ID.accept);
            this.#updateButton(EDITOR_ID.outfitButton);
            this._outfitFilter = {
                clothes: true,
                items: true,
                cosplay: true,
                body: true,
                hair: true,
                skin: true,
                gender: true
            };
            document.getElementById(EDITOR_ID.checkboxes)?.replaceChildren(this.createCheckboxes())
            this.preview = this.InitializePreview();
            this.reloadPreviewAppearance();
        } else this.#closeEditor();
    }

    #closeEditor() {
        this.SelectedKey = undefined;
        this.SelectedOutfit = undefined;
        this.preview = undefined;
        this.#refreshListing();
        this.#updateElements();
        this.#showScreen(root);
    }

    DeleteOutfit() {
        if (confirm(`Are you sure you want to delete the outfit: ${this.SelectedOutfit?.key}`)) {        
            if (!!this.SelectedKey)
                this.outfitModule.data.RemoveOutfit(this.SelectedKey, true);
        }
        this.#closeEditor();
    }

    SaveOutfit() {
        if (!!this.SelectedOutfit){
            if (!!this.SelectedKey && this.SelectedKey != this.SelectedOutfit.key.toLocaleLowerCase())
                this.outfitModule.data.RenameOutfit(this.SelectedKey, this.SelectedOutfit.key, false);
            this.outfitModule.data.SetOutfitCode(this.SelectedOutfit?.key, this.SelectedOutfit?.code, this.SelectedOutfit?.inherit, true);
        }
        this.#closeEditor();
    }

    CancelOutfit() {
        this.#closeEditor();
    }

    InitializePreview(): Character {
        let newCharacter = CharacterLoadSimple(`LSCGOutfitsCollection-${Player.MemberNumber}`);
        
        newCharacter.Appearance = Player.Appearance.slice();
        CharacterNaked(newCharacter, false);
	    
        newCharacter.Owner = Player.Name;
        newCharacter.Ownership = { MemberNumber: Player.MemberNumber, Name: Player.Name, Start: CommonTime(), Stage: 1 };
        newCharacter.Lovership = [
            { MemberNumber: Player.MemberNumber, Name: Player.Name, Start: CommonTime(), Stage: 2 },
        ];
        // @ts-expect-error: partially initialized interface
        newCharacter.OnlineSharedSettings = {
            ItemsAffectExpressions: false,
        };

        CharacterReleaseTotal(newCharacter, false);
        return newCharacter;
    }

    DrawPreview(itemList: readonly ItemBundle[]) {
        if (!this.preview) this.preview = this.InitializePreview();
        this.preview.Appearance = Player.Appearance.slice();
        CharacterNaked(this.preview, false);
        CharacterReleaseTotal(this.preview, false);

        itemList.forEach(item => {
            ApplyItem(item, Player.MemberNumber, true, false, this.preview)
        });

        CharacterRefresh(this.preview, false, false);
    }

    clickCombination(evt: MouseEvent | null) {
        if (!evt || !this.SelectedOutfit) return;
        let opt = evt.target as HTMLOptionElement;
        if (opt.selected){
            opt.removeAttribute('selected');
            opt.selected = false;
        } else {
            opt.setAttribute('selected', '');
            opt.selected = true;
        }
        this.SelectedOutfit.inherit = toArray(opt.parentElement?.children).filter(o => (o as HTMLOptionElement).selected).map(o => (o as HTMLOptionElement).value);
        this.reloadPreviewAppearance();
    }

    toggleCheckbox(input: HTMLInputElement) {
        let id = input.id;
        let checked = input.checked;
        switch (id) {
            case EDITOR_ID.clothesCheck: this._outfitFilter.clothes = checked; break;
            case EDITOR_ID.itemsCheck: this._outfitFilter.items = checked; break;
            case EDITOR_ID.cosplayCheck: this._outfitFilter.cosplay = checked; break;
            case EDITOR_ID.bodyCheck: 
                this._outfitFilter.body = checked;
                document.getElementById(EDITOR_ID.checkboxes)?.replaceChildren(this.createCheckboxes());
                break;
            case EDITOR_ID.hairCheck: this._outfitFilter.hair = checked; break;
            case EDITOR_ID.skinCheck: this._outfitFilter.skin = checked; break;
            case EDITOR_ID.genderCheck: this._outfitFilter.gender = checked; break;
        }

        this.setFilteredIncoming();
    }

    /******************* Item Inventory **********************/

    GetInventoryDrawMenu(): JSX.Element[] {
        if (!this.preview) return [];
        const FocusItem = InventoryGet(this.preview, this.preview.FocusGroup?.Name as AssetGroupName);
 
        return DialogMenuButton.map(button => {
            const ButtonColor = DialogGetMenuButtonColor(button);
            const ButtonImage = DialogGetMenuButtonImage(button, FocusItem as Item);
            const ButtonHoverText = InterfaceTextGet(`DialogMenu${button}`);
            const ButtonDisabled = DialogIsMenuButtonDisabled(button);
            return <div class="lscg-button-div">
                    <button
                        class="lscg-button"
                        id={ITEMS_ID.root + "-" + button}
                        disabled={ButtonDisabled}
                        onClick={(evt) => this.ClickInventoryMenu(button)}
                        style={{ backgroundImage: `url('./Icons/${ButtonImage}.png')`, backgroundColor: ButtonColor }}
                    />
                    <span class="lscg-button-tooltip" id={ID.newOutfitTooltip} style={{ justifySelf: "right" }}>
                        {ButtonHoverText}
                    </span>
                </div>
        });
    }

    ClickInventoryMenu(button: DialogMenuButton) {
        console.info(`Button press: ${button}`);
    }

    #resizeInventoryGrid(load: boolean = false) {
        DialogMenuMapping["items"]?.Resize(load);
        document.getElementById("lscg-share-crafts")?.remove();
        var gridEle = document.getElementById(DialogMenuMapping["items"].ids.root);
        if (!!gridEle) {
            let menuEle = document.getElementById(ITEMS_ID.menu);
            if (!!menuEle) {
                const heightRatio = MainCanvas.canvas.clientHeight / 1000;
                const top = gridEle.clientTop - 100 * heightRatio;
                const width = gridEle.clientWidth;

                const style: Partial<CSSStyleDeclaration> = {
                    top: `${top}px`,
                    width: `${width}px`,
                };
                
                Object.assign(menuEle.style, style);
            }
        }
    }
}