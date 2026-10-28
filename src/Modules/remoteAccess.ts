import { GetDelimitedList, hasRemotePermission, type RemoteAccessLevel } from "../utils";

// Who may change a wearer's hypno, collar, magic or speech settings through LSCG's remote screens, and which settings those
// screens let them change. The screens use these to decide what to offer; the wearer's client uses them again on what
// arrives, since nothing makes a sender go through the screens. See docs/remote-access.md for the rules in one place.

type ModuleSettings = Record<string, unknown>;
type RemoteModule = "HypnoModule" | "CollarModule" | "MagicModule" | "SpeechAnalysisModule";

function settingsOf(wearer: Character, module: RemoteModule): ModuleSettings | undefined {
	return (wearer as OtherCharacter).LSCG?.[module] as unknown as ModuleSettings | undefined;
}

function memberIds(list: unknown): number[] {
	return typeof list === "string" ? GetDelimitedList(list).map(id => +id).filter(id => id > 0) : [];
}

/** Item permission, unless the wearer named who may in `ids`. */
function memberAllowed(wearer: Character, sender: Character, ids: number[]): boolean {
	return ids.length > 0 ? ids.includes(sender.MemberNumber ?? -1) : ServerChatRoomGetAllowItem(sender, wearer);
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

export function tranceOptions(module: RemoteModule, s: ModuleSettings): TranceOptions {
	const defaults = REMOTE_TRANCE_DEFAULTS[module];
	// Speech kept its older name for the trance option.
	const trance = module === "SpeechAnalysisModule" ? s.remoteRequiresTrance : s.remoteAccessRequiredTrance;
	return {
		trance: typeof trance === "boolean" ? trance : defaults.trance,
		hypnotizerOnly: typeof s.limitRemoteAccessToHypnotizer === "boolean" ? s.limitRemoteAccessToHypnotizer : defaults.hypnotizerOnly,
	};
}

function passesTrance(wearer: Character, sender: Character, options: TranceOptions): boolean {
	const trance = (wearer as OtherCharacter).LSCG?.StateModule?.states?.find(st => st.type == "hypnotized");
	const inTrance = trance?.active ?? false;
	if (options.trance && !inTrance)
		return false;
	if (options.hypnotizerOnly && trance?.activatedBy != sender.MemberNumber)
		return false;
	return true;
}

/** Whether the wearer's trance (and who put them there) lets `sender` in, by that module's options. Screens use it for their reasons. */
export function passesRemoteTrance(module: RemoteModule, wearer: Character, sender: Character): boolean {
	return passesTrance(wearer, sender, tranceOptions(module, settingsOf(wearer, module) ?? {}));
}

const ownedBy = (wearer: Character, sender: Character) => wearer.IsOwnedByMemberNumber(sender.MemberNumber ?? -1);

/** What a module adds to the shared rules. */
interface GateSpec {
	/** The members the wearer named, in place of item permission. */
	ids?: (s: ModuleSettings) => number[];
	/** Anything that must hold for everyone, the owner included. */
	precondition?: (s: ModuleSettings) => boolean;
	/** A narrowing check on top of item permission for everyone but the owner. */
	narrow?: (wearer: Character, sender: Character, s: ModuleSettings) => boolean;
}

/**
 * The one rule for remote access to a module's settings:
 *  1. the module's settings are there, LSCG is on for the wearer, remote access is on, and the sender isn't the wearer;
 *  2. the owner then always passes;
 *  3. anyone else needs the module enabled, item permission (or being on the wearer's list), the module's own narrowing,
 *     and the trance and hypnotizer options.
 */
function canRemote(module: RemoteModule, wearer: Character, sender: Character, spec: GateSpec = {}): boolean {
	const s = settingsOf(wearer, module);
	if (!s || !(wearer as OtherCharacter).LSCG?.GlobalModule?.enabled || !s.remoteAccess || sender.MemberNumber === wearer.MemberNumber)
		return false;
	if (spec.precondition && !spec.precondition(s))
		return false;
	if (ownedBy(wearer, sender))
		return true;
	return !!s.enabled &&
		memberAllowed(wearer, sender, spec.ids?.(s) ?? []) &&
		(spec.narrow?.(wearer, sender, s) ?? true) &&
		passesTrance(wearer, sender, tranceOptions(module, s));
}

/** Whether the wearer allows locking a module's settings from afar. Hypno calls it `allowLocked`; the others `lockable`. */
const lockAllowed = (s: ModuleSettings) => !!(s.lockable || s.allowLocked);

export function canRemoteHypno(wearer: Character, sender: Character): boolean {
	return canRemote("HypnoModule", wearer, sender, { ids: s => memberIds(s.overrideMemberIds) });
}

export function collarAllowedMemberIds(s: ModuleSettings): number[] {
	const ids = memberIds(s.allowedMembers);
	const creator = (s.collar as { creator?: number } | undefined)?.creator;
	if (s.limitToCrafted && typeof creator === "number" && creator >= 0)
		ids.push(creator);
	return ids;
}

export function canRemoteCollar(wearer: Character, sender: Character): boolean {
	return canRemote("CollarModule", wearer, sender, { ids: collarAllowedMemberIds, precondition: s => s.breathplayEnabled !== false });
}

export function canRemoteMagic(wearer: Character, sender: Character): boolean {
	return canRemote("MagicModule", wearer, sender, { ids: s => memberIds(s.remoteMemberIds) });
}

/** Speech keeps its access level ("Lovers", "Whitelist"...) as a narrowing on top of item permission. */
export function canRemoteSpeech(wearer: Character, sender: Character): boolean {
	return canRemote("SpeechAnalysisModule", wearer, sender, {
		narrow: (w, snd, s) => hasRemotePermission(w, s.remoteLevel as RemoteAccessLevel, snd.MemberNumber ?? -1),
	});
}

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
