import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GetConfiguredItemBundlesFromSavedCode, GetDelimitedList, GetHandheldItemNameAndDescriptionConcat, GetItemNameAndDescriptionConcat, GetMetadata, ICONS, LSCG_SendLocal, LSCG_TEAL, OnActivity, SendAction, getCharacter, getRandomInt, hookFunction, isPhraseInString, removeAllHooksByModule, sendLSCGCommand, sendLSCGCommandBeep, settingsSave } from "../utils";
import { ActivityModule, ActivityTarget } from "./activities";
import { KNOWN_SPELLS_LIMIT, LSCGSpellEffect, MagicSettingsModel, OutfitConfig, OutfitOption, SpellDefinition } from "Settings/Models/magic";
import { GuiMagic, pairedSpellEffects } from "Settings/magic";
import { StateModule } from "./states";
import { ItemUseModule, MagicWandItems } from "./item-use";
import { InjectorModule } from "./injector";
import { BaseState } from "./States/BaseState";
import { RedressedState } from "./States/RedressedState";
import { PolymorphedState } from "./States/PolymorphedState";

const dialogButtonInfo = [980, 10, 100, 40, 5];
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
            requireWhitelist: false
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
                    Effects: Array(getRandomInt(3) + 1).fill(0).map(t => Object.values(LSCGSpellEffect)[getRandomInt(Object.keys(LSCGSpellEffect).length)])
                });
        return this._testSpells;
    }

    get RandomSpell(): SpellDefinition {
        let spell = <SpellDefinition>{
            Name: `wild magic`,
            Effects: Array(getRandomInt(3) + 1).fill(0).map((t, ix, arr) => Object.values(LSCGSpellEffect).filter(v => arr.indexOf(v) == -1)[getRandomInt(Object.keys(LSCGSpellEffect).length)])
        }
        if (spell.Effects.indexOf(LSCGSpellEffect.outfit)) {
            let mbsOutfits = (<any>Player).MBSSettings?.FortuneWheelItemSets.filter((s: any) => !!s).map((s: { itemList: any; }) => s.itemList as ItemBundle[]) as ItemBundle[][];
            let outfitIx = getRandomInt(mbsOutfits?.length);
            let outfit = !mbsOutfits ? undefined : mbsOutfits[outfitIx];
            let wardrobeOutfit = !Player.Wardrobe ? undefined : Player.Wardrobe[getRandomInt(Player.Wardrobe?.length)];
            if (!outfit || !!wardrobeOutfit && getRandomInt(2) == 0)
                outfit = wardrobeOutfit;

            spell.Outfit = <OutfitConfig>{
                Option: OutfitOption.both,
                Code: LZString.compressToBase64(JSON.stringify(outfit))
            }
        }        
        return spell;
    }

    get AvailableSpells(): SpellDefinition[] {
        return this.settings.knownSpells ?? [];//this.TestSpells;
    }

    get noDefenseMemberIds(): number[] {
		return GetDelimitedList(this.settings.noDefenseMemberIds).map(id => +id).filter(id => id > 0) ?? [];
	}

    PairedCharacterOptions(spellTarget: Character | undefined): Character[] {
        return ChatRoomCharacter.filter(c => !!c && !!(c as any).LSCG && !!(c as any).LSCG.MagicModule && (c as any).LSCG.MagicModule.enabled && c.MemberNumber != spellTarget?.MemberNumber);
    }

    drinkActivityNames: string[] = [
        "LSCG_Quaff",
        "LSCG_Eat",
        "SipItem",
        "LSCG_FunnelPour"
    ]

    load(): void {
        let activities = getModule<ActivityModule>("ActivityModule");

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
            return next(args) || CurrentScreen == "LSCG_SPELLS_DIALOG";
        }, ModuleCategory.Magic);

        hookFunction("DialogLeave", 1, (args, next) => {
            this.CloseSpellMenu();
            return next(args);
        }, ModuleCategory.Magic)

        OnActivity(1, ModuleCategory.Magic, (data, sender, msg, megadata) => {
            if (!this.Enabled)
                return;
            let meta = GetMetadata(data);
            var activityName = meta?.ActivityName;
            var target = meta?.TargetMemberNumber;
            if (target == Player.MemberNumber && 
                this.drinkActivityNames.indexOf(activityName ?? "") > -1 && 
                !!sender) {
                this.HandleQuaff(sender);
            }
        });

        activities?.AddActivity({
            Activity: <Activity>{
                Name: "Quaff",
                MaxProgress: 90,
                MaxProgressSelf: 90,
                Prerequisite: ["UseHands", "Needs-QuaffableItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemMouth",
					TargetLabel: "Quaff",
                    SelfAllowed: true,
                    TargetSelfAction: "SourceCharacter quaffs the ActivityAsset in one gulp.",
                    TargetAction: "SourceCharacter presses PronounPossessive ActivityAsset up against TargetCharacter's lips."
                }
            ],
            CustomImage: "Icons/Magic.png"
        });
    }

    run(): void {

    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Magic);
    }

    CanUseMagic(target: Character) {
        let item = InventoryGet(Player, "ItemHandheld");
        let isWieldingMagicItem = !!item && MagicWandItems.indexOf(item.Asset.Name) > -1;
        let hasItemPermission = ServerChatRoomGetAllowItem(Player, target);
        let targetHasMagicEnabled = (target as OtherCharacter).LSCG?.MagicModule?.enabled;
        let whitelisted = !(target as OtherCharacter).LSCG?.MagicModule?.requireWhitelist || (!!Player.MemberNumber && target.WhiteList.indexOf(Player.MemberNumber) > -1) || target.IsPlayer();
        return this.Enabled &&
                targetHasMagicEnabled &&
                isWieldingMagicItem &&
                hasItemPermission &&
                Player.CanInteract() &&
                whitelisted &&
                (this.CanCastSpell(CurrentCharacter as OtherCharacter) || 
                this.CanWildMagic(CurrentCharacter as OtherCharacter) || 
                this.CanTeachSpell(CurrentCharacter as OtherCharacter))
    }

    CanCastSpell(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        return this.Enabled && this.AvailableSpells.length > 0 && !!(<any>target).LSCG && !this.settings.forceWildMagic;
    }

    CanWildMagic(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        return this.Enabled && !!(<any>target).LSCG && this.settings.enableWildMagic;    
    }

    CanTeachSpell(target: Character): boolean {
        // Must have available spells and can only cast on LSCG users
        let targetItem = InventoryGet(target, "ItemHandheld");
        return this.Enabled && 
            !target.IsPlayer() &&
            this.AvailableSpells.length > 0 &&
            MagicWandItems.indexOf(targetItem?.Asset?.Name ?? "") > -1;
    }

    PrevScreen: string | undefined = undefined;
    OpenSpellMenu(C: OtherCharacter | PlayerCharacter) {
        if (this.Enabled) {
            this.SpellMenuOpen = true;
            this.PrevScreen = CurrentScreen;
            CurrentScreen = "LSCG_SPELLS_DIALOG";
        }
    }

    CloseSpellMenu() {
        this.SpellMenuOpen = false;
        this.TeachingSpell = false;
        this.SpellPairOption.SelectOpen = false;
        if (CurrentScreen == "LSCG_SPELLS_DIALOG")
            CurrentScreen = this.PrevScreen ?? "ChatRoom";
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
        let blockedSpellEffects = (CurrentCharacter as any).LSCG?.MagicModule?.blockedSpellEffects ?? [];

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
                if (spell.Effects.some(effect => pairedSpellEffects.indexOf(effect) > -1))
                    icons.push("Handheld");
                if (spell.Effects.some(effect => blockedSpellEffects.indexOf(effect) > -1)) {
                    icons.push("AllowedLimited");
                    background = "orange";
                }

                let desc = spell.Effects.length == 0 ? "None" : spell.Effects.join(", ");

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
        let blockedSpellTypes = (CurrentCharacter as any).LSCG?.MagicModule?.blockedSpellTypes ?? [];

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
                        this.CastSpellActual(this.SpellPairOption.Spell, this.SpellPairOption.Source, char);
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
                let blocked = spell.Effects.some(effect => blockedSpellTypes.indexOf(effect) > -1);
                spell = JSON.parse(JSON.stringify(spell));
                this.UnpackSpellCodes(spell);
                
                if (!blocked) {
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
        spell = JSON.parse(JSON.stringify(spell));
        this.UnpackSpellCodes(spell);
        if (this.SpellNeedsPair(spell))
            paired = this.PairedCharacterOptions(C)[getRandomInt(this.PairedCharacterOptions(C).length)];
        this.CastSpellActual(spell, C, paired);
    }

    SpellNeedsPair(spell: SpellDefinition): boolean {
        return spell.Effects.some(e => pairedSpellEffects.indexOf(e) > -1);
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
                this.CastSpellActual(spell, C);
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

    getCastingActionString(spell: SpellDefinition, item: Item | null, target: Character, paired?: Character): string {
        let itemName = !!item ? (item?.Craft?.Name ?? item?.Asset.Description) : "wand";
        let pairedDefaultStr = `${!!paired ? ", the spell's power also arcing to " + CharacterNickname(paired) + "." : "."}`;
        let castingActionStrings: string[] = [
            `%NAME% waves %POSSESSIVE% ${itemName} in an intricate pattern and casts ${spell.Name} on %OPP_NAME%${pairedDefaultStr}`,
            `%NAME% chants an indecipherable phrase, pointing %POSSESSIVE% ${itemName} at %OPP_NAME% and casting ${spell.Name}${pairedDefaultStr}`,
            `%NAME% aims %POSSESSIVE% ${itemName} at %OPP_NAME% and, with a grin, casts ${spell.Name}${pairedDefaultStr}`
        ];
        return castingActionStrings[getRandomInt(castingActionStrings.length)];
    }

    CastSpellActual(spell: SpellDefinition | undefined, spellTarget: Character, pairedTarget?: Character) {
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
            else if (!(spellTarget as any).LSCG?.MagicModule || !(spellTarget as any).LSCG?.MagicModule.enabled) {
                SendAction(`%NAME% casts ${spell.Name} at %OPP_NAME% but it seems to fizzle.`, spellTarget);
                this.CloseSpellMenu();
                DialogLeave();
                return;
            }
            else {
                SendAction(this.getCastingActionString(spell, InventoryGet(Player, "ItemHandheld"), spellTarget, pairedTarget), spellTarget);
            }

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
        let beneficialEffects: LSCGSpellEffect[] = [
            LSCGSpellEffect.dispell,
            LSCGSpellEffect.bless
        ];
        return  spell.Effects.every(e => beneficialEffects.indexOf(e) > -1);
    }

    IncomingSpellCommand(sender: Character | null, msg: LSCGMessageModel) {
        if (!this.Enabled || !sender || this.WhitelistBlocked(sender)) {
            SendAction(`${!sender ? "Someone" : CharacterNickname(sender)}'s spell fizzles.`);
            return;
        }
        setTimeout(() => {
            if (msg.command?.name == "spell") {
                let paired = getCharacter((msg.command?.args.find(arg => arg.name == "paired")?.value as number));
                let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
                if (!spell || !sender)
                    return;
                let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
                if (!this.SpellIsBeneficial(spell) && this.DefendAgainst(sender.MemberNumber ?? -1)) {
                    if (check.AttackerRoll.Total < check.DefenderRoll.Total) {
                        SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully saves against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}${spell.Name}.`);
                        return;
                    }
                }
                this.IncomingSpell(sender, spell, paired, Math.max(1, check.AttackerRoll.Total - check.DefenderRoll.Total));
            }
            else if (msg.command?.name == "pair") {
                let origin = getCharacter(msg.command?.args.find(arg => arg.name == "paired")?.value as number);
                let spellEffect = msg.command?.args?.find(arg => arg.name == "spell-effect")?.value as LSCGSpellEffect;
                let pairType = msg.command?.args?.find(arg => arg.name == "pair-type")?.value as LSCGState;
                if (!!origin && !!spellEffect && !!pairType)
                    this.IncomingSpellPair(sender, spellEffect, origin, pairType);
                else if (!!sender && !origin) {
                    SendAction(`${CharacterNickname(sender)}'s paired spell fizzles because the origin target has left.`);
                }
            }
        }, 1000); // Slight delay on responding to spell commands, builds anticipation.
    }

    IncomingSpell(sender: Character | null, spell: SpellDefinition, paired?: Character | null, saveDiff: number = 1) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let pairedName = !paired ? "someone else" : CharacterNickname(paired);
        let allowedSpellEffects = spell.Effects.filter(effect => this.settings.blockedSpellEffects.indexOf(effect) == -1);
        if (allowedSpellEffects.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }
        let duration: number | undefined = undefined;
        
        if (!this.SpellIsBeneficial(spell)) {
            duration = saveDiff * 5 * (60 * 1000) // 5 minutes for every level of "spell power" (difference between caster and defender checks)
            if (!this.settings.limitedDuration && !spell.Effects.some(e => e == LSCGSpellEffect.bane))
                duration = 0;
            else if (this.settings.maxDuration > 0) {
                duration = Math.min(duration, this.settings.maxDuration * (60 * 1000));
                LSCG_SendLocal(`${sender?.IsPlayer() ? 'Your' : senderName + "'s"} ${spell.Name} spell will last ${duration / (60 * 1000)} minutes.`);
            }
        }            

        allowedSpellEffects.forEach((effect, ix, arr) => {
            setTimeout(() => {
                let state: BaseState | undefined;
                switch (effect) {
                    case LSCGSpellEffect.blindness:
                        SendAction("%NAME%'s eyes dart around, %POSSESSIVE% world suddenly plunged into darkness.");
                        state = this.stateModule.BlindState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.deafened:
                        SendAction("%NAME% frowns as %PRONOUN% is completely deafened.");
                        state = this.stateModule.DeafState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.frozen:
                        SendAction("%NAME%'s eyes widen in a panic as %POSSESSIVE% muscles seize in place.");
                        state = this.stateModule.FrozenState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.horny:
                        this.stateModule.GaggedState.Active ? SendAction("A blush runs into %NAME%'s cheeks uncontrollably.") : SendAction("A moan escapes %NAME%'s lips uncontrollably.");
                        state = this.stateModule.HornyState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.hypnotizing:
                        SendAction("%NAME% is unable to fight the spell's hypnotizing influence, slumping weakly as %POSSESSIVE% eyes go blank.");
                        state = this.stateModule.HypnoState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.muted:
                        Player.IsGagged() ? SendAction("%NAME%'s protests suddenly fall completely silent.") : SendAction("%NAME%'s mouth moves in protest but not a single sound escapes.");
                        state = this.stateModule.GaggedState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.slumber:
                        SendAction("%NAME% succumbs to the spell's overwhelming pressure, %POSSESSIVE% eyes closing as %PRONOUN% falls unconscious.");
                        state = this.stateModule.SleepState.Activate(sender?.MemberNumber, duration);
                        break;
                    case LSCGSpellEffect.enlarge:
                        state = this.stateModule.ResizedState.Enlarge(sender?.MemberNumber, duration, true);
                        break;
                    // case LSCGSpellEffect.reduce:
                    //     state = this.stateModule.ResizedState.Reduce(sender?.MemberNumber, duration, true);
                    //     break;
                    case LSCGSpellEffect.dispell:
                        SendAction("%NAME% gasps, blinking as the magic affecting %INTENSIVE% is removed.");
                        this.stateModule.Clear(false);
                        break;
                    case LSCGSpellEffect.bless:
                        state = this.stateModule.BuffedState.Bless(sender?.MemberNumber, true, duration);
                        break;
                    case LSCGSpellEffect.bane:
                        state = this.stateModule.BuffedState.Bane(sender?.MemberNumber, true, duration);
                        break;
                    case LSCGSpellEffect.outfit:
                        if (!!spell.Outfit?.Code) {
                            this.stateModule.GaggedState.Active ? 
                                SendAction("%NAME% trembles as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.") : 
                                SendAction("%NAME% squeaks as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.");
                            state = this.stateModule.RedressedState.Apply(spell, sender?.MemberNumber, duration);
                        }
                        break;
                    case LSCGSpellEffect.polymorph:
                        if (!!spell.Polymorph?.Code) {
                            this.stateModule.GaggedState.Active ? 
                                SendAction("%NAME% trembles as %POSSESSIVE% body shimmers and morphs.") : 
                                SendAction("%NAME% squeaks as %POSSESSIVE% body shimmers and morphs.");
                            state = this.stateModule.PolymorphedState.Apply(spell, sender?.MemberNumber, duration);
                        }
                        break;
                    case LSCGSpellEffect.paired_arousal:
                        if (!!paired && !!sender) {
                            SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                            state = this.stateModule.ArousalPairedState.DoPair(paired, sender, duration);
                            this.NotifyPair(sender, paired, LSCGSpellEffect.paired_arousal, this.stateModule.ArousalPairedState.Type);
                        }
                        break;
                    case LSCGSpellEffect.orgasm_siphon:
                        if (!!paired && !!sender) {
                            this.stateModule.GaggedState.Active ? 
                                SendAction(`%NAME% quivers as %PRONOUN% feels %POSSESSIVE% impending denial.`) :
                                SendAction(`%NAME% whimpers as %PRONOUN% feels %POSSESSIVE% impending denial.`);
                            state = this.stateModule.OrgasmSiphonedState.DoPair(paired, sender, duration);
                            this.NotifyPair(sender, paired, LSCGSpellEffect.orgasm_siphon, this.stateModule.OrgasmSiphonedState.Type);
                        }
                        break;
                }
            }, 2000 * ix);
        });
    }

    NotifyPair(caster: Character | null, pairedTarget: Character | undefined, spellEffect: LSCGSpellEffect, pairType: LSCGState) {
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

    IncomingSpellPair(sender: Character | null, spellEffect: LSCGSpellEffect, originalTarget: Character, pairType: LSCGState) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let originalTargetName = CharacterNickname(originalTarget);
        let isAllowed = this.settings.blockedSpellEffects.indexOf(spellEffect) == -1;

        if (!isAllowed) {
            SendAction(`${senderName}'s paired spell fizzles as it attempts to pair with %NAME%.`);
            sendLSCGCommandBeep(originalTarget.MemberNumber ?? -1, "unpair", [{
                name: "type",
                value: pairType
            }]);
        } else {
            switch (spellEffect) {
                case LSCGSpellEffect.paired_arousal:
                    // TODO
                    SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                    this.stateModule.ArousalPairedState.RespondToPairing(originalTarget, sender);
                    break;
                case LSCGSpellEffect.orgasm_siphon:
                    // TODO
                    SendAction(`%NAME% lets out a quiet gasp as the pleasure center of %POSSESSIVE% mind starts to tingle.`);
                    this.stateModule.OrgasmSiphonedState.RespondToPairing(originalTarget, sender);
                    break;
            }
        }
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
            this.settings.knownSpells.push(spell);
            settingsSave(true);
        }
    }

    // ***************** Potions *******************
    HandleQuaff(sender: Character) {
        let item = InventoryGet(sender, "ItemHandheld");
        let spell = this.GetSpellFromItem(item, sender);
        if (!!spell && !!item)
            this.HandleQuaffWithSpell(sender, getModule<ItemUseModule>("ItemUseModule")?.getItemName(item), spell);
    }

    HandleQuaffWithSpell(sender: Character | null, itemName: string, spell: SpellDefinition | undefined) {
        if (!!spell && !!itemName && !!sender) {
            let gagType = getModule<InjectorModule>("InjectorModule")?.GetGagDrinkAccess(Player);
            if (!this.SpellIsBeneficial(spell) && gagType == "nothing" && sender.MemberNumber != Player.MemberNumber) {
                this.TryForcePotion(sender, itemName, spell);
            } else {
                SendAction(`%NAME% gulps down %OPP_NAME%'s ${itemName}.`, sender)
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
            SendAction(`%NAME% ${check.DefenderRoll.TotalStr}successfully defends against %OPP_NAME%'s ${check.AttackerRoll.TotalStr}attempt to force %INTENSIVE% to drink %OPP_POSSESSIVE% ${itemName}.`, sender);
        }
    }

    ProcessPotion(sender: Character, spell: SpellDefinition) {
        setTimeout(() => {
            if (!!spell && this.Enabled)
                this.IncomingSpell(sender, spell)
        }, 1000);
    }

    itemSpellRequests: number[] = [];

    GetSpellFromItem(item: Item | null, itemUser: Character): SpellDefinition | undefined {
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
                spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !s.Effects.some(e => pairedSpellEffects.indexOf(e) > -1));
                return spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
            } else {
                let reqId = Date.now();
                this.itemSpellRequests.push(reqId);
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

        let spells = Player.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !s.Effects.some(e => pairedSpellEffects.indexOf(e) > -1));
        let spell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
        if (!!spell)
            spell = JSON.parse(JSON.stringify(spell));
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

        if (this.itemSpellRequests.indexOf(reqId) > -1) {
            this.itemSpellRequests.splice(this.itemSpellRequests.indexOf(reqId));
            setTimeout(() => {
                this.HandleQuaffWithSpell(sender, itemName, spell);
            }, 1000);
        }
    }

    UnpackSpellCodes(spell: SpellDefinition | undefined) {
        if (!spell)
            return;
        // Unpack specified outfit codes for sending.
        if (!!spell.Outfit && !!spell.Outfit.Code) {
            spell.Outfit.Code = LZString.compressToBase64(JSON.stringify(GetConfiguredItemBundlesFromSavedCode(spell.Outfit.Code, item => RedressedState.ItemIsAllowed(item))));
        } 
        if (!!spell.Polymorph && spell.Polymorph.Code) {
            spell.Polymorph.Code = LZString.compressToBase64(JSON.stringify(GetConfiguredItemBundlesFromSavedCode(spell.Polymorph.Code, item => PolymorphedState.ItemIsAllowed(item))));
        }
    }
}
