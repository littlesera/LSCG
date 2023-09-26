import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { GetHandheldItemNameAndDescriptionConcat, GetItemNameAndDescriptionConcat, GetMetadata, ICONS, LSCG_SendLocal, OnActivity, SendAction, getCharacter, getRandomInt, hookFunction, isPhraseInString, removeAllHooksByModule, sendLSCGCommand, sendLSCGCommandBeep, settingsSave } from "../utils";
import { ActivityModule, ActivityTarget } from "./activities";
import { LSCGSpellEffect, MagicSettingsModel, OutfitConfig, OutfitOption, SpellDefinition } from "Settings/Models/magic";
import { GuiMagic, pairedSpellEffects } from "Settings/magic";
import { StateModule } from "./states";
import { ItemUseModule, MagicWandItems } from "./item-use";
import { InjectorModule } from "./injector";

export class MagicModule extends BaseModule {
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
            remoteMemberIds: ""
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

    PairedCharacterOptions(spellTarget: Character | undefined): Character[] {
        return ChatRoomCharacter.filter(c => !!c && !!(c as any).LSCG && !!(c as any).LSCG.MagicModule && c.MemberNumber != spellTarget?.MemberNumber);
    }

    drinkActivityNames: string[] = [
        "LSCG_Quaff",
        "SipItem"
    ]

    load(): void {
        let activities = getModule<ActivityModule>("ActivityModule");

        hookFunction("DialogDraw", 10, (args, next) => {
            if (this.Enabled && this.SpellMenuOpen) 
                return this.DrawSpellMenu();

            return next(args)
        }, ModuleCategory.Magic);

        hookFunction("DialogClick", 10, (args, next) => {
            if (this.Enabled && this.SpellMenuOpen)
                return this.ClickSpellMenu();

            return next(args);
        }, ModuleCategory.Magic);

        hookFunction("ServerPlayerIsInChatRoom", 10, (args, next) => {
            return next(args) || CurrentScreen == "LSCG_SPELLS_DIALOG";
        }, ModuleCategory.Magic);

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
                Name: "CastSpell",
                MaxProgress: 90,
                MaxProgressSelf: 90,
                Prerequisite: ["UseHands", "Needs-MagicItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
					TargetLabel: "Cast Spell",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter casts a spell on TargetCharacter with PronounPossessive ActivityAsset.",
                    TargetSelfAction: "SourceCharacter casts a spell on themselves with PronounPossessive ActivityAsset."
                }
            ],
            CustomPrereqs: [
				{
					Name: "CanCastSpell",
					Func: (acting, acted, group) => {
                        // Must have available spells and can only cast on LSCG users
						return this.Enabled && this.AvailableSpells.length > 0 && !!(<any>acted).LSCG && !this.settings.forceWildMagic;
					}
				}
			],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.OpenSpellMenu(target?.IsPlayer() ? target as PlayerCharacter : target as OtherCharacter);
                }
            }
        });

        activities?.AddActivity({
            Activity: <Activity>{
                Name: "CastWildMagic",
                MaxProgress: 90,
                MaxProgressSelf: 90,
                Prerequisite: ["UseHands", "Needs-MagicItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
					TargetLabel: "Cast Wild Magic",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter casts a wild spell on TargetCharacter with PronounPossessive ActivityAsset.",
                    TargetSelfAction: "SourceCharacter casts a wild spell on themselves with PronounPossessive ActivityAsset."
                }
            ],
            CustomPrereqs: [
				{
					Name: "CanCastWildMagic",
					Func: (acting, acted, group) => {
                        // Must have available spells and can only cast on LSCG users
						return this.Enabled && !!(<any>acted).LSCG && this.settings.enableWildMagic;
					}
				}
			],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.CastWildMagic(target?.IsPlayer() ? target as PlayerCharacter : target as OtherCharacter);
                }
            }
        });

        activities?.AddActivity({
            Activity: <Activity>{
                Name: "TeachSpell",
                MaxProgress: 90,
                MaxProgressSelf: 90,
                Prerequisite: ["UseHands", "Needs-MagicItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
					TargetLabel: "Teach Spell",
                    SelfAllowed: false,
                    TargetAction: "SourceCharacter carefully instructs TargetCharacter in the intricate movements required for a new spell."
                }
            ],
            CustomPrereqs: [
				{
					Name: "CanTeachSpell",
					Func: (acting, acted, group) => {
                        // Must have available spells and can only cast on LSCG users
                        let targetItem = InventoryGet(acted, "ItemHandheld");
						return this.Enabled && 
                            this.settings.knownSpells.length > 0 &&
                            MagicWandItems.indexOf(targetItem?.Asset?.Name ?? "") > -1;
					}
				}
			],
            CustomAction: {
                Func: (target, args, next) => {
                    if (!!target)
                        this.TeachSpell(target as OtherCharacter);
                }
            },
            CustomImage: "Icons/Magic.png"
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
                    TargetAction: "SourceCharacter quaffs the ActivityAsset in one gulp."
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
                    DrawRect(this.boxDimensions.x + (this.boxDimensions.width - 500 - 350), this.boxDimensions.y + this.boxDimensions.height - 56, 700, 50, "#00d5d5");
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
        let spellIndex = getRandomInt(this.settings.knownSpells.length + 1);
        let spell = this.settings.knownSpells[spellIndex];
        if (!spell || this.settings.trueWildMagic)
            spell = this.RandomSpell
        let paired: Character | undefined = undefined;
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
                }
            }
            else if (!(spellTarget as any).LSCG?.MagicModule) {
                SendAction(`%NAME% casts ${spell.Name} at %OPP_NAME% but it seems to fizzle.`, spellTarget);
                return;
            }
            else {
                SendAction(this.getCastingActionString(spell, InventoryGet(Player, "ItemHandheld"), spellTarget, pairedTarget), spellTarget);
            }

            if (spellTarget.IsPlayer())
                this.IncomingSpell(Player, spell, pairedTarget);
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

    IncomingSpellCommand(sender: Character | null, msg: LSCGMessageModel) {
        if (msg.command?.name == "spell") {
            let paired = getCharacter((msg.command?.args.find(arg => arg.name == "paired")?.value as number));
            let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
            if (!spell)
                return;
            this.IncomingSpell(sender, spell, paired);
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
    }

    IncomingSpell(sender: Character | null, spell: SpellDefinition, paired?: Character | null) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let pairedName = !paired ? "someone else" : CharacterNickname(paired);
        let allowedSpellEffects = spell.Effects.filter(effect => this.settings.blockedSpellEffects.indexOf(effect) == -1);
        if (allowedSpellEffects.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }

        allowedSpellEffects.forEach((effect, ix, arr) => {
            setTimeout(() => {
                switch (effect) {
                    case LSCGSpellEffect.blindness:
                        SendAction("%NAME%'s eyes dart around, %POSSESSIVE% world suddenly plunged into darkness.");
                        this.stateModule.BlindState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.deafened:
                        SendAction("%NAME% frowns as %PRONOUN% is completely deafened.");
                        this.stateModule.DeafState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.frozen:
                        SendAction("%NAME%'s eyes widen in a panic as %POSSESSIVE% muscles seize in place.");
                        this.stateModule.FrozenState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.horny:
                        this.stateModule.GaggedState.Active ? SendAction("A blush runs into %NAME%'s cheeks uncontrollably.") : SendAction("A moan escapes %NAME%'s lips uncontrollably.");
                        this.stateModule.HornyState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.hypnotizing:
                        SendAction("%NAME% is unable to fight the spell's hypnotizing influence, slumping weakly as %POSSESSIVE% eyes go blank.");
                        this.stateModule.HypnoState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.muted:
                        Player.IsGagged() ? SendAction("%NAME%'s protests suddenly fall completely silent.") : SendAction("%NAME%'s mouth moves in protest but not a single sound escapes.");
                        this.stateModule.GaggedState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.slumber:
                        SendAction("%NAME% succumbs to the spell's overwhelming pressure, %POSSESSIVE% eyes closing as %PRONOUN% falls unconscious.");
                        this.stateModule.SleepState.Activate(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.enlarge:
                        SendAction(`%NAME% winces as %POSSESSIVE% body reshapes and grows to twice its size.`);
                        this.stateModule.ResizedState.Enlarge(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.reduce:
                        SendAction(`%NAME% squeaks as %POSSESSIVE% body reshapes and shrinks to half its size.`);
                        this.stateModule.ResizedState.Reduce(sender?.MemberNumber);
                        break;
                    case LSCGSpellEffect.dispell:
                        SendAction("%NAME% gasps, blinking as the magic affecting %INTENSIVE% is removed.");
                        this.stateModule.Clear(true);
                        break;
                    case LSCGSpellEffect.outfit:
                        if (!!spell.Outfit?.Code) {
                            this.stateModule.GaggedState.Active ? 
                                SendAction("%NAME% trembles as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.") : 
                                SendAction("%NAME% squeaks as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.");
                            this.stateModule.RedressedState.ApplyOutfit(spell.Outfit)
                        }
                        break;
                    case LSCGSpellEffect.paired_arousal:
                        if (!!paired && !!sender) {
                            SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                            this.stateModule.ArousalPairedState.DoPair(paired, sender);
                            this.NotifyPair(sender, paired, LSCGSpellEffect.paired_arousal, this.stateModule.ArousalPairedState.Type);
                        }
                        break;
                    case LSCGSpellEffect.orgasm_siphon:
                        if (!!paired && !!sender) {
                            this.stateModule.GaggedState.Active ? 
                                SendAction(`%NAME% quivers as %PRONOUN% feels %POSSESSIVE% impending denial.`) :
                                SendAction(`%NAME% whimpers as %PRONOUN% feels %POSSESSIVE% impending denial.`);
                            this.stateModule.OrgasmSiphonedState.DoPair(paired, sender);
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

    IncomingSpellTeachCommand(sender: Character | null, msg: LSCGMessageModel) {
        let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
        if (this.settings.knownSpells.find(s => s.Name == spell.Name)) {
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
        let spell = this.GetSpellFromItem(item);
        if (!!spell) {
            let gagType = getModule<InjectorModule>("InjectorModule")?.GetGagDrinkAccess(Player);
            if (gagType == "nothing" && sender.MemberNumber != Player.MemberNumber) {
                this.TryForcePotion(sender);
            } else {
                this.ProcessPotion(sender);
            }
        }
    }

    TryForcePotion(sender: Character) {
        let itemUseModule = getModule<ItemUseModule>("ItemUseModule");
        if (!itemUseModule) {
            return this.ProcessPotion(sender);
        }
        var itemName = itemUseModule.getItemName(InventoryGet(sender, "ItemHandheld")!);
        let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(sender, Player);
        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
            SendAction(`${CharacterNickname(sender)} ${check.AttackerRoll.TotalStr}manages to get their ${itemName} past ${CharacterNickname(Player)}'s ${check.DefenderRoll.TotalStr}lips, forcing %INTENSIVE% to swallow it.`);
            setTimeout(() => this.ProcessPotion(sender), 5000);
        } else {
            SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully defends against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}attempt to force %INTENSIVE% to drink their ${itemName}.`);
        }
    }

    ProcessPotion(sender: Character) {
        var item = InventoryGet(sender, "ItemHandheld");
        let spell = this.GetSpellFromItem(item);
        if (!!spell)
            this.IncomingSpell(sender, spell);
    }

    GetSpellFromItem(item: Item | null): SpellDefinition | undefined {
        let itemCraft = item?.Craft;
        var itemStr = GetItemNameAndDescriptionConcat(item) ?? "";
        if (!itemCraft || !itemStr)
            return;

        let spells: SpellDefinition[] = []
        let craftingMember = itemCraft.MemberNumber;
        if (!!craftingMember && craftingMember >= 0) {
            let craftingChar = getCharacter(craftingMember) as OtherCharacter;
            if (!!craftingChar && !!craftingChar.LSCG) {
                spells = craftingChar.LSCG.MagicModule.knownSpells.filter(s => s.AllowPotion && !s.Effects.some(e => pairedSpellEffects.indexOf(e) > -1));
            }
        }
        
        let spell = spells?.filter(x => !!x)?.find(x => !!x && !!x.Name && isPhraseInString(itemStr, x.Name));
        return spell;
    }
}