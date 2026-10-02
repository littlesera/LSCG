// Minimal, real (not mocked) implementations of the Bondage Club (BC) globals LSCG
// leans on, plus `vi.fn()` stubs for every BC function any LSCG module hooks with
// `hookFunction`. The real bondage-club-mod-sdk resolves `window[name]` (and dotted
// paths like `window.Player.CanWalk`) the moment `hookFunction` is called, so every
// target it might touch must already exist as a function -- see the SDK's `l()` in
// node_modules/bondage-club-mod-sdk/dist/bcmodsdk.js.
//
// installHookTargetStubs()/installNetworkCapture() are also used by the "bc" project
// (test/setup/bc-loader.ts): that tier loads *real* BC scripts for real Asset/
// Character/Inventory data, but real BC's own GUI/canvas files (which define these
// same hook targets for real) are deliberately never loaded, and network/save
// side effects need capturing there too. installBcLite() (everything, including
// fake simple implementations of InventoryGet/CharacterNickname/etc.) is only for
// the "unit" project.
import { vi } from "vitest";
import * as LZStringLib from "lz-string";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

/** Bare (non-dotted) globals that at least one LSCG module hooks with hookFunction. */
const HOOK_TARGETS = [
	"LoginResponse", "ChatRoomSafewordRevert", "ChatRoomSafewordRelease", "ChatRoomMessage",
	"TextLoad", "ServerSend", "ActivityCheckPrerequisite", "CharacterItemsForActivity",
	"PreferenceGetActivityFactor", "InventoryRemove", "ChatRoomDoHoldLeash", "ChatRoomDoStopHoldLeash",
	"TimerProcess", "ChatRoomSync", "ServerAccountBeep", "ChatRoomDrawCharacterStatusIcons",
	"DialogInventoryBuild", "CommandParse", "DrawArousalMeter", "ServerPlayerIsInChatRoom",
	"DialogLoad", "DialogLeave", "DialogResize", "ActivityGenerateItemActivitiesFromNeed",
	"StruggleMinigameStart", "StruggleMinigameStop", "DrawStatus", "DialogFacialExpressionsLoad",
	"ChatRoomLeave", "ChatRoomCharacterViewDrawOverlay", "ChatRoomCharacterViewClickCharacter",
	"ChatRoomCanBeLeashedBy", "ChatRoomPingLeashedPlayers", "ChatRoomDoPingLeashedPlayers",
	"ServerHandleLeashBeep", "ChatRoomBreakLeash", "ChatRoomMapViewLeash", "ChatRoomActivateView",
	"RgbaArrayToHTMLColor", "DrawImageResize", "ChatRoomMapViewDrawGrid", "ChatRoomMapViewSyncMapData",
	"ChatRoomSyncRoomProperties", "ChatRoomMapViewUpdatePlayerFlag", "ChatRoomMapViewMouseWheel",
	"ChatRoomMapViewUpdateFlag", "CharacterLoadCanvas", "ChatRoomMapViewClick", "DialogDraw",
	"DialogClick", "InformationSheetRun", "InformationSheetClick", "InformationSheetExit",
	"ItemColorLoad", "ItemColorRevert", "ColorPickerExit", "CommonCallFunctionByNameWarn",
	"CommonDrawAppearanceBuild", "CommonDrawApplyLayerAlphaMasks", "AssetLayerSort",
	"CharacterAppearanceSortLayers", "ActivityOrgasmStart", "ChatRoomDrawArousalOverlay",
	"ChatRoomClick", "CraftingModeSet", "CraftingResize", "AnimationRequestDraw",
	"CommonDrawResolveLayerExpression", "CommonCallFunctionByName", "PoseSetActive", "PoseAvailable",
	"PoseCanChangeUnaidedStatus", "ActivityAllowedForGroup", "CommonSetScreen", "ActivityBuildChatTag",
	"SpeechTransformProcess", "CharacterSetFacialExpression", "CharacterAppearanceGetCurrentValue",
	"DrawCharacter", "CharacterGetCurrent", "CharacterRefresh", "ChatRoomGenerateChatRoomChatMessage",
	"InventoryGroupIsBlockedForCharacter", "ChatRoomCanAttemptStand", "ChatRoomCanAttemptKneel",
	"CharacterCanKneel", "PoseCanChangeUnaided", "ChatRoomMessageDisplay", "ActivitySetArousalTimer",
	"ServerDisconnect",
] as const;

/** Dotted hook targets: `["Player", "CanWalk"]` needs `window.Player.CanWalk` to exist. */
const DOTTED_HOOK_TARGETS: [string, string][] = [
	["Player", "GetBlurLevel"], ["Player", "HasTints"], ["Player", "GetTints"], ["Player", "CanWalk"],
	["Player", "IsKneeling"], ["Player", "IsStanding"], ["Player", "IsEnclose"],
	["ElementButton", "CreateForActivity"], ["ElementButton", "CreateForAsset"],
	["DialogMenuMapping", "items"], // items.Load/.Resize/.Exit/.Unload handled specially below
	// crafted.Reload (3-level path) handled specially below, not as a 2-level dotted target
	["CraftingDescription", "DecodeToHTML"],
	["CraftingEventListeners", "_ChangeDescription"],
	["CurrentScreenFunctions", "Resize"],
	["DialogSelfMenuMapping", "Pose"], // Pose._ClickButton handled specially below
];

function ensurePath(root: Record<string, unknown>, path: string[]): Record<string, unknown> {
	let node = root;
	for (const key of path) {
		if (typeof node[key] !== "object" || node[key] === null) node[key] = {};
		node = node[key] as Record<string, unknown>;
	}
	return node;
}

/**
 * The `vi.fn()` originally created for each bare hook target, keyed by name -- populated
 * once, the first time `ensureFn` creates it. Needed because `hookFunction(name, ...)`
 * (real bcModSdk) *overwrites* `globalThis[name]` with its own router the moment anything
 * hooks it (`e[r.contextProperty] = r.router` in bcmodsdk.js), which is a plain function,
 * not a mock -- so `globalThis[name].mock`/`.mockClear()` stop working on it after that.
 * Since bc-lite.ts installs every stub *before* any module's `load()` runs, and a module a
 * test isn't even testing may still hook a shared global (e.g. AstralProjectionState hooks
 * "CharacterSetFacialExpression" and "PoseSetActive" in its own Init()), a test asserting on
 * calls to such a global should use `rawStub(name)` here instead of `globalThis[name]`
 * directly -- the router still calls through to this exact same original function via its
 * `next()` chain, so its call history stays accurate regardless of who else hooked it.
 */
const rawHookStubs = new Map<string, ReturnType<typeof vi.fn>>();

function ensureFn(root: Record<string, unknown>, path: string[]): AnyFn {
	const parent = ensurePath(root, path.slice(0, -1));
	const leaf = path[path.length - 1];
	if (typeof parent[leaf] !== "function") {
		const stub = vi.fn();
		parent[leaf] = stub;
		if (path.length === 1 && !rawHookStubs.has(path[0])) rawHookStubs.set(path[0], stub);
	}
	return parent[leaf] as AnyFn;
}

/** The original `vi.fn()` for a bare hook target, even if something has since hooked it
 *  (see the comment on `rawHookStubs` above). Returns `undefined` for a target that isn't
 *  a plain bare global (dotted paths like "Player.CanWalk" aren't tracked here). */
export function rawStub(name: string): ReturnType<typeof vi.fn> | undefined {
	return rawHookStubs.get(name);
}

/** Stubs every hookFunction target neither tier's loaded scripts define for real. */
export function installHookTargetStubs(g: Record<string, unknown> = globalThis as unknown as Record<string, unknown>): void {
	for (const name of HOOK_TARGETS) ensureFn(g, [name]);
	for (const [obj, prop] of DOTTED_HOOK_TARGETS) ensureFn(g, [obj, prop]);
	// DialogMenuMapping.items.{Load,Resize,Exit,Unload} and DialogSelfMenuMapping.Pose._ClickButton
	ensureFn(g, ["DialogMenuMapping", "items", "Load"]);
	ensureFn(g, ["DialogMenuMapping", "items", "Resize"]);
	ensureFn(g, ["DialogMenuMapping", "items", "Exit"]);
	ensureFn(g, ["DialogMenuMapping", "items", "Unload"]);
	ensureFn(g, ["DialogMenuMapping", "crafted", "Reload"]);
	ensureFn(g, ["DialogSelfMenuMapping", "Pose", "_ClickButton"]);
}

export interface BcLite {
	ServerSend: ReturnType<typeof vi.fn>;
	ChatRoomSendLocal: ReturnType<typeof vi.fn>;
	ChatRoomCharacterUpdate: ReturnType<typeof vi.fn>;
	ServerPlayerExtensionSettingsSync: ReturnType<typeof vi.fn>;
}

/**
 * Replaces network/save/UI-output globals with capturing `vi.fn()`s, in both
 * tiers -- neither one should make real network calls or write real DOM outside
 * of what LSCG_SendLocalPrompt needs (see the ChatRoomSendLocal comment below).
 */
export function installNetworkCapture(g: Record<string, unknown> = globalThis as unknown as Record<string, unknown>): BcLite {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const gg = g as any;
	gg.ServerSend = gg.ServerSend?._isMockFunction ? gg.ServerSend : vi.fn();
	// LSCG_SendLocalPrompt (utils.ts) wires button onClick handlers with
	// document.getElementById() right after this call, so this has to actually
	// insert DOM nodes (not just record the call) for a test to be able to click
	// a prompt's buttons and drive ConsentModule's accept/refuse/force flow.
	gg.ChatRoomSendLocal = gg.ChatRoomSendLocal?._isMockFunction
		? gg.ChatRoomSendLocal
		: vi.fn((html: string) => {
			const container = document.createElement("div");
			container.innerHTML = html;
			document.body.appendChild(container);
		});
	gg.ChatRoomCharacterUpdate = gg.ChatRoomCharacterUpdate?._isMockFunction ? gg.ChatRoomCharacterUpdate : vi.fn();
	gg.ServerPlayerExtensionSettingsSync = gg.ServerPlayerExtensionSettingsSync?._isMockFunction ? gg.ServerPlayerExtensionSettingsSync : vi.fn();
	return {
		ServerSend: gg.ServerSend,
		ChatRoomSendLocal: gg.ChatRoomSendLocal,
		ChatRoomCharacterUpdate: gg.ChatRoomCharacterUpdate,
		ServerPlayerExtensionSettingsSync: gg.ServerPlayerExtensionSettingsSync,
	};
}

/** Installs (or re-stubs) everything the "unit" project needs. Safe to call multiple times. */
export function installBcLite(): BcLite {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;

	g.LZString = LZStringLib;
	g.GameVersion = "R132";
	g.CurrentScreen = "ChatRoom";
	g.CurrentModule = "Online";
	g.ChatRoomData = { Admin: [] as number[] };
	g.ChatRoomHideIconState = 0;
	g.DialogMenuMode = "";
	// Read (but not hooked) by SleepState/HypnoState's constructors to decide whether to
	// refresh the open expression panel -- harmless as long as it isn't "Expression".
	g.DialogSelfMenuSelected = "";
	// CurrentCharacter is read by ResizedState's CharacterAppearanceGetCurrentValue hook to
	// check if a dialog is currently open (and thus whether to apply height modifications).
	g.CurrentCharacter = undefined;
	g.DialogMenuMapping = g.DialogMenuMapping ?? {};
	g.DialogSelfMenuMapping = g.DialogSelfMenuMapping ?? {};
	// StateModule.load() writes a click-status callback directly onto this (not via hookFunction).
	g.DialogSelfMenuMapping.Expression = g.DialogSelfMenuMapping.Expression ?? {
		clickStatusCallbacks: {},
		menubarEventListeners: { blink: {}, clear: {} },
	};
	g.CraftingAssets = g.CraftingAssets ?? {};
	g.TEXT_NOT_FOUND_PREFIX = "MISSING TEXT: ";
	g.MainCanvas = { save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn() };

	installHookTargetStubs(g);
	// GetItemNameAndDescriptionConcat (utils.ts) reads CraftingDescription.Decode directly
	// (not a hookFunction target) once CraftingDescription exists at all -- ensureFn's
	// DecodeToHTML stub above already makes it an object, so this needs adding separately.
	g.CraftingDescription.Decode = (s: string) => s;

	// ---- Inventory / permission surface (real, simple implementations) --------
	g.InventoryGet = (C: { Appearance?: { Asset: { Group: { Name: string } } }[] }, group: string) =>
		C?.Appearance?.find(i => i.Asset.Group.Name === group) ?? null;
	g.InventoryGetItemProperty = (C: unknown, group: string, prop: string) => g.InventoryGet(C, group)?.Property?.[prop];
	g.InventoryGetLock = (item: { Property?: { LockedBy?: string } }) =>
		item?.Property?.LockedBy ? { Name: item.Property.LockedBy } : null;
	g.InventoryItemHasEffect = (item: { Property?: { Effect?: string[] } }, effect: string) =>
		!!item?.Property?.Effect?.includes(effect);
	g.InventoryGroupIsBlocked = vi.fn(() => false);
	g.InventoryPrerequisiteMessage = vi.fn(() => "");
	g.InventoryIsPermissionBlocked = vi.fn(() => false);
	g.InventoryIsPermissionLimited = vi.fn(() => false);
	// Real (not a no-op stub): utils.ts's ApplyItem/RemoveItem call these directly,
	// and several state tests (e.g. RedressedState's outfit-slot restore) depend
	// on Appearance actually changing, not just on the call happening.
	g.InventoryWear = vi.fn((C: { AssetFamily?: string; Appearance: { Asset: { Name: string; Group: { Name: string } } }[] }, name: string, group: string, color?: unknown, _difficulty?: unknown, _acting?: unknown, craft?: unknown) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const asset = (g.AssetGet as any)(C.AssetFamily ?? "Female3DCG", group, name);
		if (!asset) return null;
		const item = { Asset: asset, Property: {}, Color: color, Craft: craft };
		C.Appearance = C.Appearance.filter(i => i.Asset.Group.Name !== group);
		C.Appearance.push(item);
		return item;
	});
	g.InventoryRemove = vi.fn((C: { Appearance: { Asset: { Group: { Name: string } } }[] }, group: string) => {
		C.Appearance = C.Appearance.filter(i => i.Asset.Group.Name !== group);
	});
	g.ValidationCreateDiffParams = vi.fn(() => ({}));
	g.ValidationCanRemoveItem = vi.fn(() => true);
	g.LogQuery = vi.fn(() => false);
	g.InventoryDoesItemAllowLock = vi.fn(() => false);
	g.InventoryUnlock = vi.fn();
	g.InventoryChatRoomAllow = vi.fn(() => true);
	// utils.ts's BC_ItemToItemBundle() is a thin wrapper around this real-BC global.
	g.ServerBundledItemFromAppearanceItem = (item: { Asset: { Name: string; Group: { Name: string } }; Color?: unknown; Property?: unknown; Craft?: unknown }) =>
		({ Group: item.Asset.Group.Name, Name: item.Asset.Name, Color: item.Color, Property: item.Property, Craft: item.Craft });
	g.ItemPropertiesDecompress = vi.fn((_item: unknown, property: unknown) => property ?? {});
	g.AppearanceItem = { fromAsset: (asset: unknown) => ({ Asset: asset }) };

	// ---- Character / room -------------------------------------------------
	g.CharacterNickname = (C: { Nickname?: string; Name: string }) => C?.Nickname ?? C?.Name ?? "";
	g.CharacterPronoun = (C: { GetPronouns?: () => "HeHim" | "SheHer" | "TheyThem" }, key: string) => {
		const table: Record<string, Record<string, string>> = {
			HeHim: { Possessive: "his", Object: "him", Subject: "he" },
			SheHer: { Possessive: "her", Object: "her", Subject: "she" },
			TheyThem: { Possessive: "their", Object: "them", Subject: "they" },
		};
		return table[C?.GetPronouns?.() ?? "SheHer"]?.[key] ?? "their";
	};
	g.ServerChatRoomGetAllowItem = vi.fn(() => true);
	g.ServerPlayerIsInChatRoom = vi.fn(() => true);
	g.CommonTime = () => Date.now();
	g.CommonIsNumeric = (s: string) => typeof s === "string" && s.trim() !== "" && !Number.isNaN(Number(s));
	// Same as the game's, with its English joiners
	g.CommonArrayJoinPretty = (strings: string[]) => {
		const last = strings.pop();
		return `${strings.join(", ")}, and ${last}`;
	};
	g.MouseIn = vi.fn(() => false);
	g.WardrobeGetExpression = vi.fn(() => ({ Blush: "Default" }));
	g.AudioVolumeFromModifier = vi.fn((m: number) => m);
	g.AudioPlaySoundEffect = vi.fn();
	g.AudioShouldSilenceSound = vi.fn(() => true);
	g.ChatRoomIsViewActive = vi.fn(() => false);
	g.ChatRoomMapViewName = "MapView";
	g.SpeechGarbleByGagLevel = vi.fn((_gagLevel: unknown, msg: string) => msg);
	g.SpeechStutter = vi.fn((_C: unknown, msg: string) => msg);
	g.SpeechBabyTalk = vi.fn((_C: unknown, msg: string) => msg);
	g.SpeechGetTotalGagLevel = vi.fn(() => 0);
	g.CommonStringSubstitute = (msg: string) => msg;
	g.CommandCombine = vi.fn((...args: unknown[]) => args.flat());
	g.ActivityOrgasmPrepare = vi.fn();
	g.ActivitySetArousal = vi.fn();
	// Minigame presentation (canvas/GUI) is out of scope for this harness -- callers that
	// reach this just need it to exist and not throw; the observable state change they
	// cause happens before this is reached.
	g.MiniGameStart = vi.fn();
	g.DrawFlashScreen = vi.fn();
	// DeniedState/OrgasmSiphonedState's ActivityOrgasmStart hook assigns to this bare global
	// directly (not via a setter function) -- it must already exist or the assignment throws
	// a strict-mode ReferenceError.
	g.ActivityOrgasmRuined = false;
	g.SkillSetModifier = vi.fn();
	g.ActivityAllowed = vi.fn(() => true);
	g.ToastManager = { Show: vi.fn() };
	g.ChatRoomCharacter = g.ChatRoomCharacter ?? [];

	// ---- Activities ---------------------------------------------------------
	g.ActivityFemale3DCG = g.ActivityFemale3DCG ?? [];
	g.ActivityFemale3DCGOrdering = g.ActivityFemale3DCGOrdering ?? [];
	g.ActivityDictionary = g.ActivityDictionary ?? [];
	g.ActivityDictionaryLoad = vi.fn(() => ({ cache: {} }));
	g.ActivityDictionaryText = vi.fn((tag: string) => `${g.TEXT_NOT_FOUND_PREFIX}${tag}`);
	g.ActivityGetAllMirrorGroups = vi.fn((group: string) => [group]);

	// `ChatRoomMessageRunExtractors` derives {TargetMemberNumber, ActivityName, ...}
	// metadata from a message's Dictionary, the way BC's real chat pipeline does.
	g.ChatRoomMessageRunExtractors = (data: { Dictionary?: { Tag?: string; MemberNumber?: number; TargetCharacter?: number; text?: string; FocusGroupName?: string }[] }) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const metadata: Record<string, any> = {};
		for (const entry of data?.Dictionary ?? []) {
			if (entry.Tag === "DestinationCharacter" || entry.Tag === "TargetCharacterName") metadata.TargetMemberNumber = entry.MemberNumber;
			if (entry.Tag === "ActivityName") metadata.ActivityName = entry.text;
			// BC resolves this against the asset groups; the fake takes it as given.
			if (entry.FocusGroupName) metadata.GroupName = entry.FocusGroupName;
		}
		return { metadata };
	};

	installNetworkCapture(g);

	g.ChatRoomMessageHandlers = g.ChatRoomMessageHandlers ?? [];
	g.ChatRoomRegisterMessageHandler = vi.fn((handler: { Description?: string }) => g.ChatRoomMessageHandlers.push(handler));
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	g.IsMsgIdDictionaryEntry = (e: any) => e?.Tag === "MsgId";
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	g.IsReplyIdDictionaryEntry = (e: any) => e?.Tag === "ReplyId";
	g.PropertyShockPublishAction = vi.fn();
	// ItemUseModule.load() writes CraftingSlots.modeData.LSCGShare = {...}
	// directly (not via hookFunction), to register its own crafting-share mode.
	g.CraftingSlots = g.CraftingSlots ?? { modeData: {} };

	g.AssetGroup = g.AssetGroup ?? [];
	g.Asset = g.Asset ?? [];
	g.AssetGet = vi.fn((_family: string, groupName: string, name: string) =>
		(g.Asset as { Name: string; Group: { Name: string } }[]).find(a => a.Name === name && a.Group.Name === groupName) ?? null);
	// The raw per-family asset *definition* data BC loads from Female3DCG.js
	// (shape: [{Group, Asset: [...]}, ...]) -- distinct from the runtime
	// Asset/AssetGroup arrays above. Nothing in the "unit" tier has real family
	// definitions; an empty array is enough for code that just .filter()s it
	// (e.g. ItemUseModule.GetHempRopeLocations()).
	g.AssetFemale3DCG = g.AssetFemale3DCG ?? [];

	return {
		ServerSend: g.ServerSend,
		ChatRoomSendLocal: g.ChatRoomSendLocal,
		ChatRoomCharacterUpdate: g.ChatRoomCharacterUpdate,
		ServerPlayerExtensionSettingsSync: g.ServerPlayerExtensionSettingsSync,
	};
}

/** Resets every installed vi.fn()'s call history (not its custom mockImplementation). */
export function resetBcLiteSpies(): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	for (const name of HOOK_TARGETS) {
		if (g[name]?.mock) g[name].mockClear();
	}
	// A target some *other* module has hooked is no longer a mock on `globalThis` itself
	// (see the comment on `rawHookStubs`/`rawStub()`) -- clear the original stub directly.
	for (const stub of rawHookStubs.values()) stub.mockClear();
}
