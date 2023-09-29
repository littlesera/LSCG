import { ICONS, SendAction, addCustomEffect, getRandomInt, hookFunction, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class BuffedState extends BaseState {
    Type: LSCGState = "buffed";
    static BUFF_DURATION: number = 900000; // 15min

    static BUFF_SKILLS: SkillType[] = [
        "Bondage",
        "SelfBondage",
        "LockPicking",
        "Evasion",
        "Willpower",
        "Infiltration",
        "Dressage"
    ]

    get negative(): boolean {
        return this.config.extensions["negative"] as boolean;
    }
    set negative(val: boolean) {
        this.config.extensions["negative"] = val;
    }

    Icon(C: OtherCharacter): string {
        let isNegative = C.LSCG?.StateModule.states.find(s => s.type == "buffed")?.extensions["negative"] as boolean ?? false;
        return isNegative ? ICONS.DOWN : ICONS.UP;
    }
    Label(C: OtherCharacter): string {
        let isNegative = C.LSCG?.StateModule.states.find(s => s.type == "buffed")?.extensions["negative"] as boolean ?? false;
        return isNegative ? "Baned" : "Blessed";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Bless(MemberNumber?: number, emote?: boolean, duration?: number): BaseState {
        if (this.Active && this.negative)
            this.Recover(true);
        else {
            this.negative = false;
            if (emote) SendAction("%NAME% feels as though %POSSESSIVE% abilities are enhanced.");
            this.Activate(MemberNumber, duration ?? BuffedState.BUFF_DURATION, emote);
        }
        return this;
    }

    Bane(MemberNumber?: number, emote?: boolean, duration?: number): BaseState {
        if (this.Active && !this.negative)
            this.Recover(true);
        else {
            this.negative = true;
            if (emote) SendAction("%NAME% feels as though %POSSESSIVE% abilities are deminished.");
            this.Activate(MemberNumber, duration ?? BuffedState.BUFF_DURATION, emote);
        }
        return this;
    }

    Activate(memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState | undefined {
        BuffedState.BUFF_SKILLS.forEach(skill => {
            SkillSetModifier(Player, skill, this.negative ? -5 : 5, duration ?? BuffedState.BUFF_DURATION, true);
        });
        return super.Activate(memberNumber, duration, emote);
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        if (this.Active) {
            if (emote) SendAction("%NAME%'s abilities return to normal.");
            BuffedState.BUFF_SKILLS.forEach(skill => {
                SkillSetModifier(Player, skill, 0, 0, true);
            })
        }
        return super.Recover(false);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}