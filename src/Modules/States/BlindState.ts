import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class BlindState extends BaseState {
    Type: LSCGState = "blind";

    Icon(C: OtherCharacter): string {
        return "Icons/Previews/BlindHeavy.png";
    }
    Label(C: OtherCharacter): string {
        return "Blinded";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Sight = "true";
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}