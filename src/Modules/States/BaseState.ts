import { StateModule } from "Modules/states";
import { StateConfig } from "Settings/Models/states";
import { getModule } from "modules";
import { SendAction, getRandomInt, settingsSave } from "utils";



export interface StateRestrictions {
    Walk: LSCGImmersiveOption;
    Stand: LSCGImmersiveOption;
    Hearing: LSCGImmersiveOption;
    Sight: LSCGImmersiveOption;
    Wardrobe: LSCGImmersiveOption;
    CharacterAccess: LSCGImmersiveOption;
    Speech: LSCGImmersiveOption;
    
}

export abstract class BaseState {
    Type: LSCGState = "none";
    Restrictions: StateRestrictions = <StateRestrictions>{
        Walk: "false",
        Stand: "false",
        Hearing: "false",
        Sight: "false",
        Wardrobe: "false",
        CharacterAccess: "false",
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

    get Active(): boolean {
        return this.config.active;
    }

    constructor(stateModule: StateModule) {
        this._state = stateModule;
    }

    Activate(memberNumber?: number, emote?: boolean) {
        this.config.active = true;
        this.config.activatedAt = new Date().getTime();
        this.config.activatedBy = memberNumber ?? -1;
        this.config.activationCount++;
        settingsSave(true);
     }

    Recover(emote?: boolean): void {
        this.config.active = false;
        this.config.recoveredAt = new Date().getTime();
        settingsSave(true);
    }
    
    abstract Init(): void;
    abstract Tick(now: number): void;
    abstract RoomSync(): void;
    abstract SpeechBlock(): void;
}