import { ICONS, SendAction } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";

export class BarrierState extends BaseState {
    Type: LSCGState = "protected";
    static BUFF_DURATION: number = 900000; // 15min

    Icon(C: OtherCharacter): string {
        return ICONS.UP;
    }
    Label(C: OtherCharacter): string {
        return "Protected";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Barrier(MemberNumber?: number, emote?: boolean, duration?: number): BaseState {
        if (emote) SendAction("A magic barrier appear around %NAME%.");
        this.Activate(MemberNumber, duration ?? BarrierState.BUFF_DURATION, emote);
        return this;
    }

    Activate(memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState | undefined {
        return super.Activate(memberNumber, duration, emote);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}