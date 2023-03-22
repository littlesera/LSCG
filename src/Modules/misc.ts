import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, removeAllHooksByModule } from "../utils";

export class MiscModule extends BaseModule {
    load(): void {
        OnActivity(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
            if (!!target && 
                sender?.MemberNumber == Player.MemberNumber && 
                data.Content == "ChatOther-ItemLegs-Sit" &&
                CharacterCanChangeToPose(Player, "Kneel")) {
                CharacterSetActivePose(Player, "Kneel");
            }
        });
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Misc);
    }
}