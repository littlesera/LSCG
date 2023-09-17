import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class DeafState extends BaseState {
    Type: LSCGState = "deaf";

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Hearing = "true";
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}