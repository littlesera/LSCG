// The built-in drug table drives the injector's generic code, so every entry must name settings that really exist and agree with the defaults.
import { beforeAll, describe, expect, it } from "vitest";
import { BUILT_IN_DRUGS, builtInDrug, isBuiltInDrugId } from "Modules/drugs/builtin";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { boot } from "../harness/world";
import { isExtensionDrugId } from "api/drugs";

describe("BUILT_IN_DRUGS", () => {
	let defaults: Record<string, unknown>;

	beforeAll(() => {
		const [, , , , injector] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new InjectorModule(), new HypnoModule(), new StateModule(),
		);
		defaults = (injector as InjectorModule).defaultSettings as unknown as Record<string, unknown>;
	});

	it("has unique ids that can't be mistaken for an extension drug", () => {
		const ids = BUILT_IN_DRUGS.map(d => d.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) {
			expect(isExtensionDrugId(id)).toBe(false);
			expect(id).not.toBe("antidote");
		}
	});

	it.each(BUILT_IN_DRUGS.map(d => [d.id, d] as const))("%s names settings that exist, with matching defaults", (_id, drug) => {
		expect(typeof defaults[drug.enableKey]).toBe("boolean");
		expect(typeof defaults[drug.levelKey]).toBe("number");
		expect(typeof defaults[drug.maxKey]).toBe("number");
		expect(defaults[drug.cooldownKey]).toBe(drug.defaultCooldown);
		expect(Array.isArray(defaults[drug.keywordsKey])).toBe(true);
		expect((defaults[drug.keywordsKey] as string[]).length).toBeGreaterThan(0);
		expect(drug.color).toMatch(/^#[0-9a-f]{6}$/i);
		expect(drug.label).not.toBe("");
		expect(drug.soakKeywords.length).toBeGreaterThan(0);
	});

	it("looks drugs up by id", () => {
		expect(builtInDrug("horny")?.label).toBe("Aphrodisiac");
		expect(builtInDrug("antidote")).toBeUndefined();
		expect(isBuiltInDrugId("sedative")).toBe(true);
		expect(isBuiltInDrugId("test.giggle")).toBe(false);
	});
});
