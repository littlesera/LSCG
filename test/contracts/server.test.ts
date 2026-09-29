// States the relay assumptions LSCG's own code depends on for every packet it
// sends, as assertions on packet *shape* -- a stand-in for a live-server
// integration tier (the plan explicitly skips one; see its "no live-server
// tier for now" note). If BC's chat relay or account-beep relay ever stops
// satisfying one of these, every one of these assertions is exactly the thing
// that would need to change on LSCG's side too.
import { describe, expect, it } from "vitest";
import { sendLSCGBeep, sendLSCGMessage, SendAction } from "utils";
import { resetWorld } from "../harness/world";
import { sent } from "../harness/room";

describe("server relay contract", () => {
	it("every LSCG hidden message rides a ChatRoomChat packet with Type=Hidden, Content=LSCGMsg, and the payload at Dictionary[0].message", () => {
		resetWorld();
		sendLSCGMessage({ type: "broadcast", reply: false, settings: null, target: null } as LSCGMessageModel);

		const [type, data] = sent.raw()[0];
		expect(type).toBe("ChatRoomChat");
		expect(data.Type).toBe("Hidden");
		expect(data.Content).toBe("LSCGMsg");
		expect(Array.isArray(data.Dictionary)).toBe(true);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const entry = (data.Dictionary as any[])[0];
		expect(entry).toHaveProperty("message");
		expect(entry.message.IsLSCG).toBe(true);
	});

	it("every LSCG beep hijacks BeepType \"Leash\", is marked secret, and targets a numeric MemberNumber", () => {
		resetWorld();
		sendLSCGBeep(5555, { type: "broadcast", reply: false, settings: null, target: 5555 } as LSCGMessageModel);

		const [type, data] = sent.raw()[0];
		expect(type).toBe("AccountBeep");
		expect(data.BeepType).toBe("Leash");
		expect(data.IsSecret).toBe(true);
		expect(typeof data.MemberNumber).toBe("number");
		expect(data.Message.IsLSCG).toBe(true);
	});

	it("SendAction rides the localized \"Beep\" action tag so every client's chat log renders it, regardless of locale", () => {
		resetWorld();
		SendAction("test message");

		const [, data] = sent.raw()[0];
		expect(data.Content).toBe("Beep");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const tagsWithMsg = (data.Dictionary as any[]).filter(d => d.Text === "msg");
		// One localized "Beep" tag per supported client locale (EN/CN/DE/FR) that
		// all point at the same "msg" dictionary entry -- if BC ever localizes
		// this Action's default text differently, this list is what needs updating.
		expect(tagsWithMsg.map(d => d.Tag).sort()).toEqual(["Beep", "Biep", "Sonner", "发送私聊"].sort());
	});

	it("a full publicSettings sync packet stays within a documented size budget", async () => {
		// Not a BC-enforced limit -- a budget LSCG itself picks, generous for a
		// single settings-toggle sync, to catch accidental bloat (e.g. a large
		// array dumped into public settings by mistake) before it becomes a
		// real-world problem.
		const SYNC_BUDGET_BYTES = 16_000;

		resetWorld({ LSCG: {} });
		const { registerModule } = await import("modules");
		const { CoreModule } = await import("Modules/core");
		const core = registerModule(new CoreModule());
		core.init();

		core.SendPublicPacket(true, "sync");
		const [, data] = sent.raw()[0];
		const bytes = new TextEncoder().encode(JSON.stringify(data)).length;
		expect(bytes).toBeLessThan(SYNC_BUDGET_BYTES);
	});
});
