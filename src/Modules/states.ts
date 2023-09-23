import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { ICONS, LSCG_SendLocal, SendAction, getRandomInt, hookFunction, mouseTooltop, removeAllHooksByModule } from "../utils";
import { StateConfig, StateSettingsModel } from "Settings/Models/states";
import { HypnoState } from "./States/HypnoState";
import { SleepState } from "./States/SleepState";
import { BaseState, StateRestrictions } from "./States/BaseState";
import { HornyState } from "./States/HornyState";
import { BlindState } from "./States/BlindState";
import { DeafState } from "./States/DeafState";
import { FrozenState } from "./States/FrozenState";
import { GaggedState } from "./States/GaggedState";
import { RedressedState } from "./States/RedressedState";
import { ArousalPairedState } from "./States/ArousalPairedState";
import { PairedBaseState } from "./States/PairedBaseState";
import { OrgasmSiphonedState } from "./States/OrgasmSiphonedState";
import { getModule } from "modules";
import { ItemUseModule } from "./item-use";

interface StateIcon {
    Label: string;
    Icon: string;
}

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

    safeword(): void {
        this.States.forEach(s => s.Safeword());
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
    GaggedState: GaggedState;
    RedressedState: RedressedState;
    ArousalPairedState: ArousalPairedState;
    OrgasmSiphonedState: OrgasmSiphonedState;

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
        this.GaggedState = new GaggedState(this);
        this.RedressedState = new RedressedState(this);
        this.ArousalPairedState = new ArousalPairedState(this);
        this.OrgasmSiphonedState = new OrgasmSiphonedState(this);

        this.States = [
            this.SleepState, 
            this.FrozenState, 
            this.HypnoState, 
            this.GaggedState,
            this.BlindState, 
            this.DeafState, 
            this.HornyState,
            this.RedressedState,
            this.ArousalPairedState,
            this.OrgasmSiphonedState
        ];
        
        // States module in general is always enabled. Toggling is done on each specific state.
        this.settings.enabled = true;
    }

    _tickCheck: number = 0;
    _tickInterval: number = 1000; // ever second

    load(): void {
        hookFunction("DrawStatus", 1, (args, next) => {
            const ret = next(args) as any;
            let C = args[0] as OtherCharacter;
            let CharX = args[1] as number;
            let CharY = args[2] as number;
            let Zoom = args[3] as number;
            if (
                !!C && !!C.LSCG && !!C.LSCG.StateModule &&
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                ChatRoomHideIconState === 0 &&
                MouseIn(CharX, CharY, CharX + 500 * Zoom, CharY + 1000 * Zoom)
            ) {
                let validStates = C.LSCG?.StateModule.states.filter(s => s.active);
                let validStateCound = validStates.length;
                let tooltip = undefined;
                validStates.forEach((state, ix, arr) => {
                    let iconSize = 30;
                    let xOffset = (ix+1) * 40 * Zoom;
                    let iconCoords = {
                        x: CharX + xOffset * Zoom,
                        y: CharY + 60 * Zoom,
                        w: iconSize * Zoom,
                        h: iconSize * Zoom
                    };
                    let iconCenter = {x: iconCoords.x + iconCoords.w/2, y: iconCoords.y + iconCoords.h/2}
                    let statePair = this.GetIconForState(state)
                    DrawCircle(iconCenter.x, iconCenter.y, (iconSize + 10)/2 * Zoom, 1, "Black", "White")
                    DrawImageResize(
                        statePair.Icon,
                        iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h
                    );
                    if (MouseIn(iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h)) {
                        tooltip = statePair.Label;
                    }
                });
                if (!!tooltip)
                    mouseTooltop(tooltip);
            }
            return ret;
        }, ModuleCategory.States);

        // hookFunction("ChatRoomClickCharacter", 1, (args, next) => {
        //     let C = args[0] as OtherCharacter;
        //     let CharX = args[1] as number;
        //     let CharY = args[2] as number;
        //     let Zoom = args[3] as number;
        //     let validStates = C.LSCG?.StateModule.states.filter(s => s.active);
        //     let clickHandled = false;
        //     if (
        //         !!C && !!C.LSCG && !!C.LSCG.StateModule &&
        //         typeof CharX === "number" &&
        //         typeof CharY === "number" &&
        //         typeof Zoom === "number" &&
        //         ChatRoomHideIconState === 0 &&
        //         C.IsPlayer() &&
        //         validStates.length > 0
        //     ) {
        //         validStates.forEach((state, ix, arr) => {
        //             let iconSize = 30;
        //             let xOffset = (ix+1) * 40 * Zoom;
        //             let iconCoords = {
        //                 x: CharX + xOffset * Zoom,
        //                 y: CharY + 60 * Zoom,
        //                 w: iconSize * Zoom,
        //                 h: iconSize * Zoom
        //             };
        //             if (MouseIn(iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h)) {
        //                 this.ClickResist(state);
        //             }
        //         });
        //     }
        //     if (!clickHandled)
        //         return next(args);
        // })

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
            if (type == "ChatRoomChat" && args[1].Type == "Chat" && args[1]?.Content[0] != "(") {
                let speechBlockStates = this.GetRestrictions(r => r.Speech);
                if (speechBlockStates.length > 0){
                    speechBlockStates[getRandomInt(speechBlockStates.length)].SpeechBlock();
                    return null;
                }
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

        hookFunction('Player.GetDeafLevel', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Hearing))
                return 4;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.GetBlindLevel', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Sight))
                return Player.GameplaySettings?.SensDepChatLog == "SensDepLight" ? 2 : 3;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('ChatRoomCanAttemptStand', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Stand))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('ChatRoomCanAttemptKneel', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Kneel))
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

        this.States.forEach(s => s.Init());
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.States);
    }

    GetIconForState(state: StateConfig): StateIcon {
        let stateObj = this.States.find(s => s.Type == state.type);
        if (!stateObj)
            return {
                Label: state.type,
                Icon: ICONS.BDSM
            };
        return {
            Label: stateObj.Label,
            Icon: stateObj.Icon
        };
    }

    Clear(emote: boolean) {
        this.States.forEach(s => s.Recover(emote));
    }

    IncomingUnpair(sender: number, msg: LSCGMessageModel) {
        let command = msg.command;
        let unPairType = command?.args.find(a => a.name == "type")?.value as LSCGState;
        let unPairingState = this.States.find(s => s.Type == unPairType) as PairedBaseState;
        unPairingState.RemovePairing(sender);
    }

    PairingUpdate(sender: number, msg: LSCGMessageModel) {
        if (!msg.command)
            return;
        let pairType = msg.command.args.find(a => a.name == "type")?.value as LSCGState;
        let pairingState = this.States.find(s => s.Type == pairType) as PairedBaseState;
        pairingState.Update(sender, msg.command.args);
    }
}