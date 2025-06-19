import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { SendAction, getRandomInt, OnChat, settingsSave, removeAllHooksByModule, isPhraseInString, GetDelimitedList } from "../utils";
import { SpreadingOutfitSettingsModel, SpreadingOutfitCodeConfig } from "Settings/Models/spreading-outfit";
import { GuiSpreadingOutfit } from "Settings/spreading-outfit";
import { StateModule } from "./states";
import { BaseState } from "./States/BaseState";

export class SpreadingOutfitModule extends BaseModule {
    nextActivationTriggerTimeout: number | undefined = undefined;
    debug: boolean = false;

    get Enabled(): boolean {
		return super.Enabled && [122875, 74298].indexOf(Player.MemberNumber ?? 0) > -1; // Only enable on test account for now
	}

    get defaultSettings() {
        return <SpreadingOutfitSettingsModel>{
            enabled: false,
            Active: false,
            Locked: false,
            Lockable: false,
            Internal: {CurrentOutfitIndex: 0, CurrentRepeatNumber: 0, NextActivationTime: 0, LastUsedOutfitIndex: -1},
            AllowedRemote: "Self",
            AllowSelfStop: true,
            Outfit1: {Code: "", Enabled: false},
            Outfit2: {Code: "", Enabled: false},
            Outfit3: {Code: "", Enabled: false},
            RepeatNumber: 5,
            RepeatInterval: 10,
            ItemInterval: 30,
            StartSpreadingTriggerWords: "",
            ActivateCurseTriggerWords: ""
        };
    }

    get settings(): SpreadingOutfitSettingsModel {
        return super.settings as SpreadingOutfitSettingsModel;
	}

    get settingsScreen(): Subscreen | null {
        return GuiSpreadingOutfit;
    }

    get stateModule(): StateModule {
        return getModule<StateModule>("StateModule");
    }

    safeword(): void {
        this.settings.Active = false;
        this.settings.Locked = false;
        this.settings.Lockable = false;
        this.settings.enabled = false;
    }

    load(): void {
        if (this.settings.Active && !this.stateModule.SpreadingOutfitState.Active) {
            this.setupNextActivationTimeout();
        }

        OnChat(1, ModuleCategory.SpreadingOutfit, (data, sender, msg, metadata) => {
            if (!this.Enabled || !this.settings.enabled)
                return;

            if (this.settings.Active && this.isMsgHaveTrigger(msg, this.settings.StartSpreadingTriggerWords)) {
                if (this.debug) console.log("StartSpreadingTriggerWords [", this.settings.StartSpreadingTriggerWords, "] found in msg=", msg);
                this.startSpreadingState();
            }
            else if (this.isMsgHaveTrigger(msg, this.settings.ActivateCurseTriggerWords)) {
                if (this.debug) console.log("ActivateCurseTriggerWords [", this.settings.ActivateCurseTriggerWords, "] found in msg=", msg);
                this.startSpreadingOutfitTriggered();
            }
        });
    }

    run(): void {

    }

    unload(): void {
        if (this.nextActivationTriggerTimeout) {
            clearTimeout(this.nextActivationTriggerTimeout);
            this.nextActivationTriggerTimeout = undefined;
        }
        removeAllHooksByModule(ModuleCategory.SpreadingOutfit);
    }

    isMsgHaveTrigger(msg: string, triggers: string) {
        // Skip on OOC
        if (msg.startsWith("(") || !triggers)
            return false;

        var triggerWords = GetDelimitedList(triggers);

        let matched = triggerWords.some(trigger => {
            return isPhraseInString(msg.toLowerCase(), trigger);
        })
        return matched;
    }

    setupNextActivationTimeout() {
        var timeToNextActivation = this.settings.Internal.NextActivationTime - CommonTime();
        this.nextActivationTriggerTimeout = setTimeout(() => { this.startSpreadingState() }, timeToNextActivation);

        // Log
        var hours = Math.floor(timeToNextActivation / 3600000);
        var minutes = Math.floor((timeToNextActivation % 3600000) / 60000);
        var seconds = Math.floor(((timeToNextActivation % 360000) % 60000) / 1000);
        if (this.debug) console.log("setupNextActivationTimeout: set trigger next activation in ", hours, "h ", minutes, "m ", seconds, "s");
    }

    // Called when settings might have changed
    checkStartStopNeeded() {
        if (this.debug) console.log("checkStartStopNeeded");
        if (this.settings.Active) {
            this.startSpreadingOutfitTriggered();
        }
        else {
            this.stopSpreadingOutfitTriggered();
        }
    }

    startSpreadingOutfitTriggered() {
        if (this.debug) console.log("startSpreadingOutfitTriggered");

        this.settings.Active = true;
        if (!this.nextActivationTriggerTimeout) {
            this.startSpreadingState();
        }
    }

    stopSpreadingOutfitTriggered() {
        if (this.debug) console.log("stopSpreadingOutfitTriggered");
        // Clean all Internal var
        let wasActive = false;

        if (this.settings.Active) {
            this.settings.Active = false;
            wasActive = true;
        }
        this.settings.Internal.CurrentRepeatNumber = 0;
        this.settings.Internal.CurrentOutfitIndex = 0;
        this.settings.Internal.NextActivationTime = 0;

        if (this.stateModule.SpreadingOutfitState.Active) {
            this.stateModule.SpreadingOutfitState.Recover(false);
            wasActive = true;
        }

        if (this.nextActivationTriggerTimeout) {
            clearTimeout(this.nextActivationTriggerTimeout);
            this.nextActivationTriggerTimeout = undefined;
            wasActive = true;
        }

        if (wasActive) {
            SendAction(`%NAME%'s cursed outfit finished spreading and it's now drained of all its energy.`);
            settingsSave(true);
        }
    }

    startSpreadingState() {
        if (!this.settings.Active) return;
        if (this.stateModule.SpreadingOutfitState.Active) return;
        if (this.debug) console.log("startSpreadingState: settings=", this.settings);
        if (!this.checkSettingsValidForStart()) {
            console.error("startSpreadingState: settings are not valid settings=", this.settings);
            this.settings.Active = false;
            settingsSave(true);
            return;
        }

        if (this.nextActivationTriggerTimeout) {
            clearTimeout(this.nextActivationTriggerTimeout);
            this.nextActivationTriggerTimeout = undefined;
            this.settings.Internal.NextActivationTime = 0;
        }

        this.settings.Internal.CurrentRepeatNumber += 1;
        if (this.debug) console.log("startSpreadingState: increasing CurrentRepeatNumber=", this.settings.Internal.CurrentRepeatNumber, " / ", this.settings.RepeatNumber);

        SendAction("%NAME% squeaks as a cursed clothes start to spread slowly around %INTENSIVE%.");

        // Select CurrentOutfitIndex
        this.settings.Internal.CurrentOutfitIndex = this.selectRandomCurrentOutfit();
        this.settings.Internal.LastUsedOutfitIndex = this.settings.Internal.CurrentOutfitIndex;
        if (this.debug) console.log("startSpreadingState: Selected CurrentOutfitIndex=", this.settings.Internal.CurrentOutfitIndex);

        var state: BaseState | undefined = this.stateModule.SpreadingOutfitState.Activate();
        if (!state) {
            console.error("startSpreadingState: outfit", this.settings.Internal.CurrentOutfitIndex," is not valid! settings=", this.settings);
            this.settings.Active = false;
            settingsSave(true);
            return;
        }

        settingsSave(true);
    }

    finishingSpreadingState() {
        if (!this.settings.Active) return;
        if (this.debug) console.log("finishingSpreadingState");
        if (this.settings.Internal.CurrentRepeatNumber > this.settings.RepeatNumber) {
            this.stopSpreadingOutfitTriggered();
            return;
        }

        // Set next activation time for the next repeat
        this.settings.Internal.NextActivationTime = CommonTime() + (this.settings.RepeatInterval * 60 * 1000);
        settingsSave(true);

        this.setupNextActivationTimeout();
        SendAction(`%NAME%'s cursed outfit finished spreading but some of its energy remains and will activate again soon enough...`);
    }

    checkSettingsValidForStart(): boolean {
        if (!this.settings) return false;
        if (!this.settings.Active) return false;
        if (this.settings.ItemInterval < 5 || this.settings.ItemInterval > 5 * 60) return false;
        if (this.settings.RepeatInterval < 5 || this.settings.RepeatInterval > 60 * 24) return false;
        if (this.settings.RepeatNumber < 0 || this.settings.RepeatNumber > 20) return false;

        let at_least_one_valid_outfit = false;
        if (this.settings.Outfit1.Enabled && this.settings.Outfit1.Code && this.settings.Outfit1.Code != "") at_least_one_valid_outfit = true;
        if (this.settings.Outfit2.Enabled && this.settings.Outfit2.Code && this.settings.Outfit2.Code != "") at_least_one_valid_outfit = true;
        if (this.settings.Outfit3.Enabled && this.settings.Outfit3.Code && this.settings.Outfit3.Code != "") at_least_one_valid_outfit = true;
        if (!at_least_one_valid_outfit) return false;

        return true;
    }

    selectRandomCurrentOutfit(): number {
        let index_available = [];
        if (this.settings.Outfit1.Enabled) index_available.push(1);
        if (this.settings.Outfit2.Enabled) index_available.push(2);
        if (this.settings.Outfit3.Enabled) index_available.push(3);
        if (index_available.length <= 0) return 0; // Should not be possible as it should be detected before in this.checkSettings()

        // Avoid using the same outfit twice in a row if possible
        if (index_available.length > 1 && this.settings.Internal.LastUsedOutfitIndex >= 0) {
            let idx = index_available.indexOf(this.settings.Internal.LastUsedOutfitIndex);
            if (idx != -1) {
                index_available.splice(idx, 1);
            }
        }

        if (index_available.length == 1) {
            // Only one choice is valid
            return index_available[0];
        }

        let random_index = getRandomInt(index_available.length);
        return index_available[random_index];
    }
}
