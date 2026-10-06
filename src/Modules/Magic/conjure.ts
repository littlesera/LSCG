import { getRandomInt, SendAction } from "utils";
import type { SpellEffectContext } from "./spellEffects";
import type { SpellEffectEntry } from "Modules/States/SpellEffectsState";

/** One restraint a conjuring spell can put on a slot: a BC asset, and for typed ones, the options from mildest to most severe. */
export interface ConjureOption {
    group: string;
    asset: string;
    /** Names of the item's type options, mildest first. A new piece takes one at random. */
    ladder?: string[];
    /** Filled first, so a one-piece spell always does the main thing (the arms for webs and ropes). */
    primary?: boolean;
}

export interface ConjureSet {
    options: ConjureOption[];
    /** What the spell makes, for messages: "webs", "slime", "ropes". */
    noun: string;
    /** What it says, whole sentences with %NAME%: when it binds, when there is nothing left to bind, and when it ends. */
    messages: { bind: string; nothing: string; end: string };
}

/** Settings of a conjuring effect: how many pieces it makes, and an optional crafted version of its main item. */
export interface ConjureConfig {
    Min: number;
    Max: number;
    Craft?: Record<string, unknown>;
}

export const MAX_CONJURE_PIECES = 6;

/** What is recorded to take a piece off again. */
export interface ConjurePiece {
    group: string;
    asset: string;
    /** The rung of the option's ladder it was put on at, if it has one. */
    rung?: number;
}

export interface ConjureData {
    pieces: ConjurePiece[];
}

export function sanitizeConjureConfig(raw: unknown): ConjureConfig {
    const { Min, Max, Craft } = (raw && typeof raw === "object" ? raw : {}) as Partial<ConjureConfig>;
    const whole = (v: unknown, fallback: number) => typeof v === "number" && Number.isFinite(v) ? Math.min(MAX_CONJURE_PIECES, Math.max(1, Math.round(v))) : fallback;
    const min = whole(Min, 1);
    const max = Math.max(min, whole(Max, Math.max(min, 2)));
    return { Min: min, Max: max, ...(sanitizeCraft(Craft) ? { Craft: sanitizeCraft(Craft) } : {}) };
}

/** The parts of a crafted item that matter when it is worn, each a plain value of a sensible size. */
function sanitizeCraft(raw: unknown): Record<string, unknown> | undefined {
    if (!raw || typeof raw !== "object")
        return undefined;
    const craft = raw as Record<string, unknown>;
    const text = (v: unknown, max: number) => typeof v === "string" ? v.slice(0, max) : undefined;
    const item = text(craft.Item, 40);
    if (!item)
        return undefined;
    const clean: Record<string, unknown> = { Item: item, Name: text(craft.Name, 30) ?? "", Description: text(craft.Description, 200) ?? "", Property: text(craft.Property, 40) ?? "Normal" };
    if (typeof craft.Color === "string") clean.Color = craft.Color.slice(0, 200);
    if (typeof craft.Private === "boolean") clean.Private = craft.Private;
    if (typeof craft.MemberName === "string") clean.MemberName = craft.MemberName.slice(0, 40);
    if (typeof craft.MemberNumber === "number" && Number.isInteger(craft.MemberNumber)) clean.MemberNumber = craft.MemberNumber;
    if (craft.Effects && typeof craft.Effects === "object")
        clean.Effects = Object.fromEntries(Object.entries(craft.Effects as Record<string, unknown>).filter(([, v]) => typeof v === "number").slice(0, 10));
    return clean;
}

function shuffled<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** What BC calls a type option for permission checks, e.g. "typed2", or undefined when it can't be worked out. */
function typeKey(option: ConjureOption, name: string): string | undefined {
    if (typeof TypedItemDataLookup === "undefined")
        return undefined;
    const data = TypedItemDataLookup[`${option.group}${option.asset}`];
    const record = data?.options?.find((o: { Name: string }) => o.Name === name)?.Property?.TypeRecord;
    return record && data?.name !== undefined ? `${data.name}${record[data.name]}` : undefined;
}

function setRung(option: ConjureOption, item: Item, rung: number, ctx: SpellEffectContext): void {
    const name = option.ladder?.[rung];
    if (name && typeof TypedItemSetOptionByName === "function")
        TypedItemSetOptionByName(Player, item, name, false, ctx.sender, false);
}

/** Whether the spell may put this asset (at this type) on the player: its prerequisites, the room, and the player's item permissions. */
function allowed(ctx: SpellEffectContext, option: ConjureOption, typeName?: string): boolean {
    const asset = AssetGet(Player.AssetFamily, option.group as AssetGroupName, option.asset);
    if (!asset)
        return false;
    if (!InventoryAllow(Player, asset, asset.Prerequisite, false) || InventoryGroupIsBlocked(Player, option.group as AssetGroupItemName) || !InventoryChatRoomAllow(asset.Category))
        return false;
    const type = typeName ? typeKey(option, typeName) : undefined;
    return !ctx.magic.stateModule.RedressedState.InventoryBlockedOrLimited(ctx.sender, AppearanceItem.fromAsset(asset), type);
}

/** The highest rung up to `rung` the player's item permissions allow, or -1 when not even the mildest is. */
function allowedRung(ctx: SpellEffectContext, option: ConjureOption, rung: number): number {
    if (!option.ladder)
        return allowed(ctx, option) ? 0 : -1;
    for (let r = Math.min(rung, option.ladder.length - 1); r >= 0; r--)
        if (allowed(ctx, option, option.ladder[r]))
            return r;
    return -1;
}

/** Puts one piece on a free slot at (up to) the given rung, if its prerequisites and the player's item permissions allow, using the crafted
 *  version when it fits. Never replaces what is worn. Does not refresh or announce; the caller does, once, after all of its pieces. */
export function placePiece(ctx: SpellEffectContext, option: ConjureOption, rung: number, craft?: CraftingItem): ConjurePiece | undefined {
    if (InventoryGet(Player, option.group as AssetGroupName))
        return undefined;
    const allowedAt = allowedRung(ctx, option, rung);
    if (allowedAt < 0)
        return undefined;
    const useCraft = craft && craft.Item === option.asset ? structuredClone(craft) : undefined;
    const skill = ctx.sender ? SkillGetWithRatio(ctx.sender, "Bondage") : 0;
    const item = InventoryWear(Player, option.asset, option.group as AssetGroupName, (useCraft?.Color as ItemColor | undefined) ?? undefined, skill, ctx.sender?.MemberNumber, useCraft, false);
    if (!item)
        return undefined;
    if (option.ladder)
        setRung(option, item, allowedAt, ctx);
    return { group: option.group, asset: option.asset, ...(option.ladder ? { rung: allowedAt } : {}) };
}

/** Puts a conjuring spell's pieces on free slots of the player, the main one first. Casting again does the same thing: it just adds pieces to whatever
 *  slots are still free. Everything put on is recorded in the spell effects state, so it comes off again when the spell ends. Never replaces anything worn. */
export function conjure(ctx: SpellEffectContext, set: ConjureSet, config: ConjureConfig): { placed: number } {
    const state = ctx.magic.stateModule.SpellEffectsState;
    let budget = config.Min + getRandomInt(config.Max - config.Min + 1);
    const placed: ConjurePiece[] = [];

    const free = set.options.filter(o => !InventoryGet(Player, o.group as AssetGroupName));
    const order = [...free.filter(o => o.primary), ...shuffled(free.filter(o => !o.primary))];
    const craft = config.Craft as unknown as CraftingItem | undefined;
    for (const option of order) {
        if (budget <= 0)
            break;
        const piece = placePiece(ctx, option, option.ladder ? getRandomInt(option.ladder.length) : 0, craft);
        if (!piece)
            continue;
        placed.push(piece);
        budget--;
    }

    if (placed.length > 0) {
        state.Add(ctx, { pieces: placed } satisfies ConjureData);
        CharacterRefresh(Player, true, false);
        ChatRoomCharacterUpdate(Player);
        SendAction(set.messages.bind);
    } else {
        SendAction(set.messages.nothing);
    }
    return { placed: placed.length };
}

/** Takes a conjured effect's pieces off again, but only those still the same item in the same slot. Something locked on since by someone else is
 *  left alone, except on safeword, which always frees the wearer. */
export function unconjure(entry: SpellEffectEntry, reason: string, set: ConjureSet): void {
    const pieces = (entry.data as ConjureData | null)?.pieces ?? [];
    let removed = 0;
    for (const piece of pieces) {
        const item = InventoryGet(Player, piece.group as AssetGroupName);
        if (!item || item.Asset.Name !== piece.asset)
            continue;
        if (item.Property?.LockedBy && reason !== "safeword")
            continue;
        InventoryRemove(Player, piece.group as AssetGroupName, false);
        removed++;
    }
    if (removed > 0) {
        CharacterRefresh(Player, true, false);
        ChatRoomCharacterUpdate(Player);
        if (set.messages.end)
            SendAction(set.messages.end);
    }
}
