import { test, expect } from "./fixtures";

// BC R134 builds the profile as page elements drawn over the canvas. LSCG's remote settings draw on the canvas, so they have
// to hide the profile while they're open, and the button that opens them has to be a real menu button rather than a canvas one.
test("Remote settings: the profile's menu has the remote button, it hides the profile while open, and exiting shows it again", async ({ bc }) => {
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 100)); };
        const out: any = {};

        // Somebody else, with LSCG, that the player is allowed to use items on
        const other = w.CharacterCreate("Female3DCG", w.CharacterType?.ONLINE ?? "Online", "remote-test");
        other.MemberNumber = 54618;
        other.Name = "Celes";
        other.LSCG = { GlobalModule: { enabled: true } };
        w.ChatRoomCharacter = [w.Player, other];
        w.ServerChatRoomGetAllowItem = () => true;

        w.InformationSheetSelection = other;
        w.InformationSheetReturnScreen = ["Online", "ChatRoom"];
        w.CommonSetScreen("Character", "InformationSheet");
        await wait(() => !!document.getElementById("information-sheet-screen"));
        await wait(() => !!document.getElementById("lscg-remote-sheet-button"));
        const sheet = () => document.getElementById("information-sheet-screen") as HTMLElement;
        const button = document.getElementById("lscg-remote-sheet-button") as HTMLButtonElement | null;
        out.hasButton = !!button;
        out.buttonEnabled = !!button && !button.disabled;
        out.sheetShownAtStart = sheet().style.display !== "none";

        button?.click();
        const remote = () => w.LSCG.getModule("RemoteUIModule");
        out.remoteOpen = !!remote().currentSubscreen;
        out.sheetHiddenWhileOpen = sheet().style.display === "none";

        w.InformationSheetExit();
        out.remoteClosed = !remote().currentSubscreen;
        out.sheetShownAfter = sheet().style.display !== "none";
        return out;
    });
    expect(result).toEqual({
        hasButton: true, buttonEnabled: true, sheetShownAtStart: true,
        remoteOpen: true, sheetHiddenWhileOpen: true, remoteClosed: true, sheetShownAfter: true,
    });
});
