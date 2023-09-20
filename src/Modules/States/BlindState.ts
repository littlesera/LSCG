import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class BlindState extends BaseState {
    Type: LSCGState = "blind";

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Sight = "true";
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}