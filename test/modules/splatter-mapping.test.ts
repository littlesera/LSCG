// SplatterMapping (the per-location tiers stored as flags on worn "Splatters" items: adding, removing, cleaning,
// colour/opacity per flag, the mouth) and SplatterModule's helpers: colour/opacity overrides, location labels and
// select areas, who may splat whom, target picking, the bound random splat, and the add/clean/in-mouth wrappers.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SplatterMapping, SplatterModule } from "Modules/splatter";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { makeGroup, makeAsset, makeItem, wear, makeCharacter, type FixtureCharacter, type FixtureItem } from "../harness/fixtures";
import { seedRandom, restoreRandom } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asChar = (C: FixtureCharacter) => C as any;

const FLAGS = "abcdefghijklmnopqr".split("");
const blankRecord = () => Object.fromEntries(FLAGS.map(f => [f, 0]));

describe("Splatter", () => {
	let splatter: SplatterModule;

	beforeAll(() => {
		[, , , splatter] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new SplatterModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true }, SplatterModule: { enabled: true, giver: true, taker: true } } });
		splatter.init();
		splatter.recentPartners = [];
		g.Player.IsLoverOfCharacter = () => false;
		for (const name of ["BodyMarkings", "FaceMarkings", "Mask"]) makeAsset(makeGroup({ Name: name, Category: "Appearance" }), { Name: "Splatters" });
	});

	afterEach(() => {
		restoreRandom();
		vi.unstubAllGlobals();
	});

	function splats(C: FixtureCharacter, record: Record<string, number> = {}, group = "BodyMarkings"): FixtureItem {
		const asset = g.Asset.find((a: { Name: string; Group: { Name: string } }) => a.Name === "Splatters" && a.Group.Name === group);
		return wear(C, makeItem(asset, { Property: { TypeRecord: { ...blankRecord(), ...record } } }));
	}

	describe("SplatterMapping", () => {
		it("merges flags across every splatter item and counts tiers per location", () => {
			const C = makeCharacter();
			splats(C, { a: 1, g: 1 });
			splats(C, { b: 1, h: 1, i: 1 }, "FaceMarkings");
			const map = new SplatterMapping(asChar(C));
			expect(map.getSplatItems()).toHaveLength(2);
			expect(map.getCurrentSplatTier("forehead")).toBe(2);
			expect(map.getCurrentSplatTier("chest")).toBe(3);
			expect(map.getCurrentSplatTier("tummy")).toBe(0);
		});

		it("adds the next tier at a location, with its colour and opacity", () => {
			const C = makeCharacter();
			const item = splats(C, { k: 1 }) as FixtureItem & { Color?: string[] };
			const map = new SplatterMapping(asChar(C));
			map.incrementSplat("tummy", "#ff0000", 50);
			expect(item.Property?.TypeRecord.l).toBe(1);
			expect(item.Color?.[FLAGS.indexOf("l")]).toBe("#ff0000");
			expect(item.Property?.Opacity[FLAGS.indexOf("l")]).toBe(0.5);
			expect(map.getColorAtLocation("tummy")).toBe("#ff0000");
			expect(map.getOpacityAtLocation("tummy")).toBe(0.5);
		});

		it("does nothing at a full or unknown location", () => {
			const C = makeCharacter();
			const item = splats(C, { p: 1 });
			const map = new SplatterMapping(asChar(C));
			const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
			map.incrementSplat("crotch");
			map.incrementSplat("elbow" as never);
			warn.mockRestore();
			expect(item.Property?.TypeRecord).toEqual({ ...blankRecord(), p: 1 });
		});

		it("puts a new splatter item in the first free slot when none is worn", () => {
			const C = makeCharacter();
			wear(C, makeItem(makeAsset(makeGroup({ Name: "BodyMarkings", Category: "Appearance" }), { Name: "Tattoo" })));
			g.InventoryWear.mockImplementationOnce((target: FixtureCharacter, name: string, group: string) => {
				const worn = { Asset: g.AssetGet("Female3DCG", group, name), Property: { TypeRecord: blankRecord() } };
				target.Appearance.push(worn as never);
				return worn;
			});
			new SplatterMapping(asChar(C)).incrementSplat("chest");
			const worn = C.Appearance.find(i => i.Asset.Name === "Splatters")!;
			expect(worn.Asset.Group.Name).toBe("FaceMarkings");
			expect(worn.Property?.TypeRecord.g).toBe(1);
		});

		it("gives up when every slot is taken by something else", () => {
			const C = makeCharacter();
			for (const grp of ["BodyMarkings", "FaceMarkings", "Mask"]) wear(C, makeItem(makeAsset(makeGroup({ Name: grp, Category: "Appearance" }), { Name: "Other" })));
			new SplatterMapping(asChar(C)).incrementSplat("chest");
			expect(g.InventoryWear).not.toHaveBeenCalled();
		});

		it("removes the highest tier at a location, and cleans one location or everything", () => {
			const C = makeCharacter();
			const item = splats(C, { g: 1, h: 1, a: 1, k: 1 });
			const map = new SplatterMapping(asChar(C));
			map.decrementSplat("chest");
			expect(item.Property?.TypeRecord).toMatchObject({ g: 1, h: 0 });
			map.decrementSplat("ass");
			map.cleanSplatLocation("forehead");
			expect(item.Property?.TypeRecord).toMatchObject({ a: 0, k: 1 });
			map.cleanSplatLocation("all");
			expect(Object.values(item.Property?.TypeRecord ?? {}).every(v => v === 0)).toBe(true);
		});

		it("has nothing to report for a clean location", () => {
			const map = new SplatterMapping(asChar(makeCharacter()));
			expect(map.findItemFromLocation("chest")).toBeUndefined();
			expect(map.getColorAtLocation("chest")).toBeUndefined();
			expect(map.getOpacityAtLocation("chest")).toBeUndefined();
		});

		it("reads a single colour or opacity that isn't per flag", () => {
			const C = makeCharacter();
			const item = splats(C, { g: 1 }) as FixtureItem & { Color?: string };
			item.Color = "#00ff00";
			item.Property!.Opacity = 0.3;
			const map = new SplatterMapping(asChar(C));
			expect(map.getColorAtLocation("chest")).toBe("#00ff00");
			expect(map.getOpacityAtLocation("chest")).toBe(0.3);
		});

		it("splats into, detects and cleans the mouth", () => {
			const C = makeCharacter();
			splats(C);
			const map = new SplatterMapping(asChar(C));
			expect(map.hasInMouth()).toBe(false);
			map.splatInMouth();
			expect(map.hasInMouth()).toBe(true);
			map.cleanInMouth();
			expect(map.hasInMouth()).toBe(false);
		});
	});

	describe("overrides", () => {
		it("picks a valid colour from the list", () => {
			vi.stubGlobal("CommonIsColor", (c: string) => /^#[0-9a-f]{6}$/i.test(c));
			expect(splatter.getColorOverride(null)).toBe("Default");
			expect(splatter.getColorOverride("nope, #FF0000")).toBe("#FF0000");
			expect(splatter.getColorOverride("nope")).toBe("Default");
		});

		it("picks an opacity, or a value inside a range", () => {
			expect(splatter.getOpacityOverride(null)).toBe(70);
			expect(splatter.getOpacityOverride("40")).toBe(40);
			seedRandom([0.5]);
			expect(splatter.getOpacityOverride("80-20")).toBe(50);
			expect(splatter.getOpacityOverride("junk")).toBe(70);
		});
	});

	describe("labels and areas", () => {
		it("words locations for the target's body", () => {
			const her = makeCharacter();
			const him = makeCharacter({ flags: { pronouns: "HeHim", hasPenis: true } });
			expect(["mouth", "forehead", "chest", "tummy", "crotch", "ass", "nipples", "all"].map(l => splatter.getLocationLabel(l as never, asChar(her))))
				.toEqual(["Mouth", "Face", "Breasts", "Stomach", "Pussy", "Ass", "Nipples", "Nowhere"]);
			expect([splatter.getLocationLabel("chest", asChar(him)), splatter.getLocationLabel("crotch", asChar(him))]).toEqual(["Chest", "Cock"]);
		});

		it("lays the location buttons out three to a row", () => {
			const areas = splatter.getLocationSelectAreas();
			expect(areas).toHaveLength(7);
			expect(areas[3][0]).toEqual([0, 25, 240, 60]);
		});
	});

	describe("who may splat whom", () => {
		const other = (settings: Record<string, unknown>, extra: Partial<FixtureCharacter> = {}) =>
			Object.assign(makeCharacter({ MemberNumber: 5, LSCG: { GlobalModule: { enabled: true }, SplatterModule: { enabled: true, taker: true, giver: true, ...settings } }, ...extra }),
				{ IsLoverOfCharacter: () => false }) as FixtureCharacter;

		it("oneself always; others unless blacklisted, or not a lover when lovers are required", () => {
			expect(splatter.splatAllowed(asChar(player()), asChar(player()))).toBe(true);
			expect(splatter.splatAllowed(asChar(player()), asChar(other({})))).toBe(true);
			expect(splatter.splatAllowed(asChar(player()), asChar(other({ blacklist: [1] })))).toBe(false);
			expect(splatter.splatAllowed(asChar(player()), asChar(other({ requireLover: true })))).toBe(false);
			expect(splatter.splatAllowed(asChar(player()), asChar(other({ requireLover: true, whitelist: [1] })))).toBe(true);
		});

		it("receiving needs LSCG, the module and the taker option", () => {
			expect(splatter.canReceiveSplat(asChar(other({})))).toBe(true);
			expect(splatter.canReceiveSplat(asChar(other({ taker: false })))).toBe(false);
			expect(splatter.canReceiveSplat(asChar(makeCharacter()))).toBeFalsy();
		});

		it("giving needs access, enough arousal and the giver option", () => {
			const giver = other({}, { ArousalSettings: { Progress: 95 } });
			expect(splatter.canGiveSplat(asChar(giver))).toBe(true);
			giver.flags.edged = true;
			expect(splatter.canGiveSplat(asChar(giver))).toBe(false);
			giver.flags.edged = false;
			giver.flags.vulvaChaste = true;
			expect(splatter.canGiveSplat(asChar(giver))).toBe(false);
		});

		it("targets are recent partners and the neighbours who can take it", () => {
			const left = addToRoom(other({}, { MemberNumber: 5 }));
			addToRoom(player());
			const right = addToRoom(other({ taker: false }, { MemberNumber: 6 }));
			const partner = addToRoom(other({}, { MemberNumber: 7 }));
			splatter.recentPartners = [7];
			expect(splatter.FindSplatterTargets()).toEqual([partner, left]);
			expect(splatter.getTargetSelectAreas().map(a => a[1])).toEqual([partner, left]);
			expect(right).toBeDefined();
		});
	});

	describe("prompt and random splat", () => {
		beforeEach(() => {
			vi.stubGlobal("CurrentTime", 1000);
			vi.stubGlobal("ActivityOrgasmGameTimer", 0);
		});

		it("prompting sets up the orgasm timer and the callback", () => {
			const callback = vi.fn();
			splatter.PromptForSplat(callback);
			expect(splatter.AutoSplatPrompt).toBe(true);
			expect(player().ArousalSettings).toMatchObject({ OrgasmTimer: 21000, OrgasmStage: 2 });
			splatter.ResetPrompt();
			expect(splatter.AutoSplatPrompt).toBe(false);
			expect(callback).toHaveBeenCalledOnce();
		});

		it("a bound player has no say in where it lands", () => {
			player().flags.restrained = true;
			player().flags.canWalk = false;
			const random = vi.spyOn(splatter, "RandomSplat").mockImplementation(() => {});
			splatter.PromptForSplat(vi.fn());
			expect(random).toHaveBeenCalledOnce();
			random.mockRestore();
		});

		it("RandomSplat lands on oneself, a target, or nowhere", () => {
			const send = vi.spyOn(splatter, "SendSplatter").mockImplementation(() => {});
			const reset = vi.spyOn(splatter, "ResetPrompt").mockImplementation(() => {});
			seedRandom([0, 0.9]);
			splatter.RandomSplat();
			expect(send).toHaveBeenLastCalledWith(player(), "tummy");
			seedRandom([0, 0.1]);
			splatter.RandomSplat();
			expect(reset).toHaveBeenCalledOnce();
			send.mockRestore();
			reset.mockRestore();
		});

		it("SendSplatter runs the splat activity on an allowed target", () => {
			vi.stubGlobal("ActivityGetGroupOrMirror", vi.fn(() => ({ Name: "ItemBreast" })));
			vi.stubGlobal("ActivityRun", vi.fn());
			const target = Object.assign(makeCharacter({ MemberNumber: 5, LSCG: { GlobalModule: { enabled: true }, SplatterModule: { enabled: true, taker: true } } }), { IsLoverOfCharacter: () => true });
			g.ActivityAllowedForGroup = vi.fn(() => [{ Activity: { Name: "LSCG_Splat" } }]);
			splatter.SendSplatter(asChar(target), "chest");
			expect(g.ActivityGetGroupOrMirror).toHaveBeenCalledWith("Female3DCG", "ItemBreast");
			expect(g.ActivityRun).toHaveBeenCalledOnce();
		});
	});

	describe("player-side wrappers", () => {
		it("add, clean one, clean all", () => {
			const item = splats(player());
			splatter.AddSplatter(asChar(player()), "nipples", "Default", 70);
			expect(item.Property?.TypeRecord.r).toBe(1);
			splatter.CleanSingleSplatter("nipples");
			expect(item.Property?.TypeRecord.r).toBe(0);
			splatter.AddSplatter(asChar(player()), "ass", "Default", 70);
			splatter.safeword();
			expect(item.Property?.TypeRecord.q).toBe(0);
			expect(g.ChatRoomCharacterUpdate).toHaveBeenCalled();
		});

		it("moves a splat from the source's location into a mouth, keeping its look", () => {
			const source = makeCharacter({ MemberNumber: 5 });
			const theirs = splats(source, { g: 1 }) as FixtureItem & { Color?: string[] };
			theirs.Color = FLAGS.map(f => (f === "g" ? "#123456" : "Default"));
			const mine = splats(player()) as FixtureItem & { Color?: string[] };
			expect(splatter.HasSplatAt(asChar(source), "chest")).toBe(true);
			expect(splatter.HasSplatAt(null, "chest")).toBe(false);
			splatter.AddSplatInMouth(asChar(player()), asChar(source), "chest");
			expect(splatter.IsSplatInMouth(asChar(player()))).toBe(true);
			expect(mine.Color?.[FLAGS.indexOf("o")]).toBe("#123456");
			splatter.ClearSplatInMouth(asChar(player()));
			expect(splatter.IsSplatInMouth(asChar(player()))).toBe(false);
		});

		it("nothing to move from a clean source", () => {
			splats(player());
			splatter.AddSplatInMouth(asChar(player()), asChar(makeCharacter()), "chest");
			expect(splatter.IsSplatInMouth(asChar(player()))).toBe(false);
		});

		it("getSplats / splatSlotOccupied look at the old single splatter item", () => {
			expect(splatter.splatSlotOccupied()).toBe(false);
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "BodyMarkings", Category: "Appearance" }), { Name: "Splatter" })));
			expect(splatter.getSplats()).toHaveLength(1);
			expect(splatter.splatSlotOccupied()).toBe(true);
		});
	});
});
