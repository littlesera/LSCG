import { BaseModule } from "base";
import { getModule } from "modules";
import { ModuleCategory } from "Settings/setting_definitions";
import { getRandomInt, hookFunction, IsIncapacitated, removeAllHooksByModule, SendAction } from "../utils";
import { ActivityBundle, ActivityModule, ActivityTarget } from "./activities";
import { BoopsModule } from "./boops";
import { CollarModule } from "./collar";

export class ActivityRoll {
	constructor(raw: number, mod: number) {
		this.Raw = raw;
		this.Modifier = mod;
	}
	Raw: number = 0;
	Modifier: number = 0;
	get Total(): number { return Math.max(0, this.Raw + this.Modifier); }
	get TotalStr(): string { 
		if (!Player.LSCG?.GlobalModule?.showCheckRolls)
			return "";
		return `[${this.Raw + (this.Modifier < 0 ? "" : "+") + this.Modifier }] `;
	}
}

export interface ActivityCheck {
	AttackerRoll: ActivityRoll;
	DefenderRoll: ActivityRoll;
}

export interface RopeTarget {
	Location: string;
	LocationLabel: string;
	ItemName: string;
	Type?: string;
}

export interface GagTarget {
	MouthItemName: string;
	HandItemName?: string;
	NeckItemName?: string;
	//SourceItemName: string;
	OverrideNeckLocation?: string;
	LeaveHandItem?: boolean;
	CraftedKeys?: string[];
	PreferredTypes?: {Location: string, Type: string}[];
	UsedAssetOverride?: string;
}

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class ItemUseModule extends BaseModule {   
	activities: ActivityModule | undefined;
	failedStealTime: number = 0;

	GagTargets: GagTarget[] = [
		{
			MouthItemName: "BallGag",
			HandItemName: "Ballgag",
			NeckItemName: "NecklaceBallGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "Tight"}]
		},{
			MouthItemName: "PantyStuffing",
			HandItemName: "Panties"
		},{
			MouthItemName: "LargeDildo",
			HandItemName: "LargeDildo"
		},{
			MouthItemName: "CaneGag",
			HandItemName: "Cane"
		},{
			MouthItemName: "CropGag",
			HandItemName: "Crop"
		},{
			MouthItemName: "SockStuffing",
			HandItemName: "LongSock"
		},{
			MouthItemName: "ClothStuffing",
			HandItemName: "Towel",
			UsedAssetOverride: "towel"
		},{
			MouthItemName: "RopeBallGag",
			HandItemName: "RopeCoilLong",	
			NeckItemName: "NecklaceRope",
			//LeaveHandItem: true,
			PreferredTypes: [
				{Location: "ItemMouth", Type: "Tight"},
				{Location: "Necklace", Type: "Long"}
			]
		},{
			MouthItemName: "RopeGag",
			HandItemName: "RopeCoilShort",
			NeckItemName: "NecklaceRope",
			//LeaveHandItem: true
		},{
			MouthItemName: "DuctTape",
			HandItemName: "TapeRoll",
			LeaveHandItem: true,
			PreferredTypes: [
				{Location: "ItemMouth", Type: "Crossed"},
				{Location: "ItemMouth2", Type: "Double"},
				{Location: "ItemMouth3", Type: "Cover"}
			]
		},{
			MouthItemName: "ScarfGag",
			NeckItemName: "Bandana",			
			PreferredTypes: [{Location: "ItemMouth", Type: "OTN"}],
			UsedAssetOverride: "bandana"
		},{
			MouthItemName: "ClothGag",
			NeckItemName: "Scarf",
			OverrideNeckLocation: "ClothAccessory",
			PreferredTypes: [{Location: "ItemMouth", Type: "OTM"}]
		},{
			MouthItemName: "FurScarf",
			NeckItemName: "FurScarf"
		}
	]

    load(): void {
		hookFunction("ActivityGenerateItemActivitiesFromNeed", 1, (args, next) => {
			let allowed = args[0];
			let acting = args[1];
			let acted = args[2];
			let needsItem = args[3];
			let activity = args[4];
			let ret = false;
			var focusGroup = acted?.FocusGroup?.Name ?? undefined;

			let res;
			if (["GagGiveItem", "GagTakeItem","GagToNecklace", "NecklaceToGag"].indexOf(needsItem) > -1) {
				res = this.ManualGenerateItemActivitiesForNecklaceActivity(allowed, acting, acted, needsItem, activity);
			} else {
				res = next(args);
			}
			return res;
		}, ModuleCategory.ItemUse);

        hookFunction("CharacterItemsForActivity", 1, (args, next) => {
			let C = args[0];
			let itemType = args[1];
			let results = next(args);
			var focusGroup = C?.FocusGroup?.Name ?? undefined;

			let gagTargets = this.GagTargets.filter(t => !!t.MouthItemName).map(t => t.MouthItemName!);
			let neckTargets = this.GagTargets.filter(t => !!t.NeckItemName).map(t => t.NeckItemName!);
			let handTargets = this.GagTargets.filter(t => !!t.HandItemName).map(t => t.HandItemName!);

			if (itemType == "AnyItem") {
				let item = InventoryGet(C, "ItemHandheld");
				if (!!item) results.push(item);
			} else if (itemType == "GagTakeItem") {
				let item = InventoryGet(C, focusGroup);	
				if (focusGroup == "ItemNeck") {
					focusGroup = "Necklace";
					item = InventoryGet(C, focusGroup);
					if (!item || neckTargets.indexOf(item?.Asset.Name ?? "") == -1) {
						focusGroup = "ClothAccessory";
						item = InventoryGet(C, focusGroup);
					}
					if (neckTargets.indexOf(item?.Asset.Name ?? "") > -1)
						results.push(item);
				} else {
					if (gagTargets.indexOf(item?.Asset.Name ?? "") > -1)
						results.push(item);
				}
			} else if (itemType == "GagGiveItem") {
				let item = InventoryGet(C, "ItemHandheld");
				if (handTargets.indexOf(item?.Asset.Name ?? "") > -1) results.push(item);
			}else if (itemType == "GagToNecklace") {
				let item = InventoryGet(C, focusGroup);
				if (gagTargets.indexOf(item?.Asset.Name ?? "") > -1) results.push(item);
			} else if (itemType == "NecklaceToGag") {
				let item = InventoryGet(C, "Necklace");
				let altItem = InventoryGet(C, "ClothAccessory");
				if (neckTargets.indexOf(item?.Asset.Name ?? "") > -1)
					results.push(item);
				if (neckTargets.indexOf(altItem?.Asset.Name ?? "") > -1)
					results.push(altItem);
			} else if (itemType == "RopeCoil") {
				let item = InventoryGet(C, "ItemHandheld")
				if (!!item && item.Asset.Name.startsWith("RopeCoil"))
					results.push(item)
			}
			return results;
		}, ModuleCategory.ItemUse);
    }

	run(): void {
		this.activities = getModule<ActivityModule>("ActivityModule")

		// Put gag on mouth or neck
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "UseGag",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["ZoneAccessible", "ZoneNaked", "UseHands", "Needs-GagGiveItem"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Gag Mouth",
					TargetAction: "SourceCharacter gags TargetCharacter with PronounPossessive ActivityAsset.",
					TargetSelfAction: "SourceCharacter gags themselves with their own ActivityAsset.",
					SelfAllowed: true
				},<ActivityTarget>{
					Name: "ItemNeck",
					TargetLabel: "Place around Neck",
					TargetAction: "SourceCharacter places PronounPossessive ActivityAsset around TargetCharacter's neck.",
					TargetSelfAction: "SourceCharacter places PronounPossessive ActivityAsset around PronounPossessive own neck.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "HoldingGag",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name!;
						let heldItemName = InventoryGet(acting, "ItemHandheld")?.Asset.Name ?? "";
						let gagTarget = this.GagTargets.find(t => t.HandItemName == heldItemName);
						
						if (!gagTarget)
							return false;

						if (group.Name == "ItemMouth") {
							var existing = InventoryGet(acted, location);
							if (!!existing)
								return false;

							let mouthItemName = gagTarget.MouthItemName ?? "";
							let assetGroup = AssetFemale3DCG.find(a => a.Group == location);
							let allowedAssetNames = assetGroup?.Asset.map(a => (<AssetDefinition>a)?.Name ?? a);
							let targetMouthAssetAllowed = (allowedAssetNames?.indexOf(mouthItemName) ?? -1) > -1;

							var itemAlreadyInMouth = InventoryGet(acted, "ItemMouth")?.Asset.Name == gagTarget.MouthItemName 	||
								InventoryGet(acted, "ItemMouth2")?.Asset.Name == gagTarget.MouthItemName 						||
								InventoryGet(acted, "ItemMouth3")?.Asset.Name == gagTarget.MouthItemName;

							return targetMouthAssetAllowed && !itemAlreadyInMouth;
						} else if (location == "ItemNeck") {
							var existing = InventoryGet(acted, gagTarget.OverrideNeckLocation ?? "Necklace");
							return !existing && !!gagTarget.NeckItemName;
						}
						return false;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let heldItemName = InventoryGet(Player, "ItemHandheld")?.Asset.Name ?? "";
					let gagTarget = this.GagTargets.find(t => t.HandItemName == heldItemName);
					if (!!gagTarget) {
						if (location == "ItemNeck")
							location = gagTarget.OverrideNeckLocation ?? "Necklace";
						this.ApplyGag(target, Player, gagTarget, location);
					}
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemHandheld/Preview/Ballgag.png"
		});

		// Take Gag
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "TakeGag",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Reverse: true,
				Prerequisite: ["UseHands", "Needs-GagTakeItem"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Take Gag",
					TargetAction: "SourceCharacter removes TargetCharacter's ActivityAsset.",
					TargetSelfAction: "SourceCharacter pulls the ActivityAsset from PronounPossessive mouth.",
					SelfAllowed: true
				}, <ActivityTarget>{
					Name: "ItemNeck",
					TargetLabel: "Take Gag",
					TargetAction: "SourceCharacter takes TargetCharacter's ActivityAsset from around TargetPronounPossessive neck.",
					TargetSelfAction: "SourceCharacter takes PronounPossessive own ActivityAsset from around PronounPossessive neck.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "TargetIsGagged",
					Func: (acted, acting, group) => {
						let location = acted.FocusGroup?.Name!;
						let item: Item | null;
						let gagTarget: GagTarget | undefined;
						if (location == "ItemNeck") {
							location = "Necklace";
							item = InventoryGet(acted, location);
							gagTarget = this.GagTargets.find(t => !!item && t.NeckItemName == item?.Asset.Name && !!t.HandItemName);
							if (!gagTarget) {
								location = "ClothAccessory";
								item = InventoryGet(acted, location);
								gagTarget = this.GagTargets.find(t => !!item && t.NeckItemName == item?.Asset.Name && !!t.HandItemName);
							}
						} else {
							if (InventoryGroupIsBlocked(acted, location))
								return false;
							item = InventoryGet(acted, location);
							gagTarget = this.GagTargets.find(t => !!item && t.MouthItemName == item?.Asset.Name && !!t.HandItemName);
						}
						
						if (!!item && !!gagTarget) {
							if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
								return false;

							var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
							if (!item && !ValidationCanRemoveItem(item!, validParams, false))
								return false;
						}

						return !InventoryGet(acting, "ItemHandheld") && !!gagTarget;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					let location = target.FocusGroup?.Name!;
					let itemName: string | undefined;
					let gagTarget: GagTarget | undefined;
					if (location == "ItemNeck") {
						location = "Necklace";
						itemName = InventoryGet(target, location)?.Asset.Name ?? undefined;
						gagTarget = this.GagTargets.find(t => !!itemName && t.NeckItemName == itemName);
						if (!gagTarget) {
							location = "ClothAccessory";
							itemName = InventoryGet(target, location)?.Asset.Name ?? undefined;
							gagTarget = this.GagTargets.find(t => !!itemName && t.NeckItemName == itemName);
						}
					} else {
						itemName = InventoryGet(target, location)?.Asset.Name ?? undefined;
						gagTarget = this.GagTargets.find(t => !!itemName && t.MouthItemName == itemName);
					}

					if (!!gagTarget)
						this.TakeGag(target, Player, gagTarget, location);
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
		});

		// Gag With Necklace
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "NecklaceToGag",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["UseHands", "Needs-NecklaceToGag"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Move to Mouth",
					TargetAction: "SourceCharacter moves TargetCharacter's ActivityAsset up to their mouth.",
					TargetSelfAction: "SourceCharacter moves their own ActivityAsset up to PronounPossessive mouth.",
					SelfAllowed: true
				},
			],
			CustomPrereqs: [
				{
					Name: "TargetIsWearingGagNecklace",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name!;
						var existing = InventoryGet(acted, location);
						if (!!existing)
							return false;
						let gagTarget = this.GagTargets.find(t => t.NeckItemName == (InventoryGet(acted, "Necklace")?.Asset.Name ?? ""));
						if (!gagTarget) gagTarget = this.GagTargets.find(t => t.NeckItemName == (InventoryGet(acted, "ClothAccessory")?.Asset.Name ?? "") && t.OverrideNeckLocation == "ClothAccessory");
						if (!gagTarget)
							return false;
						let mouthItemName = gagTarget.MouthItemName ?? "";
						let assetGroup = AssetFemale3DCG.find(a => a.Group == location);
						let allowedAssetNames = assetGroup?.Asset.map(a => (<AssetDefinition>a)?.Name ?? a);
						let targetMouthAssetAllowed = (allowedAssetNames?.indexOf(mouthItemName) ?? -1) > -1;
						return targetMouthAssetAllowed;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					var dict = args[1]?.Dictionary;
					if (!target || !dict)
						return;
					var activityAsset = dict.find((x: { Tag: string; }) => x.Tag == "ActivityAsset");
					var location = target.FocusGroup?.Name!;
					let heldItemName = InventoryGet(target, activityAsset.GroupName)?.Asset.Name ?? "";
					let gagTarget = this.GagTargets.find(t => t.NeckItemName == heldItemName);
					//if (!gagTarget) gagTarget = this.GagTargets.find(t => t.NeckItemName == (InventoryGet(target, "ClothAccessory")?.Asset.Name ?? "") && t.OverrideNeckLocation == "ClothAccessory");
					if (!!gagTarget) {
						this.ApplyGag(target, target, gagTarget, location, gagTarget.OverrideNeckLocation ?? "Necklace");
					}
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/Necklace/Preview/NecklaceBallGag.png"
		});

		// Move Gag to Necklace
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "GagToNecklace",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["UseHands", "Needs-GagToNecklace"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemMouth",
					TargetLabel: "Wear around Neck",
					TargetAction: "SourceCharacter removes TargetCharacter's ActivityAsset, letting it hang around their neck.",
					TargetSelfAction: "SourceCharacter removes the ActivityAsset from PronounPossessive mouth and lets it hang around PronounPossessive neck.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "TargetIsGaggedWithNecklace",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name!;
						var item = InventoryGet(acted, location);
						
						if (InventoryGroupIsBlocked(acted, location))
							return false;

						if (!!item) {
							if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
								return false;

							var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
							if (!item && !ValidationCanRemoveItem(item!, validParams, false))
								return false;
						}

						var gagTarget = this.GagTargets.find(t => t.MouthItemName == item?.Asset.Name && !!t.NeckItemName);

						return !!gagTarget && 
						!InventoryGet(acted, gagTarget?.OverrideNeckLocation ?? "Necklace") && 
						this.GagTargets.map(t => t.MouthItemName).indexOf(item?.Asset.Name ?? "") > -1;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let mouthItemName = InventoryGet(target, location)?.Asset.Name ?? "";
					let gagTarget = this.GagTargets.find(t => t.MouthItemName == mouthItemName);
					if (!!gagTarget)
						this.TakeGag(target, target, gagTarget, location, gagTarget?.OverrideNeckLocation ?? "Necklace");
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
		});

		// Tie Up
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "TieUp",
				MaxProgress: 50,
				MaxProgressSelf: 80,
				Prerequisite: ["UseHands", "ZoneAccessible", "Needs-RopeCoil"]
			},
			Targets: this.GetHempRopeLocations().map(loc => <ActivityTarget>{
						Name: loc.Location,
						TargetLabel: "Tie Up",
						TargetAction: `SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's ${loc.LocationLabel}, binding TargetPronounPossessive tightly.`,
						TargetSelfAction: `SourceCharacter wraps PronounPossessive rope around PronounPossessive ${loc.LocationLabel} tightly.`,
						SelfAllowed: true
					}),
			CustomPrereqs: [
				{
					Name: "HasCoiledRope",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name;
						if (!location)
							return false;
						var ropeTarget = this.GetHempRopeLocations().find(t => t.Location == location);
						var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
						var blocked = (location.startsWith("ItemTorso") || location == "ItemPelvis") ? !InventoryDoItemsExposeGroup(acted, "ItemTorso", ["Cloth"]) : false;

						return !blocked && 
							InventoryGet(acting, "ItemHandheld")?.Asset.Name.startsWith("RopeCoil") && 
							!InventoryGet(acted, location);
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let ropeTarget = this.GetHempRopeLocations().find(loc => loc.Location == location);
					if (!!ropeTarget)
						this.TieUp(target, Player, ropeTarget);
					return next(args);
				}
			},
			CustomImage: "Assets/Female3DCG/ItemArms/Preview/HempRope.png"
		});

		// Steal
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "Steal",
				MaxProgress: 50,
				MaxProgressSelf: 50,
				Prerequisite: ["Needs-AnyItem"],
				Reverse: true // acting and acted are flipped!
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemHands",
					TargetLabel: "Steal!",
					TargetAction: "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item!",
					SelfAllowed: false
				}
			],
			CustomPrereqs: [
				{
					Name: "CanSteal",
					Func: (acted, acting, group) => { // Clip acting and acted here due to reverse == true
						if (acted.FocusGroup?.Name != "ItemHandheld" || InventoryGet(acted, "ItemHands") != null)
							return false;
						var item = InventoryGet(acted, "ItemHandheld");
						if (!item)
							return false;
						var OnCooldown = this.failedStealTime > 0 && (this.failedStealTime + 60000) > CommonTime(); // 1 minute cooldown on steal attempts.
						var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
						var allowed = ValidationCanRemoveItem(item!, validParams, false);
						return !OnCooldown && allowed && !InventoryGet(acting, "ItemHandheld");
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					this.TrySteal(target, Player, InventoryGet(target, "ItemHandheld")!);
				}
			},
			CustomImage: "Icons/Dress.png"
		});

		// Give
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "Give",
				MaxProgress: 50,
				MaxProgressSelf: 50,
				Prerequisite: ["UseHands", "ZoneAccessible", "TargetZoneAccessible", "Needs-AnyItem"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemHands",
					TargetLabel: "Give Item",
					TargetAction: "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item!",
					SelfAllowed: false
				}
			],
			CustomPrereqs: [
				{
					Name: "CanGive",
					Func: (acting, acted, group) => {
						if (acted.FocusGroup?.Name != "ItemHandheld" || InventoryGet(acted, "ItemHands") != null)
							return false;
						var emptyTargetHands = !InventoryGet(acted, "ItemHandheld");
						var sourceItem = InventoryGet(acting, "ItemHandheld");
						return emptyTargetHands && !!sourceItem;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					this.GiveItem(target, Player);
				}
			},
			CustomImage: "Icons/Dress.png"
		});

		// Shark Bite
		this.activities.AddActivity(<ActivityBundle>{
			Activity: <Activity>{
				Name: "SharkBite",
				MaxProgress: 50,
				MaxProgressSelf: 50,
				Prerequisite: ["UseHands", "Needs-AnyItem"]
			},
			Targets: [
				<ActivityTarget>{
					Name: "ItemArms",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's arm!",
					SelfAllowed: false
				}, <ActivityTarget>{
					Name: "ItemBoots",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's foot!",
					SelfAllowed: false
				}, <ActivityTarget>{
					Name: "ItemBreast",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's breast!",
					SelfAllowed: false
				}, <ActivityTarget>{
					Name: "ItemButt",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter in the butt!",
					SelfAllowed: false
				}, <ActivityTarget>{
					Name: "ItemEars",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's ear'!",
					SelfAllowed: false
				}, <ActivityTarget>{
					Name: "ItemFeet",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's leg!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemHands",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter on the hand!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemLegs",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter in the thigh!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemNeck",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter on the neck!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemNipples",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's nipple!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemTorso",
					TargetLabel: "Shark Bite",
					TargetAction: "SourceCharacter's ActivityAsset chomps on TargetCharacter!",
					SelfAllowed: false
				},  <ActivityTarget>{
					Name: "ItemNose",
					TargetLabel: "Shark Boop",
					TargetAction: "SourceCharacter boops TargetCharacter's nose with PronounPossessive ActivityAsset.",
					SelfAllowed: false
				}
			],
			CustomPrereqs: [
				{
					Name: "HasShark",
					Func: (acting, acted, group) => {
						var sourceItem = InventoryGet(acting, "ItemHandheld");
						return !!sourceItem && sourceItem.Asset.Name == "Shark";
					}
				}
			],
			CustomImage: "Assets/Female3DCG/ItemHandheld/Preview/Shark.png"
		});
	}

    unload(): void {
        removeAllHooksByModule(ModuleCategory.ItemUse);
    }

	get d20(): number {
		return getRandomInt(20) + 1;
	}
	
	getDominance(C: Character) {
		return C.Reputation.find(r => r.Type == "Dominant")?.Value ?? 0;
	};
	
	getSkill(C: Character, skillName: string): number {
		let skill = C.Skill.find(r => r.Type == skillName);
		return ((skill?.Level ?? 0) * (skill?.Ratio ?? 1));
	}
	
	getRollMod(C: Character, Opponent?: Character, isAggressor: boolean = false): number {
		// Dominant vs Submissive ==> -3 to +3 modifier
		let dominanceMod = Math.floor(this.getDominance(C) / 33);
		// +5 if we own our opponent
		let ownershipMod = Opponent?.IsOwnedByMemberNumber(C.MemberNumber!) ? 5 : 0 ?? 0;
		// -4 if we're restrained
		let restrainedMod = C.IsRestrained() ? -4 : 0;
		// If edged, -0 to -4 based on arousal
		let edgingMod = C.IsEdged() ? (Math.floor((C.ArousalSettings?.Progress ?? 0) / 25) * -1) : 0;
		// -5 if we're incapacitated, automatic failure if we're also defending
		let incapacitatedMod = IsIncapacitated(C.IsPlayer() ? C as PlayerCharacter : C as OtherCharacter) ? (isAggressor ? 5 : 100) * -1 : 0;
		// -2 for each level of choking
		let breathMod = (C.IsPlayer() ? getModule<CollarModule>("CollarModule").totalChokeLevel : (C as OtherCharacter).LSCG?.CollarModule.chokeLevel ?? 0) * -2;

		let finalMod = dominanceMod + ownershipMod + restrainedMod + edgingMod + incapacitatedMod + breathMod;
	
		console.debug(`${CharacterNickname(C)} is ${isAggressor ? 'rolling against' : 'defending against'} ${!Opponent ? "nobody" : CharacterNickname(Opponent)} [${finalMod}] --
		dominanceMod: ${dominanceMod}
		ownershipMod: ${ownershipMod}
		restrainedMod: ${restrainedMod}
		edgingMod: ${edgingMod}
		incapacitatedMod: ${incapacitatedMod}
		breathMod: ${breathMod}
		`);
	
		return finalMod;
	}

	UnopposedActivityRoll(C: Character) {
		return new ActivityRoll(this.d20, this.getRollMod(C));
	}

	MakeActivityCheck(attacker: Character, defender: Character): ActivityCheck {
		return <ActivityCheck>{
			AttackerRoll: new ActivityRoll(this.d20, this.getRollMod(attacker, defender, true)),
			DefenderRoll: new ActivityRoll(this.d20, this.getRollMod(defender, attacker, false))
		}
	}

	GetHempRopeLocations(): RopeTarget[] {
		return AssetFemale3DCG.filter(g => g.Asset.some(a => (a as AssetDefinition)?.Name == "HempRope")).map(g => <RopeTarget>{
			Location: g.Group,
			LocationLabel: g.Group.substring(4).toLocaleLowerCase(),
			ItemName: "HempRope"
		}).concat([
			{
				Location: "ItemHead",
				LocationLabel: "eyes",
				ItemName: "RopeBlindfold"
			},{
				Location: "ItemNeck",
				LocationLabel: "neck",
				ItemName: "NeckRope"
			},{
				Location: "ItemTorso",
				LocationLabel: "breasts",
				ItemName: "HempRopeHarness",
				Type: "Star"
			},{
				Location: "ItemTorso2",
				LocationLabel: "waist",
				ItemName: "HempRopeHarness",
				Type: "Waist"
			},{
				Location: "ItemBoots",
				LocationLabel: "toes",
				ItemName: "ToeTie"
			}
		]);
	}

	_handleWeirdColorStuff(itemToMove: Item, gagTarget: GagTarget, sourceLocation: string, targetLocation: string): ItemColor | undefined {
		var color = itemToMove?.Color;
		// BallGag necklace + mouth gag alternate order...
		if (!!color && gagTarget.MouthItemName == "BallGag") {
			if ((sourceLocation?.startsWith("ItemMouth") && targetLocation == "Necklace") ||
				(sourceLocation == "Necklace" && targetLocation?.startsWith("ItemMouth")))
				color = (<string[]>(<ItemColor>color)).reverse();
			else if (sourceLocation == "ItemHandheld")
				color = [color[0], color[0]];
		}
		return color;
	}

	ApplyGag(target: Character, source: Character, gagTarget: GagTarget, targetLocation: string, sourceLocation: string = "ItemHandheld") {
		var gagItem = InventoryGet(source, sourceLocation);
		let sourceItemName = (sourceLocation == "ItemHandheld" ? gagTarget.HandItemName : gagTarget.NeckItemName) ?? "";
		let targetItemName = (targetLocation?.startsWith("ItemMouth") ? gagTarget.MouthItemName : gagTarget.NeckItemName) ?? "";
		if (!!gagItem && gagItem.Asset.Name == sourceItemName) {
			if (!(gagTarget.LeaveHandItem && sourceLocation == "ItemHandheld")) InventoryRemove(source, sourceLocation, true);
			var color = this._handleWeirdColorStuff(gagItem, gagTarget, sourceLocation, targetLocation);
			var gag = InventoryWear(target, targetItemName, targetLocation, color, undefined, source.MemberNumber, gagItem?.Craft, true);
			if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
				var prefType = gagTarget.PreferredTypes.find(tgt => tgt.Location == targetLocation) ?? gagTarget.PreferredTypes.find(tgt => targetLocation.startsWith(tgt.Location));
				if (!!gag && !!prefType) {
					if (!gag.Property) gag.Property = {};
					gag!.Property!.Type = prefType.Type;
				}
			}
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
    }

	TakeGag(target: Character, source: Character, gagTarget: GagTarget, sourceLocation: string, targetLocation: string = "ItemHandheld") {
		var gag = InventoryGet(target, sourceLocation);
		var existing = InventoryGet(source, targetLocation);
		let sourceItemName = (sourceLocation.startsWith("ItemMouth") ? gagTarget.MouthItemName : gagTarget.NeckItemName) ?? "";
		let targetItemName = (targetLocation == "ItemHandheld" ? gagTarget.HandItemName : gagTarget.NeckItemName) ?? "";
		if (!gag || !!existing || gag.Asset.Name != sourceItemName)
			return;
		var validParams = ValidationCreateDiffParams(target, source.MemberNumber!);
		if (ValidationCanRemoveItem(gag!, validParams, false)) {
			InventoryRemove(target, sourceLocation, true);
			var craft = gag.Craft;
			if (!!craft) {
				craft.Lock = "";
				if (craft.Property == "Large" || craft.Property == "Small") {
					craft.Property = "Normal";
				}
			}
			var color = this._handleWeirdColorStuff(gag, gagTarget, sourceLocation, targetLocation);
			let item = InventoryWear(source, targetItemName, targetLocation, color, undefined, source.MemberNumber, craft, true);			
			if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
				var prefType = gagTarget.PreferredTypes.find(tgt => tgt.Location == targetLocation) ?? gagTarget.PreferredTypes.find(tgt => targetLocation.startsWith(tgt.Location));
				if (!!item && !!prefType) {
					if (!item.Property) item.Property = {};
					item!.Property!.Type = prefType.Type;
				}
			}
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
	}

	TieUp(target: Character, source: Character, rope: RopeTarget) {
		var handRope = InventoryGet(source, "ItemHandheld");
		if (handRope?.Asset.Name.startsWith("RopeCoil")) {
			var ropeTie = InventoryWear(target, rope.ItemName, rope.Location, handRope?.Color, undefined, source.MemberNumber, handRope?.Craft, true);
			if (!!rope.Type)
				(<any>ropeTie!.Property!.Type!) = rope.Type;
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
	}

	getItemName(item: Item) {
		return item.Craft?.Name ?? item.Asset.Description.toLocaleLowerCase();
	}

	GiveItem(target: Character, source: Character) {
		var item = InventoryGet(source, "ItemHandheld");
		if (!item)
			return;
			SendAction(`${CharacterNickname(source)} gives %POSSESSIVE% ${this.getItemName(item)} to ${CharacterNickname(target)}.`);
		InventoryRemove(source, "ItemHandheld", false);
		let newItem = InventoryWear(target, item?.Asset.Name!, "ItemHandheld", item?.Color, item?.Difficulty, source.MemberNumber, item?.Craft, false);
		if (!!newItem) newItem.Property = item.Property;
		setTimeout(() => ChatRoomCharacterUpdate(source));
		setTimeout(() => ChatRoomCharacterUpdate(target));
	}

	TrySteal(target: Character, source: Character, item: Item) {
		SendAction(`${CharacterNickname(source)} grabs at ${CharacterNickname(target)}'s ${this.getItemName(item)}, trying to steal it!`);
		setTimeout(() => this.Steal_Roll(target, source, item), 5000);
	}

	Steal_Roll(target: Character, source: Character, item: Item) {
		let check = this.MakeActivityCheck(source, target);

		if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
			SendAction(`${CharacterNickname(source)} ${check.AttackerRoll.TotalStr}manages to wrest ${CharacterNickname(target)}'s ${check.DefenderRoll.TotalStr}${this.getItemName(item)} out of their grasp!`);
			InventoryRemove(target, "ItemHandheld", false);
			let newItem = InventoryWear(source, item.Asset.Name, "ItemHandheld", item.Color, item.Difficulty, source.MemberNumber, item.Craft, false);
			if (!!newItem) newItem.Property = item.Property;
			setTimeout(() => ChatRoomCharacterUpdate(source));
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
		else {
			SendAction(`${CharacterNickname(source)} ${check.AttackerRoll.TotalStr}fails to steal ${CharacterNickname(target)}'s ${check.DefenderRoll.TotalStr}${this.getItemName(item)} and is dazed from the attempt!`);
			this.failedStealTime = CommonTime();
		}
	}

	ManualGenerateItemActivitiesForNecklaceActivity(allowed: ItemActivity[], acting: Character, acted: Character, needsItem: string, activity: Activity) {
		const itemOwner = needsItem == "GagGiveItem" ? acting : acted;
		const items = CharacterItemsForActivity(itemOwner, needsItem);
		if (items.length === 0) return true;
	
		let handled = false;
		for (const item of items) {
			/** @type {null[] | string[]} */
			let types;
			if (!item.Property) {
				types = [null];
			} else if (item.Asset.Archetype === ExtendedArchetype.MODULAR) {
				types = ModularItemDeconstructType(item.Property.Type ?? "") || [null];
			} else {
				types = [item.Property.Type];
			}
	
			let blocked: ItemActivityRestriction | null = null;
			let focusGroup = acted.FocusGroup?.Name;
			let itemName = item.Asset.Name;
			let gagTarget = this.GagTargets.find(t => [t.MouthItemName, t.HandItemName, t.NeckItemName].indexOf(itemName) > -1);
			
			let targetItemName = gagTarget?.MouthItemName;
			if (focusGroup == "ItemNeck" || needsItem == "GagToNecklace") targetItemName = gagTarget?.NeckItemName;
			else if (needsItem == "GagTakeItem") targetItemName = gagTarget?.HandItemName;
			
			let targetAssetGroup = "ItemMouth";
			if (focusGroup == "ItemNeck" || needsItem == "GagToNecklace") targetAssetGroup = gagTarget?.OverrideNeckLocation ?? "Necklace";
			else if (needsItem == "GagTakeItem") targetAssetGroup = "ItemHandheld";
			
			let targetItem = <Item>{Asset: AssetGet("Female3DCG", targetAssetGroup, targetItemName ?? "")};
			let targetOwner = needsItem == "GagTakeItem" ? acting : acted;
			if (targetItem.Asset != null) {
				if (types.some((type) => InventoryIsAllowedLimited(targetOwner, targetItem, type ?? ""))) {
					blocked = "limited";
				} else if (types.some((type) => InventoryBlockedOrLimited(targetOwner, targetItem, type))) {
					blocked = "blocked";
				} else if (InventoryGroupIsBlocked(targetOwner, /** @type {AssetGroupItemName} */(targetItem.Asset.Group.Name))) {
					blocked = "unavail";
				}
			} else {
				blocked = "unavail";
			}
	
			if (!!blocked) {
				allowed.push({ Activity: activity, Item: item, Blocked: blocked });
			} else
				allowed.push({ Activity: activity, Item: item });
			handled = true;
		}
		return handled;
	}
}