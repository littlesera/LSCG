import { StateModule } from "Modules/states";
import { getModule } from "modules";

export class BaseState {
    _state : StateModule | undefined;
    get StateModule() {
        if (!this._state)
            this._state = getModule<StateModule>("StateModule");
        return this._state;
    }

    constructor(stateModule: StateModule) {
        this._state = stateModule;
    }

    Init() { }

    Activate(memberNumber?: number, emote?: boolean) { }

    Recover(emote?: boolean) { }

    Tick(now: number) {}

    CanWalk(): boolean {
        return true;
    }
}