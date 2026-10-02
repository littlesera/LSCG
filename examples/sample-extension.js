// LSCG example extension: a plain script with no dependencies. Load it any of these ways:
//
// 1. Paste: copy this whole file into the browser console on the BC tab. (Chrome/Edge may ask you to type
//    "allow pasting" first.) Pasting it again replaces the previous copy. It lasts until the page reloads.
// 2. Script tag: serve it (`npm run serve:examples` serves this folder at http://localhost:10002) and run this
//    in the console, or save it as a bookmark with "javascript:" in front:
//      document.head.appendChild(Object.assign(document.createElement("script"), { src: "http://localhost:10002/sample-extension.js" }))
// 3. Local LSCG development: examples/lscgLoader-local.user.js loads your local LSCG build and this file together.
//
// Load order doesn't matter: before LSCG, the callback waits in the LSCG_OnLoad queue; after it, push() runs it at
// once. Loaded after login, it misses the login screen, so it isn't in the login badge's list that time.

(function () {
    "use strict";

    // Stages along the built-in sedative bar, as fractions of a full bar, like a chloroform build-up.
    const SEDATIVE_STAGES = [
        { at: 0.25, text: "Your head swims a little." },
        { at: 0.5, text: "Your eyelids feel heavy." },
        { at: 0.75, text: "Your limbs go weak and the room blurs." },
        { at: 1, text: "Everything fades to black." },
    ];

    /** @param {import("@lscg/types").LSCGGlobal} LSCG  (editor completion: `npm i -D @lscg/types`) */
    function setup(LSCG) {
        // Pasted or loaded twice: drop the previous copy so the id is free again.
        window.__lscgSampleApi?.dispose();
        // Call getModApi first. If the player turned this extension off on the login screen, it throws here and
        // nothing below runs.
        const api = LSCG.getModApi({ id: "sample", name: "LSCG Sample Extension", version: "0.1.0" });
        window.__lscgSampleApi = api;
        console.log(`[sample] registered with LSCG ${LSCG.version}; capabilities:`, [...LSCG.capabilities]);

        api.onReady(() => {
            console.log("[sample] LSCG is ready and the player's settings are loaded.");
        });

        if (!LSCG.capabilities.has("events"))
            return;

        // Observe: log what LSCG does to the player.
        for (const name of ["state.activated", "state.recovered", "spell.received", "spell.effectApplied",
            "grab.added", "grab.removed", "drug.applied", "hypno.triggered", "hypno.awakened", "safeword"]) {
            api.events.on(name, payload => console.log(`[sample] ${name}`, payload));
        }

        // A custom spell effect: the target can't help but bark like a dog.
        if (LSCG.capabilities.has("spells.effects")) {
            const barks = [
                "%NAME% lets out a startled \"Woof!\"",
                "%NAME% barks happily at %OPP_NAME%, tail very nearly wagging.",
                "%NAME% claps a hand over %POSSESSIVE% mouth, but a loud \"Arf! Arf!\" escapes anyway.",
            ];
            api.spells.registerEffect({
                name: "bark",
                label: "Barking",
                description: "Makes the target bark like a dog.",
                allowRandom: true,
                apply(ctx) {
                    ctx.sendAction(barks[Math.floor(Math.random() * barks.length)]);
                },
            });
        }

        // A custom activity: pat someone's head.
        if (LSCG.capabilities.has("activities")) {
            api.activities.register({
                name: "headpat",
                prerequisites: ["UseArms"],
                targets: [{
                    group: "ItemHead",
                    label: "Pat head",
                    action: "SourceCharacter gently pats TargetCharacter's head.",
                }],
                image: "Assets/Female3DCG/Activity/Slap.png",
            });
        }

        // A custom drug: a craftable "giggle juice" that makes the drinker giddy.
        if (LSCG.capabilities.has("drugs")) {
            api.drugs.register({
                name: "giggle",
                label: "Giggle Juice",
                description: "Makes the drinker giddy.",
                keywords: ["giggle juice"],
                color: "#ff9ff3",
                onDose(ctx) {
                    ctx.addLevel(ctx.multiplier);
                    ctx.sendAction("%NAME% giggles uncontrollably.");
                },
                // A dose that overflows the bar always triggers onFull: the drug's big moment.
                onFull(ctx) {
                    ctx.sendAction("%NAME% collapses into helpless giggles.");
                },
                // On each tick, onSpike fires at random: spikeChance at a full bar, less as the bar empties.
                spikeChance: 0.1,
                onSpike(ctx) {
                    ctx.sendAction("%NAME% snorts with sudden laughter.");
                },
                onWearOff(ctx) {
                    ctx.sendAction("%NAME% finally stops giggling.");
                },
            });
        }

        // Settings, storage and messages together: a screen with a greeting you can send to another player.
        if (LSCG.capabilities.has("settings") && LSCG.capabilities.has("storage") && LSCG.capabilities.has("network")) {
            let target = "";
            api.settings.registerScreen({
                name: "greeting",
                label: "Greeting",
                build({ kit }) {
                    return [
                        kit.section("Greeting", "Saved with your LSCG settings."),
                        kit.text({
                            label: "Greeting",
                            get: () => api.storage.get()?.greeting ?? "hello!",
                            set: value => api.storage.set({ greeting: value }),
                        }),
                        kit.text({ label: "Send to member number", get: () => target, set: value => { target = value; } }),
                        kit.button({
                            label: "Send",
                            buttonLabel: "Send greeting",
                            onClick: () => api.network.send(Number(target), "greet", { text: api.storage.get()?.greeting ?? "hello!" }),
                        }),
                    ];
                },
            });

            // Receive greetings, from players in the room that the player gives item permission.
            api.network.on("greet", ({ sender, args }) => {
                if (typeof args.text === "string")
                    console.log(`[sample] ${sender} says: ${args.text.slice(0, 200)}`);
            });

            api.onReady(() => api.storage.setPublic({ sample: "0.1.0" }));
        }

        // Give the player a dose from code (they must have enabled the drug; returns false otherwise).
        // api.drugs.dose("sample.giggle", { multiplier: 1 }); api.drugs.dose("sedative", { multiplier: 0.5, minigame: false });

        // Stages on a built-in drug: drug.levelChanged fires for every drug, built-in or extension, including slow
        // decay. Compare the previous and new fraction of the bar to find which stages were crossed.
        api.events.on("drug.levelChanged", ({ type, previous, level, max }) => {
            if (type !== "sedative" || max <= 0)
                return;
            const before = previous / max, after = level / max;
            for (const stage of SEDATIVE_STAGES) {
                if (before < stage.at && after >= stage.at)
                    note(stage.text);
            }
            if (before >= SEDATIVE_STAGES[0].at && after < SEDATIVE_STAGES[0].at)
                note("Your head clears.");
        });

        // Dosing from code: "/sample-dose" gives the player a small sedative dose. It only works if they enabled the
        // sedative in LSCG's Drug Enhancements settings, and drug.beforeApply listeners can veto it.
        if (LSCG.capabilities.has("drugs")) {
            api.onReady(() => {
                if (Commands.some(c => c.Tag === "sample-dose"))
                    return; // already added by an earlier copy
                CommandCombine([{
                    Tag: "sample-dose",
                    Description: ": (LSCG sample extension) Take a small sedative dose.",
                    Action: () => {
                        if (!window.__lscgSampleApi?.drugs.dose("sedative", { multiplier: 0.5, minigame: false }))
                            note("Nothing happened. Is the sedative enabled in LSCG's Drug Enhancements settings?");
                    },
                }]);
            });
        }

        // Intercept: refuse any spell whose name contains "veto".
        api.events.before("spell.beforeReceive", ctx => {
            if (ctx.payload.spell.name.toLowerCase().includes("veto"))
                ctx.cancel("the sample extension wards it off");
        });
    }

    /** A message only this player sees. */
    function note(text) {
        if (typeof ChatRoomSendLocal === "function")
            ChatRoomSendLocal(`[Sample] ${text}`);
        else
            console.log(`[sample] ${text}`);
    }

    // Works whether this script loads before or after LSCG: queued callbacks run as soon as LSCG loads,
    // and once LSCG has loaded, push() runs the callback immediately.
    (window.LSCG_OnLoad = window.LSCG_OnLoad || []).push(setup);
})();
