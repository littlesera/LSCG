import { BaseModule } from "base";
import { getModule } from "modules";
import { GuiHypno } from "Settings/hypno";
import { MainMenu } from "Settings/mainmenu";
import { RemoteMainMenu } from "Settings/Remote/mainmenu";
import { RemoteGuiSubscreen } from "Settings/Remote/remoteBase";
import { GuiSubscreen } from "Settings/settingBase";
import { GUI } from "Settings/settingUtils";
import { ModuleCategory } from "Settings/setting_definitions";
import { getCharacter, getRandomInt, hookFunction, ICONS, removeAllHooksByModule, SendAction } from "../utils";
import { ActivityBundle, ActivityModule, ActivityTarget } from "./activities";
import { BoopsModule } from "./boops";
import { HypnoModule } from "./hypno";
import { InjectorModule } from "./injector";
import { MiscModule } from "./misc";

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
	SourceItemName: string;
	SourceLocation?: string;
	LeaveHandItem?: boolean;
	CraftedKeys?: string[];
	PreferredTypes?: {Location: string, Type: string}[];
}

// Remote UI Module to handle configuration on other characters
// Can be used to "program" another character's hypnosis, collar, etc.
// Framework inspired from BCX
export class ItemUseModule extends BaseModule {   
	activities: ActivityModule | undefined;
	failedStealTime: number = 0;

	NeckTargets: GagTarget[] = [
		{
			SourceItemName: "NecklaceRope",
			MouthItemName: "RopeBallGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "Tight"},
							{Location: "Necklace", Type: "Long"}]
		},{
			SourceItemName: "NecklaceBallGag",
			MouthItemName: "BallGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "Tight"}]
		},{
			SourceItemName: "Bandana",
			MouthItemName: "ScarfGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "OTN"}]
		},{
			SourceItemName: "Scarf",
			SourceLocation: "ClothAccessory",
			MouthItemName: "ClothGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "OTM"}]
		},{
			SourceItemName: "FurScarf",
			MouthItemName: "FurScarf"
		}
	]

	GagTargets: GagTarget[] = [
		{
			SourceItemName: "Ballgag",
			MouthItemName: "BallGag",
			PreferredTypes: [{Location: "ItemMouth", Type: "Tight"}]
		},{
			SourceItemName: "Panties",
			MouthItemName: "PantyStuffing"
		},{
			SourceItemName: "LargeDildo",
			MouthItemName: "LargeDildo"
		},{
			SourceItemName: "Cane",
			MouthItemName: "CaneGag"
		},{
			SourceItemName: "Crop",
			MouthItemName: "CropGag"
		},{
			SourceItemName: "LongSock",
			MouthItemName: "SockStuffing"
		},{
			SourceItemName: "Towel",
			MouthItemName: "ClothStuffing"
		},{
			SourceItemName: "RopeCoilShort",
			MouthItemName: "RopeGag",
			LeaveHandItem: true
		},{
			SourceItemName: "RopeCoilLong",
			MouthItemName: "RopeBallGag",
			LeaveHandItem: true,
			PreferredTypes: [{Location: "ItemMouth", Type: "Tight"}]
		},{
			SourceItemName: "TapeRoll",
			MouthItemName: "DuctTape",
			LeaveHandItem: true,
			PreferredTypes: [
				{Location: "ItemMouth", Type: "Crossed"},
				{Location: "ItemMouth2", Type: "Double"},
				{Location: "ItemMouth3", Type: "Cover"}
			]
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

			if (needsItem == "GagToNecklace" || needsItem == "NecklaceToGag") {
				return this.ManualGenerateItemActivitiesForNecklaceActivity(allowed, acting, acted, needsItem, activity);
			} else {
				return next(args);
			}
		}, ModuleCategory.ItemUse);

        hookFunction("CharacterItemsForActivity", 1, (args, next) => {
			let C = args[0];
			let itemType = args[1];
			let results = next(args);
			var focusGroup = C?.FocusGroup?.Name ?? undefined;

			let gagTargets = this.GagTargets.flatMap(t => [t.SourceItemName, t.MouthItemName]);
			let neckTargets = this.NeckTargets.flatMap(t => [t.SourceItemName, t.MouthItemName]);

			if (itemType == "AnyItem") {
				let item = InventoryGet(C, "ItemHandheld");
				if (!!item)
					results.push(item)
			} else if (itemType == "GagTakeItem") {
				let item = InventoryGet(C, focusGroup);	
				if (gagTargets.indexOf(item?.Asset.Name ?? "") > -1)
					results.push(item);
			} else if (itemType == "GagGiveItem") {
				let item = InventoryGet(C, "ItemHandheld");
				if (gagTargets.indexOf(item?.Asset.Name ?? "") > -1)
					results.push(item);
			}else if (itemType == "GagToNecklace") {
				let item = InventoryGet(C, focusGroup);	
				if (neckTargets.indexOf(item?.Asset.Name ?? "") > -1)
					results.push(item);
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

		// Gag Mouth
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
					TargetAction: "SourceCharacter pushes PronounPossessive UsedAsset into TargetCharacter's mouth.",
					TargetSelfAction: "SourceCharacter gags themselves with their own UsedAsset.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "HoldingGag",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name!;
						var existing = InventoryGet(acted, location);
						if (!!existing)
							return false;
						let heldItemName = InventoryGet(acting, "ItemHandheld")?.Asset.Name ?? "";
						let gagTarget = this.GagTargets.find(t => t.SourceItemName == heldItemName);
						if (!gagTarget)
							return false;
						let mouthItemName = gagTarget.MouthItemName ?? "";
						let assetGroup = AssetFemale3DCG.find(a => a.Group == location);
						let allowedAssetNames = assetGroup?.Asset.map(a => (<AssetDefinition>a)?.Name ?? a);
						let targetMouthAssetAllowed = (allowedAssetNames?.indexOf(mouthItemName) ?? -1) > -1;

						var itemAlreadyInMouth = InventoryGet(acted, "ItemMouth")?.Asset.Name == gagTarget.MouthItemName ||
													InventoryGet(acted, "ItemMouth2")?.Asset.Name == gagTarget.MouthItemName ||
													InventoryGet(acted, "ItemMouth3")?.Asset.Name == gagTarget.MouthItemName;

						return targetMouthAssetAllowed && !itemAlreadyInMouth;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let heldItemName = InventoryGet(Player, "ItemHandheld")?.Asset.Name ?? "";
					let gagTarget = this.GagTargets.find(t => t.SourceItemName == heldItemName);
					if (!!gagTarget) {
						this.ApplyGag(target, Player, gagTarget, location);
					}
					return next(args);
				}
			}
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
					TargetAction: "SourceCharacter removes TargetCharacter's UsedAsset.",
					TargetSelfAction: "SourceCharacter pulls the UsedAsset out of PronounPossessive mouth.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "TargetIsGagged",
					Func: (acted, acting, group) => {
						var location = acted.FocusGroup?.Name!;
						var item = InventoryGet(acted, location);
						
						if (!!item) {
							if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
								return false;

							var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
							if (!item && !ValidationCanRemoveItem(item!, validParams, false))
								return false;
						}

						return !InventoryGet(acting, "ItemHandheld") && this.GagTargets.map(t => t.MouthItemName).indexOf(item?.Asset.Name ?? "") > -1;
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
						this.TakeGag(target, Player, gagTarget, location);
					return next(args);
				}
			}
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
					TargetAction: "SourceCharacter moves TargetCharacter's UsedAsset up and puts it in their mouth.",
					TargetSelfAction: "SourceCharacter moves their own UsedAsset up into PronounPossessive mouth.",
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
						let gagTarget = this.NeckTargets.find(t => t.SourceItemName == (InventoryGet(acted, "Necklace")?.Asset.Name ?? ""));
						if (!gagTarget) gagTarget = this.NeckTargets.find(t => t.SourceItemName == (InventoryGet(acted, "ClothAccessory")?.Asset.Name ?? "") && t.SourceLocation == "ClothAccessory");
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
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let heldItemName = InventoryGet(target, "Necklace")?.Asset.Name ?? "";
					let gagTarget = this.NeckTargets.find(t => t.SourceItemName == heldItemName);
					if (!gagTarget) gagTarget = this.NeckTargets.find(t => t.SourceItemName == (InventoryGet(target, "ClothAccessory")?.Asset.Name ?? "") && t.SourceLocation == "ClothAccessory");
					if (!!gagTarget) {
						this.ApplyGag(target, target, gagTarget, location, gagTarget.SourceLocation ?? "Necklace");
					}
					return next(args);
				}
			}
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
					TargetAction: "SourceCharacter pulls out TargetCharacter's UsedAsset, letting it hang around their neck.",
					TargetSelfAction: "SourceCharacter pulls the UsedAsset out of PronounPossessive mouth and lets it hang around PronounPossessive mouth.",
					SelfAllowed: true
				}
			],
			CustomPrereqs: [
				{
					Name: "TargetIsGaggedWithNecklace",
					Func: (acting, acted, group) => {
						var location = acted.FocusGroup?.Name!;
						var item = InventoryGet(acted, location);
						
						if (!!item) {
							if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
								return false;

							var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber!);
							if (!item && !ValidationCanRemoveItem(item!, validParams, false))
								return false;
						}

						var gagTarget = this.NeckTargets.find(t => t.MouthItemName == item?.Asset.Name);

						return !InventoryGet(acted, gagTarget?.SourceLocation ?? "Necklace") && this.NeckTargets.map(t => t.MouthItemName).indexOf(item?.Asset.Name ?? "") > -1;
					}
				}
			],
			CustomAction: {
				Func: (target, args, next) => {
					if (!target)
						return;
					var location = target.FocusGroup?.Name!;
					let mouthItemName = InventoryGet(target, location)?.Asset.Name ?? "";
					let gagTarget = this.NeckTargets.find(t => t.MouthItemName == mouthItemName);
					if (!!gagTarget)
						this.TakeGag(target, target, gagTarget, location, gagTarget?.SourceLocation ?? "Necklace");
					return next(args);
				}
			}
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
						var location = acted.FocusGroup?.Name!;
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
			}
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
			}
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
		let incapacitatedMod = getModule<BoopsModule>("BoopsModule")?.IsIncapacitated ? (isAggressor ? 5 : 100) * -1 : 0;
		
		let finalMod = dominanceMod + ownershipMod + restrainedMod + edgingMod + incapacitatedMod;
	
		console.debug(`${CharacterNickname(C)} is ${isAggressor ? 'rolling against' : 'defending against'} ${!Opponent ? "nobody" : CharacterNickname(Opponent)} [${finalMod}] --
		dominanceMod: ${dominanceMod}
		ownershipMod: ${ownershipMod}
		restrainedMod: ${restrainedMod}
		edgingMod: ${edgingMod}
		incapacitatedMod: ${incapacitatedMod}
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

	ApplyGag(target: Character, source: Character, gagTarget: GagTarget, location: string, sourceLocation: string = "ItemHandheld") {
		var gagItem = InventoryGet(source, sourceLocation);
		if (gagItem?.Asset.Name == gagTarget.SourceItemName) {
			if (!gagTarget.LeaveHandItem) InventoryRemove(source, sourceLocation, true);
			var color = this._handleWeirdColorStuff(gagItem, gagTarget, sourceLocation, location);
			var gag = InventoryWear(target, gagTarget.MouthItemName, location, color, undefined, source.MemberNumber, gagItem?.Craft, true);
			if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
				var prefType = gagTarget.PreferredTypes.find(tgt => tgt.Location == location) ?? gagTarget.PreferredTypes[0];
				gag!.Property!.Type = prefType.Type;
			}
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
    }

	_handleWeirdColorStuff(itemToMove: Item, gagTarget: GagTarget, sourceLocation: string, targetLocation: string): ItemColor | undefined {
		var color = itemToMove?.Color;
		// BallGag necklace + mouth gag alternate order...
		if (!!color && gagTarget.MouthItemName == "BallGag") {
			if ((sourceLocation.startsWith("ItemMouth") && targetLocation == "Necklace") ||
				(sourceLocation == "Necklace" && targetLocation.startsWith("ItemMouth")))
				color = (<string[]>(<ItemColor>color)).reverse();
		}
		return color;
	}

	TakeGag(target: Character, source: Character, gagTarget: GagTarget, location: string, targetLocation: string = "ItemHandheld") {
		var gag = InventoryGet(target, location);
		var existing = InventoryGet(source, targetLocation);
		if (!gag || !!existing || gag.Asset.Name != gagTarget.MouthItemName)
			return;
		var validParams = ValidationCreateDiffParams(target, source.MemberNumber!);
		if (ValidationCanRemoveItem(gag!, validParams, false)) {
			InventoryRemove(target, location, true);
			var craft = gag.Craft;
			if (!!craft)
				craft.Lock = "";
			var color = this._handleWeirdColorStuff(gag, gagTarget, location, targetLocation);
			let item = InventoryWear(source, gagTarget.SourceItemName, targetLocation, color, undefined, source.MemberNumber, craft, true);
			if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
				var prefType = gagTarget.PreferredTypes.find(tgt => tgt.Location == targetLocation) ?? gagTarget.PreferredTypes[0];
				item!.Property!.Type = prefType.Type;
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
		InventoryRemove(source, "ItemHandheld", true);
		InventoryWear(target, item?.Asset.Name!, "ItemHandheld", item?.Color, item?.Difficulty, source.MemberNumber, item?.Craft, true);
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
			InventoryRemove(target, "ItemHandheld", true);
			InventoryWear(source, item.Asset.Name, "ItemHandheld", item.Color, item.Difficulty, source.MemberNumber, item.Craft, true);
			setTimeout(() => ChatRoomCharacterUpdate(source));
			setTimeout(() => ChatRoomCharacterUpdate(target));
		}
		else {
			SendAction(`${CharacterNickname(source)} ${check.AttackerRoll.TotalStr}fails to steal ${CharacterNickname(target)}'s ${check.DefenderRoll.TotalStr}${this.getItemName(item)} and is dazed from the attempt!`);
			this.failedStealTime = CommonTime();
		}
	}

	ManualGenerateItemActivitiesForNecklaceActivity(allowed: ItemActivity[], acting: Character, acted: Character, needsItem: string, activity: Activity) {
		const items = CharacterItemsForActivity(acted, needsItem);
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
			if (types.some((type) => InventoryIsAllowedLimited(acted, item, type ?? ""))) {
				blocked = "limited";
			} else if (types.some((type) => InventoryBlockedOrLimited(acted, item, type))) {
				blocked = "blocked";
			} else if (InventoryGroupIsBlocked(acting, /** @type {AssetGroupItemName} */(item.Asset.Group.Name))) {
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