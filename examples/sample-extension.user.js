// ==UserScript==
// @name LSCG Sample Extension
// @namespace https://www.bondageprojects.com/
// @version 0.1.0
// @description Minimal example of an extension built on the LSCG extension API.
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @grant none
// ==/UserScript==

(function () {
    "use strict";

    /** @param {import("../dist/api/types").LSCGGlobal} LSCG */
    function setup(LSCG) {
        const api = LSCG.getModApi({ id: "sample", name: "LSCG Sample Extension", version: "0.1.0" });
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

        // Intercept: refuse any spell whose name contains "veto".
        api.events.before("spell.beforeReceive", ctx => {
            if (ctx.payload.spell.name.toLowerCase().includes("veto"))
                ctx.cancel("the sample extension wards it off");
        });
    }

    // Works whether this script loads before or after LSCG: queued callbacks run as soon as LSCG loads,
    // and once LSCG has loaded, push() runs the callback immediately.
    (window.LSCG_OnLoad = window.LSCG_OnLoad || []).push(setup);
})();
