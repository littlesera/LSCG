import { trim } from "lodash-es";

export const hooks: Record<string, (args: any[], next: (a: any[]) => any) => any> = {};
export function hookFunction(name: string, _p: number, fn: any) { hooks[name] = fn; return () => delete hooks[name]; }
export function removeAllHooksByModule() {}
export const localMessages: string[] = [];
export function LSCG_SendLocal(msg: string) { localMessages.push(msg); }
export function settingsSave() {}
export const outfitCollection: Record<string, any[]> = { maid: [{ Group: "Cloth", Name: "MaidOutfit1" }] };
export function GetConfiguredItemBundlesFromOutfitKey(key: string, filter: (i: any) => boolean) { return (outfitCollection[key.toLowerCase()] ?? []).filter(filter); }
export const sent: { target: number; name: string; args: any[] }[] = [];
export function sendLSCGCommand(target: any, name: string, args: any[] = []) { sent.push({ target: target?.MemberNumber, name, args }); }
export let orgasms = 0;
export function forceOrgasm() { orgasms++; }
export const actions: string[] = [];
export function SendAction(text: string) { actions.push(text); }
export function getCharacter(n: number) { return (globalThis as any).ChatRoomCharacter.find((c: any) => c.MemberNumber === n) ?? null; }

function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLocaleLowerCase(); }
export function excludeParentheticalContent(msg: string): string {
    let result = "", par = false;
    for (const ch of msg ?? "") { if (ch == "(") par = true; if (!par) result += ch; if (ch == ")") par = false; }
    return result;
}
export function isPhraseInString(string: string, phrase: string, ignoreOOC = false) {
    if (!string) return false;
    const re = new RegExp("(\\b|^|\\s)" + escapeRegExp(phrase) + "(\\b|$|\\s)", "i");
    return re.test(ignoreOOC ? string : excludeParentheticalContent(string));
}
export function GetDelimitedList(source: string, delimiter = ","): string[] {
    const re = new RegExp(`(?:^|${delimiter})\\s*(?:"([^"]*)"|([^${delimiter}]*))`, "g");
    let m: RegExpExecArray | null; const out: string[] = [];
    while (!!source && (m = re.exec(source)) !== null) {
        const [, q, u] = m; const v = q !== undefined ? trim(q.trim(), "\"") : u.trim();
        if (v) out.push(v.toLocaleLowerCase());
    }
    return out;
}
// --- minimal inventory model for exercising RedressedState: items are { Asset: { Name, Group: { Name, Category } } } ---
const g = globalThis as any;
const category = (group: string) => group.startsWith("Item") ? "Item" : "Appearance";
export const ICONS = {};
export function getRandomInt(max: number) { return Math.floor(Math.random() * max); }
export function isCloth(x: any) { return (x?.Group?.Category ?? x?.Asset?.Group?.Category) === "Appearance"; }
export function isBind(x: any) { return (x?.Group?.Category ?? x?.Asset?.Group?.Category) === "Item"; }
export function matchesStripLevel(item: any, level: number) { return !!(level & 1) && isCloth(item); }
export function makeItem(group: string, name: string) {
    return { Asset: { Name: name, Group: { Name: group, Category: category(group) }, DynamicName: () => name } };
}
export function BC_ItemToItemBundle(item: any) { return { Group: item.Asset.Group.Name, Name: item.Asset.Name }; }
export function BC_ItemsToItemBundles(items: any[]) { return items.map(BC_ItemToItemBundle); }
export function RemoveItem(item: any) { const i = g.Player.Appearance.indexOf(item); if (i > -1) g.Player.Appearance.splice(i, 1); }
export function ApplyItem(bundle: any) {
    const existing = g.Player.Appearance.find((i: any) => i.Asset.Group.Name === bundle.Group);
    if (existing) RemoveItem(existing);
    g.Player.Appearance.push(makeItem(bundle.Group, bundle.Name));
}
export function parseFromBase64(data: string) { try { return JSON.parse(g.LZString.decompressFromBase64(data)); } catch { return undefined; } }
export function stringIsCompressedItemBundleArray(data: string) { return Array.isArray(parseFromBase64(data)); }

export type RemoteAccessLevel = "Public" | "PublicExceptBlacklist" | "Friends" | "Whitelist" | "Lovers" | "Owner";
export function hasRemotePermission(wearer: any, level: RemoteAccessLevel, memberNumber: number): boolean {
    if (wearer.IsOwnedByMemberNumber(memberNumber)) return true;
    const lover = wearer.IsLoverOfMemberNumber(memberNumber);
    const whitelisted = wearer.WhiteList?.includes(memberNumber) ?? false;
    switch (level) {
        case "Owner": return false;
        case "Lovers": return lover;
        case "Whitelist": return lover || whitelisted;
        case "Friends": return lover || whitelisted || (wearer.IsPlayer() ? (wearer.FriendList?.includes(memberNumber) ?? false) : true);
        case "PublicExceptBlacklist": return !(wearer.BlackList?.includes(memberNumber) ?? false);
        case "Public": return true;
        default: return false;
    }
}
