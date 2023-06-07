import { BaseModule } from "base";
import { getModule } from "modules";
import { GuiHypno } from "Settings/hypno";
import { MainMenu } from "Settings/mainmenu";
import { RemoteMainMenu } from "Settings/Remote/mainmenu";
import { RemoteGuiSubscreen } from "Settings/Remote/remoteBase";
import { GuiSubscreen } from "Settings/settingBase";
import { GUI } from "Settings/settingUtils";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, hookFunction, ICONS, removeAllHooksByModule } from "../utils";
import { ActivityBundle, ActivityModule, ActivityTarget } from "./activities";
import { HypnoModule } from "./hypno";

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class ItemUseModule extends BaseModule {   
	activities: ActivityModule | undefined;

    load(): void {
        
    }

	run(): void {
		this.activities = getModule<ActivityModule>("ActivityModule")

		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "UseBallgag",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["ZoneAccessible", "ZoneNaked", "UseHands"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Gag Mouth",
					TargetAction: "SourceCharacter pushes PronounPossessive gag into TargetCharacter's mouth, latching it behind their head.",
					TargetSelfAction: "SourceCharacter gags themselves.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "HoldingBallgag",
					Func: (acting, acted, group) => {
						return InventoryGet(acting, "ItemHandheld")?.Asset.Name! == "Ballgag";
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = args[1]?.Dictionary[2]?.FocusGroupName;
					var gag = InventoryGet(Player, "ItemHandheld");
					InventoryRemove(Player, "ItemHandheld", true);
					this.ApplyGag(target, location, gag)
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
		})

		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "TakeBallgag",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["UseHands"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Take Gag",
					TargetAction: "SourceCharacter unlatches and removes TargetCharacter's ballgag.",
					TargetSelfAction: "SourceCharacter pulls the ballgag out of PronounPossessive mouth.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "Ballgagged",
					Func: (acting, acted, group) => {
						return InventoryGet(acted, group.Name)?.Asset.Name! == "BallGag";
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = args[1]?.Dictionary[2]?.FocusGroupName;
					this.TakeGag(target, location);
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
		})
	}

    unload(): void {
        removeAllHooksByModule(ModuleCategory.ItemUse);
    }

	ApplyGag(target: Character, location: string, gagItem: Item | null) {
        var gag = InventoryWear(target, "BallGag", location, gagItem?.Color, undefined, Player.MemberNumber, gagItem?.Craft, true);
		gag!.Property!.Type = "Tight";
		setTimeout(() => ChatRoomCharacterItemUpdate(target, location));
    }

	TakeGag(target: Character, location: string) {
		var gag = InventoryGet(target, location);
		var existingHand = InventoryGet(Player, "ItemHandheld");
		if (!gag || !!existingHand)
			return;
		var validParams = ValidationCreateDiffParams(target, Player.MemberNumber!);
		if (ValidationCanRemoveItem(gag!, validParams, false)) {
			InventoryRemove(target, location, true);
			var craft = gag.Craft;
			craft!.Lock = "";
			InventoryWear(Player, "Ballgag", "ItemHandheld", gag.Color, undefined, Player.MemberNumber, craft, true);
			setTimeout(() => ChatRoomCharacterItemUpdate(target, location));
		}
	}
}