import { StateModule } from "Modules/states";
import { StateConfig } from "Settings/Models/states";
import { getModule } from "modules";
import { ICONS, SendAction, getRandomInt, settingsSave } from "utils";



export interface StateRestrictions {
    Walk: LSCGImmersiveOption;
    Stand: LSCGImmersiveOption;
    Kneel: LSCGImmersiveOption;
    Hearing: LSCGImmersiveOption;
    Sight: LSCGImmersiveOption;
    Wardrobe: LSCGImmersiveOption;
    Move: LSCGImmersiveOption;
    Speech: LSCGImmersiveOption;
    Restrained: LSCGImmersiveOption;
    Eyes: LSCGImmersiveOption;
    Emoticon: LSCGImmersiveOption;
}

export abstract class BaseState {
    Type: LSCGState = "none";
    Restrictions: StateRestrictions = <StateRestrictions>{
        Walk: "false",
        Stand: "false",
        Hearing: "false",
        Sight: "false",
        Wardrobe: "false",
        Move: "false",
        Speech: "false"
    };

    _state : StateModule | undefined;
    get StateModule() {
        if (!this._state)
            this._state = getModule<StateModule>("StateModule");
        return this._state;
    }

    get config(): StateConfig {
        return this.StateModule.getStateSetting(this.Type);
    }

    get extensions(): any {
        if (!this.config.extensions)
            this.config.extensions = {};
        return this.config.extensions;
    }

    getConfigValue(key: string): string {
        return this.extensions[key];
    }

    setConfigValue(key: string, val: string | null): void {
        if (!val)
            delete this.extensions[key];
        else
            this.extensions[key] = val;
    }

    get Active(): boolean {
        return this.config.active;
    }

    constructor(stateModule: StateModule) {
        this._state = stateModule;
    }

    Activate(memberNumber?: number, duration?: number, emote?: boolean): BaseState | undefined {
        this.config.active = true;
        this.config.activatedAt = new Date().getTime();
        this.config.activatedBy = memberNumber ?? -1;
        this.config.activationCount++;
        this.config.duration = duration;

        settingsSave(true);
        return this;
     }

    Recover(emote?: boolean): BaseState | undefined {
        if (emote) SendAction(`%NAME%'s ${this.Type} state wears off.`)
        this.config.active = false;
        this.config.recoveredAt = new Date().getTime();
        settingsSave(true);
        return this;
    }

    Tick(now: number): void {
        if (!!this.config.duration && this.config.duration > 0) {
            let isExpired = this.Active && this.config.activatedAt + this.config.duration < now;
            if (isExpired)
                this.Recover(true);
        }
    }

    Safeword(): void {
        this.Recover(false);
    }

    abstract Icon(C: OtherCharacter): string;
    abstract Label(C: OtherCharacter): string;

    abstract Init(): void;
    abstract RoomSync(): void;
    abstract SpeechBlock(): void;
}