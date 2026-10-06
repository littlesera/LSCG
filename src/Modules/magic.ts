import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GetConfiguredItemBundlesFromOutfitKey, GetDelimitedList, OnChat, GetItemNameAndDescriptionConcat, GetMetadata, LSCG_SendLocal, LSCG_TEAL, OnActivity, SendAction, getCharacter, getRandomInt, hookFunction, isPhraseInString, removeAllHooksByModule, sendLSCGCommand, sendLSCGCommandBeep, settingsSave, getCharacterByNicknameOrMemberNumber, excludeParentheticalContent, escapeRegExp } from "../utils";
import { ABSOLUTE_MAX_SPELL_EFFECTS, DamageConfig, DamageSave, DEFAULT_MAX_SPELL_EFFECTS, KNOWN_SPELLS_LIMIT, LSCGSpellEffect, MagicSettingsModel, OutfitOption, SpellDefinition, SpellEffectId } from "Settings/Models/magic";
import { effectConfigFor, retier, sanitizeSpell } from "./Magic/spellEdit";
import { GuiMagic } from "Settings/magic";
import { StateModule } from "./states";
import { IsActivityEnhanced, ItemUseModule, MagicWandItems } from "./item-use";
import { InjectorModule } from "./injector";
import { RedressedState } from "./States/RedressedState";
import { PolymorphedState } from "./States/PolymorphedState";
import { OutfitCollectionModule } from "./outfitCollection";
import { hasMagicModule, hasMBSSettings, hasLSCGData, safeGetLSCGProp } from "../types/guards";
import { emit, emitBefore, spellInfo } from "api/events";
import { SPELL_MENU_SHAPE, SpellMenuView } from "./Magic/spellMenu";
import { advertisedEffectIds, allEffectIds, effectLabel, extensionEffectIds, getSpellEffect, isLegacyEffect, spellEffects, spellForcesDuration, spellHasPairedEffect, spellIsBeneficial } from "./Magic/spellEffects";

const dialogButtonInfo = [965, 10, 100, 40, 5];
const dialogButtonCoords: [number,number,number,number] = [dialogButtonInfo[0], dialogButtonInfo[1], 40, 40];
const dialogCastButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1], dialogButtonInfo[2], dialogButtonInfo[3]];
const dialogWildButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1]  + (dialogButtonInfo[3] + dialogButtonInfo[4]), dialogButtonInfo[2], dialogButtonInfo[3]];
const dialogTeachButtonCoords: [number,number,number,number] = [dialogButtonInfo[0] - (dialogButtonInfo[2] + dialogButtonInfo[4]), dialogButtonInfo[1]  + (dialogButtonInfo[3] + dialogButtonInfo[4]) * 2, dialogButtonInfo[2], dialogButtonInfo[3]];

export class MagicModule extends BaseModule {
    DialogMenuOpen: boolean = false;
    SpellMenuOpen: boolean = false;
    /** The DOM menu drawn while SpellMenuOpen; this module owns the game state it shows. */
    spellMenu: SpellMenuView = new SpellMenuView(this);
    TeachingSpell: boolean = false;

    SpellPairOption: {
        SelectOpen: boolean,
        Spell: SpellDefinition | undefined,
        Source: Character | undefined
    } = {
        SelectOpen: false,
        Spell: undefined,
        Source: undefined,
    };

    get Enabled(): boolean {
		return super.Enabled && (ChatRoomData?.BlockCategory?.indexOf("Fantasy") ?? -1) == -1;
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
            maxSpellEffects: DEFAULT_MAX_SPELL_EFFECTS,
            seenExtensionEffects: [],
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
                    Effects: this.PickRandomEffects(allEffectIds(), getRandomInt(3) + 1),
                });
        return this._testSpells;
    }

    get RandomSpell(): SpellDefinition {
        const candidates = spellEffects.all().filter(d => d.allowRandom).map(d => d.id);
        const spell = <SpellDefinition>{
            Name: "wild magic",
            Effects: this.PickRandomEffects(candidates, getRandomInt(3) + 1),
        };
        if (spell.Effects.indexOf(LSCGSpellEffect.outfit) > -1) {
        	const outfitCollection = getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data;
        	const outfitKeys = outfitCollection?.GetOutfitKeys() ?? [];
        	const lscgChoice = outfitKeys.length > 0 ? outfitCollection.GetOutfitBundle(outfitKeys[getRandomInt(outfitKeys.length)]) : undefined;
        	let mbsOutfits: ItemBundle[][] = [];
        	if (hasMBSSettings(Player) && Player.MBSSettings?.FortuneWheelItemSets) {
        		mbsOutfits = Player.MBSSettings.FortuneWheelItemSets
        			.filter((s): s is { itemList?: ItemBundle[] } => !!s)
        			.map(s => s.itemList ?? []);
        	}
        	const mbsChoice = mbsOutfits.length > 0 ? mbsOutfits[getRandomInt(mbsOutfits.length)] : undefined;
            const wardrobeChoice = !Player.Wardrobe ? undefined : Player.Wardrobe[getRandomInt(Player.Wardrobe?.length)];
            const choices = [lscgChoice, mbsChoice, wardrobeChoice].filter(x => !!x);
            const outfit = choices[getRandomInt(choices.length)];
            spell.Outfit = {
                Option: OutfitOption.both,
                Key: "",
                Code: LZString.compressToBase64(JSON.stringify(outfit)),
            };
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
            c.MemberNumber != spellTarget?.MemberNumber,
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
            if (!this.Enabled && this.SpellMenuOpen)
                this.CloseSpellMenu();
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
        }, ModuleCategory.Magic);

        OnActivity(1, ModuleCategory.Magic, (data: ServerChatRoomMessage, sender, msg, megadata) => {
            if (!this.Enabled)
                return;
            const meta = GetMetadata(data);
            const target = meta?.TargetMemberNumber;
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
        this.StripStoredSpellCodes();
        // Spells saved before total power existed, or edited elsewhere, get theirs worked out
        this.AvailableSpells.forEach(spell => { if (Array.isArray(spell?.Effects)) retier(spell); });
    }

    /** Older builds wrote expanded outfit codes back into known spells on voice/potion casts, bloating the saved profile (#680).
     *  Drop a stored code only when its key still resolves, so the code is never the last copy of an outfit. */
    StripStoredSpellCodes() {
        const outfits = getModule<OutfitCollectionModule>("OutfitCollectionModule")?.data;
        if (!outfits) return;
        let changed = false;
        for (const config of this.AvailableSpells.flatMap(s => [s?.Outfit, s?.Polymorph])) {
            if (config?.Code && config.Key && outfits.GetOutfit(config.Key)) {
                config.Code = "";
                changed = true;
            }
        }
        if (changed) settingsSave();
    }

    safeword(): void {
        this.CloseSpellMenu();
    }

    unload(): void {
        this.CloseSpellMenu();
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
        const magicItemKeywords = [
            "wand",
            "enchanted",
            "magic",
        ];
        const craftStr = GetItemNameAndDescriptionConcat(item) ?? "";
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
        const rangedItemKeywords = [
            "wand",
        ];
        const craftStr = GetItemNameAndDescriptionConcat(item) ?? "";
        return rangedItemKeywords.some(keyword => isPhraseInString(craftStr, keyword));
    }

    CanUseMagic(target: Character, checkMagicItem: boolean = true, requireHands: boolean = true) {
        const item = InventoryGet(Player, "ItemHandheld");
        const isWieldingMagicItem = (checkMagicItem) ? (!!item && this.IsMagicItem(item)) : true;
        const hasItemPermission = ServerChatRoomGetAllowItem(Player, target);
        const targetHasMagicEnabled = (target as OtherCharacter).LSCG?.MagicModule?.enabled;
        const whitelisted = !(target as OtherCharacter).LSCG?.MagicModule?.requireWhitelist || (!!Player.MemberNumber && target.WhiteList.indexOf(Player.MemberNumber) > -1) || target.IsPlayer();
        return this.Enabled &&
                targetHasMagicEnabled &&
                isWieldingMagicItem &&
                hasItemPermission &&
                (!requireHands || Player.CanInteract()) &&
                whitelisted &&
                (this.CanCastSpell(target as OtherCharacter) ||
                this.CanWildMagic(target as OtherCharacter) ||
                this.CanTeachSpell(target as OtherCharacter));
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
        const targetItem = InventoryGet(target, "ItemHandheld");
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
            this.spellMenu.open();
        }
    }

    CloseSpellMenu() {
        this.spellMenu.close();
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
            // Before opening: the menu's title is built when it opens.
            this.TeachingSpell = true;
            this.OpenSpellMenu(target);
        }
    }

    /** The menu itself is DOM (SpellMenuView). This keeps the canvas behind it clean, and the dialog from drawing over it. */
    DrawSpellMenu() {
        if (!CurrentCharacter)
            return this.CloseSpellMenu();
        const [x, y, w, h] = SPELL_MENU_SHAPE;
        DrawRect(x, y, w, h, "Black");
        DrawEmptyRect(x + 2, y + 2, w - 4, h - 4, "White", 2);
    }

    /** Clicks inside the menu go to the DOM, not the canvas, so anything arriving here is outside it: dismiss. */
    ClickSpellMenu() {
        this.CloseSpellMenu();
    }

    /** A spell was picked in the menu. */
    ChooseSpell(spell: SpellDefinition) {
        const target = CurrentCharacter;
        if (!target)
            return this.CloseSpellMenu();
        // Partially blocked spells can be cast; the target's client drops the effects it won't accept.
        if (!this.GetSpellStatus(spell, target).castable)
            return;
        this.CastSpellInitial(structuredClone(spell), target);
    }

    CastWildMagic(C: OtherCharacter | PlayerCharacter) {
        const spellIndex = getRandomInt(this.AvailableSpells.length + 1);
        let spell = this.AvailableSpells[spellIndex];
        if (!spell || this.settings.trueWildMagic)
            spell = this.RandomSpell;
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
        const blocked: string[] = safeGetLSCGProp(target, "MagicModule", "blockedSpellEffects") ?? [];
        const bypassed: string[] = target.IsPlayer() ? (safeGetLSCGProp(target, "MagicModule", "bypassForSelfEffects") ?? []) : [];
        // Older clients don't send knownEffects: they support the legacy built-ins only.
        const known: string[] = target.IsPlayer() ? advertisedEffectIds() : (safeGetLSCGProp(target, "MagicModule", "knownEffects") ?? []);
        const effects = spell.Effects.map(id => {
            const supported = isLegacyEffect(id) || known.indexOf(id) > -1;
            const isBlocked = blocked.indexOf(id) > -1 && bypassed.indexOf(id) == -1;
            return { id, status: !supported ? "unsupported" as const : isBlocked ? "blocked" as const : "ok" as const };
        });
        return { effects, castable: effects.some(e => e.status === "ok") };
    }

    CastSpellInitial(spell: SpellDefinition, C: Character | null) {
        if (C) {
            if (this.TeachingSpell) {
                this.TeachSpellActual(spell, C as OtherCharacter);
            }
            else if (this.SpellNeedsPair(spell)) {
                this.SpellPairOption.Spell = spell;
                this.SpellPairOption.Source = C;
                this.SpellPairOption.SelectOpen = true;
                this.spellMenu.refreshView();
            } else {
                this.CastSpellActual(spell, C, false);
            }
        }
    }

    getTeachingActionString(spell: SpellDefinition, item: Item | null, targetItem: Item | null): string {
        const itemName = item ? (item?.Craft?.Name ?? item?.Asset.Description) : "wand";
        const targetItemName = targetItem ? (targetItem?.Craft?.Name ?? targetItem?.Asset.Description) : "wand";
        const teachingActionStrings: string[] = [
            `%NAME% slowly waves %POSSESSIVE% ${itemName} in an intricate pattern, making sure %OPP_NAME% follows along with %OPP_POSSESSIVE% ${targetItemName}.`,
            `%NAME% repeats an indecipherable phrase, touching %POSSESSIVE% ${itemName} to %OPP_NAME%'s ${targetItemName}.`,
            `%NAME% holds both %POSSESSIVE% ${itemName} and %OPP_NAME%'s ${targetItemName} tightly, energy traveling from one to the other.`,
        ];
        return teachingActionStrings[getRandomInt(teachingActionStrings.length)];
    }

    getCastingActionString(spell: SpellDefinition, item: Item | null, voiceCast: boolean, target: Character, paired?: Character): string {
        const itemName = item ? (item?.Craft?.Name ?? item?.Asset.Description) : "wand";
        const pairedDefaultStr = `${paired ? ", the spell's power also arcing to " + CharacterNickname(paired) + "." : "."}`;
        const rangedCastingActionStrings: string[] = [
            `%NAME% waves %POSSESSIVE% ${itemName} in an intricate pattern and casts ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase, pointing %POSSESSIVE% ${itemName} at %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
            `%NAME% aims %POSSESSIVE% ${itemName} at %OPP_NAME% and, with a grin, casts ${spell.Name}${pairedDefaultStr}`,
        ];
        const meleeCastingActionStrings: string[] = [
            `%NAME% waves %POSSESSIVE% ${itemName} in front of %OPP_NAME%, and with a sudden boop, casts ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase, tapping %POSSESSIVE% ${itemName} against %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
            `%NAME% baps %OPP_NAME% with %POSSESSIVE% ${itemName} and, with a grin, casts ${spell.Name}${pairedDefaultStr}`,
        ];
        const voiceCastingActionStrings: string[] = [
            `%NAME% intones with magical power, using nothing but %POSSESSIVE% voice to cast ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase containing the name of %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
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
            const wand = InventoryGet(Player, "ItemHandheld");
            if (!!wand && !!wand.Craft && wand.Craft.MemberNumber != Player.MemberNumber && getRandomInt(2) == 0) { // 50% chance of backfire when using someone else's wand
                const crafter = getCharacter(wand.Craft.MemberNumber ?? -1);
                const crafterName = !crafter ? "someone" : CharacterNickname(crafter);
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
                const check = getModule<ItemUseModule>("ItemUseModule").UnopposedActivityRoll(spellTarget);
                setTimeout(() => this.IncomingSpell(Player, spell, pairedTarget, Math.max(1, check.Total / 2)), 1000);
            }
            else
                sendLSCGCommand(spellTarget, "spell", [
                    {
                        name: "spell",
                        value: spell,
                    }, {
                        name: "paired",
                        value: pairedTarget?.MemberNumber,
                    },
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
                            value: spell,
                        },
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
                const paired = getCharacter((msg.command?.args.find(arg => arg.name == "paired")?.value as number));
                const magicBarrier = Player?.LSCG?.StateModule?.states?.find(s => s.type == "protected");
                const spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
                if (!spell || !sender)
                    return;
                if (typeof spell === "object")
                    sanitizeSpell(spell);
                const check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
                const harmful = !this.SpellIsBeneficial(spell);
                const savedRoll = check.AttackerRoll.Total < check.DefenderRoll.Total;
                if (harmful && this.DefendAgainst(sender.MemberNumber ?? -1)) {
                    if (savedRoll) {
                        SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully saves against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}${spell.Name}.`);
                        emit("spell.resisted", { spell: spellInfo(spell), sender: sender.MemberNumber ?? -1, bounced: !!magicBarrier?.active });
                        if (magicBarrier?.active) {
                            // if saved with a protected barrier, the spell will bounce back to sender
                            SendAction(`The magical barrier around ${CharacterNickname(Player)} make the spell bounce back to ${CharacterNickname(sender)}!`);
                            sendLSCGCommand(sender, "spell", [
                                {
                                    name: "spell",
                                    value: spell,
                                }, {
                                    name: "paired",
                                    value: undefined,
                                },
                            ]);
                            this.stateModule.BarrierState.Recover(false);
                            SendAction(`The magical barrier around ${CharacterNickname(Player)} disappear, drained of all its magical power.`);
                        }
                        else
                            this.ApplySavedDamage(sender, spell);
                        return;
                    }
                }
                if (magicBarrier?.active) {
                    this.stateModule.BarrierState.Recover(false);
                    SendAction(`The magical barrier around ${CharacterNickname(Player)} shatters, pierced by ${CharacterNickname(sender)}'s spell!`);
                }
                // Someone who never resists spells (or doesn't resist this caster) still rolls to save against damage
                const savesAgainstDamage = harmful && savedRoll && !this.DefendAgainst(sender.MemberNumber ?? -1);
                this.IncomingSpell(sender, spell, paired, Math.max(1, check.AttackerRoll.Total - check.DefenderRoll.Total), savesAgainstDamage);
            }
            else if (msg.command?.name == "pair") {
                const origin = getCharacter(msg.command?.args.find(arg => arg.name == "paired")?.value as number);
                const spellEffect = msg.command?.args?.find(arg => arg.name == "spell-effect")?.value as SpellEffectId;
                const pairType = msg.command?.args?.find(arg => arg.name == "pair-type")?.value as LSCGState;
                if (!!origin && !!spellEffect && !!pairType)
                    this.IncomingSpellPair(sender, spellEffect, origin, pairType);
                else if (!!sender && !origin) {
                    SendAction(`${CharacterNickname(sender)}'s paired spell fizzles because the origin target has left.`);
                }
            }
        }, 1000); // Slight delay on responding to spell commands, builds anticipation.
    }

    /** A save that resisted a spell still halves its damage, unless the caster made the damage "No damage on a save". Only the
     *  damage is applied; everything else was resisted. */
    ApplySavedDamage(sender: Character, spell: SpellDefinition) {
        // Each Damaging copy keeps its own settings, so keep the effect/settings pairs together.
        const copies = spell.Effects.map((effect, index) => ({ effect, index })).filter(e => e.effect === LSCGSpellEffect.damage);
        const hurting = copies.filter(e => (effectConfigFor(spell, e.index) as DamageConfig | undefined)?.Save !== DamageSave.none);
        if (hurting.length <= 0)
            return;
        const damageOnly: SpellDefinition = { ...spell, Effects: hurting.map(e => e.effect), Configs: hurting.map(e => spell.Configs?.[e.index] ?? null) };
        this.IncomingSpell(sender, damageOnly, null, 1, true);
    }

    /** The spell's effects the target allows, each with its position so it applies with its own settings. */
    allowedEffectEntries(spell: SpellDefinition, caster: Character | null): { effect: SpellEffectId; index: number }[] {
        return spell.Effects.map((effect, index) => ({ effect, index })).filter(e => this.effectIsAllowed(e.effect, caster));
    }

    filterAllowedSpellEffects(spell: SpellDefinition, caster: Character | null): SpellEffectId[] {
        return this.allowedEffectEntries(spell, caster).map(e => e.effect);
    }

    effectIsAllowed(effect: SpellEffectId, caster: Character | null): boolean {
        const isBlocked = this.settings.blockedSpellEffects.indexOf(effect) > -1;
        const isBypassed = (caster?.IsPlayer() ?? false) && this.settings.bypassForSelfEffects.indexOf(effect) > -1;
        return (!isBlocked || isBypassed);
    }

    /** `saved`: the target's roll beat the caster's, so damage is halved (or negated) while the rest of the spell applies as given. */
    IncomingSpell(sender: Character | null, spell: SpellDefinition, paired?: Character | null, saveDiff: number = 1, saved: boolean = false) {
        const senderName = !sender ? "Someone" : CharacterNickname(sender);
        // However many a caster's spell claims, only so many are applied: each one is a timer on this client.
        let allowedEntries = this.allowedEffectEntries(spell, sender).slice(0, ABSOLUTE_MAX_SPELL_EFFECTS);
        if (allowedEntries.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }
        let duration: number | undefined = undefined;
        
        if (!this.SpellIsBeneficial(spell)) {
            duration = saveDiff * 5 * (60 * 1000); // 5 minutes for every level of "spell power" (difference between caster and defender checks)
            if (!this.settings.limitedDuration && !spellForcesDuration(spell))
                duration = 0;
            else if (this.settings.maxDuration > 0)
                duration = Math.min(duration, this.settings.maxDuration * (60 * 1000));
        }

        const info = spellInfo(spell);
        const spellHook = emitBefore("spell.beforeReceive", { spell: info, sender: sender?.MemberNumber, effects: allowedEntries.map(e => e.effect), duration });
        if (spellHook.cancelled) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%${spellHook.reason ? ` (${spellHook.reason})` : ""}.`);
            return;
        }
        // Extensions may only remove effects, never add them.
        allowedEntries = allowedEntries.filter(e => spellHook.payload.effects.includes(e.effect));
        duration = sanitizeDuration(spellHook.payload.duration, duration);
        if (allowedEntries.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }
        if (!!duration && duration > 0 && this.settings.maxDuration > 0)
            LSCG_SendLocal(`${sender?.IsPlayer() ? "Your" : senderName + "'s"} ${spell.Name} spell will last ${duration / (60 * 1000)} minutes.`);
        emit("spell.received", { spell: info, sender: sender?.MemberNumber, effects: allowedEntries.map(e => e.effect), duration });

        const spellDuration = duration;
        allowedEntries.forEach(({ effect, index }, ix, arr) => {
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
                    definition.apply({ effect, sender, senderName, spell, paired, duration, magic: this, saved, index, config: effectConfigFor(spell, index) });
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
                value: spellEffect,
            }, {
                name: "paired",
                value: Player.MemberNumber,
            }, {
                name: "caster",
                value: caster?.MemberNumber,
            }, {
                name: "pair-type",
                value: pairType,
            },
        ]);
    }

    IncomingSpellPair(sender: Character | null, spellEffect: SpellEffectId, originalTarget: Character, pairType: LSCGState) {
        const senderName = !sender ? "Someone" : CharacterNickname(sender);
        const isAllowed = this.effectIsAllowed(spellEffect, sender);

        if (!isAllowed) {
            SendAction(`${senderName}'s paired spell fizzles as it attempts to pair with %NAME%.`);
            sendLSCGCommandBeep(originalTarget.MemberNumber ?? -1, "unpair", [{
                name: "type",
                value: pairType,
            }]);
        } else {
            getSpellEffect(spellEffect)?.applyPaired?.({ effect: spellEffect, sender, senderName, spell: { Name: "", Creator: -1, Effects: [spellEffect], AllowPotion: false, AllowVoiceCast: false }, magic: this, index: 0 }, originalTarget);
        }

        settingsSave(true);
    }

    WhitelistBlocked(sender: Character) {
        return this.settings.requireWhitelist && !!sender.MemberNumber && Player.WhiteList.indexOf(sender.MemberNumber) == -1 && !sender.IsPlayer();
    }

    IncomingSpellTeachCommand(sender: Character | null, msg: LSCGMessageModel) {
        if (!this.Enabled || !sender || this.WhitelistBlocked(sender))
            return;
        const spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
        // It is saved with this player's settings, so keep what a sender can make it carry within limits.
        if (spell && typeof spell === "object") {
            sanitizeSpell(spell);
        }
        if (this.AvailableSpells.length >= KNOWN_SPELLS_LIMIT)
            SendAction(`%NAME%'s mind is already full of spells. %INTENSIVE% must forget one before %INTENSIVE% can learn ${spell.Name}.`);
        if (this.AvailableSpells.find(s => s.Name == spell.Name)) {
            SendAction(`%NAME% already knows a spell called ${spell.Name} and ignores %POSSESSIVE% new instructions.`);
        } else {
            SendAction(`%NAME% grins as they finally understand the details of ${spell.Name} and memorizes it for later.`);
            const outfitModule = getModule<OutfitCollectionModule>("OutfitCollectionModule");
            let outfitSave = false;
            if (!!spell.Outfit?.Code && !!spell.Outfit?.Key && !outfitModule.data.GetOutfit(spell.Outfit.Key)) {
                outfitModule?.data.SetOutfitCode(spell.Outfit.Key, spell.Outfit.Code);
                outfitSave = true;
            }
            if (!!spell.Polymorph?.Code && !!spell.Polymorph?.Key && !outfitModule.data.GetOutfit(spell.Polymorph.Key)) {
                outfitModule?.data.SetOutfitCode(spell.Polymorph.Key, spell.Polymorph.Code);
                outfitSave = true;
            }
            if (spell.Outfit) spell.Outfit.Code = "";
            if (spell.Polymorph) spell.Polymorph.Code = "";
            this.settings.knownSpells.push(spell);
            settingsSave(true);
            if (outfitSave) outfitModule.data.SaveOutfits();
        }
    }

    // ***************** Voice Casting *******************

    CheckForSpellVoiceCasting(msg: string): void {
        const spellTargetPair: [SpellDefinition | null, Character | null] | undefined = this.getSpellTargetTupleFromMsg(msg);
        if (!spellTargetPair || !spellTargetPair[0] || !spellTargetPair[1]) // Skip if no or invalid tuple result
            return;

        const foundSpell = spellTargetPair[0];
        const target = spellTargetPair[1];
        if (!this.CanUseMagic(target, false, false)) {
            return;
        }
        let pairTgt: Character | undefined;
        if (this.SpellNeedsPair(foundSpell)) {
            pairTgt = this.PairedCharacterOptions(target)[getRandomInt(this.PairedCharacterOptions(target).length)];
        }
        this.CastSpellActual(foundSpell, target, true, pairTgt);
    }

    /** Finds `phrase` followed by one of `names`. Word edges and the space between are required only where the characters either side
     *  are in a script that uses spaces (\b can't tell, e.g. for accents or Chinese); unspaced scripts have neither (#877). */
    private findCastingMatch(text: string, phrase: string, names: string[]): RegExpExecArray | null {
        const unspaced = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;
        const isWord = (c: string | undefined) => !!c && /[\p{L}\p{N}_]/u.test(c) && !unspaced.test(c);
        const re = new RegExp(`${escapeRegExp(phrase)}(\\s*)(${names.map(escapeRegExp).join("|")})`, "gi");
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
            const phraseLength = m[0].length - m[1].length - m[2].length;
            const edgeOk = !isWord(phrase[0]) || !isWord(text[m.index - 1]);
            const separated = m[1].length > 0 || !isWord(m[0][phraseLength - 1]) || !isWord(m[2][0]);
            if (edgeOk && separated) return m;
            re.lastIndex = m.index + 1;
        }
        return null;
    }

    getSpellTargetTupleFromMsg(msg: string): [SpellDefinition | null, Character | null] | undefined {
        const oocParsedString = excludeParentheticalContent(msg); // Don't allow voice casting in OOC chat   
        const characterNames = ChatRoomCharacter.map(c => [c.Name, c.Nickname, c.Nickname?.normalize("NFKC"), c.MemberNumber + ""]).reduce((a, b) => a.concat(b)).filter(c => !!c);
        for (const s of this.AvailableSpells.filter(s => s.AllowVoiceCast)) { // Only look at spells which allow voice cast
            if (!s.AllowVoiceCast)
                continue;
            const searchPhrase = (!!s.CastingPhrase && s.CastingPhrase.length > 0) ? s.CastingPhrase : s.Name;
            const matches = this.findCastingMatch(oocParsedString, searchPhrase, characterNames as string[]);
            if (!matches)
                continue;
            const characterPhrase = matches[2] ?? "";
            const character = getCharacterByNicknameOrMemberNumber(characterPhrase);
            if (character)
                return [structuredClone(s), character]; // UnpackSpellCodes mutates; keep stored spells key-only (#680)
        }
        return undefined;
    }

    // ***************** Potions *******************
    /**
     * @param consented The drinker already accepted (or lost a force contest over) this potion,
     * so it's swallowed without another resist roll or swallow message.
     */
    HandleQuaff(sender: Character, consented: boolean = false) {
        const item = InventoryGet(sender, "ItemHandheld");
        const spell = this.GetSpellFromItem(item, sender, consented);
        if (!!spell && !!item)
            this.HandleQuaffWithSpell(sender, getModule<ItemUseModule>("ItemUseModule")?.getItemName(item), spell, consented);
    }

    HandleQuaffWithSpell(sender: Character | null, itemName: string, spell: SpellDefinition | undefined, consented: boolean = false) {
        if (!!spell && !!itemName && !!sender) {
            if (consented)
                return this.ProcessPotion(sender, spell);
            const gagType = getModule<InjectorModule>("InjectorModule")?.GetGagDrinkAccess(Player);
            if (!this.SpellIsBeneficial(spell) && gagType == "nothing" && sender.MemberNumber != Player.MemberNumber) {
                this.TryForcePotion(sender, itemName, spell);
            } else {
                if (sender.IsPlayer())
                    SendAction(`%NAME% swallows %POSSESSIVE% ${itemName}.`, sender);
                else
                    SendAction(`%NAME% swallows %OPP_NAME%'s ${itemName}.`, sender);
                this.ProcessPotion(sender, spell);
            }
        }
    }

    TryForcePotion(sender: Character, itemName: string, spell: SpellDefinition) {
        const itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            return this.ProcessPotion(sender, spell);
        }
        const check = itemUseModule?.MakeActivityCheck(sender, Player);
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
        const itemCraft = item?.Craft;
        const itemStr = GetItemNameAndDescriptionConcat(item) ?? "";
        if (!item || !itemCraft || !itemStr)
            return;

        const itemName = getModule<ItemUseModule>("ItemUseModule")?.getItemName(item);
        let spells: SpellDefinition[];
        const craftingMember = itemCraft.MemberNumber;
        if (!!craftingMember && craftingMember >= 0) {
            const craftingChar = getCharacter(craftingMember) as OtherCharacter;
            if (!!craftingChar && craftingChar.IsPlayer()) {
                spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !spellHasPairedEffect(s));
                let foundSpell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
                if (foundSpell) foundSpell = structuredClone(foundSpell); // UnpackSpellCodes mutates (#680)
                this.UnpackSpellCodes(foundSpell);
                return foundSpell;
            } else {
                const reqId = Date.now();
                this.itemSpellRequests.set(reqId, consented);
                sendLSCGCommandBeep(craftingMember, "get-spell", [{
                    name: "itemStr",
                    value: itemStr,
                }, {
                    name: "id",
                    value: reqId,
                }, {
                    name: "originator",
                    value: itemUser?.MemberNumber ?? Player.MemberNumber,
                }, {
                    name: "itemName",
                    value: itemName,
                }]);
            }
        }
        return undefined;
    }

    HandleItemSpellRequest(senderNum: number, request: LSCGMessageModel) {
        const itemStr = request.command?.args.find(a => a.name == "itemStr")?.value as string;
        const reqId = request.command?.args.find(a => a.name == "id")?.value as number;

        if (!itemStr || !reqId)
            return;

        const spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !spellHasPairedEffect(s));
        let spell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
        if (spell)
            spell = structuredClone(spell);
            this.UnpackSpellCodes(spell);
            sendLSCGCommandBeep(senderNum, "get-spell-response", [{
                name: "spell",
                value: spell,
            }, {
                name: "id",
                value: reqId,
            }, {
                name: "originator",
                value: request.command?.args.find(a => a.name == "originator")?.value as number,
            }, {
                name: "itemName",
                value: request.command?.args.find(a => a.name == "itemName")?.value as Item,
            }]);
    }

    IncomingGetItemSpellResponse(senderNum: number, response: LSCGMessageModel) {
        const reqId = response.command?.args.find(a => a.name == "id")?.value as number;
        const spell = response.command?.args.find(a => a.name == "spell")?.value as SpellDefinition;
        const itemName = response.command?.args.find(a => a.name == "itemName")?.value as string;
        const originator = response.command?.args.find(a => a.name == "originator")?.value as number;
        const sender = getCharacter(originator);

        if (this.itemSpellRequests.has(reqId)) {
            const consented = this.itemSpellRequests.get(reqId);
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
