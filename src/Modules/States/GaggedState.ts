import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class GaggedState extends BaseState {
    Type: LSCGState = "gagged";

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Speech = "true";
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    freeBlockStrings = [
        "%NAME%'s eyes widen as they try to speak without success...",
        "%NAME% claws helplessly at %POSSESSIVE% mouth, unable to make a sound...",
        "%NAME%'s mouth moves in silence...",
        "%NAME%'s mouth moves silently..."
    ];

    restrainedBlockStrings = [
        "%NAME% whimpers, struggling in %POSSESSIVE% bindings and unable to speak...",
        "%NAME%'s eyes widen as they squirm in %POSSESSIVE% bondage, only a gentle moan escaping...",
        "%NAME% tries %POSSESSIVE% best to speak, but has to resign themselves to mearly a bound whimper...",
        "%NAME% squirms in %POSSESSIVE% bindings, %POSSESSIVE% mouth moving in silence..."
    ];

    SpeechBlock(): void {
        if (Player.IsRestrained())
            SendAction(this.restrainedBlockStrings[getRandomInt(this.restrainedBlockStrings.length)]);
        else
            SendAction(this.freeBlockStrings[getRandomInt(this.freeBlockStrings.length)]);
    }
}