// Page-side helpers for the BC playground (scripts/bc-playground.mjs), on `window.Playground`. Loaded after BC's
// scripts and before LSCG's bundle. From agent-browser:  agent-browser eval "(async () => { await Playground.login(); })()"
(() => {
    const Playground = window.Playground;

    /** Resolves once `test()` is truthy (polled each frame), or rejects after `ms`. */
    Playground.until = (test, ms = 15000) => new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
            let value;
            try { value = test(); } catch { /* not ready */ }
            if (value) resolve(value);
            else if (Date.now() - start > ms) reject(new Error(`Playground.until timed out: ${test}`));
            else requestAnimationFrame(tick);
        };
        tick();
    });

    /** The account the fake server logs in with; pass fields to override. */
    Playground.account = (overrides = {}) => ({
        ID: "playground-player",
        Name: "Tester",
        AccountName: "TESTER",
        MemberNumber: 100001,
        Creation: Date.now(),
        Money: 1000,
        Owner: "",
        Lover: "",
        ItemPermission: 2,
        ExtensionSettings: {},
        ...overrides,
    });

    /** Logs in as a test character and waits until LSCG has loaded. LSCG is opt-in on a new account; it's switched
     *  on here unless `enable: false`. */
    Playground.login = async (overrides = {}, { enable = true } = {}) => {
        await Playground.until(() => typeof LoginResponse === "function" && CurrentScreen === "Login");
        Playground.receive("LoginResponse", Playground.account(overrides));
        await Playground.until(() => window.LSCG?.isReady);
        if (enable) Player.LSCG.GlobalModule.enabled = true;
        return Player.MemberNumber;
    };

    /** Switches on every LSCG module, with a little sample data (a cursed item, a purchased collar), so settings
     *  screens show all their inputs instead of mostly disabled ones. */
    Playground.enableAll = () => {
        for (const m of ["HypnoModule", "CursedItemModule", "SplatterModule", "InjectorModule", "MagicModule", "CollarModule", "SpeechAnalysisModule", "MapModule"])
            LSCG.getModule(m)?.settings; // fills in defaults
        const L = Player.LSCG;
        Object.assign(L.HypnoModule, { enabled: true, remoteAccess: true });
        Object.assign(L.CursedItemModule, { enabled: true, Vulnerable: true });
        L.CursedItemModule.CursedItems ??= [];
        if (!L.CursedItemModule.CursedItems.length) L.CursedItemModule.CursedItems.push({ Name: "Sample curse", Enabled: true });
        L.SplatterModule.enabled = true;
        L.InjectorModule.enabled = true;
        L.MagicModule.enabled = true;
        Object.assign(L.CollarModule, { collarPurchased: true, enabled: true, knockout: true });
        L.SpeechAnalysisModule.enabled = true;
        L.MapModule.enhancedLighting = true;
    };

    /** Opens LSCG's settings, optionally on one screen by its title (e.g. "Breathplay", "Cursed Items"). */
    Playground.openSettings = async (screen) => {
        // BC skips switching screens if the Extensions page was the last one open, even from another screen.
        if (CurrentScreen !== "Preference") await PreferenceOpenSubscreen("Extensions");
        await PreferenceSubscreenExtensionsOpen("LSCG");
        if (screen) LSCG.getModule("GUI").currentSubscreen = screen;
        await new Promise(requestAnimationFrame);
        return LSCG.getModule("GUI").currentSubscreen?.name;
    };

    /** Suggestions the fake server answers "get-suggestions" with, by target member number. */
    Playground.suggestions = {};

    /** Another LSCG player in the room. `pose` e.g. ["Kneel"]; `lscg` overrides parts of their LSCG settings by
     *  module, e.g. { HypnoModule: { allowSuggestions: true } }. Owned by the player unless `owned: false`. */
    Playground.addCharacter = ({ memberNumber = 100002, name = "Target", owned = true, pose = [], lscg = {} } = {}) => {
        const C = CharacterLoadOnline({
            ID: `playground-${memberNumber}`,
            Name: name,
            MemberNumber: memberNumber,
            Appearance: ServerAppearanceBundle(Player.Appearance),
            ActivePose: pose,
            Ownership: owned ? { MemberNumber: Player.MemberNumber, Name: Player.Name, Stage: 1, Start: Date.now() } : undefined,
            ItemPermission: 1,
            WhiteList: [],
            BlackList: [],
        }, Player.MemberNumber);
        C.LSCG = structuredClone(Player.LSCG);
        for (const [module, values] of Object.entries({ GlobalModule: { enabled: true }, ...lscg }))
            Object.assign(C.LSCG[module] ??= {}, values);
        if (!ChatRoomCharacter.includes(C)) ChatRoomCharacter.push(C);
        return C;
    };

    /** Opens a character's profile (BC's information sheet), where LSCG's remote settings button is. */
    Playground.openProfile = async (C) => {
        InformationSheetLoadCharacter(C);
        await CommonSetScreen("Character", "InformationSheet");
    };

    // The target's client answering LSCG's beep for their suggestions.
    Playground.reply.AccountBeep = (beep) => {
        const command = beep?.Message?.IsLSCG ? beep.Message.command : null;
        if (command?.name !== "get-suggestions") return undefined;
        return ["AccountBeep", {
            MemberNumber: beep.MemberNumber,
            MemberName: ChatRoomCharacter.find(c => c.MemberNumber === beep.MemberNumber)?.Name ?? "Target",
            BeepType: "Leash",
            Message: {
                IsLSCG: true, type: "command", reply: false, settings: null, target: Player.MemberNumber,
                command: { name: "get-suggestions-response", args: [{ name: "suggestions", value: Playground.suggestions[beep.MemberNumber] ?? [] }] },
            },
        }];
    };

    /** Page (CSS pixel) coordinates of a point on BC's 2000x1000 canvas, for `agent-browser mouse move/down/up`. */
    Playground.toPage = (x, y) => {
        const r = MainCanvas.canvas.getBoundingClientRect();
        return { x: Math.round(r.left + x * r.width / 2000), y: Math.round(r.top + y * r.height / 1000) };
    };
})();
