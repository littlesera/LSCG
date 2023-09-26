import { SendAction, addCustomEffect, getRandomInt, hookFunction, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class FrozenState extends BaseState {
    Type: LSCGState = "frozen";

    Icon(C: OtherCharacter): string {
        return "Icons/Kidnap.png";
    }
    Label(C: OtherCharacter): string {
        return "Petrified";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Move = "true";
        this.Restrictions.Stand = "true";
        this.Restrictions.Kneel = "true";
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Walk = "true";
        this.Restrictions.Speech = "true";
    }

    Init(): void {
        hookFunction("CharacterCanChangeToPose", 1, (args, next) => {
            if (this.Active)
                return false;
            return next(args);
        })
    }

    Tick(now: number) {}

    RoomSync(): void {}

    speechBlockStr: string[] = [
        "%NAME% barely trembles, unable to move their mouth or make a sound...",
        "%NAME%'s eyes plead helplessly as their muscles refuse to obey...",
        "%NAME% manages to muster a quiet whimper, their body held fast..."
    ];

    SpeechBlock(): void {
        SendAction(this.speechBlockStr[getRandomInt(this.speechBlockStr.length)]);
    }
}