import { LSCGSpellEffect } from "Settings/Models/magic";
import { SendAction, forceOrgasm } from "utils";
// Type-only: spellEffects.ts imports this file to register the built-ins.
import type { SpellEffectDefinition } from "./spellEffects";

/** BC's own bounds and "a lot" step from TightenLoosenItem.js. */
const MIN_TIGHTNESS = -10;
const TIGHTEN_STEP = 4;

/** Tightens (positive) or loosens (negative) every unlocked restraint the player wears, within the bounds BC's
 *  Tighten/Loosen dialog uses. The maximum depends on the caster's Bondage skill, as it does for whoever uses the
 *  dialog. Locked items are skipped: BC only lets you tighten or loosen what you could unlock. Returns how many changed. */
function adjustRestraints(delta: number, caster: Character | null): number {
    const casterSkill = !!caster ? SkillGetLevel(caster, "Bondage") : 0;
    let changed = 0;
    for (const item of Player.Appearance) {
        if (item.Asset.Group.Category !== "Item" || !item.Asset.AllowTighten || !!item.Property?.LockedBy)
            continue;
        const current = item.Difficulty ?? item.Asset.Difficulty;
        const max = casterSkill + 4 + item.Asset.Difficulty + (item.Craft?.Effects?.Secure ?? 0) * 4;
        const next = Math.max(MIN_TIGHTNESS, Math.min(max, current + delta));
        if (next !== current) {
            item.Difficulty = next;
            changed++;
        }
    }
    if (changed > 0) {
        CharacterRefresh(Player, true, false);
        ChatRoomCharacterUpdate(Player);
    }
    return changed;
}

/** LSCG's own spell effects, in the order they appear in menus. Labels equal the stored ids. */
export const BUILTIN_SPELL_EFFECTS: SpellEffectDefinition[] = [
    {
        id: LSCGSpellEffect.hypnotizing,
        label: LSCGSpellEffect.hypnotizing,
        description: "Hypnotizes the target.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction("%NAME% is unable to fight the spell's hypnotizing influence, slumping weakly as %POSSESSIVE% eyes go blank.");
            magic.stateModule.HypnoState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.slumber,
        label: LSCGSpellEffect.slumber,
        description: "Induces a deep slumber in the target.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction("%NAME% succumbs to the spell's overwhelming pressure, %POSSESSIVE% eyes closing as %PRONOUN% falls unconscious.");
            magic.stateModule.SleepState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.horny,
        label: LSCGSpellEffect.horny,
        description: "Arouses the target.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.GaggedState.Active ? SendAction("A blush runs into %NAME%'s cheeks uncontrollably.") : SendAction("A moan escapes %NAME%'s lips uncontrollably.");
            magic.stateModule.HornyState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.blindness,
        label: LSCGSpellEffect.blindness,
        description: "Prevents the target from seeing.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction("%NAME%'s eyes dart around, %POSSESSIVE% world suddenly plunged into darkness.");
            magic.stateModule.BlindState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.deafened,
        label: LSCGSpellEffect.deafened,
        description: "Prevents the target from hearing.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction("%NAME% frowns as %PRONOUN% is completely deafened.");
            magic.stateModule.DeafState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.muted,
        label: LSCGSpellEffect.muted,
        description: "Gags the target.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            Player.IsGagged() ? SendAction("%NAME%'s protests suddenly fall completely silent.") : SendAction("%NAME%'s mouth moves in protest but not a single sound escapes.");
            magic.stateModule.GaggedState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.frozen,
        label: LSCGSpellEffect.frozen,
        description: "Petrifies the target.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction("%NAME%'s eyes widen in a panic as %POSSESSIVE% muscles seize in place.");
            magic.stateModule.FrozenState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.enlarge,
        label: LSCGSpellEffect.enlarge,
        description: "Enlarges the target to twice their size.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.ResizedState.Enlarge(sender?.MemberNumber, duration, true);
        },
    },
    {
        id: LSCGSpellEffect.bless,
        label: LSCGSpellEffect.bless,
        description: "Applies a +5 buff to all the target's skills for 15 minutes",
        beneficial: true,
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.BuffedState.Bless(sender?.MemberNumber, true, duration);
        },
    },
    {
        id: LSCGSpellEffect.bane,
        label: LSCGSpellEffect.bane,
        description: "Applies a -5 debuff to all the target's skills for 15 minutes",
        forcesDuration: true,
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.BuffedState.Bane(sender?.MemberNumber, true, duration);
        },
    },
    {
        id: LSCGSpellEffect.paired_arousal,
        label: LSCGSpellEffect.paired_arousal,
        description: "Pair two targets, such that when one feels arousal the other also does.",
        paired: true,
        allowRandom: true,
        apply: ({ magic, sender, paired, duration }) => {
            if (!!paired && !!sender) {
                SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
                magic.stateModule.ArousalPairedState.DoPair(paired, sender, duration);
                magic.NotifyPair(sender, paired, LSCGSpellEffect.paired_arousal, magic.stateModule.ArousalPairedState.Type);
            }
        },
        applyPaired: ({ magic, sender }, originalTarget) => {
            SendAction(`%NAME% squirms as %POSSESSIVE% arousal is paired.`);
            magic.stateModule.ArousalPairedState.RespondToPairing(originalTarget, sender);
        },
    },
    {
        id: LSCGSpellEffect.orgasm_siphon,
        label: LSCGSpellEffect.orgasm_siphon,
        description: "Redirect all of the target's orgasmic pleasure to another.",
        paired: true,
        allowRandom: true,
        apply: ({ magic, sender, paired, duration }) => {
            if (!!paired && !!sender) {
                magic.stateModule.GaggedState.Active ?
                    SendAction(`%NAME% quivers as %PRONOUN% feels %POSSESSIVE% impending denial.`) :
                    SendAction(`%NAME% whimpers as %PRONOUN% feels %POSSESSIVE% impending denial.`);
                magic.stateModule.OrgasmSiphonedState.DoPair(paired, sender, duration);
                magic.NotifyPair(sender, paired, LSCGSpellEffect.orgasm_siphon, magic.stateModule.OrgasmSiphonedState.Type);
            }
        },
        applyPaired: ({ magic, sender }, originalTarget) => {
            SendAction(`%NAME% lets out a quiet gasp as the pleasure center of %POSSESSIVE% mind starts to tingle.`);
            magic.stateModule.OrgasmSiphonedState.RespondToPairing(originalTarget, sender);
        },
    },
    {
        id: LSCGSpellEffect.outfit,
        label: LSCGSpellEffect.outfit,
        description: "Magically change the target's clothing and equipment.",
        configurable: "outfit",
        allowRandom: true,
        apply: ({ magic, sender, spell, duration }) => {
            if (!!spell.Outfit?.Code) {
                magic.stateModule.GaggedState.Active ?
                    SendAction("%NAME% trembles as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.") :
                    SendAction("%NAME% squeaks as %POSSESSIVE% clothing shimmers and morphs around %INTENSIVE%.");
                magic.stateModule.RedressedState.Apply(spell, sender?.MemberNumber, duration);
            }
        },
    },
    {
        id: LSCGSpellEffect.polymorph,
        label: LSCGSpellEffect.polymorph,
        description: "Polymorph the target's body and/or cosplay items",
        configurable: "polymorph",
        allowRandom: true,
        apply: ({ magic, sender, spell, duration }) => {
            if (!!spell.Polymorph?.Code) {
                magic.stateModule.GaggedState.Active ?
                    SendAction("%NAME% trembles as %POSSESSIVE% body shimmers and morphs.") :
                    SendAction("%NAME% squeaks as %POSSESSIVE% body shimmers and morphs.");
                magic.stateModule.PolymorphedState.Apply(spell, sender?.MemberNumber, duration);
            }
        },
    },
    {
        id: LSCGSpellEffect.dispel,
        label: LSCGSpellEffect.dispel,
        description: "Dispels any existing effects on the target (including anything drug induced).",
        beneficial: true,
        allowRandom: true,
        apply: ({ magic }) => {
            SendAction("%NAME% gasps, blinking as any magic affecting %INTENSIVE% is removed.");
            magic.stateModule.Clear(false, true);
        },
    },
    {
        id: LSCGSpellEffect.xRay,
        label: LSCGSpellEffect.xRay,
        description: "Grants the target X-Ray vision",
        beneficial: true,
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction(`%NAME% blinks with a grin.`);
            magic.stateModule.XRayState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.barrier,
        label: LSCGSpellEffect.barrier,
        description: "Create a magic barrier that protect and reflect incoming spell",
        beneficial: true,
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.BarrierState.Barrier(sender?.MemberNumber, true, duration);
        },
    },
    {
        id: LSCGSpellEffect.disarm,
        label: LSCGSpellEffect.disarm,
        description: "Disarm the target",
        allowRandom: true,
        apply: ({ sender }) => {
            var handItem = InventoryGet(Player, "ItemHandheld");
            if (!handItem) {
                SendAction(`The spell has no effect as %NAME%'s hand are already empty.`);
                return;
            }
            var validParams = ValidationCreateDiffParams(Player, sender?.MemberNumber!);
            if (ValidationCanRemoveItem(handItem, validParams, false)) {
                InventoryRemove(Player, "ItemHandheld", true);
                CharacterRefresh(Player, true);
                ChatRoomCharacterUpdate(Player);
                SendAction(`%NAME% flinches as the item in %POSSESSIVE% hand is flung into the air.`);
            }
            else {
                SendAction(`The spell was not strong enough to disarm %NAME%.`);
            }
        },
    },
    {
        id: LSCGSpellEffect.denial,
        label: LSCGSpellEffect.denial,
        description: "Denies the target any orgasms.",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            magic.stateModule.GaggedState.Active ?
                SendAction(`%NAME% quivers as %PRONOUN% feels %POSSESSIVE% impending denial.`) :
                SendAction(`%NAME% whimpers as %PRONOUN% feels %POSSESSIVE% impending denial.`);
            magic.stateModule.DeniedState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.orgasm,
        label: LSCGSpellEffect.orgasm,
        description: "Forced an orgasm upon the target.",
        allowRandom: true,
        apply: () => {
            forceOrgasm();
        },
    },
    {
        id: LSCGSpellEffect.project,
        label: LSCGSpellEffect.project,
        description: "Project the target's soul into the Astral Plane",
        allowRandom: true,
        apply: ({ magic, sender, duration }) => {
            SendAction(`%NAME_POSSESSIVE_DIRECT% body slumps weakly as a shimmering projection of %POSSESSIVE% form appears nearby.`);
            magic.stateModule.AstralProjectionState.Activate(sender?.MemberNumber, duration);
        },
    },
    {
        id: LSCGSpellEffect.tighten,
        label: LSCGSpellEffect.tighten,
        description: "Tightens every unlocked restraint on the target.",
        allowRandom: true,
        apply: ({ sender }) => {
            if (adjustRestraints(TIGHTEN_STEP, sender) > 0) {
                SendAction("%NAME% gasps as every restraint on %INTENSIVE% cinches tighter, pulled taut by unseen hands.");
                TightenLoosenFacialExpression(Player, "Medium", "Surprised", "Harsh");
            } else
                SendAction("The spell tugs at %NAME%, but finds nothing it can tighten.");
        },
    },
    {
        id: LSCGSpellEffect.loosen,
        label: LSCGSpellEffect.loosen,
        description: "Loosens every unlocked restraint on the target.",
        beneficial: true,
        allowRandom: true,
        apply: ({ sender }) => {
            if (adjustRestraints(-TIGHTEN_STEP, sender) > 0) {
                SendAction("%NAME% lets out a relieved breath as %POSSESSIVE% restraints slacken.");
                TightenLoosenFacialExpression(Player, "ShortBreath", "Closed", "Soft");
            } else
                SendAction("The spell brushes over %NAME%, but finds nothing it can loosen.");
        },
    },
];
