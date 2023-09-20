import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class FrozenState extends BaseState {
    Type: LSCGState = "frozen";

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.CharacterAccess = "true";
        this.Restrictions.Stand = "true";
        this.Restrictions.Walk = "true";
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}