import { GetDelimitedList, REMOTE_ACCESS_LEVELS, hasRemotePermission, type RemoteAccessLevel } from "../utils";

// Who may change a wearer's hypno, collar, magic or speech settings through LSCG's remote screens, and which settings those
// screens let them change. The screens use these to decide what to offer; the wearer's client uses them again on what
// arrives, since nothing makes a sender go through the screens. See docs/remote-access.md for the rules in one place.

type ModuleSettings = Record<string, unknown>;
export type RemoteModule = "HypnoModule" | "CollarModule" | "MagicModule" | "SpeechAnalysisModule";

function settingsOf(wearer: Character, module: RemoteModule): ModuleSettings | undefined {
	return (wearer as OtherCharacter).LSCG?.[module] as unknown as ModuleSettings | undefined;
}

/** The "requires trance" and "only the hypnotizer" options every module's remote access offers. */
export interface TranceOptions { trance: boolean; hypnotizerOnly: boolean }

/** What each module's trance options are when the wearer never set them (an older save, or a published copy without them).
 *  The settings screens fall back to these too, so what they show is what the gate enforces. */
export const REMOTE_TRANCE_DEFAULTS: Record<RemoteModule, TranceOptions> = {
	HypnoModule: { trance: true, hypnotizerOnly: false },
	CollarModule: { trance: false, hypnotizerOnly: false },
	MagicModule: { trance: false, hypnotizerOnly: false },
	SpeechAnalysisModule: { trance: true, hypnotizerOnly: false },
};

/** Who may get in when the wearer never picked a level. The owner always can, so this is the safe floor. */
export const DEFAULT_REMOTE_LEVEL: RemoteAccessLevel = "Owner";

export function tranceOptions(module: RemoteModule, s: ModuleSettings): TranceOptions {
	const defaults = REMOTE_TRANCE_DEFAULTS[module];
	// Speech kept its older name for the trance option.
	const trance = module === "SpeechAnalysisModule" ? s.remoteRequiresTrance : s.remoteAccessRequiredTrance;
	return {
		trance: typeof trance === "boolean" ? trance : defaults.trance,
		hypnotizerOnly: typeof s.limitRemoteAccessToHypnotizer === "boolean" ? s.limitRemoteAccessToHypnotizer : defaults.hypnotizerOnly,
	};
}

/** The level the wearer picked for who may get in, or the owner-only floor if it's missing or not one of ours. */
export function remoteLevelOf(s: ModuleSettings): RemoteAccessLevel {
	return REMOTE_ACCESS_LEVELS.includes(s.remoteLevel as RemoteAccessLevel) ? s.remoteLevel as RemoteAccessLevel : DEFAULT_REMOTE_LEVEL;
}

/** Who may get in, and when. The General > Remote Access defaults cover who (the level and the allowed member ids) for a section that
 *  uses them; when (the trance rules) is always the section's own, so a remote user's edits of it count either way. */
export interface EffectiveAccess { level: RemoteAccessLevel; ids: number[]; trance: TranceOptions }

export function effectiveRemoteAccess(module: RemoteModule, wearer: Character, s: ModuleSettings): EffectiveAccess {
	const global = (wearer as OtherCharacter).LSCG?.GlobalModule as unknown as ModuleSettings | undefined;
	const trance = tranceOptions(module, s);
	// Only a section that says so uses the defaults: a copy from an older client has no such flag, and keeps its own.
	if (s.useGlobalRemote === true && global)
		return { level: remoteLevelOf(global), ids: remoteMemberIdsOf(global), trance };
	return { level: remoteLevelOf(s), ids: remoteMemberIdsOf(s), trance };
}

/** The members the wearer named for a module's remote access (`remoteMemberIds`): let in whatever the level says. */
export function remoteMemberIdsOf(s: ModuleSettings): number[] {
	return typeof s.remoteMemberIds === "string" ? GetDelimitedList(s.remoteMemberIds).map(id => +id).filter(id => id > 0) : [];
}

/** Why a sender can't get in, in the order the rules are checked; `undefined` when they can. */
export type RemoteDenial =
	| "unavailable"   // no settings, LSCG off for the wearer, the sender is the wearer, or a module precondition (collar: breathplay off)
	| "remote-off"    // the wearer hasn't turned remote access on
	| "module-off"    // the module itself is off (owners get past this)
	| "level"         // the sender isn't within the level the wearer picked
	| "trance"        // the wearer has to be hypnotized
	| "hypnotizer";   // ... by this sender

const ownedBy = (wearer: Character, sender: Character) => wearer.IsOwnedByMemberNumber(sender.MemberNumber ?? -1);

/** What a module adds to the shared rules. */
interface GateSpec {
	/** Anything that must hold for everyone, the owner included. */
	precondition?: (s: ModuleSettings) => boolean;
	/** Extra senders let in as if the level allowed them (the collar's maker, when the collar is limited to its maker). */
	alsoAllow?: (sender: Character, s: ModuleSettings) => boolean;
}

/**
 * The one rule for remote access to a module's settings:
 *  1. the module's settings are there, LSCG is on for the wearer, the wearer turned remote access on, the sender isn't the
 *     wearer, and the module's own precondition holds;
 *  2. the owner then always passes;
 *  3. anyone else needs the module enabled, to be within the access level the wearer picked (their own for the module, or the
 *     global default while the module uses it) (the same levels as BC's own
 *     interaction permission, plus friends) or on the wearer's list of allowed member ids for the module, and to meet the
 *     trance and hypnotizer options.
 */
function remoteDenial(module: RemoteModule, wearer: Character, sender: Character, spec: GateSpec = {}): RemoteDenial | undefined {
	const s = settingsOf(wearer, module);
	if (!s || !(wearer as OtherCharacter).LSCG?.GlobalModule?.enabled || sender.MemberNumber === wearer.MemberNumber)
		return "unavailable";
	if (spec.precondition && !spec.precondition(s))
		return "unavailable";
	if (!s.remoteAccess)
		return "remote-off";
	if (ownedBy(wearer, sender))
		return undefined;
	if (!s.enabled)
		return "module-off";
	const access = effectiveRemoteAccess(module, wearer, s);
	const listed = access.ids.includes(sender.MemberNumber ?? -1);
	if (!listed && !spec.alsoAllow?.(sender, s) && !hasRemotePermission(wearer, access.level, sender.MemberNumber ?? -1))
		return "level";
	const options = access.trance;
	const trance = (wearer as OtherCharacter).LSCG?.StateModule?.states?.find(st => st.type == "hypnotized");
	if (options.trance && !(trance?.active ?? false))
		return "trance";
	if (options.hypnotizerOnly && trance?.activatedBy != sender.MemberNumber)
		return "hypnotizer";
	return undefined;
}

/** Whether the wearer allows locking a module's settings from afar. Hypno calls it `allowLocked`; the others `lockable`. */
const lockAllowed = (s: ModuleSettings) => !!(s.lockable || s.allowLocked);

const SPECS: Record<RemoteModule, GateSpec> = {
	HypnoModule: {},
	CollarModule: {
		precondition: s => s.breathplayEnabled !== false,
		alsoAllow: (sender, s) => {
			const creator = (s.collar as { creator?: number } | undefined)?.creator;
			return !!s.limitToCrafted && typeof creator === "number" && creator >= 0 && creator === sender.MemberNumber;
		},
	},
	MagicModule: {},
	SpeechAnalysisModule: {},
};

/** Why `sender` can't get into `wearer`'s `module` settings, or `undefined` if they can. */
export function remoteAccessDenial(module: RemoteModule, wearer: Character, sender: Character): RemoteDenial | undefined {
	return remoteDenial(module, wearer, sender, SPECS[module]);
}

const canRemote = (module: RemoteModule, wearer: Character, sender: Character) => remoteAccessDenial(module, wearer, sender) === undefined;

export const canRemoteHypno = (wearer: Character, sender: Character) => canRemote("HypnoModule", wearer, sender);
export const canRemoteCollar = (wearer: Character, sender: Character) => canRemote("CollarModule", wearer, sender);
export const canRemoteMagic = (wearer: Character, sender: Character) => canRemote("MagicModule", wearer, sender);
export const canRemoteSpeech = (wearer: Character, sender: Character) => canRemote("SpeechAnalysisModule", wearer, sender);

/** Every command another player can use to read or change a wearer's settings, and what guards it. A command that does
 *  this must be listed here (test/modules/remote-access-gate.test.ts fails for one that isn't), so it can't skip the gate. */
export const REMOTE_SETTINGS_COMMANDS: Record<string, string> = {
	"remote": "canRemoteHypno, canRemoteCollar, canRemoteMagic (CoreModule.IncomingRemote)",
	"speech-settings-get": "canRemoteSpeech (SpeechAnalysisModule._canRemoteConfigure)",
	"speech-settings-set": "canRemoteSpeech (SpeechAnalysisModule._canRemoteConfigure)",
	"get-suggestions": "HypnoModule.CanModifySuggestions",
	"set-suggestions": "HypnoModule.CanModifySuggestions",
};

// What each remote screen edits. Anything else in an incoming settings blob (remote access itself, who may use it,
// stats, spells...) stays the wearer's own.
const HYPNO_REMOTE_KEYS = [
	"overrideWords", "awakeners", "speakTriggers", "silenceTriggers", "triggerTime", "cooldownTime", "enableCycle", "cycleTime",
	"remoteAccessRequiredTrance", "limitRemoteAccessToHypnotizer", "suggestionRequireHypnotizer", "allowSuggestionRemoval",
	"alwaysSubmit", "alwaysSubmitMemberIds",
];
const COLLAR_REMOTE_KEYS = [
	"allowSelfTightening", "allowSelfLoosening", "allowedMembers", "limitToCrafted", "tightTrigger", "looseTrigger",
	"immersive", "allowButtons", "anyCollar", "collar",
];
const MAGIC_REMOTE_KEYS = [
	"enableWildMagic", "forceWildMagic", "trueWildMagic", "blockXRay", "blockedSpellEffects", "bypassForSelfEffects", "lockedSpellEffects", "neverDefend",
	"noDefenseMemberIds", "limitedDuration", "maxDuration", "allowOutfitToChangeNeckItems", "allowChangeGenitals",
	"remoteAccessRequiredTrance", "limitRemoteAccessToHypnotizer",
];

/** Whether `value` can stand in for `current`: the same kind of primitive, a list of strings, or the collar's name and maker. */
function sameShape(key: string, value: unknown, current: unknown): boolean {
	if (key === "collar")
		return !!value && typeof value === "object" && !Array.isArray(value) &&
			["name", "creator"].every(k => !(k in value) || ["string", "number"].includes(typeof (value as Record<string, unknown>)[k]));
	if (Array.isArray(current) || Array.isArray(value))
		return Array.isArray(value) && value.every(v => typeof v === "string");
	if (current === undefined || current === null)
		return ["string", "number", "boolean"].includes(typeof value);
	return typeof value === typeof current && (typeof value !== "number" || Number.isFinite(value));
}

function pick(keys: string[], incoming: unknown, current: ModuleSettings): ModuleSettings {
	const changes: ModuleSettings = {};
	if (!incoming || typeof incoming !== "object")
		return changes;
	for (const key of keys) {
		const value = (incoming as ModuleSettings)[key];
		if (value !== undefined && sameShape(key, value, current[key]))
			changes[key] = key === "collar" ? { name: (value as ModuleSettings).name, creator: (value as ModuleSettings).creator } : value;
	}
	return changes;
}

/** The hypno settings a remote user may change, from what they sent. */
export function remoteHypnoChanges(wearer: Character, sender: Character, incoming: unknown): ModuleSettings {
	const s = settingsOf(wearer, "HypnoModule") ?? {};
	const keys = [...HYPNO_REMOTE_KEYS];
	if (s.allowRemoteModificationOfMemberOverride || ownedBy(wearer, sender)) keys.push("overrideMemberIds");
	if (lockAllowed(s)) keys.push("locked");
	return pick(keys, incoming, s);
}

export function remoteCollarChanges(wearer: Character, incoming: unknown): ModuleSettings {
	const s = settingsOf(wearer, "CollarModule") ?? {};
	return pick(lockAllowed(s) ? [...COLLAR_REMOTE_KEYS, "locked"] : COLLAR_REMOTE_KEYS, incoming, s);
}

export function remoteMagicChanges(wearer: Character, incoming: unknown): ModuleSettings {
	const s = settingsOf(wearer, "MagicModule") ?? {};
	return pick(lockAllowed(s) ? [...MAGIC_REMOTE_KEYS, "locked"] : MAGIC_REMOTE_KEYS, incoming, s);
}
