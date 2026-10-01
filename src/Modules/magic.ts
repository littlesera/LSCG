import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GetConfiguredItemBundlesFromOutfitKey, GetDelimitedList, OnChat, GetHandheldItemNameAndDescriptionConcat, GetItemNameAndDescriptionConcat, GetMetadata, ICONS, LSCG_SendLocal, LSCG_TEAL, OnActivity, SendAction, forceOrgasm, getCharacter, getRandomInt, hookFunction, isPhraseInString, removeAllHooksByModule, sendLSCGCommand, sendLSCGCommandBeep, settingsSave, getCharacterByNicknameOrMemberNumber, excludeParentheticalContent, escapeRegExp } from "../utils";
import { KNOWN_SPELLS_LIMIT, LSCGSpellEffect, MagicSettingsModel, OutfitConfig, OutfitOption, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import { GuiMagic } from "Settings/magic";
import { StateModule } from "./states";
import { EnhancedItemActivityNames, IsActivityEnhanced, ItemUseModule, MagicWandItems } from "./item-use";
import { InjectorModule } from "./injector";
import { RedressedState } from "./States/RedressedState";
import { PolymorphedState } from "./States/PolymorphedState";
import { OutfitCollection } from "Settings/OutfitCollection/outfitCollection";
import { OutfitCollectionModule } from "./outfitCollection";
import { hasMagicModule, hasMBSSettings, hasLSCGData, safeGetLSCGProp } from "../types/guards";
import { emit, emitBefore, spellInfo } from "api/events";
import { advertisedEffectIds, allEffectIds, effectLabel, extensionEffectIds, getSpellEffect, isLegacyEffect, spellEffects, spellForcesDuration, spellHasPairedEffect, spellIsBeneficial } from "./Magic/spellEffects";

const dialogButtonInfo = [965, 10, 100, 40, 5];
const dialogButtonCoords: [number,number,number,number] = [dialogButtonInfo[0], dialogButtonInfo[1], 40, 40];
const dialogCastButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1], dialogButtonInfo[2], dialogButtonInfo[3]];
const dialogWildButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1]  + (dialogButtonInfo[3] + dialogButtonInfo[4]), dialogButtonInfo[2], dialogButtonInfo[3]];
const dialogTeachButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1]  + (dialogButtonInfo[3] + dialogButtonInfo[4]) * 2, dialogButtonInfo[2], dialogButtonInfo[3]];

export class MagicModule extends BaseModule {
    DialogMenuOpen: boolean = false;
    SpellMenuOpen: boolean = false;
    TeachingSpell: boolean = false;
    SpellMenuOffset: number = 0;

    SpellPairOption: {
        SelectOpen: boolean,
        Spell: SpellDefinition | undefined,
        Source: Character | undefined
    } = {
        SelectOpen: false,
        Spell: undefined,
        Source: undefined
    }

    get Enabled(): boolean {
		return super.Enabled && (ChatRoomData?.BlockCategory?.indexOf("Fantasy") ?? -1) == -1
	}

    get defaultSettings() {
        return <MagicSettingsModel>{
            enabled: false,
            blockedSpellEffects: [],
            bypassForSelfEffects: [],
            enableWildMagic: false,
            forceWildMagic: false,
            trueWildMagic: false,
            knownSpells: [],
            lockable: false,
            locked: false,
            remoteAccess: false,
            remoteAccessRequiredTrance: false,
            limitRemoteAccessToHypnotizer: false,
            remoteMemberIds: "",
            neverDefend: false,
            noDefenseMemberIds: "",
            limitedDuration: true,
            maxDuration: 0,
            allowOutfitToChangeNeckItems: false,
            allowChangeGenitals: true,
            allowChangePronouns: false,
            projectionTintColor: "#00CED1",
            requireWhitelist: false,
            blockXRay: true,
            spiritTextFormat: "Float",
            disableSoulBindings: false,
            spiritFormOutfitKey: "",
            hideCorporeal: false,
            seenExtensionEffects: []
        };
    }

    get settings(): MagicSettingsModel {
        return super.settings as MagicSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiMagic;
    }

    get stateModule(): StateModule {
        return getModule<StateModule>("StateModule");
    }
    
    _testSpells: SpellDefinition[] = []; 
    get TestSpells(): SpellDefinition[] {
        if (this._testSpells.length <= 0)
            this._testSpells = [...Array(18).keys()].map(i => <SpellDefinition>{
                    Name: `Spell ${i+1}`,
                    Effects: this.PickRandomEffects(allEffectIds(), getRandomInt(3) + 1)
                });
        return this._testSpells;
    }

    get RandomSpell(): SpellDefinition {
        let candidates = spellEffects.all().filter(d => d.allowRandom).map(d => d.id);
        let spell = <SpellDefinition>{
            Name: `wild magic`,
            Effects: this.PickRandomEffects(candidates, getRandomInt(3) + 1)
        }
        if (spell.Effects.indexOf(LSCGSpellEffect.outfit) > -1) {
        	let outfitCollection = getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data;
        	let outfitKeys = outfitCollection?.GetOutfitKeys() ?? [];
        	let lscgChoice = outfitKeys.length > 0 ? outfitCollection.GetOutfitBundle(outfitKeys[getRandomInt(outfitKeys.length)]) : undefined;
        	let mbsOutfits: ItemBundle[][] = [];
        	if (hasMBSSettings(Player) && Player.MBSSettings?.FortuneWheelItemSets) {
        		mbsOutfits = Player.MBSSettings.FortuneWheelItemSets
        			.filter((s): s is { itemList?: ItemBundle[] } => !!s)
        			.map(s => s.itemList ?? []);
        	}
        	let mbsChoice = mbsOutfits.length > 0 ? mbsOutfits[getRandomInt(mbsOutfits.length)] : undefined;
            let wardrobeChoice = !Player.Wardrobe ? undefined : Player.Wardrobe[getRandomInt(Player.Wardrobe?.length)];
            let choices = [lscgChoice, mbsChoice, wardrobeChoice].filter(x => !!x);
            let outfit = choices[getRandomInt(choices.length)];
            spell.Outfit = {
                Option: OutfitOption.both,
                Key: "",
                Code: LZString.compressToBase64(JSON.stringify(outfit))
            }
        }
        return spell;
    }

    /** Up to `count` distinct effects picked at random. */
    PickRandomEffects(candidates: SpellEffectId[], count: number): SpellEffectId[] {
        const pool = [...candidates];
        const picked: SpellEffectId[] = [];
        while (picked.length < count && pool.length > 0)
            picked.push(pool.splice(getRandomInt(pool.length), 1)[0]);
        return picked;
    }

    get AvailableSpells(): SpellDefinition[] {
        return this.settings.knownSpells ?? [];//this.TestSpells;
    }

    get noDefenseMemberIds(): number[] {
		return GetDelimitedList(this.settings.noDefenseMemberIds).map(id => +id).filter(id => id > 0) ?? [];
	}

    PairedCharacterOptions(spellTarget: Character | undefined): Character[] {
        return ChatRoomCharacter.filter(c =>
            !!c &&
            hasMagicModule(c) &&
            c.MemberNumber != spellTarget?.MemberNumber
        );
    }

    _unhookEffectChanges: (() => void) | undefined;

    load(): void {
        this.SyncExtensionEffects(false);
        this._unhookEffectChanges = spellEffects.onChange(() => this.SyncExtensionEffects(true));

        OnChat(1, ModuleCategory.Magic, (data, sender, msg, metadata) => {
            if (!this.Enabled || !sender?.IsPlayer())
                return;
            this.CheckForSpellVoiceCasting(msg);
        });

        hookFunction("DialogDraw", 10, (args, next) => {
            if (this.Enabled && this.SpellMenuOpen) 
                return this.DrawSpellMenu();
                
            next(args);
            if (this.Enabled && !!CurrentCharacter && this.CanUseMagic(CurrentCharacter) && DialogMenuMode === "dialog") {
                DrawButton(...dialogButtonCoords, "Magic", this.DialogMenuOpen ? LSCG_TEAL : "White", "Magic™");
                if (this.DialogMenuOpen) {
                    DrawButton(...dialogCastButtonCoords, "Cast Spell", this.CanCastSpell(CurrentCharacter) ? "White" : "Grey", undefined, undefined, !this.CanCastSpell(CurrentCharacter));
                    DrawButton(...dialogWildButtonCoords, "Wild Magic", this.CanWildMagic(CurrentCharacter) ? "White" : "Grey", undefined, undefined, !this.CanWildMagic(CurrentCharacter));
                    DrawButton(...dialogTeachButtonCoords, "Teach Spell", this.CanTeachSpell(CurrentCharacter) ? "White" : "Grey", undefined, undefined, !this.CanTeachSpell(CurrentCharacter));
                }
            }
        }, ModuleCategory.Magic);

        hookFunction("DialogClick", 10, (args, next) => {
            if (this.Enabled && this.SpellMenuOpen)
                return this.ClickSpellMenu();
            else if (this.Enabled && !!CurrentCharacter && DialogMenuMode === "dialog" && MouseIn(...dialogButtonCoords)) {
                this.DialogMenuOpen = !this.DialogMenuOpen;
                return;
            } 
            if (this.DialogMenuOpen && this.Enabled && !!CurrentCharacter && this.CanUseMagic(CurrentCharacter) && DialogMenuMode === "dialog") {
                if (MouseIn(...dialogCastButtonCoords)) { if (this.CanCastSpell(CurrentCharacter)) this.OpenSpellMenu(CurrentCharacter as OtherCharacter); return; }
                else if (MouseIn(...dialogWildButtonCoords)) { if (this.CanWildMagic(CurrentCharacter)) this.CastWildMagic(CurrentCharacter as OtherCharacter); return; }
                else if (MouseIn(...dialogTeachButtonCoords)) { if (this.CanTeachSpell(CurrentCharacter)) this.TeachSpell(CurrentCharacter as OtherCharacter); return; }
            }
            next(args);
        }, ModuleCategory.Magic);

        hookFunction("ServerPlayerIsInChatRoom", 10, (args, next) => {
            return next(args) || (CurrentScreen as string) == "LSCG_SPELLS_DIALOG";
        }, ModuleCategory.Magic);

        hookFunction("DialogLeave", 1, (args, next) => {
            this.CloseSpellMenu();
            return next(args);
        }, ModuleCategory.Magic)

        OnActivity(1, ModuleCategory.Magic, (data: ServerChatRoomMessage, sender, msg, megadata) => {
            if (!this.Enabled)
                return;
            let meta = GetMetadata(data);
            let activityName = meta?.ActivityName;
            let target = meta?.TargetMemberNumber;
            let thrownInMouth = activityName == "ThrowItem" && meta?.GroupName == "ItemMouth";
            // Offered sips are resolved by the injector's "sip" consent flow instead
            if (target == Player.MemberNumber &&
                IsActivityEnhanced(data) &&
                data.Content != InjectorModule.SIP_OFFER_CONTENT &&
                !!sender) {
                this.HandleQuaff(sender);
            }
        });
    }

    run(): void {

    }

    unload(): void {
        this._unhookEffectChanges?.();
        removeAllHooksByModule(ModuleCategory.Magic);
    }

    /** Applies `defaultBlocked` the first time this player sees an extension effect, and (when `publish`) re-syncs
     *  so others learn which extension effects this client supports (CoreModule.publicSettings sends knownEffects). */
    SyncExtensionEffects(publish: boolean) {
        const seen = this.settings.seenExtensionEffects ??= [];
        let changed = false;
        for (const id of extensionEffectIds()) {
            if (seen.indexOf(id) > -1)
                continue;
            seen.push(id);
            changed = true;
            if (getSpellEffect(id)?.defaultBlocked && this.settings.blockedSpellEffects.indexOf(id) == -1)
                this.settings.blockedSpellEffects.push(id);
        }
        if (changed || publish)
            settingsSave(publish);
    }

    IsMagicItem(item: Item | null): boolean {
        let magicItemKeywords = [
            "wand",
            "enchanted",
            "magic"
        ];
        let craftStr = GetItemNameAndDescriptionConcat(item) ?? "";
        if (!item || !item.Asset)
            return false;
        else if (MagicWandItems.indexOf(item?.Asset?.Name ?? "") > -1)
            return true;
        else if (magicItemKeywords.some(keyword => isPhraseInString(craftStr, keyword)))
            return true;
        else
            return false;
    }

    IsRangedItem(item: Item | null) : boolean {
        let rangedItemKeywords = [
            "wand"
        ];
        let craftStr = GetItemNameAndDescriptionConcat(item) ?? "";
        return rangedItemKeywords.some(keyword => isPhraseInString(craftStr, keyword));
    }

    CanUseMagic(target: Character, checkMagicItem: boolean = true, requireHands: boolean = true) {
        let item = InventoryGet(Player, "ItemHandheld");
        let isWieldingMagicItem = (checkMagicItem) ? (!!item && this.IsMagicItem(item)) : true;
        let hasItemPermission = ServerChatRoomGetAllowItem(Player, target);
        let targetHasMagicEnabled = (target as OtherCharacter).LSCG?.MagicModule?.enabled;
        let whitelisted = !(target as OtherCharacter).LSCG?.MagicModule?.requireWhitelist || (!!Player.MemberNumber && target.WhiteList.indexOf(Player.MemberNumber) > -1) || target.IsPlayer();
        return this.Enabled &&
                targetHasMagicEnabled &&
                isWieldingMagicItem &&
                hasItemPermission &&
                (!requireHands || Player.CanInteract()) &&
                whitelisted &&
                (this.CanCastSpell(target as OtherCharacter) ||
                this.CanWildMagic(target as OtherCharacter) ||
                this.CanTeachSpell(target as OtherCharacter))
    }

    CanCastSpell(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        return this.Enabled && this.AvailableSpells.length > 0 && hasLSCGData(target) && !this.settings.forceWildMagic;
    }

    CanWildMagic(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        return this.Enabled && hasLSCGData(target) && this.settings.enableWildMagic;
    }

    CanTeachSpell(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        let targetItem = InventoryGet(target, "ItemHandheld");
        return this.Enabled && 
            !target.IsPlayer() &&
            this.AvailableSpells.length > 0 &&
            this.IsMagicItem(targetItem);
    }

    PrevScreen: string | undefined = undefined;
    OpenSpellMenu(C: OtherCharacter | PlayerCharacter) {
        if (this.Enabled) {
            this.SpellMenuOpen = true;
            this.PrevScreen = CurrentScreen;
            DialogMenuMapping.dialog.Unload();
            (CurrentScreen as string) = "LSCG_SPELLS_DIALOG";
        }
    }

    CloseSpellMenu() {
        if (this.SpellMenuOpen || (CurrentScreen as string) == "LSCG_SPELLS_DIALOG") {
            this.SpellMenuOpen = false;
            this.TeachingSpell = false;
            this.SpellPairOption.SelectOpen = false;
            if ((CurrentScreen as string) == "LSCG_SPELLS_DIALOG")
                (CurrentScreen as string) = this.PrevScreen ?? "ChatRoom";
            DialogMenuMapping.dialog.Load();
        }
    }

    TeachSpell(target: OtherCharacter) {
        if (this.Enabled) {
            this.OpenSpellMenu(target);
            this.TeachingSpell = true;
        }
    }

    SpellGrid: CommonGenerateGridParameters = {
        x: 550,
        y: 200,
        height: 690,
        width: 900,
        itemHeight: 225,
        itemWidth: 220
    }
    boxDimensions = {x: 500, y: 100, width: 1000, height: 850};

    DrawSpellMenu() {
        if (!CurrentCharacter)
            return this.CloseSpellMenu();
        const target = CurrentCharacter;

        let toolbarY = this.boxDimensions.y + 5;
        let toolbarRight = this.boxDimensions.x + this.boxDimensions.width - 5;
        let buttonSize = 90;
        
        // Draw Hovering Box & exit button
        DrawRect(this.boxDimensions.x, this.boxDimensions.y, this.boxDimensions.width, this.boxDimensions.height, "Black");
        DrawEmptyRect(this.boxDimensions.x + 2, this.boxDimensions.y + 2, this.boxDimensions.width - 4, this.boxDimensions.height - 4, "White", 2);
        DrawButton(toolbarRight - buttonSize, toolbarY, buttonSize, buttonSize, "", "White", "Icons/Exit.png", "Cancel");

        if (this.SpellPairOption.SelectOpen) {
            DrawTextFit("Select a paired target...", this.boxDimensions.x + 400, this.boxDimensions.y + 50, 600, "White", "Grey");
            // Draw 2x5 columns of character names
            this.PairedCharacterOptions(this.SpellPairOption.Source).forEach((char, ix, arr) => {
                DrawButton(this.SpellGrid.x + (ix > 4 ? 450 : 0), this.SpellGrid.y + ((ix % 5) * 120), this.PairedCharacterOptions(this.SpellPairOption.Source).length > 5 ? 400 : 800, 100, CharacterNickname(char), "White");
            });
        }
        else {
            DrawTextFit("Select a spell to cast...", this.boxDimensions.x + 400, this.boxDimensions.y + 50, 600, "White", "Grey");
            // Draw toolbar
            if (this.AvailableSpells.length > 12) {
                DrawButton(toolbarRight - (buttonSize * 2), toolbarY, buttonSize, buttonSize, "", "White", "Icons/Next.png", "Next");
                DrawButton(toolbarRight - (buttonSize * 3), toolbarY, buttonSize, buttonSize, "", "White", "Icons/Prev.png", "Previous");
            }

            // Draw a grid with all activities
            CommonGenerateGrid(this.AvailableSpells, this.SpellMenuOffset, this.SpellGrid, (spell: SpellDefinition, x: number, y: number, width: number, height: number) => {            
                let label = spell.Name;
                let image = "Icons/Magic.png";

                let icons: InventoryIcon[] = [];
                let background = "white";
                const status = this.GetSpellStatus(spell, target);
                if (spellHasPairedEffect(spell))
                    icons.push("Handheld");
                if (!status.castable)
                    background = "grey";
                else if (status.effects.some(e => e.status !== "ok")) {
                    icons.push("AllowedLimited");
                    background = "orange";
                }

                let desc = status.effects.length == 0 ? "None" : status.effects
                    .map(e => effectLabel(e.id) + (e.status === "blocked" ? " (blocked)" : e.status === "unsupported" ? " (unsupported)" : ""))
                    .join(", ");

                DrawPreviewBox(x, y, image, label, { Hover: true, Icons: icons, Background: background, Width: width, Height: height });
                if (MouseHovering(x, y, width, height)) {
                    DrawRect(this.boxDimensions.x + (this.boxDimensions.width - 500 - 350), this.boxDimensions.y + this.boxDimensions.height - 56, 700, 50, LSCG_TEAL);
                    DrawEmptyRect(this.boxDimensions.x + (this.boxDimensions.width-500-350) + 2, this.boxDimensions.y + this.boxDimensions.height - 56 + 2, 700 - 4, 50 - 4, "Black", 2);
                    DrawTextFit(desc, 1000, this.boxDimensions.y + this.boxDimensions.height - 30, 600, "Black", "White");
                }
                return false;
            });
        }
    }

    ClickSpellMenu() {
        if (!CurrentCharacter)
            return this.CloseSpellMenu();
        const target = CurrentCharacter;

        // Handle toolbar clicks
        let toolbarY = this.boxDimensions.y + 5;
        let toolbarRight = this.boxDimensions.x + this.boxDimensions.width - 5;
        let buttonSize = 90;
        if (MouseIn(toolbarRight - buttonSize, toolbarY, buttonSize, buttonSize)) {
            this.CloseSpellMenu();
        }

        if (this.SpellPairOption.SelectOpen) {
            let characterOptions = this.PairedCharacterOptions(this.SpellPairOption.Source);
            if (characterOptions.length <= 0) {
                this.CloseSpellMenu();    
            }
            characterOptions.forEach((char, ix, arr) => {
                if (MouseIn(this.SpellGrid.x + (ix > 4 ? 450 : 0), this.SpellGrid.y + ((ix % 5) * 120), this.PairedCharacterOptions(this.SpellPairOption.Source).length > 5 ? 400 : 800, 100)) {
                    if (!!this.SpellPairOption.Source)
                        this.CastSpellActual(this.SpellPairOption.Spell, this.SpellPairOption.Source, false, char);
                }
            });
        } else {
            if (this.AvailableSpells.length > 12) {
                // Click Next
                if (MouseIn(toolbarRight - (buttonSize * 2), toolbarY, buttonSize, buttonSize)) {
                    this.SpellMenuOffset += 12;
                    if (this.SpellMenuOffset > this.AvailableSpells.length)
                        this.SpellMenuOffset = 0;
                }
                // Click Prev
                else if (MouseIn(toolbarRight - (buttonSize * 3), toolbarY, buttonSize, buttonSize)) {
                    this.SpellMenuOffset -= 12;
                    if (this.SpellMenuOffset < 0)
                        this.SpellMenuOffset = this.AvailableSpells.length - (this.AvailableSpells.length % 12)
                }
            }
    
            // For each activities in the list
            CommonGenerateGrid(this.AvailableSpells, this.SpellMenuOffset, this.SpellGrid, (spell: SpellDefinition, x: number, y: number, width: number, height: number) => {
                // If this specific activity is clicked, we run it
                if (!MouseIn(x, y, width, height)) return false;
                // Partially blocked spells can be cast; the target's client drops the effects it won't accept.
                let castable = this.GetSpellStatus(spell, target).castable;
                spell = structuredClone(spell);

                if (castable) {
                    this.CastSpellInitial(spell, CurrentCharacter);
                    return true;
                }
                return false;
            });
        }

		return;
    }

    CastWildMagic(C: OtherCharacter | PlayerCharacter) {
        let spellIndex = getRandomInt(this.AvailableSpells.length + 1);
        let spell = this.AvailableSpells[spellIndex];
        if (!spell || this.settings.trueWildMagic)
            spell = this.RandomSpell
        let paired: Character | undefined = undefined;
        spell = structuredClone(spell);
        if (this.SpellNeedsPair(spell))
            paired = this.PairedCharacterOptions(C)[getRandomInt(this.PairedCharacterOptions(C).length)];
        this.CastSpellActual(spell, C, false, paired);
    }

    SpellNeedsPair(spell: SpellDefinition): boolean {
        return spellHasPairedEffect(spell);
    }

    /** How each of a spell's effects would land on `target`: blocked by their settings, or unsupported by their client
     *  (an extension effect they don't have). A spell is castable if at least one effect would apply. */
    GetSpellStatus(spell: SpellDefinition, target: Character): { effects: { id: SpellEffectId, status: "ok" | "blocked" | "unsupported" }[], castable: boolean } {
        const blocked: string[] = safeGetLSCGProp(target, 'MagicModule', 'blockedSpellEffects') ?? [];
        const bypassed: string[] = target.IsPlayer() ? (safeGetLSCGProp(target, 'MagicModule', 'bypassForSelfEffects') ?? []) : [];
        // Older clients don't send knownEffects: they support the legacy built-ins only.
        const known: string[] = target.IsPlayer() ? advertisedEffectIds() : (safeGetLSCGProp(target, 'MagicModule', 'knownEffects') ?? []);
        const effects = spell.Effects.map(id => {
            const supported = isLegacyEffect(id) || known.indexOf(id) > -1;
            const isBlocked = blocked.indexOf(id) > -1 && bypassed.indexOf(id) == -1;
            return { id, status: !supported ? "unsupported" as const : isBlocked ? "blocked" as const : "ok" as const };
        });
        return { effects, castable: effects.some(e => e.status === "ok") };
    }

    CastSpellInitial(spell: SpellDefinition, C: Character | null) {
        if (!!C) {
            if (this.TeachingSpell) {
                this.TeachSpellActual(spell, C as OtherCharacter);
            }
            else if (this.SpellNeedsPair(spell)) {
                this.SpellPairOption.Spell = spell;
                this.SpellPairOption.Source = C;
                this.SpellPairOption.SelectOpen = true;
            } else {
                this.CastSpellActual(spell, C, false);
            }
        }
    }

    getTeachingActionString(spell: SpellDefinition, item: Item | null, targetItem: Item | null): string {
        let itemName = !!item ? (item?.Craft?.Name ?? item?.Asset.Description) : "wand";
        let targetItemName = !!targetItem ? (targetItem?.Craft?.Name ?? targetItem?.Asset.Description) : "wand";
        let teachingActionStrings: string[] = [
            `%NAME% slowly waves %POSSESSIVE% ${itemName} in an intricate pattern, making sure %OPP_NAME% follows along with %OPP_POSSESSIVE% ${targetItemName}.`,
            `%NAME% repeats an indecipherable phrase, touching %POSSESSIVE% ${itemName} to %OPP_NAME%'s ${targetItemName}.`,
            `%NAME% holds both %POSSESSIVE% ${itemName} and %OPP_NAME%'s ${targetItemName} tightly, energy traveling from one to the other.`
        ];
        return teachingActionStrings[getRandomInt(teachingActionStrings.length)];
    }

    getCastingActionString(spell: SpellDefinition, item: Item | null, voiceCast: boolean, target: Character, paired?: Character): string {
        let itemName = !!item ? (item?.Craft?.Name ?? item?.Asset.Description) : "wand";
        let pairedDefaultStr = `${!!paired ? ", the spell's power also arcing to " + CharacterNickname(paired) + "." : "."}`;
        let rangedCastingActionStrings: string[] = [
            `%NAME% waves %POSSESSIVE% ${itemName} in an intricate pattern and casts ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase, pointing %POSSESSIVE% ${itemName} at %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
            `%NAME% aims %POSSESSIVE% ${itemName} at %OPP_NAME% and, with a grin, casts ${spell.Name}${pairedDefaultStr}`
        ];
        let meleeCastingActionStrings: string[] = [
            `%NAME% waves %POSSESSIVE% ${itemName} in front of %OPP_NAME%, and with a sudden boop, casts ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase, tapping %POSSESSIVE% ${itemName} against %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
            `%NAME% baps %OPP_NAME% with %POSSESSIVE% ${itemName} and, with a grin, casts ${spell.Name}${pairedDefaultStr}`
        ];
        let voiceCastingActionStrings: string[] = [
            `%NAME% intones with magical power, using nothing but %POSSESSIVE% voice to cast ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase containing the name of %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`
        ];

        let castingActionStrings;
        if (voiceCast)
            castingActionStrings = voiceCastingActionStrings;
        else
            castingActionStrings = this.IsRangedItem(item) ? rangedCastingActionStrings : meleeCastingActionStrings;

        return castingActionStrings[getRandomInt(castingActionStrings.length)];
    }

    CastSpellActual(spell: SpellDefinition | undefined, spellTarget: Character, voiceCast: boolean, pairedTarget?: Character) {
        if (!!spell && !!spellTarget) {
            let wand = InventoryGet(Player, "ItemHandheld");
            if (!!wand && !!wand.Craft && wand.Craft.MemberNumber != Player.MemberNumber && getRandomInt(2) == 0) { // 50% chance of backfire when using someone else's wand
                let crafter = getCharacter(wand.Craft.MemberNumber ?? -1);
                let crafterName = !crafter ? "someone" : CharacterNickname(crafter);
                if (!spellTarget.IsPlayer()) {
                    SendAction(`%NAME% struggles to wield ${crafterName}'s ${wand.Craft.Name}, %POSSESSIVE% spell backfiring.`);
                    spellTarget = Player;
                } else {
                    SendAction(`%NAME% struggles to wield ${crafterName}'s ${wand.Craft.Name}, %POSSESSIVE% spell fizzling with no effect.`);
                    DialogLeave();
                    return;
                }
            }
            else if (!hasMagicModule(spellTarget)) {
                SendAction(`%NAME% casts ${spell.Name} at %OPP_NAME% but it seems to fizzle.`, spellTarget);
                this.CloseSpellMenu();
                DialogLeave();
                return;
            }
            else {
                SendAction(this.getCastingActionString(spell, InventoryGet(Player, "ItemHandheld"), voiceCast, spellTarget, pairedTarget), spellTarget);
            }

            this.UnpackSpellCodes(spell);
            emit("spell.cast", { spell: spellInfo(spell), target: spellTarget.MemberNumber ?? -1, paired: pairedTarget?.MemberNumber });

            if (spellTarget.IsPlayer()) {
                let check = getModule<ItemUseModule>("ItemUseModule").UnopposedActivityRoll(spellTarget);
                setTimeout(() => this.IncomingSpell(Player, spell, pairedTarget, Math.max(1, check.Total / 2)), 1000);
            }
            else
                sendLSCGCommand(spellTarget, "spell", [
                    {
                        name: "spell",
                        value: spell
                    }, {
                        name: "paired",
                        value: pairedTarget?.MemberNumber
                    }
                ]);
        }
        this.CloseSpellMenu();
        DialogLeave();
    }

    TeachSpellActual(spell: SpellDefinition, target: OtherCharacter) {
        if (!!spell && !!target) {
            if (!target.LSCG.MagicModule)
                SendAction(`%NAME% tries to explain the details of ${spell.Name} to %OPP_NAME% but %OPP_PRONOUN% don't seem to understand.`, target);
            else if (!target.LSCG?.MagicModule.enabled) {
                SendAction(`%NAME% tries to teach %OPP_NAME% ${spell.Name} but %OPP_PRONOUN% don't seem to have ̶i̶n̶s̶t̶a̶l̶l̶e̶d̶ embraced Magic™.`, target);
            }
            else {
                SendAction(this.getTeachingActionString(spell, InventoryGet(Player, "ItemHandheld"), InventoryGet(target, "ItemHandheld")), target);
                this.UnpackSpellCodes(spell, true);
                setTimeout(() => {
                    sendLSCGCommand(target, "spell-teach", [
                        {
                            name: "spell",
                            value: spell
                        }
                    ]);
                }, 2000); // 2sec wait until actual teach
            }
        }
        this.CloseSpellMenu();
        DialogLeave();
    }

    // ********************** INCOMING *************************

    DefendAgainst(sender: number): boolean {
        if (this.settings.neverDefend)
            return false;
        else if (this.noDefenseMemberIds.indexOf(sender) > -1)
            return false;
        else
            return true;
    }

    SpellIsBeneficial(spell: SpellDefinition) {
        return spellIsBeneficial(spell);
    }

    IncomingSpellCommand(sender: Character | null, msg: LSCGMessageModel) {
        if (!this.Enabled || !sender || this.WhitelistBlocked(sender)) {
            SendAction(`${!sender ? "Someone" : CharacterNickname(sender)}'s spell fizzles.`);
            return;
        }
        setTimeout(() => {
            if (msg.command?.name == "spell") {
                let paired = getCharacter((msg.command?.args.find(arg => arg.name == "paired")?.value as number));
                let magicBarrier = Player?.LSCG?.StateModule?.states?.find(s => s.type == "protected");
                let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
                if (!spell || !sender)
                    return;
                let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
                if (!this.SpellIsBeneficial(spell) && this.DefendAgainst(sender.MemberNumber ?? -1)) {
                    if (check.AttackerRoll.Total < check.DefenderRoll.Total) {
                        SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully saves against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}${spell.Name}.`);
                        emit("spell.resisted", { spell: spellInfo(spell), sender: sender.MemberNumber ?? -1, bounced: !!magicBarrier?.active });
                        if (magicBarrier?.active) {
                            // if saved with a protected barrier, the spell will bounce back to sender
                            SendAction(`The magical barrier around ${CharacterNickname(Player)} make the spell bounce back to ${CharacterNickname(sender)}!`);
                            sendLSCGCommand(sender, "spell", [
                                {
                                    name: "spell",
                                    value: spell
                                }, {
                                    name: "paired",
                                    value: undefined
                                }
                            ]);
                            this.stateModule.BarrierState.Recover(false);
                            SendAction(`The magical barrier around ${CharacterNickname(Player)} disappear, drained of all its magical power.`);
                        }
                        return;
                    }
                }
                if (magicBarrier?.active) {
                    this.stateModule.BarrierState.Recover(false);
                    SendAction(`The magical barrier around ${CharacterNickname(Player)} shatters, pierced by ${CharacterNickname(sender)}'s spell!`);
                }
                this.IncomingSpell(sender, spell, paired, Math.max(1, check.AttackerRoll.Total - check.DefenderRoll.Total));
            }
            else if (msg.command?.name == "pair") {
                let origin = getCharacter(msg.command?.args.find(arg => arg.name == "paired")?.value as number);
                let spellEffect = msg.command?.args?.find(arg => arg.name == "spell-effect")?.value as SpellEffectId;
                let pairType = msg.command?.args?.find(arg => arg.name == "pair-type")?.value as LSCGState;
                if (!!origin && !!spellEffect && !!pairType)
                    this.IncomingSpellPair(sender, spellEffect, origin, pairType);
                else if (!!sender && !origin) {
                    SendAction(`${CharacterNickname(sender)}'s paired spell fizzles because the origin target has left.`);
                }
            }
        }, 1000); // Slight delay on responding to spell commands, builds anticipation.
    }

    filterAllowedSpellEffects(spell: SpellDefinition, caster: Character | null): SpellEffectId[] {
        return spell.Effects.filter(effect => this.effectIsAllowed(effect, caster));
    }

    effectIsAllowed(effect: SpellEffectId, caster: Character | null): boolean {
        let isBlocked = this.settings.blockedSpellEffects.indexOf(effect) > -1;
        let isBypassed = (caster?.IsPlayer() ?? false) && this.settings.bypassForSelfEffects.indexOf(effect) > -1;
        return (!isBlocked || isBypassed);
    }

    IncomingSpell(sender: Character | null, spell: SpellDefinition, paired?: Character | null, saveDiff: number = 1) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let pairedName = !paired ? "someone else" : CharacterNickname(paired);
        let allowedSpellEffects = this.filterAllowedSpellEffects(spell, sender);
        if (allowedSpellEffects.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }
        let duration: number | undefined = undefined;
        
        if (!this.SpellIsBeneficial(spell)) {
            duration = saveDiff * 5 * (60 * 1000) // 5 minutes for every level of "spell power" (difference between caster and defender checks)
            if (!this.settings.limitedDuration && !spellForcesDuration(spell))
                duration = 0;
            else if (this.settings.maxDuration > 0)
                duration = Math.min(duration, this.settings.maxDuration * (60 * 1000));
        }

        const info = spellInfo(spell);
        const spellHook = emitBefore("spell.beforeReceive", { spell: info, sender: sender?.MemberNumber, effects: [...allowedSpellEffects], duration });
        if (spellHook.cancelled) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%${spellHook.reason ? ` (${spellHook.reason})` : ""}.`);
            return;
        }
        // Extensions may only remove effects, never add them.
        allowedSpellEffects = allowedSpellEffects.filter(e => spellHook.payload.effects.includes(e));
        duration = sanitizeDuration(spellHook.payload.duration, duration);
        if (allowedSpellEffects.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }
        if (!!duration && duration > 0 && this.settings.maxDuration > 0)
            LSCG_SendLocal(`${sender?.IsPlayer() ? 'Your' : senderName + "'s"} ${spell.Name} spell will last ${duration / (60 * 1000)} minutes.`);
        emit("spell.received", { spell: info, sender: sender?.MemberNumber, effects: allowedSpellEffects, duration });

        const spellDuration = duration;
        allowedSpellEffects.forEach((effect, ix, arr) => {
            setTimeout(() => {
                const effectHook = emitBefore("spell.beforeEffect", { effect, spell: info, sender: sender?.MemberNumber, duration: spellDuration });
                // Shadows the spell-wide duration: the cases below use this effect's (possibly adjusted) duration.
                const duration = sanitizeDuration(effectHook.payload.duration, spellDuration);
                const definition = getSpellEffect(effect);
                if (effectHook.cancelled)
                    SendAction(`The ${effectLabel(effect)} magic of ${senderName}'s ${spell.Name} fails to take hold on %NAME%${effectHook.reason ? ` (${effectHook.reason})` : ""}.`);
                else if (!definition)
                    SendAction(`Part of ${senderName}'s ${spell.Name} washes over %NAME% without effect, its magic unfamiliar.`);
                else {
                    definition.apply({ effect, sender, senderName, spell, paired, duration, magic: this });
                    emit("spell.effectApplied", { effect, spell: info, sender: sender?.MemberNumber, duration });
                }
                if (ix == arr.length - 1)
                    settingsSave(true);
            }, 2000 * ix);
        });
    }

    NotifyPair(caster: Character | null, pairedTarget: Character | undefined, spellEffect: SpellEffectId, pairType: LSCGState) {
        if (!pairedTarget)
            return;

        sendLSCGCommand(pairedTarget, "pair", [
            {
                name: "spell-effect",
                value: spellEffect
            }, {
                name: "paired",
                value: Player.MemberNumber
            }, {
                name: "caster",
                value: caster?.MemberNumber
            }, {
                name: "pair-type",
                value: pairType
            }
        ]);
    }

    IncomingSpellPair(sender: Character | null, spellEffect: SpellEffectId, originalTarget: Character, pairType: LSCGState) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let originalTargetName = CharacterNickname(originalTarget);
        let isAllowed = this.effectIsAllowed(spellEffect, sender);

        if (!isAllowed) {
            SendAction(`${senderName}'s paired spell fizzles as it attempts to pair with %NAME%.`);
            sendLSCGCommandBeep(originalTarget.MemberNumber ?? -1, "unpair", [{
                name: "type",
                value: pairType
            }]);
        } else {
            getSpellEffect(spellEffect)?.applyPaired?.({ effect: spellEffect, sender, senderName, spell: { Name: "", Creator: -1, Effects: [spellEffect], AllowPotion: false, AllowVoiceCast: false }, magic: this }, originalTarget);
        }

        settingsSave(true);
    }

    WhitelistBlocked(sender: Character) {
        return this.settings.requireWhitelist && !!sender.MemberNumber && Player.WhiteList.indexOf(sender.MemberNumber) == -1 && !sender.IsPlayer();
    }

    IncomingSpellTeachCommand(sender: Character | null, msg: LSCGMessageModel) {
        if (!this.Enabled || !sender || this.WhitelistBlocked(sender))
            return;
        let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
        if (this.AvailableSpells.length >= KNOWN_SPELLS_LIMIT)
            SendAction(`%NAME%'s mind is already full of spells. %INTENSIVE% must forget one before %INTENSIVE% can learn ${spell.Name}.`);
        if (this.AvailableSpells.find(s => s.Name == spell.Name)) {
            SendAction(`%NAME% already knows a spell called ${spell.Name} and ignores %POSSESSIVE% new instructions.`);
        } else {
            SendAction(`%NAME% grins as they finally understand the details of ${spell.Name} and memorizes it for later.`);
            let outfitModule = getModule<OutfitCollectionModule>("OutfitCollectionModule");
            let outfitSave = false;
            if (!!spell.Outfit?.Code && !!spell.Outfit?.Key && !outfitModule.data.GetOutfit(spell.Outfit.Key)) {
                outfitModule?.data.SetOutfitCode(spell.Outfit.Key, spell.Outfit.Code);
                outfitSave = true;
            }
            if (!!spell.Polymorph?.Code && !!spell.Polymorph?.Key && !outfitModule.data.GetOutfit(spell.Polymorph.Key)) {
                outfitModule?.data.SetOutfitCode(spell.Polymorph.Key, spell.Polymorph.Code);
                outfitSave = true;
            }
            if (!!spell.Outfit) spell.Outfit.Code = "";
            if (!!spell.Polymorph) spell.Polymorph.Code = "";
            this.settings.knownSpells.push(spell);
            settingsSave(true);
            if (outfitSave) outfitModule.data.SaveOutfits();
        }
    }

    // ***************** Voice Casting *******************

    CheckForSpellVoiceCasting(msg: string): void {
        let spellTargetPair: [SpellDefinition | null, Character | null] | undefined = this.getSpellTargetTupleFromMsg(msg);
        if (!spellTargetPair || !spellTargetPair[0] || !spellTargetPair[1]) // Skip if no or invalid tuple result
            return;

        let foundSpell = spellTargetPair[0];
        let target = spellTargetPair[1];
        if (!this.CanUseMagic(target, false, false)) {
            return;
        }
        let pairTgt: Character | undefined;
        if (this.SpellNeedsPair(foundSpell)) {
            pairTgt = this.PairedCharacterOptions(target)[getRandomInt(this.PairedCharacterOptions(target).length)];
        }
        this.CastSpellActual(foundSpell, target, true, pairTgt);
    }

    getSpellTargetTupleFromMsg(msg: string): [SpellDefinition | null, Character | null] | undefined {
        let oocParsedString = excludeParentheticalContent(msg); // Don't allow voice casting in OOC chat   
        let characterNames = ChatRoomCharacter.map(c => [c.Name, c.Nickname, c.Nickname?.normalize('NFKC'), c.MemberNumber + ""]).reduce((a, b) => a.concat(b)).filter(c => !!c);
        for (let s of this.AvailableSpells.filter(s => s.AllowVoiceCast)) { // Only look at spells which allow voice cast
            if (!s.AllowVoiceCast)
                continue;
            let searchPhrase = (!!s.CastingPhrase && s.CastingPhrase.length > 0) ? s.CastingPhrase : s.Name;
            let re = new RegExp(`\\b${escapeRegExp(searchPhrase)}\\b (${characterNames.map(c => escapeRegExp(c!)).join("|")})`, "i");
            let matches = re.exec(oocParsedString);
            if (!matches)
                continue;
            let characterPhrase = matches?.[1] ?? "";
            let character = getCharacterByNicknameOrMemberNumber(characterPhrase);
            if (!!character)
                return [s, character];
        }
        return undefined;
    }

    // ***************** Potions *******************
    /**
     * @param consented The drinker already accepted (or lost a force contest over) this potion,
     * so it's swallowed without another resist roll or swallow message.
     */
    HandleQuaff(sender: Character, consented: boolean = false) {
        let item = InventoryGet(sender, "ItemHandheld");
        let spell = this.GetSpellFromItem(item, sender, consented);
        if (!!spell && !!item)
            this.HandleQuaffWithSpell(sender, getModule<ItemUseModule>("ItemUseModule")?.getItemName(item), spell, consented);
    }

    HandleQuaffWithSpell(sender: Character | null, itemName: string, spell: SpellDefinition | undefined, consented: boolean = false) {
        if (!!spell && !!itemName && !!sender) {
            if (consented)
                return this.ProcessPotion(sender, spell);
            let gagType = getModule<InjectorModule>("InjectorModule")?.GetGagDrinkAccess(Player);
            if (!this.SpellIsBeneficial(spell) && gagType == "nothing" && sender.MemberNumber != Player.MemberNumber) {
                this.TryForcePotion(sender, itemName, spell);
            } else {
                if (sender.IsPlayer())
                    SendAction(`%NAME% swallows %POSSESSIVE% ${itemName}.`, sender);
                else
                    SendAction(`%NAME% swallows %OPP_NAME%'s ${itemName}.`, sender)
                this.ProcessPotion(sender, spell);
            }
        }
    }

    TryForcePotion(sender: Character, itemName: string, spell: SpellDefinition) {
        let itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            return this.ProcessPotion(sender, spell);
        }
        let check = itemUseModule?.MakeActivityCheck(sender, Player);
        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
            SendAction(`%OPP_NAME% ${check.AttackerRoll.TotalStr}manages to get %OPP_POSSESSIVE% ${itemName} past %NAME%'s ${check.DefenderRoll.TotalStr}lips, forcing %INTENSIVE% to swallow it.`, sender);
            this.ProcessPotion(sender, spell);
        } else {
            SendAction(`%NAME% ${check.DefenderRoll.TotalStr}successfully defends against %OPP_NAME%'s ${check.AttackerRoll.TotalStr}attempt to force %INTENSIVE% to swallow %OPP_POSSESSIVE% ${itemName}.`, sender);
        }
    }

    ProcessPotion(sender: Character, spell: SpellDefinition) {
        setTimeout(() => {
            if (!!spell && this.Enabled) {
                this.IncomingSpell(sender, spell);
            }
        }, 1000);
    }

    /** Outstanding spell lookups from other crafters, mapped to whether the potion was consented to. */
    itemSpellRequests: Map<number, boolean> = new Map<number, boolean>();

    GetSpellFromItem(item: Item | null, itemUser: Character, consented: boolean = false): SpellDefinition | undefined {
        let itemCraft = item?.Craft;
        let itemStr = GetItemNameAndDescriptionConcat(item) ?? "";
        if (!item || !itemCraft || !itemStr)
            return;

        let itemName = getModule<ItemUseModule>("ItemUseModule")?.getItemName(item);
        let spells: SpellDefinition[] = []
        let craftingMember = itemCraft.MemberNumber;
        if (!!craftingMember && craftingMember >= 0) {
            let craftingChar = getCharacter(craftingMember) as OtherCharacter;
            if (!!craftingChar && craftingChar.IsPlayer()) {
                spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !spellHasPairedEffect(s));
                let foundSpell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
                this.UnpackSpellCodes(foundSpell);
                return foundSpell;
            } else {
                let reqId = Date.now();
                this.itemSpellRequests.set(reqId, consented);
                sendLSCGCommandBeep(craftingMember, "get-spell", [{
                    name: "itemStr",
                    value: itemStr
                }, {
                    name: "id",
                    value: reqId
                }, {
                    name: "originator",
                    value: itemUser?.MemberNumber ?? Player.MemberNumber
                }, {
                    name: "itemName",
                    value: itemName
                }]);
            }
        }
        return undefined;
    }

    HandleItemSpellRequest(senderNum: number, request: LSCGMessageModel) {
        let itemStr = request.command?.args.find(a => a.name == "itemStr")?.value as string;
        let reqId = request.command?.args.find(a => a.name == "id")?.value as number;

        if (!itemStr || !reqId)
            return;

        let spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !spellHasPairedEffect(s));
        let spell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
        if (!!spell)
            spell = structuredClone(spell);
            this.UnpackSpellCodes(spell);
            sendLSCGCommandBeep(senderNum, "get-spell-response", [{
                name: "spell",
                value: spell
            }, {
                name: "id",
                value: reqId
            }, {
                name: "originator",
                value: request.command?.args.find(a => a.name == "originator")?.value as number
            }, {
                name: "itemName",
                value: request.command?.args.find(a => a.name == "itemName")?.value as Item
            }]);
    }

    IncomingGetItemSpellResponse(senderNum: number, response: LSCGMessageModel) {
        let reqId = response.command?.args.find(a => a.name == "id")?.value as number;
        let spell = response.command?.args.find(a => a.name == "spell")?.value as SpellDefinition;
        let itemName = response.command?.args.find(a => a.name == "itemName")?.value as string;
        let originator = response.command?.args.find(a => a.name == "originator")?.value as number;
        let sender = getCharacter(originator);

        if (this.itemSpellRequests.has(reqId)) {
            let consented = this.itemSpellRequests.get(reqId);
            this.itemSpellRequests.delete(reqId);
            setTimeout(() => {
                this.HandleQuaffWithSpell(sender, itemName, spell, consented);
            }, 1000);
        }
    }

    UnpackSpellCodes(spell: SpellDefinition | undefined, skipFilter: boolean = false) {
        if (!spell)
            return;
        // Unpack specified outfit codes for sending.
        if (!!spell.Outfit && !!spell.Outfit.Key) {
            spell.Outfit.Code = LZString.compressToBase64(JSON.stringify(GetConfiguredItemBundlesFromOutfitKey(spell.Outfit.Key, item => skipFilter || RedressedState.ItemIsAllowed(item))));
        } 
        if (!!spell.Polymorph && spell.Polymorph.Key) {
            spell.Polymorph.Code = LZString.compressToBase64(JSON.stringify(GetConfiguredItemBundlesFromOutfitKey(spell.Polymorph.Key, item => skipFilter || PolymorphedState.ItemIsAllowed(item))));
        }
    }
}

/** Accepts an extension-adjusted duration (ms) only if it's sane; otherwise keeps LSCG's own. `undefined` stays allowed. */
function sanitizeDuration(duration: unknown, fallback: number | undefined): number | undefined {
    if (duration === undefined) return undefined;
    return typeof duration === "number" && Number.isFinite(duration) && duration >= 0 ? duration : fallback;
}
