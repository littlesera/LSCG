import { SendAction, addCustomEffect, getRandomInt, hookFunction, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class HornyState extends BaseState {
    Type: LSCGState = "horny";

    Icon(C: OtherCharacter): string {
        return "Icons/Small/Lover.png";
    }
    Label(C: OtherCharacter): string {
        return "Aroused";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Init(): void {
        hookFunction('ActivitySetArousalTimer', 2, (args, next) => {
            if (this.Active) {
                let Activity = args[1];
                let Zone = args[2];
                let Progress = args[3];

                let hornyMod = 2;
                args[3] = Math.min(99, Progress * hornyMod);
            }
            return next(args);
        }, ModuleCategory.States);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}