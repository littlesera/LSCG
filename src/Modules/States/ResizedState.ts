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
        return super.Activate(memberNumber, duration, emote);
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        if (emote && this.Active) SendAction(`%NAME%'s body returns to its normal size.`);
        return super.Recover(false);
    }

    Init(): void {
        hookFunction("CharacterAppearanceSetHeightModifiers", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            next(args);
            if (Player.VisualSettings?.ForceFullHeight ?? false)
                return;
            if (!!C.LSCG && !!C.LSCG.StateModule && C.LSCG.StateModule.states && C.LSCG.StateModule.states.find(s => s.type == "resized")?.active) {
                let enlarge = C.LSCG.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] ?? false;
                C.HeightRatio *= enlarge ? 1.5 : .75;
            }
        }, ModuleCategory.States);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}