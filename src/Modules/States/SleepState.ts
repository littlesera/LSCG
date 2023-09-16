import { BaseState } from "./BaseState";

export class SleepState extends BaseState {
    Init() { }

    Activate(memberNumber?: number, emote?: boolean) { }

    Recover(emote?: boolean) { }

    Tick(now: number) {}
}