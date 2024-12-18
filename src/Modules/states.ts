import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { ICONS, LSCG_SendLocal, LSCG_TEAL, SVG_ICONS, SendAction, drawSvg, getRandomInt, hookFunction, mouseTooltip, removeAllHooksByModule } from "../utils";
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
import { ResizedState } from "./States/ResizedState";
import { BuffedState } from "./States/BuffedState";
import { BarrierState } from "./States/BarrierState";
import { PolymorphedState } from "./States/PolymorphedState";
import { XRayVisionState } from "./States/XRayVisionState";
import { DeniedState } from "./States/DeniedState";

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
    DeniedState: DeniedState;
    BlindState: BlindState;
    DeafState: DeafState;
    FrozenState: FrozenState;
    GaggedState: GaggedState;
    ResizedState: ResizedState;
    RedressedState: RedressedState;
    PolymorphedState: PolymorphedState;
    BuffedState: BuffedState;
    BarrierState: BarrierState;
    ArousalPairedState: ArousalPairedState;
    OrgasmSiphonedState: OrgasmSiphonedState;
    XRayState: XRayVisionState;

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
        this.DeniedState = new DeniedState(this);
        this.BlindState = new BlindState(this);
        this.DeafState = new DeafState(this);
        this.FrozenState = new FrozenState(this);
        this.GaggedState = new GaggedState(this);
        this.ResizedState = new ResizedState(this);
        this.RedressedState = new RedressedState(this);
        this.PolymorphedState = new PolymorphedState(this);
        this.BuffedState = new BuffedState(this);
        this.BarrierState = new BarrierState(this);
        this.ArousalPairedState = new ArousalPairedState(this);
        this.OrgasmSiphonedState = new OrgasmSiphonedState(this);
        this.XRayState = new XRayVisionState(this);

        this.States = [
            this.SleepState, 
            this.FrozenState, 
            this.HypnoState, 
            this.GaggedState,
            this.BlindState, 
            this.DeafState, 
            this.HornyState,
            this.DeniedState,
            this.RedressedState,
            this.PolymorphedState,
            this.ResizedState,
            this.ArousalPairedState,
            this.OrgasmSiphonedState,
            this.BuffedState,
            this.BarrierState,
            this.XRayState
        ];
        
        // States module in general is always enabled. Toggling is done on each specific state.
        this.settings.enabled = true;
    }

    _tickCheck: number = 0;
    _tickInterval: number = 1000; // ever second

    load(): void {
        hookFunction("DrawStatus", 11, (args, next) => { // Pri 11 to bump above BCX hook
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
                MouseIn(CharX, CharY, 500 * Zoom, 1000 * Zoom)
            ) {
                let validStates = C.LSCG?.StateModule.states.filter(s => s.active);
                let validStateCount = validStates.length;
                let tooltip = undefined;
                let lineWidth = ChatRoomCharacterViewCharacterCount > 5 ? 1 : 2;
                validStates.forEach((state, ix, arr) => {
                    let durationEnabled = (state.duration ?? 0) > 0;
                    let iconSize = 30;
                    let yOffset = (ix+1) * 40;
                    let iconCoords = {
                        x: CharX + 80 * Zoom,
                        y: CharY + ((60 + yOffset) * Zoom),
                        w: iconSize * Zoom,
                        h: iconSize * Zoom
                    };
                    let iconCenter = {x: iconCoords.x + iconCoords.w/2, y: iconCoords.y + iconCoords.h/2}
                    let statePair = this.GetIconForState(state, C)
                    DrawCircle(iconCenter.x, iconCenter.y, (iconSize + 10)/2 * Zoom, lineWidth, "Black", "White");
                    DrawImageResize(
                        statePair.Icon,
                        iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h
                    );
                    if (durationEnabled) {
                        let lengthActive = Math.max(1, (CommonTime() - state.activatedAt));
                        let durationPercentage = 1 - (lengthActive / Math.max((state.duration ?? 0), lengthActive));
                        let timeRemainingInMin = Math.max(0, Math.floor(((state.duration ?? 0) - lengthActive)/(60*1000)));
                        let barH = iconCoords.h * durationPercentage;
                        let barY = iconCoords.y + (iconCoords.h - barH);
                        let barXOffset = 10 * Zoom;
                        let barW = 10;
                        DrawRect(iconCoords.x + iconCoords.w + barXOffset, iconCoords.y, barW * Zoom, iconCoords.h, "White");
                        DrawRect(iconCoords.x + iconCoords.w + barXOffset, barY, barW * Zoom, barH, LSCG_TEAL);
                        DrawEmptyRect(iconCoords.x + iconCoords.w + barXOffset, iconCoords.y, barW * Zoom, iconCoords.h, "Black", lineWidth);
                        // if (MouseIn(iconCoords.x + iconCoords.w + barXOffset, iconCoords.y, barW * Zoom, iconCoords.h))
                        //     tooltip = `${timeRemainingInMin} min. remain`;
                    }
                    if (MouseIn(iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h)) {
                        tooltip = statePair.Label;
                    }
                });
                if (!!tooltip)
                    mouseTooltip(tooltip);
            }
            return ret;
        }, ModuleCategory.States);

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

        hookFunction('Player.CanTalk', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Speech))
                return false;
            return next(args);
        }, ModuleCategory.States)

        hookFunction('Player.CanWalk', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Walk))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.CanChangeClothesOn', 1, (args, next) => {
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

        hookFunction('Player.CanInteract', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Move))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('InventoryGroupIsBlockedForCharacter', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Move))
                return true;
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

        hookFunction('CharacterCanKneel', 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Kneel))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('PoseCanChangeUnaided', 6, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Move)) {
                return;
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("DialogClickExpressionMenu", 5, (args, next) => {
            const eyes = DialogFacialExpressions.findIndex(a => a.Appearance.Asset.Group.Name === "Eyes");
            const emoticon = DialogFacialExpressions.findIndex(a => a.Appearance.Asset.Group.Name === "Emoticon");
            const allExceptEmoticon = DialogFacialExpressions.filter((exp, ix, arr) => ix !== emoticon).map(exp => DialogFacialExpressions.indexOf(exp));
            let eyeChangeButton = [20, 185 + 100 * eyes, 90, 90];
            let emoticonChangeButton = [20, 185 + 100 * emoticon, 90, 90];
            let clearExpButton = [20, 50, 90, 90];
            let winkButton = [120, 50, 90, 90];
            
            let eyeBlockMousePos = [eyeChangeButton, winkButton, clearExpButton];
            let expressionButtonsOtherThanEmoticon = allExceptEmoticon.map(ix => [20, 185 + 100 * ix, 90, 90]);
            let moveBlockMousePos = expressionButtonsOtherThanEmoticon.concat(eyeBlockMousePos).filter((val, ix, arr) => arr.indexOf(val) == ix);

            const eyeBlock = this.AnyRestrictions(r => r.Eyes) && eyeBlockMousePos.some(arr => MouseIn(arr[0], arr[1], arr[2], arr[3]));
            const moveBlock = this.AnyRestrictions(r => r.Move) && moveBlockMousePos.some(arr => MouseIn(arr[0], arr[1], arr[2], arr[3]));;
            const emoticonBlock = this.AnyRestrictions(r => r.Emoticon) && MouseIn(emoticonChangeButton[0], emoticonChangeButton[1], emoticonChangeButton[2], emoticonChangeButton[3]);
            if (this.Enabled && (moveBlock || eyeBlock || emoticonBlock)) {
                return;
            }
            return next(args);
        }, ModuleCategory.States);        

        hookFunction("DialogFacialExpressionsLoad", 5, (args, next) => {
            const eyeBlock = this.AnyRestrictions(r => r.Eyes);
            const moveBlock = this.AnyRestrictions(r => r.Move);
            if (this.Enabled && (eyeBlock || moveBlock)) {
                return;
            }
            return next(args);
        }, ModuleCategory.States);

        this.States.forEach(s => s.Init());
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.States);
    }

    GetIconForState(state: StateConfig, C: OtherCharacter): StateIcon {
        let stateObj = this.States.find(s => s.Type == state.type);
        if (!stateObj)
            return {
                Label: state.type,
                Icon: ICONS.BDSM
            };
        return {
            Label: stateObj.Label(C),
            Icon: stateObj.Icon(C)
        };
    }

    Clear(emote: boolean, magical: boolean = false) {
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