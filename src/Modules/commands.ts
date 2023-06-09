import { BaseModule } from "base";
import { getModule } from "modules";
import { GuiHypno } from "Settings/hypno";
import { MainMenu } from "Settings/mainmenu";
import { RemoteMainMenu } from "Settings/Remote/mainmenu";
import { RemoteGuiSubscreen } from "Settings/Remote/remoteBase";
import { GuiSubscreen } from "Settings/settingBase";
import { GUI } from "Settings/settingUtils";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, hookFunction, ICONS, removeAllHooksByModule } from "../utils";
import { HypnoModule } from "./hypno";

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
					helpLines.push(`<br>/lscg ${c.Tag} ${c.Description}`);
				})
				var bgColor = (Player.ChatSettings!.ColorTheme!.indexOf("Light") > -1) ? "#D7F6E9" : "#23523E";
				let helpText = `<p style='background-color:${bgColor};'><b>- Little Sera's Club Games -</b>${helpLines.join()}<br>More to come...</p>`;
				ChatRoomSendLocal(helpText);
			},
		}, {
			Tag: 'zonk',
			Description: ": hypnotize yourself",
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
			Description: ": unzonk yourself",
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
			Description: ": reveal your current trigger word(s) to yourself",
			Action: () => {
				if (this.hypno.settings.immersive) {
					ChatRoomSendLocal("/show-trigger disabled while immersive", 5000);
					return;
				}
				ChatRoomSendLocal("Your current triggers are: " + this.hypno.triggers);
			}
		}, {
			Tag: "cycle-trigger",
			Description: ": force a cycle to a new trigger word if enabled",
			Action: () => {
				if (this.hypno.settings.immersive) {
					ChatRoomSendLocal("/cycle-trigger disabled while immersive", 5000);
					return;
				}
				if (this.hypno.settings.enableCycle)
					this.hypno.RollTriggerWord();
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
}