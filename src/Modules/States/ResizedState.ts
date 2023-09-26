import { ICONS, SendAction, addCustomEffect, getRandomInt, hookFunction, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class ResizedState extends BaseState {
    Type: LSCGState = "resized";

    get enlarged(): boolean {
        return this.config.extensions["enlarged"] as boolean;
    }
    set enlarged(val: boolean) {
        this.config.extensions["enlarged"] = val;
    }

    Icon(C: OtherCharacter): string {
        let isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? ICONS.EXPAND : ICONS.SHRINK;
    }
    Label(C: OtherCharacter): string {
        let isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? "Enlarged" : "Shrunk";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Enlarge(MemberNumber?: number, emote?: boolean) {
        this.enlarged = true;
        this.Activate(MemberNumber, emote);
    }

    Reduce(MemberNumber?: number, emote?: boolean) {
        this.enlarged = false;
        this.Activate(MemberNumber, emote);
    }

    Activate(memberNumber?: number | undefined, emote?: boolean | undefined): void {
        this.config.extensions["originalHeightRatio"] = Player.HeightRatio;
        super.Activate();
    }

    Recover(emote?: boolean | undefined): void {        
        super.Recover();
    }

    Init(): void {
        hookFunction("ChatRoomDrawCharacter", 1, (args, next) => {
            ChatRoomCharacterDrawlist.forEach(C => {
                let lscg = (C as OtherCharacter).LSCG;
                if (!!lscg && lscg.StateModule.states.find(s => s.type == "resized")?.active) {
                    let enlarge = lscg.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] ?? false;
                    C.HeightRatio *= enlarge ? 1.5 : .75;
                }
            })
            let ret = next(args);
            ChatRoomCharacterDrawlist.forEach(C => {
                let lscg = (C as OtherCharacter).LSCG;
                if (!!lscg && lscg.StateModule.states.find(s => s.type == "resized")?.active) {
                    let originalHeightRatio = lscg.StateModule.states.find(s => s.type == "resized")?.extensions["originalHeightRatio"] ?? 1;
                    C.HeightRatio = originalHeightRatio;
                }
            })
            return ret;
        })
    }

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}