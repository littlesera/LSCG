import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { LSCG_SendLocal, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, sendLSCGCommand } from "../utils";
import { ActivityModule, ActivityTarget } from "./activities";
import { LSCGSpellEffect, MagicSettingsModel, SpellDefinition } from "Settings/Models/magic";
import { GuiMagic } from "Settings/magic";
import { StateModule } from "./states";

export class MagicModule extends BaseModule {
    SpellMenuOpen: boolean = false;
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
        return <SpellDefinition>{
            Name: `wild magic`,
            Effects: Array(getRandomInt(3) + 1).fill(0).map(t => Object.values(LSCGSpellEffect)[getRandomInt(Object.keys(LSCGSpellEffect).length)])
        }
    }

    get AvailableSpells(): SpellDefinition[] {
        return this.settings.knownSpells ?? [];//this.TestSpells;
    }

    PairedCharacterOptions(spellTarget: Character | undefined): Character[] {
        return ChatRoomCharacter.filter(c => !!c && !!(c as any).LSCG && !!(c as any).LSCG.MagicModule && c.MemberNumber != spellTarget?.MemberNumber);
    }

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
        }, ModuleCategory.Magic)

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
        this.SpellPairOption.SelectOpen = false;
        if (CurrentScreen == "LSCG_SPELLS_DIALOG")
            CurrentScreen = this.PrevScreen ?? "ChatRoom";
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
                if (spell.Effects.some(effect => this.pairedSpellEffects.indexOf(effect) > -1))
                    icons.push("Handheld");
                if (spell.Effects.some(effect => blockedSpellEffects.indexOf(effect) > -1)) {
                    icons.push("AllowedLimited");
                    background = "red";
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
            let characterOptions = ChatRoomCharacter.filter(c => !!c && !!(c as any).LSCG);
            if (characterOptions.length <= 0) {
                this.CloseSpellMenu();    
            }
            characterOptions.forEach((char, ix, arr) => {
                if (MouseIn(this.SpellGrid.x + (ix > 4 ? 450 : 0), this.SpellGrid.y + ((ix % 5) * 120), 400, 100)) {
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

    pairedSpellEffects = [
        LSCGSpellEffect.orgasm_siphon,
        LSCGSpellEffect.paired_arousal
    ];

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
        return spell.Effects.some(e => this.pairedSpellEffects.indexOf(e) > -1);
    }

    CastSpellInitial(spell: SpellDefinition, C: Character | null) {
        if (!!C) {
            if (this.SpellNeedsPair(spell)) {
                this.SpellPairOption.Spell = spell;
                this.SpellPairOption.Source = C;
                this.SpellPairOption.SelectOpen = true;
            } else {
                this.CastSpellActual(spell, C);
            }
        }
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
            if (!(spellTarget as any).LSCG?.MagicModule)
                SendAction(`%NAME% casts ${spell.Name} at %OPP_NAME% but it seems to fizzle.`, spellTarget);
            else {
                SendAction(this.getCastingActionString(spell, InventoryGet(Player, "ItemHandheld"), spellTarget, pairedTarget), spellTarget);
                sendLSCGCommand(spellTarget, "spell", [
                    {
                        name: "spell",
                        value: spell
                    }, {
                        name: "paired",
                        value: pairedTarget?.MemberNumber
                    }
                ]);
                if (!!pairedTarget)
                    sendLSCGCommand(pairedTarget, "spell-pair", [
                        {
                            name: "spell",
                            value: spell
                        }, {
                            name: "paired",
                            value: spellTarget.MemberNumber
                        }
                    ]);
            }
        }
        this.CloseSpellMenu();
        DialogLeave();
    }

    // ********************** INCOMING *************************

    IncomingSpellCommand(sender: Character | null, msg: LSCGMessageModel) {
        let spell = msg.command?.args?.find(arg => arg.name == "spell")?.value as SpellDefinition;
        if (!spell)
            return;
        if (msg.command?.name == "spell") {
            let paired = ChatRoomCharacter.find(c => c.MemberNumber == (msg.command?.args.find(arg => arg.name == "paired")?.value as number));
            this.IncomingSpell(sender, spell, paired);
        }
        else if (msg.command?.name == "spell-pair") {
            let origin = ChatRoomCharacter.find(c => c.MemberNumber == (msg.command?.args.find(arg => arg.name == "paired")?.value as number));
            if (!!origin)
                this.IncomingSpellPair(sender, spell, origin);
            else if (!!sender) {
                SendAction(`${CharacterNickname(sender)}'s paired spell fizzles because the origin target has left.`);
            }
        }
    }

    IncomingSpell(sender: Character | null, spell: SpellDefinition, paired?: Character) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let pairedName = !paired ? "someone else" : CharacterNickname(paired);
        let allowedSpellEffects = spell.Effects.filter(effect => this.settings.blockedSpellEffects.indexOf(effect) == -1);
        if (allowedSpellEffects.length <= 0) {
            SendAction(`${senderName}'s ${spell.Name} fizzles when cast on %NAME%, none of its effects allowed to take hold.`);
            return;
        }

        allowedSpellEffects.forEach(effect => {
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
                    SendAction("%NAME%'s widen in a panic as %POSSESSIVE% muscles seize in place.");
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
                case LSCGSpellEffect.dispell:
                    SendAction("%NAME% gasps, blinking as %PRONOUN% is restored to normal.");
                    this.stateModule.Clear(true);
                    break;
                case LSCGSpellEffect.outfit:
                    if (!!spell.OutfitCode) {
                        this.stateModule.GaggedState.Active ? 
                            SendAction("%NAME% trembles as %POSSESSIVE% clothing shimmers and morphs around %PRONOUN%.") : 
                            SendAction("%NAME% squeaks as %POSSESSIVE% clothing shimmers and morphs around %PRONOUN%.");
                        this.stateModule.RedressedState.ApplyOutfit(spell.OutfitCode)
                    }
                    break;
                case LSCGSpellEffect.paired_arousal:
                    // TODO
                    SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                    LSCG_SendLocal(`paired_arousal spell TODO...`);
                    break;
                case LSCGSpellEffect.orgasm_siphon:
                    // TODO
                    this.stateModule.GaggedState.Active ? 
                    SendAction(`%NAME% quivers as %PRONOUN% feels %POSSESSIVE% impending denial.`) :
                    SendAction(`%NAME% whimpers as %PRONOUN% feels %POSSESSIVE% impending denial.`);
                    LSCG_SendLocal(`orgasm_siphon spell TODO...`);
                    break;
            }
        });
    }

    IncomingSpellPair(sender: Character | null, spell: SpellDefinition, originalTarget: Character) {
        let senderName = !sender ? "Someone" : CharacterNickname(sender);
        let originalTargetName = CharacterNickname(originalTarget);
        let allowedSpellEffects = spell.Effects.filter(effect => this.pairedSpellEffects.indexOf(effect) > -1 && this.settings.blockedSpellEffects.indexOf(effect) == -1);

        allowedSpellEffects.forEach(effect => {
            switch (effect) {
                case LSCGSpellEffect.paired_arousal:
                    // TODO
                    SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                    LSCG_SendLocal(`paired_arousal spell TODO...`);
                    break;
                case LSCGSpellEffect.orgasm_siphon:
                    // TODO
                    SendAction(`%NAME% lets out a quiet gasp as the pleasure center of %POSSESSIVE% mind starts to tingle.`);
                    LSCG_SendLocal(`orgasm_siphon spell TODO...`);
                    break;
            }
        });
    }
}