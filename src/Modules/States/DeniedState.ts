import { hookFunction } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class DeniedState extends BaseState {
    Type: LSCGState = "denied";

    Icon(C: OtherCharacter): string {
        return "Icons/Small/Admin.png";
    }
    Label(C: OtherCharacter): string {
        return "Denied";
    }

    constructor(state: StateModule) {
        super(state);
    }

    Init(): void {
        hookFunction("ActivityOrgasmStart", 100, (args, next) => { // high high priority
            // Intercept an orgasm, force it to ruin and send command to paired target
            let C = args[0] as Character;
            if (!C.IsPlayer())
                return next(args);

            if (this.Active) {
                ActivityOrgasmRuined = true;
            }
            
            return next(args);
        }, ModuleCategory.States);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}