import { ModuleCategory } from "Settings/setting_definitions";
import { PairedBaseState } from "./PairedBaseState";
import { hookFunction, sendLSCGCommandBeep } from "utils";

export class OrgasmSiphonedState extends PairedBaseState {
    Type: LSCGState = "orgasm-siphoned";

    Update(source: number, args: {name: string, value: any}[]): void {
        if (!!Player.ArousalSettings) Player.ArousalSettings.Progress = 100;
        ActivityOrgasmPrepare(Player);
    }

    Init(): void {
        hookFunction("ActivityOrgasmStart", 1, (args, next) => {
            // Intercept an orgasm, force it to ruin and send command to paired target
            let C = args[0] as Character;
            if (!C.IsPlayer())
                return next(args);
                
            let siphonTargets = this.Pairings.filter(p => p.IsSource);
            if (siphonTargets.length > 0) {
                siphonTargets.forEach(p => {
                    sendLSCGCommandBeep(p.PairedMember, "pairing-update", [
                        {
                            name: "type",
                            value: this.Type
                        }
                    ])
                })
                ActivityOrgasmRuined = true;
            }
            
            return next(args);
        }, ModuleCategory.States);
    }

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}
}