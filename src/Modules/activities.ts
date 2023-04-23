import { BaseModule } from "base";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, hookFunction } from "../utils";
import { hypnoActivated } from "./hypno";

export interface ActivityTarget {
    Name: AssetGroupItemName;
    SelfAllowed?: boolean | true;
    TargetLabel?: string | undefined;
    TargetSelfLabel?: string | undefined;
    TargetAction: string;
    TargetSelfAction?: string | undefined;
}

export interface ActivityBundle {
    Activity: Activity;
    Targets: ActivityTarget[];
}

export class ActivityModule extends BaseModule {
    load(): void {
        hookFunction("ServerSend", 100, (args, next) => {
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity"){
                console.info("Activity ServerSend");
                let data = args[1];
                let actName = data.Dictionary[3]?.ActivityName ?? "";
                if (actName.indexOf("LSCG_") == 0) {
                    // Intercept custom activity send and just do a custom action instead..
                    let {metadata, substitutions} = ChatRoomMessageRunExtractors(data, Player)
                    let msg = ActivityDictionaryText(data.Content);
                    msg = CommonStringSubstitute(msg, substitutions)
                    SendAction(msg, Player);
                }
                else
                    return next(args);
            }
            else {
                return next(args);
            }

            // let act = args[1];
            // if (!act)
            //     return next(args);
            
            
        }, ModuleCategory.Activities);

        this.AddActivity({
            Activity: <Activity>{
                Name: "Hug",
                MaxProgress: 50,
                Prerequisite: ["UseArms"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemArms",
                    SelfAllowed: true,
                    TargetAction: "SourceCharacter wraps PronounPossessive arms around TargetCharacter in a big warm hug.",
                    TargetSelfAction: "SourceCharacter wraps TargetCharacter in a theraputic self-hug."
                }
            ]
        });

        this.AddActivity({
            Activity: <Activity>{
                Name: "KissEyes",
                MaxProgress: 75,
                Prerequisite: ["ZoneAccessible"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    SelfAllowed: false,
                    TargetLabel: "Kiss Eyes",
                    TargetAction: "SourceCharacter gently kisses over TargetCharacter's eyes."
                }
            ]
        });

        this.AddActivity({
            Activity: <Activity> {
                Name: "RubPenis",
                MaxProgress: 80,
                Prerequisite: ["ZoneAccessible", "ZoneNaked", "CanUsePenis", "HasPenis", "Needs-PenetrateItem"]
            },
            Targets: [
                <ActivityTarget>{
                    Name: "ItemHead",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis along TargetCharacter's face."
                }, <ActivityTarget>{
                    Name: "ItemMouth",
                    TargetLabel: "Slap With Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive penis against TargetCharacter's mouth."
                }, <ActivityTarget>{
                    Name: "ItemVulva",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis against TargetCharacter's pussy."
                }, <ActivityTarget>{
                    Name: "ItemBreast",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis in between TargetCharacter's breasts."
                }, <ActivityTarget>{
                    Name: "ItemLegs",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's thigh."
                }, <ActivityTarget>{
                    Name: "ItemFeet",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's calf."
                }, <ActivityTarget>{
                    Name: "ItemBoots",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's feet."
                }, <ActivityTarget>{
                    Name: "ItemButt",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis in between TargetCharacter's ass cheeks."
                }, <ActivityTarget>{
                    Name: "ItemNeck",
                    TargetLabel: "Slap With Penis",
                    TargetAction: "SourceCharacter slaps PronounPossessive penis down on TargetCharacter's neck."
                }, <ActivityTarget>{
                    Name: "ItemArms",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter rubs PronounPossessive penis against TargetCharacter's arm."
                }, <ActivityTarget>{
                    Name: "ItemHands",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis in between TargetCharacter's fingers."
                }, <ActivityTarget>{
                    Name: "ItemPenis",
                    TargetLabel: "Rub With Penis",
                    TargetAction: "SourceCharacter runs PronounPossessive penis against TargetCharacter's own penis."
                }
            ]
        })
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Activities);
    }

    AddActivity(bundle: ActivityBundle) {
        let activity = bundle.Activity;
        activity.Target = activity.Target ?? [];
        activity.Prerequisite = activity.Prerequisite ?? [];
        activity.Name = "LSCG_" + activity.Name;

        bundle.Targets.forEach(tgt => {
            tgt.TargetLabel = tgt.TargetLabel ?? activity.Name.substring(5);

            if (activity.Target.indexOf(tgt.Name) == -1) {
                activity.Target.push(tgt.Name);
            }
            
            if (!tgt.SelfAllowed)
                activity.TargetSelf = [];
            else
                activity.TargetSelf = true;

            ActivityDictionary.push([
                "Label-ChatOther-" + tgt.Name + "-" + activity.Name,
                tgt.TargetLabel
            ]);
            ActivityDictionary.push([
                "ChatOther-" + tgt.Name + "-" + activity.Name,
                tgt.TargetAction
            ]);

            if (tgt.SelfAllowed) {
                ActivityDictionary.push([
                    "Label-ChatSelf-" + tgt.Name + "-" + activity.Name,
                    tgt.TargetSelfLabel ?? tgt.TargetLabel
                ]);
                ActivityDictionary.push([
                    "ChatSelf-" + tgt.Name + "-" + activity.Name,
                    tgt.TargetSelfAction ?? tgt.TargetAction
                ]);
            }
        });

        ActivityFemale3DCG.push(activity);
    }
}