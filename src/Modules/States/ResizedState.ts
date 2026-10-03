import { ICONS, SendAction, hookFunction } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class ResizedState extends BaseState {
    Type: LSCGState = "resized";

    get enlarged(): boolean {
        return this.config.extensions["enlarged"] as boolean;
    }
    set enlarged(val: boolean) {
        this.config.extensions["enlarged"] = val;
    }

    Icon(C: OtherCharacter): string {
        const isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? ICONS.EXPAND : "";//ICONS.SHRINK;
    }
    Label(C: OtherCharacter): string {
        const isEnlarge = C.LSCG?.StateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] as boolean ?? false;
        return isEnlarge ? "Enlarged" : "";//"Shrunk";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Enlarge(MemberNumber?: number, duration?: number, emote?: boolean): BaseState {
        if (this.Active && !this.enlarged)
            this.Recover(true);
        else {
            this.enlarged = true;
            if (emote) SendAction("%NAME%'s body reshapes and grows to twice its size.");
            this.Activate(MemberNumber, duration, emote);
        }
        return this;
    }

    // Reduce(MemberNumber?: number, duration?: number, emote?: boolean): BaseState {
    //     if (this.Active && this.enlarged)
    //         this.Recover(true);
    //     else {
    //         this.enlarged = false;
    //         if (emote) SendAction(`%NAME%'s body reshapes and shrinks to half its size.`);
    //         this.Activate(MemberNumber, duration, emote);
    //     }
    //     return this;
    // }

    Activate(memberNumber?: number | undefined, duration?: number, emote?: boolean | undefined): BaseState | undefined {
        this.config.extensions["originalHeightRatio"] = Player.HeightRatio;
        return super.Activate(memberNumber, duration, emote);
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        if (emote && this.Active) SendAction("%NAME%'s body returns to its normal size.");
        return super.Recover(false);
    }

    Init(): void {
        // Force recover if shrunk on init.
        if (this.Active && !this.enlarged) {
            this.Recover(false);
        }

        hookFunction("CharacterAppearanceGetCurrentValue", 1, (args, next) => {
            const [C, Group, Type] = args as [C: OtherCharacter, Group: AssetGroupName, Type: keyof CharacterAppearanceValues];
            const ret = next(args);
            if (Player.LSCG?.GlobalModule?.hideResizing || Group !== "Height" || Type !== "Zoom")
                return ret;

            if ((Player.VisualSettings?.ForceFullHeight ?? false) || !C || !C.LSCG || !C.LSCG.StateModule || !!CurrentCharacter)
                return ret;

            let zoom: number = ret === "None" ? 1 : ret as number;
            const stateModule = C.LSCG.StateModule;
            if (stateModule.states.find(s => s.type == "resized")?.active) {
                const enlarge = stateModule.states.find(s => s.type == "resized")?.extensions["enlarged"] ?? false;
                zoom *= enlarge ? 1.5 : 1;//.75;
            }
            return zoom;
        }, ModuleCategory.States);

        hookFunction("CommonDrawAppearanceBuild", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            const height = CharacterAppearanceGetCurrentValue(C, "Height", "Zoom");
            if (height !== "None") C.HeightRatio = height;
            // Hack fix in case the body style was actually removed
            if (InventoryGet(C, "BodyStyle") == null) {
                InventoryWear(C, "Original", "BodyStyle");
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("DrawCharacter", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            const height = CharacterAppearanceGetCurrentValue(C, "Height", "Zoom");
            if (height !== "None") C.HeightRatio = height;
            return next(args);
        }, ModuleCategory.States);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}