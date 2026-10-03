// Command()'s "remote" case (core.ts): applies a sender's remote-settings
// packet to Player.LSCG.{Hypno,Collar,Magic}Module. The gating here is the
// *receiver's* half of the remote-settings trust boundary -- it only checks
// this player's own enabled/remoteAccess flags (or, for the collar, ownership)
// against the sender's *claimed* identity (data.Sender, taken at face value).
// The *sender's* side (whether the UI even offers sending -- hypnotizer-only,
// lock ownership, etc.) lives in Settings/Remote/*.ts and is out of scope for
// this module; see the last test below for what that means in practice.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { MagicModule } from "Modules/magic";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter } from "../harness/fixtures";

describe("CoreModule remote-settings receiver (Command() \"remote\")", () => {
	let core: CoreModule;
	let hypno: HypnoModule;
	let collar: CollarModule;
	let magic: MagicModule;

	beforeAll(() => {
		[core, , , hypno, collar, magic] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1 });
		hypno.init();
		collar.init();
		magic.init();
	});

	function sendRemote(sender: ReturnType<typeof makeCharacter>, settings: Record<string, unknown>) {
		// receive.command()'s convenience wrapper doesn't carry a `settings`
		// payload, so the "remote" case is driven directly here instead.
		receive.hidden(sender, {
			IsLSCG: true, type: "command", reply: false, target: player().MemberNumber,
			version: "v0", settings, command: { name: "remote", args: [] },
		} as unknown as LSCGMessageModel);
	}

	it("applies HypnoModule settings only when this player's Hypno module is enabled and remoteAccess is on", () => {
		const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));

		hypno.settings.enabled = false;
		hypno.settings.remoteAccess = true;
		sendRemote(sender, { HypnoModule: { trigger: "sleepy" } } as never);
		expect(hypno.settings.trigger).not.toBe("sleepy");

		hypno.settings.enabled = true;
		hypno.settings.remoteAccess = false;
		sendRemote(sender, { HypnoModule: { trigger: "sleepy" } } as never);
		expect(hypno.settings.trigger).not.toBe("sleepy");

		hypno.settings.enabled = true;
		hypno.settings.remoteAccess = true;
		sendRemote(sender, { HypnoModule: { trigger: "sleepy" } } as never);
		expect(hypno.settings.trigger).toBe("sleepy");
	});

	it("applies MagicModule settings only when enabled and remoteAccess is on", () => {
		const sender = addToRoom(makeCharacter({ MemberNumber: 111 }));

		magic.settings.enabled = true;
		magic.settings.remoteAccess = false;
		sendRemote(sender, { MagicModule: { requireWhitelist: true } } as never);
		expect(magic.settings.requireWhitelist).not.toBe(true);

		magic.settings.enabled = true;
		magic.settings.remoteAccess = true;
		sendRemote(sender, { MagicModule: { requireWhitelist: true } } as never);
		expect(magic.settings.requireWhitelist).toBe(true);
	});

	it("applies CollarModule settings when this player's owner sends it, even with the collar's remoteAccess off", () => {
		player().OwnerMemberNumber = 111;
		const owner = addToRoom(makeCharacter({ MemberNumber: 111 }));

		collar.settings.enabled = true;
		collar.settings.remoteAccess = false;
		sendRemote(owner, { CollarModule: { collarPurchased: true } } as never);

		expect(collar.settings.collarPurchased).toBe(true);
	});

	it("applies CollarModule settings from a non-owner when the collar's own enabled+remoteAccess flags allow it", () => {
		const stranger = addToRoom(makeCharacter({ MemberNumber: 222 }));

		collar.settings.enabled = true;
		collar.settings.remoteAccess = true;
		sendRemote(stranger, { CollarModule: { collarPurchased: true } } as never);

		expect(collar.settings.collarPurchased).toBe(true);
	});

	it("does not apply CollarModule settings from a non-owner when remoteAccess is off (the receiver-side gate)", () => {
		const stranger = addToRoom(makeCharacter({ MemberNumber: 222 }));

		collar.settings.enabled = true;
		collar.settings.remoteAccess = false;
		sendRemote(stranger, { CollarModule: { collarPurchased: true } } as never);

		expect(collar.settings.collarPurchased).toBe(false);
	});

	it("sends a distinct local message the first time the collar module is purchased via remote", () => {
		const owner = addToRoom(makeCharacter({ MemberNumber: 111, Nickname: "Kai" }));
		player().OwnerMemberNumber = 111;
		collar.settings.enabled = true;
		collar.settings.collarPurchased = false;

		sendRemote(owner, { CollarModule: { collarPurchased: true } } as never);

		expect(sent.local().at(-1)).toContain("purchased the Collar Module");
		expect(sent.local().at(-1)).toContain("Kai");
	});

	it("trust boundary: the receiver only checks its own flags/ownership, not who the sender claims their relationship is -- a stranger with remoteAccess on is trusted the same as an owner", () => {
		// This isn't a bug to fix; it documents the actual trust model so a
		// future change to it is a deliberate decision, not a regression nobody
		// noticed. The sender-side UI (Settings/Remote/*.ts) is what normally
		// keeps a stranger from even being offered the "send remote settings"
		// action -- the receiver here has no independent way to verify it.
		const stranger = addToRoom(makeCharacter({ MemberNumber: 333 }));
		magic.settings.enabled = true;
		magic.settings.remoteAccess = true;

		sendRemote(stranger, { MagicModule: { requireWhitelist: true } } as never);

		expect(magic.settings.requireWhitelist).toBe(true);
	});
});
