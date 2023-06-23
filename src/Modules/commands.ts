import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, LSCG_SendLocal, removeAllHooksByModule, SendAction, settingsSave } from "../utils";
import { HypnoModule } from "./hypno";
import { ItemUseModule } from "./item-use";
import { ActivityModule } from "./activities";

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class CommandModule extends BaseModule {   
    
	get hypno(): HypnoModule { return getModule<HypnoModule>("HypnoModule")! }

	lscgCommands: ICommand[] = [
		{
			Tag: "help",
			Description: ": Opens the help for LSCG commands",
			Action: (args, msg, parsed) => {
				let helpLines: string[] = [];
				this.orderedCommands.forEach(c => {
					helpLines.push(`<br><b>/lscg ${c.Tag}</b> ${c.Description}`);
				})
				var bgColor = (Player.ChatSettings!.ColorTheme!.indexOf("Light") > -1) ? "#D7F6E9" : "#23523E";
				let helpText = `<p style='background-color:${bgColor};'><b>- Little Sera's Club Games -</b>${helpLines.join()}<br>More to come...</p>`;
				ChatRoomSendLocal(helpText);
			},
		}, {
			Tag: 'zonk',
			Description: ": Hypnotize yourself",
			Action: () => {
				if (this.hypno.settings.immersive) {
					ChatRoomSendLocal("/zonk disabled while immersive", 5000);
					return;
				}
				if (!this.hypno.hypnoActivated)
					this.hypno.StartTriggerWord(true, Player.MemberNumber);
			}
		}, {
			Tag: 'unzonk',
			Description: ": Awaken yourself",
			Action: () => {
				if (this.hypno.hypnoActivated && this.hypno.settings.immersive) {
					ChatRoomSendLocal("/unzonk disabled while immersive", 5000);
					return;
				}
				if (this.hypno.hypnoActivated)
					this.hypno.TriggerRestoreTimeout();
			}
		}, {
			Tag: "show-trigger",
			Description: ": Reveal your current trigger word(s) to yourself",
			Action: () => {
				if (this.hypno.settings.immersive) {
					ChatRoomSendLocal("/show-trigger disabled while immersive", 5000);
					return;
				}
				ChatRoomSendLocal("Your current triggers are: " + this.hypno.triggers);
			}
		}, {
			Tag: "cycle-trigger",
			Description: ": Force a cycle to a new trigger word if enabled",
			Action: () => {
				if (this.hypno.settings.immersive) {
					ChatRoomSendLocal("/cycle-trigger disabled while immersive", 5000);
					return;
				}
				if (this.hypno.settings.enableCycle)
					this.hypno.RollTriggerWord();
			}
		}, {
			Tag: "roll",
			Description: ": Make an unopposed activity roll and display the results.",
			Action: (args, msg, parsed) => {
				let roll = getModule<ItemUseModule>("ItemUseModule")?.UnopposedActivityRoll(Player);
				SendAction(`${CharacterNickname(Player)} makes an activity roll and gets: ${roll.Total} ${roll.TotalStr}`);
			}
		}, {
			Tag: "roll-attack",
			Description: "[defender] : Make a contested activity roll against another user where you are the attacker.",
			Action: (args, msg, parsed) => {
				if (!args) {
					ChatRoomSendLocal("Please specify a defender for your roll.", 10000);
					return;
				}
				let tgt = this.getCharacterByNicknameOrMemberNumber(args);
				if (!tgt) {
					ChatRoomSendLocal(`Defender ${args} not found.`, 10000);
					return;
				}
				let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(Player, tgt);
				SendAction(`${CharacterNickname(Player)} makes an activity check attack against ${CharacterNickname(tgt)}!`);
				SendAction(`${CharacterNickname(Player)}: ${check.AttackerRoll.Total} ${check.AttackerRoll.TotalStr}-- ${CharacterNickname(tgt)}: ${check.DefenderRoll.Total} ${check.DefenderRoll.TotalStr}`)
			}
		}, {
			Tag: "roll-defend",
			Description: "[attacker] : Make a contested activity roll where you are defending against another user.",
			Action: (args, msg, parsed) => {
				if (!args) {
					ChatRoomSendLocal("Please specify an attacker for your roll.", 10000);
					return;
				}
				let tgt = this.getCharacterByNicknameOrMemberNumber(args);
				if (!tgt) {
					ChatRoomSendLocal(`Attacker ${args} not found.`, 10000);
					return;
				}
				let check = getModule<ItemUseModule>("ItemUseModule")?.MakeActivityCheck(tgt, Player);
				SendAction(`${CharacterNickname(Player)} makes an activity check defending from ${CharacterNickname(tgt)}!`);
				SendAction(`${CharacterNickname(Player)}: ${check.DefenderRoll.Total} ${check.DefenderRoll.TotalStr}-- ${CharacterNickname(tgt)}: ${check.AttackerRoll.Total} ${check.AttackerRoll.TotalStr}`)
			}
		}, {
			Tag: "escape",
			Description: " : If you are arm-grabbed or ear-pinched, will attempt to escape from their grip.",
			Action: (args, msg, parsed) => {
				var module = getModule<ActivityModule>("ActivityModule");
				if (!module)
					return;

				module.TryEscape();
			}
		}, {
			Tag: "emergency",
			Description: " : Use in case of emergency to revert all LSCG settings to their default values.",
			Action: (args, msg, parsed) => {
				this.EmergencyRelease();	
			}
		}
	]

	get orderedCommands(): ICommand[] {
		var helpCommand = this.getSubcommand("help")!;
		var sorted = this.lscgCommands.filter(c => c.Tag != "help").sort((a, b) => a.Tag.localeCompare(b.Tag));
		return [helpCommand, ...sorted];
	}

	get subCommands(): string[] {
		return this.orderedCommands.map(c => c.Tag);
	}

	getSubcommand(name: string): ICommand | undefined {
		return this.lscgCommands.find(c => c.Tag.toLocaleLowerCase() == name.toLocaleLowerCase());
	}

	getCharacterByNicknameOrMemberNumber(tgt: string): Character | undefined {
		tgt = tgt.toLocaleLowerCase();
		let tgtC: Character | undefined | null;
		if (CommonIsNumeric(tgt))
			tgtC = getCharacter(+tgt);
		if (!tgtC) {
			tgtC = ChatRoomCharacter.find(c => CharacterNickname(c).toLocaleLowerCase() == tgt);
		}
		return tgtC;
	}

    load(): void {
        CommandCombine([
            {
                Tag: 'lscg',
                Description: "or <b>/lscg help</b> : Opens the help for LSCG commands",
				AutoComplete(parsed, low, msg) {
					
				},
                Action: (args, msg, parsed) => {
                    if (parsed.length <= 0) {
						this.getSubcommand("help")!.Action!("", msg, []);
					} else {
						var command = this.getSubcommand(parsed[0]);
						var subArgs = parsed.slice(1);
						command?.Action!(subArgs.join(" "), msg, subArgs)
					}
                }
            }
		]);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Commands);
    }

	EmergencyRelease() {
		// Run Safeword action on all modules
		for (const m of modules()) {
			m.safeword();
			if (!!m.settingsStorage)
				(<any>Player.LSCG)[m.settingsStorage] = m.defaultSettings;
		}
		settingsSave(true);
	}
}