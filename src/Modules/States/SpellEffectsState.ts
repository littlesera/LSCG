import { ICONS, hookFunction, LSCG_SendLocal, settingsSave } from "utils";
import { ModuleCategory } from "Settings/setting_definitions";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";
import { effectTier, getSpellEffect, type SpellEffectContext } from "Modules/Magic/spellEffects";
import { getModule } from "modules";
import type { MagicModule } from "Modules/magic";

/** One thing a spell did to the player that has to be undone later: items it put on, a restriction it set, and so on. */
export interface SpellEffectEntry {
    id: string;
    effect: string;
    /** The effect's tier when it was applied, kept so a later dispel can tell strong magic from weak. */
    tier: number;
    spellName: string;
    /** The caster's member number, or -1 when unknown. */
    by: number;
    activatedAt: number;
    /** How long it lasts in ms; 0 for no expiry. */
    duration: number;
    /** Whatever the effect needs to undo itself; plain JSON, since it is saved with the player. */
    data: unknown;
}

export type SpellEffectEndReason = "expired" | "dispel" | "safeword" | "manual";

/** Spell effects that put something on the player and have to take it off again run through here. The state is a list of entries,
 *  each with its own expiry, and calls the effect's `onEnd` when one ends: it runs out, the player is dispelled or uses safeword.
 *  Entries are saved with the player (privately, like outfit snapshots), so they keep counting down across a relog. */
export class SpellEffectsState extends BaseState {
    Type: LSCGState = "spell-effects";
    /** Where the entries live in the state's extension settings. Listed in PRIVATE_STATE_EXTENSIONS. */
    static readonly ENTRIES_KEY = "spell-effects";

    Icon(C: OtherCharacter): string {
        return ICONS.PENDANT;
    }
    Label(C: OtherCharacter): string {
        return "Enchanted";
    }

    constructor(state: StateModule) {
        super(state);
    }

    get entries(): SpellEffectEntry[] {
        return this.extensions[SpellEffectsState.ENTRIES_KEY] ??= [];
    }

    /** The entries a given effect has on the player right now. */
    EntriesFor(effect: string): SpellEffectEntry[] {
        return this.entries.filter(e => e.effect === effect);
    }

    /** Records something a spell effect just did. `data` is whatever the effect needs to undo it. */
    Add(ctx: SpellEffectContext, data?: unknown): SpellEffectEntry {
        const entry: SpellEffectEntry = {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            effect: ctx.effect,
            tier: effectTier(ctx.effect, ctx.config),
            spellName: ctx.spell.Name,
            by: ctx.sender?.MemberNumber ?? -1,
            activatedAt: Date.now(),
            duration: ctx.duration ?? 0,
            data: data ?? null,
        };
        this.entries.push(entry);
        this.RefreshRestrictions();
        if (!this.Active)
            this.Activate(entry.by);
        else
            settingsSave(true);
        return entry;
    }

    /** Changes what an entry will undo, e.g. after a repeat cast made a piece stronger. */
    Update(entry: SpellEffectEntry, data: unknown): void {
        entry.data = data;
        settingsSave(true);
    }

    /** Ends one entry now: runs its effect's `onEnd` and forgets it. The state ends with its last entry. */
    End(entry: SpellEffectEntry, reason: SpellEffectEndReason): void {
        const index = this.entries.indexOf(entry);
        if (index < 0)
            return;
        this.entries.splice(index, 1);
        this.RefreshRestrictions();
        this.RunEnd(entry, reason);
        if (this.entries.length === 0)
            this.Deactivate(reason);
        else
            settingsSave(true);
    }

    private RunEnd(entry: SpellEffectEntry, reason: SpellEffectEndReason): void {
        const magic = getModule<MagicModule>("MagicModule");
        try {
            getSpellEffect(entry.effect)?.onEnd?.(entry, reason, magic);
        } catch (e) {
            console.warn(`LSCG: ending the ${entry.effect} spell effect failed`, e);
        }
    }

    private Deactivate(reason: SpellEffectEndReason): void {
        // The state-level end for events and saving. Entries are all gone, so the base Recover has nothing of ours left to undo.
        this.recoverReason = reason;
        try {
            super.Recover(false);
        } finally {
            this.recoverReason = undefined;
        }
    }

    /** What the entries stop the player doing, worked out from them: the state's restrictions are whatever its effects ask for right now. */
    RefreshRestrictions(): void {
        const merged = { Walk: "false", Stand: "false", Hearing: "false", Sight: "false", Wardrobe: "false", Move: "false", Speech: "false" } as StateRestrictions;
        for (const entry of this.entries)
            for (const [key, value] of Object.entries(getSpellEffect(entry.effect)?.restrictions?.(entry) ?? {}))
                if (value === "true")
                    merged[key as keyof StateRestrictions] = "true";
        this.Restrictions = merged;
    }

    Tick(now: number): void {
        if (!this.Active)
            return;
        const magic = getModule<MagicModule>("MagicModule");
        // Copy first: ending an entry changes the list
        for (const entry of [...this.entries]) {
            if (entry.duration > 0 && entry.activatedAt + entry.duration < now)
                this.End(entry, "expired");
            else
                getSpellEffect(entry.effect)?.onTick?.(entry, now, magic);
        }
    }

    /** Dispel, safeword and manual recovery all end every entry. */
    Recover(emote?: boolean): BaseState | undefined {
        const reason: SpellEffectEndReason = this.recoverReason === "dispel" ? "dispel" : this.recoverReason === "safeword" ? "safeword" : "manual";
        const all = [...this.entries];
        this.entries.length = 0;
        this.RefreshRestrictions();
        all.forEach(entry => this.RunEnd(entry, reason));
        this.Deactivate(reason);
        return this;
    }

    /** Whether any spell effect is keeping the player in the room (a "stay" command). */
    get HoldsInPlace(): boolean {
        return this.Active && this.entries.some(entry => getSpellEffect(entry.effect)?.holdsInPlace?.(entry));
    }

    Init(): void {
        this.RefreshRestrictions(); // entries saved before a relog still count
        // Same hook the vanilla leash and LSCG's clasps use to keep someone from leaving
        hookFunction("ChatRoomCanLeave", 1, (args, next) => {
            if (this.HoldsInPlace) {
                LSCG_SendLocal("A spell's command holds you where you are.");
                return false;
            }
            return next(args);
        }, ModuleCategory.States);
    }

    RoomSync(): void {
        // Effects that need re-applying when the player enters a room (they get their entries to find out)
        const magic = getModule<MagicModule>("MagicModule");
        for (const entry of [...this.entries])
            getSpellEffect(entry.effect)?.onRoomSync?.(entry, magic);
    }

    SpeechBlock(): void {}
}
