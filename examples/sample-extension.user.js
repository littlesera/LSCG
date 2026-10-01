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
    }

    // Works whether this script loads before or after LSCG: queued callbacks run as soon as LSCG loads,
    // and once LSCG has loaded, push() runs the callback immediately.
    (window.LSCG_OnLoad = window.LSCG_OnLoad || []).push(setup);
})();
