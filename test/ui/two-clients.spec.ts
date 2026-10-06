// Two real LSCG clients, each in its own page and logged in as its own player, in one chat room. A relay carries the hidden chat messages and beeps
// LSCG talks with from one page to the other, as the server would. The caster casts from one; the target resolves on the other with its own rolls,
// saves, timers and state. Real BC code and assets on both sides, so these are few: the wider spread of effects and settings is covered by the
// unit tests, which send the same messages between two simulated players in milliseconds.
import { expect, test } from "./pair";
import type { Client } from "./pair";

type SpellSpec = { Name: string; Effects: string[]; Configs?: unknown[] };

/** Makes this client's dice come out as `values` in order (then the last forever), so a save roll is whatever the test needs. */
const seed = (c: Client, values: number[]) => c.run(v => {
    let i = 0;
    (window as any).__realRandom ??= Math.random;
    Math.random = () => v[Math.min(i++, v.length - 1)];
}, values);
const unseed = (c: Client) => c.run(() => { if ((window as any).__realRandom) Math.random = (window as any).__realRandom; });

/** The caster casts `spell` on the target, as the menu does once a spell and target are chosen. */
const cast = (caster: Client, target: Client, spell: SpellSpec, castArgs?: unknown) => caster.run(([n, s, args]) => {
    const w = window as any;
    const who = w.ChatRoomCharacter.find((c: any) => c.MemberNumber === n);
    w.LSCG.getModule("MagicModule").CastSpellActual({ AllowPotion: false, AllowVoiceCast: false, Creator: w.Player.MemberNumber, ...s }, who, false, undefined, args ?? undefined);
}, [target.memberNumber, spell, castArgs] as const);

const FAILS = [0.99, 0.0]; // attacker d20 = 20, defender d20 = 1: the spell lands
const SAVES = [0.0, 0.99]; // attacker d20 = 1, defender d20 = 20: the target saves
const DICE = Array(12).fill(0.5); // every die after that comes up in the middle: a d6 is 4

/** Reads something off this client's window. `fn` runs in the page, so it can't use anything from the test. */
const state = <T>(c: Client, fn: (w: any) => T): Promise<T> => c.page.evaluate(`(${fn.toString()})(window)`) as Promise<T>;

test.describe.configure({ timeout: 180_000 });

test("a spell crosses from one client to the other, the target rolls its own save, and it lands on the target alone", async ({ pair }) => {
    const { caster, target } = pair;
    await seed(target, FAILS);
    await cast(caster, target, { Name: "Blind", Effects: ["Blinding"] });
    await pair.settle(4500);
    await unseed(target);
    expect(await state(target, w => w.LSCG.getModule("StateModule").BlindState.Active)).toBe(true);
    expect(await state(caster, w => w.LSCG.getModule("StateModule").BlindState.Active)).toBe(false);
    expect(pair.log.some(l => l.startsWith("Caster:") && l.includes("Blind"))).toBe(true);
    expect(pair.log.some(l => /^Target: Save vs Blind: \d+ \(1[+-]\d+\) vs \d+ \(20[+-]\d+\), failed\.$/.test(l))).toBe(true); // the target's own roll first, then the caster's, both dice shown
});

test("a save resists the whole spell, but a Damaging effect still lets half through, and one set to 'No damage' lets none", async ({ pair }) => {
    const { caster, target } = pair;
    await seed(target, [...SAVES, ...DICE]);
    await cast(caster, target, {
        Name: "Storm", Effects: ["Damaging", "Damaging", "Blinding"],
        Configs: [{ Type: "Fire", Roll: "2d6 + 2" }, { Type: "Cold", Roll: "1d8", Save: "No damage" }, null],
    });
    await pair.settle(4500);
    await unseed(target);
    const said = pair.log.filter(l => l.startsWith("Target:")).join("\n");
    expect(said).toMatch(/Save vs Storm: .*saved!/);
    expect(said).toContain("successfully saves against Caster's Storm");
    expect(said).toMatch(/takes 5 fire damage, halved from 10\./);
    expect(said).not.toMatch(/cold/i);
    expect(await state(target, w => w.LSCG.getModule("StateModule").BlindState.Active)).toBe(false);
});

test("a command to follow crosses both ways: the target is compelled, and the caster's client learns it is being followed", async ({ pair }) => {
    const { caster, target } = pair;
    await seed(target, FAILS);
    await cast(caster, target, { Name: "Come", Effects: ["Commanding"], Configs: [{ Word: "follow", Ask: false, Allowed: ["follow"] }] });
    await pair.settle(4500);
    await unseed(target);
    const pairings = (c: Client) => state(c, w => w.LSCG.getModule("LeashingModule").Pairings.map((p: any) => ({ with: p.PairedMember, type: p.Type, source: p.IsSource })));
    expect(await pairings(target)).toEqual([{ with: 100001, type: "compulsion", source: false }]);
    expect(await pairings(caster)).toEqual([{ with: 100002, type: "compulsion", source: true }]);
});

test("conjured webs go on with real BC assets and prerequisites, and come off again when the spell ends", async ({ pair }) => {
    const { caster, target } = pair;
    await seed(target, FAILS);
    await cast(caster, target, { Name: "Snare", Effects: ["Web"], Configs: [{ Min: 3, Max: 3 }] });
    await pair.settle(4500);
    await unseed(target);
    const webs = () => state(target, w => w.Player.Appearance.filter((i: any) => /^Web/.test(i.Asset.Name)).map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort());
    expect(await webs()).toEqual(["ItemArms:Web", "ItemHead:WebBlindfold", "ItemMouth:WebGag"]);
    expect(await state(target, w => w.LSCG.getModule("StateModule").SpellEffectsState.Active)).toBe(true);

    // Time passes: the entry's own clock runs out
    await target.run(() => {
        const w = window as any;
        const effects = w.LSCG.getModule("StateModule").SpellEffectsState;
        effects.entries.forEach((e: any) => { e.activatedAt -= 24 * 60 * 60 * 1000; });
        effects.Tick(Date.now());
    });
    await pair.settle(1000);
    expect(await webs()).toEqual([]);
    expect(pair.log.some(l => l.startsWith("Target:") && l.includes("crumble away"))).toBe(true);
});
