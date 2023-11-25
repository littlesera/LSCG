import { ICONS, SendAction, addCustomEffect, getRandomInt, hookFunction, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class ResizedState extends BaseState {
    Type: LSCGState = "resized";

    get enlarged(): boolean {
        return this.config.extensions["enlarged"] as boolean;
    }
    set enlarged(val: boolean) {
        this.config.extensions["enlarged"] = val;
    }

    Icon(C: OtherCharacter): string {
        let isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? ICONS.EXPAND : ICONS.SHRINK;
    }
    Label(C: OtherCharacter): string {
        let isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? "Enlarged" : "Shrunk";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Enlarge(MemberNumber?: number, duration?: number, emote?: boolean): BaseState {
        if (this.Active && !this.enlarged)
            this.Recover(true);
        else {
            this.enlarged = true;
            if (emote) SendAction(`%NAME%'s body reshapes and grows to twice its size.`);
            this.Activate(MemberNumber, duration, emote);
        }
        return this;
    }

    Reduce(MemberNumber?: number, duration?: number, emote?: boolean): BaseState {
        if (this.Active && this.enlarged)
            this.Recover(true);
        else {
            this.enlarged = false;
            if (emote) SendAction(`%NAME%'s body reshapes and shrinks to half its size.`);
            this.Activate(MemberNumber, duration, emote);
        }
        return this;
    }

    Activate(memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState | undefined {
        this.config.extensions["originalHeightRatio"] = Player.HeightRatio;
        return super.Activate(memberNumber, duration, emote);
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        if (emote && this.Active) SendAction(`%NAME%'s body returns to its normal size.`);
        return super.Recover(false);
    }

    Init(): void {
        hookFunction("CharacterAppearanceGetCurrentValue", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            let Group = args[1];
            let Type = args[2];
            let ret = next(args);
            if (!Player.LSCG?.GlobalModule?.hideResizing && Group == "Height" && Type == "Zoom") {
                if ((Player.VisualSettings?.ForceFullHeight ?? false) || !C || !C.LSCG || !C.LSCG.StateModule || !!CurrentCharacter)
                    return ret;
                if (ret == "None")
                    ret = 1;
                let stateModule = C.LSCG.StateModule;
                if (stateModule.states.find(s => s.type == "resized")?.active) {
                    let enlarge = stateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] ?? false;
                    ret *= enlarge ? 1.5 : .75;
                }
            }
            return ret;
        }, ModuleCategory.States);

        hookFunction("CommonDrawAppearanceBuild", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            C.HeightRatio = CharacterAppearanceGetCurrentValue(C, "Height", "Zoom");
            return next(args);
        }, ModuleCategory.States);

        hookFunction("DrawCharacter", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            C.HeightRatio = CharacterAppearanceGetCurrentValue(C, "Height", "Zoom");
            return next(args);
        }, ModuleCategory.States);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}