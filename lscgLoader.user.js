// ==UserScript==
// @name LSCG
// @namespace https://www.bondageprojects.com/
// @version 0.6.16
// @description Little Sera's Club Games
// @author Little Sera
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @icon64 data:image/svg+xml,<svg viewBox="-1 -1 28 25" xmlns="http://www.w3.org/2000/svg"><path d="m12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" stroke="black" fill="teal" /></svg>
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    script.langauge = "JavaScript";
    script.setAttribute("crossorigin", "anonymous");
    script.src = `https://littlesera.github.io/LSCG/bundle.js?${Date.now()}`;
    document.head.appendChild(script);
})();
