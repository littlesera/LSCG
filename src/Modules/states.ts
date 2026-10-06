import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { ICONS, LSCG_SendLocal, LSCG_TEAL, SVG_ICONS, getRandomInt, hookFunction, mouseTooltip, removeAllHooksByModule } from "../utils";
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
import { ResizedState } from "./States/ResizedState";
import { BuffedState } from "./States/BuffedState";
import { BarrierState } from "./States/BarrierState";
import { PolymorphedState } from "./States/PolymorphedState";
import { XRayVisionState } from "./States/XRayVisionState";
import { DeniedState } from "./States/DeniedState";
import { parseInt } from "lodash-es";
import { CursedItemState } from "./States/CursedItemState";
import { AstralProjectionState } from "./States/AstralProjectionState";
import { SpellEffectsState } from "./States/SpellEffectsState";

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
            states: [],
        };
    }

    safeword(): void {
        this.States.forEach(s => s.Safeword());
    }

    getStateSetting(type: LSCGState): StateConfig {
        let config = this.settings.states.find(s => s.type == type);
        if (!config) {
            config = <StateConfig>{
                type: type,
                active: false,
                activationCount: 0,
                extensions: {},
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
    CursedItemState: CursedItemState;
    AstralProjectionState: AstralProjectionState;
    SpellEffectsState: SpellEffectsState;

    GetRestriction(state: BaseState, restriction: LSCGImmersiveOption): boolean {
        // Restriction first, it's cheap: Active looks the state's config up every time
        return (restriction === "whenImmersive" ? this.settings.immersive : restriction === "true") &&
               state.Active;
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
        this.CursedItemState = new CursedItemState(this);
        this.AstralProjectionState = new AstralProjectionState(this);
        this.SpellEffectsState = new SpellEffectsState(this);

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
            this.XRayState,
            this.CursedItemState,
            this.AstralProjectionState,
            this.SpellEffectsState,
        ];
        
        // States module in general is always enabled. Toggling is done on each specific state.
        this.settings.enabled = true;
    }

    _tickCheck: number = 0;
    _tickInterval: number = 1000; // tick states every second

    load(): void {
        hookFunction("DrawStatus", 11, (args, next) => { // Pri 11 to bump above BCX hook
            const ret = next(args);
            const C = args[0] as OtherCharacter;
            const CharX = args[1] as number;
            const CharY = args[2] as number;
            const Zoom = args[3] as number;
            if (
                !!C && !!C.LSCG && !!C.LSCG.StateModule &&
                typeof CharX === "number" &&
                typeof CharY === "number" &&
                typeof Zoom === "number" &&
                ChatRoomHideIconState === 0 &&
                MouseIn(CharX, CharY, 500 * Zoom, 1000 * Zoom)
            ) {
                const validStates = C.LSCG?.StateModule.states.filter(s => s.active) ?? [];
                if (!validStates.length) return ret;
                let tooltip = undefined;
                const lineWidth = ChatRoomCharacterViewCharacterCount > 5 ? 1 : 2;
                validStates.forEach((state, ix, arr) => {
                    const durationEnabled = (state.duration ?? 0) > 0;
                    const iconSize = 30;
                    const yOffset = (ix+1) * 40;
                    const iconCoords = {
                        x: CharX + 80 * Zoom,
                        y: CharY + ((60 + yOffset) * Zoom),
                        w: iconSize * Zoom,
                        h: iconSize * Zoom,
                    };
                    const iconCenter = {x: iconCoords.x + iconCoords.w/2, y: iconCoords.y + iconCoords.h/2};
                    const statePair = this.GetIconForState(state, C);
                    DrawCircle(iconCenter.x, iconCenter.y, (iconSize + 10)/2 * Zoom, lineWidth, "Black", "White");
                    DrawImageResize(
                        statePair.Icon,
                        iconCoords.x, iconCoords.y, iconCoords.w, iconCoords.h,
                    );
                    if (durationEnabled) {
                        const lengthActive = Math.max(1, (CommonTime() - state.activatedAt));
                        const durationPercentage = 1 - (lengthActive / Math.max((state.duration ?? 0), lengthActive));
                        const barH = iconCoords.h * durationPercentage;
                        const barY = iconCoords.y + (iconCoords.h - barH);
                        const barXOffset = 10 * Zoom;
                        const barW = 10;
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
                if (tooltip)
                    mouseTooltip(tooltip);
            }
            return ret;
        }, ModuleCategory.States);

        // General Hooks
        hookFunction("ChatRoomSync", 10, (args, next) => {
            const ret = next(args);
            if (!this.Enabled)
                return ret;
            
            this.States.forEach(s => s.RoomSync());
            return ret;
        }, ModuleCategory.States);

        hookFunction("ServerSend", 5, (args, next) => {
            if (!this.Enabled)
                return next(args);

            const type = args[0];
            const data = args[1] as ServerChatRoomMessage;
            if (type == "ChatRoomChat" && data.Type == "Chat" && data?.Content[0] != "(") {
                const speechBlockStates = this.GetRestrictions(r => r.Speech);
                if (speechBlockStates.length > 0){
                    speechBlockStates[getRandomInt(speechBlockStates.length)].SpeechBlock();
                    return null;
                }
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("TimerProcess", 10, (args, next) => {
            if (ActivityAllowed() && this.Enabled) {
                const now = CommonTime();
                if (this._tickCheck < now) {
                    this._tickCheck = now + this._tickInterval;
                    this.States.forEach(s => s.Tick(now));
                }
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.CanTalk", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Speech))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.CanWalk", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Walk))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.CanChangeClothesOn", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Wardrobe))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.GetDeafLevel", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Hearing))
                return 4;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.GetBlindLevel", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Sight))
                return Player.GameplaySettings?.SensDepChatLog == "SensDepLight" ? 2 : 3;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.CanInteract", 1, (args, next) => {
            if (this.Enabled && (this.AnyRestrictions(r => r.Move) || this.AnyRestrictions(r => r.Touch)))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("InventoryGroupIsBlockedForCharacter", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Move))
                return true;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("ChatRoomCanAttemptStand", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Stand))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("ChatRoomCanAttemptKneel", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Kneel))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("CharacterCanKneel", 1, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Kneel))
                return false;
            return next(args);
        }, ModuleCategory.States);

        hookFunction("PoseCanChangeUnaided", 6, (args, next) => {
            if (this.Enabled && this.AnyRestrictions(r => r.Move)) {
                return false;
            }
            return next(args);
        }, ModuleCategory.States);

        (DialogSelfMenuMapping.Expression.clickStatusCallbacks as Record<string, unknown>).lscg = (C: Character, clickedExpression: { Group: string; }) => {
            if (clickedExpression.Group !== "Emoticon" && this.AnyRestrictions(r => r.Move)) {
                return "Movement restricted by LSCG";
            }

            switch (clickedExpression.Group) {
                case "Eyes":
                    return this.AnyRestrictions(r => r.Eyes) ? "Eyes restricted by LSCG" : null;
                case "Emoticon":
                    return this.AnyRestrictions(r => r.Emoticon) ? "Emoticon restricted by LSCG" : null;
                default:
                    return null;
            }
        };

        const menubarValidator = () => {
            if (this.AnyRestrictions(r => r.Move)) {
                return { state: "disabled", status: "Movement restricted by LSCG" } as const;
            } else if (this.AnyRestrictions(r => r.Eyes)) {
                return { state: "disabled", status: "Eyes restricted by LSCG" } as const;
            } else {
                return null;
            }
        };
        (DialogSelfMenuMapping.Expression.menubarEventListeners.blink.validate ??= {}).lscg = menubarValidator;
        (DialogSelfMenuMapping.Expression.menubarEventListeners.clear.validate ??= {}).lscg = menubarValidator;

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

    get commands(): ICommand[] {
		return [
            <ICommand>{
                Tag: "wake",
                Description: ": wake up from slumber",
                Action: () => {
                    if (!this.Enabled)
                        return;
    
                    if (this.settings.immersive) {
                        if (!this.SleepState.config.duration) {
                            LSCG_SendLocal("Cannot immediately wake while immersive, timer set...");
                            this.SleepState.config.duration = (2 + getRandomInt(8)) * 60 * 1000; // timeout set to between 2 and 10 minutes.
                        } else {
                            LSCG_SendLocal("Wake disabled while immersive, a timer is set, you will eventually wake up...");
                        }
                        return;
                    }

                    if (this.SleepState.Active)
                        this.SleepState.Recover(true);
                },
            }, <ICommand>{
                Tag: "sleep",
                Description: "[minutes]: fall asleep (default 10 minutes)",
                Action: (args, msg, parsed) => {
                    if (!this.Enabled)
                        return;
                    
                    const duration = parseInt(parsed[0] ?? "10") ?? 10;

                    if (!this.SleepState.Active)
                        this.SleepState.Activate(Player.MemberNumber, duration * (60 * 1000), true);
                },
            },
        ];
	}

    GetIconForState(state: StateConfig, C: OtherCharacter): StateIcon {
        const stateObj = this.States.find(s => s.Type == state.type);
        if (!stateObj)
            return {
                Label: state.type,
                Icon: ICONS.BDSM,
            };
        return {
            Label: stateObj.Label(C),
            Icon: stateObj.Icon(C),
        };
    }

    Clear(emote: boolean, magical: boolean = false) {
        this.States.forEach(s => s.RecoverFor(magical ? "dispel" : "manual", emote));
    }

    IncomingUnpair(sender: number, msg: LSCGMessageModel) {
        const command = msg.command;
        const unPairType = command?.args.find(a => a.name == "type")?.value as LSCGState;
        const unPairingState = this.States.find(s => s.Type == unPairType) as PairedBaseState;
        unPairingState.RemovePairing(sender);
    }

    PairingUpdate(sender: number, msg: LSCGMessageModel) {
        if (!msg.command)
            return;
        const pairType = msg.command.args.find(a => a.name == "type")?.value as LSCGState;
        const pairingState = this.States.find(s => s.Type == pairType) as PairedBaseState;
        pairingState.Update(sender, msg.command.args);
    }
}