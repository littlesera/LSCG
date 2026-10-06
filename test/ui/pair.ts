import type { Page } from "@playwright/test";
import { expect, test as base } from "@playwright/test";

/** Messages that mean nothing to a pair of fake clients, or that BC would try to draw into a chat room neither is in. */
const IGNORED_ERRORS = [/translation key/i, /Invalid (modification|removal)/, /extended item properties/, /appearance update bundle/, /Failed to load resource/];

export interface Client {
    page: Page;
    memberNumber: number;
    name: string;
    /** Runs `fn` in this client's page. */
    run<T, A = void>(fn: (arg: A) => T | Promise<T>, arg?: A): Promise<T>;
    /** Every chat line this client said (SendAction), oldest first. */
    said: string[];
}

export interface Pair {
    caster: Client;
    target: Client;
    /** Everything either client said, in the order it was said: "who: text". */
    log: string[];
    /** Lets the relay carry messages both ways until nothing is left in flight, plus `ms` for timers on either side. */
    settle(ms?: number): Promise<void>;
}

/** What one client's fake server saw it send, as plain data. */
interface Sent { event: string; data: any }

/** Two LSCG clients in two pages, each logged in as its own player and each seeing the other in its room. The fake server of each page records
 *  what the client sends; this carries the hidden chat messages and beeps LSCG talks with across to the other page, as the real server would, and
 *  keeps a log of what each says. Rolls and timers run for real on each side. */
export const test = base.extend<{ pair: Pair }>({
    pair: async ({ browser }, use) => {
        const errors: string[] = [];
        const open = async (memberNumber: number, name: string): Promise<Client> => {
            const context = await browser.newContext({ viewport: { width: 1600, height: 800 } });
            const page = await context.newPage();
            page.on("pageerror", e => errors.push(`${name} uncaught: ${e.message}`));
            page.on("console", m => {
                const text = m.text();
                if (m.type() === "error" && !IGNORED_ERRORS.some(r => r.test(text)) && /LSCG|lscg/.test(text)) errors.push(`${name}: ${text}`);
            });
            await page.goto("/");
            // Four BC pages loading side by side is slow; wait for the login screen to finish building, not just appear
            await page.waitForFunction(() => (window as any).Playground && (window as any).CurrentScreen === "Login" && !!document.getElementById("login-cheats-button"), null, { timeout: 120_000 });
            await page.evaluate(async ([number, who]) => {
                const P = (window as any).Playground;
                await P.login({ MemberNumber: number, Name: who, AccountName: who.toUpperCase() });
                P.enableAll();
            }, [memberNumber, name] as const);
            return { page, memberNumber, name, said: [], run: (fn, arg) => page.evaluate(fn as any, arg as any) };
        };

        const caster = await open(100001, "Caster");
        const target = await open(100002, "Target");
        const log: string[] = [];

        const drain = (c: Client): Promise<Sent[]> => c.page.evaluate(() => {
            const sent = (window as any).Playground.sent as any[][];
            return sent.splice(0).map(([event, data]) => ({ event, data }));
        });
        const deliver = (to: Client, from: Client, item: Sent): Promise<void> | undefined => {
            const { event, data } = item;
            if (event === "ChatRoomChat") {
                if (data?.Type === "Action") {
                    const text = (data.Dictionary as { Tag: string; Text: string }[] | undefined)?.find(d => d.Tag === "msg")?.Text ?? data.Content;
                    from.said.push(text);
                    log.push(`${from.name}: ${text}`);
                    return undefined;
                }
                if (data?.Type !== "Hidden" || (data.Target != null && data.Target !== to.memberNumber)) return undefined;
                return to.page.evaluate(msg => (window as any).Playground.receive("ChatRoomMessage", msg), { ...data, Sender: from.memberNumber });
            }
            if (event === "AccountBeep" && data?.MemberNumber === to.memberNumber)
                return to.page.evaluate(msg => (window as any).Playground.receive("AccountBeep", msg),
                    { MemberNumber: from.memberNumber, MemberName: from.name, BeepType: data.BeepType, IsSecret: data.IsSecret, Message: data.Message });
            return undefined;
        };

        let busy = false;
        let carried = 0;
        const pump = async () => {
            if (busy) return;
            busy = true;
            try {
                for (const [from, to] of [[caster, target], [target, caster]] as const)
                    for (const item of await drain(from)) {
                        carried++;
                        await deliver(to, from, item);
                    }
            } finally {
                busy = false;
            }
        };
        const timer = setInterval(() => { pump().catch(() => {}); }, 40);

        const settle = async (ms = 400) => {
            const deadline = Date.now() + 15000;
            let quiet = 0;
            while (quiet < 3 && Date.now() < deadline) {
                const before = carried;
                await new Promise(r => setTimeout(r, ms / 3));
                quiet = carried === before ? quiet + 1 : 0;
            }
        };

        // Both join one chat room, the way the server would put them there: a room sync listing the two of them. LSCG's own hook on it publishes each
        // player's settings, which the relay carries across, so each ends up seeing the other as an LSCG user in the room.
        for (const [me, other] of [[caster, target], [target, caster]] as const)
            await me.run(async ([number, who]) => {
                const w = window as any;
                const bundle = (n: number, name: string) => ({
                    ID: `playground-${n}`, Name: name, MemberNumber: n, Appearance: w.ServerAppearanceBundle(w.Player.Appearance), ActivePose: [],
                    ItemPermission: 1, WhiteList: [], BlackList: [],
                });
                w.Playground.receive("ChatRoomSync", {
                    SourceMemberNumber: w.Player.MemberNumber, Name: "LSCG test room", Description: "", Admin: [w.Player.MemberNumber], Whitelist: [], Ban: [],
                    Background: "MainHall", Limit: 10, Game: "", Visibility: ["All"], Access: ["All"], BlockCategory: [], Language: "EN", Space: "",
                    Character: [bundle(w.Player.MemberNumber, w.Player.Name), bundle(number, who)],
                });
                await w.Playground.until(() => w.CurrentScreen === "ChatRoom" && !!w.ChatRoomData, 20000).catch(() => { throw new Error(`room not entered: ${w.CurrentScreen} ${!!w.ChatRoomData} ${w.ChatRoomCharacter?.length}`); });
            }, [other.memberNumber, other.name] as const);
        for (const c of [caster, target])
            await c.run(() => (window as any).LSCG.getModule("CoreModule").SendPublicPacket(true));
        await settle();

        await use({ caster, target, log, settle });

        clearInterval(timer);
        await caster.page.context().close();
        await target.page.context().close();
        expect(errors, "LSCG errors or uncaught exceptions in either client").toEqual([]);
    },
});

export { expect };
