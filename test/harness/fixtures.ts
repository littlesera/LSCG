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
		...overrides,
	};
}

export interface FixtureCharacter {
	MemberNumber: number;
	Name: string;
	Nickname?: string;
	ID: number;
	Appearance: FixtureItem[];
	FriendList: number[];
	GhostList: number[];
	WhiteList: number[];
	BlackList: number[];
	OwnerMemberNumber?: number;
	LoverMemberNumber?: number[];
	ChatSettings: { ColorTheme: string };
	// LSCG's own settings blob, present on both Player and other LSCG-running characters.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	LSCG?: any;
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
		FriendList: overrides.FriendList ?? [],
		GhostList: overrides.GhostList ?? [],
		WhiteList: overrides.WhiteList ?? [],
		BlackList: overrides.BlackList ?? [],
		OwnerMemberNumber: overrides.OwnerMemberNumber,
		LoverMemberNumber: overrides.LoverMemberNumber ?? [],
		ChatSettings: overrides.ChatSettings ?? { ColorTheme: "Dark" },
		LSCG: overrides.LSCG,
		flags,
		GetPronouns: () => flags.pronouns,
		IsPlayer: () => flags.isPlayer,
		CanTalk: () => flags.canTalk,
		CanWalk: () => flags.canWalk,
		CanInteract: () => flags.canInteract,
		CanChangeClothesOn: () => true,
		IsRestrained: () => flags.restrained,
		IsMouthBlocked: () => flags.mouthBlocked,
		IsMouthOpen: () => flags.mouthOpen,
		GetBlindLevel: () => flags.blindLevel,
		GetDeafLevel: () => flags.deafLevel,
		IsVulvaChaste: () => flags.vulvaChaste,
		HasPenis: () => flags.hasPenis,
		IsEnclose: () => flags.enclosed,
		IsKneeling: () => flags.kneeling,
		IsStanding: () => flags.standing,
		HasTints: () => false,
		GetTints: () => [],
		GetBlurLevel: () => 0,
		// Regular `function`s reading `this`, not arrow functions closing over
		// `c`: resetWorld() (world.ts) mutates Player in place via
		// `Object.assign(Player, freshCharacter)`, which copies these method
		// *references* onto Player but leaves OwnerMemberNumber/LoverMemberNumber
		// as plain copied values, not shared storage. An arrow function closing
		// over this call's `c` would keep reading `c`'s now-disconnected values
		// forever after such a copy, ignoring any later `Player.OwnerMemberNumber
		// = x` a test does. Reading `this.OwnerMemberNumber` instead always
		// reflects whatever object the method is actually called on.
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
