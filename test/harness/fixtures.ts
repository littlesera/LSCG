// Hand-built fixtures standing in for Bondage Club (BC) data. bc-stubs ships types
// only -- there is no runtime BC asset data anywhere in this repo or its
// dependencies -- so every Asset/AssetGroup/Item/Character used by the "unit"
// project is built here.
//
// Character methods that the mod reads (IsRestrained, CanTalk, HasPenis, ...) are
// backed by a plain `flags` bag on the fixture, so a test can just do
// `C.flags.restrained = true` instead of re-mocking a method.
import { vi } from "vitest";

export interface CharacterFlags {
	isPlayer: boolean;
	pronouns: "HeHim" | "SheHer" | "TheyThem";
	canTalk: boolean;
	canWalk: boolean;
	canInteract: boolean;
	restrained: boolean;
	mouthBlocked: boolean;
	mouthOpen: boolean;
	blindLevel: number;
	deafLevel: number;
	vulvaChaste: boolean;
	hasPenis: boolean;
	enclosed: boolean;
	kneeling: boolean;
	standing: boolean;
	edged: boolean;
	gagged: boolean;
	canKneel: boolean;
}

export function defaultFlags(overrides: Partial<CharacterFlags> = {}): CharacterFlags {
	return {
		isPlayer: false,
		pronouns: "SheHer",
		canTalk: true,
		canWalk: true,
		canInteract: true,
		restrained: false,
		mouthBlocked: false,
		mouthOpen: true,
		blindLevel: 0,
		deafLevel: 0,
		vulvaChaste: false,
		hasPenis: false,
		enclosed: false,
		kneeling: false,
		standing: true,
		edged: false,
		gagged: false,
		canKneel: true,
		...overrides,
	};
}

export interface FixtureCharacter {
	MemberNumber: number;
	Name: string;
	Nickname?: string;
	ID: number;
	Appearance: FixtureItem[];
	Wardrobe?: FixtureItem[][];
	FriendList: number[];
	GhostList: number[];
	WhiteList: number[];
	BlackList: number[];
	OwnerMemberNumber?: number;
	LoverMemberNumber?: number[];
	ChatSettings: { ColorTheme: string };
	Reputation: { Type: string; Value: number }[];
	ArousalSettings: { Progress: number };
	AssetFamily: string;
	// Real BC's per-extension save blob (OutfitCollection's server storage strategy reads
	// its own key from this directly during load()).
	ExtensionSettings: Record<string, string>;
	// Real BC's currently-drawn facial expression per group; AstralProjectionState writes
	// to it unconditionally on Recover() (even for a state that was never activated).
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ActiveExpression: Record<string, any>;
	// LSCG's own settings blob, present on both Player and other LSCG-running characters.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	LSCG?: any;
	// Character's visual height ratio, read by ResizedState's hooks
	HeightRatio?: number;
	flags: CharacterFlags;
	GetPronouns: () => "HeHim" | "SheHer" | "TheyThem";
	IsPlayer: () => boolean;
	CanTalk: () => boolean;
	CanWalk: () => boolean;
	CanInteract: () => boolean;
	CanChangeClothesOn: (...args: unknown[]) => boolean;
	IsRestrained: () => boolean;
	IsMouthBlocked: () => boolean;
	IsMouthOpen: () => boolean;
	GetBlindLevel: () => number;
	GetDeafLevel: () => number;
	IsVulvaChaste: () => boolean;
	HasPenis: () => boolean;
	IsEnclose: () => boolean;
	IsKneeling: () => boolean;
	IsStanding: () => boolean;
	HasTints: () => boolean;
	GetTints: () => unknown[];
	GetBlurLevel: () => number;
	IsOwnedByMemberNumber: (n: number) => boolean;
	IsLoverOfMemberNumber: (n: number) => boolean;
	IsEdged: () => boolean;
	IsGagged: () => boolean;
	CanKneel: () => boolean;
}

let nextMemberNumber = 100000;

export function makeCharacter(overrides: Omit<Partial<FixtureCharacter>, "flags"> & { flags?: Partial<CharacterFlags> } = {}): FixtureCharacter {
	const memberNumber = overrides.MemberNumber ?? nextMemberNumber++;
	const flags = defaultFlags(overrides.flags);
	const c: FixtureCharacter = {
		MemberNumber: memberNumber,
		Name: overrides.Name ?? `Char${memberNumber}`,
		Nickname: overrides.Nickname,
		ID: overrides.ID ?? memberNumber,
		Appearance: overrides.Appearance ?? [],
		Wardrobe: overrides.Wardrobe,
		FriendList: overrides.FriendList ?? [],
		GhostList: overrides.GhostList ?? [],
		WhiteList: overrides.WhiteList ?? [],
		BlackList: overrides.BlackList ?? [],
		OwnerMemberNumber: overrides.OwnerMemberNumber,
		LoverMemberNumber: overrides.LoverMemberNumber ?? [],
		ChatSettings: overrides.ChatSettings ?? { ColorTheme: "Dark" },
		Reputation: overrides.Reputation ?? [],
		ArousalSettings: overrides.ArousalSettings ?? { Progress: 0 },
		AssetFamily: overrides.AssetFamily ?? "Female3DCG",
		ExtensionSettings: overrides.ExtensionSettings ?? {},
		ActiveExpression: overrides.ActiveExpression ?? {},
		LSCG: overrides.LSCG,
		HeightRatio: overrides.HeightRatio ?? 1,
		flags,
		// Every method below is a regular `function` reading `this.flags`/`this.X`, never an
		// arrow function closing over this call's local `flags`/`c` variables. Two reasons,
		// both stemming from resetWorld() (world.ts) mutating Player *in place* rather than
		// replacing it:
		//  1. resetWorld() deliberately never overwrites a Player method that already exists
		//     (see its own comment) -- hookFunction("Player.CanWalk", ...) installs the SDK's
		//     router directly onto that exact property the first time it's hooked, and
		//     overwriting it on a later reset would silently disable the hook for the rest of
		//     the file. That means these method closures are only ever created ONCE per test
		//     file (from globals.ts's initial Player), so a closure capturing this call's
		//     local `flags` would keep reading that first call's now-stale object forever.
		//  2. Reading `this.flags`/`this.X` instead always reflects whatever `flags`/data
		//     object resetWorld() has mutated *this* Player's `.flags` (or `.OwnerMemberNumber`
		//     etc.) into, regardless of which call created the method itself.
		GetPronouns(this: FixtureCharacter) { return this.flags.pronouns; },
		IsPlayer(this: FixtureCharacter) { return this.flags.isPlayer; },
		CanTalk(this: FixtureCharacter) { return this.flags.canTalk; },
		CanWalk(this: FixtureCharacter) { return this.flags.canWalk; },
		CanInteract(this: FixtureCharacter) { return this.flags.canInteract; },
		CanChangeClothesOn: () => true,
		IsRestrained(this: FixtureCharacter) { return this.flags.restrained; },
		IsMouthBlocked(this: FixtureCharacter) { return this.flags.mouthBlocked; },
		IsMouthOpen(this: FixtureCharacter) { return this.flags.mouthOpen; },
		GetBlindLevel(this: FixtureCharacter) { return this.flags.blindLevel; },
		GetDeafLevel(this: FixtureCharacter) { return this.flags.deafLevel; },
		IsVulvaChaste(this: FixtureCharacter) { return this.flags.vulvaChaste; },
		HasPenis(this: FixtureCharacter) { return this.flags.hasPenis; },
		IsEnclose(this: FixtureCharacter) { return this.flags.enclosed; },
		IsKneeling(this: FixtureCharacter) { return this.flags.kneeling; },
		IsStanding(this: FixtureCharacter) { return this.flags.standing; },
		IsGagged(this: FixtureCharacter) { return this.flags.gagged; },
		CanKneel(this: FixtureCharacter) { return this.flags.canKneel; },
		HasTints: () => false,
		GetTints: () => [],
		GetBlurLevel: () => 0,
		IsEdged(this: FixtureCharacter) { return this.flags.edged; },
		IsOwnedByMemberNumber(this: FixtureCharacter, n: number) {
			return this.OwnerMemberNumber === n;
		},
		IsLoverOfMemberNumber(this: FixtureCharacter, n: number) {
			return (this.LoverMemberNumber ?? []).includes(n);
		},
	};
	return c;
}

// ---- Assets / groups / items -----------------------------------------------

export interface FixtureAssetGroup {
	Name: string;
	Family: string;
	Category: "Appearance" | "Item";
	AllowNone: boolean;
	Clothing: boolean;
	Underwear: boolean;
	BodyCosplay: boolean;
	IsAppearance: () => boolean;
}

export interface FixtureAsset {
	Name: string;
	Group: FixtureAssetGroup;
	Description: string;
	AllowEffect?: string[];
	OwnerOnly?: boolean;
	LoverOnly?: boolean;
	FamilyOnly?: boolean;
	Enable?: boolean;
	Layer?: { Opacity?: number }[];
	/** Real BC's Asset.DynamicName(C) resolves a possibly-localized display name; utils.ts's
	 *  permission checks (InventoryBlockedOrLimited) call it directly, so it must exist. */
	DynamicName: (C?: FixtureCharacter) => string;
}

export interface FixtureItem {
	Asset: FixtureAsset;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Property?: Record<string, any>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Craft?: Record<string, any>;
}

/**
 * Registers a group into the global `AssetGroup` array (smartGetAssetGroup and BC's
 * own group lookups check it with `.includes`/`.find`), and returns it.
 */
export function makeGroup(overrides: Partial<FixtureAssetGroup> & { Name: string }): FixtureAssetGroup {
	const g: FixtureAssetGroup = {
		Family: "Female3DCG",
		Category: "Item",
		AllowNone: true,
		Clothing: false,
		Underwear: false,
		BodyCosplay: false,
		IsAppearance: () => g.Category === "Appearance",
		...overrides,
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const groups = (globalThis as any).AssetGroup as FixtureAssetGroup[];
	const existingIx = groups.findIndex(existing => existing.Name === g.Name && existing.Family === g.Family);
	if (existingIx >= 0) groups.splice(existingIx, 1, g);
	else groups.push(g);
	return g;
}

/** Registers an asset into the global `Asset` array (same rationale as makeGroup). */
export function makeAsset(group: FixtureAssetGroup, overrides: Partial<FixtureAsset> & { Name: string }): FixtureAsset {
	const a: FixtureAsset = {
		Group: group,
		Description: overrides.Name,
		DynamicName: () => overrides.Name,
		...overrides,
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const assets = (globalThis as any).Asset as FixtureAsset[];
	const existingIx = assets.findIndex(existing => existing.Name === a.Name && existing.Group === a.Group);
	if (existingIx >= 0) assets.splice(existingIx, 1, a);
	else assets.push(a);
	return a;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeItem(asset: FixtureAsset, extra: { Property?: Record<string, any>; Craft?: Record<string, any> } = {}): FixtureItem {
	return { Asset: asset, Property: extra.Property, Craft: extra.Craft };
}

/**
 * Snapshots a character's *current* field values into a plain, independent object.
 * Needed before treating `Player` as "the other party" in a later resetWorld() call:
 * resetWorld() mutates the *same* Player object in place (see world.ts), so a bare
 * reference to it (e.g. `const sender = resetWorld(...)`) reflects whatever
 * resetWorld() last wrote, not what it was when you captured the reference.
 */
export function snapshotCharacter(C: FixtureCharacter): FixtureCharacter {
	return { ...C };
}

/** Equips `item` into `C.Appearance`, replacing anything already in that item's group. */
export function wear(C: FixtureCharacter, item: FixtureItem): FixtureItem {
	C.Appearance = C.Appearance.filter(existing => existing.Asset.Group.Name !== item.Asset.Group.Name);
	C.Appearance.push(item);
	return item;
}

export function resetAssetRegistry(): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	g.AssetGroup = [];
	g.Asset = [];
}

/** Small helper for tests that just want a spy without caring about the return value. */
export function spy<T extends (...args: never[]) => unknown>(impl?: T) {
	return vi.fn(impl);
}
