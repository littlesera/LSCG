import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { GetTargetCharacter, IsIncapacitated, OnActivity, SendAction, getRandomInt, hookFunction, removeAllHooksByModule, setOrIgnoreBlush, settingsSave } from "../utils";
import { MiscModule } from "./misc";
import { StateConfig, StateSettingsModel } from "Settings/Models/states";
import { HypnoModule } from "./hypno";
import { HypnoState } from "./States/HypnoState";

export class StateModule extends BaseModule {
    
    get settings(): StateSettingsModel {
        return super.settings as StateSettingsModel;
	}

    get defaultSettings() {
        return <StateSettingsModel>{
            enabled: false,
            states: []
        };
    }

    getStateSetting(type: LSCGState): StateConfig {
        var config = this.settings.states.find(s => s.type == type);
        if (!config) {
            config = <StateConfig>{
                type: type,
                active: false,
                extensions: {}
            };
            this.settings.states.push(config);
        }
        return config;
    }

    // States
    HypnoState: HypnoState;

    constructor() {
        super();
        this.HypnoState = new HypnoState(this);
    }

    _tickCheck: number = 0;
    _tickInterval: number = 1000; // ever second

    load(): void {
        if (!this.HypnoState)
            this.HypnoState = new HypnoState(this);

        // General Hooks
        hookFunction("ChatRoomSync", 10, (args, next) => {
            next(args);
            if (!this.Enabled)
                return;
            
            let hypno = this.getStateSetting("hypnotized");
            if (!!hypno && hypno.active) {
                this.HypnoState.CheckHypnotizedState();
                this.HypnoState.IdleEmote();
            }
        }, ModuleCategory.States);

        hookFunction('TimerProcess', 10, (args, next) => {
            if (ActivityAllowed()) {
                var now = CommonTime();
                if (this._tickCheck < now) {
                    this._tickCheck = now + this._tickInterval;
                    this.HypnoState.Tick(now);
                }
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Enabled && 
                (!this.HypnoState.CanWalk))
                    return false;
            return next(args);
        }, ModuleCategory.States);

        this.HypnoState.Init();
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.States);
    }
}