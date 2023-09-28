import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class DeafState extends BaseState {
    Type: LSCGState = "deaf";

    Icon(C: OtherCharacter): string {
        return "Icons/Previews/DeafHeavy.png";
    }
    Label(C: OtherCharacter): string {
        return "Deafened";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Hearing = "true";
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}