import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { LSCG_SendLocal, hookFunction, removeAllHooksByModule } from "../utils";
import { StateConfig, StateSettingsModel } from "Settings/Models/states";
import { HypnoState } from "./States/HypnoState";
import { SleepState } from "./States/SleepState";
import { BaseState, StateRestrictions } from "./States/BaseState";
import { HornyState } from "./States/HornyState";
import { BlindState } from "./States/BlindState";
import { DeafState } from "./States/DeafState";
import { FrozenState } from "./States/FrozenState";

export class StateModule extends BaseModule {
    // get settingsScreen(): Subscreen | null {
    //     return GuiStates;
    // }

    get settings(): StateSettingsModel {
        return super.settings as StateSettingsModel;
	}

    get defaultSettings() {
        return <StateSettingsModel>{
            enabled: true,
            immersive: false,
            states: []
        };
    }

    getStateSetting(type: LSCGState): StateConfig {
        var config = this.settings.states.find(s => s.type == type);
        if (!config) {
            config = <StateConfig>{
                type: type,
                active: false,
                activationCount: 0,
                extensions: {}
            };
            this.settings.states.push(config);
        }
        return config;
    }

    // States
    States: BaseState[];
    SleepState: SleepState;
    HypnoState: HypnoState;
    HornyState: HornyState;
    BlindState: BlindState;
    DeafState: DeafState;
    FrozenState: FrozenState;

    GetRestriction(state: BaseState, restriction: LSCGImmersiveOption): boolean {
        return state.Active &&
               (restriction == "whenImmersive" ? this.settings.immersive : restriction == "true");
    }

    GetRestrictions(getter: (r: StateRestrictions) => LSCGImmersiveOption): BaseState[] {
        return this.States.filter(s => this.GetRestriction(s, getter(s.Restrictions)));
    }

    AnyRestrictions(getter: (r: StateRestrictions) => LSCGImmersiveOption): boolean {
        return this.States.some(s => this.GetRestriction(s, getter(s.Restrictions)));
    }

    constructor() {
        super();
        this.SleepState = new SleepState(this);
        this.HypnoState = new HypnoState(this);
        this.HornyState = new HornyState(this);
        this.BlindState = new BlindState(this);
        this.DeafState = new DeafState(this);
        this.FrozenState = new FrozenState(this);

        this.States = [this.SleepState, this.FrozenState, this.HypnoState, this.BlindState, this.DeafState, this.HornyState];
        
        // States module in general is always enabled. Toggling is done on each specific state.
        this.settings.enabled = true;
    }

    _tickCheck: number = 0;
    _tickInterval: number = 1000; // ever second

    load(): void {
        // General Hooks
        hookFunction("ChatRoomSync", 10, (args, next) => {
            next(args);
            if (!this.Enabled)
                return;
            
            this.States.forEach(s => s.RoomSync());
        }, ModuleCategory.States);

        hookFunction('ServerSend', 5, (args, next) => {
            if (!this.Enabled)
                return next(args);

            let type = args[0];
            let speechBlockStates = this.GetRestrictions(r => r.Speech);
            if (speechBlockStates.length > 0 && type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "("){
                speechBlockStates[0].SpeechBlock();
                return null;
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction('TimerProcess', 10, (args, next) => {
            if (ActivityAllowed() && this.Enabled) {
                var now = CommonTime();
                if (this._tickCheck < now) {
                    this._tickCheck = now + this._tickInterval;
                    this.States.forEach(s => s.Tick(now));
                }
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Walk))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.CanChangeOwnClothes', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Wardrobe))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.IsDeaf', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Hearing))
                return true;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.IsBlind', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Sight))
                return true;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('ChatRoomCanAttemptStand', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Stand))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
            let accessBlockedStates = this.GetRestrictions(r => r.CharacterAccess);
            if (this.Enabled && accessBlockedStates.length > 0) {
                LSCG_SendLocal(`Character access blocked while ${accessBlockedStates[0].Type}.`, 5000);
                return;
            }
            return next(args);
        }, ModuleCategory.States);

        this.HypnoState.Init();
        this.SleepState.Init();
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.States);
    }
}