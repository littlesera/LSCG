import { StateModule } from "Modules/states";
import { PairedBaseState } from "./PairedBaseState";
import { getCharacter, hookFunction, sendLSCGCommandBeep } from "utils";
import { ModuleCategory } from "Settings/setting_definitions";

export class ArousalPairedState extends PairedBaseState {
    Type: LSCGState = "arousal-paired";
    
    Icon(C: OtherCharacter): string {
        return "Assets/Female3DCG/Emoticon/Hearts/Icon.png";
    }
    Label(C: OtherCharacter): string {
        return "Arousal Paired";
    }

    Update(source: number, args: {name: string, value: any}[]): void {
        let progress = args.find(a => a.name == "progress")?.value as number;
        if (!Player.ArousalSettings || typeof progress !== "number")
            return;
        Player.ArousalSettings.ProgressTimer = 0;
        Player.ArousalSettings.Progress = this._prevArousalProgress = progress;
        if (progress == 100)
            ActivityOrgasmPrepare(Player);
        if (CurrentScreen == "ChatRoom")
		    ServerSend("ChatRoomCharacterArousalUpdate", { 
                OrgasmTimer: Player.ArousalSettings.OrgasmTimer!, 
                Progress: Player.ArousalSettings.Progress, 
                ProgressTimer: Player.ArousalSettings.ProgressTimer, 
                OrgasmCount: Player.ArousalSettings.OrgasmCount! 
            });
        console.debug(`Arousal updated from ${source} to ${progress}`);
    }

    Init(): void {}

    PingArousal() {
        let isSiphoned = this.StateModule.OrgasmSiphonedState.Pairings.filter(p => p.IsSource).length > 0;
        let progress = Math.min(Player.ArousalSettings?.Progress ?? 0, isSiphoned ? 99 : 100);
        this.Pairings.forEach(p => {
            sendLSCGCommandBeep(p.PairedMember, "pairing-update", [
                {
                    name: "type",
                    value: this.Type
                }, {
                    name: "progress",
                    value: progress
                }
            ])
        })
    }

    _prevArousalProgress: number = 0;
    Tick(now: number) {
        let currentArousalProgress = Player.ArousalSettings?.Progress ?? 0;
        if (currentArousalProgress != this._prevArousalProgress) {
            this._prevArousalProgress = currentArousalProgress
            this.PingArousal();
        }
        super.Tick(now);
    }

    RoomSync(): void {}

    SpeechBlock(): void {}
}