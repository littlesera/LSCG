import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, getCharacterByNicknameOrMemberNumber, GetDelimitedList, LSCG_SendLocal, removeAllHooksByModule, SendAction, sendLSCGCommandBeep, settingsSave } from "../utils";
import { HypnoModule } from "./hypno";
import { ItemUseModule } from "./item-use";
import { ActivityModule } from "./activities";
import { CollarModule } from "./collar";
import { StateModule } from "./states";

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class CommandModule extends BaseModule {   
    
	get states(): StateModule { return getModule<StateModule>("StateModule")! }
	get hypno(): HypnoModule { return getModule<HypnoModule>("HypnoModule")! }
	get collar(): CollarModule { return getModule<CollarModule>("CollarModule")! }

	lscgCommands: ICommand[] = [
		{
			Tag: "help",
			Description: ": Opens the help for LSCG commands",
			Action: (args, msg, parsed) => {
				let helpLines: string[] = [];
				this.orderedCommands.forEach(c => {
					helpLines.push(`<br><b>/lscg ${c.Tag}</b> ${c.Description}`);
				})
				let helpText = `<b>- Little Sera's Club Games -</b>${helpLines.join()}<br>More to come...`;
				LSCG_SendLocal(helpText);
			},
		}, {
			Tag: 'zonk',
			Description: ": Hypnotize yourself",
			Action: () => {
				if (!this.hypno.Enabled)
					return;

				if (this.states.settings.immersive) {
					LSCG_SendLocal("/zonk disabled while immersive", 5000);
					return;
				}
				if (!this.hypno.hypnoActivated)
					this.hypno.StartTriggerWord(true, Player.MemberNumber);
			}
		}, {
			Tag: 'unzonk',
			Description: ": Awaken yourself",
			Action: () => {
				if (!this.hypno.Enabled)
					return;

				if (this.states.settings.immersive) {
					LSCG_SendLocal("/unzonk disabled while immersive", 5000);
					return;
				}
				if (this.hypno.hypnoActivated)
					this.hypno.TriggerRestoreTimeout();
			}
		}, {
			Tag: "show-triggers",
			Description: ": Reveal your current trigger word(s) to yourself",
			Action: () => {
				let hypnoTriggers = this.hypno.triggers;
				let awakenerTriggers = this.hypno.awakeners;
				let tightenTrigger = GetDelimitedList(this.collar.settings.tightTrigger);
				let loosenTrigger = GetDelimitedList(this.collar.settings.looseTrigger);

				let hypnoStr = !this.hypno.Enabled ? "<i>Hypnosis not enabled.</i>" : (this.states.settings.immersive ? "<i>Hypnosis triggers hidden while immersive...</i>" : `<b>Hypnosis:</b> ${hypnoTriggers}<br><b>Awakeners:</b> ${awakenerTriggers}`);
				let collarStr = !this.collar.settings.enabled ? "<i>Breathplay Collar not enabled.</i>" : (this.collar.settings.immersive ? "<i>Collar triggers hidden while immersive...</i>" : `<b>Collar Tighten:</b> ${tightenTrigger}<br><b>Collar Loosen:</b> ${loosenTrigger}`);

				LSCG_SendLocal(`Your current triggers are: <br>${hypnoStr}<br>${collarStr}`);
			}
		}, {
			Tag: "cycle-trigger",
			Description: ": Force a cycle to a new trigger word if enabled",
			Action: () => {
				if (this.states.settings.immersive) {
					LSCG_SendLocal("/cycle-trigger disabled while immersive", 5000);
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
					LSCG_SendLocal("Please specify a defender for your roll.", 10000);
					return;
				}
				let tgt = getCharacterByNicknameOrMemberNumber(args);
				if (!tgt) {
					LSCG_SendLocal(`Defender ${args} not found.`, 10000);
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
					LSCG_SendLocal("Please specify an attacker for your roll.", 10000);
					return;
				}
				let tgt = getCharacterByNicknameOrMemberNumber(args);
				if (!tgt) {
					LSCG_SendLocal(`Attacker ${args} not found.`, 10000);
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
		}, {
			Tag: "collar",
			Description: " [tight/loose/stat] : Use to self-tighten, self-loosen, or read out information about your collar if allowed. Must be unrestrained to use.",
			Action: (args, msg, parsed) => {
				if (!this.collar.settings.collarPurchased) {
					LSCG_SendLocal(`Collar module not purchased.`);
					return;
				}

				if (!this.collar.wearingCorrectCollar) {
					LSCG_SendLocal(`You are not wearing a properly configured collar.`);
					return;
				}
				if (!this.collar.Enabled)
					return;

				if (parsed.length == 1) {
					switch (parsed[0].toLocaleLowerCase()) {
						case "tight":
						case "tighten":
							this.collar.TightenButtonPress(Player);
							break;
						case "loose":
						case "loosen":
							this.collar.LoosenButtonPress(Player);
							break;
						case "stat":
						case "stats":
							this.collar.StatsButtonPress(Player);
							break;
					} 
				} else if (parsed.length == 0) {
					LSCG_SendLocal(`<b>/lscg collar</b> [tight/loose/stat] : Use to self-tighten, self-loosen, or read out information about your collar if allowed. Must be unrestrained to use."`);
				}
			}
		}, {
			Tag: "conditions",
			Description: " : List which conditions are currently active on you.",
			Action: (args, msg, parsed) => {
				let target = getCharacterByNicknameOrMemberNumber(args) as OtherCharacter;

				let targetName = !target ? CharacterNickname(Player) : CharacterNickname(target);
				let states = !target ? 
					this.states.States.filter(s => s.Active).map(s => s.Type) :
					target.LSCG.StateModule.states.filter(s => s.active).map(s => s.type);
				
				let stateList = states.map(s => `<li>${s}</li>`).join("");
				LSCG_SendLocal(`<div><b>Active Conditions on ${targetName}:</b><ul>${stateList}</ul></div>`, 12000);
			}
		// }, {
		// 	Tag: "test-beep",
		// 	Description: " : List which conditions are currently active on you.",
		// 	Action: (args, msg, parsed) => {
		// 		let tgt = getCharacterByNicknameOrMemberNumber(args);
		// 		if (!!tgt) {
		// 			LSCG_SendLocal(`Sending beep command to ${CharacterNickname(tgt)}`);
		// 			sendLSCGCommandBeep(tgt.MemberNumber ?? -1, "debug", [{
		// 				name: "msg",
		// 				value: `Test LSCG Beep from ${CharacterNickname(Player)}`
		// 			}]);
		// 		}
		// 	}
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