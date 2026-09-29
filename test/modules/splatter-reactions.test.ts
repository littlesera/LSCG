// SplatterModule's OnActivity reaction to a received Lick: cleans the splat at
// the licked location. Also pins a real bug: the "ChatOther/ChatSelf-ItemMouth-
// Lick" case has no `break`, so it falls through into the ItemHead ("forehead")
// case and wrongly cleans the forehead splat too whenever the mouth is licked.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SplatterModule } from "Modules/splatter";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld, addToRoom } from "../harness/world";
import { receive } from "../harness/room";
import { makeGroup, makeAsset, makeItem, wear, makeCharacter, resetAssetRegistry } from "../harness/fixtures";

describe("SplatterModule: incoming Lick cleans only the licked location", () => {
	let splatter: SplatterModule;

	beforeAll(() => {
		[, , , splatter] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new SplatterModule());
	});

	beforeEach(() => {
		resetAssetRegistry();
		const bodyMarkings = makeGroup({ Name: "BodyMarkings", Category: "Appearance" });
		const splatterAsset = makeAsset(bodyMarkings, { Name: "Splatters" });

		const player = resetWorld({
			LSCG: { GlobalModule: { enabled: true }, SplatterModule: { enabled: true, requireLover: false, whitelist: null, blacklist: null } },
		});
		// A splat item covering both the mouth flags (d/e/f/o) and a forehead
		// flag (a) -- exactly the two locations the buggy fall-through conflates.
		wear(player, makeItem(splatterAsset, { Property: { TypeRecord: { d: 1, a: 1 } } }));
		splatter.init();
	});

	function lickMouth() {
		const sender = addToRoom(makeCharacter({ MemberNumber: 222 }));
		receive.activity(sender, "ItemMouth", "Lick", globalThis.Player as never);
	}

	it("cleans the mouth splat when the mouth is licked", () => {
		expect(splatter.HasSplatAt(globalThis.Player as never, "mouth")).toBe(true);
		lickMouth();
		expect(splatter.HasSplatAt(globalThis.Player as never, "mouth")).toBe(false);
	});

	it("does not also clean the forehead splat when the mouth (not the forehead) is licked", () => {
		expect(splatter.HasSplatAt(globalThis.Player as never, "forehead")).toBe(true);
		lickMouth();
		expect(splatter.HasSplatAt(globalThis.Player as never, "forehead")).toBe(true);
	});
});
