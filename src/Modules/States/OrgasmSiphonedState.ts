import { ModuleCategory } from "Settings/setting_definitions";
import { PairedBaseState, Pairing } from "./PairedBaseState";
import { ICONS, hookFunction, sendLSCGCommandBeep } from "utils";

export class OrgasmSiphonedState extends PairedBaseState {
    Type: LSCGState = "orgasm-siphoned";

    Icon(C: OtherCharacter): string {
        let pairings = C.LSCG?.StateModule.states.find(s => s.type == "orgasm-siphoned")?.extensions["pairings"] as Pairing[] ?? [];
        if (pairings.some(p => p.IsSource))
            return "Assets/Female3DCG/Emoticon/Annoyed/Icon.png";
        else
            return "Assets/Female3DCG/Emoticon/Tear/Icon.png";
    }
    Label(C: OtherCharacter): string {
        return "Orgasms Siphoned";
    }

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