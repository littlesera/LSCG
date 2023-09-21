import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { SendAction, getRandomInt, hookFunction, removeAllHooksByModule } from "../utils";
import { ActivityModule, ActivityTarget } from "./activities";
import { LSCGSpellEffect, MagicSettingsModel, SpellDefinition } from "Settings/Models/magic";
import { GuiMagic } from "Settings/magic";

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
            knownSpells: []
        };
    }

    get settings(): MagicSettingsModel {
        return super.settings as MagicSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiMagic;
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

    get AvailableSpells(): SpellDefinition[] {
        return this.settings.knownSpells ?? this.TestSpells;
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
                MaxProgress: 50,
                MaxProgressSelf: 50,
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
					Name: "KnowsSpells",
					Func: (acting, acted, group) => {
                        // Must have available spells and can only cast on LSCG users
						return this.Enabled && this.AvailableSpells.length > 0 && !!(<any>acted).LSCG;
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
    }

    run(): void {

    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Magic);
    }

    PrevScreen: string = "";
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
        CurrentScreen = this.PrevScreen;
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
            let characterOptions = ChatRoomCharacter.filter(c => !!c && !!(c as any).LSCG && c.MemberNumber != this.SpellPairOption.Source?.MemberNumber);
            characterOptions.forEach((char, ix, arr) => {
                DrawButton(this.SpellGrid.x + (ix > 4 ? 450 : 0), this.SpellGrid.y + ((ix % 5) * 120), characterOptions.length > 5 ? 400 : 800, 100, CharacterNickname(char), "White");
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

                let desc = spell.Effects.join(", ");

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

    CastSpellInitial(spell: SpellDefinition, C: Character | null) {
        if (!!C) {
            if (spell.Effects.some(e => this.pairedSpellEffects.indexOf(e) > -1)) {
                this.SpellPairOption.Spell = spell;
                this.SpellPairOption.Source = C;
                this.SpellPairOption.SelectOpen = true;
            } else {
                this.CastSpellActual(spell, C);
            }
        }
    }

    CastSpellActual(spell: SpellDefinition | undefined, spellTarget: Character, pairedTarget?: Character) {
        if (!!spell && !!spellTarget) {
            SendAction(`%NAME% casts ${spell.Name} at ${CharacterNickname(spellTarget)} ${!!pairedTarget ? "paired with " + CharacterNickname(pairedTarget) : ""}`);
        }
        this.CloseSpellMenu();
        DialogLeave();
    }
}