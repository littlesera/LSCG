import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { hookFunction, OnActivity, removeAllHooksByModule } from "../utils";

export class MiscModule extends BaseModule {
    load(): void {
        // Kneel on lap sit
        OnActivity(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
            let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
            if (!!target && 
                sender?.MemberNumber == Player.MemberNumber && 
                data.Content == "ChatOther-ItemLegs-Sit" &&
                CharacterCanChangeToPose(Player, "Kneel")) {
                CharacterSetActivePose(Player, "Kneel");
            }
        });

        // Blur while edged
        hookFunction("Player.GetBlurLevel", 1, (args, next) => {
            if (Player.IsEdged() && Player.LSCG.GlobalModule.edgeBlur) {
                if ((Player.ArousalSettings?.Progress ?? 0) > 90)
                    return 6;
                else if ((Player.ArousalSettings?.Progress ?? 0) > 75)
                    return 4;
                else if ((Player.ArousalSettings?.Progress ?? 0) > 50)
                    return 1;
            }
            return next(args);
        }, ModuleCategory.Misc);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Misc);
    }
}