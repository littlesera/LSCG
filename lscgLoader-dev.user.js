// ==UserScript==
// @name LSCG DEV
// @namespace https://www.bondageprojects.com/
// @version 0.3.37
// @description Little Sera's Club Games
// @author Little Sera
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    script.langauge = "JavaScript";
    script.setAttribute("crossorigin", "anonymous");
    script.src = `https://littlesera.github.io/LSCG/dev/bundle.js?${Date.now()}`;
    document.head.appendChild(script);
})();
