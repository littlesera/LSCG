// The restraints Web, Slime and Conjure Ropes put on, checked against real BC data: every asset and type option the spells name has to exist
// where the spell expects it, and BC's own type setter has to accept the ladder names. If BC renames or moves one, this is where it shows.
import { describe, expect, it } from "vitest";
import { ROPES_SET, SLIME_SET, WEB_SET } from "Modules/Magic/effects/restraints";
import type { ConjureSet } from "Modules/Magic/conjure";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset | undefined {
	return (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
}

const SETS: [string, ConjureSet][] = [["Web", WEB_SET], ["Slime", SLIME_SET], ["Conjured Ropes", ROPES_SET]];

describe("conjured restraint sets against real BC", () => {
	for (const [name, set] of SETS) {
		describe(name, () => {
			it.each(set.options.map(o => [`${o.group}:${o.asset}`, o] as const))("%s is a real asset", (_label, option) => {
				expect(findAsset(option.group, option.asset), `${option.group}:${option.asset} no longer exists in BC`).toBeDefined();
			});

			it("has exactly one main (primary) piece, and its slot is the arms", () => {
				const primary = set.options.filter(o => o.primary);
				expect(primary.map(o => o.group)).toEqual(["ItemArms"]);
			});

			it("takes each slot at most once", () => {
				const slots = set.options.map(o => o.group);
				expect(new Set(slots).size).toBe(slots.length);
			});

			it.each(set.options.filter(o => o.ladder).map(o => [`${o.group}:${o.asset}`, o] as const))("%s: every rung is a real type option, mildest first", (_label, option) => {
				const data = g.TypedItemDataLookup[`${option.group}${option.asset}`];
				expect(data, `${option.group}${option.asset} is not a typed item`).toBeDefined();
				const names: string[] = data.options.map((o: { Name: string }) => o.Name);
				const positions = option.ladder!.map(rung => {
					expect(names, `${rung} is not an option of ${option.group}:${option.asset}`).toContain(rung);
					return names.indexOf(rung);
				});
				expect(positions).toEqual([...positions].sort((a, b) => a - b));
			});
		});
	}

	it("each rung's permission key is what the spell builds: the option's typed index", () => {
		const data = g.TypedItemDataLookup["ItemArmsWeb"];
		expect(data.name).toBe("typed");
		for (const [index, rung] of WEB_SET.options[0].ladder!.entries()) {
			const option = data.options.find((o: { Name: string }) => o.Name === rung);
			expect(option.Property.TypeRecord).toEqual({ typed: index });
		}
	});

	it("the web needs breasts, which is why the spell checks prerequisites before wearing", () => {
		const asset = findAsset("ItemArms", "Web")!;
		expect(asset.Prerequisite).toContain("HasBreasts");
	});
});
