// ==UserScript==
// @name LSCG LOCAL DEV
// @namespace https://www.bondageprojects.com/
// @version 0.2.0
// @description Loads LSCG from the local `npm run dev` server, plus the example extension.
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @grant none
// ==/UserScript==

// Use this INSTEAD of lscgLoader-dev.user.js (disable that one, or LSCG loads twice).
// Start `npm run dev` first: it builds LSCG in watch mode and serves dist/ on :10001 and examples/ on :10002.
// Reload BC to pick up a rebuild or an edit to the example.

(function () {
    "use strict";
    function load(src) {
        const script = document.createElement("script");
        script.setAttribute("crossorigin", "anonymous");
        // Date.now() busts the browser cache so each reload gets the latest file.
        script.src = `${src}?${Date.now()}`;
        document.head.appendChild(script);
    }
    load("http://localhost:10001/bundle.js");
    // The example extension. Delete this line to run LSCG on its own, or point it at your own extension.
    load("http://localhost:10002/sample-extension.js");
})();
