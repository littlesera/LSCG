import { getRandomInt, hookFunction } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class HornyState extends BaseState {
    Type: LSCGState = "horny";

    Icon(C: OtherCharacter): string {
        return "Icons/Lover.png";
    }
    Label(C: OtherCharacter): string {
        return "Aroused";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Init(): void {
        hookFunction("ActivitySetArousalTimer", 2, (args, next) => {
            if (this.Active) {
                const Progress = args[3];

                const hornyMod = 2;
                args[3] = Math.min(99, Progress * hornyMod);
            }
            return next(args);
        }, ModuleCategory.States);
    }

    Tick(now: number): void {
        if (this.Active && !!Player.ArousalSettings && getRandomInt(1) == 0) {
            Player.ArousalSettings.Progress++;
        }
        super.Tick(now);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}
