import { SendAction, getRandomInt } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";

export class GaggedState extends BaseState {
    Type: LSCGState = "gagged";

    Icon(C: OtherCharacter): string {
        return "Icons/Previews/GagHeavy.png";
    }
    Label(C: OtherCharacter): string {
        return "Gagged";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Speech = "true";
    }

    Init(): void {}

    RoomSync(): void {}

    freeBlockStrings = [
        "%NAME%'s eyes widen as they try to speak without success...",
        "%NAME% looks around helplessly, unable to make a sound...",
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