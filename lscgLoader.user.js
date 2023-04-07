// ==UserScript==
// @name LSCG
// @namespace https://www.bondageprojects.com/
// @version 0.0.1
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
    script.type = "module";
    script.setAttribute("crossorigin", "anonymous");
    script.src = "https://littlesera.github.io/LSCG/dist/bundle.js?" + Date.now().toString();
    document.head.appendChild(script);
})();
