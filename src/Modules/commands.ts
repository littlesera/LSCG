import { BaseModule } from "base";
import { getModule, modules } from "modules";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, GetDelimitedList, LSCG_SendLocal, removeAllHooksByModule, SendAction, settingsSave } from "../utils";
import { HypnoModule } from "./hypno";
import { ItemUseModule } from "./item-use";
import { ActivityModule } from "./activities";
import { CollarModule } from "./collar";

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class CommandModule extends BaseModule {   
    
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

				if (this.hypno.settings.immersive) {
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

				if (this.hypno.hypnoActivated && this.hypno.settings.immersive) {
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

				let hypnoStr = !this.hypno.Enabled ? "<i>Hypnosis not enabled.</i>" : (this.hypno.settings.immersive ? "<i>Hypnosis triggers hidden while immersive...</i>" : `<b>Hypnosis:</b> ${hypnoTriggers}<br><b>Awakeners:</b> ${awakenerTriggers}`);
				let collarStr = !this.collar.settings.enabled ? "<i>Breathplay Collar not enabled.</i>" : (this.collar.settings.immersive ? "<i>Collar triggers hidden while immersive...</i>" : `<b>Collar Tighten:</b> ${tightenTrigger}<br><b>Collar Loosen:</b> ${loosenTrigger}`);

				LSCG_SendLocal(`Your current triggers are: <br>${hypnoStr}<br>${collarStr}`);
			}
		}, {
			Tag: "cycle-trigger",
			Description: ": Force a cycle to a new trigger word if enabled",
			Action: () => {
				if (this.hypno.settings.immersive) {
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
				let tgt = this.getCharacterByNicknameOrMemberNumber(args);
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
				let tgt = this.getCharacterByNicknameOrMemberNumber(args);
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
							if (Player.IsRestrained())
								SendAction("%NAME% struggles in %POSSESSIVE% bindings, unable to reach %POSSESSIVE% collar's controls.");
							else {
								SendAction("%NAME% presses a button on %POSSESSIVE% collar.");
								setTimeout(() => {
									if (!this.collar.settings.allowSelfTightening)
										SendAction(`%NAME%'s collar beeps and a computerized voice says "Access Denied."`);
									else
										this.collar.IncreaseCollarChoke();
								}, 1500);
							}
							break;
						case "loose":
						case "loosen":
							if (Player.IsRestrained())
								SendAction("%NAME% struggles in %POSSESSIVE% bindings, unable to reach %POSSESSIVE% collar's controls.");
							else {
								SendAction("%NAME% presses a button on %POSSESSIVE% collar.");
								setTimeout(() => {
									if (!this.collar.settings.allowSelfLoosening)
										SendAction(`%NAME%'s collar beeps and a computerized voice says "Access Denied."`);
									else
										this.collar.DecreaseCollarChoke();
								}, 1500);
							}
							break;
						case "stat":
						case "stats":
							if (!this.collar.settings.collarPurchased)
								LSCG_SendLocal(`Collar module not purchased.`);
							else if (Player.IsRestrained())
								SendAction("%NAME% struggles in %POSSESSIVE% bindings, unable to reach %POSSESSIVE% collar's controls.");
							else {
								SendAction("%NAME% presses a button on %POSSESSIVE% collar.");
								setTimeout(() => {
									let tightenTrigger = GetDelimitedList(this.collar.settings.tightTrigger);
									let loosenTrigger = GetDelimitedList(this.collar.settings.looseTrigger);
									let chokeCount = this.collar.settings.stats.collarPassoutCount;
									let remoteAccess = "ENABLED";
									if (!this.collar.settings.remoteAccess)
										remoteAccess = "DISABLED";
									else if (this.collar.settings.limitToCrafted || this.collar.allowedChokeMembers.length > 0)
										remoteAccess = "LIMITED";
									SendAction(`%NAME%'s collar chimes and a computerized voice reads out:\nCurrent Level: ${this.collar.settings.chokeLevel}...\nCorrective Cycles: ${chokeCount}...\nTighten Trigger: '${tightenTrigger}'...\nLoosen Trigger: '${loosenTrigger}'...\nRemote Access: ${remoteAccess}...`);
								}, 1500);
							}
					} 
				} else if (parsed.length == 0) {
					LSCG_SendLocal(`<b>/lscg collar</b> [tight/loose/stat] : Use to self-tighten, self-loosen, or read out information about your collar if allowed. Must be unrestrained to use."`);
				}
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