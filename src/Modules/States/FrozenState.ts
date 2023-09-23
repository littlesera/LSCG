import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class FrozenState extends BaseState {
    Type: LSCGState = "frozen";

    get Icon(): string {
        return "Icons/Kidnap.png";
    }
    get Label(): string {
        return "Petrified";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.CharacterAccess = "true";
        this.Restrictions.Stand = "true";
        this.Restrictions.Kneel = "true";
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Walk = "true";
        this.Restrictions.Speech = "true";
    }

    Init(): void {}

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