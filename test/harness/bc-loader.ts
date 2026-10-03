// Loads real BC client scripts (fetched/cached by scripts/bc-client.mjs) into the
// *current test file's own* jsdom realm, giving real Asset/AssetGroup/Character
// data and logic instead of hand-built fixtures. Used by the "bc" Vitest project
// only -- see test/setup/bc-globals.ts.
//
// Mechanics: Vitest's jsdom environment constructs its JSDOM instance with
// `runScripts: "dangerously"` and exposes that instance as the global `jsdom`
// (see node_modules/vitest/jsdom.d.ts) -- the same internal VM context vitest
// itself uses to run this very test file. `vm.runInContext` against
// `jsdom.getInternalVMContext()` therefore gives real top-level `var`/`function`
// hoisting onto the *same* `window`/`globalThis` our test code and LSCG's own
// source modules see, unlike `window.eval()` (which does not attach top-level
// declarations to `window` when called from outside jsdom's own script execution).
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_FILES } from "../../scripts/bc-client.mjs";
import { installHookTargetStubs, installNetworkCapture } from "./bc-lite";
import * as LZStringLib from "lz-string";

/**
 * Functions real BC only defines in GUI/canvas files this loader deliberately
 * never loads (chat-room character/map view switching, the color picker, etc.),
 * referenced -- but for our purposes never *called* -- at the top level of a
 * loaded file. Discovered empirically (see the milestone-2 exploration); if a
 * future BC version adds a new one, the loader throws a clear
 * "X is not defined" pointing at the offending file, and it belongs here.
 */
const HARMLESS_LOAD_TIME_STUBS = [
	"ChatRoomCharacterViewRun", "ChatRoomCharacterViewDraw", "ChatRoomCharacterViewDrawUi",
	"ChatRoomCharacterViewClick", "ChatRoomCharacterViewKeyDown", "ChatRoomCharacterViewCanLeave",
	"ChatRoomCharacterViewScreenshot", "ChatRoomMapViewActivate", "ChatRoomMapViewDeactivate",
	"ChatRoomMapViewRun", "ChatRoomMapViewDraw", "ChatRoomMapViewDrawUi", "ChatRoomMapViewClick",
	"ChatRoomMapViewMouseDown", "ChatRoomMapViewMouseUp", "ChatRoomMapViewMouseMove",
	"ChatRoomMapViewMouseWheel", "ChatRoomMapViewKeyDown", "ChatRoomMapViewKeyUp",
	"ChatRoomMapViewRoomUpdated", "ChatRoomMapViewCanStartWhisper", "ChatRoomMapViewCanLeave",
	"ChatRoomMapViewScreenshot", "ChatRoomMapViewResize",
	// Called eagerly inside CharacterCreate() for cosmetic report data this tier
	// doesn't care about (saved color-picker swatches).
	"GetDefaultSavedColors",
];

let loadedOnce = false;

/**
 * Common.js forward-declares these at the top (`var Player;`, etc.) and assigns
 * them for real later (during login, in files we don't load, or -- for Player --
 * by bc-globals.ts's own evalInBcRealm() call). Since the *key* already exists
 * from the forward declaration, a "is this a new key" diff (see
 * runAndCollectNewKeys()) never notices a later reassignment, so these are
 * always re-synced by *value* instead, wherever evalInBcRealm() is used.
 */
const CORE_MUTABLE_GLOBALS = ["Player", "CurrentModule", "CurrentScreen", "CurrentScreenFunctions", "CurrentCharacter"];

/**
 * Top-level `let`/`const` names across every file in ALL_FILES, found by a
 * crude brace-depth scan (scripts/find-lexical-globals.mjs used once to
 * generate this list -- see that file for how to regenerate it after a BC
 * version bump adds/removes files). Unlike `var`, a script-level `let`/`const`
 * does *not* become an own property of `window` -- it lives in the realm's
 * separate global *lexical* environment, invisible to Object.keys(window) (and
 * so to runAndCollectNewKeys()'s diffing) even though other code in the same
 * realm can reference it by bare name. Bridging each by name (`globalThis.X =
 * X`) turns it into a real property so it participates in the normal sync.
 * A name that turns out not to be a real top-level binding (shadowed, actually
 * function-local, ...) is silently skipped rather than failing the whole load.
 */
const LEXICAL_GLOBALS_TO_BRIDGE = [
	"CommonChatTags", "TimeUnits", "CommonFontStacks", "FETCH_MAX_RETRIES", "FETCH_MAX_RETRY_BACKOFF_TIME",
	"FETCH_RETRY_JITTER_MIN", "FETCH_RETRY_JITTER_MAX", "CommonGetFont", "CommonGetFontName",
	"DialogInventoryGrid", "DialogStruggleAction", "DialogStrugglePrevItem", "DialogStruggleNextItem",
	"DialogStruggleSelectMinigame", "DialogEffectIcons", "PoseAllKneeling", "PoseAllStanding", "PoseToMapping",
	"PoseChangeStatus", "AssetOverride", "PoseRecord", "PoseCategoryPriority", "AssetLocks", "PoseType",
	"AssetStringsPath", "ExtendedItemInitPropertyIgnore", "ExtendedXY", "ExtendedXYWithoutImages",
	"ExtendedXYClothes", "ExtendedXYClothesWithoutImages", "ExtendedItemRequirementCheckMessageMemo",
	"ExtendedItemGatherOptions", "ExtendedItemTighten", "ModularItemBase", "ModularItemDataLookup",
	"ModularItemChatSetting", "TypedItemDataLookup", "TypedItemChatSetting", "VariableHeightSliderId",
	"VariableHeightNumerId", "VariableHeightDataLookup", "VariableHeightChange", "VibratorModeOff",
	"VibratorModesAdvanced", "VibratorModeDataLookup", "VibratorModeUpdate", "VibratorModeStateUpdate",
	"PropertyOriginalValue", "PropertyOpacityChange", "PropertyAutoPunishHandled", "PropertyPunishActivityCache",
	"PropertyAutoPunishKeywords", "TextItemDataLookup", "TextItem", "TextItemChange", "TextItemChangeNoCanvas",
	"NoArchItemDataLookup", "NoArch", "PortalLinkCodeLength", "PortalLinkCodeText", "PortalLinkCodeRegex",
	"PortalLinkCodeInputID", "PortalLinkFunctionGrid", "PortalLinkTransmitterStatus",
	"PortalLinkTransmitterLastLinkCheck", "PortalLinkRandomCodeButton", "PortalLinkCopyCodeButton",
	"PortalLinkPasteCodeButton", "PortalLinkStatusColors", "InventoryItemPelvisLoveChastityBeltCrotchShield",
	"AssetsClothCheerleaderTopData", "ItemVulvaFuturisticVibratorAccessMode", "ItemVulvaFuturisticVibratorAccessModes",
	"ItemVulvaChastityCageExcitementLevel", "ItemVulvaChastityCageExcitementLevels",
	"ItemVulvaChastityCageExcitementLevelThresholdMap", "ItemVulvaTechnoChastityCageGetArousalThreshold",
	"CombinationPadlockPlayerIsBlind", "CombinationPadlockBlindCombinationOffset",
	"CombinationPadlockCombinationLastValue", "CombinationPadlockNewCombinationLastValue", "CombinationPadlockLoaded",
	"InventoryItemMiscPasswordPadlockPasswordRegex", "PasswordTimerChooseOptions", "PasswordTimerChooseOptionsIndex",
	"PasswordTimerChooseIndexes", "MistressTimerChooseOptions", "MistressTimerChooseOptionsIndex",
	"MistressTimerChooseIndexes", "OwnerTimerChooseOptions", "OwnerTimerChooseOptionsIndex",
	"OwnerTimerChooseIndexes", "TimerPadlockAccumulatedSeconds", "LactationPumpDuration", "AssetUpperOverflowAlpha",
	"AssetLowerOverflowAlpha", "AssetPoseMapping", "AssetMalePantiesList", "AssetMaleChasityCagesList",
	"ActivityFemale3DCGOrdering", "FetishFemale3DCGNames", "MainCanvasWidth", "MainCanvasHeight", "TempCanvas",
	"ColorCanvas", "DrawCacheImage", "DrawCacheTextureAlphaMasks", "DrawingGetTextSize",
	"DrawAssetPreviewDefaultWidth", "DrawAssetPreviewDefaultHeight", "RectFitIntoRect",
	"ServerChatRoomSupportedLanguages", "ServerScriptMessage", "ServerScriptWarningStyle", "ServerIsLoggedIn_",
	"ServerSendRateLimitQueue", "ServerSendRateLimitTimes", "ServerChatRoomSearchSettingsValidate",
	"ServerChatRoomDataValidate", "ServerDefaultTimeout", "ServerRoomSearchLastQueryTime",
	"ServerRoomSearchLastQuery", "ServerRoomJoinLastQuery", "ServerRoomJoinLastQueryTime", "ItemPropertiesDummy",
	"ExtendedArchetype", "ShopDropdownState", "Shop2Vars", "Shop2InitVars", "Shop2Consts", "TextScreenCache",
	"TextAllScreenCache", "TEXT_NOT_FOUND_PREFIX", "InterfaceStringsPath", "ItemColorConfig", "ItemColorMode",
	"ItemColorCharacter", "ItemColorItem", "ItemColorCurrentMode", "ItemColorStateKey", "ItemColorState",
	"ItemColorPage", "ItemColorLayerPages", "ItemColorPickerBackup", "ItemColorPickerIndices",
	"ItemColorPickerLayers", "ItemColorExitListeners", "ItemColorBackup", "ItemColorText", "ItemColorLayerNames",
	"ItemColorGroupNames", "ItemColorHistory", "ItemColorOnPickerChange", "CraftingMode", "CraftingSlot",
	"CraftingSelectedItem", "CraftingPreview", "CraftingNakedPreview", "CraftingReturnToChatroom", "CraftingAssets",
	"CraftingSerializeItemSep", "CraftingSerializeFieldSep", "CraftingSerializeSanitize", "CraftingPropertyMap",
	"CraftingEffectsDefaultMaximumStack", "CraftingEffectsDefaultMaximumEffects", "CraftingEffectsPrerequisite",
	"CraftingStatusType", "CraftingLockList", "CraftingPropertyExclude", "CraftingID", "CharacterBlindLevels",
	"CharacterDeafLevels", "CharacterBlurLevels", "Difficulty", "AllowedInteractions",
	"CharacterDialogSubstitutionPattern", "PropertiesArrayLike", "PropertiesObjectLike", "ActivityTranslateResolve",
	"ActivityDebug", "chineseRegex", "chineseRandomGarbledSound", "ChatRoomSpaceType", "ChatRoomVisibilityMode",
	"ChatRoomAccessMode", "ChatRoomDivInputPrevHeight", "ChatRoomCustomization", "ChatRoomStimulationEvents",
	"ChatRoomArousalMsg_Chance", "ChatRoomArousalMsg_ChanceScaling", "ChatRoomArousalMsg_ChanceVibeMod",
	"ChatRoomArousalMsg_ChanceInflationMod", "ChatRoomArousalMsg_ChanceGagMod", "ChatRoomHideIconStateType",
	"ChatRoomTopMenuBuiltSig", "ChatRoomFontSize", "ChatRoomFontSizes", "ChatRoomListOperationTriggers",
	"ChatRoomResizeManager", "ChatRoomStatusDeadKeys", "ChatRoomSlowLeaveMinTime", "ChatRoomLastFriendRequest",
];

/**
 * Copies the given window property names onto Node's `globalThis`, by value.
 * Vitest's jsdom environment copies dom.window's properties onto `globalThis`
 * only *once*, at test-file setup time (see the comment in loadRealBc() below),
 * so anything a real-BC vm.runInContext() call adds or reassigns afterwards
 * needs this to become visible to plain `globalThis.X` / bare-identifier reads.
 * Scoped to an explicit key set (rather than every key in `window`) both for
 * speed and to avoid jsdom's self-referential builtins (`window.window`,
 * `window.top`, ...), which blow the stack if walked here.
 */
function syncWindowToGlobal(keys: Iterable<string>): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	const window = g.jsdom.window;
	for (const key of keys) {
		if (g[key] === window[key]) continue;
		try {
			g[key] = window[key];
		} catch {
			// A handful of builtins are getter-only on Node's real global; nothing
			// BC-script-defined ever collides with those.
		}
	}
}

/** Runs `code` in the real-BC realm; returns its completion value and the set of window keys it added. */
function runAndCollectNewKeys<T>(ctx: vm.Context, code: string, filename?: string): { value: T; newKeys: string[] } {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const window = (globalThis as any).jsdom.window;
	const before = new Set(Object.keys(window));
	const value = vm.runInContext(code, ctx, filename ? { filename } : undefined) as T;
	const newKeys = Object.keys(window).filter(k => !before.has(k));
	return { value, newKeys };
}

/**
 * Evaluates every real BC script (in BC's own dependency order) into this test
 * file's jsdom realm, then calls the real `AssetLoadAll()`. Idempotent per file
 * (subsequent calls are a no-op) since BC's `const`/`let` top-level declarations
 * throw on redeclaration if run twice into the same realm.
 */
export function loadRealBc(dir: string, gameVersion: string): void {
	if (loadedOnce) return;
	loadedOnce = true;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const jsdomInstance = (globalThis as any).jsdom;
	if (!jsdomInstance?.getInternalVMContext) {
		throw new Error(
			"loadRealBc(): globalThis.jsdom.getInternalVMContext() is unavailable. " +
			"This requires Vitest's jsdom environment (environment: \"jsdom\" with the " +
			"default runScripts: \"dangerously\"); see vitest.config.ts's \"bc\" project.",
		);
	}
	const ctx = jsdomInstance.getInternalVMContext();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const g = globalThis as any;
	installHookTargetStubs(g);
	installNetworkCapture(g);
	g.LZString = LZStringLib;

	// A validation helper from a settings-screen file we don't load; AssetLoadAll()
	// calls it once and ignores the result.
	vm.runInContext(`var PreferenceArousalUpdateValidation = function() { return null; };`, ctx);
	// Game.js (which sets this for real) is deliberately never loaded into the
	// realm -- scripts/bc-client.mjs reads its GameVersion string by regex, for
	// the version guard, without executing the file. LSCG itself reads GameVersion
	// (utils.ts) so it's set here to match, both inside the realm and on Node's
	// own globalThis (this one call happens outside the diff-based sync since
	// nothing else needs it to look "new").
	vm.runInContext(`var GameVersion = ${JSON.stringify(gameVersion)};`, ctx);
	(globalThis as Record<string, unknown>).GameVersion = gameVersion;
	// A resolved 404 (never a rejection) so CommonFetch's retry-on-network-error
	// backoff (real setTimeout delays, up to FETCH_MAX_RETRIES=10 attempts) never
	// kicks in: CommonRequestShouldRetry(404) is false, so this returns immediately.
	// Only localized text (TextCache, used by ItemColor.js) depends on this; LSCG's
	// own logic never reads it.
	vm.runInContext(`
		var Request = class Request {};
		var fetch = async function() {
			return { status: 404, ok: false, headers: { get: () => null }, text: async () => "", json: async () => ({}) };
		};
	`, ctx);
	for (const name of HARMLESS_LOAD_TIME_STUBS) {
		vm.runInContext(`var ${name} = function() { return undefined; };`, ctx);
	}

	// Real BC logs plenty of its own warnings while degrading gracefully around
	// the stubs above (missing color layers, missing localized text, ...) --
	// none of it is actionable here, so it's silenced for the duration of the load.
	// BC scripts call console.error/warn on jsdom's *own* window.console (a
	// separate object from Node's `console`), so that's what needs muting --
	// including for the AssetLoadDescription CSV-fetch rejection this tier
	// deliberately can't avoid (see the fetch 404 stub above). Cosmetic only:
	// nothing here affects correctness, only what shows up in the test log.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const realWindowConsole = (jsdomInstance.window.console ?? {}) as any;
	const realWarn = realWindowConsole.warn;
	const realError = realWindowConsole.error;
	realWindowConsole.warn = () => {};
	realWindowConsole.error = () => {};
	const newKeys = new Set<string>();
	try {
		for (const rel of ALL_FILES) {
			const src = readFileSync(join(dir, ...rel.split("/")), "utf-8");
			for (const key of runAndCollectNewKeys(ctx, src, rel).newKeys) newKeys.add(key);
		}
		for (const key of runAndCollectNewKeys(ctx, "AssetLoadAll();").newKeys) newKeys.add(key);

		const bridge = LEXICAL_GLOBALS_TO_BRIDGE
			.map(name => `try { globalThis[${JSON.stringify(name)}] = ${name}; } catch (e) {}`)
			.join("\n");
		for (const key of runAndCollectNewKeys(ctx, bridge).newKeys) newKeys.add(key);
	} finally {
		// The AssetLoadDescription rejection above is scheduled on a microtask,
		// so it hasn't necessarily logged yet even though AssetLoadAll() (a sync
		// function) already returned; give it a tick before un-suppressing.
		setTimeout(() => {
			realWindowConsole.warn = realWarn;
			realWindowConsole.error = realError;
		}, 0);
	}

	syncWindowToGlobal(newKeys);
}

/**
 * Runs `code` inside the real-BC realm (for things a plain `globalThis.X()`
 * call can't reach, e.g. calling CharacterCreate() -- a real BC var/function
 * only exists on dom.window, never copied onto Node's globalThis by name
 * ahead of time). Re-syncs afterwards so anything it assigns (e.g. `globalThis.
 * Player = ...`) becomes visible to plain `globalThis.X` reads too.
 */
export function evalInBcRealm<T>(code: string): T {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const ctx = (globalThis as any).jsdom.getInternalVMContext();
	const { value, newKeys } = runAndCollectNewKeys<T>(ctx, code);
	syncWindowToGlobal(newKeys);
	syncWindowToGlobal(CORE_MUTABLE_GLOBALS);
	return value;
}
