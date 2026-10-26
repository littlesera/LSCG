import { GetDelimitedList } from "../utils";

// Who may change a wearer's hypno, collar or magic settings through LSCG's remote screens, and which settings those
// screens let them change. The screens use these to decide what to offer; the wearer's client uses them again on what
// arrives, since nothing makes a sender go through the screens.

type ModuleSettings = Record<string, unknown>;
type RemoteModule = "HypnoModule" | "CollarModule" | "MagicModule";

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

/** The "requires trance" and "only the hypnotizer" options shared by the hypno and magic screens. */
function passesTrance(wearer: Character, sender: Character, s: ModuleSettings): boolean {
	const trance = (wearer as OtherCharacter).LSCG?.StateModule?.states?.find(st => st.type == "hypnotized");
	const inTrance = trance?.active ?? false;
	if (s.remoteAccessRequiredTrance && !inTrance)
		return false;
	if (s.limitRemoteAccessToHypnotizer && trance?.activatedBy != sender.MemberNumber)
		return false;
	return true;
}

const ownedBy = (wearer: Character, sender: Character) => wearer.IsOwnedByMemberNumber(sender.MemberNumber ?? -1);

export function canRemoteHypno(wearer: Character, sender: Character): boolean {
	const s = settingsOf(wearer, "HypnoModule");
	if (!s || !s.remoteAccess || sender.MemberNumber === wearer.MemberNumber)
		return false;
	return ownedBy(wearer, sender) ||
		(!!s.enabled && memberAllowed(wearer, sender, memberIds(s.overrideMemberIds)) && passesTrance(wearer, sender, s));
}

export function collarAllowedMemberIds(s: ModuleSettings): number[] {
	const ids = memberIds(s.allowedMembers);
	const creator = (s.collar as { creator?: number } | undefined)?.creator;
	if (s.limitToCrafted && typeof creator === "number" && creator >= 0)
		ids.push(creator);
	return ids;
}

export function canRemoteCollar(wearer: Character, sender: Character): boolean {
	const s = settingsOf(wearer, "CollarModule");
	if (!s || s.breathplayEnabled === false || !s.remoteAccess || sender.MemberNumber === wearer.MemberNumber)
		return false;
	return ownedBy(wearer, sender) || (!!s.enabled && memberAllowed(wearer, sender, collarAllowedMemberIds(s)));
}

export function canRemoteMagic(wearer: Character, sender: Character): boolean {
	const s = settingsOf(wearer, "MagicModule");
	if (!s || !s.remoteAccess || !s.enabled || sender.MemberNumber === wearer.MemberNumber)
		return false;
	return memberAllowed(wearer, sender, memberIds(s.remoteMemberIds)) && passesTrance(wearer, sender, s);
}

// What each remote screen edits. Anything else in an incoming settings blob (remote access itself, who may use it,
// stats, spells...) stays the wearer's own.
const HYPNO_REMOTE_KEYS = [
	"overrideWords", "awakeners", "speakTriggers", "silenceTriggers", "triggerTime", "cooldownTime", "enableCycle", "cycleTime",
	"remoteAccessRequiredTrance", "limitRemoteAccessToHypnotizer", "suggestionRequireHypnotizer", "allowSuggestionRemoval",
	"alwaysSubmit", "alwaysSubmitMemberIds",
];
const COLLAR_REMOTE_KEYS = [
	"enabled", "allowSelfTightening", "allowSelfLoosening", "allowedMembers", "limitToCrafted", "tightTrigger", "looseTrigger",
	"immersive", "allowButtons", "anyCollar", "collar",
];
const MAGIC_REMOTE_KEYS = [
	"enableWildMagic", "forceWildMagic", "trueWildMagic", "blockXRay", "blockedSpellEffects", "bypassForSelfEffects", "neverDefend",
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
	if (s.allowLocked) keys.push("locked");
	return pick(keys, incoming, s);
}

export function remoteCollarChanges(wearer: Character, incoming: unknown): ModuleSettings {
	const s = settingsOf(wearer, "CollarModule") ?? {};
	return pick(s.lockable ? [...COLLAR_REMOTE_KEYS, "locked"] : COLLAR_REMOTE_KEYS, incoming, s);
}

export function remoteMagicChanges(wearer: Character, incoming: unknown): ModuleSettings {
	const s = settingsOf(wearer, "MagicModule") ?? {};
	return pick(s.lockable ? [...MAGIC_REMOTE_KEYS, "locked"] : MAGIC_REMOTE_KEYS, incoming, s);
}
