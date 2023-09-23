// LSCG: Little Sera's Club Games
if (typeof window.ImportBondageCollege !== "function") {
  alert("Club not detected! Please only use this while you have Club open!");
  throw "Dependency not met";
}
if (window.LSCG_Loaded !== undefined) {
  alert("LSCG is already detected in current window. To reload, please refresh the window.");
  throw "Already loaded";
}
window.LSCG_Loaded = false;
console.debug("LSCG: Parse start...");

var LSCG = (function (exports) {
	'use strict';

	const LSCG_VERSION="v0.2.6";

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getDefaultExportFromNamespaceIfPresent (n) {
		return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
	}

	function getDefaultExportFromNamespaceIfNotNamed (n) {
		return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
	}

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
					var args = [null];
					args.push.apply(args, arguments);
					var Ctor = Function.bind.apply(f, args);
					return new Ctor();
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var bcmodsdk = {};

	(function (exports) {
		// Bondage Club Mod Development Kit (1.1.0)
		// For more info see: https://github.com/Jomshir98/bondage-club-mod-sdk
		/** @type {ModSDKGlobalAPI} */
		var bcModSdk=function(){"use strict";const e="1.1.0";function o(e){alert("Mod ERROR:\n"+e);const o=new Error(e);throw console.error(o),o}const t=new TextEncoder;function n(e){return !!e&&"object"==typeof e&&!Array.isArray(e)}function r(e){const o=new Set;return e.filter((e=>!o.has(e)&&o.add(e)))}const i=new Map,a=new Set;function d(e){a.has(e)||(a.add(e),console.warn(e));}function s(e){const o=[],t=new Map,n=new Set;for(const r of p.values()){const i=r.patching.get(e.name);if(i){o.push(...i.hooks);for(const[o,a]of i.patches.entries())t.has(o)&&t.get(o)!==a&&d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o)||""}\nPatch2:\n${a}`),t.set(o,a),n.add(r.name);}}o.sort(((e,o)=>o.priority-e.priority));const r=function(e,o){if(0===o.size)return e;let t=e.toString().replaceAll("\r\n","\n");for(const[n,r]of o.entries())t.includes(n)||d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return (0,eval)(`(${t})`)}(e.original,t);let i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,e.name,n),d=r.apply(this,o);return null==a||a(),d};for(let t=o.length-1;t>=0;t--){const n=o[t],r=i;i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,e.name,n.mod),d=n.hook.apply(this,[o,e=>{if(1!==arguments.length||!Array.isArray(o))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`);return r.call(this,e)}]);return null==a||a(),d};}return {hooks:o,patches:t,patchesSources:n,enter:i,final:r}}function c(e,o=!1){let r=i.get(e);if(r)o&&(r.precomputed=s(r));else {let o=window;const a=e.split(".");for(let t=0;t<a.length-1;t++)if(o=o[a[t]],!n(o))throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const d=o[a[a.length-1]];if("function"!=typeof d)throw new Error(`ModSDK: Function ${e} to be patched not found`);const c=function(e){let o=-1;for(const n of t.encode(e)){let e=255&(o^n);for(let o=0;o<8;o++)e=1&e?-306674912^e>>>1:e>>>1;o=o>>>8^e;}return ((-1^o)>>>0).toString(16).padStart(8,"0").toUpperCase()}(d.toString().replaceAll("\r\n","\n")),l={name:e,original:d,originalHash:c};r=Object.assign(Object.assign({},l),{precomputed:s(l),router:()=>{},context:o,contextProperty:a[a.length-1]}),r.router=function(e){return function(...o){return e.precomputed.enter.apply(this,[o])}}(r),i.set(e,r),o[r.contextProperty]=r.router;}return r}function l(){const e=new Set;for(const o of p.values())for(const t of o.patching.keys())e.add(t);for(const o of i.keys())e.add(o);for(const o of e)c(o,!0);}function f(){const e=new Map;for(const[o,t]of i)e.set(o,{name:o,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((e=>e.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return e}const p=new Map;function u(e){p.get(e.name)!==e&&o(`Failed to unload mod '${e.name}': Not registered`),p.delete(e.name),e.loaded=!1,l();}function g(e,t,r){"string"==typeof e&&"string"==typeof t&&(alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`),e={name:e,fullName:e,version:t},t={allowReplace:!0===r}),e&&"object"==typeof e||o("Failed to register mod: Expected info object, got "+typeof e),"string"==typeof e.name&&e.name||o("Failed to register mod: Expected name to be non-empty string, got "+typeof e.name);let i=`'${e.name}'`;"string"==typeof e.fullName&&e.fullName||o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`),i=`'${e.fullName} (${e.name})'`,"string"!=typeof e.version&&o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`),e.repository||(e.repository=void 0),void 0!==e.repository&&"string"!=typeof e.repository&&o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`),null==t&&(t={}),t&&"object"==typeof t||o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`);const a=!0===t.allowReplace,d=p.get(e.name);d&&(d.allowReplace&&a||o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(d));const s=e=>{"string"==typeof e&&e||o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`);let t=g.patching.get(e);return t||(t={hooks:[],patches:new Map},g.patching.set(e,t)),t},f={unload:()=>u(g),hookFunction:(e,t,n)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);"number"!=typeof t&&o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`);const a={mod:g.name,priority:t,hook:n};return r.hooks.push(a),l(),()=>{const e=r.hooks.indexOf(a);e>=0&&(r.hooks.splice(e,1),l());}},patchFunction:(e,t)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);n(t)||o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`);for(const[n,a]of Object.entries(t))"string"==typeof a?r.patches.set(n,a):null===a?r.patches.delete(n):o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`);l();},removePatches:e=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);s(e).patches.clear(),l();},callOriginal:(e,t,n)=>(g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),"string"==typeof e&&e||o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`),Array.isArray(t)||o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`),function(e,o,t=window){return c(e).original.apply(t,o)}(e,t,n)),getOriginalHash:e=>("string"==typeof e&&e||o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`),c(e).originalHash)},g={name:e.name,fullName:e.fullName,version:e.version,repository:e.repository,allowReplace:a,api:f,loaded:!0,patching:new Map};return p.set(e.name,g),Object.freeze(f)}function h(){const e=[];for(const o of p.values())e.push({name:o.name,fullName:o.fullName,version:o.version,repository:o.repository});return e}let m;const y=function(){if(void 0===window.bcModSdk)return window.bcModSdk=function(){const o={version:e,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:f,errorReporterHooks:Object.seal({hookEnter:null,hookChainExit:null})};return m=o,Object.freeze(o)}();if(n(window.bcModSdk)||o("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==e&&(alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk.version.startsWith("1.0.")&&void 0===window.bcModSdk._shim10register)){const e=window.bcModSdk,o=Object.freeze(Object.assign(Object.assign({},e),{registerMod:(o,t,n)=>o&&"object"==typeof o&&"string"==typeof o.name&&"string"==typeof o.version?e.registerMod(o.name,o.version,"object"==typeof t&&!!t&&!0===t.allowReplace):e.registerMod(o,t,n),_shim10register:!0}));window.bcModSdk=o;}return window.bcModSdk}();return "undefined"!='object'&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();
	} (bcmodsdk));

	var bcModSDKRef = /*@__PURE__*/getDefaultExportFromCjs(bcmodsdk);

	const modulesMap = new Map();
	function modules() {
	    return [...modulesMap.values()];
	}
	function registerModule(module) {
	    modulesMap.set(module.constructor.name, module);
	    return module;
	}
	function getModule(moduleType) {
	    return modulesMap.get(moduleType);
	}

	const LSCG_CHANGES = "https://github.com/littlesera/LSCG/releases/latest";
	const patchedFunctions = new Map();
	const bcModSDK = bcModSDKRef.registerMod({
	    name: "LSCG",
	    fullName: "Little Sera's Club Games",
	    version: LSCG_VERSION.startsWith("v") ? LSCG_VERSION.slice(1) : LSCG_VERSION,
	    repository: "https://github.com/littlesera/LSCG"
	});
	function patchFunction(target, patches) {
	    bcModSDK.patchFunction(target, patches);
	}
	function callOriginal(target, args) {
	    return bcModSDK.callOriginal(target, args);
	}
	//do not touch this
	async function waitFor(func, cancelFunc = () => false) {
	    while (!func()) {
	        if (cancelFunc())
	            return false;
	        await sleep(10);
	    }
	    return true;
	}
	function sleep(ms) {
	    return new Promise((resolve) => setTimeout(resolve, ms));
	}
	function parseMsgWords(msg) {
	    var lowerMsg = msg.toLowerCase();
	    var lowerMsgWords = lowerMsg.match(/\b(\w+)\b/g);
	    return lowerMsgWords;
	}
	function getCharacter(memberNumber) {
	    var _a;
	    return (_a = ChatRoomCharacter.find(c => c.MemberNumber == memberNumber)) !== null && _a !== void 0 ? _a : null;
	}
	function setOrIgnoreBlush(blushLevel) {
	    var _a;
	    const blushLevels = [
	        "Default",
	        "Low",
	        "Medium",
	        "High",
	        "VeryHigh",
	        "Extreme",
	        "ShortBreath"
	    ];
	    var currentBlush = (_a = WardrobeGetExpression(Player).Blush) !== null && _a !== void 0 ? _a : "Default";
	    var ix = blushLevels.indexOf(currentBlush);
	    var newIx = blushLevels.indexOf(blushLevel !== null && blushLevel !== void 0 ? blushLevel : "");
	    if (newIx > ix) {
	        CharacterSetFacialExpression(Player, "Blush", blushLevel);
	    }
	}
	function OnWhisper(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        var sender = getCharacter(data.Sender);
	        if (data.Type == "Whisper")
	            callback(data, sender, data.Content, data.Dictionary);
	        next(args);
	    }, module);
	}
	function OnChat(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        var sender = getCharacter(data.Sender);
	        if (data.Type == "Chat" || data.Type == "Whisper")
	            callback(data, sender, data.Content, data.Dictionary);
	        next(args);
	    }, module);
	}
	function OnAction(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        var sender = getCharacter(data.Sender);
	        if (data.Type == "Action" || data.Type == "Emote")
	            callback(data, sender, data.Content, data.Dictionary);
	        next(args);
	    }, module);
	}
	function OnActivity(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        var sender = getCharacter(data.Sender);
	        if (data.Type == "Activity")
	            callback(data, sender, data.Content, data.Dictionary);
	        next(args);
	    }, module);
	}
	function initPatchableFunction(target) {
	    let result = patchedFunctions.get(target);
	    if (!result) {
	        result = {
	            name: target,
	            hooks: []
	        };
	        patchedFunctions.set(target, result);
	    }
	    return result;
	}
	function hookBCXCurse(trigger, listener) {
	    var _a, _b, _c;
	    (_c = (_a = window.bcx) === null || _a === void 0 ? void 0 : (_b = _a.getModApi("LSCG")).on) === null || _c === void 0 ? void 0 : _c.call(_b, trigger, listener);
	}
	function hookFunction(target, priority, hook, module = null) {
	    const data = initPatchableFunction(target);
	    if (data.hooks.some(h => h.hook === hook)) {
	        console.error(`LSCG: Duplicate hook for "${target}"`, hook);
	        return () => null;
	    }
	    // let wrappedHook: PatchHook = (args, next) => {
	    // 	try {
	    // 		return hook(args, next);
	    // 	} catch (error: any) {
	    // 		let msg = `LSCG Error -- ${error.message}`;
	    // 		console.error(`${msg} \n${error.stack}`);
	    // 		if (target != "ChatRoomMessage" && target != "ChatRoomSendLocal") {
	    // 			try {
	    // 				LSCG_SendLocal(msg);
	    // 			} catch (inner) {}
	    // 		}
	    // 		if (!!Player.LSCG.RethrowExceptions)
	    // 			throw error;
	    // 		return next(args);
	    // 	}
	    // }
	    const removeCallback = bcModSDK.hookFunction(target, priority, hook);
	    data.hooks.push({
	        hook,
	        priority,
	        module,
	        removeCallback
	    });
	    data.hooks.sort((a, b) => b.priority - a.priority);
	    return removeCallback;
	}
	function removeHooksByModule(target, module) {
	    const data = initPatchableFunction(target);
	    for (let i = data.hooks.length - 1; i >= 0; i--) {
	        if (data.hooks[i].module === module) {
	            data.hooks[i].removeCallback();
	            data.hooks.splice(i, 1);
	        }
	    }
	    return true;
	}
	function removeAllHooksByModule(module) {
	    for (const data of patchedFunctions.values()) {
	        for (let i = data.hooks.length - 1; i >= 0; i--) {
	            if (data.hooks[i].module === module) {
	                data.hooks[i].removeCallback();
	                data.hooks.splice(i, 1);
	            }
	        }
	    }
	    return true;
	}
	function SendAction(action, sender = null) {
	    let msg = replace_template(action, sender);
	    ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [
	            // EN
	            { Tag: "Beep", Text: "msg" },
	            // CN
	            { Tag: "发送私聊", Text: "msg" },
	            // DE
	            { Tag: "Biep", Text: "msg" },
	            // FR
	            { Tag: "Sonner", Text: "msg" },
	            // Message itself
	            { Tag: "msg", Text: msg },
	        ] });
	}
	function SendChat(msg) {
	    ServerSend("ChatRoomChat", { Type: "Chat", Content: msg });
	}
	function replace_template(text, source = null) {
	    let result = text;
	    let pronounItem = InventoryGet(Player, "Pronouns");
	    let posessive = "Her";
	    let intensive = "Her";
	    let pronoun = "She";
	    if ((pronounItem === null || pronounItem === void 0 ? void 0 : pronounItem.Asset.Name) == "HeHim") {
	        posessive = "His";
	        intensive = "Him";
	        pronoun = "He";
	    }
	    let oppName = !!source ? CharacterNickname(source) : "";
	    result = result.replaceAll("%POSSESSIVE%", posessive.toLocaleLowerCase());
	    result = result.replaceAll("%CAP_POSSESSIVE%", posessive);
	    result = result.replaceAll("%PRONOUN%", pronoun.toLocaleLowerCase());
	    result = result.replaceAll("%CAP_PRONOUN%", pronoun);
	    result = result.replaceAll("%INTENSIVE%", intensive.toLocaleLowerCase());
	    result = result.replaceAll("%CAP_INTENSIVE%", intensive);
	    result = result.replaceAll("%NAME%", CharacterNickname(Player)); //Does this works to print "Lilly"? -- it should, yes
	    result = result.replaceAll("%OPP_NAME%", oppName); // finally we can use the source name to make the substitution
	    return result;
	}
	function getRandomInt(max) {
	    return Math.floor(Math.random() * max);
	}
	function settingsSave(publish = false) {
	    var _a;
	    if (!Player.OnlineSettings)
	        Player.OnlineSettings = {};
	    Player.OnlineSettings.LSCG = Player.LSCG;
	    window.ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings });
	    if (publish)
	        (_a = getModule("CoreModule")) === null || _a === void 0 ? void 0 : _a.SendPublicPacket(false, "sync");
	}
	/** Checks if the `obj` is an object (not null, not array) */
	function isObject(obj) {
	    return !!obj && typeof obj === "object" && !Array.isArray(obj);
	}
	function escapeRegExp(string) {
	    var _a;
	    return (_a = string === null || string === void 0 ? void 0 : string.toLocaleLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) !== null && _a !== void 0 ? _a : ""; // $& means the whole matched string
	}
	function isPhraseInString(string, phrase, ignoreOOC = false) {
	    if (!string || string === "")
	        return false;
	    let praseMatch = new RegExp("\\b" + escapeRegExp(phrase) + "\\b", "i");
	    let oocParsed = ignoreOOC ? string : excludeParentheticalContent(string);
	    return praseMatch.test(oocParsed);
	}
	function addCustomEffect(C, effect) {
	    if (!C)
	        C = Player;
	    let updated = false;
	    const emoticon = C.Appearance.find((a) => a.Asset.Name === "Emoticon");
	    if (!emoticon) {
	        return updated;
	    }
	    if (Array.isArray(emoticon.Asset.AllowEffect))
	        emoticon.Asset.AllowEffect.push(effect);
	    else
	        emoticon.Asset.AllowEffect = [effect];
	    if (!emoticon.Property) {
	        emoticon.Property = { Effect: [effect] };
	        updated = true;
	    }
	    else if (!emoticon.Property.Effect) {
	        emoticon.Property.Effect = [effect];
	        updated = true;
	    }
	    else if (!emoticon.Property.Effect.includes(effect)) {
	        emoticon.Property.Effect.push(effect);
	        updated = true;
	    }
	    if (updated && ServerPlayerIsInChatRoom() && C == Player) {
	        ChatRoomCharacterUpdate(Player);
	        CharacterRelease(Player, true);
	    }
	    return updated;
	}
	function removeCustomEffect(C, effect) {
	    var _a, _b;
	    if (!C)
	        C = Player;
	    const emoticon = C.Appearance.find((a) => a.Asset.Name === "Emoticon");
	    let updated = false;
	    if ((_b = (_a = emoticon === null || emoticon === void 0 ? void 0 : emoticon.Property) === null || _a === void 0 ? void 0 : _a.Effect) === null || _b === void 0 ? void 0 : _b.includes(effect)) {
	        emoticon.Property.Effect = emoticon.Property.Effect.filter((e) => e !== effect);
	        updated = true;
	    }
	    if (updated && ServerPlayerIsInChatRoom() && C == Player) {
	        ChatRoomCharacterUpdate(Player);
	    }
	    return updated;
	}
	function isAllowedMember(member) {
	    return !!member && ServerChatRoomGetAllowItem(member, Player);
	}
	function drawSvg(ctx, icon, x, y, width, height, baseSize, alpha, lineWidth, fillColor, strokeColor = "black") {
	    ctx.save();
	    ctx.globalAlpha = alpha;
	    ctx.translate(x, y);
	    ctx.scale(width / baseSize, height / baseSize);
	    ctx.fillStyle = fillColor;
	    if (strokeColor) {
	        ctx.strokeStyle = strokeColor;
	    }
	    ctx.lineWidth = lineWidth;
	    const p = new Path2D(icon);
	    ctx.fill(p);
	    if (strokeColor) {
	        ctx.stroke(p);
	    }
	    ctx.restore();
	}
	function getPlayerVolume(modifier) {
	    return AudioVolumeFromModifier(modifier);
	}
	function sendLSCGMessage(msg) {
	    const packet = {
	        Type: "Hidden",
	        Content: "LSCGMsg",
	        Sender: Player.MemberNumber,
	        Dictionary: [
	            {
	                message: msg
	            },
	        ],
	    };
	    ServerSend("ChatRoomChat", packet);
	}
	function sendLSCGCommand(target, commandName, commandArgs = []) {
	    var _a;
	    sendLSCGMessage({
	        type: "command",
	        reply: false,
	        settings: null,
	        target: (_a = target === null || target === void 0 ? void 0 : target.MemberNumber) !== null && _a !== void 0 ? _a : -1,
	        version: LSCG_VERSION,
	        command: {
	            name: commandName,
	            args: commandArgs
	        }
	    });
	}
	function LSCG_SendLocal(msg, time) {
	    var bgColor = (Player.ChatSettings.ColorTheme.indexOf("Light") > -1) ? "#D7F6E9" : "#23523E";
	    let text = `<div style='background-color:${bgColor};'>${msg}</div>`;
	    ChatRoomSendLocal(text);
	}
	function excludeParentheticalContent(msg) {
	    var result = "";
	    var Par = false;
	    if (msg == null)
	        msg = "";
	    for (let i = 0; i < msg.length; i++) {
	        let char = msg.charAt(i);
	        if (char == "(" || char == '）')
	            Par = true;
	        if (!Par)
	            result += char;
	        if (char == ")" || char == "）")
	            Par = false;
	    }
	    return result;
	}
	function IsIncapacitated(C) {
	    var _a, _b, _c, _d, _e, _f;
	    if (!C)
	        C = Player;
	    return ((_b = (_a = C.LSCG) === null || _a === void 0 ? void 0 : _a.HypnoModule) === null || _b === void 0 ? void 0 : _b.hypnotized) || ((_d = (_c = C.LSCG) === null || _c === void 0 ? void 0 : _c.InjectorModule) === null || _d === void 0 ? void 0 : _d.asleep) || ((_f = (_e = C.LSCG) === null || _e === void 0 ? void 0 : _e.InjectorModule) === null || _f === void 0 ? void 0 : _f.brainwashed); // || getModule<MiscModule>("MiscModule")?.isChloroformed; -- Need to push chloroform status to public for this to work.
	}
	function GetMetadata(data) {
	    let sender = getCharacter(data.Sender);
	    if (!sender)
	        sender = Player; // No sender usually means we're actively sending it..
	    return ChatRoomMessageRunExtractors(data, sender).metadata;
	}
	function GetTargetCharacter(data) {
	    var _a;
	    return (_a = GetMetadata(data)) === null || _a === void 0 ? void 0 : _a.TargetMemberNumber;
	}
	function GetActivityName(data) {
	    var _a;
	    return (_a = GetMetadata(data)) === null || _a === void 0 ? void 0 : _a.ActivityName;
	}
	function GetDelimitedList(source, delimiter = ",") {
	    var _a, _b;
	    return (_b = (_a = source === null || source === void 0 ? void 0 : source.split(delimiter)) === null || _a === void 0 ? void 0 : _a.filter(entry => !!entry).map(entry => entry.toLocaleLowerCase())) !== null && _b !== void 0 ? _b : [];
	}
	function GetActivityEntry(actName, grpName) {
	    var _a;
	    if (!((_a = Player.LSCG) === null || _a === void 0 ? void 0 : _a.ActivityModule))
	        return;
	    return Player.LSCG.ActivityModule.activities.find(a => a.name == actName && a.group == grpName);
	}
	function GetActivityEntryFromContent(content) {
	    // ex: ChatOther-ItemNose-Pet
	    let result = /Chat(Other|Self)-(\S+)-(\S+)/mi.exec(content);
	    if (!!result) {
	        return GetActivityEntry(result[3], result[2]);
	    }
	    return;
	}
	function IsActivityAllowed(activity, sender) {
	    var _a;
	    if (!sender || !activity)
	        return false;
	    if (!!activity.allowedMemberIds && activity.allowedMemberIds.length > 0 && activity.allowedMemberIds.indexOf((_a = sender.MemberNumber) !== null && _a !== void 0 ? _a : -1) > -1)
	        return true;
	    else if (!activity.allowedMemberIds || activity.allowedMemberIds.length == 0)
	        return isAllowedMember(sender);
	    else
	        return false;
	}
	// ICONS
	const ICONS = Object.freeze({
	    TONGUE: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTIyLjg4IDk3LjI1IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMjIuODggOTcuMjUiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIGQ9Ik0xMjEuOTksMjEuNzNjMC44OCwwLjUzLDEuMTUsMS42OCwwLjYyLDIuNTVjLTAuNCwwLjY2LTEuMTUsMC45OC0xLjg3LDAuODdMOTYuMiwzNi43NmwtMC4wMywwLjAyIGMtMC4xOSw0LjQxLTAuNDYsOS4yMy0wLjk5LDE0LjE1Yy0wLjU0LDUuMDUtMS4zNCwxMC4yMi0yLjYsMTUuMThjLTIuMTQsOC40My02LjEzLDE3LjEzLTEyLjI5LDIzLjE3IGMtNS4xMiw1LjAxLTExLjY5LDguMi0xOS45LDcuOTdjLTMuNjUtMC4xMS03LjI4LTEtMTAuNzItMi42OGMtMy4zLTEuNjItNi40Mi0zLjk2LTkuMi03LjA1QzI5LjksNzUuODQsMjguMjksNTcuNzksMjYuODYsNDEuNzYgYy0wLjE0LTEuNTMtMC4yNy0zLjA1LTAuNDItNC41OEwxLjEyLDI0LjE1QzAuNzgsMjQsMC40OCwyMy43NiwwLjI4LDIzLjQyYy0wLjU0LTAuODgtMC4yNi0yLjAyLDAuNjEtMi41NmwyNi4zMy0xNi4yIGMzLjQ5LTIuNDksNi45NC0zLjk1LDEwLjY1LTQuNDVjMy42OS0wLjUsNy41Ny0wLjA1LDExLjk0LDEuMjdjMTEuODUsMy41OSwxMi41OCwzLjQsMjIuOTIsMC43OWMwLjg1LTAuMjEsMS43OC0wLjQ1LDMuMzktMC44NSBjMy43MS0wLjkyLDYuMzUtMS4xMiw5LjA2LTAuNTZjMi42MiwwLjU0LDUuMTMsMS43NSw4LjY3LDMuNjljMC4wNSwwLjAzLDAuMTEsMC4wNSwwLjE2LDAuMDlMMTIxLjk5LDIxLjczTDEyMS45OSwyMS43M3ogTTk2LjI0LDMyLjYzbDIwLjU2LTkuNzNMOTIuMDgsNy43OWwwLDBjLTMuMjMtMS43Ny01LjQ5LTIuODctNy42NC0zLjMxYy0yLjEtMC40My00LjI3LTAuMjUtNy40MywwLjU0IGMtMC44NSwwLjIxLTIuMTYsMC41NC0zLjM3LDAuODVjLTExLjI3LDIuODUtMTIuMDcsMy4wNS0yNC45LTAuODNjLTMuODctMS4xNy03LjI0LTEuNTgtMTAuMzctMS4xNSBjLTMuMDksMC40Mi02LjAyLDEuNjgtOS4wNCwzLjg0Yy0wLjA0LDAuMDMtMC4wNywwLjA1LTAuMTEsMC4wN2wwLDBMNS42NCwyMi4zTDI2LDMyLjc4Yy0wLjE2LTMuMDcsMC4yLTUuODMsMS4wOS04LjI2IGMwLjkyLTIuNTMsMi40LTQuNjksNC40NC02LjQ4YzIuNTYtMi4yNCw1LjQ5LTMuNjEsOC41OS00LjNjMy40NC0wLjc3LDcuMDYtMC42OSwxMC41OS0wLjA3YzEuOTYsMC4zNSwzLjg5LDAuODksNS43OCwxLjYxIGMxLjUsMC41NywyLjk2LDEuMjQsNC4zOSwybDAuMDUsMGMwLjA0LDAsMC4wOCwwLDAuMTIsMGMzLjIyLTIuMDIsNi40OS0zLjM0LDkuODItMy45OGMzLjcyLTAuNzEsNy40OS0wLjU3LDExLjMxLDAuNDMgYzMuNjksMC45Nyw2LjIzLDEuOTQsOC4yNiwzLjYzYzIuMDUsMS43MSwzLjQzLDQuMDQsNC43NCw3LjY4YzAuNTEsMS40MiwwLjgxLDMuMTgsMC45NSw1LjE3Qzk2LjE5LDMwLjk4LDk2LjIyLDMxLjc5LDk2LjI0LDMyLjYzIEw5Ni4yNCwzMi42M3ogTTYzLjQyLDIwLjJWNTguOWMwLDEuMzctMS4xMSwyLjQ4LTIuNDgsMi40OGMtMS4zNywwLTIuNDgtMS4xMS0yLjQ4LTIuNDhWMjAuMjFjLTEuMDgtMC41NS0yLjE3LTEuMDMtMy4yNy0xLjQ1IGMtMS42Ni0wLjYzLTMuMzYtMS4xMS01LjExLTEuNDJjLTMuMTEtMC41NS02LjI0LTAuNjMtOS4xNSwwLjAyYy0yLjUxLDAuNTYtNC44OCwxLjY2LTYuOTUsMy40N2MtMS41NiwxLjM2LTIuNjksMy4wMi0zLjM5LDQuOTUgYy0wLjcyLDEuOTgtMS4wMSw0LjI4LTAuODcsNi45YzAuMjksMi42MywwLjU2LDUuNjUsMC44NCw4Ljc2YzEuMzgsMTUuNDQsMi45MywzMi44MywxMi42NSw0My41OGMyLjQ2LDIuNzMsNS4yLDQuNzksOC4wOCw2LjIgYzIuOTYsMS40NSw2LjA3LDIuMjIsOS4xOSwyLjMxYzcuMDgsMC4yMSwxMi43Ni0yLjU2LDE3LjItNi45YzUuNjMtNS41MSw5LjMtMTMuNTcsMTEuMjktMjEuNDJjMS4yMi00LjgsMS45OS05Ljc5LDIuNTEtMTQuNjcgYzAuNTMtNC45NCwwLjc5LTkuNzMsMC45OC0xNC4wOWMwLjA5LTIuMTUsMC4wOS00LjE3LTAuMDMtNS45NmMtMC4xMi0xLjY5LTAuMzUtMy4xMy0wLjczLTQuMThjLTEuMDctMi45OC0yLjEzLTQuODItMy42My02LjA4IGMtMS41My0xLjI4LTMuNjUtMi4wNy02LjgtMi44OWMtMy4yOC0wLjg2LTYuNS0wLjk5LTkuNjktMC4zOEM2OC44NCwxNy40OCw2Ni4xMiwxOC41Niw2My40MiwyMC4yTDYzLjQyLDIwLjJ6Ii8+PC9nPjwvc3ZnPg==",
	    BOUND_GIRL: "data:image/png;base64,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",
	    BDSM: "data:image/png;base64,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",
	    COLLAR: "data:image/png;base64,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",
	    HYPNO: "data:image/png;base64,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",
	    HUG: "data:image/png;base64,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",
	    PUSSY: "data:image/png;base64,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",
	    ASS: "data:image/png;base64,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",
	    HOLD_HANDS: "data:image/png;base64,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",
	    EAR: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB+cGBRIaCN5fgf8AAAQ0SURBVFjDvdhbbFRVFMbxXy/QlpZ7SQEBqySAIiiUS8JFSREViBFF0ASCISAEokYkgEQFgw8YX9SYNDwgAQQVRIxIELmZokFDDEFLhSAgtZReqC1IuZQI9cHDZFqmU6bT8D2tfdaa89977T1rnXO4A0qIITZRG2kSXXfFFTdaGpLmQY8Yopd2kvzrgmKHHXDY+ZaBpBpvjhwXHPWHCtekytJbX52c8rlNSuJNZx+fqvSNKe6SHHY9WTcTrVGqwHSt40HkOuJXk6U2modBNqj2kU7NRTyhyFfuaSKqtbnKfaZzcxDDnGzw02TZck0x2Wg9JIV5JimzSkqsiCw/2isrNG5lvM1Oq3BWqQonbfB42F7MVG1WbIgEK/0lJzTuapUq+71qlPv0l2uJA6qs1iM0iY8d1SsWyFClFoVGPe10xhxt68W0N1uR3SHMACUWxgJZ6KCugd3OFqeMiRg32mlrg71IsNaBBhOJqu76hOzFyk1oNHKGKk8G9hTlBseylpvqo0i+MXpKjOjPkG9TcNL6KTE9UlCi6Hpad319Id9qwyP4a3wrJ0jtOedlxw5JNc4240y1xlBfe0WrW2KOaBtAatXoEOk2yVEhHfSSpwDfW2OJdyR5v0HMPxK0AXXqIhfc6JAUrV0I7LMWuWapQ/LrxaShNohOD0XHkK6ranUMja5Z6bgFDcplL1dVgk46KI4dcl6RwWEpqJJnZFglgKGKlYPeUh2PHVJrt4f1DbuyT6XHwsZZRvrBJTBCpROxQ/hSrdfCCmG5Q4aFjXNl2Q7aetRPKjRLs1RbEZwfeFNBqAFk2Gt7sEdjVXqqeQiSLVZtRWjNc50KFcUZqkwESdY72Pz+SIJlzugXjOaEINkKbQhSN0KFeY3doKk9gTrfSQnNPtNlV5BmuVQrXUOqBYpsaTwZt6MebqgOVnW/YhfR32hvKwTPGGu+c81PFim2yg86RTfHLAfpBgSVrLffbYy9w9fXTNWeC+xZKhpU4zY2Oh7asWbqUSWhJ5FsBT5pUIkXqjI1PkS23+zQBbSz2QkD6vlHKfPubR2fKHpLkf6hOf9tUj1ve3vslxkfIsVeawO7q0J5DfrFfJXGNX2b6AtNkuZiYD+vi3Xqwrw9vWSrffGtA/IcM0Smacp8UO/RlKVKDIwfQX+/KHVMlfXB9t9UD0d92BIIyDbPGyaE1eH/9bJSg1oKElkdHbSuQfpi1DCTmjgSz6o0Nr55vudn6VH8KbbZdUsCG1Xk+dZIj1rwhhthncvxQU7rGOV/nOxFf9oZX7J4SJlpjXpznTM7XgRpdtglI6Kvs332aB8/hPEqLYvQNzPkKTGyJRAkel21VR4I6x6tDLZZeeR3kGhq/LNHKy9YJMNhhSrckGmgHGWW29ZyELjbBGPcq60El5yy2zalsael6Q84idKlSXBVjeuxA+6Y/gOWWgpWIlh55wAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wNi0wNVQxODoyNjowOCswMDowMHPwqE0AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDYtMDVUMTg6MjY6MDgrMDA6MDACrRDxAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTA2LTA1VDE4OjI2OjA4KzAwOjAwVbgxLgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=",
	    PINCH: "data:image/png;base64,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",
	    INJECTOR: "data:image/png;base64,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",
	    REMOTE: "data:image/png;base64,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",
	    MUTE: "data:image/png;base64,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",
	    NECK: "data:image/png;base64,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"
	});
	const SVG_ICONS = Object.freeze({
	    STAR: `m12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z`
	});
	const AUDIO = Object.freeze({
	    INJECTION: `data:audio/mpeg;base64,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`,
	    HEARTBEAT: `data:audio/mpeg;base64,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DwJGf/RGAR/9iHe3y8rueM3uHdcZVVAQuS87AotBTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgH227bbbbIZAJh/tvmgwGc/2hq0zmVFuAw5F0CosVHAY2QqTaODSlDXMzQmwDBWqOiwqJLeITxQemsBAYFFGUEOqCjjT0bYFhlzMJrJ0f0Y6jTMR4YriOglZaHcWEUJcDcHrVp+nOqkOJqjWd81PSToamjbcJ02wOoqXHycJdlyQp4NhOE5O58sPCcmIrmEdBWK//PiZJIpygr833NPHQ54BlJeEEQCI21QxoxTHQpni6PZlajShK4qGt03Iag0o2mmnnR2Kh8SMn5vLh4u2BKiyLY/C2RD2c3ZeCUNzYgy5xB4IS2l4NdxQRYMGkSxFoEtxCXriXAWYzy6K1XrgtyWVZK1ccLmOo9y0QomAvzTYxSmU4zFO8n56laJsEpLplDWY3WZlWVCkS/N6QN5OxUizKxR4TCsURvNyGnAh6TMYlRl67ioWk0FeqsMb9Rkueog0jWVSNiOtmQOZ26Tx1qg8T5Dbltm32322wtz72KEgOphAcJ06LvConeCZt9NNcXT6fbmtulift/9n+N9236lfo3sbScUMeme0s8PVUuSWRtGm14EdVouZyutImoLB+aHxjpgNitGl+I0ZF4QRitBSGSxx0bKSNp1Y2b+MGMKgOLjgi0adgvZDAZvVBsXARtO4aHEiNxqDaXaGxYFrsLAQKjy4aHZ6nSZc+1VbDK2JR1ubT4fgZPdvmbwGx1YBak+xdR9RUcAzbrslXEvtd6xmVoxO+9CwDSWZvxxMtG5dSvo0sdLJlSIcNpxMBmo5KKNv2FMCUrj6p2OWU9XZWUqxWGKOguthjDl5NYbE2V/4KQUZ8oZAcZWs60DMnStYypQxJ8E3mY3VjOkwt/21XayKWM5hT+xB3ZDAcXUGctukYUWRsTmf+ytVmBalf/z4GT/MFIK3h97eiQi08YAfsGGOVVrSwrOl6LKep/W+YQ4DY1ewwpszhajDpDN2W1nFN0OkcXpPsswW+zViTBGGoprpbgrpTuAWITCMsOV2pK1onqjUYZsxBlKWjxtZX+yxTOH4k1eXP+5kFlABBNCX/fxzWstuzqMs3UNcFjjXmcP+tRB52mIOC7cP1GOrTbde79JoswdkFa62221gGJgeySUfFIcG1jowzCtK3JzT594Yk8MM9dXB1WnVPcdFLUpaiK1OjveR6M7OCnDGCLrIjH6UhbDWERV13hZNm5PSqRRSHTUK0EUoeJ+ZyAnAo7wHEOMfuDIEksNnlabCvlAEDiegOFVnssNjCasQyMg0ciEAlQJVfPmTGEI9cUkC7vLVDlMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==`
	});

	class BaseModule {
	    get settingsScreen() {
	        return null;
	    }
	    ;
	    /** Allows changing the subkey for that module settings storage */
	    get settingsStorage() {
	        return this.constructor.name;
	    }
	    get settings() {
	        if (!this.settingsStorage)
	            return {};
	        if (!Player.LSCG) {
	            Player.LSCG = {};
	            this.registerDefaultSettings();
	        }
	        else if (!Player.LSCG[this.settingsStorage])
	            this.registerDefaultSettings();
	        return Player.LSCG[this.settingsStorage];
	    }
	    get Enabled() {
	        if (!Player.LSCG || !Player.LSCG.GlobalModule)
	            return false;
	        return Player.LSCG.GlobalModule.enabled && this.settings.enabled &&
	            (ServerPlayerIsInChatRoom() ||
	                (CurrentModule == "Room" && CurrentScreen == "Crafting"));
	    }
	    init() {
	        this.registerDefaultSettings();
	    }
	    registerDefaultSettings() {
	        var _a;
	        const storage = this.settingsStorage;
	        const defaults = this.defaultSettings;
	        if (!storage || !defaults)
	            return;
	        Player.LSCG[storage] = Object.assign(defaults, (_a = Player.LSCG[storage]) !== null && _a !== void 0 ? _a : {});
	    }
	    get defaultSettings() {
	        return null;
	    }
	    load() {
	        // Empty
	    }
	    run() {
	        // Empty
	    }
	    unload() {
	        // Empty
	    }
	    reload() {
	        // Empty
	    }
	    safeword() {
	        // Empty
	    }
	}

	class GuiSubscreen {
	    constructor(module) {
	        this.module = module;
	        // create each handler for a new preference subscreen
	        SETTING_FUNC_NAMES.forEach(name => {
	            const fName = SETTING_FUNC_PREFIX + SETTING_NAME_PREFIX + this.name + name;
	            if (typeof this[name] === "function" && typeof window[fName] !== "function")
	                window[fName] = () => {
	                    this[name]();
	                };
	        });
	    }
	    get name() {
	        return "UNKNOWN";
	    }
	    get icon() {
	        return ICONS.BOUND_GIRL;
	    }
	    get label() {
	        return "UNDEFINED SETTING SCREEN";
	    }
	    get hidden() {
	        return false;
	    }
	    get disabledReason() {
	        return "Setting is unavailable.";
	    }
	    get enabled() {
	        return true;
	    }
	    get message() {
	        return PreferenceMessage;
	    }
	    set message(s) {
	        PreferenceMessage = s;
	    }
	    get SubscreenName() {
	        return SETTING_NAME_PREFIX + this.constructor.name;
	    }
	    setSubscreen(screen) {
	        return setSubscreen(screen);
	    }
	    get settings() {
	        return this.module.settings;
	    }
	    get multipageStructure() {
	        return [[]];
	    }
	    get structure() {
	        return this.multipageStructure[Math.min(PreferencePageCurrent - 1, this.multipageStructure.length - 1)];
	    }
	    get character() {
	        var _a;
	        // Because we're initialized by that instance, it must already exist
	        return (_a = GUI.instance) === null || _a === void 0 ? void 0 : _a.currentCharacter;
	    }
	    getYPos(ix) {
	        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * (ix % 9));
	    }
	    getXPos(ix) {
	        return GuiSubscreen.START_X + (GuiSubscreen.X_MOD * Math.floor(ix / 9));
	    }
	    getNarrowYPos(row) {
	        return GuiSubscreen.START_Y + (GuiSubscreen.Y_MOD * row);
	    }
	    getNarrowXPos(col) {
	        return GuiSubscreen.START_X + (600 * col);
	    }
	    HideElements() {
	        this.multipageStructure.forEach((s, ix, arr) => {
	            if (ix != (PreferencePageCurrent - 1)) {
	                s.forEach(setting => {
	                    if (setting.type == "text" || setting.type == "number")
	                        this.ElementHide(setting.id);
	                });
	            }
	        });
	    }
	    Load() {
	        this.multipageStructure.forEach(s => s.forEach(item => {
	            switch (item.type) {
	                case "text":
	                    ElementCreateInput(item.id, "text", item.setting(), "255");
	                    break;
	                case "number":
	                    ElementCreateInput(item.id, "number", item.setting(), "255");
	                    break;
	            }
	        }));
	    }
	    Run() {
	        var prev = MainCanvas.textAlign;
	        MainCanvas.textAlign = "left";
	        DrawText("- LSCG " + this.name + " -", GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
	        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "LSCG main menu");
	        if (this.multipageStructure.length > 1) {
	            MainCanvas.textAlign = "center";
	            PreferencePageChangeDraw(1595, 75, this.multipageStructure.length);
	            MainCanvas.textAlign = "left";
	        }
	        this.HideElements();
	        this.structure.forEach((item, ix, arr) => {
	            switch (item.type) {
	                case "checkbox":
	                    this.DrawCheckbox(item.label, item.description, item.setting(), ix, item.disabled);
	                    break;
	                case "text":
	                case "number":
	                    this.ElementPosition(item.id, item.label, item.description, ix, item.disabled);
	                    break;
	                case "label":
	                    this.DrawLabel(item.label, item.description, ix);
	                    break;
	            }
	        });
	        MainCanvas.textAlign = prev;
	    }
	    Click() {
	        if (MouseIn(1815, 75, 90, 90))
	            return this.Exit();
	        if (this.multipageStructure.length > 1)
	            PreferencePageChangeClick(1595, 75, this.multipageStructure.length);
	        this.structure.forEach((item, ix, arr) => {
	            switch (item.type) {
	                case "checkbox":
	                    if (MouseIn(this.getXPos(ix) + 600, this.getYPos(ix) - 32, 64, 64) && !item.disabled) {
	                        item.setSetting(!item.setting());
	                    }
	                    break;
	            }
	        });
	    }
	    Exit() {
	        this.multipageStructure.forEach(s => s.forEach(item => {
	            switch (item.type) {
	                case "number":
	                    if (!CommonIsNumeric(ElementValue(item.id))) {
	                        ElementRemove(item.id);
	                        break;
	                    }
	                case "text":
	                    item.setSetting(ElementValue(item.id));
	                    ElementRemove(item.id);
	                    break;
	            }
	        }));
	        setSubscreen("MainMenu");
	        settingsSave(true);
	    }
	    Unload() {
	        // Empty
	    }
	    onChange(source) {
	        // Empty
	    }
	    Tooltip(text) {
	        drawTooltip(300, 850, 1400, text, "left");
	    }
	    DrawCheckboxNarrow(label, description, value, row, column, disabled = false) {
	        let x = this.getNarrowXPos(column);
	        let y = this.getNarrowYPos(row);
	        let width = 400;
	        var isHovering = MouseIn(x, y - 32, width, 64);
	        DrawTextFit(label, x, y, width, isHovering ? "Red" : "Black", "Gray");
	        DrawCheckbox(x + width, y - 32, 64, 64, "", value !== null && value !== void 0 ? value : false, disabled);
	        if (isHovering)
	            this.Tooltip(description);
	    }
	    DrawCheckbox(label, description, value, order, disabled = false) {
	        var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64);
	        DrawTextFit(label, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
	        DrawCheckbox(this.getXPos(order) + 600, this.getYPos(order) - 32, 64, 64, "", value !== null && value !== void 0 ? value : false, disabled);
	        if (isHovering)
	            this.Tooltip(description);
	    }
	    ElementHide(elementId) {
	        ElementPosition(elementId, -999, -999, 1, 1);
	    }
	    ElementPosition(elementId, label, description, order, disabled = false) {
	        var _a;
	        var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64);
	        DrawTextFit(label, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
	        ElementPosition(elementId, this.getXPos(order) + 750, this.getYPos(order), 300);
	        if (disabled)
	            ElementSetAttribute(elementId, "disabled", "true");
	        else {
	            (_a = document.getElementById(elementId)) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
	        }
	        if (isHovering)
	            this.Tooltip(description);
	    }
	    DrawLabel(name, description, order) {
	        var isHovering = MouseIn(this.getXPos(order), this.getYPos(order) - 32, 600, 64);
	        DrawTextFit(name, this.getXPos(order), this.getYPos(order), 600, isHovering ? "Red" : "Black", "Gray");
	        if (isHovering)
	            this.Tooltip(description);
	    }
	}
	GuiSubscreen.START_X = 180;
	GuiSubscreen.START_Y = 205;
	GuiSubscreen.X_MOD = 950;
	GuiSubscreen.Y_MOD = 75;

	class GuiGlobal extends GuiSubscreen {
	    get name() {
	        return "General";
	    }
	    get icon() {
	        return ICONS.BDSM;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get structure() {
	        return [
	            {
	                type: "checkbox",
	                label: "LSCG Scripts Enabled:",
	                description: "Enable LSCG Features.",
	                setting: () => { var _a; return (_a = this.settings.enabled) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => this.settings.enabled = val
	            }, {
	                type: "checkbox",
	                label: "Block Settings While Restrained:",
	                description: "Prevents LSCG settings access while restrained.",
	                setting: () => { var _a; return (_a = this.settings.blockSettingsWhileRestrained) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => this.settings.blockSettingsWhileRestrained = val
	            }, {
	                type: "checkbox",
	                label: "Blur While Edged:",
	                description: "Apply extra blurring to the screen while edging.",
	                setting: () => { var _a; return (_a = this.settings.edgeBlur) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => this.settings.edgeBlur = val
	            }, {
	                type: "checkbox",
	                label: "Enable Lipstick Marks:",
	                description: "Apply kiss marks when lipstick-wearing people kiss you on the cheek/forehead/neck.",
	                setting: () => { var _a; return (_a = Player.LSCG.LipstickModule.enabled) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => Player.LSCG.LipstickModule.enabled = val
	            }, {
	                type: "checkbox",
	                label: "Dry Lipstick:",
	                description: "Never apply kissmarks when you are the kisser.",
	                setting: () => { var _a; return (_a = Player.LSCG.LipstickModule.dry) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => Player.LSCG.LipstickModule.dry = val
	            }, {
	                type: "checkbox",
	                label: "Enable Boop Reactions:",
	                description: "Auto-react when booped.",
	                setting: () => { var _a; return (_a = Player.LSCG.BoopsModule.enabled) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => Player.LSCG.BoopsModule.enabled = val
	            }, {
	                type: "checkbox",
	                label: "Show Check Rolls:",
	                description: "If enabled, will display the attacker/defender roll values for activity checks.",
	                setting: () => { var _a; return (_a = this.settings.showCheckRolls) !== null && _a !== void 0 ? _a : true; },
	                setSetting: (val) => this.settings.showCheckRolls = val
	            }, {
	                type: "checkbox",
	                label: "Share Public Craftings:",
	                description: "If enabled, other LSCG users in the room will be able to use your crafted items on other people.",
	                setting: () => { var _a; return (_a = this.settings.sharePublicCrafting) !== null && _a !== void 0 ? _a : false; },
	                setSetting: (val) => this.settings.sharePublicCrafting = val
	            }
	        ];
	    }
	    Load() {
	        var _a, _b, _c;
	        // Load up module settings to ensure defaults..
	        (_a = getModule("MiscModule")) === null || _a === void 0 ? void 0 : _a.settings;
	        (_b = getModule("LipstickModule")) === null || _b === void 0 ? void 0 : _b.settings;
	        (_c = getModule("BoopsModule")) === null || _c === void 0 ? void 0 : _c.settings;
	        super.Load();
	    }
	}

	class GuiReset extends GuiSubscreen {
	    constructor() {
	        super(...arguments);
	        this.allowedConfirmTime = 0;
	    }
	    get name() {
	        return "Reset all LSCG Data";
	    }
	    get icon() {
	        return ICONS.BOUND_GIRL;
	    }
	    Load() {
	        this.allowedConfirmTime = Date.now() + 10000;
	        super.Load();
	    }
	    Run() {
	        MainCanvas.textAlign = "center";
	        DrawText(`- Permanent reset of ALL LSCG data -`, 1000, 125, "Black");
	        DrawText("- Warning -", 1000, 225, "Black", "Black");
	        DrawText("If you confirm, all LSCG data (including settings, overrides, and current states) will be permanently reset!", 1000, 325, "Black");
	        //DrawText("As part of the deletion process, the window will reload, logging you out of your account.", 1000, 500, "Gray");
	        DrawText("You will be able to continue using LSCG, but all of your configuration will be reset to default!", 1000, 550, "Gray");
	        DrawText("This action cannot be undone!", 1000, 625, "Red", "Black");
	        if (this.allowedConfirmTime === null) {
	            DrawText("Resetting...", 1000, 720, "Black");
	            return;
	        }
	        const now = Date.now();
	        if (now < this.allowedConfirmTime) {
	            DrawButton(300, 720, 200, 80, `Confirm (${Math.floor((this.allowedConfirmTime - now) / 1000)})`, "#ddd", undefined, undefined, true);
	        }
	        else {
	            DrawButton(300, 720, 200, 80, "Confirm", "White");
	        }
	        DrawButton(1520, 720, 200, 80, "Cancel", "White");
	    }
	    Click() {
	        if (this.allowedConfirmTime === null)
	            return;
	        if (MouseIn(1520, 720, 200, 80))
	            return this.Exit();
	        if (MouseIn(300, 720, 200, 80) && Date.now() >= this.allowedConfirmTime)
	            return this.Confirm();
	    }
	    Confirm() {
	        var _a;
	        this.allowedConfirmTime = null;
	        (_a = getModule("CommandModule")) === null || _a === void 0 ? void 0 : _a.EmergencyRelease();
	        this.Exit();
	    }
	}

	class MainMenu extends GuiSubscreen {
	    get name() {
	        return "MainMenu";
	    }
	    get enabled() {
	        return false;
	    }
	    get hidden() {
	        return true;
	    }
	    get immersiveBlock() {
	        var _a, _b, _c, _d, _e, _f, _g;
	        var hypnoBlock = ((_a = Player.LSCG.HypnoModule) === null || _a === void 0 ? void 0 : _a.immersive) && ((_b = Player.LSCG.HypnoModule) === null || _b === void 0 ? void 0 : _b.hypnotized);
	        var chloroformBlock = ((_c = Player.LSCG.MiscModule) === null || _c === void 0 ? void 0 : _c.immersiveChloroform) && ((_d = getModule("MiscModule")) === null || _d === void 0 ? void 0 : _d.isChloroformed);
	        var drugBlock = ((_e = Player.LSCG.InjectorModule) === null || _e === void 0 ? void 0 : _e.immersive) && (((_f = Player.LSCG.InjectorModule) === null || _f === void 0 ? void 0 : _f.asleep) || ((_g = Player.LSCG.InjectorModule) === null || _g === void 0 ? void 0 : _g.brainwashed));
	        return (hypnoBlock || chloroformBlock || drugBlock);
	    }
	    get restrainedBlock() {
	        return Player.IsRestrained() && Player.LSCG.GlobalModule.blockSettingsWhileRestrained;
	    }
	    constructor(module) {
	        super(module);
	        this.subscreens = [];
	        this.subscreens = module.subscreens;
	    }
	    onChange(source) {
	        if (source === this.character.MemberNumber) {
	            this.Load();
	        }
	    }
	    Load() {
	        var _a;
	        // As that Load call was made automatically by BC (though PreferenceSubscreenList) we're not setup fully yet.
	        // Set and bail out, as we're gonna get called again.
	        if (!((_a = GUI.instance) === null || _a === void 0 ? void 0 : _a.currentSubscreen)) {
	            this.setSubscreen(this);
	            return;
	        }
	        super.Load();
	    }
	    Run() {
	        var prev = MainCanvas.textAlign;
	        MainCanvas.textAlign = "left";
	        DrawText(`- Little Sera's Club Games ${LSCG_VERSION} -`, GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
	        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
	        if (!this.immersiveBlock && !this.restrainedBlock) {
	            MainCanvas.textAlign = "center";
	            let i = 0;
	            for (const screen of this.subscreens) {
	                const PX = Math.floor(i / 6);
	                const PY = i % 6;
	                const isDisabled = !screen.enabled;
	                // Skip disabled screens for the time being
	                if (screen.name == "MainMenu" || screen.hidden)
	                    continue;
	                DrawButton(150 + 430 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", "", isDisabled ? "Setting is deactivated" : "", isDisabled);
	                DrawImageResize(screen.icon, 150 + 430 * PX + 10, 190 + 120 * PY + 10, 70, 70);
	                MainCanvas.textAlign = "left";
	                DrawTextFit(screen.name, 250 + 430 * PX, 235 + 120 * PY, 340, "Black");
	                MainCanvas.textAlign = "center";
	                i++;
	            }
	        }
	        else if (this.restrainedBlock) {
	            DrawText("Settings disabled while restrained", 150, 190, "Black", "Gray");
	        }
	        else if (this.immersiveBlock) {
	            DrawText("Settings disabled while incapacitated and immersive", 150, 190, "Black", "Gray");
	        }
	        MainCanvas.textAlign = "left";
	        DrawButton(1500, 620, 400, 80, "", "#ffc9c9", "", "Emergency reset of LSCG");
	        DrawImageResize("Icons/ServiceBell.png", 1510, 630, 60, 60);
	        DrawTextFit("Reset", 1580, 660, 320, "Black");
	        DrawButton(1500, 720, 400, 80, "", "White", "", "Open LSCG Latest Release on Github.", false);
	        DrawImageResize("Icons/Changelog.png", 1510, 730, 60, 60);
	        DrawTextFit("Latest Changes", 1580, 760, 320, "Black");
	        DrawButton(1500, 820, 400, 80, "", "White", "", "Open LSCG Wiki on GitHub.", false);
	        DrawImageResize("Icons/Introduction.png", 1510, 830, 60, 60);
	        DrawTextFit("Open Help", 1580, 860, 320, "Black");
	        MainCanvas.textAlign = prev;
	    }
	    Click() {
	        if (MouseIn(1815, 75, 90, 90))
	            return this.Exit();
	        if (!this.immersiveBlock && !this.restrainedBlock) {
	            let i = 0;
	            for (const screen of this.subscreens) {
	                const PX = Math.floor(i / 6);
	                const PY = i % 6;
	                if (screen.name == "MainMenu" || screen.hidden)
	                    continue;
	                if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 450, 90) && screen.enabled) {
	                    this.setSubscreen(screen);
	                    return;
	                }
	                i++;
	            }
	        }
	        if (MouseIn(1500, 620, 400, 80))
	            this.setSubscreen(new GuiReset(getModule("CoreModule")));
	        if (MouseIn(1500, 720, 400, 80))
	            window.open(LSCG_CHANGES, '_blank');
	        if (MouseIn(1500, 820, 400, 80))
	            window.open('https://github.com/littlesera/LSCG/wiki', '_blank');
	    }
	    Exit() {
	        this.setSubscreen(null);
	    }
	}

	class GUI extends BaseModule {
	    get subscreens() { return this._subscreens; }
	    get mainMenu() {
	        return this._mainMenu;
	    }
	    get currentSubscreen() {
	        return this._currentSubscreen;
	    }
	    set currentSubscreen(subscreen) {
	        var _a, _b;
	        if (this._currentSubscreen) {
	            this._currentSubscreen.Unload();
	        }
	        if (typeof subscreen === "string") {
	            const scr = (_a = this._subscreens) === null || _a === void 0 ? void 0 : _a.find(s => s.name === subscreen);
	            if (!scr)
	                throw `Failed to find screen name ${subscreen}`;
	            this._currentSubscreen = scr;
	        }
	        else {
	            this._currentSubscreen = subscreen;
	        }
	        // Reset that first, in case it gets set in the screen's Load callback
	        PreferenceMessage = "";
	        PreferencePageCurrent = 1;
	        let subscreenName = "";
	        if (this._currentSubscreen) {
	            subscreenName = SETTING_NAME_PREFIX + ((_b = this._currentSubscreen) === null || _b === void 0 ? void 0 : _b.name);
	            this._currentSubscreen.Load();
	        }
	        // Get BC to render the new screen
	        PreferenceSubscreen = subscreenName;
	    }
	    get currentCharacter() {
	        return Player;
	    }
	    get settingsScreen() {
	        return GuiGlobal;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get settingsStorage() {
	        return "GlobalModule";
	    }
	    constructor() {
	        super();
	        this._currentSubscreen = null;
	        if (GUI.instance) {
	            throw new Error("Duplicate initialization");
	        }
	        this._mainMenu = new MainMenu(this);
	        this._subscreens = [
	            this._mainMenu
	        ];
	        GUI.instance = this;
	    }
	    get defaultSettings() {
	        return {
	            enabled: true,
	            edgeBlur: false,
	            showCheckRolls: true,
	            blockSettingsWhileRestrained: false,
	            sharePublicCrafting: false,
	            seeSharedCrafts: true
	        };
	    }
	    load() {
	        // At that point all other modules have been initialized, build the list of their screens
	        for (const module of modules()) {
	            if (!module.settingsScreen)
	                continue;
	            this._subscreens.push(new module.settingsScreen(module));
	        }
	        this._mainMenu.subscreens = this._subscreens;
	    }
	}
	GUI.instance = null;
	function drawTooltip(x, y, width, text, align) {
	    const canvas = MainCanvas;
	    const bak = canvas.textAlign;
	    canvas.textAlign = align;
	    canvas.beginPath();
	    canvas.rect(x, y, width, 65);
	    canvas.fillStyle = "#FFFF88";
	    canvas.fillRect(x, y, width, 65);
	    canvas.fill();
	    canvas.lineWidth = 2;
	    canvas.strokeStyle = "black";
	    canvas.stroke();
	    canvas.closePath();
	    DrawTextFit(text, align === "left" ? x + 3 : x + width / 2, y + 33, width - 6, "black");
	    canvas.textAlign = bak;
	}

	const SETTING_FUNC_PREFIX = "PreferenceSubscreen";
	const SETTING_NAME_PREFIX = "LSCG";
	const SETTING_FUNC_NAMES = [
	    "Load",
	    "Unload",
	    "Run",
	    "Click",
	    "Exit"
	];
	var ModuleCategory;
	(function (ModuleCategory) {
	    ModuleCategory[ModuleCategory["Core"] = -1] = "Core";
	    ModuleCategory[ModuleCategory["Global"] = 0] = "Global";
	    ModuleCategory[ModuleCategory["Collar"] = 1] = "Collar";
	    ModuleCategory[ModuleCategory["Hypno"] = 2] = "Hypno";
	    ModuleCategory[ModuleCategory["Boops"] = 3] = "Boops";
	    ModuleCategory[ModuleCategory["Lipstick"] = 4] = "Lipstick";
	    ModuleCategory[ModuleCategory["Activities"] = 5] = "Activities";
	    ModuleCategory[ModuleCategory["Injector"] = 6] = "Injector";
	    ModuleCategory[ModuleCategory["ItemUse"] = 7] = "ItemUse";
	    ModuleCategory[ModuleCategory["RemoteUI"] = 98] = "RemoteUI";
	    ModuleCategory[ModuleCategory["Misc"] = 99] = "Misc";
	    ModuleCategory[ModuleCategory["Commands"] = 100] = "Commands";
	})(ModuleCategory || (ModuleCategory = {}));
	function getCurrentSubscreen() {
	    return GUI.instance && GUI.instance.currentSubscreen;
	}
	function setSubscreen(subscreen) {
	    if (!GUI.instance) {
	        throw new Error("Attempt to set subscreen before init");
	    }
	    GUI.instance.currentSubscreen = subscreen;
	    return GUI.instance.currentSubscreen;
	}

	class GuiHypno extends GuiSubscreen {
	    get name() {
	        return "Hypnosis";
	    }
	    get icon() {
	        return ICONS.HYPNO;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get multipageStructure() {
	        if (this.settings.locked) {
	            return [[
	                    {
	                        type: "label",
	                        label: "** Hypnosis Settings Locked **",
	                        description: "Hypnosis Settings Locked Remotely"
	                    }
	                ]];
	        }
	        else {
	            return [
	                [
	                    {
	                        type: "checkbox",
	                        label: "Enabled:",
	                        description: "Enabled the Hypnosis Features.",
	                        setting: () => { var _a; return (_a = this.settings.enabled) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.enabled = val
	                    }, {
	                        type: "checkbox",
	                        label: "Immersive Hypnosis:",
	                        description: "Makes the hypnotized experience more restrictive. LSCG settings will be unavailable while hypnotized and triggers are hidden.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.immersive) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.immersive = val
	                    }, {
	                        type: "text",
	                        id: "hypno_overrideWords",
	                        label: "Override Trigger Words:",
	                        description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.overrideWords) !== null && _a !== void 0 ? _a : ""; },
	                        setSetting: (val) => this.settings.overrideWords = val
	                    }, {
	                        type: "text",
	                        id: "hypno_overrideAwakeners",
	                        label: "Override Awaken Words:",
	                        description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.awakeners) !== null && _a !== void 0 ? _a : ""; },
	                        setSetting: (val) => this.settings.awakeners = val
	                    }, {
	                        type: "text",
	                        id: "hypno_overrideMembers",
	                        label: "Override Allowed Member IDs:",
	                        description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.overrideMemberIds) !== null && _a !== void 0 ? _a : ""; },
	                        setSetting: (val) => this.settings.overrideMemberIds = val
	                    }, {
	                        type: "number",
	                        id: "hypno_triggerTime",
	                        label: "Hypnosis Length (min.):",
	                        description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return ((_a = this.settings.triggerTime) !== null && _a !== void 0 ? _a : 5); },
	                        setSetting: (val) => this.settings.triggerTime = val
	                    }, {
	                        type: "number",
	                        id: "hypno_cooldownTime",
	                        label: "Cooldown (sec.):",
	                        description: "Cooldown time (in seconds) before you can be hypnotized again.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return ((_a = this.settings.cooldownTime) !== null && _a !== void 0 ? _a : 0); },
	                        setSetting: (val) => this.settings.cooldownTime = val
	                    }, {
	                        type: "checkbox",
	                        label: "Enable Cycle:",
	                        description: "If checked, only one trigger will be active at a time and will cycle after use.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.enableCycle) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.enableCycle = val
	                    }, {
	                        type: "number",
	                        id: "hypno_cycleTime",
	                        label: "Trigger Cycle Time (min.):",
	                        description: "Number of minutes after activation to wait before cycling to a new trigger.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return ((_a = this.settings.cycleTime) !== null && _a !== void 0 ? _a : 30); },
	                        setSetting: (val) => this.settings.cycleTime = val
	                    }
	                ], [
	                    {
	                        type: "checkbox",
	                        label: "Allow Remote Access:",
	                        description: "If checked, allowed users can modify these settings.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.remoteAccess) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.remoteAccess = val
	                    }, {
	                        type: "checkbox",
	                        label: "Remote Access Requires Trance:",
	                        description: "If checked, remote access is only possible while actively hypnotized.",
	                        disabled: !this.settings.enabled || !this.settings.remoteAccess,
	                        setting: () => { var _a; return (_a = this.settings.remoteAccessRequiredTrance) !== null && _a !== void 0 ? _a : true; },
	                        setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
	                    }, {
	                        type: "checkbox",
	                        label: "Remote Access Limited to Hypnotizer:",
	                        description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
	                        disabled: !this.settings.enabled || !this.settings.remoteAccess,
	                        setting: () => { var _a; return (_a = this.settings.limitRemoteAccessToHypnotizer) !== null && _a !== void 0 ? _a : true; },
	                        setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
	                    }, {
	                        type: "checkbox",
	                        label: "Allow Remote Override Member Modification:",
	                        description: "If checked, any remote users can change your Override Member Id list (otherwise, only owner can).",
	                        disabled: !this.settings.enabled || !this.settings.remoteAccess,
	                        setting: () => { var _a; return (_a = this.settings.allowRemoteModificationOfMemberOverride) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.allowRemoteModificationOfMemberOverride = val
	                    }, {
	                        type: "checkbox",
	                        label: "Lockable:",
	                        description: "If checked, allowed users can lock you out of these settings.",
	                        disabled: !this.settings.enabled || !this.settings.remoteAccess,
	                        setting: () => { var _a; return (_a = this.settings.allowLocked) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.allowLocked = val
	                    }, {
	                        type: "checkbox",
	                        label: "Build arousal while hypnotized:",
	                        description: "If checked being hypnotized will increase arousal.",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.enableArousal) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.enableArousal = val
	                    }, {
	                        type: "text",
	                        id: "hypno_eyeColor",
	                        label: "Hypnotized Eye Color:",
	                        description: "Hex code of your eye color while hypnotized (default: #A2A2A2).",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return (_a = this.settings.hypnoEyeColor) !== null && _a !== void 0 ? _a : "#A2A2A2"; },
	                        setSetting: (val) => this.settings.hypnoEyeColor = val
	                    }, {
	                        type: "number",
	                        id: "hypno_eyeType",
	                        label: "Hypnotized Eye Type:",
	                        description: "Eye type # to use while under hypnosis (default: 9).",
	                        disabled: !this.settings.enabled,
	                        setting: () => { var _a; return ((_a = this.settings.hypnoEyeType) !== null && _a !== void 0 ? _a : 9); },
	                        setSetting: (val) => this.settings.hypnoEyeType = val
	                    }
	                ]
	            ];
	        }
	    }
	    Exit() {
	        var _a;
	        super.Exit();
	        (_a = getModule("HypnoModule")) === null || _a === void 0 ? void 0 : _a.initializeTriggerWord();
	    }
	}

	class HypnoModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.hypnoBlockStrings = [
	            "%NAME%'s eyelids flutter as a thought tries to enter %POSSESSIVE% blank mind...",
	            "%NAME% sways weakly in %POSSESSIVE% place, drifting peacefully...",
	            "%NAME% trembles as something deep and forgotten fails to resurface...",
	            "%NAME% moans softly as %PRONOUN% drops even deeper into trance...",
	            "%NAME% quivers, patiently awaiting something to fill %POSSESSIVE% empty head..."
	        ];
	        this.delayedHypnoStrings = [
	            "%NAME%'s eyes flutter as %PRONOUN% fights to keep control of %POSSESSIVE% senses...",
	            "%NAME% whimpers and struggles to stay awake...",
	            "%NAME% can feel %POSSESSIVE% eyelids grow heavy as %PRONOUN% drifts on the edge of trance...",
	            "%NAME% lets out a low moan as %POSSESSIVE% muscles relax and %PRONOUN% starts to drop..."
	        ];
	        this.delayedSleepStrings = [
	            "%NAME%'s eyes flutter as %PRONOUN% fights to keep them open...",
	            "%NAME% yawns and struggles to stay awake...",
	            "%NAME% can feel %POSSESSIVE% eyelids grow heavy as %PRONOUN% drifts on the edge of sleep...",
	            "%NAME% takes a deep, relaxing breath as %POSSESSIVE% muscles relax and %PRONOUN% eyes start to droop..."
	        ];
	        this.delayedActivations = new Map();
	        this.cooldownMsgSent = false;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get settingsScreen() {
	        return GuiHypno;
	    }
	    get defaultSettings() {
	        return {
	            enabled: false,
	            activatedAt: 0,
	            recoveredAt: 0,
	            cycleTime: 30,
	            enableCycle: true,
	            triggerCycled: true,
	            overrideMemberIds: "",
	            overrideWords: "",
	            allowLocked: false,
	            remoteAccess: false,
	            remoteAccessRequiredTrance: true,
	            allowRemoteModificationOfMemberOverride: false,
	            cooldownTime: 0,
	            enableArousal: false,
	            immersive: false,
	            trigger: "",
	            triggerTime: 5,
	            locked: false,
	            awakeners: "",
	            hypnotized: false,
	            hypnotizedBy: -1,
	            limitRemoteAccessToHypnotizer: false,
	            hypnoEyeColor: "#A2A2A2",
	            hypnoEyeType: 9,
	            stats: {}
	        };
	    }
	    safeword() {
	        this._resetHypno();
	    }
	    load() {
	        OnAction(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
	            var _a;
	            if (!this.Enabled)
	                return;
	            var lowerMsgWords = parseMsgWords(msg);
	            if (((_a = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("snaps")) !== null && _a !== void 0 ? _a : -1) >= 0 &&
	                (sender === null || sender === void 0 ? void 0 : sender.MemberNumber) != Player.MemberNumber &&
	                this.hypnoActivated) {
	                this.TriggerRestoreSnap();
	            }
	        });
	        OnActivity(1, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
	            var _a, _b, _c;
	            if (!this.Enabled)
	                return;
	            let target = GetTargetCharacter(data);
	            if (!!target && target == Player.MemberNumber) {
	                let activityEntry = GetActivityEntryFromContent(data.Content);
	                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
	                    return;
	                if ((activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.awakener) && this.hypnoActivated && !(sender === null || sender === void 0 ? void 0 : sender.IsPlayer()))
	                    this.TriggerRestoreBoop();
	                // Special tummy rub hypno action for Bean
	                else if ((activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.hypno) && !this.hypnoActivated && !this.IsOnCooldown() && ((_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) >= activityEntry.hypnoThreshold) {
	                    this.DelayedTrigger(activityEntry, sender === null || sender === void 0 ? void 0 : sender.MemberNumber);
	                }
	                else if ((activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.sleep) && !((_c = getModule("InjectorModule")) === null || _c === void 0 ? void 0 : _c.asleep)) {
	                    this.DelayedTrigger(activityEntry, sender === null || sender === void 0 ? void 0 : sender.MemberNumber, true);
	                }
	            }
	        });
	        hookFunction("ChatRoomSync", 4, (args, next) => {
	            next(args);
	            if (!this.Enabled)
	                return;
	            if (this.hypnoActivated) {
	                this.CheckHypnotizedState();
	                SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
	            }
	        }, ModuleCategory.Hypno);
	        hookFunction("SpeechGarble", 69, (args, next) => {
	            if (!this.Enabled)
	                return next(args);
	            const C = args[0];
	            // Check for non-garbled trigger word, this means a trigger word could be set to what garbled speech produces >.>
	            let msg = callOriginal("SpeechGarble", [args[0], args[1]]);
	            if (this.CheckTrigger(msg, C) && !this.IsOnCooldown()) {
	                args[1] = this.BlankOutTriggers(args[1]);
	                this.StartTriggerWord(true, C.MemberNumber);
	                return next(args);
	            }
	            if (this.hypnoActivated) {
	                var lowerMsg = args[1].toLowerCase();
	                var names = [CharacterNickname(Player)];
	                if (!!Player.Name && names.indexOf(Player.Name) == -1)
	                    names.push(Player.Name);
	                if (names.some(n => isPhraseInString(lowerMsg, n)) || this.settings.hypnotizedBy == C.MemberNumber || C.MemberNumber == Player.MemberNumber) {
	                    args[1] = this.BlankOutTriggers(args[1]);
	                    if (this.CheckAwakener(msg, C)) {
	                        this.TriggerRestoreWord(C);
	                    }
	                }
	                else
	                    args[1] = args[1].replace(/\S/gm, '-');
	            }
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction("Player.HasTints", 4, (args, next) => {
	            var _a;
	            if (!this.Enabled || !((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return next(args);
	            if (this.hypnoActivated)
	                return true;
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction("Player.GetTints", 4, (args, next) => {
	            var _a;
	            if (!this.Enabled || !((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return next(args);
	            if (this.hypnoActivated)
	                return [{ r: 148, g: 0, b: 211, a: 0.4 }];
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
	            var _a;
	            if (!this.Enabled || !((_a = Player.GraphicsSettings) === null || _a === void 0 ? void 0 : _a.AllowBlur))
	                return next(args);
	            if (this.hypnoActivated)
	                return 3;
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction('Player.CanWalk', 1, (args, next) => {
	            if (this.settings.enabled && this.settings.immersive && this.hypnoActivated)
	                return false;
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction('ServerSend', 5, (args, next) => {
	            var _a;
	            if (!this.Enabled)
	                return next(args);
	            // Prevent speech at choke level 4
	            if (this.hypnoActivated) {
	                var type = args[0];
	                if (type == "ChatRoomChat" && args[1].Type == "Chat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Content[0]) != "(") {
	                    SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
	                    return null;
	                }
	                return next(args);
	            }
	            return next(args);
	        }, ModuleCategory.Hypno);
	        let lastHornyCheck = 0;
	        let lastCycleCheck = 0;
	        hookFunction('TimerProcess', 1, (args, next) => {
	            var _a;
	            if (ActivityAllowed()) {
	                var now = CommonTime();
	                let triggerTimer = ((_a = this.settings.triggerTime) !== null && _a !== void 0 ? _a : 5) * 60000;
	                let hypnoEnd = this.settings.activatedAt + triggerTimer;
	                let hornyCheck = lastHornyCheck + Math.min((triggerTimer / 100), 30000); // Check for arousal and eyes at least every 30 seconds. More often if hypnosis length is short.
	                if (triggerTimer <= 0)
	                    hornyCheck = lastHornyCheck + 30000;
	                if (this.hypnoActivated && this.settings.triggerTime > 0 && hypnoEnd < now) {
	                    // Hypno Timeout --
	                    this.TriggerRestoreTimeout();
	                }
	                if (this.hypnoActivated && hornyCheck < now) {
	                    lastHornyCheck = now;
	                    this.HypnoHorny();
	                }
	                if (!this.hypnoActivated && (lastCycleCheck + 5000) < now) {
	                    lastCycleCheck = now;
	                    this.CheckNewTrigger();
	                }
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        // Set Trigger
	        if (!this.settings.trigger) {
	            this.settings.trigger = this.getNewTriggerWord();
	            settingsSave();
	        }
	        if (!this.settings.activatedAt) {
	            this.settings.activatedAt = 0;
	            this.settings.recoveredAt = 0;
	            settingsSave();
	        }
	        if (!!this.settings.existingEye1Name)
	            this.ResetEyes();
	    }
	    initializeTriggerWord() {
	        var recycleFromCommon = !this.settings.overrideWords && (!this.settings.trigger || commonWords.indexOf(this.settings.trigger) == -1);
	        if (recycleFromCommon) {
	            this.settings.trigger = this.getNewTriggerWord();
	            settingsSave();
	        }
	        else if (!!this.settings.overrideWords) {
	            var words = this.settings.overrideWords.split(',').filter(word => !!word).map(word => word.toLocaleLowerCase());
	            if (words.indexOf(this.settings.trigger) == -1)
	                this.settings.trigger = this.getNewTriggerWord();
	            settingsSave();
	        }
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Hypno);
	    }
	    get awakeners() {
	        return GetDelimitedList(this.settings.awakeners);
	    }
	    get triggers() {
	        var overrideWords = GetDelimitedList(this.settings.overrideWords);
	        if (overrideWords.length > 0 && !this.settings.enableCycle)
	            return overrideWords;
	        else
	            return [this.settings.trigger];
	    }
	    getNewTriggerWord() {
	        var _a, _b, _c;
	        var currentTrigger = this.settings.trigger;
	        var words = (_b = (_a = GetDelimitedList(this.settings.overrideWords)) === null || _a === void 0 ? void 0 : _a.filter((word, ix, arr) => !!word && arr.indexOf(word) == ix)) !== null && _b !== void 0 ? _b : [];
	        if (words.length <= 0)
	            words = commonWords;
	        if (words.length > 1 && words.indexOf(currentTrigger) > -1)
	            words = words.filter(val => val != currentTrigger);
	        return (_c = words[getRandomInt(words.length)]) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase();
	    }
	    allowedSpeaker(speaker) {
	        var _a, _b;
	        if ((speaker === null || speaker === void 0 ? void 0 : speaker.MemberNumber) == Player.MemberNumber)
	            return false;
	        var memberId = (_a = speaker === null || speaker === void 0 ? void 0 : speaker.MemberNumber) !== null && _a !== void 0 ? _a : 0;
	        var allowedMembers = (_b = GetDelimitedList(this.settings.overrideMemberIds).map(id => +id).filter(id => id > 0)) !== null && _b !== void 0 ? _b : [];
	        if (allowedMembers.length <= 0)
	            return isAllowedMember(speaker);
	        else
	            return allowedMembers.includes(memberId);
	    }
	    BlankOutTriggers(msg) {
	        if (!this.settings.immersive)
	            return msg;
	        let triggers = this.triggers.concat(this.awakeners);
	        triggers.forEach(t => {
	            let tWords = t.split(" ");
	            tWords = tWords.map(tw => {
	                let hashLength = Math.max(3, tw.length) + (getRandomInt(4) - 2);
	                return new Array(hashLength + 1).join('-');
	            });
	            let str = "⚠" + tWords.join(" ") + "⚠";
	            msg = msg.replaceAll(new RegExp("\\b" + escapeRegExp(t) + "\\b", "ig"), str);
	        });
	        return msg;
	    }
	    DelayedTrigger(activityEntry, memberNumber = 0, isSleep = false) {
	        var _a;
	        let entryName = activityEntry.group + "-" + activityEntry.name;
	        setTimeout(() => {
	            let activation = this.delayedActivations.get(entryName);
	            if (!!activation) {
	                activation = Math.max(0, activation - 1);
	                this.delayedActivations.set(entryName, activation);
	            }
	        }, 5 * 60 * 1000);
	        let count = (_a = this.delayedActivations.get(entryName)) !== null && _a !== void 0 ? _a : 0;
	        count++;
	        if (count >= activityEntry.hypnoRequiredRepeats) {
	            if (isSleep) {
	                SendAction("%NAME% quivers with one last attempt to stay awake...");
	                setTimeout(() => { var _a; return (_a = getModule("InjectorModule")) === null || _a === void 0 ? void 0 : _a.Sleep(true); }, 4000);
	            }
	            else {
	                SendAction("%NAME% trembles weakly with one last attempt to maintain %POSSESSIVE% senses...");
	                setTimeout(() => this.StartTriggerWord(false, memberNumber), 4000);
	            }
	            count = 0; // reset repeats
	        }
	        else {
	            let str = isSleep ? this.delayedSleepStrings[getRandomInt(this.delayedSleepStrings.length)] : this.delayedHypnoStrings[getRandomInt(this.delayedHypnoStrings.length)];
	            SendAction(str);
	        }
	        this.delayedActivations.set(entryName, count);
	    }
	    CheckAwakener(msg, sender) {
	        return this._CheckForTriggers(msg, sender, this.awakeners, true);
	    }
	    CheckTrigger(msg, sender) {
	        return this._CheckForTriggers(msg, sender, this.triggers);
	    }
	    _CheckForTriggers(msg, sender, triggers, awakener = false) {
	        // Skip on OOC
	        if (msg.startsWith("(") || !triggers)
	            return false;
	        let matched = triggers.some(trigger => {
	            return isPhraseInString(msg, trigger);
	        });
	        return (matched &&
	            (awakener ? this.hypnoActivated : !this.hypnoActivated) &&
	            this.allowedSpeaker(sender));
	    }
	    IsOnCooldown() {
	        var now = new Date().getTime();
	        if ((now - (this.settings.cooldownTime * 1000)) < this.settings.recoveredAt) {
	            // Triggered during cooldown...
	            if (!this.cooldownMsgSent) {
	                SendAction("%NAME%'s frowns as %PRONOUN% fights to remain conscious.");
	                this.cooldownMsgSent = true;
	            }
	            return true;
	        }
	        return false;
	    }
	    StartTriggerWord(wasWord = true, memberNumber = 0) {
	        if (this.hypnoActivated)
	            return;
	        this.cooldownMsgSent = false;
	        this.settings.hypnotizedBy = memberNumber;
	        this.settings.activatedAt = CommonTime();
	        this.settings.triggerCycled = false;
	        if (!AudioShouldSilenceSound(true))
	            AudioPlaySoundEffect("SciFiEffect", 1);
	        this.hypnoActivated = true;
	        this.settings.stats.hypnotizedCount++;
	        if (wasWord)
	            SendAction("%NAME%'s eyes immediately defocus, %POSSESSIVE% posture slumping slightly as %PRONOUN% loses control of %POSSESSIVE% body at the utterance of a trigger word.");
	        else
	            SendAction("%NAME%'s eyes glaze over, %POSSESSIVE% posture slumping weakly as %PRONOUN% loses control of %POSSESSIVE% body.");
	        this.SetEyes();
	        this.CheckHypnotizedState();
	    }
	    CheckHypnotizedState() {
	        if (this.hypnoActivated) {
	            this.EnforceEyes();
	            setOrIgnoreBlush("Medium");
	            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
	            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	            CharacterSetFacialExpression(Player, "Fluids", "DroolLow");
	            CharacterSetFacialExpression(Player, "Mouth", null);
	        }
	    }
	    SetEyes() {
	        var _a, _b, _c, _d, _e, _f;
	        this.settings.existingEye1Name = (_a = InventoryGet(Player, "Eyes")) === null || _a === void 0 ? void 0 : _a.Asset.Name;
	        this.settings.existingEye1Color = (_b = InventoryGet(Player, "Eyes")) === null || _b === void 0 ? void 0 : _b.Color;
	        this.settings.existingEye2Name = (_c = InventoryGet(Player, "Eyes2")) === null || _c === void 0 ? void 0 : _c.Asset.Name;
	        this.settings.existingEye2Color = (_d = InventoryGet(Player, "Eyes2")) === null || _d === void 0 ? void 0 : _d.Color;
	        this.settings.existingEyeExpression = (_f = (_e = WardrobeGetExpression(Player)) === null || _e === void 0 ? void 0 : _e.Eyes) !== null && _f !== void 0 ? _f : null;
	        settingsSave();
	        this.EnforceEyes();
	    }
	    EnforceEyes() {
	        var _a, _b, _c, _d;
	        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", (_a = "Eyes" + this.settings.hypnoEyeType) !== null && _a !== void 0 ? _a : 9);
	        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", (_b = "Eyes" + this.settings.hypnoEyeType) !== null && _b !== void 0 ? _b : 9);
	        var eyes1 = InventoryGet(Player, "Eyes");
	        var eyes2 = InventoryGet(Player, "Eyes2");
	        if (!!eyes1) {
	            eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
	            eyes1.Color = (_c = this.settings.hypnoEyeColor) !== null && _c !== void 0 ? _c : "#A2A2A2";
	        }
	        if (!!eyes2) {
	            eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
	            eyes2.Color = (_d = this.settings.hypnoEyeColor) !== null && _d !== void 0 ? _d : "#A2A2A2";
	        }
	        ChatRoomCharacterUpdate(Player);
	    }
	    ResetEyes() {
	        var _a, _b, _c;
	        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", (_a = this.settings.existingEye1Name) !== null && _a !== void 0 ? _a : "Eyes5");
	        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", (_b = this.settings.existingEye2Name) !== null && _b !== void 0 ? _b : "Eyes5");
	        var eyes1 = InventoryGet(Player, "Eyes");
	        var eyes2 = InventoryGet(Player, "Eyes2");
	        if (!!eyes1) {
	            eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
	            eyes1.Color = this.settings.existingEye1Color;
	        }
	        if (!!eyes2) {
	            eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
	            eyes2.Color = this.settings.existingEye2Color;
	        }
	        CharacterSetFacialExpression(Player, "Eyes", (_c = this.settings.existingEyeExpression) !== null && _c !== void 0 ? _c : null);
	        ChatRoomCharacterUpdate(Player);
	        this.settings.existingEye1Name = undefined;
	        this.settings.existingEye1Color = undefined;
	        this.settings.existingEye2Name = undefined;
	        this.settings.existingEye2Color = undefined;
	        settingsSave();
	    }
	    TriggerRestoreWord(speaker) {
	        SendAction("%NAME% snaps back into their senses at %OPP_NAME%'s voice.", speaker);
	        this.TriggerRestore();
	    }
	    TriggerRestoreBoop() {
	        SendAction("%NAME% reboots, blinking and gasping as %PRONOUN% regains %POSSESSIVE% senses.");
	        this.TriggerRestore();
	    }
	    TriggerRestoreSnap() {
	        SendAction("%NAME% blinks, shaking %POSSESSIVE% head with confusion as %PRONOUN% regains %POSSESSIVE% senses.");
	        this.TriggerRestore();
	    }
	    TriggerRestoreTimeout() {
	        SendAction("%NAME% gasps, blinking and blushing with confusion.");
	        this.TriggerRestore();
	    }
	    TriggerRestore() {
	        if (!AudioShouldSilenceSound(true))
	            AudioPlaySoundEffect("SpankSkin");
	        this._resetHypno();
	    }
	    _resetHypno() {
	        this.ResetEyes();
	        CharacterSetFacialExpression(Player, "Eyes", null);
	        this.hypnoActivated = false;
	        this.settings.recoveredAt = new Date().getTime();
	        settingsSave(true);
	    }
	    HypnoHorny() {
	        var _a, _b;
	        if (this.hypnoActivated) {
	            // enforce eye expression
	            this.EnforceEyes();
	            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
	            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	            if (this.settings.enableArousal) {
	                var progress = Math.min(99, ((_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) + 5);
	                ActivitySetArousal(Player, progress);
	            }
	        }
	    }
	    CheckNewTrigger() {
	        if (this.hypnoActivated || !this.settings.enableCycle || this.settings.triggerCycled)
	            return;
	        var cycleAtTime = Math.max(this.settings.activatedAt, this.settings.recoveredAt) + (Math.max(1, this.settings.cycleTime || 0) * 60000);
	        if (cycleAtTime < CommonTime())
	            this.RollTriggerWord();
	    }
	    RollTriggerWord() {
	        var newTrigger = this.getNewTriggerWord();
	        if (newTrigger != this.settings.trigger)
	            SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over %POSSESSIVE%.");
	        this.settings.trigger = newTrigger;
	        this.settings.triggerCycled = true;
	        settingsSave();
	    }
	    get hypnoActivated() {
	        return this.settings.hypnotized;
	    }
	    set hypnoActivated(val) {
	        this.settings.hypnotized = val;
	        settingsSave(true);
	    }
	}
	// Trigger Words
	const commonWords = ["able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young"];
	// ****************** Functions *****************
	//let triggerActivated = false;
	//let triggeredBy = 0;

	class GuiCollar extends GuiSubscreen {
	    constructor() {
	        super(...arguments);
	        this.blinkLastTime = 0;
	        this.blinkColor = "Red";
	    }
	    get name() {
	        return "Breathplay";
	    }
	    get icon() {
	        return ICONS.COLLAR;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get multipageStructure() {
	        return [
	            [
	                {
	                    type: "checkbox",
	                    label: "Enable Hand Choking:",
	                    description: "Enables breathplay using \"Choke Neck\" activity. If done repeatedly will cause blackout.",
	                    setting: () => { var _a; return (_a = Player.LSCG.MiscModule.handChokeEnabled) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => Player.LSCG.MiscModule.handChokeEnabled = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Gag Suffocation:",
	                    description: "Enabled breathplay using nose plugs and sufficient gags.",
	                    setting: () => { var _a; return (_a = Player.LSCG.MiscModule.gagChokeEnabled) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => Player.LSCG.MiscModule.gagChokeEnabled = val
	                }, {
	                    type: "checkbox",
	                    label: "Sleep on Passout:",
	                    description: "Will force sleep on passout.",
	                    setting: () => { var _a; return (_a = this.settings.knockout) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.knockout = val
	                }, {
	                    type: "number",
	                    id: "knockoutTime",
	                    label: "Sleep time (minutes):",
	                    description: "How long you will sleep after passout if enabled.",
	                    disabled: !this.settings.knockout,
	                    setting: () => { var _a; return ((_a = this.settings.knockoutMinutes) !== null && _a !== void 0 ? _a : 2); },
	                    setSetting: (val) => this.settings.knockoutMinutes = Math.max(Math.min(val, 10), 1)
	                }
	            ], !this.settings.collarPurchased ? [] :
	                this.settings.locked ? [
	                    {
	                        type: "label",
	                        label: "** Collar Settings Locked **",
	                        description: "Collar Settings Locked Remotely"
	                    }
	                ] : [
	                    {
	                        type: "checkbox",
	                        label: "Enabled:",
	                        description: "Enabled the Choking Collar Features.",
	                        setting: () => { var _a; return (_a = this.settings.enabled) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.enabled = val
	                    }, {
	                        type: "checkbox",
	                        label: "Allow Remote Access:",
	                        description: "Enables Remote Access to Collar Settings.",
	                        setting: () => { var _a; return (_a = this.settings.remoteAccess) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.remoteAccess = val
	                    }, {
	                        type: "checkbox",
	                        label: "Lockable:",
	                        description: "Allowes Remote Access Users to lock you out of these settings.",
	                        setting: () => { var _a; return (_a = this.settings.lockable) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.lockable = val
	                    }, {
	                        type: "checkbox",
	                        label: "Allow Self-Tightening:",
	                        description: "Allow the wearer to tighten their own collar.",
	                        setting: () => { var _a; return (_a = this.settings.allowSelfTightening) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.allowSelfTightening = val
	                    }, {
	                        type: "checkbox",
	                        label: "Allow Self-Loosening:",
	                        description: "Allow the wearer to loosen their own collar.",
	                        setting: () => { var _a; return (_a = this.settings.allowSelfLoosening) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.allowSelfLoosening = val
	                    }, {
	                        type: "text",
	                        id: "collar_allowedMembers",
	                        label: "Allowed Members IDs:",
	                        description: "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.",
	                        setting: () => { var _a, _b, _c; return (_a = this.settings.allowedMembers) !== null && _a !== void 0 ? _a : ((_c = ((_b = Player.Ownership) === null || _b === void 0 ? void 0 : _b.MemberNumber) + "") !== null && _c !== void 0 ? _c : ""); },
	                        setSetting: (val) => this.settings.allowedMembers = val
	                    }, {
	                        type: "checkbox",
	                        label: "Limit to Crafted User:",
	                        description: "Limits collar activation to crafted user and allowed list. If no crafted user will use item permissions.",
	                        setting: () => { var _a; return (_a = this.settings.limitToCrafted) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.limitToCrafted = val
	                    }, {
	                        type: "text",
	                        id: "collar_tightTrigger",
	                        label: "Tighten Trigger:",
	                        description: "Word or phrase that, if spoken, will tighten the collar.",
	                        setting: () => { var _a; return (_a = this.settings.tightTrigger) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.tightTrigger = val
	                    }, {
	                        type: "text",
	                        id: "collar_looseTrigger",
	                        label: "Loosen Trigger:",
	                        description: "Word or phrase that, if spoken, will loosen the collar.",
	                        setting: () => { var _a; return (_a = this.settings.looseTrigger) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.looseTrigger = val
	                    }, {
	                        type: "checkbox",
	                        label: "Immersive:",
	                        description: "Prevents the wearer from viewing triggers via show-triggers.",
	                        setting: () => { var _a; return (_a = this.settings.immersive) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.immersive = val
	                    }, {
	                        type: "checkbox",
	                        label: "Enable Buttons:",
	                        description: "Allows activation of the collar features via buttons (activities & commands).",
	                        setting: () => { var _a; return (_a = this.settings.allowButtons) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.allowButtons = val
	                    }, {
	                        type: "checkbox",
	                        label: "Any Collar:",
	                        description: "If enabled, any collar can trigger and activate.",
	                        setting: () => { var _a; return (_a = this.settings.anyCollar) !== null && _a !== void 0 ? _a : false; },
	                        setSetting: (val) => this.settings.anyCollar = val
	                    }
	                ]
	        ];
	    }
	    Run() {
	        super.Run();
	        if (PreferencePageCurrent == 2) {
	            var prev = MainCanvas.textAlign;
	            if (this.settings.collarPurchased) {
	                if (!this.settings.locked) {
	                    MainCanvas.textAlign = "left";
	                    // Set/Update Collar	 	[Custom??]
	                    let buttonPos = this.structure.length;
	                    let updateDisabled = !this.settings.enabled || this.settings.anyCollar;
	                    DrawText("Update Collar:", this.getXPos(buttonPos), this.getYPos(buttonPos), updateDisabled ? "Gray" : "Black", "Gray");
	                    MainCanvas.textAlign = "center";
	                    DrawButton(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64, "Update", updateDisabled ? "#CCCCCC" : "White", undefined, updateDisabled ? "" : "Update Collar to Current", updateDisabled);
	                    MainCanvas.textAlign = "left";
	                    if (!!this.settings.collar && !this.settings.anyCollar) {
	                        DrawText("Current Name: " + this.settings.collar.name, this.getXPos(buttonPos), this.getYPos(buttonPos) + 60, "Gray", "Gray");
	                        if (!!this.settings.collar.creator && this.settings.collar.creator > 0)
	                            DrawText("Current Crafter: " + this.settings.collar.creator, this.getXPos(buttonPos), this.getYPos(buttonPos) + 110, "Gray", "Gray");
	                    }
	                }
	            }
	            else {
	                MainCanvas.textAlign = "center";
	                if (this.blinkLastTime + 750 < CommonTime()) {
	                    this.blinkLastTime = CommonTime();
	                    this.blinkColor = this.blinkColor == "Gray" ? "Red" : "Gray";
	                }
	                DrawText("Now available:", 1000, 200, "Black", "Black");
	                DrawText("Andrew's Collar Control Module!!", 1000, 250, this.blinkColor, "Black");
	                DrawText("Has your owner sent you shopping for a more controlling collar?", 1000, 350, "Black", "Gray");
	                DrawText("Are you looking for some extra motivation for good behavior?", 1000, 400, "Black", "Gray");
	                DrawText("Act now and secure your Control Module now for the low low price of $500!", 1000, 450, "Black", "Gray");
	                DrawText("Attach this revolutionary new device to your existing collar and it will", 1000, 550, "Gray", "Black");
	                DrawText("enhance it with the ability to tighten and loosen on command!", 1000, 600, "Gray", "Black");
	                DrawText("Let your dom quiet down those bratty moments and reward good behavior!", 1000, 650, "Gray", "Black");
	                DrawButton(800, 740, 400, 80, "Purchase - $500", this.CanAffordCollar() ? "White" : "Pink", undefined, this.CanAffordCollar() ? "Unlock Andrew's Collar Module" : (!Player.Ownership ? "Cannot afford..." : "Too expensive? Ask your owner for help!"), !this.CanAffordCollar());
	                DrawTextFit("- Andrew co.® makes no guarantees as to the behavior of the wearer -", 1000, 900, 600, "Orange", "Gray");
	            }
	            MainCanvas.textAlign = prev;
	        }
	    }
	    Exit() {
	        if (!this.settings.chokeLevel)
	            this.settings.chokeLevel = 0;
	        super.Exit();
	    }
	    Click() {
	        var _a, _b, _c, _d;
	        super.Click();
	        if (PreferencePageCurrent == 2) {
	            if (this.settings.collarPurchased) {
	                if (!this.settings.locked && !this.settings.anyCollar) {
	                    // Update Collar Button
	                    let buttonPos = this.structure.length;
	                    if (MouseIn(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64)) {
	                        var collar = InventoryGet(Player, "ItemNeck");
	                        if (!collar) {
	                            this.message = "No Collar Equipped";
	                        }
	                        else {
	                            this.message = "Collar updated";
	                            this.settings.collar = {
	                                name: (_b = (_a = collar.Craft) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : collar.Asset.Name,
	                                creator: (_d = (_c = collar.Craft) === null || _c === void 0 ? void 0 : _c.MemberNumber) !== null && _d !== void 0 ? _d : 0
	                            };
	                        }
	                    }
	                }
	            }
	            else {
	                if (MouseIn(800, 740, 400, 80) && this.CanAffordCollar()) {
	                    this.PurchaseCollar();
	                }
	            }
	        }
	    }
	    Load() {
	        var _a;
	        // Load up module settings to ensure defaults..
	        (_a = getModule("MiscModule")) === null || _a === void 0 ? void 0 : _a.settings;
	        super.Load();
	    }
	    CanAffordCollar() {
	        return Player.Money >= 500;
	    }
	    PurchaseCollar() {
	        if (!this.CanAffordCollar())
	            return;
	        Player.Money -= 500;
	        this.settings.collarPurchased = true;
	        this.Load();
	        ServerPlayerSync();
	        settingsSave();
	    }
	}

	var PassoutReason;
	(function (PassoutReason) {
	    PassoutReason[PassoutReason["COLLAR"] = 0] = "COLLAR";
	    PassoutReason[PassoutReason["HAND"] = 1] = "HAND";
	    PassoutReason[PassoutReason["PLUGS"] = 2] = "PLUGS";
	})(PassoutReason || (PassoutReason = {}));
	class CollarModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.chokeTimeout = 0;
	        this.chokeTimer = 120000;
	        this.chokeEventTimer = 60010;
	        this.passout1Timer = 30000;
	        this.passout2Timer = 15000;
	        this.passout3Timer = 10000;
	        this.eventInterval = 0;
	        this.handChokeModifier = 0;
	        this.handChokingMember = 0;
	        this.isPluggedUp = false;
	        this.gagSpeechlessLines = [
	            "%NAME%'s mouth moves silently.",
	            "%NAME%'s mouth moves without a sound.",
	            "%NAME%'s whimpers inaudibly, unable to breathe.",
	            "%NAME% groans and convulses.",
	            "%NAME% shudders as %POSSESSIVE% lungs burn."
	        ];
	        this.plugReleaseEmotes = [
	            "%NAME% gasps and gulps for air.",
	            "%NAME%'s lungs expand hungrily as %PRONOUN% gasps in air.",
	            "%NAME% groans as air is allowed back into their lungs.",
	            "%NAME% gasps for air with a whimper."
	        ];
	        this.isPassingOut = false;
	        this.eyesAtTimeOfPassout = null;
	        this.blushAtTimeOfPassout = null;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get Enabled() {
	        return super.Enabled && this.wearingCorrectCollar;
	    }
	    WearingCorrectCollar(C) {
	        var _a, _b, _c, _d, _e, _f;
	        var collar = InventoryGet(C, "ItemNeck");
	        let collarSettings = (_a = C.LSCG) === null || _a === void 0 ? void 0 : _a.CollarModule;
	        if (!collar || !collarSettings || !collarSettings.enabled)
	            return false;
	        if (!collarSettings || !collarSettings.collar.name || collarSettings.anyCollar)
	            return true;
	        // If configured collar is not crafted, let any inherited collar work.
	        if (!collarSettings.collar.creator) {
	            return (collar === null || collar === void 0 ? void 0 : collar.Asset.Name) == collarSettings.collar.name;
	        }
	        else {
	            var collarName = (_c = (_b = collar === null || collar === void 0 ? void 0 : collar.Craft) === null || _b === void 0 ? void 0 : _b.Name) !== null && _c !== void 0 ? _c : ((_d = collar === null || collar === void 0 ? void 0 : collar.Asset.Name) !== null && _d !== void 0 ? _d : "");
	            var collarCreator = (_f = (_e = collar === null || collar === void 0 ? void 0 : collar.Craft) === null || _e === void 0 ? void 0 : _e.MemberNumber) !== null && _f !== void 0 ? _f : -1;
	            return collarName == collarSettings.collar.name && collarCreator == collarSettings.collar.creator;
	        }
	    }
	    get wearingCorrectCollar() {
	        return this.WearingCorrectCollar(Player);
	    }
	    get settingsScreen() {
	        return GuiCollar;
	    }
	    get defaultSettings() {
	        var _a, _b;
	        return {
	            enabled: false,
	            allowedMembers: (_b = ((_a = Player.Ownership) === null || _a === void 0 ? void 0 : _a.MemberNumber) + "") !== null && _b !== void 0 ? _b : "",
	            chokeLevel: 0,
	            tightTrigger: "tight",
	            looseTrigger: "loose",
	            collarPurchased: false,
	            limitToCrafted: false,
	            remoteAccess: false,
	            allowSelfLoosening: false,
	            allowSelfTightening: false,
	            allowButtons: true,
	            anyCollar: false,
	            collar: {},
	            immersive: false,
	            lockable: false,
	            locked: false,
	            knockout: false,
	            knockoutMinutes: 2,
	            stats: {
	                collarPassoutCount: 0,
	                gagPassoutCount: 0,
	                handPassoutCount: 0
	            }
	        };
	    }
	    safeword() {
	        this.handChokeModifier = 0;
	        this.ResetChoke();
	    }
	    load() {
	        OnChat(1, ModuleCategory.Collar, (data, sender, msg, metadata) => {
	            if (!this.Enabled)
	                return;
	            this.CheckForTriggers(msg, sender);
	        });
	        OnAction(6, ModuleCategory.Collar, (data, sender, msg, meta) => {
	            var _a;
	            var target = GetTargetCharacter(data);
	            if (target != Player.MemberNumber)
	                return;
	            if ((msg == "ActionSwap" || msg == "ActionRemove") && ((_a = GetMetadata(data)) === null || _a === void 0 ? void 0 : _a.GroupName) == "ItemNeck") {
	                this.ReleaseCollar();
	            }
	        });
	        hookFunction("InventoryRemove", 1, (args, next) => {
	            let C = args[0];
	            let GroupName = args[1];
	            if (GroupName == "ItemNeck" && C.IsPlayer())
	                this.ReleaseCollar();
	            next(args);
	        }, ModuleCategory.Collar);
	        // Detect if choking member is bound
	        OnAction(6, ModuleCategory.Misc, (data, sender, msg, metadata) => {
	            let meta = GetMetadata(data);
	            let target = meta === null || meta === void 0 ? void 0 : meta.TargetMemberNumber;
	            let targetMember = meta === null || meta === void 0 ? void 0 : meta.TargetCharacter;
	            let groupName = meta === null || meta === void 0 ? void 0 : meta.GroupName;
	            if (!!targetMember && target == this.handChokingMember && msg == "ActionUse") {
	                if (groupName == "ItemHands" || groupName == "ItemArms") {
	                    this.ReleaseHandChoke(targetMember);
	                }
	            }
	            return;
	        });
	        let lastCheckedForGags = 0;
	        hookFunction("TimerProcess", 1, (args, next) => {
	            let now = CommonTime();
	            // Check gags every 10 seconds for any missed change..
	            if (lastCheckedForGags + 10000 < now) {
	                lastCheckedForGags = now;
	                this.CheckGagSuffocate("TimerProcess", null);
	            }
	            return next(args);
	        }, ModuleCategory.Collar);
	        // Check for heavy gag + nose plugs
	        OnAction(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
	            var _a;
	            if (!Player.LSCG.MiscModule.gagChokeEnabled)
	                return;
	            let airwaySlots = ["ItemMouth", "ItemMouth2", "ItemMouth3", "ItemNose"];
	            let messagesToCheck = [
	                "ActionUse",
	                "ActionSwap",
	                "ActionRemove",
	                "DildoPlugGagMouthSet",
	                "PlugGagMouthSet",
	                "PumpGagpumpsTo",
	                "PumpGagdeflatesTo",
	                "ItemMouthFuturisticHarnessBallGagSet",
	                "ItemMouthFuturisticPanelGagSet",
	                "ItemMouthPonyGagSet"
	            ];
	            let target = GetTargetCharacter(data);
	            var targetGroup = (_a = GetMetadata(data)) === null || _a === void 0 ? void 0 : _a.GroupName;
	            if (target == Player.MemberNumber &&
	                (!targetGroup || airwaySlots.indexOf(targetGroup) > -1) &&
	                messagesToCheck.some(x => msg.startsWith(x))) {
	                this.CheckGagSuffocate(msg, sender);
	            }
	            return;
	        });
	        hookBCXCurse("curseTrigger", (evt) => {
	            if (evt.group == "ItemNose")
	                setTimeout(() => {
	                    this.CheckGagSuffocate("CurseUpdate", Player);
	                }, 2000);
	        });
	        // setTimeout(() => {
	        //     window.bcx?.getModApi("LSCG").on?.("curseTrigger", (event) => {
	        //         console.log("I see a curse event!", event);
	        //     })}, 10000);
	        // event on room join
	        hookFunction("ChatRoomSync", 4, (args, next) => {
	            next(args);
	            if (!this.Enabled)
	                return;
	            else
	                this.ReleaseHandChoke(null, false);
	            this.ActivateChokeEvent();
	            this.CheckGagSuffocate("ChatRoomSync", Player);
	        }, ModuleCategory.Collar);
	        hookFunction('ServerSend', 4, (args, next) => {
	            var _a, _b, _c;
	            // if (!this.Enabled && !Player.LSCG.MiscModule.handChokeEnabled)
	            //     return next(args);
	            // Prevent speech at choke level 4
	            if (args[0] == "ChatRoomChat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Type) == "Chat" && !((_c = (_b = args[1]) === null || _b === void 0 ? void 0 : _b.Content) === null || _c === void 0 ? void 0 : _c.startsWith("("))) {
	                if (this.totalChokeLevel >= 4) {
	                    SendAction(this.gagSpeechlessLines[getRandomInt(this.gagSpeechlessLines.length)]);
	                    return null;
	                }
	                else if (this.totalChokeLevel > 1) {
	                    args[1].Content = SpeechGarbleByGagLevel((this.totalChokeLevel - 1) ** 2, args[1].Content);
	                    return next(args);
	                }
	                else
	                    return next(args);
	            }
	            else
	                return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.CanWalk", 2, (args, next) => {
	            if (this.handChokeModifier > 0)
	                return false;
	            return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.HasTints", 5, (args, next) => {
	            var _a;
	            if (this.totalChokeLevel > 2 && ((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return true;
	            return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.GetTints", 5, (args, next) => {
	            var _a;
	            // if (!this.Enabled)
	            //     return next(args);
	            if (!((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return next(args);
	            if (this.totalChokeLevel == 3)
	                return [{ r: 0, g: 0, b: 0, a: 0.2 }];
	            else if (this.totalChokeLevel == 4)
	                return [{ r: 0, g: 0, b: 0, a: 0.6 }];
	            return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.GetBlurLevel", 5, (args, next) => {
	            var _a;
	            // if (!this.Enabled)
	            //     return next(args);
	            if (!((_a = Player.GraphicsSettings) === null || _a === void 0 ? void 0 : _a.AllowBlur))
	                return next(args);
	            if (this.totalChokeLevel == 3)
	                return 2;
	            if (this.totalChokeLevel == 4)
	                return 6;
	            return next(args);
	        }, ModuleCategory.Collar);
	        this.eventInterval = setInterval(() => this.ChokeEvent(), this.chokeEventTimer);
	        if (this.settings.chokeLevel == undefined) {
	            this.settings.chokeLevel = 0;
	            settingsSave();
	        }
	        if (this.settings.chokeLevel > 2) {
	            this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
	        }
	    }
	    run() {
	        this.activities = getModule("ActivityModule");
	        this.activities.AddActivity({
	            Activity: {
	                Name: "CollarTighten",
	                MaxProgress: 90,
	                MaxProgressSelf: 90,
	                Prerequisite: ["UseHands", "ZoneAccessible"]
	            },
	            Targets: [
	                {
	                    Name: "ItemNeck",
	                    SelfAllowed: true,
	                    TargetLabel: "Tighten Collar",
	                    TargetAction: "",
	                    TargetSelfAction: ""
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "IsWearingChokeCollar",
	                    Func: (acting, acted, group) => {
	                        var _a, _b;
	                        if (!((_b = (_a = acted.LSCG) === null || _a === void 0 ? void 0 : _a.CollarModule.allowButtons) !== null && _b !== void 0 ? _b : false))
	                            return false;
	                        return this.WearingCorrectCollar(acted.IsPlayer() ? acted : acted);
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (target === null || target === void 0 ? void 0 : target.IsPlayer())
	                        this.TightenButtonPress(Player);
	                    else if (!!target)
	                        sendLSCGCommand(target, "collar-tighten");
	                }
	            },
	            CustomImage: ICONS.COLLAR
	        });
	        this.activities.AddActivity({
	            Activity: {
	                Name: "CollarLoosen",
	                MaxProgress: 90,
	                MaxProgressSelf: 90,
	                Prerequisite: ["UseHands", "ZoneAccessible", "IsWearingChokeCollar"]
	            },
	            Targets: [
	                {
	                    Name: "ItemNeck",
	                    SelfAllowed: true,
	                    TargetLabel: "Loosen Collar",
	                    TargetAction: "",
	                    TargetSelfAction: ""
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (target === null || target === void 0 ? void 0 : target.IsPlayer())
	                        this.LoosenButtonPress(Player);
	                    else if (!!target)
	                        sendLSCGCommand(target, "collar-loosen");
	                }
	            },
	            CustomImage: ICONS.COLLAR
	        });
	        this.activities.AddActivity({
	            Activity: {
	                Name: "CollarStats",
	                MaxProgress: 10,
	                MaxProgressSelf: 10,
	                Prerequisite: ["UseHands", "ZoneAccessible", "IsWearingChokeCollar"]
	            },
	            Targets: [
	                {
	                    Name: "ItemNeck",
	                    SelfAllowed: true,
	                    TargetLabel: "Collar Stats",
	                    TargetAction: "",
	                    TargetSelfAction: ""
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (target === null || target === void 0 ? void 0 : target.IsPlayer())
	                        this.StatsButtonPress(Player);
	                    else if (!!target)
	                        sendLSCGCommand(target, "collar-stats");
	                }
	            },
	            CustomImage: ICONS.COLLAR
	        });
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Collar);
	    }
	    // Choke Collar Code
	    get allowedChokeMembers() {
	        let stringList = GetDelimitedList(this.settings.allowedMembers);
	        let memberList = stringList.filter(str => !!str && (+str === +str)).map(str => parseInt(str)).filter(id => id != Player.MemberNumber);
	        if (this.settings.limitToCrafted && this.settings.collar.creator >= 0)
	            memberList.push(this.settings.collar.creator);
	        return memberList;
	    }
	    get totalChokeLevel() {
	        if (this.isPluggedUp)
	            return 4;
	        else
	            return Math.min(this.settings.chokeLevel + this.handChokeModifier, 4);
	    }
	    CheckGagSuffocate(msg, sender) {
	        if (!Player.LSCG.MiscModule.gagChokeEnabled)
	            return;
	        var chokeThreshold = 8;
	        var gaspThreshold = 5;
	        // slightly lower threshold for pump and pony gag to choke at max level...
	        if (msg.indexOf("PumpGag") > -1 || msg.indexOf("ItemMouthPonyGag") > -1) {
	            chokeThreshold = 7;
	        }
	        let gagLevel = SpeechGetTotalGagLevel(Player, true);
	        if ((gagLevel >= chokeThreshold && this.IsNosePlugged ||
	            (msg.indexOf("PumpGagpumpsTo") > -1 && gagLevel >= 7))) { // allow lower threshold for pump gag, letting it choke when full.
	            if (!this.isPassingOut) {
	                if (msg.indexOf("PumpInflate") > -1) {
	                    SendAction("%NAME%'s eyes widen as %POSSESSIVE% gag inflates to completely fill %POSSESSIVE% throat.");
	                }
	                this.isPluggedUp = true;
	                this.StartPassout(PassoutReason.PLUGS, sender, 125000); // just over 2 minutes to choke out
	            }
	        }
	        else if (this.isPluggedUp) {
	            if (this.isPassingOut && this.settings.chokeLevel < 4)
	                this.ResetPlugs();
	            else if (gagLevel >= gaspThreshold && this.IsNosePlugged)
	                SendAction("%NAME% splutters and gasps for air around %POSSESSIVE% gag.");
	            this.isPluggedUp = false;
	        }
	    }
	    get IsNosePlugged() {
	        var item = InventoryGet(Player, "ItemNose");
	        if (!item)
	            return false;
	        if (item.Asset.Name == "NosePlugs") {
	            if (!item.Craft)
	                return true;
	            else {
	                var name = item.Craft.Name;
	                var description = item.Craft.Description;
	                var totalString = name + " | " + description;
	                return !isPhraseInString(totalString, "breathable");
	            }
	        }
	        else {
	            return false;
	        }
	    }
	    setChokeTimeout(f, delay) {
	        clearTimeout(this.chokeTimeout);
	        if (typeof f === "string")
	            this.chokeTimeout = setTimeout(f, delay);
	        else
	            this.chokeTimeout = setTimeout(() => f(), delay);
	    }
	    HandChoke(chokingMember) {
	        var _a;
	        if (this.handChokeModifier >= 4 || !Player.LSCG.MiscModule.handChokeEnabled)
	            return;
	        this.handChokingMember = (_a = chokingMember.MemberNumber) !== null && _a !== void 0 ? _a : 0;
	        this.handChokeModifier = Math.min(this.handChokeModifier + 1, 4);
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        switch (this.totalChokeLevel) {
	            case 1:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME%'s eyes flutter as %OPP_NAME% wraps their hand around %POSSESSIVE% neck.", chokingMember);
	                setOrIgnoreBlush("Low");
	                CharacterSetFacialExpression(Player, "Eyes", "Sad");
	                break;
	            case 2:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% gasps for air as %OPP_NAME% tightens their grip on %POSSESSIVE% neck.", chokingMember);
	                setOrIgnoreBlush("Medium");
	                CharacterSetFacialExpression(Player, "Eyes", "Surprised");
	                break;
	            case 3:
	                SendAction("%NAME%'s face runs flush, choking as %OPP_NAME% presses firmly against their neck, barely allowing any air to %POSSESSIVE% lungs.", chokingMember);
	                setOrIgnoreBlush("High");
	                CharacterSetFacialExpression(Player, "Eyes", "Scared");
	                break;
	            case 4:
	                this.StartPassout(PassoutReason.HAND, chokingMember, 30000);
	                break;
	            default:
	                break;
	        }
	    }
	    ReleaseHandChoke(chokingMember, showEmote = true) {
	        if (this.handChokeModifier > 0) {
	            if (!!chokingMember && showEmote)
	                SendAction("%NAME% gasps in relief as %OPP_NAME% releases their pressure on %POSSESSIVE% neck.", chokingMember);
	            this.handChokeModifier = 0;
	            if (this.totalChokeLevel < 4) {
	                clearTimeout(this.chokeTimeout);
	                this.isPassingOut = false;
	            }
	            // If collar still tight, wait 2 seconds and ping an event as a "helpful" reminder
	            if (this.settings.chokeLevel > 0 && showEmote)
	                setTimeout(() => this.ChokeEvent(), 2000);
	        }
	    }
	    ForceReleasePlugs() {
	        InventoryRemove(Player, "ItemNose");
	        this.isPluggedUp = false;
	        ChatRoomCharacterUpdate(Player);
	    }
	    AllowedMember(member, isTighten) {
	        var _a;
	        if (!member)
	            return false;
	        // If self-triggered, check appropriate settings
	        if (member.IsPlayer()) {
	            if (isTighten && this.settings.allowSelfTightening)
	                return true;
	            else if (!isTighten && this.settings.allowSelfLoosening)
	                return true;
	            else
	                return false;
	        }
	        if (this.allowedChokeMembers.length > 0)
	            return this.allowedChokeMembers.indexOf((_a = member.MemberNumber) !== null && _a !== void 0 ? _a : 0) >= 0;
	        else
	            return ServerChatRoomGetAllowItem(member, Player);
	    }
	    CheckForTriggers(msg, sender) {
	        // Skip on invalid sender, OOC, or invalid triggers.
	        if (!this.settings.tightTrigger || !this.settings.looseTrigger)
	            return;
	        let tightTriggers = GetDelimitedList(this.settings.tightTrigger);
	        let looseTriggers = GetDelimitedList(this.settings.looseTrigger);
	        if (tightTriggers.some(trig => isPhraseInString(msg, trig)) && this.AllowedMember(sender, true))
	            this.IncreaseCollarChoke();
	        else if (looseTriggers.some(trig => isPhraseInString(msg, trig)) && this.AllowedMember(sender, false))
	            this.DecreaseCollarChoke();
	    }
	    IncreaseCollarChoke() {
	        if (isNaN(this.settings.chokeLevel))
	            this.settings.chokeLevel = 0;
	        if (this.settings.chokeLevel == 4)
	            return;
	        this.settings.chokeLevel = Math.min(this.settings.chokeLevel + 1, 4);
	        if (!AudioShouldSilenceSound(true))
	            AudioPlaySoundEffect("HydraulicLock");
	        this.IncreaseArousal();
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        switch (this.totalChokeLevel) {
	            case 1:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME%'s eyes flutter as %POSSESSIVE% collar starts to tighten around %POSSESSIVE% neck with a quiet hiss.");
	                setOrIgnoreBlush("Low");
	                CharacterSetFacialExpression(Player, "Eyes", "Sad");
	                break;
	            case 2:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% gasps for air as %POSSESSIVE% collar presses in around %POSSESSIVE% neck with a hiss.");
	                setOrIgnoreBlush("Medium");
	                CharacterSetFacialExpression(Player, "Eyes", "Surprised");
	                break;
	            case 3:
	                this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
	                SendAction("%NAME%'s face runs flush, choking as %POSSESSIVE% collar hisses, barely allowing any air to %POSSESSIVE% lungs.");
	                setOrIgnoreBlush("High");
	                CharacterSetFacialExpression(Player, "Eyes", "Scared");
	                break;
	            case 4:
	                this.StartPassout();
	                break;
	            default:
	                break;
	        }
	        settingsSave(true);
	    }
	    DecreaseCollarChoke() {
	        if (this.settings.chokeLevel <= 0) {
	            this.settings.chokeLevel = 0;
	            return;
	        }
	        this.isPassingOut = false;
	        if (!AudioShouldSilenceSound(true))
	            AudioPlaySoundEffect("Deflation");
	        this.settings.chokeLevel--;
	        if (this.settings.chokeLevel > 0)
	            this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
	        switch (this.totalChokeLevel) {
	            case 3:
	                this.setChokeTimeout(() => this.DecreaseCollarChoke(), this.chokeTimer);
	                SendAction("%NAME% chokes and gasps desperately as %POSSESSIVE% collar slowly releases some pressure.");
	                setOrIgnoreBlush("High");
	                CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	                break;
	            case 2:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME%'s collar opens a little as %PRONOUN% lets out a moan, gulping for air.");
	                setOrIgnoreBlush("Medium");
	                CharacterSetFacialExpression(Player, "Eyes", "Sad");
	                break;
	            case 1:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% whimpers thankfully as %POSSESSIVE% collar reduces most of its pressure around %POSSESSIVE% neck.");
	                setOrIgnoreBlush("Low");
	                CharacterSetFacialExpression(Player, "Eyes", null);
	                break;
	            case 0:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% takes a deep breath as %POSSESSIVE% collar releases its grip with a hiss.");
	                setOrIgnoreBlush(null);
	                break;
	            default:
	                break;
	        }
	        settingsSave(true);
	    }
	    ReleaseCollar() {
	        if (this.settings.chokeLevel > 0)
	            SendAction("%NAME% gulps thankfully as the threat to %POSSESSIVE% airway is removed.");
	        this.ResetChoke();
	    }
	    ResetChoke() {
	        this.settings.chokeLevel = 0;
	        clearTimeout(this.chokeTimeout);
	        this.isPassingOut = false;
	        settingsSave(true);
	    }
	    ResetPlugs() {
	        CharacterSetFacialExpression(Player, "Eyes", this.eyesAtTimeOfPassout);
	        CharacterSetFacialExpression(Player, "Blush", this.blushAtTimeOfPassout);
	        clearTimeout(this.chokeTimeout);
	        this.isPassingOut = false;
	        SendAction(this.plugReleaseEmotes[getRandomInt(this.plugReleaseEmotes.length)]);
	    }
	    StartPassout(reason = PassoutReason.COLLAR, chokingMember = null, totalTime = 60000) {
	        var _a, _b, _c, _d;
	        //console.info("Start Passout, " + totalTime + "ms total time. Date.now() = " + Date.now());
	        this.passout1Timer = totalTime * .5; // -- 1/4 of the total tiem in stage 1
	        this.passout2Timer = totalTime * .3; // -- 3/10 of the total tiem in stage 1
	        this.passout3Timer = totalTime * .2; // -- 1/5 of the total tiem in stage 1
	        //console.info("Timer1 = " + this.passout1Timer + " Timer2 = " + this.passout2Timer + " Timer3 = " + this.passout3Timer);
	        this.isPassingOut = true;
	        setOrIgnoreBlush("VeryHigh");
	        this.eyesAtTimeOfPassout = (_b = (_a = WardrobeGetExpression(Player)) === null || _a === void 0 ? void 0 : _a.Eyes) !== null && _b !== void 0 ? _b : null;
	        this.blushAtTimeOfPassout = (_d = (_c = WardrobeGetExpression(Player)) === null || _c === void 0 ? void 0 : _c.Blush) !== null && _d !== void 0 ? _d : null;
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        this.setChokeTimeout(() => this.Passout1(reason, chokingMember), this.passout1Timer);
	        if (reason == PassoutReason.COLLAR)
	            SendAction("%NAME%'s eyes start to roll back, gasping and choking as %POSSESSIVE% collar presses in tightly and completely with a menacing hiss.");
	        else if (reason == PassoutReason.HAND)
	            SendAction("%NAME%'s eyes start to roll back with a groan as %OPP_NAME% completely closes %POSSESSIVE% airway with their hand.", chokingMember);
	        else if (reason == PassoutReason.PLUGS)
	            SendAction("%NAME%'s eyes flutter with a groan, unable to get any air to %POSSESSIVE% lungs.");
	    }
	    Passout1(reason = PassoutReason.COLLAR, chokingMember = null) {
	        //console.info("Stage 2, timeout = " + this.passout1Timer + " Date.now() = " + Date.now());
	        this.IncreaseArousal();
	        setOrIgnoreBlush("Extreme");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
	        this.setChokeTimeout(() => this.Passout2(reason, chokingMember), this.passout2Timer);
	        if (reason == PassoutReason.COLLAR)
	            SendAction("%NAME% chokes and spasms, %POSSESSIVE% collar holding tight.");
	        else if (reason == PassoutReason.HAND)
	            SendAction("%NAME% chokes and spasms, %OPP_NAME% gripping %POSSESSIVE% throat relentlessly.", chokingMember);
	        else if (reason == PassoutReason.PLUGS)
	            SendAction("%NAME% chokes and spasms, struggling in their gag.");
	    }
	    Passout2(reason = PassoutReason.COLLAR, chokingMember = null) {
	        //console.info("Stage 3, timeout = " + this.passout2Timer + " Date.now() = " + Date.now());
	        this.IncreaseArousal();
	        setOrIgnoreBlush("ShortBreath");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
	        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
	        this.setChokeTimeout(() => this.Passout3(reason, chokingMember), this.passout3Timer);
	        if (reason == PassoutReason.COLLAR) {
	            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as the collar hisses impossibly tighter.");
	            if (!AudioShouldSilenceSound(true))
	                AudioPlaySoundEffect("HydraulicLock");
	        }
	        else if (reason == PassoutReason.HAND)
	            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as %OPP_NAME% clenches around their throat even tighter.", chokingMember);
	        else if (reason == PassoutReason.PLUGS)
	            SendAction("%NAME% convulses weakly with a moan, %POSSESSIVE% eyes rolling back as their lungs scream for air.");
	    }
	    Passout3(reason = PassoutReason.COLLAR, chokingMember = null) {
	        //console.info("Stage 4, timeout = " + this.passout3Timer + " Date.now() = " + Date.now());
	        this.IncreaseArousal();
	        this.isPassingOut = false;
	        CharacterSetFacialExpression(Player, "Blush", "Medium");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Closed");
	        CharacterSetFacialExpression(Player, "Mouth", "Closed");
	        clearTimeout(this.chokeTimeout);
	        if (reason == PassoutReason.COLLAR) {
	            SendAction("As %NAME% collapses unconscious, %POSSESSIVE% collar releases all of its pressure with a long hiss.");
	            if (!AudioShouldSilenceSound(true))
	                AudioPlaySoundEffect("Deflation");
	            this.ResetChoke();
	            this.settings.stats.collarPassoutCount++;
	        }
	        else if (reason == PassoutReason.HAND) {
	            SendAction("As %NAME% collapses unconscious, %OPP_NAME% releases %POSSESSIVE% neck.", chokingMember);
	            if (!!chokingMember)
	                getModule("ActivityModule").DoEscape(chokingMember);
	            else
	                this.ReleaseHandChoke(chokingMember);
	            this.settings.stats.handPassoutCount++;
	        }
	        else if (reason == PassoutReason.PLUGS) {
	            SendAction("As %NAME% slumps unconscious, %POSSESSIVE% nose plugs fall out.");
	            this.ForceReleasePlugs();
	            this.settings.stats.gagPassoutCount++;
	        }
	        if (this.settings.knockout)
	            this.Knockout();
	        settingsSave();
	    }
	    Knockout() {
	        var _a;
	        var injector = getModule("InjectorModule");
	        injector.Sleep(false);
	        setTimeout(() => {
	            if (injector.sedativeLevel <= 0)
	                injector.Wake();
	        }, 60000 * ((_a = this.settings.knockoutMinutes) !== null && _a !== void 0 ? _a : 2)); // Sleep for 2 minutes after passout
	    }
	    ChokeEvent() {
	        if (!this.Enabled)
	            return;
	        // only activate 1/4 times triggered unless at high level
	        if (this.settings.chokeLevel > 2)
	            this.ActivateChokeEvent();
	        else if (this.settings.chokeLevel == 2 && getRandomInt(8) == 0)
	            this.ActivateChokeEvent();
	        else if (this.settings.chokeLevel == 1 && getRandomInt(15) == 0)
	            this.ActivateChokeEvent();
	    }
	    ActivateChokeEvent() {
	        const ChokeEvents = {
	            low: [
	                "%NAME% coughs as %POSSESSIVE% collar pushes against %POSSESSIVE% throat.",
	                "%NAME% gulps as %PRONOUN% feels the tight collar around %POSSESSIVE% neck.",
	                "%NAME% shifts nervously in %POSSESSIVE% tight collar.",
	                "%NAME% trembles, very conscious of the tight collar around %POSSESSIVE% neck.",
	                "%NAME% huffs uncomfortably in %POSSESSIVE% tight collar."
	            ],
	            mid: [
	                "%NAME% whimpers pleadingly as %PRONOUN% struggles to take a full breath.",
	                "%NAME% chokes against %POSSESSIVE% collar, moaning softly.",
	                "%NAME%'s eyes flutter weakly as %POSSESSIVE% collar presses into %POSSESSIVE% neck.",
	                "%NAME% tries to focus on breathing, each inhale an effort in %POSSESSIVE% collar."
	            ],
	            high: [
	                "%NAME% splutters and chokes, struggling to breathe.",
	                "%NAME% grunts and moans, straining to breathe.",
	                "%NAME%'s eyes have trouble focusing, as %PRONOUN% chokes and gets lightheaded."
	            ]
	        };
	        switch (this.settings.chokeLevel) {
	            case 1:
	                SendAction(ChokeEvents.low[getRandomInt(ChokeEvents.low.length)]);
	                break;
	            case 2:
	                SendAction(ChokeEvents.mid[getRandomInt(ChokeEvents.mid.length)]);
	                break;
	            case 3:
	                SendAction(ChokeEvents.high[getRandomInt(ChokeEvents.high.length)]);
	                break;
	            default:
	                break;
	        }
	    }
	    IncreaseArousal() {
	        var _a, _b;
	        ActivitySetArousal(Player, Math.min(99, ((_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) + 10));
	    }
	    _collarPressButton(sender, allowed, action) {
	        if (!this.settings.allowButtons) {
	            LSCG_SendLocal("Collar buttons disabled.", 8000);
	            return;
	        }
	        let playerName = CharacterNickname(Player);
	        let name = CharacterNickname(sender);
	        let possessive = CharacterPronoun(sender, "Possessive", false);
	        let isSelf = sender.IsPlayer();
	        if (sender.IsRestrained())
	            sender.IsPlayer() ?
	                SendAction(`${name} struggles in ${possessive} bindings, unable to reach ${possessive} collar's controls.`) :
	                SendAction(`${name} struggles in ${possessive} bindings, unable to reach ${playerName}'s collar controls.`);
	        else {
	            isSelf ? SendAction(`${name} presses a button on ${possessive} collar.`) : SendAction(`${name} presses a button on ${playerName}'s collar.`);
	            setTimeout(() => {
	                if (!allowed(sender))
	                    SendAction(`${playerName}'s collar beeps and a computerized voice says "Access Denied."`);
	                else
	                    action();
	            }, 1500);
	        }
	    }
	    TightenButtonPress(sender) {
	        this._collarPressButton(sender, c => this.AllowedMember(c, true), () => this.IncreaseCollarChoke());
	    }
	    LoosenButtonPress(sender) {
	        this._collarPressButton(sender, c => this.AllowedMember(c, false), () => this.DecreaseCollarChoke());
	    }
	    StatsButtonPress(sender) {
	        this._collarPressButton(sender, c => c.IsPlayer() || this.AllowedMember(c, false), () => {
	            let tightenTrigger = GetDelimitedList(this.settings.tightTrigger);
	            let loosenTrigger = GetDelimitedList(this.settings.looseTrigger);
	            let chokeCount = this.settings.stats.collarPassoutCount;
	            let remoteAccess = "ENABLED";
	            if (!this.settings.remoteAccess)
	                remoteAccess = "DISABLED";
	            else if (this.settings.limitToCrafted || this.allowedChokeMembers.length > 0)
	                remoteAccess = "LIMITED";
	            SendAction(`%NAME%'s collar chimes and a computerized voice reads out:\nCurrent Level: ${this.settings.chokeLevel}...\nCorrective Cycles: ${chokeCount}...\nTighten Trigger: '${tightenTrigger}'...\nLoosen Trigger: '${loosenTrigger}'...\nRemote Access: ${remoteAccess}...`);
	        });
	    }
	}

	class BoopsModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.boops = 0;
	        this.boopShutdown = false;
	        this.boopDecreaseLoop = 0;
	        this.boopActivitied = [
	            "ChatOther-ItemNose-Pet",
	            "ChatOther-ItemNose-LSCG_SharkBite"
	        ];
	        this.normalBoopReactions = [
	            "%NAME% wiggles %POSSESSIVE% nose.",
	            "%NAME% wiggles %POSSESSIVE% nose with a small frown.",
	            "%NAME% sneezes in surprise.",
	            "%NAME% looks crosseyed at %POSSESSIVE% nose.",
	            "%NAME% wiggles %POSSESSIVE% nose with a squeak.",
	            "%NAME% meeps!"
	        ];
	        this.protestBoopReactions = [
	            "%NAME% swats at %OPP_NAME%'s hand.",
	            "%NAME% covers %POSSESSIVE% nose protectively, squinting at %OPP_NAME%.",
	            "%NAME% snatches %OPP_NAME%'s booping finger."
	        ];
	        this.bigProtestBoopReactions = [
	            "%NAME%'s nose overloads and shuts down."
	        ];
	        this.boundBoopReactions = [
	            "%NAME% struggles in %POSSESSIVE% bindings, huffing.",
	            "%NAME% frowns and squirms in %POSSESSIVE% bindings.",
	            "%NAME% whimpers in %POSSESSIVE% bondage.",
	            "%NAME% groans helplessly.",
	            "%NAME% whines and wiggles in %POSSESSIVE% bondage."
	        ];
	    }
	    // Disabled as it's managed via General
	    // get settingsScreen(): Subscreen | null {
	    //     return GuiBoops;
	    // }
	    get defaultSettings() {
	        return {
	            enabled: false
	        };
	    }
	    load() {
	        OnActivity(1, ModuleCategory.Boops, (data, sender, msg, metadata) => {
	            if (!this.Enabled)
	                return;
	            let target = GetTargetCharacter(data);
	            if (!!target &&
	                target == Player.MemberNumber &&
	                this.boopActivitied.indexOf(data.Content) > -1 &&
	                !IsIncapacitated()) {
	                this.BoopReact(sender === null || sender === void 0 ? void 0 : sender.MemberNumber);
	            }
	        });
	        this.boopDecreaseLoop = setInterval(() => {
	            if (this.boops > 0)
	                this.boops--;
	        }, 5000);
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Boops);
	        clearInterval(this.boopDecreaseLoop);
	    }
	    BoopReact(booperId) {
	        if (this.boopShutdown || !booperId)
	            return;
	        let booper = ChatRoomCharacter.find(c => c.MemberNumber == booperId);
	        if (!booper)
	            return;
	        this.boops++;
	        if (this.boops >= 5)
	            this.BigProtestBoopReact(booper);
	        else if (this.boops >= 3)
	            this.ProtestBoopReact(booper);
	        else
	            this.NormalBoopReact();
	    }
	    NormalBoopReact() {
	        setOrIgnoreBlush("Low");
	        SendAction(this.normalBoopReactions[getRandomInt(this.normalBoopReactions.length)]);
	    }
	    ProtestBoopReact(booper) {
	        // CharacterSetFacialExpression(Player, "Eyes", "Daydream");
	        setOrIgnoreBlush("Medium");
	        if (Player.IsRestrained())
	            SendAction(this.boundBoopReactions[getRandomInt(this.boundBoopReactions.length)]);
	        else
	            SendAction(this.protestBoopReactions[getRandomInt(this.protestBoopReactions.length)], booper);
	    }
	    BigProtestBoopReact(booper) {
	        // CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
	        setOrIgnoreBlush("High");
	        SendAction(this.bigProtestBoopReactions[getRandomInt(this.bigProtestBoopReactions.length)]);
	        this.boopShutdown = true;
	        setTimeout(() => this.boopShutdown = false, 30000);
	    }
	}

	class MiscModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.lastChecked = 0;
	        this.chroloBlockStrings = [
	            "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
	            "%NAME% takes another deep breath through %POSSESSIVE% gag...",
	            "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
	            "%NAME% moans softly and relaxes..."
	        ];
	        this.chloroEventInterval = 0;
	        this.eyesInterval = 0;
	        this.passoutTimer = 0;
	        this.awakenTimeout = 0;
	        this._isChloroformed = false;
	        this.chloroformWearingOff = false;
	    }
	    get settings() {
	        return super.settings;
	    }
	    // Disabled as it's managed via General
	    // get settingsScreen(): Subscreen | null {
	    //     return GuiMisc;
	    // }
	    get defaultSettings() {
	        return {
	            enabled: true,
	            chloroformEnabled: false,
	            immersiveChloroform: false,
	            chloroformedAt: 0,
	            chloroformPotencyTime: 60 * 60 * 1000,
	            infiniteChloroformPotency: false,
	            handChokeEnabled: false,
	            gagChokeEnabled: false
	        };
	    }
	    safeword() {
	        this._removeChloroform();
	    }
	    load() {
	        // Kneel on lap sit
	        OnActivity(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
	            let target = GetTargetCharacter(data);
	            if (!!target &&
	                (sender === null || sender === void 0 ? void 0 : sender.MemberNumber) == Player.MemberNumber &&
	                data.Content == "ChatOther-ItemLegs-Sit" &&
	                CharacterCanChangeToPose(Player, "Kneel")) {
	                CharacterSetActivePose(Player, "Kneel");
	            }
	        });
	        // Blur while edged
	        hookFunction("Player.GetBlurLevel", 1, (args, next) => {
	            var _a, _b, _c, _d, _e, _f, _g;
	            if (!((_a = Player.GraphicsSettings) === null || _a === void 0 ? void 0 : _a.AllowBlur))
	                return next(args);
	            if (Player.IsEdged() && Player.LSCG.GlobalModule.edgeBlur) {
	                if (((_c = (_b = Player.ArousalSettings) === null || _b === void 0 ? void 0 : _b.Progress) !== null && _c !== void 0 ? _c : 0) > 90)
	                    return 6;
	                else if (((_e = (_d = Player.ArousalSettings) === null || _d === void 0 ? void 0 : _d.Progress) !== null && _e !== void 0 ? _e : 0) > 75)
	                    return 4;
	                else if (((_g = (_f = Player.ArousalSettings) === null || _f === void 0 ? void 0 : _f.Progress) !== null && _g !== void 0 ? _g : 0) > 50)
	                    return 1;
	            }
	            return next(args);
	        }, ModuleCategory.Misc);
	        // Set Chloroform'd state
	        OnAction(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
	            var _a, _b, _c;
	            if (!this.settings.chloroformEnabled)
	                return;
	            let meta = GetMetadata(data);
	            var target = meta === null || meta === void 0 ? void 0 : meta.TargetMemberNumber;
	            if (target != Player.MemberNumber)
	                return;
	            if (msg == "ActionSwap") {
	                if (((_a = data.Dictionary[3]) === null || _a === void 0 ? void 0 : _a.AssetName) == "ChloroformCloth" && !this.IsWearingChloroform()) {
	                    this.RemoveChloroform();
	                }
	                else if (((_b = data.Dictionary[4]) === null || _b === void 0 ? void 0 : _b.AssetName) == "ChloroformCloth" && this.NumberChloroform() == 1) {
	                    this.AddChloroform(sender);
	                }
	                return;
	            }
	            var isChloroformAction = ((_c = data.Dictionary[3]) === null || _c === void 0 ? void 0 : _c.AssetName) == "ChloroformCloth";
	            if (isChloroformAction) {
	                if (msg == "ActionUse" && this.NumberChloroform() == 1) {
	                    this.AddChloroform(sender);
	                }
	                else if (msg == "ActionRemove" && !this.IsWearingChloroform()) {
	                    this.RemoveChloroform();
	                }
	            }
	        });
	        // Set chloroform'd state on room join
	        hookFunction("ChatRoomSync", 4, (args, next) => {
	            next(args);
	            if (!this.settings.chloroformEnabled) {
	                return;
	            }
	            this.isChloroformed = this.IsWearingChloroform();
	            if (this.isChloroformed) {
	                this.SetSleepExpression();
	                this.ActivateChloroEvent();
	                if (Player.CanKneel()) {
	                    this.FallDownIfPossible();
	                    addCustomEffect(Player, "ForceKneel");
	                }
	            }
	        }, ModuleCategory.Misc);
	        // Block activity while choloform'd
	        hookFunction('ServerSend', 5, (args, next) => {
	            var _a, _b, _c;
	            if (!this.settings.chloroformEnabled)
	                return next(args);
	            if (this.isChloroformed && this.settings.immersiveChloroform) {
	                var type = args[0];
	                // Prevent speech while chloroformed
	                if ((type == "ChatRoomChat" && args[1].Type == "Chat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Content[0]) != "(")) {
	                    this.ActivateChloroEvent();
	                    this.SetSleepExpression();
	                    return null;
	                    // Prevent changing eye expression while chloroformed
	                }
	                else if (type == "ChatRoomCharacterExpressionUpdate" && (((_b = args[1]) === null || _b === void 0 ? void 0 : _b.Group) == "Eyes" || ((_c = args[1]) === null || _c === void 0 ? void 0 : _c.Group) == "Eyes2")) {
	                    this.SetSleepExpression();
	                    return null;
	                }
	                return next(args);
	            }
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('Player.CanChangeOwnClothes', 1, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
	                return false;
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('Player.IsDeaf', 1, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
	                return true;
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('Player.IsBlind', 1, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
	                return true;
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('Player.CanWalk', 1, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
	                return false;
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('ChatRoomCanAttemptStand', 1, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this.isChloroformed)
	                return false;
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
	            if (this.settings.chloroformEnabled && this.settings.immersiveChloroform && this._isChloroformed) {
	                LSCG_SendLocal("Character access blocked while immersively chloroformed.", 5000);
	                return;
	            }
	            return next(args);
	        }, ModuleCategory.Misc);
	        hookFunction("TimerProcess", 1, (args, next) => {
	            let now = CommonTime();
	            if (!this.settings.infiniteChloroformPotency && this.lastChecked + 10000 < now) {
	                this.lastChecked = now;
	                if (this.isChloroformed && this.settings.chloroformedAt + this.settings.chloroformPotencyTime < now && !this.chloroformWearingOff)
	                    this.ChloroformWearOff();
	            }
	            return next(args);
	        }, ModuleCategory.Misc);
	    }
	    InitStates() {
	        if (Player.CanKneel()) {
	            this.FallDownIfPossible();
	            addCustomEffect(Player, "ForceKneel");
	        }
	    }
	    set isChloroformed(value) {
	        clearInterval(this.chloroEventInterval);
	        if (value) {
	            this.SetSleepExpression();
	            this.chloroEventInterval = setInterval(() => {
	                this.ChloroEvent();
	            }, 60010);
	        }
	        this._isChloroformed = value;
	    }
	    get isChloroformed() {
	        return this._isChloroformed;
	    }
	    ChloroEvent() {
	        if (!this.isChloroformed)
	            return;
	        // only activate on average once every 10 minutes
	        else if (getRandomInt(10) == 0)
	            this.ActivateChloroEvent();
	    }
	    ActivateChloroEvent() {
	        SendAction(this.chroloBlockStrings[getRandomInt(this.chroloBlockStrings.length)]);
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Misc);
	    }
	    IsWearingChloroform() {
	        var _a, _b, _c;
	        return [
	            (_a = InventoryGet(Player, "ItemMouth")) === null || _a === void 0 ? void 0 : _a.Asset.Name,
	            (_b = InventoryGet(Player, "ItemMouth2")) === null || _b === void 0 ? void 0 : _b.Asset.Name,
	            (_c = InventoryGet(Player, "ItemMouth3")) === null || _c === void 0 ? void 0 : _c.Asset.Name
	        ].some(item => item == "ChloroformCloth");
	    }
	    NumberChloroform() {
	        var _a, _b, _c;
	        return [
	            (_a = InventoryGet(Player, "ItemMouth")) === null || _a === void 0 ? void 0 : _a.Asset.Name,
	            (_b = InventoryGet(Player, "ItemMouth2")) === null || _b === void 0 ? void 0 : _b.Asset.Name,
	            (_c = InventoryGet(Player, "ItemMouth3")) === null || _c === void 0 ? void 0 : _c.Asset.Name
	        ].filter(item => item == "ChloroformCloth").length;
	    }
	    AddChloroform(sender) {
	        if (this.chloroformWearingOff) {
	            SendAction("%NAME%'s muscles slump limply once more as another dose of chloroform is applied.");
	            this.chloroformWearingOff = false;
	            this.isChloroformed = true;
	            this.settings.chloroformedAt = CommonTime();
	            clearTimeout(this.awakenTimeout);
	            settingsSave();
	        }
	        else {
	            if (!this.isChloroformed)
	                SendAction("%NAME% eyes go wide as the sweet smell of ether fills %POSSESSIVE% nostrils.");
	            else
	                SendAction("%NAME% slumps back in %POSSESSIVE% sleep as another dose of ether assails %POSSESSIVE% senses.");
	            if (!!sender && sender.MemberNumber != Player.MemberNumber)
	                LSCG_SendLocal(CharacterNickname(sender) + " has forced chloroform over your mouth, you will pass out if it is not removed soon!", 30000);
	            CharacterSetFacialExpression(Player, "Eyes", "Scared");
	            clearTimeout(this.awakenTimeout);
	            this.passoutTimer = setTimeout(() => this.StartPassout_1(), 20000);
	        }
	    }
	    StartPassout_1() {
	        SendAction("%NAME%, unable to continue holding %POSSESSIVE% breath, takes a desparate gasp through the chemical-soaked cloth.");
	        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        clearTimeout(this.passoutTimer);
	        this.passoutTimer = setTimeout(() => this.StartPassout_2(), 10000);
	    }
	    StartPassout_2() {
	        SendAction("%NAME%'s body trembles as the chloroform sinks deep into %POSSESSIVE% mind.");
	        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
	        clearTimeout(this.passoutTimer);
	        this.passoutTimer = setTimeout(() => this.Passout(), 5000);
	    }
	    Passout() {
	        SendAction("%NAME% slumps weakly as %PRONOUN% slips into unconciousness.");
	        this.SetSleepExpression();
	        if (Player.CanKneel()) {
	            this.FallDownIfPossible();
	            addCustomEffect(Player, "ForceKneel");
	        }
	        this.isChloroformed = true;
	        this.settings.chloroformedAt = CommonTime();
	        clearTimeout(this.passoutTimer);
	        settingsSave();
	    }
	    ChloroformWearOff() {
	        SendAction("%NAME% takes a deep, calm breath as %POSSESSIVE% chloroform starts to lose its potency...");
	        clearTimeout(this.awakenTimeout);
	        this.awakenTimeout = setTimeout(() => this.RemoveChloroform_1(), 45000);
	        this.chloroformWearingOff = true;
	    }
	    RemoveChloroform() {
	        if (this.isChloroformed) {
	            SendAction("%NAME% continues to sleep peacefully as the cloth is removed...");
	            clearTimeout(this.awakenTimeout);
	            this.awakenTimeout = setTimeout(() => this.RemoveChloroform_1(), 20000);
	            this.chloroformWearingOff = true;
	        }
	        else {
	            SendAction("%NAME% gulps in fresh air as the cloth is removed...");
	            CharacterSetFacialExpression(Player, "Eyes", null);
	            clearTimeout(this.passoutTimer);
	            clearTimeout(this.awakenTimeout);
	        }
	    }
	    RemoveChloroform_1() {
	        SendAction("%NAME% starts to stir with a gentle moan...");
	        clearTimeout(this.awakenTimeout);
	        this.awakenTimeout = setTimeout(() => this.RemoveChloroform_2(), 10000);
	    }
	    RemoveChloroform_2() {
	        SendAction("%NAME%'s eyes flutter and start to open sleepily...");
	        this._removeChloroform();
	    }
	    _removeChloroform() {
	        this.isChloroformed = false;
	        this.chloroformWearingOff = false;
	        clearInterval(this.eyesInterval);
	        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	        CharacterSetFacialExpression(Player, "Emoticon", null);
	        setOrIgnoreBlush("Medium");
	        removeCustomEffect(Player, "ForceKneel");
	    }
	    SetSleepExpression() {
	        CharacterSetFacialExpression(Player, "Eyes", "Closed");
	        CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
	    }
	    FallDownIfPossible() {
	        if (Player.CanKneel()) {
	            CharacterSetActivePose(Player, "Kneel", true);
	        }
	    }
	}

	class LipstickModule extends BaseModule {
	    get defaultSettings() {
	        return {
	            enabled: false,
	            dry: false
	        };
	    }
	    safeword() {
	        this.RemoveKissMark("all");
	    }
	    load() {
	        OnActivity(100, ModuleCategory.Lipstick, (data, sender, msg, metadata) => {
	            var _a, _b, _c;
	            if (!this.Enabled)
	                return;
	            let target = GetTargetCharacter(data);
	            if (!!target &&
	                !!sender &&
	                !((_b = (_a = sender.LSCG) === null || _a === void 0 ? void 0 : _a.LipstickModule) === null || _b === void 0 ? void 0 : _b.dry) &&
	                target == Player.MemberNumber) {
	                if (this.kissMarkSlotsOccupied())
	                    return;
	                switch (data.Content) {
	                    case "ChatOther-ItemNeck-Kiss":
	                        this.AddKissMark(sender, "neck");
	                        break;
	                    case "ChatOther-ItemMouth-PoliteKiss":
	                        this.AddKissMark(sender, "cheek");
	                        break;
	                    case "ChatOther-ItemHead-Kiss":
	                        this.AddKissMark(sender, "forehead");
	                        break;
	                    case "ChatOther-ItemMouth-GagKiss":
	                        this.AddGagKissMark(sender);
	                    default:
	                        break;
	                }
	                var item = (_c = data.Dictionary) === null || _c === void 0 ? void 0 : _c.find((d) => d.Tag == "ActivityAsset");
	                if (!!item && item.AssetName == "Towel") {
	                    switch (data.Content) {
	                        case "ChatOther-ItemHood-RubItem":
	                        case "ChatSelf-ItemHood-RubItem":
	                            this.RemoveKissMark("forehead");
	                            break;
	                        case "ChatOther-ItemMouth-RubItem":
	                        case "ChatSelf-ItemMouth-RubItem":
	                            this.RemoveKissMark("cheek");
	                            break;
	                        case "ChatOther-ItemNeck-RubItem":
	                        case "ChatSelf-ItemNeck-RubItem":
	                            this.RemoveKissMark("neck");
	                            break;
	                        default:
	                            break;
	                    }
	                }
	            }
	        });
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Lipstick);
	    }
	    getKisserLipColor(sender) {
	        try {
	            var mouth = InventoryGet(sender, "Mouth");
	            if (!!mouth && mouth.Color && mouth.Color != "Default")
	                return mouth.Color;
	            else
	                return "Default";
	        }
	        catch (_a) {
	            return "Default";
	        }
	    }
	    getExistingLipstickMarks(color) {
	        let slots = [InventoryGet(Player, "Mask"), InventoryGet(Player, "ClothAccessory")].filter(s => !!s && s.Asset.Name == "Kissmark");
	        var matching = slots.find(s => Array.isArray(s === null || s === void 0 ? void 0 : s.Color) && Array.isArray(color) && (s === null || s === void 0 ? void 0 : s.Color[0]) == color[0]);
	        if (!!matching)
	            return matching;
	        if (slots.length < 2)
	            return this.addLipstickMarks();
	        else
	            return slots[0];
	    }
	    addLipstickMarks() {
	        var _a;
	        let slot = "Mask";
	        var mask = InventoryGet(Player, "Mask");
	        if (!!mask) {
	            slot = "ClothAccessory";
	        }
	        let final = InventoryGet(Player, slot);
	        if (!final) {
	            InventoryRemove(Player, slot);
	            InventoryWear(Player, "Kissmark", slot, "Default", 1, (_a = Player.MemberNumber) !== null && _a !== void 0 ? _a : 0, undefined, true);
	            var marks = InventoryGet(Player, slot);
	            if (!!marks && !!marks.Property)
	                marks.Property.Type = "c0r1f0n0l0";
	            return marks;
	        }
	        else
	            return undefined;
	    }
	    kissMarkSlotsOccupied() {
	        var mask = InventoryGet(Player, "Mask");
	        var acc = InventoryGet(Player, "ClothAccessory");
	        if (!!mask && mask.Asset.Name != "Kissmark" && !!acc && acc.Asset.Name != "Kissmark")
	            return true;
	        return false;
	    }
	    getKissMarkStatus(typeString) {
	        return {
	            cheek1: typeString.substring(1, 2) == '1',
	            cheek2: typeString.substring(3, 4) == '0',
	            forehead: typeString.substring(5, 6) == '1',
	            neck1: typeString.substring(7, 8) == '1',
	            neck2: typeString.substring(9, 10) == '1'
	        };
	    }
	    getKissMarkTypeString(status) {
	        return "c" + (status.cheek1 ? "1" : "0") +
	            "r" + (status.cheek2 ? "0" : "1") +
	            "f" + (status.forehead ? "1" : "0") +
	            "n" + (status.neck1 ? "1" : "0") +
	            "l" + (status.neck2 ? "1" : "0");
	    }
	    RemoveKissMark(location) {
	        var marks = [InventoryGet(Player, "Mask"), InventoryGet(Player, "ClothAccessory")].filter(m => !!m && m.Asset.Name == "Kissmark");
	        if (!marks || marks.length <= 0)
	            return;
	        marks.forEach(mark => {
	            var _a, _b;
	            var status = this.getKissMarkStatus((_b = (_a = mark === null || mark === void 0 ? void 0 : mark.Property) === null || _a === void 0 ? void 0 : _a.Type) !== null && _b !== void 0 ? _b : "c0r1f0n0l0");
	            switch (location) {
	                case "cheek":
	                    status.cheek1 = false;
	                    status.cheek2 = false;
	                    break;
	                case "forehead":
	                    status.forehead = false;
	                    break;
	                case "neck":
	                    status.neck1 = false;
	                    status.neck2 = false;
	                    break;
	                case "all":
	                    status.cheek1 = false;
	                    status.cheek2 = false;
	                    status.forehead = false;
	                    status.neck1 = false;
	                    status.neck2 = false;
	                default:
	                    break;
	            }
	            if (!!mark && !!mark.Property)
	                mark.Property.Type = this.getKissMarkTypeString(status);
	        });
	        if (location == "cheek" || location == "all")
	            this.removeGagKissMark();
	        ChatRoomCharacterUpdate(Player);
	    }
	    AddKissMark(sender, location) {
	        var _a, _b;
	        var color = this.getKisserLipColor(sender);
	        if (color == "Default")
	            return; // No lipstick
	        var marks = this.getExistingLipstickMarks(color);
	        if (!marks)
	            return;
	        marks.Color = color;
	        var status = this.getKissMarkStatus((_b = (_a = marks === null || marks === void 0 ? void 0 : marks.Property) === null || _a === void 0 ? void 0 : _a.Type) !== null && _b !== void 0 ? _b : "c0r1f0n0l0");
	        // Adjust marks
	        switch (location) {
	            case "cheek":
	                if (!status.cheek1)
	                    status.cheek1 = true;
	                else
	                    status.cheek2 = true;
	                break;
	            case "forehead":
	                status.forehead = true;
	                break;
	            case "neck":
	                if (!status.neck1)
	                    status.neck1 = true;
	                else
	                    status.neck2 = true;
	                break;
	            default:
	                break;
	        }
	        if (!!marks && !!marks.Property)
	            marks.Property.Type = this.getKissMarkTypeString(status);
	        ChatRoomCharacterUpdate(Player);
	    }
	    AddGagKissMark(sender) {
	        var _a;
	        var color = this.getKisserLipColor(sender);
	        if (color == "Default")
	            return; // No lipstick
	        var existingItem = InventoryGet(Player, "ItemMouth3");
	        if (!!existingItem && existingItem.Asset.Name != "Kissmark")
	            return;
	        if (!existingItem) {
	            InventoryWear(Player, "Kissmark", "ItemMouth3", "Default", 1, (_a = Player.MemberNumber) !== null && _a !== void 0 ? _a : 0, undefined, true);
	            ChatRoomCharacterUpdate(Player);
	            existingItem = InventoryGet(Player, "ItemMouth3");
	        }
	        if (!existingItem)
	            return;
	        existingItem.Color = color;
	        ChatRoomCharacterUpdate(Player);
	    }
	    removeGagKissMark() {
	        var gagKissmark = InventoryGet(Player, "ItemMouth3");
	        if (!!gagKissmark && gagKissmark.Asset.Name == "Kissmark")
	            InventoryRemove(Player, "ItemMouth3");
	    }
	}

	class GuiActivities extends GuiSubscreen {
	    constructor() {
	        super(...arguments);
	        this.activityIndex = 0;
	    }
	    get name() {
	        return "Activities";
	    }
	    get icon() {
	        return ICONS.HOLD_HANDS;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get structure() {
	        return [];
	    }
	    getZoneColor(groupName) {
	        let hasConfiguration = this.settings.activities.some(a => a.group == groupName);
	        return hasConfiguration ? "#00FF0044" : "#80808044";
	    }
	    get currentActivityEntry() {
	        var _a, _b, _c;
	        let actName = (_a = this.Activities[this.activityIndex]) === null || _a === void 0 ? void 0 : _a.Name;
	        let groupName = (_c = (_b = Player.FocusGroup) === null || _b === void 0 ? void 0 : _b.Name) !== null && _c !== void 0 ? _c : "";
	        let entry = this.getActivityEntry(actName, groupName);
	        return entry;
	    }
	    getActivityEntry(actName, grpName) {
	        return this.settings.activities.find(a => a.name == actName && a.group == grpName);
	    }
	    get Activities() {
	        if (!Player.FocusGroup)
	            return [];
	        else
	            return AssetActivitiesForGroup("Female3DCG", Player.FocusGroup.Name, "any").filter(a => this.ActivityHasDictionaryText(this.getActivityLabelTag(a, Player.FocusGroup)));
	    }
	    ActivityHasDictionaryText(KeyWord) {
	        if (!ActivityDictionary)
	            ActivityDictionaryLoad();
	        if (!ActivityDictionary)
	            return;
	        for (let D = 0; D < ActivityDictionary.length; D++)
	            if (ActivityDictionary[D][0] == KeyWord)
	                return true;
	        return false;
	    }
	    getActivityLabelTag(activity, group) {
	        let groupName = group.Name;
	        if (Player.HasPenis()) {
	            if (groupName == "ItemVulva")
	                groupName = "ItemPenis";
	            if (groupName == "ItemVulvaPiercings")
	                groupName = "ItemGlans";
	        }
	        return `Label-ChatOther-${groupName}-${activity.Name}`;
	    }
	    getActivityLabel(activity, group) {
	        if (!activity)
	            return "ACTIVITY NOT FOUND";
	        let tag = this.getActivityLabelTag(activity, group);
	        return ActivityDictionaryText(tag);
	    }
	    Load() {
	        var _a;
	        super.Load();
	        ElementCreateInput("hypnoThreshold", "number", "", "80");
	        ElementCreateInput("hypnoCount", "number", "", "80");
	        ElementCreateInput("orgasmThreshold", "number", "", "80");
	        ElementCreateInput("allowedMembers", "text", "", "80");
	        ElementPosition("hypnoThreshold", -1000, -1000, 0, 0);
	        ElementPosition("hypnoCount", -1000, -1000, 0, 0);
	        ElementPosition("orgasmThreshold", -1000, -1000, 0, 0);
	        ElementPosition("allowedMembers", -1000, -1000, 0, 0);
	        CharacterAppearanceForceUpCharacter = (_a = Player.MemberNumber) !== null && _a !== void 0 ? _a : -1;
	    }
	    Run() {
	        var _a;
	        let tmp = GuiSubscreen.START_X;
	        let prev = MainCanvas.textAlign;
	        GuiSubscreen.START_X = 550;
	        super.Run();
	        DrawCharacter(Player, 50, 50, 0.9, false);
	        MainCanvas.textAlign = "left";
	        // Draws all the available character zones
	        for (let Group of AssetGroup) {
	            if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length)
	                DrawAssetGroupZone(Player, Group.Zone, 0.9, 50, 50, 1, "#808080FF", 3, this.getZoneColor(Group.Name));
	        }
	        if (Player.FocusGroup != null) {
	            let activity = this.Activities[(_a = this.activityIndex) !== null && _a !== void 0 ? _a : 0];
	            DrawAssetGroupZone(Player, Player.FocusGroup.Zone, 0.9, 50, 50, 1, "cyan");
	            MainCanvas.textAlign = "center";
	            DrawBackNextButton(550, this.getYPos(0), 600, 64, this.getActivityLabel(activity, Player.FocusGroup), "White", "", () => "", () => "");
	            MainCanvas.textAlign = "left";
	            if (!!activity) {
	                let image = "Assets/" + Player.AssetFamily + "/Activity/" + activity.Name + ".png";
	                if (activity.Name.indexOf("Item") > -1) {
	                    image = "Icons/Dress.png";
	                }
	                DrawImageResize(image, 1170, this.getYPos(0) - 28, 120, 120);
	                DrawEmptyRect(1170, this.getYPos(0) - 28, 120, 120, "Black", 2);
	                this.DrawActivityOptions();
	            }
	        }
	        else {
	            DrawText("Please Select a Zone", this.getXPos(0), this.getYPos(0), "Black", "White");
	        }
	        GuiSubscreen.START_X = tmp;
	        MainCanvas.textAlign = prev;
	    }
	    Click() {
	        let tmp = GuiSubscreen.START_X;
	        GuiSubscreen.START_X = 550;
	        super.Click();
	        for (const Group of AssetGroup) {
	            if (Group.IsItem() && !Group.MirrorActivitiesFrom && AssetActivitiesForGroup("Female3DCG", Group.Name).length) {
	                const Zone = Group.Zone.find(z => DialogClickedInZone(Player, z, 0.9, 50, 50, 1));
	                if (Zone) {
	                    this.SetActivityEntryVals(this.currentActivityEntry);
	                    Player.FocusGroup = Group;
	                    let activities = this.Activities;
	                    if (this.activityIndex >= activities.length)
	                        this.activityIndex = 0;
	                    this.LoadActivityEntry(this.currentActivityEntry);
	                }
	            }
	        }
	        if (Player.FocusGroup != null) {
	            let activities = this.Activities;
	            // Arousal activity control
	            if (MouseIn(this.getXPos(0), this.getYPos(0), 600, 64)) {
	                this.SetActivityEntryVals(this.currentActivityEntry);
	                if (MouseX <= (this.getXPos(0) + 300))
	                    this.activityIndex = (activities.length + this.activityIndex - 1) % activities.length;
	                else
	                    this.activityIndex = (this.activityIndex + 1) % activities.length;
	                this.LoadActivityEntry(this.currentActivityEntry);
	            }
	        }
	        this.HandleActivityEntryClick();
	        GuiSubscreen.START_X = tmp;
	    }
	    Exit() {
	        this.SetActivityEntryVals(this.currentActivityEntry);
	        ElementRemove("hypnoThreshold");
	        ElementRemove("hypnoCount");
	        ElementRemove("orgasmThreshold");
	        ElementRemove("allowedMembers");
	        CharacterAppearanceForceUpCharacter = -1;
	        CharacterLoadCanvas(Player);
	        Player.FocusGroup = null;
	        super.Exit();
	    }
	    LoadActivityEntry(entry) {
	        var _a, _b, _c, _d;
	        this.ElementSetValue("hypnoThreshold", ((_a = entry === null || entry === void 0 ? void 0 : entry.hypnoThreshold) !== null && _a !== void 0 ? _a : 50));
	        this.ElementSetValue("hypnoCount", ((_b = entry === null || entry === void 0 ? void 0 : entry.hypnoRequiredRepeats) !== null && _b !== void 0 ? _b : 2));
	        this.ElementSetValue("orgasmThreshold", ((_c = entry === null || entry === void 0 ? void 0 : entry.orgasmThreshold) !== null && _c !== void 0 ? _c : 75));
	        this.ElementSetValue("allowedMembers", ((_d = entry === null || entry === void 0 ? void 0 : entry.allowedMemberIds) !== null && _d !== void 0 ? _d : []).join(","));
	    }
	    SetActivityEntryVals(entry) {
	        if (!entry)
	            return;
	        let hypnoThreshold = ElementValue("hypnoThreshold");
	        if (CommonIsNumeric(hypnoThreshold))
	            entry.hypnoThreshold = +hypnoThreshold;
	        entry.allowedMemberIds = GetDelimitedList(ElementValue("allowedMembers"), ",").filter(str => CommonIsNumeric(str)).map(str => +str);
	        let hypnoCount = ElementValue("hypnoCount");
	        if (CommonIsNumeric(hypnoCount))
	            entry.hypnoRequiredRepeats = +hypnoCount;
	        let orgasmThreshold = ElementValue("orgasmThreshold");
	        if (CommonIsNumeric(orgasmThreshold))
	            entry.orgasmThreshold = +orgasmThreshold;
	    }
	    ClearEntry(entry) {
	        this.settings.activities = this.settings.activities.filter(a => !(a.name == entry.name && a.group == entry.group));
	    }
	    ElementSetValue(elementId, value) {
	        let element = document.getElementById(elementId);
	        if (!!element && value != null)
	            element.value = value;
	    }
	    newDefaultEntry(actName, grpName) {
	        return {
	            name: actName,
	            group: grpName,
	            hypno: false,
	            sleep: false,
	            hypnoThreshold: 50,
	            hypnoRequiredRepeats: 2,
	            awakener: false,
	            orgasm: false,
	            orgasmThreshold: 75,
	            allowedMemberIds: []
	        };
	    }
	    createEntryIfNeeded(existing) {
	        var _a, _b;
	        if (!existing) {
	            existing = this.newDefaultEntry(this.Activities[this.activityIndex].Name, (_b = (_a = Player.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : "");
	            this.settings.activities.push(existing);
	            this.LoadActivityEntry(this.currentActivityEntry);
	        }
	        return existing;
	    }
	    HandleActivityEntryClick() {
	        let entry = this.currentActivityEntry;
	        // Clear Entry
	        if (!!entry && MouseIn(1310, this.getYPos(0), 64, 64)) {
	            this.ClearEntry(entry);
	        }
	        // Hypno Checkbox
	        if (MouseIn(this.getNarrowXPos(0) + 400, this.getNarrowYPos(2) - 32, 64, 64)) {
	            entry = this.createEntryIfNeeded(entry);
	            entry.hypno = !entry.hypno;
	        }
	        // Sleep Checkbox
	        if (MouseIn(this.getNarrowXPos(1) + 400, this.getNarrowYPos(2) - 32, 64, 64)) {
	            entry = this.createEntryIfNeeded(entry);
	            entry.sleep = !entry.sleep;
	        }
	        // Awaken Checkbox
	        if (MouseIn(this.getXPos(5) + 600, this.getYPos(5) - 32, 64, 64)) {
	            entry = this.createEntryIfNeeded(entry);
	            entry.awakener = !entry.awakener;
	        }
	        // Orgasm Checkbox
	        if (MouseIn(this.getXPos(6) + 600, this.getYPos(6) - 32, 64, 64)) {
	            entry = this.createEntryIfNeeded(entry);
	            entry.orgasm = !entry.orgasm;
	        }
	    }
	    DrawActivityOptions() {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
	        let activityEntry = this.currentActivityEntry;
	        if (!!activityEntry) {
	            MainCanvas.textAlign = "center";
	            DrawButton(1310, this.getYPos(0), 64, 64, "X", "White", undefined, "Clear Entry");
	            MainCanvas.textAlign = "left";
	        }
	        // Trance Section
	        this.DrawCheckboxNarrow("Can Induce Trance", "Using this activity on this location can trigger hypnosis.", (_a = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.hypno) !== null && _a !== void 0 ? _a : false, 2, 0);
	        this.DrawCheckboxNarrow("Can Induce Sleep", "Using this activity on this location can put them to sleep.", (_b = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.sleep) !== null && _b !== void 0 ? _b : false, 2, 1);
	        this.ElementPosition("hypnoCount", "Repeats Required", "Number times within 5 minutes this activity must be done before hypnosis or sleep is triggered.", 3, !((_c = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.hypno) !== null && _c !== void 0 ? _c : false) && !((_d = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.sleep) !== null && _d !== void 0 ? _d : false));
	        this.ElementPosition("hypnoThreshold", "Trance Arousal Threshold", "Arousal threshold required for this activity to trigger hypnosis. If both trance and sleep are checked, lower arousal triggers sleep.", 4, !((_e = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.hypno) !== null && _e !== void 0 ? _e : false));
	        // Awakener Section
	        this.DrawCheckbox("Can Awaken", "Using this activity on this location will awaken you from trance or deep sleep.", (_f = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.awakener) !== null && _f !== void 0 ? _f : false, 5);
	        // Orgasm Section
	        this.DrawCheckbox("Can Cause Orgasm", "Using this activity on this location can cause an orgasm.", (_g = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.orgasm) !== null && _g !== void 0 ? _g : false, 6);
	        this.ElementPosition("orgasmThreshold", "Orgasm Arousal Threshold", "Arousal threshold required for this activity to cause an orgasm.", 7, !((_h = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.orgasm) !== null && _h !== void 0 ? _h : false));
	        // Allowed Members For Activity
	        this.ElementPosition("allowedMembers", "Allowed Member IDs", "Member IDs who can trance/sleep/awaken/orgasm with this activity. Leave empty to use BC item permissions", 8, !((_j = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.hypno) !== null && _j !== void 0 ? _j : false) && !((_k = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.orgasm) !== null && _k !== void 0 ? _k : false) && !((_l = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.awakener) !== null && _l !== void 0 ? _l : false) && !((_m = activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.sleep) !== null && _m !== void 0 ? _m : false));
	    }
	}

	class ActivityModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.collarModule = getModule("CollarModule");
	        this.prevMouth = null;
	        this.CustomPrerequisiteFuncs = new Map();
	        this.CustomIncomingActivityReactions = new Map();
	        this.CustomActionCallbacks = new Map();
	        this.CustomPreparseCallbacks = new Map();
	        this.CustomImages = new Map;
	        this.PatchedActivities = [];
	        this.hands = [];
	        this.heldBy = [];
	        this.myFootInMouth = -1;
	        this.footInMyMouth = -1;
	        this.escapeAttempted = 0;
	        this.escapeCooldown = 120000;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get settingsScreen() {
	        return GuiActivities;
	    }
	    get defaultSettings() {
	        return {
	            enabled: true,
	            activities: [
	                {
	                    name: "Pet",
	                    group: "ItemNose",
	                    awakener: true,
	                    hypno: false,
	                    sleep: false,
	                    hypnoRequiredRepeats: 2,
	                    hypnoThreshold: 50,
	                    orgasm: false,
	                    orgasmThreshold: 75,
	                }
	            ],
	            stats: {}
	        };
	    }
	    safeword() {
	        this.heldBy = [];
	        this.hands = [];
	    }
	    load() {
	        hookFunction("ServerSend", 100, (args, next) => {
	            var _a, _b;
	            if (args[0] == "ChatRoomChat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Type) == "Activity") {
	                let data = args[1];
	                let actName = (_b = GetActivityName(data)) !== null && _b !== void 0 ? _b : "";
	                var isPatched = this.CheckForPatchedActivity(actName, data.Content);
	                if (actName.indexOf("LSCG_") == 0 || isPatched) {
	                    let preParse = this.CustomPreparseCallbacks.get(actName);
	                    if (!!preParse)
	                        preParse(args);
	                    let target = GetTargetCharacter(data);
	                    var targetChar = getCharacter(target);
	                    let { metadata, substitutions } = ChatRoomMessageRunExtractors(data, Player);
	                    let msg = ActivityDictionaryText(data.Content);
	                    msg = CommonStringSubstitute(msg, substitutions !== null && substitutions !== void 0 ? substitutions : []);
	                    data.Dictionary.push({
	                        Tag: "MISSING ACTIVITY DESCRIPTION FOR KEYWORD " + data.Content,
	                        Text: msg
	                    });
	                    // If action name has a custom action, run it as part of the chain
	                    var customAction = this.CustomActionCallbacks.get(actName);
	                    if (!customAction)
	                        return next(args);
	                    else
	                        return customAction(targetChar, args, next);
	                }
	                else
	                    return next(args);
	            }
	            else {
	                return next(args);
	            }
	        }, ModuleCategory.Activities);
	        hookFunction("ActivityCheckPrerequisite", 100, (args, next) => {
	            var prereqName = args[0];
	            if (this.CustomPrerequisiteFuncs.has(prereqName)) {
	                var acting = args[1];
	                var acted = args[2];
	                var targetGrp = args[3];
	                var customPrereqFunc = this.CustomPrerequisiteFuncs.get(prereqName);
	                if (!customPrereqFunc)
	                    return next(args);
	                else {
	                    try {
	                        return customPrereqFunc(acting, acted, targetGrp);
	                    }
	                    catch (error) {
	                        console.warn(`Custom Prereq ${prereqName} failed: ${error}`);
	                    }
	                }
	            }
	            else
	                return next(args);
	        }, ModuleCategory.Activities);
	        OnActivity(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
	            var _a, _b;
	            let target = GetTargetCharacter(data);
	            let activityName = GetActivityName(data);
	            if (target == Player.MemberNumber && !!activityName && this.CustomIncomingActivityReactions.has(activityName)) {
	                var reactionFunc = this.CustomIncomingActivityReactions.get(activityName);
	                if (!!reactionFunc)
	                    reactionFunc(sender);
	            }
	            else if (target == Player.MemberNumber) {
	                let activityEntry = GetActivityEntryFromContent(data.Content);
	                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
	                    return;
	                if ((activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.orgasm) && ((_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) >= (activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.orgasmThreshold)) {
	                    if (Player.IsEdged()) {
	                        SendAction("%NAME% moans and trembles in frustration as %PRONOUN% is held right at the edge...");
	                        ActivitySetArousal(Player, 99);
	                    }
	                    else
	                        ActivityOrgasmPrepare(Player);
	                }
	            }
	        });
	        hookFunction("DrawImageResize", 1, (args, next) => {
	            var path = args[0];
	            if (!!path && path.indexOf("LSCG_") > -1) {
	                var activityName = path.substring(path.indexOf("LSCG_"));
	                activityName = activityName.substring(0, activityName.indexOf(".png"));
	                if (this.CustomImages.has(activityName))
	                    args[0] = this.CustomImages.get(activityName);
	            }
	            return next(args);
	        }, ModuleCategory.Activities);
	        hookFunction("CharacterItemsForActivity", 1, (args, next) => {
	            var _a, _b;
	            let C = args[0];
	            let itemType = args[1];
	            let results = next(args);
	            var focusGroup = (_b = (_a = C === null || C === void 0 ? void 0 : C.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : undefined;
	            if (itemType == "RubItem") {
	                let item = InventoryGet(C, "Pussy");
	                let canUsePenis = C.HasPenis() && InventoryPrerequisiteMessage(C, "AccessVulva") === "";
	                if (canUsePenis)
	                    results.push(item);
	            }
	            return results;
	        }, ModuleCategory.Activities);
	        this.InitTongueGrabHooks();
	        this.InitHandHoldHooks();
	        this.RegisterActivities();
	    }
	    run() {
	        this.collarModule = getModule("CollarModule");
	    }
	    RegisterActivities() {
	        // Bap
	        this.AddActivity({
	            Activity: {
	                Name: "Bap",
	                MaxProgress: 70,
	                MaxProgressSelf: 70,
	                Prerequisite: ["UseArms"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHead",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter baps TargetCharacter."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/Slap.png"
	        });
	        // Bap
	        this.AddActivity({
	            Activity: {
	                Name: "Headbutt",
	                MaxProgress: 70,
	                MaxProgressSelf: 70,
	                Prerequisite: ["CanHeadbutt"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter headbutts TargetCharacter."
	                }
	            ],
	            CustomPrereqs: [{
	                    Name: "CanHeadbutt",
	                    Func: (acting, acted, group) => !acting.IsFixedHead()
	                }],
	            CustomImage: "Assets/Female3DCG/Activity/Nod.png"
	        });
	        // Nuzzle
	        this.AddActivity({
	            Activity: {
	                Name: "Nuzzle",
	                MaxProgress: 70,
	                MaxProgressSelf: 70,
	                Prerequisite: ["ZoneAccessible"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHead",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles against the side of TargetCharacter's head."
	                }, {
	                    Name: "ItemNeck",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's neck."
	                }, {
	                    Name: "ItemArms",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's arms."
	                }, {
	                    Name: "ItemHands",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles underneath TargetCharacter's hand."
	                }, {
	                    Name: "ItemBreast",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles into TargetCharacter's breasts."
	                }, {
	                    Name: "ItemTorso",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter nuzzles snugly into TargetCharacter."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
	        });
	        // Hug
	        this.AddActivity({
	            Activity: {
	                Name: "Hug",
	                MaxProgress: 70,
	                MaxProgressSelf: 70,
	                Prerequisite: ["UseArms"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    SelfAllowed: true,
	                    TargetAction: "SourceCharacter wraps PronounPossessive arms around TargetCharacter in a big warm hug.",
	                    TargetSelfAction: "SourceCharacter wraps TargetCharacter in a therapeutic self-hug."
	                }
	            ],
	            CustomImage: ICONS.HUG
	        });
	        // Tackle
	        this.AddActivity({
	            Activity: {
	                Name: "Tackle",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseArms"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter full body tackles TargetCharacter!"
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
	        });
	        // Flop
	        this.AddActivity({
	            Activity: {
	                Name: "Flop",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseLegs"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    SelfAllowed: false,
	                    TargetAction: "SourceCharacter flops on top of TargetCharacter."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/Cuddle.png"
	        });
	        // KissEyes
	        this.AddActivity({
	            Activity: {
	                Name: "KissEyes",
	                MaxProgress: 75,
	                MaxProgressSelf: 50,
	                Prerequisite: ["ZoneAccessible"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHead",
	                    SelfAllowed: false,
	                    TargetLabel: "Kiss Eyes",
	                    TargetAction: "SourceCharacter gently kisses over TargetCharacter's eyes."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/Kiss.png"
	        });
	        // RubPussy
	        this.AddActivity({
	            Activity: {
	                Name: "RubPussy",
	                MaxProgress: 100,
	                MaxProgressSelf: 100,
	                Prerequisite: ["ZoneAccessible", "ZoneNaked", "HasVagina"]
	            },
	            Targets: [
	                {
	                    Name: "ItemPenis",
	                    SelfAllowed: false,
	                    TargetLabel: "Rub Pussy",
	                    TargetAction: "SourceCharacter grinds their pussy against TargetCharacter's penis."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/MasturbateHand.png"
	        });
	        // SlapPenis
	        this.AddActivity({
	            Activity: {
	                Name: "SlapPenis",
	                MaxProgress: 100,
	                MaxProgressSelf: 100,
	                Prerequisite: ["ZoneAccessible", "ZoneNaked", "CanUsePenis", "HasPenis", "Needs-PenetrateItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHead",
	                    TargetLabel: "Slap Face",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's face."
	                }, {
	                    Name: "ItemMouth",
	                    TargetLabel: "Slap Mouth",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's mouth."
	                }, {
	                    Name: "ItemVulva",
	                    TargetLabel: "Slap against Pussy",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's pussy."
	                }, {
	                    Name: "ItemBreast",
	                    TargetLabel: "Slap Breast",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's breast."
	                }, {
	                    Name: "ItemLegs",
	                    TargetLabel: "Slap Thigh",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's thigh."
	                }, {
	                    Name: "ItemFeet",
	                    TargetLabel: "Slap Calf",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's calf."
	                }, {
	                    Name: "ItemBoots",
	                    TargetLabel: "Slap Feet",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's feet."
	                }, {
	                    Name: "ItemButt",
	                    TargetLabel: "Slap Butt",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's butt."
	                }, {
	                    Name: "ItemNeck",
	                    TargetLabel: "Slap Neck",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's neck."
	                }, {
	                    Name: "ItemArms",
	                    TargetLabel: "Slap Arms",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's arm."
	                }, {
	                    Name: "ItemHands",
	                    TargetLabel: "Slap Hand",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's hand."
	                }, {
	                    Name: "ItemPenis",
	                    TargetLabel: "Slap Penis",
	                    TargetAction: "SourceCharacter slaps PronounPossessive ActivityAsset against TargetCharacter's penis."
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/Activity/PenetrateSlow.png"
	        });
	        // NibbleTail
	        this.PatchActivity({
	            ActivityName: "Nibble",
	            AddedTargets: [{
	                    Name: "ItemButt",
	                    SelfAllowed: true,
	                    TargetLabel: "Nibble Tail",
	                    TargetAction: "SourceCharacter nibbles on TargetCharacter's tail.",
	                    TargetSelfAction: "SourceCharacter nibbles on PronounPossessive own tail."
	                }, {
	                    Name: "ItemHead",
	                    SelfAllowed: false,
	                    TargetLabel: "Nibble Halo",
	                    TargetAction: "SourceCharacter nibbles on TargetCharacter's halo."
	                }, {
	                    Name: "ItemHood",
	                    SelfAllowed: true,
	                    TargetLabel: "Nibble Wing",
	                    TargetAction: "SourceCharacter nibbles on TargetCharacter's wing.",
	                    TargetSelfAction: "SourceCharacter nibbles on PronounPossessive own wing."
	                }],
	            RemovedPrerequisites: ["ZoneNaked", "ZoneAccessible"],
	            AddedPrerequisites: ["CanCustomNibble"],
	            CustomPrereqs: [{
	                    Name: "CanCustomNibble",
	                    Func: (acting, acted, group) => {
	                        var _a, _b;
	                        if (group.Name == "ItemButt")
	                            return !!InventoryGet(acted, "TailStraps");
	                        else if (group.Name == "ItemHood")
	                            return !!InventoryGet(acted, "Wings");
	                        else if (group.Name == "ItemHead")
	                            return (((_a = InventoryGet(acted, "HairAccessory1")) === null || _a === void 0 ? void 0 : _a.Asset.Name) == "Halo" || ((_b = InventoryGet(acted, "HairAccessory3")) === null || _b === void 0 ? void 0 : _b.Asset.Name) == "Halo");
	                        else if (group.Name === "ItemVulva")
	                            return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
	                        else if (group.Name === "ItemVulvaPiercings")
	                            return (InventoryPrerequisiteMessage(acted, "AccessCrotch") === "") && !acted.IsVulvaChaste();
	                        else if (group.Name === "ItemBoots")
	                            return InventoryPrerequisiteMessage(acted, "NakedFeet") === "";
	                        else if (group.Name === "ItemHands")
	                            return InventoryPrerequisiteMessage(acted, "NakedHands") === "";
	                        else
	                            return true;
	                    }
	                }, {
	                    Name: "CustomNibbleAccessible",
	                    Func: (acting, acted, group) => {
	                        if (group.Name == "ItemButt")
	                            return true;
	                        else
	                            return ActivityGetAllMirrorGroups(acted.AssetFamily, group.Name).some((g) => g.IsItem() ? !InventoryGroupIsBlocked(acted, g.Name, true) : true);
	                    }
	                }, {
	                    Name: "HasWings",
	                    Func: (acting, acted, group) => group.Name == "ItemHood" ? !!InventoryGet(acted, "Wings") : true
	                }, {
	                    Name: "HasHalo",
	                    Func: (acting, acted, group) => { var _a, _b; return group.Name == "ItemHead" ? (((_a = InventoryGet(acted, "HairAccessory1")) === null || _a === void 0 ? void 0 : _a.Asset.Name) == "Halo" || ((_b = InventoryGet(acted, "HairAccessory3")) === null || _b === void 0 ? void 0 : _b.Asset.Name) == "Halo") : true; }
	                }]
	        });
	        // FuckWithPussy
	        this.AddActivity({
	            Activity: {
	                Name: "FuckWithPussy",
	                MaxProgress: 100,
	                MaxProgressSelf: 100,
	                Prerequisite: ["ZoneAccessible", "ZoneNaked", "HasVagina"]
	            },
	            Targets: [
	                {
	                    Name: "ItemVulva",
	                    SelfAllowed: false,
	                    TargetLabel: "Grind with Pussy",
	                    TargetAction: "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's."
	                }, {
	                    Name: "ItemPenis",
	                    SelfAllowed: false,
	                    TargetLabel: "Ride with Pussy",
	                    TargetAction: "SourceCharacter fucks TargetCharacter's penis with PronounPossessive pussy, grinding up and down."
	                },
	                {
	                    Name: "ItemHead",
	                    SelfAllowed: false,
	                    TargetLabel: "Sit on Face",
	                    TargetAction: "SourceCharacter grinds PronounPossessive pussy against TargetCharacter's face."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "CanGrindWithPussy",
	                    Func: (acting, acted, group) => {
	                        var _a, _b, _c, _d, _e, _f;
	                        if (group.Name == "ItemVulva" && acted.HasPenis()) {
	                            return !acting.IsVulvaFull();
	                        }
	                        else {
	                            return ((_a = acted.Pose) === null || _a === void 0 ? void 0 : _a.indexOf("Kneel")) > -1 ||
	                                ((_b = acted.Pose) === null || _b === void 0 ? void 0 : _b.indexOf("KneelingSpread")) > -1 ||
	                                ((_c = acted.Pose) === null || _c === void 0 ? void 0 : _c.indexOf("Hogtied")) > -1 ||
	                                ((_d = acted.Pose) === null || _d === void 0 ? void 0 : _d.indexOf("KneelingSpread")) > -1 ||
	                                ((_e = acted.Pose) === null || _e === void 0 ? void 0 : _e.indexOf("Hogtied")) > -1 ||
	                                ((_f = acted.Pose) === null || _f === void 0 ? void 0 : _f.indexOf("AllFours")) > -1;
	                        }
	                    }
	                }
	            ],
	            CustomImage: ICONS.PUSSY
	        });
	        // FuckWithAss
	        this.AddActivity({
	            Activity: {
	                Name: "FuckWithAss",
	                MaxProgress: 100,
	                MaxProgressSelf: 100,
	                Prerequisite: ["ZoneAccessible", "ZoneNaked", "TargetHasPenis"]
	            },
	            Targets: [
	                {
	                    Name: "ItemVulva",
	                    SelfAllowed: false,
	                    TargetLabel: "Grind with Ass",
	                    TargetAction: "SourceCharacter grinds PronounPossessive ass against TargetCharacter's vulva."
	                }, {
	                    Name: "ItemPenis",
	                    SelfAllowed: false,
	                    TargetLabel: "Ride with Ass",
	                    TargetAction: "SourceCharacter fucks TargetCharacter's penis with PronounPossessive ass."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "SourceAssEmpty",
	                    Func: (acting, acted, group) => !acting.IsPlugged()
	                }
	            ],
	            CustomImage: ICONS.ASS
	        });
	        // GrabTongue
	        this.AddActivity({
	            Activity: {
	                Name: "GrabTongue",
	                MaxProgress: 75,
	                MaxProgressSelf: 30,
	                Prerequisite: ["ZoneAccessible", "UseHands", "TargetCanUseTongue"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    SelfAllowed: false,
	                    TargetLabel: "Grab Tongue",
	                    TargetAction: "SourceCharacter reaches in and grabs hold of TargetCharacter's tongue with PronounPossessive fingers."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetTongueIsNotGrabbed",
	                    Func: (acting, acted, group) => {
	                        return this.tongueGrabbedMemberList.indexOf(acted.MemberNumber) == -1;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoGrab(target, "tongue");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
	        });
	        // ReleaseTongue
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseTongue",
	                MaxProgress: 20,
	                MaxProgressSelf: 20,
	                Prerequisite: ["ZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Tongue",
	                    TargetAction: "SourceCharacter lets go of TargetCharacter's tongue."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetTongueIsGrabbed",
	                    Func: (acting, acted, group) => {
	                        return this.tongueGrabbedMemberList.indexOf(acted.MemberNumber) > -1;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "tongue");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
	        });
	        // HoldHand
	        this.AddActivity({
	            Activity: {
	                Name: "HoldHand",
	                MaxProgress: 75,
	                Prerequisite: ["ZoneAccessible", "TargetZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHands",
	                    SelfAllowed: false,
	                    TargetLabel: "Hold Hands",
	                    TargetAction: "SourceCharacter takes TargetCharacter's hand."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsHandUnleashed",
	                    Func: (acting, acted, group) => {
	                        return !this.isHandLeashed(acted) && InventoryGet(acted, "ItemHands") == null && this.handHoldingMemberList.length < 2;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoGrab(target, "hand");
	                    return next(args);
	                }
	            },
	            CustomImage: ICONS.HOLD_HANDS
	        });
	        // ReleaseHand
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseHand",
	                MaxProgress: 20,
	                Prerequisite: ["ZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHands",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Hand",
	                    TargetAction: "SourceCharacter lets go of TargetCharacter's hand."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsHandLeashed",
	                    Func: (acting, acted, group) => {
	                        return this.isHandLeashed(acted);
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "hand");
	                    return next(args);
	                }
	            },
	            CustomImage: ICONS.HOLD_HANDS
	        });
	        // Patch Pinch
	        this.PatchActivity({
	            ActivityName: "Pinch",
	            RemovedPrerequisites: ["ZoneAccessible"],
	            AddedTargets: [
	                {
	                    Name: "ItemButt",
	                    SelfAllowed: true,
	                    TargetLabel: "Pinch Butt",
	                    TargetAction: "SourceCharacter pinches TargetCharacter's butt.",
	                    TargetSelfAction: "SourceCharacter pinches PronounPossessive own butt."
	                }, {
	                    Name: "ItemMouth",
	                    SelfAllowed: true,
	                    TargetLabel: "Pinch Cheek",
	                    TargetAction: "SourceCharacter pinches TargetCharacter's cheek.",
	                    TargetSelfAction: "SourceCharacter pinches PronounPossessive own cheek."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetCanBePinched",
	                    Func: (acting, acted, group) => {
	                        var _a;
	                        let zoneAccessible = ActivityGetAllMirrorGroups(acted.AssetFamily, group.Name).some((g) => g.IsItem() ? !InventoryGroupIsBlocked(acted, g.Name, true) : true);
	                        if (group.Name == "ItemEars")
	                            return zoneAccessible && !this.isPlayerPinching((_a = acted.MemberNumber) !== null && _a !== void 0 ? _a : 0) && this.earPinchingMemberList.length < 2;
	                        else if (group.Name == "ItemButt")
	                            return true;
	                        else
	                            return zoneAccessible;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    var location = (_a = GetMetadata(args[1])) === null || _a === void 0 ? void 0 : _a.GroupName;
	                    if (!!target && !!location && location == "ItemEars")
	                        this.DoGrab(target, "ear");
	                    return next(args);
	                }
	            },
	        });
	        // ReleaseEar
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseEar",
	                MaxProgress: 30,
	                Prerequisite: ["ZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemEars",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Ear",
	                    TargetAction: "SourceCharacter releases TargetCharacter's ear."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsEarPinched",
	                    Func: (acting, acted, group) => {
	                        var _a;
	                        if (group.Name == "ItemEars")
	                            return this.isPlayerPinching((_a = acted.MemberNumber) !== null && _a !== void 0 ? _a : 0);
	                        return false;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "ear");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/Pinch.png"
	        });
	        // Patch Grab Arm
	        this.PatchActivity({
	            ActivityName: "Grope",
	            AddedTargets: [{
	                    Name: "ItemHood",
	                    SelfAllowed: false,
	                    TargetLabel: "Grab Horn",
	                    TargetAction: "SourceCharacter grabs TargetCharacter's horn."
	                }],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsArmAvailable",
	                    Func: (acting, acted, group) => {
	                        var _a;
	                        if (group.Name == "ItemArms")
	                            return !this.isPlayerGrabbing((_a = acted.MemberNumber) !== null && _a !== void 0 ? _a : 0);
	                        return true;
	                    }
	                }, {
	                    Name: "TargetHornAvailable",
	                    Func: (acting, acted, group) => {
	                        var _a, _b;
	                        if (group.Name == "ItemHood")
	                            return ((_b = (_a = InventoryGet(acted, "HairAccessory2")) === null || _a === void 0 ? void 0 : _a.Asset.Name) !== null && _b !== void 0 ? _b : "").toLocaleLowerCase().indexOf("horn") > -1 && !this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "horn");
	                        return true;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    var location = (_a = GetMetadata(args[1])) === null || _a === void 0 ? void 0 : _a.GroupName;
	                    if (!!target && !!location && location == "ItemArms")
	                        this.DoGrab(target, "arm");
	                    else if (!!target && !!location && location == "ItemHood")
	                        this.DoGrab(target, "horn");
	                    return next(args);
	                }
	            },
	        });
	        // Release Arm
	        this.AddActivity({
	            Activity: {
	                Name: "Release",
	                MaxProgress: 30,
	                Prerequisite: [""]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Arm",
	                    TargetAction: "SourceCharacter releases TargetCharacter's arm."
	                }, {
	                    Name: "ItemHood",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Horn",
	                    TargetAction: "SourceCharacter releases TargetCharacter's horn."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsGrabbed",
	                    Func: (acting, acted, group) => {
	                        var _a;
	                        if (group.Name == "ItemArms")
	                            return this.isPlayerGrabbing((_a = acted.MemberNumber) !== null && _a !== void 0 ? _a : 0);
	                        else if (group.Name == "ItemHood")
	                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "horn");
	                        return false;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    var location = (_a = GetMetadata(args[1])) === null || _a === void 0 ? void 0 : _a.GroupName;
	                    if (!!target && location == "ItemArms")
	                        this.DoRelease(target, "arm");
	                    else if (!!target && location == "ItemHood")
	                        this.DoRelease(target, "horn");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/Grope.png"
	        });
	        // PatchChoke Neck
	        this.PatchActivity({
	            ActivityName: "Choke",
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    var location = (_a = GetMetadata(args[1])) === null || _a === void 0 ? void 0 : _a.GroupName;
	                    if (!!target && !!location && location == "ItemNeck")
	                        this.DoGrab(target, "neck");
	                    return next(args);
	                }
	            },
	        });
	        // ReleaseNeck
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseNeck",
	                MaxProgress: 30,
	                Prerequisite: ["ZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemNeck",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Neck",
	                    TargetAction: "SourceCharacter releases TargetCharacter's neck."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsNeckChoked",
	                    Func: (acting, acted, group) => {
	                        if (group.Name == "ItemNeck")
	                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "neck");
	                        return false;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "neck");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/Choke.png"
	        });
	        // Patch HandGag
	        this.PatchActivity({
	            ActivityName: "HandGag",
	            CustomPrereqs: [
	                {
	                    Name: "TargetNotAlreadyHandGagged",
	                    Func: (acting, acted, group) => {
	                        if (group.Name == "ItemMouth")
	                            return !this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "mouth");
	                        return true;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    var location = (_a = GetMetadata(args[1])) === null || _a === void 0 ? void 0 : _a.GroupName;
	                    if (!!target && !!location && location == "ItemMouth")
	                        this.DoGrab(target, "mouth");
	                    return next(args);
	                }
	            },
	        });
	        // ReleaseMouth
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseMouth",
	                MaxProgress: 30,
	                Prerequisite: ["ZoneAccessible", "UseHands"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    SelfAllowed: false,
	                    TargetLabel: "Release Mouth",
	                    TargetAction: "SourceCharacter releases TargetCharacter's mouth."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsHandGagged",
	                    Func: (acting, acted, group) => {
	                        if (group.Name == "ItemMouth")
	                            return !!this.hands.find(h => h.Member == acted.MemberNumber && h.Type == "mouth");
	                        return false;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "mouth");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/HandGag.png"
	        });
	        // GrabTongueWithFoot
	        this.AddActivity({
	            Activity: {
	                Name: "GrabTongueWithFoot",
	                MaxProgress: 75,
	                MaxProgressSelf: 30,
	                Prerequisite: ["ZoneAccessible", "UseFeet", "TargetCanUseTongue"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    SelfAllowed: false,
	                    TargetLabel: "Stuff with Foot",
	                    TargetAction: "SourceCharacter shoves PronounPossessive foot into TargetCharacter's mouth, playing with and grabbing their tongue with PronounPossessive toes."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetCanToeTongueGrab",
	                    Func: (acting, acted, group) => {
	                        return InventoryPrerequisiteMessage(acting, "NakedFeet") === "" && (!this.myFootInMouth || this.myFootInMouth < 0);
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoGrab(target, "mouth-with-foot");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/MassageFeet.png"
	        });
	        // ReleaseFootGrabbedTongue
	        this.AddActivity({
	            Activity: {
	                Name: "ReleaseFootGrabbedTongue",
	                MaxProgress: 20,
	                MaxProgressSelf: 20,
	                Prerequisite: ["ZoneAccessible", "UseFeet"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    SelfAllowed: false,
	                    TargetLabel: "Remove Foot",
	                    TargetAction: "SourceCharacter removes PronounPossessive foot from TargetCharacter's mouth."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetTongueIsToeGrabbed",
	                    Func: (acting, acted, group) => {
	                        return this.myFootInMouth == acted.MemberNumber;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!!target)
	                        this.DoRelease(target, "mouth-with-foot");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Activity/MassageFeet.png"
	        });
	        // Tug Crotch Rope
	        this.AddActivity({
	            Activity: {
	                Name: "Tug",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseHands", "ZoneAccessible", "ZoneNaked"]
	            },
	            Targets: [
	                {
	                    Name: "ItemPelvis",
	                    SelfAllowed: true,
	                    TargetAction: "SourceCharacter tugs on TargetCharacter's crotch rope.",
	                    TargetSelfAction: "SourceCharacter tugs lewdly on PronounPossessive own crotch rope."
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "HasCrotchRope",
	                    Func: (acting, acted, group) => {
	                        return acted.HasEffect("CrotchRope");
	                    }
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/ItemPelvis/HempRope_NormalOverPanties.png"
	        });
	    }
	    get customGagged() {
	        return this.heldBy.some(h => h.Type == "tongue" || h.Type == "mouth") || this.footInMyMouth >= 0;
	    }
	    ;
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Activities);
	    }
	    AddCustomPrereq(prereq) {
	        if (!this.CustomPrerequisiteFuncs.get(prereq.Name))
	            this.CustomPrerequisiteFuncs.set(prereq.Name, prereq.Func);
	    }
	    RegisterCustomFuncs(bundle, activity) {
	        var _a;
	        (_a = bundle.CustomPrereqs) === null || _a === void 0 ? void 0 : _a.forEach(prereq => {
	            if (activity.Prerequisite.indexOf(prereq.Name) == -1)
	                activity.Prerequisite.push(prereq.Name);
	            this.AddCustomPrereq(prereq);
	        });
	        if (!!bundle.CustomReaction && !this.CustomIncomingActivityReactions.get(activity.Name))
	            this.CustomIncomingActivityReactions.set(activity.Name, bundle.CustomReaction.Func);
	        if (!!bundle.CustomImage && !this.CustomImages.get(activity.Name))
	            this.CustomImages.set(activity.Name, bundle.CustomImage);
	        if (!!bundle.CustomAction && !this.CustomActionCallbacks.get(activity.Name))
	            this.CustomActionCallbacks.set(activity.Name, bundle.CustomAction.Func);
	        if (!!bundle.CustomPreparse && !this.CustomPreparseCallbacks.get(activity.Name))
	            this.CustomPreparseCallbacks.set(activity.Name, bundle.CustomPreparse.Func);
	    }
	    CheckForPatchedActivity(activityName, activityMsg) {
	        return this.PatchedActivities.indexOf(activityName) > -1 && !!ActivityDictionaryText(activityMsg);
	    }
	    PatchActivity(patch) {
	        var activity = ActivityFemale3DCG.find(a => a.Name == patch.ActivityName);
	        if (!activity)
	            return;
	        if (!!patch.AddedTargets) {
	            patch.AddedTargets.forEach(tgt => {
	                this.AddTargetToActivity(activity, tgt);
	            });
	        }
	        if (!!patch.RemovedTargets) {
	            patch.RemovedTargets.forEach(tgt => {
	                activity.Target = activity.Target.filter(t => t != tgt);
	                if (!!activity.TargetSelf && Array.isArray(activity.TargetSelf))
	                    activity.TargetSelf = activity.TargetSelf.filter(t => t != tgt);
	            });
	        }
	        if (!!patch.RemovedPrerequisites) {
	            patch.RemovedPrerequisites.forEach(prereq => {
	                activity.Prerequisite = activity.Prerequisite.filter(p => p != prereq);
	            });
	        }
	        this.RegisterCustomFuncs(patch, activity);
	        this.PatchedActivities.push(patch.ActivityName);
	    }
	    AddTargetToActivity(activity, tgt) {
	        var _a, _b, _c;
	        tgt.TargetLabel = (_a = tgt.TargetLabel) !== null && _a !== void 0 ? _a : activity.Name.substring(5);
	        if (tgt.SelfAllowed) {
	            if (!activity.TargetSelf)
	                activity.TargetSelf = [];
	            if (typeof activity.TargetSelf != "boolean" && activity.TargetSelf.indexOf(tgt.Name) == -1) {
	                activity.TargetSelf.push(tgt.Name);
	            }
	        }
	        if (!tgt.SelfOnly) {
	            if (!activity.Target)
	                activity.Target = [];
	            if (activity.Target.indexOf(tgt.Name) == -1) {
	                activity.Target.push(tgt.Name);
	            }
	        }
	        ActivityDictionary === null || ActivityDictionary === void 0 ? void 0 : ActivityDictionary.push([
	            "Label-ChatOther-" + tgt.Name + "-" + activity.Name,
	            tgt.TargetLabel
	        ]);
	        ActivityDictionary === null || ActivityDictionary === void 0 ? void 0 : ActivityDictionary.push([
	            "ChatOther-" + tgt.Name + "-" + activity.Name,
	            tgt.TargetAction
	        ]);
	        if (tgt.SelfAllowed) {
	            ActivityDictionary === null || ActivityDictionary === void 0 ? void 0 : ActivityDictionary.push([
	                "Label-ChatSelf-" + tgt.Name + "-" + activity.Name,
	                (_b = tgt.TargetSelfLabel) !== null && _b !== void 0 ? _b : tgt.TargetLabel
	            ]);
	            ActivityDictionary === null || ActivityDictionary === void 0 ? void 0 : ActivityDictionary.push([
	                "ChatSelf-" + tgt.Name + "-" + activity.Name,
	                (_c = tgt.TargetSelfAction) !== null && _c !== void 0 ? _c : tgt.TargetAction
	            ]);
	        }
	    }
	    AddActivity(bundle) {
	        var _a, _b, _c;
	        if (!bundle.Targets || bundle.Targets.length <= 0)
	            return;
	        let activity = bundle.Activity;
	        activity.Target = (_a = activity.Target) !== null && _a !== void 0 ? _a : [];
	        activity.Prerequisite = (_b = activity.Prerequisite) !== null && _b !== void 0 ? _b : [];
	        activity.Name = "LSCG_" + activity.Name;
	        this.RegisterCustomFuncs(bundle, bundle.Activity);
	        ActivityDictionary === null || ActivityDictionary === void 0 ? void 0 : ActivityDictionary.push([
	            "Activity" + activity.Name,
	            (_c = bundle.Targets[0].TargetLabel) !== null && _c !== void 0 ? _c : activity.Name.substring(5)
	        ]);
	        bundle.Targets.forEach(tgt => {
	            this.AddTargetToActivity(activity, tgt);
	        });
	        ActivityFemale3DCG.push(activity);
	        ActivityFemale3DCGOrdering.push(activity.Name);
	    }
	    InitTongueGrabHooks() {
	        // Allow for similar "hand-gagging" when certain custom actions are done
	        hookFunction("ServerSend", 1, (args, next) => {
	            var _a, _b;
	            if (args[0] == "ChatRoomChat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Type) == "Chat") {
	                if (this.customGagged) {
	                    let gagIncrease = 2 * this.heldBy.filter(h => h.Type == "tongue" || h.Type == "mouth").length + (((_b = this.footInMyMouth) !== null && _b !== void 0 ? _b : -1) > -1 ? 3 : 0);
	                    let currentGagLevel = callOriginal("SpeechGetTotalGagLevel", [Player, true]);
	                    args[1].Content = SpeechGarbleByGagLevel(currentGagLevel + gagIncrease, args[1].Content);
	                    args[1].Content = SpeechStutter(Player, args[1].Content);
	                    args[1].Content = SpeechBabyTalk(Player, args[1].Content);
	                }
	            }
	            next(args);
	        });
	        this.PatchActivity({
	            ActivityName: "Bite",
	            CustomPrereqs: [
	                {
	                    Name: "CheckTongueGrabbing",
	                    Func: (acting, acted, group) => {
	                        if (this.customGagged && (group === null || group === void 0 ? void 0 : group.Name) == "ItemHands")
	                            return this.tongueGrabbedByMember == acted.MemberNumber || this.heldBy.some(h => h.Type == "mouth" && h.Member == acted.MemberNumber);
	                        else
	                            return true;
	                    }
	                }
	            ]
	        });
	        let failedLinkActions = [
	            "%NAME%'s whimpers, %POSSESSIVE% tongue held tightly.",
	            "%NAME% strains, trying to pull %POSSESSIVE% tongue free.",
	            "%NAME% starts to drool, %POSSESSIVE% tongue held fast."
	        ];
	        hookFunction('ServerSend', 5, (args, next) => {
	            let sendType = args[0];
	            let data = args[1];
	            if (sendType == "ChatRoomChat" && (data === null || data === void 0 ? void 0 : data.Type) == "Activity") {
	                var activityName = GetActivityName(data);
	                if (activityName == "Lick" && this.heldBy.some(h => h.Type == "tongue"))
	                    SendAction(failedLinkActions[getRandomInt(failedLinkActions.length)]);
	                else
	                    return next(args);
	            }
	            else {
	                return next(args);
	            }
	        }, ModuleCategory.Activities);
	    }
	    InitHandHoldHooks() {
	        hookFunction('Player.CanWalk', 1, (args, next) => {
	            if (this.heldBy.filter(h => h.Type != "hand").length > 0)
	                return false;
	            return next(args);
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomLeave", 1, (args, next) => {
	            if (this.RoomAllowsLeashing) {
	                if (this.earPinchingMemberList.length > 0) {
	                    var chars = this.earPinchingMemberList.map(id => getCharacter(id));
	                    if (chars.length == 1)
	                        SendAction("%NAME% leads %OPP_NAME% out of the room by the ear.", chars[0]);
	                    else
	                        SendAction("%NAME% leads " + CharacterNickname(chars[0]) + " and " + CharacterNickname(chars[1]) + " out of the room by their ears.");
	                }
	                else if (this.armGrabbingMemberList.length > 0) {
	                    var chars = this.armGrabbingMemberList.map(id => getCharacter(id));
	                    if (chars.length == 1)
	                        SendAction("%NAME% roughly pulls %OPP_NAME% out of the room by the arm.", chars[0]);
	                    else
	                        SendAction("%NAME% roughly pulls " + CharacterNickname(chars[0]) + " and " + CharacterNickname(chars[1]) + " out of the room by their arms.");
	                }
	                else if (this.tongueGrabbedMemberList.length > 0) {
	                    var chars = this.tongueGrabbedMemberList.map(id => getCharacter(id));
	                    if (chars.length == 1)
	                        SendAction("%NAME% tugs %OPP_NAME% out of the room by the tongue.", chars[0]);
	                    else
	                        SendAction("%NAME% tugs " + CharacterNickname(chars[0]) + " and " + CharacterNickname(chars[1]) + " out of the room by their tongues.");
	                }
	                else if (this.customLeashedObjs.length > 0) {
	                    if (this.customLeashedObjs.length == 1)
	                        SendAction(`%NAME% leads %OPP_NAME% out of the room by the ${this.customLeashedObjs[0].Type}.`, getCharacter(this.customLeashedObjs[0].Member));
	                    else
	                        SendAction("%NAME% leads " + CharacterNickname(getCharacter(this.customLeashedObjs[0].Member)) + " and " + CharacterNickname(getCharacter(this.customLeashedObjs[1].Member)) + " out of the room.");
	                }
	            }
	            if (this.myFootInMouth > -1) {
	                let char = getCharacter(this.myFootInMouth);
	                if (!!char)
	                    this.DoRelease(char, "mouth-with-foot");
	            }
	            if (this.footInMyMouth > -1) {
	                let char = getCharacter(this.footInMyMouth);
	                if (!!char)
	                    this.DoRelease(char, "mouth-with-foot");
	            }
	            return next(args);
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomDrawCharacterOverlay", 1, (args, next) => {
	            const ret = next(args);
	            const [C, CharX, CharY, Zoom] = args;
	            if (typeof CharX === "number" &&
	                typeof CharY === "number" &&
	                typeof Zoom === "number" &&
	                ChatRoomHideIconState === 0) {
	                let isGrabbing = this.hands.filter(h => h.Member == C.MemberNumber);
	                if (this.myFootInMouth > -1 && this.myFootInMouth == C.MemberNumber)
	                    isGrabbing = isGrabbing.concat({
	                        Member: this.myFootInMouth,
	                        Type: "mouth-with-foot"
	                    });
	                let grabbedBy = this.heldBy.filter(h => h.Member == C.MemberNumber);
	                if (this.footInMyMouth > -1 && this.footInMyMouth == C.MemberNumber)
	                    grabbedBy = grabbedBy.concat({
	                        Member: this.footInMyMouth,
	                        Type: "mouth-with-foot"
	                    });
	                let grabList = isGrabbing.map(g => ({
	                    Grab: g,
	                    IsGrabber: true
	                })).concat(grabbedBy.map(g => ({
	                    Grab: g,
	                    IsGrabber: false
	                })));
	                grabList.forEach((g, ix, arr) => {
	                    let yOffset = ix * 40 * Zoom;
	                    let icon = this.GetIconForGrabType(g.Grab.Type);
	                    DrawCircle(CharX + 420 * Zoom, CharY + 60 * Zoom + yOffset, 20 * Zoom, 1, "Black", g.IsGrabber ? "White" : "#90E4C1");
	                    DrawImageResize(icon, CharX + 405 * Zoom, CharY + 45 * Zoom + yOffset, 30 * Zoom, 30 * Zoom);
	                });
	            }
	            return ret;
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomCanBeLeashedBy", 1, (args, next) => {
	            let sourceMemberNumber = args[0];
	            let C = args[1];
	            if (this.isCustomLeashedBy(sourceMemberNumber) && this.RoomAllowsLeashing) {
	                // Have to not be tethered, and need a leash
	                var isTrapped = false;
	                var neckLock = null;
	                for (let A = 0; A < C.Appearance.length; A++)
	                    if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Family == C.AssetFamily)) {
	                        if (InventoryItemHasEffect(C.Appearance[A], "Leash", true) && C.Appearance[A].Asset.Group.Name == "ItemNeckRestraints") {
	                            neckLock = InventoryGetLock(C.Appearance[A]);
	                        }
	                        else if (InventoryItemHasEffect(C.Appearance[A], "Tethered", true) || InventoryItemHasEffect(C.Appearance[A], "Mounted", true) || InventoryItemHasEffect(C.Appearance[A], "Enclose", true) || InventoryItemHasEffect(C.Appearance[A], "OneWayEnclose", true)) {
	                            isTrapped = true;
	                        }
	                    }
	                if (!isTrapped) {
	                    if (sourceMemberNumber == 0 || !neckLock || (!neckLock.Asset.OwnerOnly && !neckLock.Asset.LoverOnly && !neckLock.Asset.FamilyOnly) ||
	                        (neckLock.Asset.OwnerOnly && C.IsOwnedByMemberNumber(sourceMemberNumber)) ||
	                        (neckLock.Asset.FamilyOnly && C.IsFamilyOfPlayer()) ||
	                        (neckLock.Asset.LoverOnly && C.IsLoverOfMemberNumber(sourceMemberNumber))) {
	                        return true;
	                    }
	                }
	            }
	            else
	                return next(args);
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomPingLeashedPlayers", 1, (args, next) => {
	            next(args);
	            if (this.hands.length > 0) {
	                this.hands.forEach(hand => {
	                    ServerSend("ChatRoomChat", { Content: "PingHoldLeash", Type: "Hidden", Target: hand.Member });
	                    ServerSend("AccountBeep", { MemberNumber: hand.Member, BeepType: "Leash" });
	                });
	            }
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomDoPingLeashedPlayers", 1, (args, next) => {
	            next(args);
	            let SenderCharacter = args[0];
	            if (!ChatRoomCanBeLeashedBy(SenderCharacter.MemberNumber, Player)) {
	                this.DoEscape(SenderCharacter);
	            }
	        }, ModuleCategory.Activities);
	        hookFunction("ServerAccountBeep", 1, (args, next) => {
	            next(args);
	            let data = args[0];
	            if (data.BeepType == "Leash" && this.customLeashedByMemberNumbers.indexOf(data.MemberNumber) > -1 && data.ChatRoomName) {
	                if (Player.OnlineSharedSettings && Player.OnlineSharedSettings.AllowPlayerLeashing != false && (CurrentScreen != "ChatRoom" || !ChatRoomData || (CurrentScreen == "ChatRoom" && ChatRoomData.Name != data.ChatRoomName))) {
	                    if (ChatRoomCanBeLeashedBy(data.MemberNumber, Player) && ChatSelectGendersAllowed(data.ChatRoomSpace, Player.GetGenders())) {
	                        ChatRoomJoinLeash = data.ChatRoomName;
	                        DialogLeave();
	                        ChatRoomClearAllElements();
	                        if (CurrentScreen == "ChatRoom") {
	                            ServerSend("ChatRoomLeave", "");
	                            CommonSetScreen("Online", "ChatSearch");
	                        }
	                        else
	                            ChatRoomStart(data.ChatRoomSpace, "", null, null, "Introduction", BackgroundsTagList); //CommonSetScreen("Room", "ChatSearch")
	                    }
	                    else {
	                        // If the leading character is no longer allowed or goes somewhere blocked, remove them from our leading lists.
	                        this.releaseGrab(data.MemberNumber, undefined);
	                    }
	                }
	            }
	        }, ModuleCategory.Activities);
	        hookFunction("ChatRoomSync", 1, (args, next) => {
	            var ret = next(args);
	            var currentRoomIds = ChatRoomCharacter.map(c => c.MemberNumber);
	            this.customLeashedMemberNumbers.filter(id => currentRoomIds.indexOf(id) == -1).forEach(memberNumber => {
	                ServerSend("AccountBeep", { MemberNumber: memberNumber, BeepType: "Leash" });
	            });
	        }, ModuleCategory.Activities);
	        OnAction(1, ModuleCategory.Activities, (data, sender, msg, metadata) => {
	            if ((data === null || data === void 0 ? void 0 : data.Content) == "ServerDisconnect") {
	                let num = sender === null || sender === void 0 ? void 0 : sender.MemberNumber;
	                if (!!num) {
	                    this.releaseGrab(num, undefined);
	                    this.releasedBy(num, undefined);
	                }
	            }
	        });
	    }
	    get customLeashedObjs() {
	        return this.hands.concat(this.heldBy.filter(h => h.Type == "hand"));
	    }
	    get customLeashedMemberNumbers() {
	        return this.customLeashedObjs.map(h => h.Member);
	    }
	    get customLeashedByMemberNumbers() {
	        return this.heldBy.concat(this.hands.filter(h => h.Type == "hand")).map(h => h.Member);
	    }
	    get maxHands() {
	        return 2;
	    }
	    addGrab(member, type) {
	        if (!member || member < 0)
	            return;
	        if (type == "mouth-with-foot") {
	            if (!!this.myFootInMouth && this.myFootInMouth >= 0)
	                return;
	            this.myFootInMouth = member;
	            return;
	        }
	        if (!!this.hands.find(h => h.Member == member && h.Type == type))
	            return;
	        let removed;
	        if (this.hands.length + 1 > this.maxHands)
	            removed = this.hands.shift();
	        this.hands.push({
	            Member: member,
	            Type: type
	        });
	        if (!!removed) {
	            var char = getCharacter(removed.Member);
	            if (!!char) {
	                this.DoRelease(char, removed.Type);
	            }
	        }
	        return removed;
	    }
	    releaseGrab(member, type) {
	        if (!type)
	            this.hands = this.hands.filter(h => h.Member != member);
	        else if (type == "mouth-with-foot")
	            this.myFootInMouth = -1;
	        else
	            this.hands = this.hands.filter(h => !(h.Member == member && h.Type == type));
	    }
	    grabbedBy(member, type) {
	        var _a, _b;
	        let sender = getCharacter(member);
	        if (type == "mouth-with-foot") {
	            if (!!this.footInMyMouth && this.footInMyMouth >= 0 && !!sender)
	                this.DoRelease(sender, type);
	            this.footInMyMouth = member;
	            return true;
	        }
	        if (type == "neck") {
	            if (!!sender)
	                this.collarModule.HandChoke(sender);
	        }
	        if (!member || member < 0 || !!this.heldBy.find(h => h.Member == member && h.Type == type))
	            return false;
	        this.heldBy.push({
	            Member: member,
	            Type: type
	        });
	        if (type == "tongue") {
	            this.prevMouth = (_b = (_a = WardrobeGetExpression(Player)) === null || _a === void 0 ? void 0 : _a.Mouth) !== null && _b !== void 0 ? _b : null;
	            CharacterSetFacialExpression(Player, "Mouth", "Ahegao");
	        }
	        return true;
	    }
	    releasedBy(member, type) {
	        if (type == "mouth-with-foot" || !type) {
	            if (member == this.footInMyMouth)
	                this.footInMyMouth = -1;
	            if (!!type)
	                return;
	        }
	        if (this.heldBy.filter(h => h.Member == member && h.Type == "tongue").length == 1 && (!type || type == "tongue")) {
	            CharacterSetFacialExpression(Player, "Mouth", this.prevMouth);
	            this.prevMouth = null;
	        }
	        if (this.heldBy.filter(h => h.Member == member && h.Type == "neck").length == 1 && (!type || type == "neck")) {
	            this.collarModule.ReleaseHandChoke(getCharacter(member), true);
	        }
	        if (!type)
	            this.heldBy = this.heldBy.filter(h => h.Member != member);
	        else
	            this.heldBy = this.heldBy.filter(h => !(h.Member == member && h.Type == type));
	    }
	    get handHoldingMemberList() { return this.hands.filter(x => x.Type == "hand").map(h => h.Member); }
	    ;
	    get earPinchedByMember() { var _a; return (_a = this.heldBy.find(x => x.Type == "ear")) === null || _a === void 0 ? void 0 : _a.Member; }
	    ;
	    get earPinchingMemberList() { return this.hands.filter(x => x.Type == "ear").map(h => h.Member); }
	    ;
	    get armGrabbedByMember() { var _a; return (_a = this.heldBy.find(x => x.Type == "arm")) === null || _a === void 0 ? void 0 : _a.Member; }
	    ;
	    get armGrabbingMemberList() { return this.hands.filter(x => x.Type == "arm").map(h => h.Member); }
	    ;
	    get tongueGrabbedByMember() { var _a; return (_a = this.heldBy.find(x => x.Type == "tongue")) === null || _a === void 0 ? void 0 : _a.Member; }
	    ;
	    get tongueGrabbedMemberList() { return this.hands.filter(x => x.Type == "tongue").map(h => h.Member); }
	    ;
	    isCustomLeashedBy(sourceMember) {
	        return !!this.heldBy.find(h => h.Member == sourceMember);
	    }
	    isPlayerHoldingHandsWith(holdingMemberNumber) {
	        return this.handHoldingMemberList.indexOf(holdingMemberNumber) > -1;
	    }
	    isPlayerPinchedBy(member) {
	        return this.earPinchedByMember == member;
	    }
	    isPlayerPinching(member) {
	        return this.earPinchingMemberList.indexOf(member) > -1;
	    }
	    isPlayerGrabbedBy(member) {
	        return this.armGrabbedByMember == member;
	    }
	    isPlayerGrabbing(member) {
	        return this.armGrabbingMemberList.indexOf(member) > -1;
	    }
	    isHandLeashed(C) {
	        if (!C) {
	            return this.handHoldingMemberList.length > 0;
	        }
	        return this.isPlayerHoldingHandsWith(C.MemberNumber);
	    }
	    DoGrab(target, type) {
	        // Only bother custom grabbing other LSCG users, vanilla won't follow. Also don't do grab if room doesn't allow leashing
	        if ((!this.RoomAllowsLeashing &&
	            type != "mouth-with-foot") ||
	            !target.LSCG ||
	            !target.MemberNumber ||
	            target.MemberNumber == Player.MemberNumber)
	            return;
	        sendLSCGCommand(target, "grab", [{
	                name: "type",
	                value: type
	            }]);
	        this.addGrab(target.MemberNumber, type);
	    }
	    ;
	    DoRelease(target, type) {
	        if (!target.MemberNumber)
	            return;
	        sendLSCGCommand(target, "release", [{
	                name: "type",
	                value: type
	            }]);
	        this.releaseGrab(target.MemberNumber, type);
	    }
	    DoEscape(escapeFrom) {
	        if (!escapeFrom.MemberNumber)
	            return;
	        this.releasedBy(escapeFrom.MemberNumber, undefined);
	        sendLSCGCommand(escapeFrom, "escape");
	    }
	    IncomingGrab(sender, grabType) {
	        if (!!sender.MemberNumber) {
	            let doNotify = this.grabbedBy(sender.MemberNumber, grabType);
	            if (doNotify && grabType != "hand")
	                this.NotifyAboutEscapeCommand(sender, grabType);
	        }
	    }
	    IncomingRelease(sender, grabType) {
	        if (!!sender.MemberNumber)
	            this.releasedBy(sender.MemberNumber, grabType);
	    }
	    IncomingEscape(sender, escapeFromMemberNumber) {
	        if (escapeFromMemberNumber == Player.MemberNumber && !!sender.MemberNumber) {
	            this.releaseGrab(sender.MemberNumber, undefined);
	        }
	    }
	    NotifyAboutEscape(escapee) {
	        LSCG_SendLocal(`${CharacterNickname(escapee)} has escaped from your grasp!`);
	    }
	    NotifyAboutEscapeCommand(grabber, type) {
	        if (type == "mouth-with-foot")
	            LSCG_SendLocal(`${CharacterNickname(grabber)} has filled your mouth with their foot! <br>[You can try '/lscg escape' to try and escape]`);
	        else
	            LSCG_SendLocal(`Your ${type} has been grabbed by ${CharacterNickname(grabber)}! <br>[You can try '/lscg escape' to try and break free]`);
	    }
	    TryEscape() {
	        if (this.escapeAttempted > 0) {
	            if (CommonTime() < (this.escapeAttempted + this.escapeCooldown)) {
	                LSCG_SendLocal(`You are too tired from your last escape attempt!`);
	                return;
	            }
	            else {
	                this.escapeAttempted = 0;
	            }
	        }
	        let grabbingMembers = this.heldBy.filter(h => h.Type != "hand").map(h => h.Member);
	        if (this.footInMyMouth >= 0)
	            grabbingMembers = grabbingMembers.concat(this.footInMyMouth);
	        let grabbingMemberNumber = grabbingMembers[0];
	        if (grabbingMemberNumber < 0) {
	            LSCG_SendLocal(`You are not grabbed by anyone!`);
	            return;
	        }
	        var grabber = getCharacter(grabbingMemberNumber);
	        if (!grabber) {
	            LSCG_SendLocal(`Cannot locate grabber! [Try refreshing if they DC'd]`);
	            return;
	        }
	        SendAction(`${CharacterNickname(Player)} tries their best to escape from ${CharacterNickname(grabber)}'s grip...`);
	        setTimeout(() => {
	            var _a;
	            if (!grabber || !(grabber === null || grabber === void 0 ? void 0 : grabber.MemberNumber))
	                return;
	            let check = (_a = getModule("ItemUseModule")) === null || _a === void 0 ? void 0 : _a.MakeActivityCheck(Player, grabber);
	            if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
	                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}successfully breaks free from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
	                this.DoEscape(grabber);
	            }
	            else {
	                SendAction(`${CharacterNickname(Player)} ${check.AttackerRoll.TotalStr}squirms and wriggles but fails to escape from ${CharacterNickname(grabber)}'s ${check.DefenderRoll.TotalStr}grasp!`);
	                this.escapeAttempted = CommonTime();
	            }
	        }, 4000);
	    }
	    get RoomAllowsLeashing() {
	        return (ChatRoomData && ChatRoomData.BlockCategory && ChatRoomData.BlockCategory.indexOf("Leashing") < 0) || !ChatRoomData;
	    }
	    IsCharacterGrabbedOrGrabbing(C, type) {
	        if (!C.MemberNumber)
	            return false;
	        return this.hands.concat(this.heldBy).filter(h => h.Type == type).some(h => h.Member == C.MemberNumber);
	    }
	    GetIconForGrabType(type) {
	        switch (type) {
	            case "mouth": return ICONS.MUTE;
	            case "ear": return ICONS.EAR;
	            case "hand": return ICONS.HOLD_HANDS;
	            case "tongue": return ICONS.TONGUE;
	            case "neck": return ICONS.NECK;
	            case "mouth-with-foot": return "Icons/Management.png";
	            case "horn":
	            case "arm":
	            default: return "Icons/Battle.png";
	        }
	    }
	}

	const miniGameMap = new Map();
	function miniGames() {
	    return [...miniGameMap.values()];
	}
	function registerMiniGame(miniGame) {
	    var _a;
	    var name = miniGame.name;
	    if (miniGameMap.has(name))
	        return (_a = miniGameMap.get(name)) !== null && _a !== void 0 ? _a : miniGame;
	    else {
	        window[name + "Run"] = () => miniGame.Run();
	        window[name + "Click"] = () => miniGame.Click();
	        window[name + "Load"] = () => miniGame.Load();
	        window[name + "Unload"] = () => miniGame.Unload();
	        window[name + "Resize"] = () => miniGame.Resize();
	        window[name + "KeyDown"] = () => miniGame.KeyDown();
	        window[name + "Exit"] = () => miniGame.Exit();
	        miniGameMap.set(name, miniGame);
	        return miniGame;
	    }
	}
	function getMiniGame(miniGameType) {
	    return miniGameMap.get(miniGameType);
	}
	hookFunction("TextLoad", 5, (args, next) => {
	    if (CurrentScreen.startsWith("LSCG_"))
	        return;
	    else
	        return next(args);
	});
	class BaseMiniGame {
	    get name() {
	        return "LSCG_" + this.constructor.name;
	    }
	    Load() { }
	    Unload() { }
	    Resize() { }
	    KeyDown() { }
	    Exit() { }
	}

	class SleepyMiniGame extends BaseMiniGame {
	    constructor(module) {
	        super();
	        this.startText = "You are feeling extrodinarily sleepy...";
	        this.hintText = "Click to keep your eyes open. Try to stay awake!";
	        this.failText = "You fell asleep!";
	        this.successText = "You shake out of it!";
	        this.tintColor = [{ r: 0, g: 0, b: 0, a: 0 }];
	        this.GameStartTime = 0;
	        this.GameEndTime = 0;
	        this.StartDelay = 4000; // 2 second delay before starting
	        this.SleepyVelocity = 0;
	        this.SleepyPosition = 0;
	        this.SleepyAcceleration = 0;
	        this.SleepyMaxPosition = 100;
	        this.SleepyGameDuration = 5000;
	        this.SleepyNextTick = 0;
	        this.SleepyText = "";
	        this.SleepyChallenge = 0;
	        this.BaseGameLength = 6000;
	        this.removeBlurHook = () => { };
	        this.removeHasTintHook = () => { };
	        this.removeGetTintHook = () => { };
	        this.Module = module;
	    }
	    End(Victory) {
	        MiniGameVictory = Victory;
	        MiniGameEnded = true;
	        MiniGameTimer = CommonTime();
	        this.GameEndTime = MiniGameTimer;
	        CharacterSetFacialExpression(Player, "Eyes", Victory ? null : "Closed");
	        if (Victory)
	            SkillProgress(Player, "Willpower", this.SleepyChallenge);
	    }
	    Load() {
	        DrawFlashScreen("#000000", 750, 1000);
	        this.GameStartTime = CommonTime() + this.StartDelay;
	        this.SleepyVelocity = 0;
	        this.SleepyAcceleration = 0;
	        if (typeof MiniGameDifficulty != "number") {
	            MiniGameTimer = CommonTime() + this.BaseGameLength; // 5 seconds base
	            this.SleepyChallenge = 5;
	        }
	        else {
	            var difficultyTimeAdd = (MiniGameDifficulty - 8) * .25;
	            var willMod = (SkillGetLevel(Player, "Willpower") / 10) * difficultyTimeAdd;
	            this.SleepyGameDuration = this.BaseGameLength + 1000 * (difficultyTimeAdd - willMod);
	            MiniGameTimer = this.GameStartTime + this.SleepyGameDuration; // One extra second per challenge level, minus a third of a second per willpower.
	            this.SleepyChallenge = MiniGameDifficulty;
	        }
	        this.SleepyMaxPosition = 400;
	        this.SleepyPosition = this.SleepyMaxPosition;
	        console.info("Sleepy minigame started: difficulty - " + this.SleepyChallenge + " time - " + this.SleepyGameDuration);
	        this.removeBlurHook = hookFunction("Player.GetBlurLevel", 10, (args, next) => {
	            var _a;
	            if (this.IsStartDelay) {
	                return 5;
	            }
	            var maxBlur = 20;
	            var progBlurLevel = (1 - (this.SleepyPosition / this.SleepyMaxPosition)) * maxBlur;
	            return ((_a = Player.GraphicsSettings) === null || _a === void 0 ? void 0 : _a.AllowBlur) ? (next(args) + progBlurLevel) : next(args);
	        });
	        this.removeHasTintHook = hookFunction("Player.HasTints", 10, (args, next) => {
	            var _a;
	            return ((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints) ? true : next(args);
	        });
	        this.removeGetTintHook = hookFunction("Player.GetTints", 10, (args, next) => {
	            var _a;
	            var progTintAlpha = Math.min(1, .1 + (1 - (this.SleepyPosition / this.SleepyMaxPosition)));
	            var tint = this.tintColor;
	            tint[0].a = progTintAlpha;
	            return ((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints) ? tint : next(args);
	        });
	        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	    }
	    Unload() {
	        this.removeBlurHook();
	        this.removeHasTintHook();
	        this.removeGetTintHook();
	    }
	    get IsStartDelay() {
	        return CommonTime() < this.GameStartTime;
	    }
	    get IsGameActive() {
	        return CommonTime() < MiniGameTimer && !MiniGameEnded && !this.GameFailed;
	    }
	    get IsGameTimeout() {
	        return CommonTime() >= MiniGameTimer && !MiniGameEnded;
	    }
	    get IsEndGameReport() {
	        return CommonTime() < (this.GameEndTime + 5000);
	    }
	    get GameFailed() {
	        return this.SleepyPosition <= 0;
	    }
	    RunGame(delta) {
	        var timeElapsed = (this.SleepyGameDuration + CommonTime() - MiniGameTimer) / 1000;
	        // Adjust acceleration every .4s ticks
	        if (CommonTime() > this.SleepyNextTick) {
	            this.SleepyNextTick = CommonTime() + 400;
	            this.SleepyAcceleration = -(this.SleepyChallenge * 1.25) - timeElapsed * Math.random();
	            this.UpdateEyes();
	        }
	        this.SleepyVelocity = Math.min(this.SleepyVelocity, this.SleepyVelocity + this.SleepyAcceleration * 0.25);
	        if (this.SleepyPosition >= this.SleepyMaxPosition)
	            this.SleepyVelocity = Math.min(0, this.SleepyVelocity);
	        if (this.SleepyPosition > 0) {
	            this.SleepyPosition += this.SleepyVelocity / 1000 * delta * 3.5;
	        }
	        this.SleepyPosition = Math.max(0, Math.min(this.SleepyPosition, this.SleepyMaxPosition));
	        DrawProgressBar(500 - this.SleepyMaxPosition, 800, 2 * this.SleepyMaxPosition, 50, 100 * (this.SleepyPosition / this.SleepyMaxPosition));
	        DrawText(this.hintText, 500, 875, "white", "black");
	        // var debugStr = "Chal: " + this.SleepyChallenge + " Pos: " + this.SleepyPosition + " Vel: " + this.SleepyVelocity + " Acc: " + this.SleepyAcceleration;
	        // var prev = MainCanvas.textAlign;
	        // MainCanvas.textAlign = "left";
	        // DrawText(debugStr, 0, 100, "White", "Black");
	        // MainCanvas.textAlign = prev;
	        // console.info(debugStr);
	    }
	    UpdateEyes() {
	        if (this.SleepyPosition < 50)
	            CharacterSetFacialExpression(Player, "Eyes", "Closed");
	        else if (this.SleepyPosition < 100)
	            CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
	        else if (this.SleepyPosition < 250)
	            CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        else
	            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	    }
	    Run() {
	        ChatRoomRun();
	        if (this.IsStartDelay) {
	            DrawText(this.startText, 500, 500, "white", "black");
	        }
	        else if (this.IsGameActive) {
	            this.RunGame(TimerRunInterval);
	        }
	        else if ((this.IsGameTimeout || this.GameFailed) && !MiniGameEnded) {
	            this.End(this.SleepyPosition > 0);
	        }
	        else if (this.IsEndGameReport) {
	            DrawProgressBar(500 - this.SleepyMaxPosition, 800, 2 * this.SleepyMaxPosition, 50, 100 * (this.SleepyPosition / this.SleepyMaxPosition));
	            DrawText(MiniGameVictory ? this.successText : this.failText, 500, 875, "white", "black");
	        }
	        else {
	            MiniGameEnd();
	        }
	    }
	    Click() {
	        //CommonIsMobile
	        if (this.IsGameActive)
	            this.SleepyVelocity = Math.max(this.SleepyVelocity + (getRandomInt(11) + 5), 20);
	    }
	}

	class BrainwashMiniGame extends SleepyMiniGame {
	    constructor(module) {
	        super(module);
	        this.hintText = "Click to focus. Try to keep your mind!";
	        this.failText = "You have lost control of your body!";
	        this.successText = "You shake off the drug!";
	        this.tintColor = [{ r: 148, g: 0, b: 211, a: 0 }];
	    }
	}

	class GuiInjector extends GuiSubscreen {
	    get name() {
	        return "Drug Enhancements";
	    }
	    get icon() {
	        return ICONS.INJECTOR;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get multipageStructure() {
	        return [
	            // Page 1 (general checkboxes)
	            [
	                {
	                    type: "checkbox",
	                    label: "Enabled:",
	                    description: "Enable Enhanced Injections and Net Gun.",
	                    setting: () => { var _a; return (_a = this.settings.enabled) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enabled = val
	                }, {
	                    type: "checkbox",
	                    label: "Immersive:",
	                    description: "Block LSCG settings while drugged.",
	                    setting: () => { var _a; return (_a = this.settings.immersive) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.immersive = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Sedative:",
	                    description: "Activates for any injector or drink with \"sedative\" or \"tranquilizer\" in its crafted name or description.",
	                    setting: () => { var _a; return (_a = this.settings.enableSedative) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enableSedative = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Brainwash Drug:",
	                    description: "Activates for any injector or drink with \"mind control,\" \"hypnotizing,\" or \"brainwashing\" in its crafted name ordescription.",
	                    setting: () => { var _a; return (_a = this.settings.enableMindControl) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enableMindControl = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Aphrodisiac:",
	                    description: "Activates for any injector or drink with \"horny\" or \"aphrodisiac\" in its crafted name or description.",
	                    setting: () => { var _a; return (_a = this.settings.enableHorny) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enableHorny = val
	                }, {
	                    type: "number",
	                    id: "drink_limit",
	                    label: "Filled Glass Sip Limit:",
	                    description: "Number of sips before your filled glasses empty. (0 for no limit)",
	                    disabled: !this.settings.enabled,
	                    setting: () => { var _a; return ((_a = this.settings.sipLimit) !== null && _a !== void 0 ? _a : 0); },
	                    setSetting: (val) => this.settings.sipLimit = val
	                }, {
	                    type: "checkbox",
	                    label: "Allow Continuous Delivery:",
	                    description: "If true, will allow respirators to deliver a continuous supply of drugged gas.",
	                    setting: () => { var _a; return (_a = this.settings.enableContinuousDelivery) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.enableContinuousDelivery = val
	                }, {
	                    type: "checkbox",
	                    label: "Inexhaustible Gases:",
	                    description: "If true, any continuous delivery (eg. respirator) on you will never run out of gas.",
	                    setting: () => { var _a; return (_a = this.settings.continuousDeliveryForever) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.continuousDeliveryForever = val
	                }, {
	                    type: "checkbox",
	                    label: "Show Drug Levels:",
	                    description: "If true, will display bars showing the level of each drug type.",
	                    setting: () => { var _a; return (_a = this.settings.showDrugLevels) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.showDrugLevels = val
	                }, {
	                    type: "checkbox",
	                    label: "Heartbeat Sound:",
	                    description: "If true, enables an occasional heartbeat sound while under the influence of aphrodisiac.",
	                    setting: () => { var _a; return (_a = this.settings.heartbeat) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.heartbeat = val
	                }, {
	                    type: "checkbox",
	                    label: "Chaotic Net Gun:",
	                    description: "If true, your net gun will fire wildly and have a 50/50 chance to net a random character instead of your target.",
	                    setting: () => { var _a; return (_a = this.settings.netgunIsChaotic) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.netgunIsChaotic = val
	                }
	            ],
	            // Page 2 (chloro settings)
	            [
	                {
	                    type: "checkbox",
	                    label: "Enable Chloroform:",
	                    description: "Fall asleep if chloroformed.",
	                    setting: () => { var _a; return (_a = Player.LSCG.MiscModule.chloroformEnabled) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => Player.LSCG.MiscModule.chloroformEnabled = val
	                }, {
	                    type: "checkbox",
	                    label: "Immersive Chloroform:",
	                    description: "Enforce chloroform with more restrictive measures. LSCG settings will be unavailable while asleep.",
	                    setting: () => { var _a; return (_a = Player.LSCG.MiscModule.immersiveChloroform) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => Player.LSCG.MiscModule.immersiveChloroform = val
	                }, {
	                    type: "checkbox",
	                    label: "Chloroform Never Fades:",
	                    description: "If enabled one rag over your mouth will last forever until removed, otherwise its potency will fade after an hour.",
	                    setting: () => { var _a; return (_a = Player.LSCG.MiscModule.infiniteChloroformPotency) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => Player.LSCG.MiscModule.infiniteChloroformPotency = val
	                }
	            ]
	        ];
	    }
	    Load() {
	        var _a;
	        // Load up module settings to ensure defaults..
	        (_a = getModule("MiscModule")) === null || _a === void 0 ? void 0 : _a.settings;
	        super.Load();
	    }
	}

	const locationObj = {
	    "ItemNeck": 2,
	    "ItemBreast": 1.8,
	    "ItemArms": 1.2,
	    "ItemButt": 1.5,
	    "ItemVulvaPiercings": 2.2,
	    "ItemLegs": 1,
	    "ItemFeet": .8
	};
	class InjectorModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.sleepyGame = registerMiniGame(new SleepyMiniGame(this));
	        this.brainWashGame = registerMiniGame(new BrainwashMiniGame(this));
	        this.sleepTotalTicks = 12;
	        this.sleepTimer = 0;
	        this.hypnoTimer = 0;
	        this._targetSedativeLevel = 0;
	        this._targetMindControlLevel = 0;
	        this._targetHornyLevel = 0;
	        this.sedativeCooldownInterval = 0;
	        this.mindControlCooldownInterval = 0;
	        this.hornyCooldownInterval = 0;
	        this.hornyLastBumped = 0;
	        this.cooldownTickMs = 6000; // tick cooldown every 6 seconds
	        this.InjectionLocationTable = new Map(Object.entries(locationObj));
	        this.sedativeInjectStr = [
	            "%NAME% sighs as a cool relaxing calm glides through %POSSESSIVE% body, fighting to keep %POSSESSIVE% eyes open.",
	            "%NAME%'s muscles relax as %OPP_NAME%'s sedative courses through %POSSESSIVE% body",
	            "%NAME% fights to stay conscious against the relentless weight of %OPP_NAME%'s drug.",
	            "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug."
	        ];
	        this.sedativeDrinkStr = [
	            "%NAME% gulps and swallows %OPP_NAME%'s drink, a cool relaxing feeling starting to spread through %POSSESSIVE% body.",
	            "%NAME% sighs as a cool relaxing calm glides down %POSSESSIVE% throat, fighting to keep %POSSESSIVE% eyes open.",
	            "%NAME%'s muscles relax as %OPP_NAME%'s sedative pours down %POSSESSIVE% throat and starts to take effect.",
	            "%NAME%'s eyes droop as %POSSESSIVE% fights to stay conscious against the cool, welcoming weight of %OPP_NAME%'s drug."
	        ];
	        this.brainwashInjectStr = [
	            "%NAME% whimpers and struggles to keep control of %POSSESSIVE% mind.",
	            "%NAME% gasps weakly as %OPP_NAME%'s drug slowly erases %POSSESSIVE% free will.",
	            "%NAME%'s eyes struggle to focus as %OPP_NAME%'s drug makes %POSSESSIVE% more suggestible."
	        ];
	        this.brainwashDrinkStr = [
	            "%NAME% starts to drift dreamily as they swallow %OPP_NAME%'s drink.",
	            "%NAME% gasps weakly and starts to lose focus as %OPP_NAME%'s drug warms %POSSESSIVE% comfortably.",
	            "%NAME%'s eyes flutter and defocus as %OPP_NAME%'s drink slides warmly down %POSSESSIVE% throat."
	        ];
	        this.hornyInjectStr = [
	            "%NAME% moans uncontrollably as %OPP_NAME%'s drug takes effect.",
	            "%NAME%'s eyes roll back as a wave of pleasure washes over %POSSESSIVE% body.",
	            "%NAME% quivers as %POSSESSIVE% body is flooded with %OPP_NAME%'s aphrodisiac."
	        ];
	        this.hornyDrinkStr = [
	            "%NAME% lets out a long low moan as %OPP_NAME%'s drink burns pleasurably down their throat.",
	            "%NAME%'s eyes roll back as a wave of pleasure emanates from %POSSESSIVE% belly.",
	            "%NAME% gulps and quivers as %POSSESSIVE% body is slowly flooded with %OPP_NAME%'s aphrodisiac."
	        ];
	        this.cureInjectStr = [
	            "%NAME% moans thankfully as %OPP_NAME%'s medicine heals %POSSESSIVE%.",
	            "%NAME%'s body glows slightly as %OPP_NAME%'s cure washes warmly over %POSSESSIVE%.",
	            "%OPP_NAME%'s drug rushes warmly through %NAME%'s body, curing what ails %POSSESSIVE%."
	        ];
	        this.cureDrinkStr = [
	            "%NAME% gulps thankfully as %OPP_NAME%'s medicine slowly heals %POSSESSIVE%.",
	            "%NAME%'s body glows slightly as %OPP_NAME%'s cure glides warmly through %POSSESSIVE%.",
	            "%OPP_NAME%'s antidote slowly washes through %NAME%'s body, curing what ails %POSSESSIVE%."
	        ];
	        this.sleepBlockStrings = [
	            "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
	            "%NAME% exhales slowly, fully relaxed...",
	            "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
	            "%NAME% moans softly and relaxes..."
	        ];
	        this.brainwashBlockStrings = [
	            "%NAME% stares blankly, %POSSESSIVE% mind open and suggestible...",
	            "%NAME%'s eyelids flutter gently, awaiting a command...",
	            "%NAME% trembles with a quiet moan as %PRONOUN% yearns to obey...",
	            "%NAME% groans softly as %PRONOUN% drops even further under the drug's command..."
	        ];
	        this._wasWearingRespirator = false;
	        this.headsetMindControlEventStr = [
	            "%NAME% groans helplessly as %POSSESSIVE% headset manipulates %POSSESSIVE% mind.",
	            "%NAME% struggles to keep %POSSESSIVE% focus through the overwhelming influence of %POSSESSIVE% headset.",
	            "%NAME% whimpers as %POSSESSIVE% headset erases %POSSESSIVE% own mind relentlessly."
	        ];
	        this.breathSedativeEventStr = [
	            "%NAME%'s muscles relax limply as %PRONOUN% takes a deep breath through %POSSESSIVE% mask.",
	            "%NAME%'s eyes flutter weakly as %PRONOUN% inhales.",
	            "%NAME% struggles to keep %POSSESSIVE% drooping eyes open as %POSSESSIVE% mask continues to emit its sedative gas."
	        ];
	        this.breathMindControlEventStr = [
	            "%NAME% groans helplessly as %POSSESSIVE% mask sends another dose into %POSSESSIVE% lungs.",
	            "%NAME% struggles to keep %POSSESSIVE% focus through the suggestible haze caused by %POSSESSIVE% mask.",
	            "%NAME% whimpers as %POSSESSIVE% mask's drug pushes %POSSESSIVE% further out of %POSSESSIVE% own mind."
	        ];
	        this.breathAphrodesiacEventStr = [
	            "%NAME%'s spine tingles as %PRONOUN% takes a deep breath through %POSSESSIVE% mask.",
	            "%NAME% lets out a muffled moan as %PRONOUN% inhales.",
	            "%NAME%'s sensitive areas burn hot as %PRONOUN% breathes through %POSSESSIVE% mask."
	        ];
	        this.breathAntidoteEventStr = [
	            "%NAME% sighs with relief as %PRONOUN% takes a deep gulp of healing mist.",
	            "%NAME% feels a tingle across %POSSESSIVE% skin as %POSSESSIVE% mask heals them.",
	            "%NAME% lets out a quiet moan as %POSSESSIVE% mask releases a healing mist into her lungs."
	        ];
	    }
	    get defaultSettings() {
	        return {
	            enabled: false,
	            immersive: false,
	            enableSedative: false,
	            enableMindControl: false,
	            enableHorny: false,
	            netgunIsChaotic: false,
	            showDrugLevels: true,
	            sedativeLevel: 0,
	            mindControlLevel: 0,
	            hornyLevel: 0,
	            sedativeKeywords: ["tranquilizer", "sedative"],
	            mindControlKeywords: ["mind control", "hypnotizing", "brainwashing"],
	            hornyKeywords: ["horny", "aphrodisiac"],
	            cureKeywords: ["antidote", "healing", "curing", "cure"],
	            netgunKeywords: ["net gun", "netgun"],
	            hornyTickTime: 5000,
	            sedativeCooldown: 180000,
	            mindControlCooldown: 240000,
	            hornyCooldown: 300000,
	            drugLevelMultiplier: 100,
	            sedativeMax: 4,
	            mindControlMax: 4,
	            hornyLevelMax: 4,
	            heartbeat: true,
	            enableContinuousDelivery: true,
	            continuousDeliveryForever: false,
	            continuousDeliveryActivatedAt: 0,
	            continuousDeliveryTimeout: 60 * 60 * 1000,
	            asleep: false,
	            brainwashed: false,
	            stats: {},
	            sipLimit: 0
	        };
	    }
	    get settings() {
	        return super.settings;
	    }
	    get settingsScreen() {
	        return GuiInjector;
	    }
	    safeword() {
	        this.settings.continuousDeliveryActivatedAt = 0;
	        this.settings.continuousDeliveryForever = false;
	        this.DoCure();
	    }
	    load() {
	        // Override these with defaults. Remove from here if opened to user configuration later.
	        let d = this.defaultSettings;
	        this.settings.sedativeKeywords = d.sedativeKeywords;
	        this.settings.mindControlKeywords = d.mindControlKeywords;
	        this.settings.hornyKeywords = d.hornyKeywords;
	        this.settings.cureKeywords = d.cureKeywords;
	        this.settings.netgunKeywords = d.netgunKeywords;
	        this.settings.hornyTickTime = d.hornyTickTime;
	        this.settings.sedativeCooldown = d.sedativeCooldown;
	        this.settings.mindControlCooldown = d.mindControlCooldown;
	        this.settings.hornyCooldown = d.hornyCooldown;
	        this.settings.drugLevelMultiplier = d.drugLevelMultiplier;
	        this.settings.sedativeMax = d.sedativeMax;
	        this.settings.mindControlMax = d.mindControlMax;
	        this.settings.hornyLevelMax = d.hornyLevelMax;
	        this.InitStates();
	        OnActivity(10, ModuleCategory.Injector, (data, sender, msg, megadata) => {
	            if (!this.Enabled)
	                return;
	            let meta = GetMetadata(data);
	            var activityName = meta === null || meta === void 0 ? void 0 : meta.ActivityName;
	            var target = meta === null || meta === void 0 ? void 0 : meta.TargetMemberNumber;
	            if (target == Player.MemberNumber && activityName == "Inject" && !!sender) {
	                var location = meta === null || meta === void 0 ? void 0 : meta.GroupName;
	                this.ProcessInjection(sender, location);
	            }
	            else if (target == Player.MemberNumber && activityName == "SipItem" && !!sender) {
	                let gagType = this.GetGagDrinkAccess(Player);
	                if (gagType == "nothing" && sender.MemberNumber != Player.MemberNumber && this.IsDrugAllowed(sender)) {
	                    this.TryForceDrink(sender);
	                }
	                else {
	                    this.ProcessDruggedDrink(sender);
	                }
	            }
	            else if (target == Player.MemberNumber) {
	                let activityEntry = GetActivityEntryFromContent(data.Content);
	                if (!activityEntry || !sender || !IsActivityAllowed(activityEntry, sender))
	                    return;
	                if ((activityEntry === null || activityEntry === void 0 ? void 0 : activityEntry.awakener) && !(sender === null || sender === void 0 ? void 0 : sender.IsPlayer())) {
	                    if (this.asleep)
	                        this.Wake();
	                    if (this.brainwashed)
	                        this.SnapBack();
	                }
	            }
	        });
	        OnAction(1, ModuleCategory.Injector, (data, sender, msg, metadata) => {
	            var _a;
	            if (!this.Enabled)
	                return;
	            let deliverySlots = ["ItemHandheld"];
	            let messagesToCheck = [
	                "ActionUse",
	                "ActionSwap"
	            ];
	            let target = GetTargetCharacter(data);
	            let targetGroup = (_a = GetMetadata(data)) === null || _a === void 0 ? void 0 : _a.GroupName;
	            if (target == Player.MemberNumber &&
	                (sender === null || sender === void 0 ? void 0 : sender.IsPlayer()) &&
	                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
	                messagesToCheck.some(x => msg.startsWith(x))) {
	                let glass = InventoryGet(Player, "ItemHandheld");
	                if ((glass === null || glass === void 0 ? void 0 : glass.Asset.Name) == "GlassFilled") {
	                    if (!glass.Property)
	                        glass.Property = {};
	                    if (!glass.Property.SipLimit)
	                        glass.Property.SipLimit = this.settings.sipLimit;
	                }
	            }
	        });
	        hookFunction("ServerSend", 100, (args, next) => {
	            var _a, _b;
	            if (args[0] == "ChatRoomChat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Type) == "Activity" && this.Enabled) {
	                let data = args[1];
	                let actName = (_b = GetActivityName(data)) !== null && _b !== void 0 ? _b : "";
	                if (actName == "SipItem") {
	                    let glass = InventoryGet(Player, "ItemHandheld");
	                    if ((glass === null || glass === void 0 ? void 0 : glass.Asset.Name) == "GlassFilled") {
	                        if (!glass.Property)
	                            glass.Property = {};
	                        if (!glass.Property.SipLimit)
	                            glass.Property.SipLimit = this.settings.sipLimit;
	                        if (!glass.Property.SipCount)
	                            glass.Property.SipCount = 1;
	                        else
	                            glass.Property.SipCount++;
	                        if (glass.Property.SipLimit > 0 && glass.Property.SipCount >= glass.Property.SipLimit) {
	                            SendAction("%NAME%'s uses up the last drop of %POSSESSIVE% drink.");
	                            var craft = glass.Craft;
	                            InventoryRemove(Player, "ItemHandheld", false);
	                            let empty = InventoryWear(Player, "GlassEmpty", "ItemHandheld", glass.Color, glass.Difficulty, Player.MemberNumber, craft, false);
	                            if (!!empty && !!craft) {
	                                InventoryWearCraft(empty, Player, craft);
	                            }
	                            CharacterRefresh(Player);
	                        }
	                    }
	                }
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction("DrawArousalMeter", 1, (args, next) => {
	            var _a, _b;
	            if (!this.Enabled || !this.settings.showDrugLevels)
	                return next(args);
	            let [Char, CharX, CharY, Zoom] = args;
	            var charSettings = (_b = (_a = getCharacter(Char.MemberNumber)) === null || _a === void 0 ? void 0 : _a.LSCG) === null || _b === void 0 ? void 0 : _b.InjectorModule;
	            if (!charSettings)
	                return next(args);
	            if (charSettings.sedativeLevel + charSettings.mindControlLevel + charSettings.hornyLevel > 0) {
	                let bars = [];
	                if (charSettings.sedativeLevel > 0)
	                    bars.push({
	                        type: "sedative",
	                        level: charSettings.sedativeLevel,
	                        max: charSettings.sedativeMax * charSettings.drugLevelMultiplier
	                    });
	                if (charSettings.mindControlLevel > 0)
	                    bars.push({
	                        type: "mindcontrol",
	                        level: charSettings.mindControlLevel,
	                        max: charSettings.mindControlMax * charSettings.drugLevelMultiplier
	                    });
	                if (charSettings.hornyLevel > 0)
	                    bars.push({
	                        type: "horny",
	                        level: charSettings.hornyLevel,
	                        max: charSettings.hornyLevelMax * charSettings.drugLevelMultiplier
	                    });
	                this.DrawBars(Char, CharX, CharY, Zoom, bars);
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        this.InitializeRestrictiveHooks();
	        window.LSCG_InjectEnd_Sedative = () => this.MiniGameEnd("sedative", MiniGameVictory);
	        window.LSCG_InjectEnd_Brainwash = () => this.MiniGameEnd("mindcontrol", MiniGameVictory);
	        this.sedativeCooldownInterval = setInterval(() => this.SedativeCooldown(), this.cooldownTickMs);
	        this.mindControlCooldownInterval = setInterval(() => this.MindControlCooldown(), this.cooldownTickMs);
	        this.hornyCooldownInterval = setInterval(() => this.HornyCooldown(), this.cooldownTickMs);
	    }
	    run() {
	        this.hypnoModule = getModule("HypnoModule");
	        this.activityModule = getModule("ActivityModule");
	        this.miscModule = getModule("MiscModule");
	        if (!!this.activityModule) {
	            this.activityModule.AddActivity({
	                Activity: {
	                    Name: "NetGun",
	                    MaxProgress: 50,
	                    MaxProgressSelf: 50,
	                    Prerequisite: ["UseHands"]
	                },
	                Targets: [
	                    {
	                        Name: "ItemArms",
	                        SelfAllowed: true,
	                        TargetLabel: "Shoot Netgun",
	                        TargetAction: "SourceCharacter takes aim at TargetCharacter with their net gun.",
	                        TargetSelfAction: "SourceCharacter turns their net gun on themselves."
	                    }
	                ],
	                CustomPrereqs: [
	                    {
	                        Name: "HasNetgun",
	                        Func: (acting, acted, group) => {
	                            return this.Enabled && this.HasNetgun(acting);
	                        }
	                    }, {
	                        Name: "DevicesSlotIsFree",
	                        Func: (acting, acted, group) => {
	                            return !InventoryGet(acted, "ItemDevices");
	                        }
	                    }
	                ],
	                CustomAction: {
	                    Func: (target, args, next) => {
	                        if (!!target) {
	                            // if (target.MemberName != Player.MemberNumber) {
	                            // 	SendAction("%NAME% takes aim at %OPP_NAME% with %POSSESSIVE% net gun.", target);
	                            // 	setTimeout(() => this.ShootNetgun(target), 5000);
	                            // } else {
	                            // 	SendAction("%NAME% turns %POSSESSIVE% netgun on themselves!", target);
	                            // 	this.ShootNetgun(target)
	                            // }
	                            setTimeout(() => this.ShootNetgun(target), 5000);
	                            return next(args);
	                        }
	                        else
	                            return next(args);
	                    }
	                },
	                CustomImage: "Assets/Female3DCG/ItemDevices/Preview/Net.png"
	            });
	        }
	        this.activityModule.AddCustomPrereq({
	            Name: "InjectorIsNotNetgun",
	            Func: (acting, acted, group) => !this.HasNetgun(acting)
	        });
	        var injectActivity = ActivityFemale3DCG.find(act => act.Name == "Inject");
	        injectActivity === null || injectActivity === void 0 ? void 0 : injectActivity.Prerequisite.push("InjectorIsNotNetgun");
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Injector);
	    }
	    InitializeRestrictiveHooks() {
	        hookFunction('ServerSend', 5, (args, next) => {
	            var _a;
	            if (!this.Enabled)
	                return next(args);
	            var type = args[0];
	            // Prevent speech while asleep
	            if ((type == "ChatRoomChat" && args[1].Type == "Chat" && ((_a = args[1]) === null || _a === void 0 ? void 0 : _a.Content[0]) != "(")) {
	                if (this.asleep) {
	                    this.ActivateSleepEvent();
	                    return null;
	                }
	                else if (this.brainwashed) {
	                    this.ActivateBrainwashEvent();
	                    return null;
	                }
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('Player.CanChangeOwnClothes', 1, (args, next) => {
	            if (this.Enabled && this.asleep)
	                return false;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('Player.IsDeaf', 1, (args, next) => {
	            if (this.Enabled && this.asleep)
	                return true;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('Player.IsBlind', 1, (args, next) => {
	            if (this.Enabled && this.asleep)
	                return true;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('Player.CanWalk', 1, (args, next) => {
	            if (this.Enabled && (this.asleep || this.brainwashed))
	                return false;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('ChatRoomCanAttemptStand', 1, (args, next) => {
	            if (this.Enabled && this.asleep)
	                return false;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('ChatRoomFocusCharacter', 6, (args, next) => {
	            if (this.Enabled && this.asleep) {
	                LSCG_SendLocal("Character access blocked while asleep.", 5000);
	                return;
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction("Player.HasTints", 4, (args, next) => {
	            var _a;
	            if (!this.Enabled || !((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return next(args);
	            if (this.hornyLevel > 0 || this.brainwashed)
	                return true;
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction("Player.GetTints", 4, (args, next) => {
	            var _a;
	            if (!this.Enabled || !((_a = Player.ImmersionSettings) === null || _a === void 0 ? void 0 : _a.AllowTints))
	                return next(args);
	            if (this.brainwashed)
	                return [{ r: 148, g: 0, b: 211, a: 0.4 }];
	            else if (this.hornyLevel > 0)
	                return [{ r: 254, g: 44, b: 84, a: (this.hornyLevel / (this.hornyLevelMax * this.drugLevelMultiplier * 4)) }];
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
	            if (!this.Enabled || !Player.GraphicsSettings.AllowBlur)
	                return next(args);
	            if (this.brainwashed)
	                return 3;
	            else if (this.hornyLevel > 0)
	                return Math.max(0, (this.hornyLevel / this.drugLevelMultiplier) - 1);
	            return next(args);
	        }, ModuleCategory.Injector);
	        OnAction(1, ModuleCategory.Injector, (data, sender, msg, metadata) => {
	            var _a, _b;
	            let deliverySlots = ["ItemMouth3"];
	            let messagesToCheck = [
	                "ActionUse",
	                "ActionSwap",
	                "ActionRemove"
	            ];
	            let target = GetTargetCharacter(data);
	            let targetGroup = (_b = (_a = data.Dictionary) === null || _a === void 0 ? void 0 : _a.find((dictItem) => dictItem.Tag == "FocusAssetGroup")) === null || _b === void 0 ? void 0 : _b.AssetGroupName;
	            if (target == Player.MemberNumber &&
	                (!targetGroup || deliverySlots.indexOf(targetGroup) > -1) &&
	                messagesToCheck.some(x => msg.startsWith(x))) {
	                let _ = this.IsWearingRespirator;
	            }
	            else if (target == Player.MemberNumber && msg == "ItemMouth3LatexRespiratorSetGlow" && !!sender) {
	                this.CheckForContinuousToggle(sender);
	            }
	        });
	        // Check for respirator curses
	        hookBCXCurse("curseTrigger", (evt) => {
	            if (evt.group == "ItemMouth3" && this.Enabled && this.settings.enableContinuousDelivery)
	                this.CheckRespiratorCurseUpdate();
	        });
	        let lastBreathEvent = 0;
	        let breathInterval = 2000; // breath event every 4s
	        hookFunction('TimerProcess', 1, (args, next) => {
	            var _a, _b;
	            let now = CommonTime();
	            if (!ActivityAllowed() || !this.Enabled)
	                return next(args);
	            // Heardbeat every hornyTickTime
	            if (this.hornyLevel > 0 && this.hornyLastBumped + this.settings.hornyTickTime < now) {
	                this.hornyLastBumped = now;
	                var newProgress = ((_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) + (this.hornyLevel / this.drugLevelMultiplier) * 4;
	                newProgress = Math.min(99, newProgress);
	                if (getRandomInt(this.hornyLevelMax) <= Math.floor(this.hornyLevel / this.drugLevelMultiplier)) {
	                    if (this.settings.heartbeat && !AudioShouldSilenceSound(true))
	                        AudioPlayInstantSound(AUDIO.HEARTBEAT, getPlayerVolume(0));
	                    DrawFlashScreen("#FF647F", 1000, this.hornyLevel);
	                }
	                ActivitySetArousal(Player, newProgress);
	            }
	            // Check every minute for breath drug event
	            if (this.settings.enableContinuousDelivery && lastBreathEvent + breathInterval < now) {
	                lastBreathEvent = now;
	                this.BreathInDrugEvent();
	                this.CheckForHypnoHelmet();
	            }
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('ActivitySetArousalTimer', 1, (args, next) => {
	            let Activity = args[1];
	            let Zone = args[2];
	            let Progress = args[3];
	            let hornyMod = 1 + this.hornyLevel / 2;
	            args[3] = Math.min(99, Progress * hornyMod);
	            return next(args);
	        }, ModuleCategory.Injector);
	        hookFunction('ChatRoomSync', 1, (args, next) => {
	            if (this.brainwashed)
	                setTimeout(() => { var _a; return (_a = this.hypnoModule) === null || _a === void 0 ? void 0 : _a.EnforceEyes(); });
	            else if (this.asleep)
	                setTimeout(() => { var _a; return (_a = this.miscModule) === null || _a === void 0 ? void 0 : _a.SetSleepExpression(); });
	            return next(args);
	        });
	    }
	    get asleep() { return this.settings.asleep; }
	    ;
	    set asleep(val) { if (this.settings.asleep != val) {
	        this.settings.asleep = val;
	        settingsSave(true);
	    } }
	    get brainwashed() { return this.settings.brainwashed; }
	    ;
	    set brainwashed(val) { if (this.settings.brainwashed != val) {
	        this.settings.brainwashed = val;
	        settingsSave(true);
	    } }
	    get sedativeLevel() { return this.settings.sedativeLevel; }
	    ;
	    set sedativeLevel(val) { if (this.settings.sedativeLevel != val) {
	        this.settings.sedativeLevel = val;
	        settingsSave(true);
	    } }
	    get mindControlLevel() { return this.settings.mindControlLevel; }
	    ;
	    set mindControlLevel(val) { if (this.settings.mindControlLevel != val) {
	        this.settings.mindControlLevel = val;
	        settingsSave(true);
	    } }
	    get hornyLevel() { return this.settings.hornyLevel; }
	    ;
	    set hornyLevel(val) { if (this.settings.hornyLevel != val) {
	        this.settings.hornyLevel = val;
	        settingsSave(true);
	    } }
	    get drugLevelMultiplier() { return this.settings.drugLevelMultiplier; }
	    ;
	    set drugLevelMultiplier(val) { if (this.settings.drugLevelMultiplier != val) {
	        this.settings.drugLevelMultiplier = val;
	        settingsSave(true);
	    } }
	    get sedativeMax() { return this.settings.sedativeMax; }
	    ;
	    set sedativeMax(val) { if (this.settings.sedativeMax != val) {
	        this.settings.sedativeMax = val;
	        settingsSave(true);
	    } }
	    get mindControlMax() { return this.settings.mindControlMax; }
	    ;
	    set mindControlMax(val) { if (this.settings.mindControlMax != val) {
	        this.settings.mindControlMax = val;
	        settingsSave(true);
	    } }
	    get hornyLevelMax() { return this.settings.hornyLevelMax; }
	    ;
	    set hornyLevelMax(val) { if (this.settings.hornyLevelMax != val) {
	        this.settings.hornyLevelMax = val;
	        settingsSave(true);
	    } }
	    get targetSedativeLevel() { return Math.max(this.sedativeLevel, this._targetSedativeLevel); }
	    ;
	    get targetMindControlLevel() { return Math.max(this.mindControlLevel, this._targetMindControlLevel); }
	    ;
	    get targetHornyLevel() { return Math.max(this.hornyLevel, this._targetHornyLevel); }
	    ;
	    GetHandheldItemNameAndDescriptionConcat(C) {
	        if (!C)
	            C = Player;
	        var asset = InventoryGet(C, "ItemHandheld");
	        if (!(asset === null || asset === void 0 ? void 0 : asset.Craft))
	            return;
	        var name = asset.Craft.Name;
	        var description = asset.Craft.Description;
	        return name + " | " + description;
	    }
	    GetDrugTypes(item) {
	        var _a, _b, _c, _d;
	        var name = item.Name;
	        var description = item.Description;
	        var totalString = name + " | " + description;
	        var types = [];
	        if ((_a = this.settings.sedativeKeywords) === null || _a === void 0 ? void 0 : _a.some(ph => isPhraseInString(totalString, ph, true)))
	            types.push("sedative");
	        if ((_b = this.settings.mindControlKeywords) === null || _b === void 0 ? void 0 : _b.some(ph => isPhraseInString(totalString, ph, true)))
	            types.push("mindcontrol");
	        if ((_c = this.settings.hornyKeywords) === null || _c === void 0 ? void 0 : _c.some(ph => isPhraseInString(totalString, ph, true)))
	            types.push("horny");
	        if ((_d = this.settings.cureKeywords) === null || _d === void 0 ? void 0 : _d.some(ph => isPhraseInString(totalString, ph, true)))
	            types.push("antidote");
	        return types;
	    }
	    IsDrugAllowed(sender) {
	        var asset = InventoryGet(sender, "ItemHandheld");
	        if (!(asset === null || asset === void 0 ? void 0 : asset.Craft))
	            return false;
	        let types = this.GetDrugTypes(asset.Craft);
	        if ((types.indexOf("sedative") > -1 && this.settings.enableSedative) ||
	            (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl) ||
	            (types.indexOf("horny") > -1 && this.settings.enableHorny) ||
	            (types.indexOf("antidote") > -1))
	            return true;
	        return false;
	    }
	    ProcessDruggedDrink(sender) {
	        var asset = InventoryGet(sender, "ItemHandheld");
	        if (!(asset === null || asset === void 0 ? void 0 : asset.Craft))
	            return;
	        let types = this.GetDrugTypes(asset.Craft);
	        if (types.indexOf("sedative") > -1 && this.settings.enableSedative)
	            this.DrinkSedative(sender);
	        if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl)
	            this.DrinkMindControl(sender);
	        if (types.indexOf("horny") > -1 && this.settings.enableHorny)
	            this.DrinkHorny(sender);
	        if (types.indexOf("antidote") > -1)
	            this.DrinkCure(sender);
	    }
	    ProcessInjection(sender, location) {
	        var asset = InventoryGet(sender, "ItemHandheld");
	        if (!(asset === null || asset === void 0 ? void 0 : asset.Craft))
	            return;
	        let types = this.GetDrugTypes(asset.Craft);
	        if (!AudioShouldSilenceSound(true) && types.length > 0)
	            AudioPlayInstantSound(AUDIO.INJECTION, getPlayerVolume(0));
	        if (types.indexOf("sedative") > -1 && this.settings.enableSedative)
	            this.InjectSedative(sender, location);
	        if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl)
	            this.InjectMindControl(sender, location);
	        if (types.indexOf("horny") > -1 && this.settings.enableHorny)
	            this.InjectHorny(sender, location);
	        if (types.indexOf("antidote") > -1)
	            this.InjectCure(sender, location);
	    }
	    AddSedative(multiplier, minigame = true) {
	        var additive = this.drugLevelMultiplier * multiplier;
	        var newLevel = Math.min(this.sedativeLevel + additive, this.sedativeMax * this.drugLevelMultiplier);
	        // if (gradual)
	        //     this._targetSedativeLevel = newLevel;
	        // else
	        this.sedativeLevel = newLevel;
	        if (!this.asleep && minigame)
	            MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
	        CurrentModule = "Online";
	    }
	    DrinkSedative(sender) {
	        this.AddSedative(2);
	        SendAction(this.sedativeDrinkStr[getRandomInt(this.sedativeDrinkStr.length)], sender);
	    }
	    InjectSedative(sender, location) {
	        var _a;
	        this.AddSedative((_a = this.InjectionLocationTable.get(location)) !== null && _a !== void 0 ? _a : 1);
	        SendAction(this.sedativeInjectStr[getRandomInt(this.sedativeInjectStr.length)], sender);
	        DrawFlashScreen("#5C5CFF", 1000, this.sedativeLevel * 2);
	    }
	    AddMindControl(multiplier, minigame = true) {
	        var additive = this.drugLevelMultiplier * multiplier;
	        var newLevel = Math.min(this.mindControlLevel + additive, this.mindControlMax * this.drugLevelMultiplier);
	        // if (gradual)
	        //     this._targetMindControlLevel = newLevel;
	        // else
	        this.mindControlLevel = newLevel;
	        if (!this.brainwashed && minigame)
	            MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
	        CurrentModule = "Online";
	    }
	    DrinkMindControl(sender) {
	        this.AddMindControl(2);
	        SendAction(this.brainwashDrinkStr[getRandomInt(this.brainwashDrinkStr.length)], sender);
	    }
	    InjectMindControl(sender, location) {
	        var _a;
	        this.AddMindControl((_a = this.InjectionLocationTable.get(location)) !== null && _a !== void 0 ? _a : 1);
	        SendAction(this.brainwashInjectStr[getRandomInt(this.brainwashInjectStr.length)], sender);
	        DrawFlashScreen("#A020F0", 1000, this.mindControlLevel * 2);
	    }
	    AddHorny(multiplier, forceCum = true, flash = false) {
	        var _a, _b;
	        var additive = this.drugLevelMultiplier * multiplier;
	        let newLevelActual = this.hornyLevel + additive;
	        this.hornyLevel = Math.min(newLevelActual, this.hornyLevelMax * this.drugLevelMultiplier);
	        if (newLevelActual >= this.hornyLevelMax * this.drugLevelMultiplier && forceCum) {
	            ActivityOrgasmPrepare(Player);
	            this.settings.stats.forcedOrgasmCount++;
	            settingsSave();
	        }
	        if (!!((_b = (_a = Player.BCT) === null || _a === void 0 ? void 0 : _a.splitOrgasmArousal) === null || _b === void 0 ? void 0 : _b.arousalProgress)) {
	            Player.BCT.splitOrgasmArousal.arousalProgress = 100;
	        }
	    }
	    DrinkHorny(sender) {
	        this.AddHorny(2);
	        SendAction(this.hornyDrinkStr[getRandomInt(this.hornyDrinkStr.length)], sender);
	    }
	    InjectHorny(sender, location) {
	        var _a;
	        this.AddHorny((_a = this.InjectionLocationTable.get(location)) !== null && _a !== void 0 ? _a : 1);
	        SendAction(this.hornyInjectStr[getRandomInt(this.hornyInjectStr.length)], sender);
	        DrawFlashScreen("#FF647F", 1000, this.hornyLevel * 2);
	    }
	    DrinkCure(sender) {
	        SendAction(this.cureDrinkStr[getRandomInt(this.cureDrinkStr.length)], sender);
	        this.DoCure();
	    }
	    InjectCure(sender, location) {
	        SendAction(this.cureInjectStr[getRandomInt(this.cureInjectStr.length)], sender);
	        this.DoCure();
	    }
	    DoCure() {
	        this.settings.sedativeLevel = 0;
	        this.settings.mindControlLevel = 0;
	        this.settings.hornyLevel = 0;
	        if (this.asleep)
	            this.Wake();
	        if (this.brainwashed)
	            this.SnapBack();
	        this.settings.stats.curedCount++;
	        settingsSave(true);
	    }
	    // Cooldown func fires every cooldownTickMs
	    SedativeCooldown() {
	        if (this.sedativeLevel <= 0)
	            return;
	        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
	        let subtractive = this.drugLevelMultiplier / (this.settings.sedativeCooldown / this.cooldownTickMs);
	        this.sedativeLevel = Math.max(0, this.sedativeLevel - subtractive);
	        if (this.sedativeLevel <= 0 && this.asleep)
	            this.Wake();
	    }
	    MindControlCooldown() {
	        if (this.mindControlLevel <= 0)
	            return;
	        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
	        let subtractive = this.drugLevelMultiplier / (this.settings.mindControlCooldown / this.cooldownTickMs);
	        this.mindControlLevel = Math.max(0, this.mindControlLevel - subtractive);
	        if (this.mindControlLevel <= 0 && this.brainwashed)
	            this.SnapBack();
	    }
	    HornyCooldown() {
	        if (this.hornyLevel <= 0)
	            return;
	        // subtractive will be mow much of the multiplier to subtract per tick to reduce by full multiplier every setting cooldown.
	        let subtractive = this.drugLevelMultiplier / (this.settings.hornyCooldown / this.cooldownTickMs);
	        this.hornyLevel = Math.max(0, this.hornyLevel - subtractive);
	    }
	    MiniGameEnd(type, success) {
	        console.info("sedative minigame ended - " + success);
	        CommonSetScreen("Online", "ChatRoom");
	        if (!success) {
	            switch (type) {
	                case "sedative":
	                    this.Sleep();
	                    break;
	                case "mindcontrol":
	                    CharacterSetFacialExpression(Player, "Eyes", null);
	                    this.Brainwash();
	                    break;
	            }
	        }
	    }
	    Sleep(doEmote = true) {
	        var _a, _b;
	        this.asleep = true;
	        if (doEmote)
	            SendAction("%NAME% moans weakly as %PRONOUN% succumbs to unconciousness.");
	        (_a = this.miscModule) === null || _a === void 0 ? void 0 : _a.SetSleepExpression();
	        if (Player.CanKneel()) {
	            (_b = this.miscModule) === null || _b === void 0 ? void 0 : _b.FallDownIfPossible();
	            addCustomEffect(Player, "ForceKneel");
	        }
	        this.settings.stats.sedatedCount++;
	        settingsSave();
	    }
	    Wake() {
	        var _a;
	        if (this.asleep) {
	            this.asleep = false;
	            SendAction("%NAME%'s eyelids flutter and start to open sleepily...");
	            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	            if (((_a = WardrobeGetExpression(Player)) === null || _a === void 0 ? void 0 : _a.Emoticon) == "Sleep")
	                CharacterSetFacialExpression(Player, "Emoticon", null);
	            removeCustomEffect(Player, "ForceKneel");
	        }
	    }
	    Brainwash() {
	        var _a;
	        this.brainwashed = true;
	        SendAction("%NAME%'s body goes limp as %POSSESSIVE% mind empties and %PRONOUN% awaits a command.");
	        (_a = this.hypnoModule) === null || _a === void 0 ? void 0 : _a.SetEyes();
	        this.settings.stats.brainwashedCount++;
	        settingsSave();
	    }
	    SnapBack() {
	        if (this.brainwashed) {
	            this.brainwashed = false;
	            SendAction("%NAME% gasps, snapping back into their senses confused and blushing.");
	            setOrIgnoreBlush("Medium");
	            if (!!this.hypnoModule)
	                this.hypnoModule.ResetEyes();
	        }
	    }
	    ActivateSleepEvent() {
	        SendAction(this.sleepBlockStrings[getRandomInt(this.sleepBlockStrings.length)]);
	    }
	    ActivateBrainwashEvent() {
	        SendAction(this.brainwashBlockStrings[getRandomInt(this.brainwashBlockStrings.length)]);
	    }
	    HasNetgun(C) {
	        var _a;
	        if (!C)
	            return false;
	        let allowedNetGuns = [
	            "MedicalInjector",
	            "RainbowWand",
	            "Baguette"
	        ];
	        var item = InventoryGet(Player, "ItemHandheld");
	        if (!item || !item.Asset || allowedNetGuns.indexOf(item.Asset.Name) == -1)
	            return false;
	        var totalString = this.GetHandheldItemNameAndDescriptionConcat();
	        if (!totalString)
	            return false;
	        var isNetgun = (_a = this.settings.netgunKeywords) === null || _a === void 0 ? void 0 : _a.some(ph => isPhraseInString(totalString !== null && totalString !== void 0 ? totalString : "", ph, true));
	        return isNetgun;
	    }
	    ShootNetgun(target) {
	        if (!target)
	            return;
	        if (this.settings.netgunIsChaotic) {
	            SendAction("%NAME% fires a net wildly.");
	            setTimeout(() => this.ResolveNetting(target, true), 2000);
	        }
	        else if (target.MemberNumber == Player.MemberNumber) {
	            SendAction("%NAME% fires at themselves point blank.", target);
	            setTimeout(() => this.ResolveNetting(target), 2000);
	        }
	        else {
	            SendAction("%NAME% fires a net at %OPP_NAME%.", target);
	            setTimeout(() => this.ResolveNetting(target), 2000);
	        }
	    }
	    ResolveNetting(intendedTarget, chaotic = false) {
	        this.settings.stats.totalNettingsCount++;
	        let actualTarget = intendedTarget;
	        if (chaotic)
	            actualTarget = this.GetChaoticNetTarget(intendedTarget);
	        if (actualTarget.MemberNumber == intendedTarget.MemberNumber)
	            this.settings.stats.successfulNettingsCount++;
	        this.ApplyNet(actualTarget);
	        settingsSave();
	    }
	    GetChaoticNetTarget(intendedTarget) {
	        // 50/50 chance to hit intended target..
	        if (getRandomInt(2) == 1)
	            return intendedTarget;
	        var filteredList = ChatRoomCharacterDrawlist.filter(c => !InventoryGet(c, "ItemDevices"));
	        if (filteredList.length <= 0)
	            return intendedTarget; // Also hit the intended target if they're the _only_ one who has no devices already equipped
	        return filteredList[getRandomInt(filteredList.length)];
	    }
	    GetCraftedNet() {
	        var _a, _b, _c, _d;
	        let netgun = InventoryGet(Player, "ItemHandheld");
	        let netgunCraft = netgun === null || netgun === void 0 ? void 0 : netgun.Craft;
	        var netgunStr = (_a = this.GetHandheldItemNameAndDescriptionConcat()) !== null && _a !== void 0 ? _a : "";
	        if (!netgunCraft || !netgunStr)
	            return;
	        let craftedNets = (_c = (_b = Player.Crafting) === null || _b === void 0 ? void 0 : _b.filter(x => !!x && x.Item == "Net").map(x => x)) !== null && _c !== void 0 ? _c : [];
	        let craftingMember = netgunCraft.MemberNumber;
	        if (!!craftingMember && craftingMember >= 0 && craftingMember != Player.MemberNumber) {
	            let craftingChar = getCharacter(craftingMember);
	            if (!!craftingChar) {
	                craftedNets = craftedNets === null || craftedNets === void 0 ? void 0 : craftedNets.concat(CraftingDecompressServerData(craftingChar.Crafting).filter(x => (x === null || x === void 0 ? void 0 : x.Item) == "Net"));
	            }
	        }
	        let craftedNet = (_d = craftedNets === null || craftedNets === void 0 ? void 0 : craftedNets.filter(x => !!x)) === null || _d === void 0 ? void 0 : _d.find(x => !!x && !!x.Name && isPhraseInString(netgunStr, x.Name));
	        return craftedNet;
	    }
	    ApplyNet(target) {
	        let isDefaultNet = false;
	        let craftedNet = this.GetCraftedNet();
	        if (!craftedNet) {
	            isDefaultNet = true;
	            craftedNet = {
	                MemberNumber: Player.MemberNumber,
	                MemberName: CharacterNickname(Player),
	                Name: "Net Gun Net",
	                Description: "A lightweight net designed to be shot from a handheld launcher.",
	                Color: "Default"
	            };
	        }
	        var net = InventoryWear(target, "Net", "ItemDevices", craftedNet.Color, isDefaultNet ? 8 : undefined, Player.MemberNumber, craftedNet, false);
	        InventoryCraft(Player, target, "ItemDevices", craftedNet, true);
	        if (!!net && !!net.Property && isDefaultNet) {
	            net.Difficulty = 8;
	            net.Property.Difficulty = 8;
	        }
	        ChatRoomCharacterUpdate(target);
	        SendAction(`%NAME%'s ${isDefaultNet ? "net" : craftedNet.Name} engulfs %OPP_NAME%.`, target);
	    }
	    /**
	     * Draws Drug Level Bars
	     * @param C Character for which to draw
	     * @param X
	     * @param Y
	     * @param Zoom
	     */
	    DrawBars(C, X, Y, Zoom, bars) {
	        bars === null || bars === void 0 ? void 0 : bars.forEach((bar, ix, arr) => {
	            let barX = X + (380 * Zoom) + (15 * ix * Zoom);
	            let barY = Y + (540 * Zoom);
	            let barZoom = Zoom * .2;
	            let barProgress = Math.max(0, Math.min(100, bar.level / bar.max)) * 100;
	            let color = "#5C5CFF";
	            if (bar.type == "mindcontrol")
	                color = "#A020F0";
	            else if (bar.type == "horny")
	                color = "#FF647F";
	            DrawRect(barX, barY, (40 * barZoom), (Math.round(400 * barZoom)), "Black");
	            DrawRect(barX, barY + (Math.round((100 - barProgress) * 4 * barZoom)), (40 * barZoom), (Math.round(barProgress * 4 * barZoom)), color);
	            DrawEmptyRect(barX, barY, (40 * barZoom), (Math.round(400 * barZoom)), color);
	        });
	    }
	    ProcessGradualLevels() {
	        var _a;
	        if (this._targetHornyLevel > 0) {
	            if (this.targetHornyLevel > this.hornyLevel) {
	                let newHorny = Math.max(this.targetHornyLevel, this.hornyLevel + this.drugLevelMultiplier / 10);
	                if (newHorny > this.hornyLevelMax * this.drugLevelMultiplier && ((_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) > 50) {
	                    ActivityOrgasmPrepare(Player);
	                    this.hornyLevel -= this.drugLevelMultiplier;
	                    this._targetHornyLevel = 0;
	                }
	                this.hornyLevel = newHorny;
	            }
	            else
	                this._targetHornyLevel = 0;
	        }
	        if (this._targetMindControlLevel > 0) {
	            if (this.targetMindControlLevel > this.mindControlLevel) {
	                this.mindControlLevel = Math.max(this.targetMindControlLevel, this.mindControlLevel + this.drugLevelMultiplier / 10);
	                if (this.mindControlLevel == this.targetMindControlLevel) {
	                    if (!this.brainwashed)
	                        MiniGameStart(this.brainWashGame.name, ((this.mindControlLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Brainwash");
	                    CurrentModule = "Online";
	                }
	            }
	            else
	                this._targetMindControlLevel = 0;
	        }
	        if (this._targetSedativeLevel > 0) {
	            if (this.targetSedativeLevel > this.sedativeLevel) {
	                this.sedativeLevel = Math.max(this.targetSedativeLevel, this.sedativeLevel + this.drugLevelMultiplier / 10);
	                if (this.sedativeLevel == this.targetSedativeLevel) {
	                    if (!this.asleep)
	                        MiniGameStart(this.sleepyGame.name, ((this.sedativeLevel / this.drugLevelMultiplier) * 8), "LSCG_InjectEnd_Sedative");
	                    CurrentModule = "Online";
	                }
	            }
	            else
	                this._targetSedativeLevel = 0;
	        }
	    }
	    HoldingDruggedDrink(C) {
	        var item = InventoryGet(C, "Handheld");
	        if (!item || (item.Asset.Name != "GlassFilled" && item.Asset.Name != "Mug") || !item.Craft)
	            return false;
	        var drugTypes = this.GetDrugTypes(item.Craft);
	        return drugTypes.length > 0;
	    }
	    GetGagDrinkAccess(C) {
	        var _a;
	        var mouthItems = [
	            InventoryGet(C, "ItemMouth"),
	            InventoryGet(C, "ItemMouth2"),
	            InventoryGet(C, "ItemMouth3"),
	        ].filter(g => !!g);
	        let gagOverrideAllowChecks = [
	            ["FunnelGag", "Funnel"],
	            ["RingGag"]
	        ];
	        var overrideGag = mouthItems.find(gag => gagOverrideAllowChecks.map(o => o[0]).indexOf(gag === null || gag === void 0 ? void 0 : gag.Asset.Name) > -1);
	        if (!!overrideGag) {
	            let check = gagOverrideAllowChecks.find(x => x[0] == (overrideGag === null || overrideGag === void 0 ? void 0 : overrideGag.Asset.Name));
	            if (!!check && (check.length == 1 || check[1] == ((_a = overrideGag.Property) === null || _a === void 0 ? void 0 : _a.Type)))
	                return "open";
	        }
	        let blocked = C.IsMouthBlocked();
	        let isOpen = C.IsMouthOpen();
	        if (blocked)
	            return "blocked";
	        else if (!blocked && isOpen)
	            return "open";
	        else
	            return "nothing";
	    }
	    TryForceDrink(sender) {
	        var _a;
	        let itemUseModule = getModule("ItemUseModule");
	        if (!itemUseModule) {
	            return this.ProcessDruggedDrink(sender);
	        }
	        var itemName = itemUseModule.getItemName(InventoryGet(sender, "ItemHandheld"));
	        let check = (_a = getModule("ItemUseModule")) === null || _a === void 0 ? void 0 : _a.MakeActivityCheck(sender, Player);
	        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
	            SendAction(`${CharacterNickname(sender)} ${check.AttackerRoll.TotalStr}manages to get their ${itemName} past ${CharacterNickname(Player)}'s ${check.DefenderRoll.TotalStr}lips, forcing %POSSESSIVE% to swallow.`);
	            setTimeout(() => this.ProcessDruggedDrink(sender), 5000);
	        }
	        else {
	            SendAction(`${CharacterNickname(Player)} ${check.DefenderRoll.TotalStr}successfully defends against ${CharacterNickname(sender)}'s ${check.AttackerRoll.TotalStr}attempt to force %POSSESSIVE% to drink their ${itemName}, spilling drink all over.`);
	        }
	    }
	    InitStates() {
	        var _a, _b, _c;
	        let item = InventoryGet(Player, "ItemMouth3");
	        this._wasWearingRespirator = this.IsValidRespirator(item);
	        if (this.asleep) {
	            (_a = this.miscModule) === null || _a === void 0 ? void 0 : _a.SetSleepExpression();
	            (_b = this.miscModule) === null || _b === void 0 ? void 0 : _b.FallDownIfPossible();
	            addCustomEffect(Player, "ForceKneel");
	        }
	        if (this.brainwashed) {
	            (_c = this.hypnoModule) === null || _c === void 0 ? void 0 : _c.SetEyes();
	        }
	    }
	    CheckRespiratorCurseUpdate() {
	        if (this.IsWearingRespirator && this.IsRespiratorOn && !this._respiratorHasGas) {
	            SendAction("%NAME%'s mask whirs and shudders as it reloads its own supply and continues emitting.");
	            this.settings.continuousDeliveryActivatedAt = CommonTime();
	            settingsSave();
	        }
	        else if (this.IsWearingRespirator && !this.IsRespiratorOn) {
	            SendAction("%NAME%'s mask hums menacingly as it holds its supply in reserve.");
	        }
	        else if (this.IsWearingRespirator && this.IsRespiratorOn && this._respiratorHasGas) {
	            SendAction("%NAME%'s mask clicks and turns itself back on.");
	        }
	    }
	    CheckForContinuousToggle(sender) {
	        if (this.IsWearingRespirator) {
	            if (this.IsRespiratorOn) {
	                if (!this._respiratorHasGas) {
	                    SendAction("%OPP_NAME% reloads %NAME%'s mask and turns it back on, pumping gas back into %POSSESSIVE% lungs.", sender);
	                    this.settings.continuousDeliveryActivatedAt = CommonTime();
	                    settingsSave();
	                }
	                else
	                    SendAction("%OPP_NAME% switches on %NAME%'s mask, filling %POSSESSIVE% lungs.", sender);
	            }
	            else {
	                SendAction("%OPP_NAME% switches off %NAME%'s mask, halting the flow of gas.", sender);
	            }
	        }
	    }
	    get IsWearingRespirator() {
	        let item = InventoryGet(Player, "ItemMouth3");
	        let isWearing = this.IsValidRespirator(item);
	        if (!this._wasWearingRespirator && isWearing) {
	            if (!this.asleep && !this.brainwashed && this.IsRespiratorOn) {
	                SendAction("%NAME%'s eyes widen as %POSSESSIVE% mask activates, slowly filling %POSSESSIVE% lungs with its drug.");
	                CharacterSetFacialExpression(Player, "Eyes", "Surprised", 4);
	            }
	            this.settings.continuousDeliveryActivatedAt = CommonTime();
	            settingsSave();
	        }
	        else if (this._wasWearingRespirator && !isWearing) {
	            SendAction("%NAME% takes a deep breath of cool, clean air as %POSSESSIVE% mask is removed.");
	        }
	        this._wasWearingRespirator = isWearing;
	        return isWearing;
	    }
	    get _respiratorHasGas() {
	        return this.settings.continuousDeliveryForever ||
	            this.settings.continuousDeliveryActivatedAt + this.settings.continuousDeliveryTimeout > CommonTime();
	    }
	    get RespiratorHasGas() {
	        let hasGas = this._respiratorHasGas;
	        if (!hasGas && this.IsWearingRespirator && this.IsRespiratorOn) {
	            SendAction("%NAME%'s mask hisses quietly as it runs out of its supply of gas.");
	            let item = InventoryGet(Player, "ItemMouth3");
	            if (!!item && !!item.Property && item.Property.Type) {
	                item.Property.Type = item.Property.Type.replace("g1", "g0");
	                CharacterRefresh(Player, true);
	            }
	        }
	        return hasGas;
	    }
	    get IsRespiratorOn() {
	        var _a, _b;
	        let item = InventoryGet(Player, "ItemMouth3");
	        return ((_b = (_a = item === null || item === void 0 ? void 0 : item.Property) === null || _a === void 0 ? void 0 : _a.Type) === null || _b === void 0 ? void 0 : _b.substring(3, 4)) == "1";
	    }
	    get IsContinuousDeliveryActive() {
	        return this.Enabled && this.IsWearingRespirator && this.RespiratorHasGas && this.IsRespiratorOn;
	    }
	    IsValidRespirator(item) {
	        // False if not a crafted respirator
	        if (!this.settings.enableContinuousDelivery ||
	            !item ||
	            !item.Craft ||
	            item.Asset.Name != "LatexRespirator" ||
	            !item.Property ||
	            !item.Property.Type)
	            return false;
	        //Type: "f2g1s0m0l0"
	        let typeString = item.Property.Type;
	        let hasHose = typeString.substring(1, 2) == '2' || typeString.substring(1, 2) == '3';
	        let isDrugged = this.GetDrugTypes(item.Craft).length > 0;
	        return hasHose && isDrugged;
	    }
	    CheckForHypnoHelmet() {
	        var _a, _b, _c, _d, _e, _f;
	        var headItem = InventoryGet(Player, "ItemHead");
	        var hoodItem = InventoryGet(Player, "ItemHood");
	        let isWearingActiveHeadset = (((_a = headItem === null || headItem === void 0 ? void 0 : headItem.Asset) === null || _a === void 0 ? void 0 : _a.Name) == "InteractiveVRHeadset" && !!((_b = headItem === null || headItem === void 0 ? void 0 : headItem.Property) === null || _b === void 0 ? void 0 : _b.Type) && ((_c = headItem === null || headItem === void 0 ? void 0 : headItem.Property) === null || _c === void 0 ? void 0 : _c.Type[1]) == "5") ||
	            (((_d = hoodItem === null || hoodItem === void 0 ? void 0 : hoodItem.Asset) === null || _d === void 0 ? void 0 : _d.Name) == "TechnoHelmet1" && !!((_e = hoodItem === null || hoodItem === void 0 ? void 0 : hoodItem.Property) === null || _e === void 0 ? void 0 : _e.Type) && ((_f = hoodItem === null || hoodItem === void 0 ? void 0 : hoodItem.Property) === null || _f === void 0 ? void 0 : _f.Type[1]) == "5");
	        if (isWearingActiveHeadset) {
	            let randomLevelIncrease = (getRandomInt(4) + 2) / 10; // .2 to .5
	            if (getRandomInt(50) == 0) { // Odds are big jump once every 10 seconds
	                if (!this.brainwashed)
	                    SendAction(this.headsetMindControlEventStr[getRandomInt(this.headsetMindControlEventStr.length)]);
	                this.AddMindControl(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
	            }
	            else
	                this.AddMindControl(randomLevelIncrease / 4, false);
	        }
	    }
	    BreathInDrugEvent() {
	        if (this.IsContinuousDeliveryActive) {
	            let mask = InventoryGet(Player, "ItemMouth3");
	            if (!mask)
	                return;
	            let types = this.GetDrugTypes(mask.Craft);
	            let randomLevelIncrease = (getRandomInt(4) + 2) / 10; // .2 to .5
	            if (types.indexOf("sedative") > -1 && this.settings.enableSedative) {
	                if (getRandomInt(30) == 0) { // Odds are big jump once every 60 seconds
	                    if (!this.asleep)
	                        SendAction(this.breathSedativeEventStr[getRandomInt(this.breathSedativeEventStr.length)]);
	                    this.AddSedative(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
	                }
	                else
	                    this.AddSedative(randomLevelIncrease / 4, false);
	            }
	            if (types.indexOf("mindcontrol") > -1 && this.settings.enableMindControl) {
	                if (getRandomInt(30) == 0) { // Odds are big jump once every 60 seconds
	                    if (!this.brainwashed)
	                        SendAction(this.breathMindControlEventStr[getRandomInt(this.breathMindControlEventStr.length)]);
	                    this.AddMindControl(randomLevelIncrease + 1, getRandomInt(3) != 0); // 2/3 chance to start incap minigame
	                }
	                else
	                    this.AddMindControl(randomLevelIncrease / 4, false);
	            }
	            if (types.indexOf("horny") > -1 && this.settings.enableHorny) {
	                if (getRandomInt(45) == 0) { // Odds are big jump once every 90 seconds
	                    SendAction(this.breathAphrodesiacEventStr[getRandomInt(this.breathAphrodesiacEventStr.length)]);
	                    this.AddHorny(randomLevelIncrease + 1, getRandomInt(3) == 0); // 1/3 chance to push user over the edge (if allowed...)
	                }
	                else
	                    this.AddHorny(randomLevelIncrease / 4, false);
	            }
	            if (types.indexOf("antidote") > -1 && getRandomInt(120) == 0) { // Odds are heal once every 4 minutes
	                SendAction(this.breathAntidoteEventStr[getRandomInt(this.breathAntidoteEventStr.length)]);
	                this.DoCure();
	            }
	        }
	    }
	}

	class PublicSettingsModel {
	    constructor() {
	        this.enabled = false;
	        this.Version = LSCG_VERSION;
	        this.CollarModule = {
	            enabled: false,
	            chokeLevel: 0,
	            collarPurchased: false,
	            allowedMembers: "",
	            remoteAccess: false,
	            lockable: false,
	            locked: false,
	            immersive: false,
	            limitToCrafted: false,
	            collar: { creator: -1, name: "" },
	            tightTrigger: "",
	            looseTrigger: "",
	            allowSelfTightening: false,
	            allowSelfLoosening: false,
	            allowButtons: false,
	            anyCollar: false,
	            knockout: false,
	            knockoutMinutes: 2
	        };
	        this.HypnoModule = {
	            enabled: false,
	            activatedAt: 0,
	            recoveredAt: 0,
	            cycleTime: 30,
	            enableCycle: true,
	            overrideMemberIds: "",
	            overrideWords: "",
	            awakeners: "",
	            allowLocked: false,
	            remoteAccess: false,
	            remoteAccessRequiredTrance: true,
	            limitRemoteAccessToHypnotizer: true,
	            allowRemoteModificationOfMemberOverride: false,
	            cooldownTime: 0,
	            enableArousal: false,
	            immersive: false,
	            triggerTime: 5,
	            locked: false,
	            hypnotized: false,
	            hypnotizedBy: 0,
	        };
	        this.BoopsModule = { enabled: false };
	        this.LipstickModule = {
	            enabled: false,
	            dry: false
	        };
	        this.GlobalModule = {
	            enabled: false,
	            sharePublicCrafting: false
	        };
	        this.MiscModule = { enabled: false };
	        this.InjectorModule = {
	            enabled: false,
	            sedativeLevel: 0,
	            sedativeMax: 5,
	            mindControlLevel: 0,
	            mindControlMax: 5,
	            hornyLevel: 0,
	            hornyLevelMax: 5,
	            drugLevelMultiplier: 100,
	            asleep: false,
	            brainwashed: false
	        };
	    }
	}

	// Core Module that can handle basic functionality like server handshakes etc.
	// Maybe can consolidate things like hypnosis/suffocation basic state handling too..
	class CoreModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.toggleSharedButton = {
	            x: 1898,
	            y: 120,
	            width: 40,
	            height: 40
	        };
	    }
	    get publicSettings() {
	        var _a, _b;
	        var settings = new PublicSettingsModel();
	        for (const m of modules()) {
	            var moduleSettings = (_a = m.settings) !== null && _a !== void 0 ? _a : { enabled: false };
	            var moduleSettingStorage = (_b = m.settingsStorage) !== null && _b !== void 0 ? _b : "";
	            if (Object.hasOwn(settings, moduleSettingStorage)) {
	                var publicModuleSetting = settings[moduleSettingStorage];
	                for (const k of Object.keys(moduleSettings)) {
	                    if (Object.hasOwn(publicModuleSetting, k))
	                        publicModuleSetting[k] = moduleSettings[k];
	                }
	            }
	            settings.enabled = Player.LSCG.GlobalModule.enabled;
	        }
	        return settings;
	    }
	    get settingsStorage() {
	        return "GlobalModule";
	    }
	    get settings() {
	        return super.settings;
	    }
	    get defaultSettings() {
	        return {
	            enabled: false,
	            blockSettingsWhileRestrained: false,
	            edgeBlur: false,
	            seeSharedCrafts: true,
	            sharePublicCrafting: false,
	            showCheckRolls: true
	        };
	    }
	    load() {
	        hookFunction("ChatRoomSync", 1, (args, next) => {
	            this.CheckVersionUpdate();
	            this.SendPublicPacket(true);
	            return next(args);
	        }, ModuleCategory.Core);
	        hookFunction("ChatRoomMessage", 1, (args, next) => {
	            this.CheckForPublicPacket(args[0]);
	            return next(args);
	        }, ModuleCategory.Core);
	        hookFunction("ChatRoomDrawCharacterOverlay", 1, (args, next) => {
	            var _a, _b, _c;
	            next(args);
	            const [C, CharX, CharY, Zoom] = args;
	            const Char = getCharacter(C.MemberNumber);
	            const ModUser = !!(Char === null || Char === void 0 ? void 0 : Char.LSCG);
	            const Friend = C.ID === 0 || ((_a = Player.FriendList) !== null && _a !== void 0 ? _a : []).includes(C.MemberNumber);
	            const Ghosted = ((_b = Player.GhostList) !== null && _b !== void 0 ? _b : []).includes(C.MemberNumber);
	            const isAdmin = (Array.isArray(ChatRoomData === null || ChatRoomData === void 0 ? void 0 : ChatRoomData.Admin) && (ChatRoomData === null || ChatRoomData === void 0 ? void 0 : ChatRoomData.Admin.includes(C.MemberNumber)));
	            if (ModUser && ChatRoomHideIconState === 0 && !Ghosted) {
	                var version = C.IsPlayer() ? LSCG_VERSION : (_c = C.LSCG) === null || _c === void 0 ? void 0 : _c.Version;
	                var starColor = isAdmin ? "#008080" : "#00AEAE";
	                if (version != LSCG_VERSION)
	                    starColor = "#ff4545";
	                var xOffset = 0;
	                if (!window.bcx)
	                    xOffset = -10;
	                drawSvg(MainCanvas, SVG_ICONS.STAR, CharX + (xOffset + 410) * Zoom, CharY + 8 * Zoom, 40 * Zoom, 40 * Zoom, 50, 0.8, 1, starColor);
	                if (MouseIn(CharX + 405 * Zoom, CharY + 3 * Zoom, 50 * Zoom, 50 * Zoom)) {
	                    var prevAlign = MainCanvas.textAlign;
	                    var prevFont = MainCanvas.font;
	                    var pad = 5;
	                    var TextX = CharX + 425 * Zoom;
	                    var TextY = CharY + 50 * Zoom;
	                    MainCanvas.textAlign = "left";
	                    MainCanvas.font = '16px Arial, sans-serif';
	                    var size = MainCanvas.measureText(version);
	                    DrawRect(TextX - size.width - pad, TextY - size.actualBoundingBoxAscent - pad, size.actualBoundingBoxRight - size.actualBoundingBoxLeft + 2 * pad, size.actualBoundingBoxDescent + size.actualBoundingBoxAscent + 2 * pad, "#D7F6E9");
	                    DrawText(version, TextX - size.width, TextY, "Black");
	                    //MainCanvas.fillText(version, CharX + 420 * Zoom, CharY + 50*Zoom, 100*Zoom);
	                    MainCanvas.textAlign = prevAlign;
	                    MainCanvas.font = prevFont;
	                }
	            }
	        }, ModuleCategory.Core);
	        // Pull other public crafts from the room
	        hookFunction("DialogInventoryBuild", 1, (args, next) => {
	            next(args);
	            if (this.settings.seeSharedCrafts) {
	                let target = args[0];
	                if (!target.FocusGroup)
	                    return;
	                ChatRoomCharacter.forEach(C => {
	                    if (C.Crafting != null && !C.IsPlayer() && C.MemberNumber != target.MemberNumber && C.LSCG && C.LSCG.GlobalModule.sharePublicCrafting) {
	                        let Crafting = CraftingDecompressServerData(C.Crafting);
	                        for (let Craft of Crafting)
	                            if ((Craft != null) && (Craft.Item != null))
	                                if ((Craft.Private == null) || (Craft.Private == false)) {
	                                    Craft.MemberName = CharacterNickname(C);
	                                    Craft.MemberNumber = C.MemberNumber;
	                                    const group = AssetGroupGet(target.AssetFamily, target.FocusGroup.Name);
	                                    for (let A of group.Asset)
	                                        if (CraftingAppliesToItem(Craft, A) && DialogCanUseCraftedItem(target, Craft))
	                                            DialogInventoryAdd(target, { Asset: A, Craft: Craft }, false);
	                                }
	                    }
	                });
	                DialogInventorySort();
	            }
	        }, ModuleCategory.Core);
	        hookFunction("DialogDrawItemMenu", 1, (args, next) => {
	            this._drawShareToggleButton(this.toggleSharedButton.x, this.toggleSharedButton.y, this.toggleSharedButton.width, this.toggleSharedButton.height);
	            next(args);
	        }, ModuleCategory.Core);
	        hookFunction("DialogClick", 1, (args, next) => {
	            next(args);
	            let C = CharacterGetCurrent();
	            if (!C)
	                return;
	            if (MouseIn(this.toggleSharedButton.x, this.toggleSharedButton.y, this.toggleSharedButton.width, this.toggleSharedButton.height) &&
	                DialogModeShowsInventory() && (DialogMenuMode === "permissions" || (Player.CanInteract() && !InventoryGroupIsBlocked(C, undefined, true)))) {
	                this.settings.seeSharedCrafts = !this.settings.seeSharedCrafts;
	                settingsSave();
	                DialogInventoryBuild(C, true, false);
	            }
	        });
	    }
	    _drawShareToggleButton(X, Y, Width, Height) {
	        DrawButton(X, Y, Width, Height, "", this.settings.seeSharedCrafts ? "White" : "Red", "", "Toggle Shared Crafts", false);
	        DrawImageResize("Icons/Online.png", X + 2, Y + 2, Width - 4, Height - 4);
	        DrawLineCorner(X + 2, Y + 2, X + Width - 2, Y + Height - 2, X + 2, Y + 2, 2, "Black");
	    }
	    run() {
	        if (ServerPlayerIsInChatRoom()) {
	            this.CheckVersionUpdate();
	            this.SendPublicPacket(true);
	        }
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Core);
	    }
	    CheckVersionUpdate() {
	        var _a;
	        var previousVersion = (_a = Player.LSCG) === null || _a === void 0 ? void 0 : _a.Version;
	        if (!previousVersion || previousVersion != LSCG_VERSION) {
	            this.ShowChangelog();
	            if (!Player.LSCG) {
	                Player.LSCG = {};
	                this.registerDefaultSettings();
	            }
	            Player.LSCG.Version = LSCG_VERSION;
	            settingsSave();
	        }
	    }
	    SendPublicPacket(replyRequested, type = "init") {
	        sendLSCGMessage({
	            version: LSCG_VERSION,
	            type: type,
	            settings: this.publicSettings,
	            target: null,
	            reply: replyRequested
	        });
	    }
	    CheckForPublicPacket(data) {
	        if (data.Sender != Player.MemberNumber && data.Type == "Hidden" && data.Content == "LSCGMsg" && !!data.Dictionary && !!data.Dictionary[0]) {
	            var C = getCharacter(data.Sender);
	            var msg = data.Dictionary[0].message;
	            switch (msg.type) {
	                case "init":
	                    this.Init(C, msg);
	                    break;
	                case "sync":
	                    this.Sync(C, msg);
	                    break;
	                case "command":
	                    this.Command(C, msg);
	                    break;
	            }
	        }
	    }
	    Init(Sender, msg) {
	        this.Sync(Sender, msg);
	    }
	    Sync(Sender, msg) {
	        var _a, _b;
	        if (!Sender)
	            return;
	        Sender.LSCG = Object.assign((_a = Sender.LSCG) !== null && _a !== void 0 ? _a : {}, (_b = msg.settings) !== null && _b !== void 0 ? _b : {});
	        if (msg.reply) {
	            this.SendPublicPacket(false, msg.type);
	        }
	    }
	    Command(Sender, msg) {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
	        if (!msg.command || msg.target != Player.MemberNumber)
	            return;
	        switch (msg.command.name) {
	            case "grab":
	                (_a = getModule("ActivityModule")) === null || _a === void 0 ? void 0 : _a.IncomingGrab(Sender, (_b = msg.command.args.find(a => a.name == "type")) === null || _b === void 0 ? void 0 : _b.value);
	                break;
	            case "release":
	                (_c = getModule("ActivityModule")) === null || _c === void 0 ? void 0 : _c.IncomingRelease(Sender, (_d = msg.command.args.find(a => a.name == "type")) === null || _d === void 0 ? void 0 : _d.value);
	                break;
	            case "escape":
	                (_e = getModule("ActivityModule")) === null || _e === void 0 ? void 0 : _e.IncomingEscape(Sender, msg.target);
	                break;
	            case "remote":
	                let prevCollarPurchase = (_g = (_f = Player.LSCG) === null || _f === void 0 ? void 0 : _f.CollarModule) === null || _g === void 0 ? void 0 : _g.collarPurchased;
	                Object.assign(Player.LSCG.HypnoModule, (_h = msg.settings) === null || _h === void 0 ? void 0 : _h.HypnoModule);
	                Object.assign(Player.LSCG.CollarModule, (_j = msg.settings) === null || _j === void 0 ? void 0 : _j.CollarModule);
	                (_k = getModule("HypnoModule")) === null || _k === void 0 ? void 0 : _k.initializeTriggerWord();
	                settingsSave(true);
	                let currentCollarPurchase = (_m = (_l = Player.LSCG) === null || _l === void 0 ? void 0 : _l.CollarModule) === null || _m === void 0 ? void 0 : _m.collarPurchased;
	                if (!prevCollarPurchase && currentCollarPurchase)
	                    LSCG_SendLocal(`${!Sender ? "Someone" : CharacterNickname(Sender)} has purchased the Collar Module for you!`);
	                else
	                    LSCG_SendLocal(`${!Sender ? "Someone" : CharacterNickname(Sender)} has accessed your remote settings!`);
	                break;
	            case "collar-tighten":
	                if (!!Sender)
	                    (_o = getModule("CollarModule")) === null || _o === void 0 ? void 0 : _o.TightenButtonPress(Sender);
	                break;
	            case "collar-loosen":
	                if (!!Sender)
	                    (_p = getModule("CollarModule")) === null || _p === void 0 ? void 0 : _p.LoosenButtonPress(Sender);
	                break;
	            case "collar-stats":
	                if (!!Sender)
	                    (_q = getModule("CollarModule")) === null || _q === void 0 ? void 0 : _q.StatsButtonPress(Sender);
	                break;
	            case "photo":
	                DrawFlashScreen("#FFFFFF", 500, 1500);
	                break;
	        }
	    }
	    ShowChangelog() {
	        const message = `New LSCG version: ${LSCG_VERSION}
See below for the latest changes:
${LSCG_CHANGES}`;
	        ServerAccountBeep({
	            MemberNumber: Player.MemberNumber,
	            MemberName: "LSCG",
	            ChatRoomName: "LSCG Update",
	            Private: true,
	            Message: message,
	            ChatRoomSpace: "",
	        });
	        console.info(`LSCG Updated:${LSCG_CHANGES}`);
	    }
	}

	class RemoteGuiSubscreen extends GuiSubscreen {
	    constructor(module, C) {
	        super(module);
	        this.dirty = false;
	        this.Character = C;
	    }
	    get SubscreenName() {
	        return SETTING_NAME_PREFIX + this.constructor.name;
	    }
	    setSubscreen(screen) {
	        var rootModule = getModule("RemoteUIModule");
	        if (!!rootModule && !!screen)
	            rootModule.currentSubscreen = screen;
	        return screen;
	    }
	    get settings() {
	        var _a;
	        if (!this.module.settingsStorage)
	            return {};
	        if (!((_a = this.Character) === null || _a === void 0 ? void 0 : _a.LSCG) || !this.Character.LSCG[this.module.settingsStorage]) {
	            return {}; // Somehow a non-mod user made it this far?
	        }
	        return this.Character.LSCG[this.module.settingsStorage];
	    }
	    settingsSave() {
	        var _a;
	        if (!this.Character || !this.dirty)
	            return;
	        sendLSCGMessage({
	            type: "command",
	            reply: false,
	            target: (_a = this.Character) === null || _a === void 0 ? void 0 : _a.MemberNumber,
	            version: LSCG_VERSION,
	            settings: this.Character.LSCG,
	            command: {
	                name: "remote"
	            }
	        });
	    }
	    Load() {
	        super.Load();
	        this.dirty = false;
	    }
	    Click() {
	        super.Click();
	        this.dirty = true;
	    }
	    Exit() {
	        this.structure.forEach(item => {
	            switch (item.type) {
	                case "number":
	                    if (!CommonIsNumeric(ElementValue(item.id))) {
	                        ElementRemove(item.id);
	                        break;
	                    }
	                case "text":
	                    let val = ElementValue(item.id);
	                    if (val != item.setting())
	                        this.dirty = true;
	                    item.setSetting(ElementValue(item.id));
	                    ElementRemove(item.id);
	                    break;
	            }
	        });
	        this.settingsSave();
	        var rootModule = getModule("RemoteUIModule");
	        if (!!rootModule)
	            rootModule.currentSubscreen = new RemoteMainMenu(rootModule, this.Character);
	    }
	}

	class RemoteHypno extends RemoteGuiSubscreen {
	    constructor() {
	        super(...arguments);
	        this.subscreens = [];
	    }
	    get name() {
	        return "Hypnosis";
	    }
	    get overrideMemberIds() {
	        var _a;
	        return (_a = GetDelimitedList(this.settings.overrideMemberIds).map(id => +id).filter(id => id > 0)) !== null && _a !== void 0 ? _a : [];
	    }
	    get disabledReason() {
	        var _a, _b, _c;
	        var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
	        if (this.overrideMemberIds.length > 0)
	            memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber) > -1;
	        var isTrance = this.settings.hypnotized || ((_c = (_b = (_a = this.Character) === null || _a === void 0 ? void 0 : _a.LSCG) === null || _b === void 0 ? void 0 : _b.InjectorModule) === null || _c === void 0 ? void 0 : _c.brainwashed);
	        var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
	        var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.settings.hypnotizedBy == Player.MemberNumber) || !this.settings.limitRemoteAccessToHypnotizer;
	        if (!memberIdIsAllowed)
	            return "You do not have access to their mind...";
	        if (!passTranceReq)
	            return "They have too much willpower to let you in...";
	        if (!passHypnotizerReq)
	            return "They seem suggestable, but not to you...";
	        else
	            return "Section is Unavailable";
	    }
	    get enabled() {
	        var _a, _b, _c;
	        var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
	        if (this.overrideMemberIds.length > 0)
	            memberIdIsAllowed = this.overrideMemberIds.indexOf(Player.MemberNumber) > -1;
	        var isTrance = this.settings.hypnotized || ((_c = (_b = (_a = this.Character) === null || _a === void 0 ? void 0 : _a.LSCG) === null || _b === void 0 ? void 0 : _b.InjectorModule) === null || _c === void 0 ? void 0 : _c.brainwashed);
	        var passTranceReq = (this.settings.remoteAccessRequiredTrance && isTrance) || !this.settings.remoteAccessRequiredTrance;
	        var passHypnotizerReq = (this.settings.limitRemoteAccessToHypnotizer && this.settings.hypnotizedBy == Player.MemberNumber) || !this.settings.limitRemoteAccessToHypnotizer;
	        return this.settings.remoteAccess &&
	            (this.Character.IsOwnedByPlayer() ||
	                (this.settings.enabled &&
	                    memberIdIsAllowed &&
	                    passTranceReq &&
	                    passHypnotizerReq));
	    }
	    get icon() {
	        return ICONS.HYPNO;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get multipageStructure() {
	        return [[
	                {
	                    type: "checkbox",
	                    label: "Immersive Hypnosis:",
	                    description: "Makes the hypnotized experience more restrictive. LSCG settings will be unavailable while hypnotized.",
	                    setting: () => { var _a; return (_a = this.settings.immersive) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.immersive = val
	                }, {
	                    type: "text",
	                    id: "hypno_overrideWords",
	                    label: "Override Trigger Words:",
	                    description: "Custom list of words and/or phrases as hypnisis triggers. Separated by a comma.",
	                    setting: () => { var _a; return (_a = this.settings.overrideWords) !== null && _a !== void 0 ? _a : ""; },
	                    setSetting: (val) => this.settings.overrideWords = val
	                }, {
	                    type: "text",
	                    id: "hypno_overrideAwakeners",
	                    label: "Override Awaken Words:",
	                    description: "Custom list of words and/or phrases as awakener triggers. Separated by a comma.",
	                    disabled: !this.settings.enabled,
	                    setting: () => { var _a; return (_a = this.settings.awakeners) !== null && _a !== void 0 ? _a : ""; },
	                    setSetting: (val) => this.settings.awakeners = val
	                }, {
	                    type: "text",
	                    id: "hypno_overrideMembers",
	                    label: "Override Allowed Member IDs:",
	                    description: "Comma separated list of member IDs. If empty will use standard Item Permissions.",
	                    disabled: !(this.settings.allowRemoteModificationOfMemberOverride || this.Character.IsOwnedByPlayer()),
	                    setting: () => { var _a; return (_a = this.settings.overrideMemberIds) !== null && _a !== void 0 ? _a : ""; },
	                    setSetting: (val) => this.settings.overrideMemberIds = val
	                }, {
	                    type: "number",
	                    id: "hypno_triggerTime",
	                    label: "Hypnosis Length (min.):",
	                    description: "Length of hypnosis time (in minutes) before automatically recovering. Set to 0 for indefinite.",
	                    setting: () => { var _a; return ((_a = this.settings.triggerTime) !== null && _a !== void 0 ? _a : 5); },
	                    setSetting: (val) => this.settings.triggerTime = val
	                }, {
	                    type: "number",
	                    id: "hypno_cooldownTime",
	                    label: "Cooldown (sec.):",
	                    description: "Cooldown time (in seconds) before you can be hypnotized again.",
	                    setting: () => { var _a; return ((_a = this.settings.cooldownTime) !== null && _a !== void 0 ? _a : 0); },
	                    setSetting: (val) => this.settings.cooldownTime = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Cycle:",
	                    description: "If checked, only one trigger will be active at a time and will cycle after use.",
	                    setting: () => { var _a; return (_a = this.settings.enableCycle) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enableCycle = val
	                }, {
	                    type: "number",
	                    id: "hypno_cycleTime",
	                    label: "Trigger Cycle Time (min.):",
	                    description: "Number of minutes after activation to wait before cycling to a new trigger.",
	                    setting: () => { var _a; return ((_a = this.settings.cycleTime) !== null && _a !== void 0 ? _a : 30); },
	                    setSetting: (val) => this.settings.cycleTime = val
	                }, {
	                    type: "label",
	                    label: "",
	                    description: ""
	                }, {
	                    type: "label",
	                    label: "",
	                    description: ""
	                }, {
	                    type: "checkbox",
	                    label: "Remote Access Requires Trance:",
	                    description: "If checked, remote access is only possible while actively hypnotized.",
	                    setting: () => { var _a; return (_a = this.settings.remoteAccessRequiredTrance) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.remoteAccessRequiredTrance = val
	                }, {
	                    type: "checkbox",
	                    label: "Remote Access Limited to Hypnotizer:",
	                    description: "If checked, only the user who hypnotized you can access your settings (after matching other conditions).",
	                    setting: () => { var _a; return (_a = this.settings.limitRemoteAccessToHypnotizer) !== null && _a !== void 0 ? _a : true; },
	                    setSetting: (val) => this.settings.limitRemoteAccessToHypnotizer = val
	                }, {
	                    type: "checkbox",
	                    label: "Locked:",
	                    disabled: !this.settings.allowLocked,
	                    description: "If checked, locks the user out of their own hypnosis settings.",
	                    setting: () => { var _a; return (_a = this.settings.locked) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => {
	                        if (this.settings.allowLocked)
	                            this.settings.locked = val;
	                    }
	                }
	            ]];
	    }
	}

	class RemoteCollar extends RemoteGuiSubscreen {
	    constructor() {
	        super(...arguments);
	        this.subscreens = [];
	        this.blinkLastTime = 0;
	        this.blinkColor = "Red";
	    }
	    get name() {
	        return "Control Collar";
	    }
	    get allowedMemberIds() {
	        var _a;
	        let idList = (_a = GetDelimitedList(this.settings.allowedMembers).map(id => +id).filter(id => id > 0)) !== null && _a !== void 0 ? _a : [];
	        if (this.settings.limitToCrafted && this.settings.collar.creator >= 0)
	            idList.push(this.settings.collar.creator);
	        return idList;
	    }
	    get disabledReason() {
	        if (!this.settings.collarPurchased && !this.Character.IsOwnedByPlayer())
	            return "You must be the owner to purchase this module for them...";
	        var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
	        if (this.allowedMemberIds.length > 0)
	            memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber) > -1;
	        if (!memberIdIsAllowed)
	            return "You do not have access to their collar...";
	        else
	            return "Section is Unavailable";
	    }
	    get enabled() {
	        if (!this.settings.collarPurchased)
	            return this.Character.IsOwnedByPlayer();
	        var memberIdIsAllowed = ServerChatRoomGetAllowItem(Player, this.Character);
	        if (this.allowedMemberIds.length > 0)
	            memberIdIsAllowed = this.allowedMemberIds.indexOf(Player.MemberNumber) > -1;
	        return this.settings.remoteAccess &&
	            (this.Character.IsOwnedByPlayer() ||
	                (this.settings.enabled && memberIdIsAllowed));
	    }
	    get icon() {
	        return ICONS.COLLAR;
	    }
	    get settings() {
	        return super.settings;
	    }
	    get multipageStructure() {
	        return [!this.settings.collarPurchased ? [] : [
	                {
	                    type: "checkbox",
	                    label: "Enabled:",
	                    description: "Enabled the Choking Collar Features.",
	                    setting: () => { var _a; return (_a = this.settings.enabled) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.enabled = val
	                }, {
	                    type: "checkbox",
	                    label: "Locked:",
	                    description: "Locks the user out of these settings.",
	                    setting: () => { var _a; return (_a = this.settings.locked) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.locked = val,
	                    disabled: !this.settings.lockable
	                }, {
	                    type: "checkbox",
	                    label: "Allow Self-Tightening:",
	                    description: "Allow the wearer to tighten their own collar.",
	                    setting: () => { var _a; return (_a = this.settings.allowSelfTightening) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.allowSelfTightening = val
	                }, {
	                    type: "checkbox",
	                    label: "Allow Self-Loosening:",
	                    description: "Allow the wearer to loosen their own collar.",
	                    setting: () => { var _a; return (_a = this.settings.allowSelfLoosening) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.allowSelfLoosening = val
	                }, {
	                    type: "text",
	                    id: "collar_allowedMembers",
	                    label: "Allowed Members IDs:",
	                    description: "Comma separated list of member IDs who can activate the collar. Leave empty for item permissions.",
	                    setting: () => { var _a, _b, _c; return (_a = this.settings.allowedMembers) !== null && _a !== void 0 ? _a : ((_c = ((_b = Player.Ownership) === null || _b === void 0 ? void 0 : _b.MemberNumber) + "") !== null && _c !== void 0 ? _c : ""); },
	                    setSetting: (val) => this.settings.allowedMembers = val
	                }, {
	                    type: "checkbox",
	                    label: "Limit to Crafted User:",
	                    description: "Limits collar activation to crafted user and allowed list. If no crafted user will use item permissions.",
	                    setting: () => { var _a; return (_a = this.settings.limitToCrafted) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.limitToCrafted = val
	                }, {
	                    type: "text",
	                    id: "collar_tightTrigger",
	                    label: "Tighten Trigger:",
	                    description: "Word or phrase that, if spoken, will tighten the collar.",
	                    setting: () => { var _a; return (_a = this.settings.tightTrigger) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.tightTrigger = val
	                }, {
	                    type: "text",
	                    id: "collar_looseTrigger",
	                    label: "Loosen Trigger:",
	                    description: "Word or phrase that, if spoken, will loosen the collar.",
	                    setting: () => { var _a; return (_a = this.settings.looseTrigger) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.looseTrigger = val
	                }, {
	                    type: "checkbox",
	                    label: "Immersive:",
	                    description: "Prevents the wearer from viewing triggers via show-triggers.",
	                    setting: () => { var _a; return (_a = this.settings.immersive) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.immersive = val
	                }, {
	                    type: "checkbox",
	                    label: "Enable Buttons:",
	                    description: "Allows activation of the collar features via buttons (activities & commands).",
	                    setting: () => { var _a; return (_a = this.settings.allowButtons) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.allowButtons = val
	                }, {
	                    type: "checkbox",
	                    label: "Any Collar:",
	                    description: "If enabled, any collar can trigger and activate.",
	                    setting: () => { var _a; return (_a = this.settings.anyCollar) !== null && _a !== void 0 ? _a : false; },
	                    setSetting: (val) => this.settings.anyCollar = val
	                }
	            ]];
	    }
	    Run() {
	        super.Run();
	        var prev = MainCanvas.textAlign;
	        if (this.settings.collarPurchased) {
	            MainCanvas.textAlign = "left";
	            // Set/Update Collar	 	[Custom??]
	            let buttonPos = this.structure.length;
	            let updateDisabled = !this.settings.enabled || this.settings.anyCollar;
	            DrawText("Update Collar:", this.getXPos(buttonPos), this.getYPos(buttonPos), updateDisabled ? "Gray" : "Black", "Gray");
	            MainCanvas.textAlign = "center";
	            DrawButton(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64, "Update", updateDisabled ? "#CCCCCC" : "White", undefined, updateDisabled ? "" : "Update Collar to Current", updateDisabled);
	            MainCanvas.textAlign = "left";
	            if (!!this.settings.collar && !this.settings.anyCollar) {
	                DrawText("Current Name: " + this.settings.collar.name, this.getXPos(buttonPos), this.getYPos(buttonPos) + 60, "Gray", "Gray");
	                if (!!this.settings.collar.creator && this.settings.collar.creator > 0)
	                    DrawText("Current Crafter: " + this.settings.collar.creator, this.getXPos(buttonPos), this.getYPos(buttonPos) + 110, "Gray", "Gray");
	            }
	        }
	        else {
	            MainCanvas.textAlign = "center";
	            if (this.blinkLastTime + 750 < CommonTime()) {
	                this.blinkLastTime = CommonTime();
	                this.blinkColor = this.blinkColor == "Gray" ? "Red" : "Gray";
	            }
	            DrawText("Now available:", 1000, 200, "Black", "Black");
	            DrawText("Andrew's Collar Control Module!!", 1000, 250, this.blinkColor, "Black");
	            DrawText("Does your sub need a more 'gripping' approach to training?", 1000, 350, "Black", "Gray");
	            DrawText("Are you looking for some extra motivation for good behavior?", 1000, 400, "Black", "Gray");
	            DrawText("Act now and secure your Control Module now for the owner-discounted price of $200!", 1000, 450, "Black", "Gray");
	            DrawText("Attach this revolutionary new device to your sub's existing collar and it will", 1000, 550, "Gray", "Black");
	            DrawText("enhance it with the ability to tighten and loosen on command!", 1000, 600, "Gray", "Black");
	            DrawText("Quiet down those bratty moments and reward good behavior!", 1000, 650, "Gray", "Black");
	            DrawButton(800, 740, 400, 80, "Purchase - $200", this.CanAffordCollar() ? "White" : "Pink", undefined, this.CanAffordCollar() ? "Unlock Andrew's Collar Module" : "Cannot afford...", !this.CanAffordCollar());
	            DrawTextFit("- Andrew co.® makes no guarantees as to the behavior of the wearer -", 1000, 900, 600, "Orange", "Gray");
	        }
	        MainCanvas.textAlign = prev;
	    }
	    Click() {
	        var _a, _b, _c, _d;
	        super.Click();
	        if (this.settings.collarPurchased) {
	            if (!this.settings.anyCollar) {
	                // Update Collar Button
	                let buttonPos = this.structure.length;
	                if (MouseIn(this.getXPos(buttonPos) + 464, this.getYPos(buttonPos) - 32, 200, 64)) {
	                    var collar = InventoryGet(this.Character, "ItemNeck");
	                    if (!collar) {
	                        this.message = "No Collar Equipped";
	                    }
	                    else {
	                        this.message = "Collar updated";
	                        this.settings.collar = {
	                            name: (_b = (_a = collar.Craft) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : collar.Asset.Name,
	                            creator: (_d = (_c = collar.Craft) === null || _c === void 0 ? void 0 : _c.MemberNumber) !== null && _d !== void 0 ? _d : 0
	                        };
	                    }
	                }
	            }
	        }
	        else {
	            if (MouseIn(800, 740, 400, 80) && this.CanAffordCollar()) {
	                this.PurchaseCollar();
	            }
	        }
	    }
	    CanAffordCollar() {
	        return Player.Money >= 200;
	    }
	    PurchaseCollar() {
	        if (!this.CanAffordCollar())
	            return;
	        Player.Money -= 200;
	        this.settings.collarPurchased = true;
	        this.settings.enabled = true;
	        this.settings.remoteAccess = true;
	        this.settings.allowedMembers = `${Player.MemberNumber}`;
	        this.settings.tightTrigger = "tight";
	        this.settings.looseTrigger = "loose";
	        this.Load();
	        ServerPlayerSync();
	        this.settingsSave();
	    }
	}

	class RemoteMainMenu extends RemoteGuiSubscreen {
	    get name() {
	        return "MainMenu";
	    }
	    get enabled() {
	        return false;
	    }
	    get hidden() {
	        return true;
	    }
	    constructor(module, C) {
	        super(module, C);
	        this.subscreens = [];
	    }
	    onChange(source) {
	        if (source === this.character.MemberNumber) {
	            this.Load();
	        }
	    }
	    Load() {
	        this.subscreens = [
	            new RemoteHypno(getModule("HypnoModule"), this.Character),
	            new RemoteCollar(getModule("CollarModule"), this.Character)
	        ];
	    }
	    get character() {
	        // Because we're initialized by that instance, it must already exist
	        return this.Character;
	    }
	    Run() {
	        var _a, _b;
	        var prev = MainCanvas.textAlign;
	        MainCanvas.textAlign = "left";
	        DrawText(`- Little Sera's Club Games ${(_b = (_a = this.Character.LSCG) === null || _a === void 0 ? void 0 : _a.Version) !== null && _b !== void 0 ? _b : "?.?.?"} -`, GuiSubscreen.START_X, GuiSubscreen.START_Y - GuiSubscreen.Y_MOD, "Black", "#D7F6E9");
	        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
	        MainCanvas.textAlign = "center";
	        let i = 0;
	        for (const screen of this.subscreens) {
	            const PX = Math.floor(i / 6);
	            const PY = i % 6;
	            const isDisabled = !screen.enabled;
	            const reason = screen.disabledReason;
	            // Skip disabled screens for the time being
	            if (screen.name == "MainMenu" || screen.hidden)
	                continue;
	            DrawButton(150 + 430 * PX, 190 + 120 * PY, 450, 90, "", isDisabled ? "#ddd" : "White", "", isDisabled ? reason : "", isDisabled);
	            DrawImageResize(screen.icon, 150 + 430 * PX + 10, 190 + 120 * PY + 10, 70, 70);
	            MainCanvas.textAlign = "left";
	            DrawTextFit(screen.name, 250 + 430 * PX, 235 + 120 * PY, 340, "Black");
	            MainCanvas.textAlign = "center";
	            i++;
	        }
	        MainCanvas.textAlign = "left";
	        DrawButton(1500, 720, 400, 80, "", "White", "", "Open LSCG Latest Release on Github.", false);
	        DrawImageResize("Icons/Changelog.png", 1510, 730, 60, 60);
	        DrawTextFit("Latest Changes", 1580, 760, 320, "Black");
	        DrawButton(1500, 820, 400, 80, "", "White", "", "Open LSCG Wiki on GitHub.", false);
	        DrawImageResize("Icons/Introduction.png", 1510, 830, 60, 60);
	        DrawTextFit("Open Help", 1580, 860, 320, "Black");
	        MainCanvas.textAlign = prev;
	    }
	    Click() {
	        if (MouseIn(1815, 75, 90, 90))
	            return this.Exit();
	        let i = 0;
	        for (const screen of this.subscreens) {
	            const PX = Math.floor(i / 6);
	            const PY = i % 6;
	            if (screen.name == "MainMenu" || screen.hidden)
	                continue;
	            if (MouseIn(150 + 430 * PX, 190 + 120 * PY, 450, 90) && screen.enabled) {
	                this.setSubscreen(screen);
	                return;
	            }
	            i++;
	        }
	        if (MouseIn(1500, 720, 400, 80))
	            window.open(LSCG_CHANGES, '_blank');
	        if (MouseIn(1500, 820, 400, 80))
	            window.open('https://github.com/littlesera/LSCG/wiki', '_blank');
	    }
	    Exit() {
	        this.module.currentSubscreen = null;
	    }
	}

	// Remote UI Module to handle configuration on other characters
	// Can be used to "program" another character's hypnosis, collar, etc.
	// Framework inspired from BCX
	class RemoteUIModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this._currentSubscreen = null;
	    }
	    get currentSubscreen() {
	        return this._currentSubscreen;
	    }
	    set currentSubscreen(subscreen) {
	        if (this._currentSubscreen) {
	            this._currentSubscreen.Unload();
	        }
	        this._currentSubscreen = subscreen;
	        if (this._currentSubscreen) {
	            this._currentSubscreen.Load();
	        }
	    }
	    getInformationSheetCharacter() {
	        const C = InformationSheetSelection;
	        if (!C || typeof C.MemberNumber !== "number")
	            return null;
	        if (C.IsPlayer())
	            return Player;
	        return getCharacter(C.MemberNumber);
	    }
	    hasAccessToPlayer(C) {
	        var _a;
	        return ServerChatRoomGetAllowItem(C, Player) && ((_a = Player.LSCG) === null || _a === void 0 ? void 0 : _a.GlobalModule.enabled);
	    }
	    playerHasAccessToCharacter(C) {
	        var _a;
	        return !!C && !C.IsPlayer() && ServerChatRoomGetAllowItem(Player, C) && ((_a = C.LSCG) === null || _a === void 0 ? void 0 : _a.GlobalModule.enabled);
	    }
	    get playerIsRestrained() {
	        return Player.IsRestrained();
	    }
	    characterHasMod(C) {
	        return !!C.LSCG;
	    }
	    load() {
	        hookFunction("InformationSheetRun", 11, (args, next) => {
	            var _a;
	            if ((_a = window.bcx) === null || _a === void 0 ? void 0 : _a.inBcxSubscreen())
	                return next(args);
	            if (this._currentSubscreen) {
	                window.LSCG_REMOTE_WINDOW_OPEN = true;
	                MainCanvas.textAlign = "left";
	                this._currentSubscreen.Run();
	                MainCanvas.textAlign = "center";
	                return;
	            }
	            window.LSCG_REMOTE_WINDOW_OPEN = false;
	            next(args);
	            const C = this.getInformationSheetCharacter();
	            if (!!C && this.characterHasMod(C) && !C.IsPlayer()) {
	                const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C);
	                DrawButton(90, 60, 60, 60, "", (playerHasAccessToCharacter && !this.playerIsRestrained) ? "White" : "#ddd", "", playerHasAccessToCharacter ? (this.playerIsRestrained ? "Cannot access while restrained" : "LSCG Remote Settings") : "Needs BC item permission", !playerHasAccessToCharacter || this.playerIsRestrained);
	                DrawImageResize(ICONS.REMOTE, 95, 65, 50, 50);
	            }
	        }, ModuleCategory.RemoteUI);
	        hookFunction("InformationSheetClick", 10, (args, next) => {
	            if (this._currentSubscreen) {
	                return this._currentSubscreen.Click();
	            }
	            const C = this.getInformationSheetCharacter();
	            const playerHasAccessToCharacter = this.playerHasAccessToCharacter(C);
	            if (MouseIn(90, 60, 60, 60) && playerHasAccessToCharacter && !this.playerIsRestrained) {
	                this.currentSubscreen = new RemoteMainMenu(this, C);
	            }
	            else {
	                return next(args);
	            }
	        }, ModuleCategory.RemoteUI);
	        hookFunction("InformationSheetExit", 10, (args, next) => {
	            if (this._currentSubscreen) {
	                return this._currentSubscreen.Exit();
	            }
	            return next(args);
	        }, ModuleCategory.RemoteUI);
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.RemoteUI);
	    }
	}

	// Remote UI Module to handle configuration on other characters
	// Can be used to "program" another character's hypnosis, collar, etc.
	// Framework inspired from BCX
	class CommandModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.lscgCommands = [
	            {
	                Tag: "help",
	                Description: ": Opens the help for LSCG commands",
	                Action: (args, msg, parsed) => {
	                    let helpLines = [];
	                    this.orderedCommands.forEach(c => {
	                        helpLines.push(`<br><b>/lscg ${c.Tag}</b> ${c.Description}`);
	                    });
	                    let helpText = `<b>- Little Sera's Club Games -</b>${helpLines.join()}<br>More to come...`;
	                    LSCG_SendLocal(helpText);
	                },
	            }, {
	                Tag: 'zonk',
	                Description: ": Hypnotize yourself",
	                Action: () => {
	                    if (!this.hypno.Enabled)
	                        return;
	                    if (this.hypno.settings.immersive) {
	                        LSCG_SendLocal("/zonk disabled while immersive", 5000);
	                        return;
	                    }
	                    if (!this.hypno.hypnoActivated)
	                        this.hypno.StartTriggerWord(true, Player.MemberNumber);
	                }
	            }, {
	                Tag: 'unzonk',
	                Description: ": Awaken yourself",
	                Action: () => {
	                    if (!this.hypno.Enabled)
	                        return;
	                    if (this.hypno.hypnoActivated && this.hypno.settings.immersive) {
	                        LSCG_SendLocal("/unzonk disabled while immersive", 5000);
	                        return;
	                    }
	                    if (this.hypno.hypnoActivated)
	                        this.hypno.TriggerRestoreTimeout();
	                }
	            }, {
	                Tag: "show-triggers",
	                Description: ": Reveal your current trigger word(s) to yourself",
	                Action: () => {
	                    let hypnoTriggers = this.hypno.triggers;
	                    let awakenerTriggers = this.hypno.awakeners;
	                    let tightenTrigger = GetDelimitedList(this.collar.settings.tightTrigger);
	                    let loosenTrigger = GetDelimitedList(this.collar.settings.looseTrigger);
	                    let hypnoStr = !this.hypno.Enabled ? "<i>Hypnosis not enabled.</i>" : (this.hypno.settings.immersive ? "<i>Hypnosis triggers hidden while immersive...</i>" : `<b>Hypnosis:</b> ${hypnoTriggers}<br><b>Awakeners:</b> ${awakenerTriggers}`);
	                    let collarStr = !this.collar.settings.enabled ? "<i>Breathplay Collar not enabled.</i>" : (this.collar.settings.immersive ? "<i>Collar triggers hidden while immersive...</i>" : `<b>Collar Tighten:</b> ${tightenTrigger}<br><b>Collar Loosen:</b> ${loosenTrigger}`);
	                    LSCG_SendLocal(`Your current triggers are: <br>${hypnoStr}<br>${collarStr}`);
	                }
	            }, {
	                Tag: "cycle-trigger",
	                Description: ": Force a cycle to a new trigger word if enabled",
	                Action: () => {
	                    if (this.hypno.settings.immersive) {
	                        LSCG_SendLocal("/cycle-trigger disabled while immersive", 5000);
	                        return;
	                    }
	                    if (this.hypno.settings.enableCycle)
	                        this.hypno.RollTriggerWord();
	                }
	            }, {
	                Tag: "roll",
	                Description: ": Make an unopposed activity roll and display the results.",
	                Action: (args, msg, parsed) => {
	                    var _a;
	                    let roll = (_a = getModule("ItemUseModule")) === null || _a === void 0 ? void 0 : _a.UnopposedActivityRoll(Player);
	                    SendAction(`${CharacterNickname(Player)} makes an activity roll and gets: ${roll.Total} ${roll.TotalStr}`);
	                }
	            }, {
	                Tag: "roll-attack",
	                Description: "[defender] : Make a contested activity roll against another user where you are the attacker.",
	                Action: (args, msg, parsed) => {
	                    var _a;
	                    if (!args) {
	                        LSCG_SendLocal("Please specify a defender for your roll.", 10000);
	                        return;
	                    }
	                    let tgt = this.getCharacterByNicknameOrMemberNumber(args);
	                    if (!tgt) {
	                        LSCG_SendLocal(`Defender ${args} not found.`, 10000);
	                        return;
	                    }
	                    let check = (_a = getModule("ItemUseModule")) === null || _a === void 0 ? void 0 : _a.MakeActivityCheck(Player, tgt);
	                    SendAction(`${CharacterNickname(Player)} makes an activity check attack against ${CharacterNickname(tgt)}!`);
	                    SendAction(`${CharacterNickname(Player)}: ${check.AttackerRoll.Total} ${check.AttackerRoll.TotalStr}-- ${CharacterNickname(tgt)}: ${check.DefenderRoll.Total} ${check.DefenderRoll.TotalStr}`);
	                }
	            }, {
	                Tag: "roll-defend",
	                Description: "[attacker] : Make a contested activity roll where you are defending against another user.",
	                Action: (args, msg, parsed) => {
	                    var _a;
	                    if (!args) {
	                        LSCG_SendLocal("Please specify an attacker for your roll.", 10000);
	                        return;
	                    }
	                    let tgt = this.getCharacterByNicknameOrMemberNumber(args);
	                    if (!tgt) {
	                        LSCG_SendLocal(`Attacker ${args} not found.`, 10000);
	                        return;
	                    }
	                    let check = (_a = getModule("ItemUseModule")) === null || _a === void 0 ? void 0 : _a.MakeActivityCheck(tgt, Player);
	                    SendAction(`${CharacterNickname(Player)} makes an activity check defending from ${CharacterNickname(tgt)}!`);
	                    SendAction(`${CharacterNickname(Player)}: ${check.DefenderRoll.Total} ${check.DefenderRoll.TotalStr}-- ${CharacterNickname(tgt)}: ${check.AttackerRoll.Total} ${check.AttackerRoll.TotalStr}`);
	                }
	            }, {
	                Tag: "escape",
	                Description: " : If you are arm-grabbed or ear-pinched, will attempt to escape from their grip.",
	                Action: (args, msg, parsed) => {
	                    var module = getModule("ActivityModule");
	                    if (!module)
	                        return;
	                    module.TryEscape();
	                }
	            }, {
	                Tag: "emergency",
	                Description: " : Use in case of emergency to revert all LSCG settings to their default values.",
	                Action: (args, msg, parsed) => {
	                    this.EmergencyRelease();
	                }
	            }, {
	                Tag: "collar",
	                Description: " [tight/loose/stat] : Use to self-tighten, self-loosen, or read out information about your collar if allowed. Must be unrestrained to use.",
	                Action: (args, msg, parsed) => {
	                    if (!this.collar.settings.collarPurchased) {
	                        LSCG_SendLocal(`Collar module not purchased.`);
	                        return;
	                    }
	                    if (!this.collar.wearingCorrectCollar) {
	                        LSCG_SendLocal(`You are not wearing a properly configured collar.`);
	                        return;
	                    }
	                    if (!this.collar.Enabled)
	                        return;
	                    if (parsed.length == 1) {
	                        switch (parsed[0].toLocaleLowerCase()) {
	                            case "tight":
	                            case "tighten":
	                                this.collar.TightenButtonPress(Player);
	                                break;
	                            case "loose":
	                            case "loosen":
	                                this.collar.LoosenButtonPress(Player);
	                                break;
	                            case "stat":
	                            case "stats":
	                                this.collar.StatsButtonPress(Player);
	                                break;
	                        }
	                    }
	                    else if (parsed.length == 0) {
	                        LSCG_SendLocal(`<b>/lscg collar</b> [tight/loose/stat] : Use to self-tighten, self-loosen, or read out information about your collar if allowed. Must be unrestrained to use."`);
	                    }
	                }
	            }
	        ];
	    }
	    get hypno() { return getModule("HypnoModule"); }
	    get collar() { return getModule("CollarModule"); }
	    get orderedCommands() {
	        var helpCommand = this.getSubcommand("help");
	        var sorted = this.lscgCommands.filter(c => c.Tag != "help").sort((a, b) => a.Tag.localeCompare(b.Tag));
	        return [helpCommand, ...sorted];
	    }
	    get subCommands() {
	        return this.orderedCommands.map(c => c.Tag);
	    }
	    getSubcommand(name) {
	        return this.lscgCommands.find(c => c.Tag.toLocaleLowerCase() == name.toLocaleLowerCase());
	    }
	    getCharacterByNicknameOrMemberNumber(tgt) {
	        tgt = tgt.toLocaleLowerCase();
	        let tgtC;
	        if (CommonIsNumeric(tgt))
	            tgtC = getCharacter(+tgt);
	        if (!tgtC) {
	            tgtC = ChatRoomCharacter.find(c => CharacterNickname(c).toLocaleLowerCase() == tgt);
	        }
	        return tgtC;
	    }
	    load() {
	        CommandCombine([
	            {
	                Tag: 'lscg',
	                Description: "or <b>/lscg help</b> : Opens the help for LSCG commands",
	                AutoComplete(parsed, low, msg) {
	                },
	                Action: (args, msg, parsed) => {
	                    if (parsed.length <= 0) {
	                        this.getSubcommand("help").Action("", msg, []);
	                    }
	                    else {
	                        var command = this.getSubcommand(parsed[0]);
	                        var subArgs = parsed.slice(1);
	                        command === null || command === void 0 ? void 0 : command.Action(subArgs.join(" "), msg, subArgs);
	                    }
	                }
	            }
	        ]);
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Commands);
	    }
	    EmergencyRelease() {
	        // Run Safeword action on all modules
	        for (const m of modules()) {
	            m.safeword();
	            if (!!m.settingsStorage)
	                Player.LSCG[m.settingsStorage] = m.defaultSettings;
	        }
	        settingsSave(true);
	    }
	}

	class ActivityRoll {
	    constructor(raw, mod) {
	        this.Raw = 0;
	        this.Modifier = 0;
	        this.Raw = raw;
	        this.Modifier = mod;
	    }
	    get Total() { return Math.max(0, this.Raw + this.Modifier); }
	    get TotalStr() {
	        var _a, _b;
	        if (!((_b = (_a = Player.LSCG) === null || _a === void 0 ? void 0 : _a.GlobalModule) === null || _b === void 0 ? void 0 : _b.showCheckRolls))
	            return "";
	        return `[${this.Raw + (this.Modifier < 0 ? "" : "+") + this.Modifier}] `;
	    }
	}
	// Remote UI Module to handle configuration on other characters
	// Can be used to "program" another character's hypnosis, collar, etc.
	// Framework inspired from BCX
	class ItemUseModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.failedStealTime = 0;
	        this.GagTargets = [
	            {
	                MouthItemName: "BallGag",
	                HandItemName: "Ballgag",
	                NeckItemName: "NecklaceBallGag",
	                PreferredTypes: [{ Location: "ItemMouth", Type: "Tight" }]
	            }, {
	                MouthItemName: "PantyStuffing",
	                HandItemName: "Panties"
	            }, {
	                MouthItemName: "LargeDildo",
	                HandItemName: "LargeDildo"
	            }, {
	                MouthItemName: "CaneGag",
	                HandItemName: "Cane"
	            }, {
	                MouthItemName: "CropGag",
	                HandItemName: "Crop"
	            }, {
	                MouthItemName: "SockStuffing",
	                HandItemName: "LongSock"
	            }, {
	                MouthItemName: "ClothStuffing",
	                HandItemName: "Towel",
	                UsedAssetOverride: "towel"
	            }, {
	                MouthItemName: "RopeBallGag",
	                HandItemName: "RopeCoilLong",
	                NeckItemName: "NecklaceRope",
	                //LeaveHandItem: true,
	                PreferredTypes: [
	                    { Location: "ItemMouth", Type: "Tight" },
	                    { Location: "Necklace", Type: "Long" }
	                ]
	            }, {
	                MouthItemName: "RopeGag",
	                HandItemName: "RopeCoilShort",
	                NeckItemName: "NecklaceRope",
	                //LeaveHandItem: true
	            }, {
	                MouthItemName: "DuctTape",
	                HandItemName: "TapeRoll",
	                LeaveHandItem: true,
	                PreferredTypes: [
	                    { Location: "ItemMouth", Type: "Crossed" },
	                    { Location: "ItemMouth2", Type: "Double" },
	                    { Location: "ItemMouth3", Type: "Cover" }
	                ]
	            }, {
	                MouthItemName: "ScarfGag",
	                NeckItemName: "Bandana",
	                PreferredTypes: [{ Location: "ItemMouth", Type: "OTN" }],
	                UsedAssetOverride: "bandana"
	            }, {
	                MouthItemName: "ClothGag",
	                NeckItemName: "Scarf",
	                OverrideNeckLocation: "ClothAccessory",
	                PreferredTypes: [{ Location: "ItemMouth", Type: "OTM" }]
	            }, {
	                MouthItemName: "FurScarf",
	                NeckItemName: "FurScarf"
	            }
	        ];
	        this.CameraItems = [
	            "Phone1",
	            "Phone2",
	            "PortalTablet",
	            "Camera1",
	        ];
	    }
	    load() {
	        hookFunction("ActivityGenerateItemActivitiesFromNeed", 1, (args, next) => {
	            var _a, _b;
	            let allowed = args[0];
	            let acting = args[1];
	            let acted = args[2];
	            let needsItem = args[3];
	            let activity = args[4];
	            let ret = false;
	            var focusGroup = (_b = (_a = acted === null || acted === void 0 ? void 0 : acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : undefined;
	            let res;
	            if (["GagGiveItem", "GagTakeItem", "GagToNecklace", "NecklaceToGag"].indexOf(needsItem) > -1) {
	                res = this.ManualGenerateItemActivitiesForNecklaceActivity(allowed, acting, acted, needsItem, activity);
	            }
	            else {
	                res = next(args);
	            }
	            return res;
	        }, ModuleCategory.ItemUse);
	        hookFunction("CharacterItemsForActivity", 1, (args, next) => {
	            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
	            let C = args[0];
	            let itemType = args[1];
	            let results = next(args);
	            var focusGroup = (_b = (_a = C === null || C === void 0 ? void 0 : C.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : undefined;
	            let gagTargets = this.GagTargets.filter(t => !!t.MouthItemName).map(t => t.MouthItemName);
	            let neckTargets = this.GagTargets.filter(t => !!t.NeckItemName).map(t => t.NeckItemName);
	            let handTargets = this.GagTargets.filter(t => !!t.HandItemName).map(t => t.HandItemName);
	            if (itemType == "AnyItem") {
	                let item = InventoryGet(C, "ItemHandheld");
	                if (!!item)
	                    results.push(item);
	            }
	            else if (itemType == "GagTakeItem") {
	                let item = InventoryGet(C, focusGroup);
	                if (focusGroup == "ItemNeck") {
	                    focusGroup = "Necklace";
	                    item = InventoryGet(C, focusGroup);
	                    if (!item || neckTargets.indexOf((_c = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _c !== void 0 ? _c : "") == -1) {
	                        focusGroup = "ClothAccessory";
	                        item = InventoryGet(C, focusGroup);
	                    }
	                    if (neckTargets.indexOf((_d = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _d !== void 0 ? _d : "") > -1)
	                        results.push(item);
	                }
	                else {
	                    if (gagTargets.indexOf((_e = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _e !== void 0 ? _e : "") > -1)
	                        results.push(item);
	                }
	            }
	            else if (itemType == "GagGiveItem") {
	                let item = InventoryGet(C, "ItemHandheld");
	                if (handTargets.indexOf((_f = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _f !== void 0 ? _f : "") > -1)
	                    results.push(item);
	            }
	            else if (itemType == "GagToNecklace") {
	                let item = InventoryGet(C, focusGroup);
	                if (gagTargets.indexOf((_g = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _g !== void 0 ? _g : "") > -1)
	                    results.push(item);
	            }
	            else if (itemType == "NecklaceToGag") {
	                let item = InventoryGet(C, "Necklace");
	                let altItem = InventoryGet(C, "ClothAccessory");
	                if (neckTargets.indexOf((_h = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _h !== void 0 ? _h : "") > -1)
	                    results.push(item);
	                if (neckTargets.indexOf((_j = altItem === null || altItem === void 0 ? void 0 : altItem.Asset.Name) !== null && _j !== void 0 ? _j : "") > -1)
	                    results.push(altItem);
	            }
	            else if (itemType == "RopeCoil") {
	                let item = InventoryGet(C, "ItemHandheld");
	                if (!!item && item.Asset.Name.startsWith("RopeCoil"))
	                    results.push(item);
	            }
	            else if (itemType == "PlushItem") {
	                let teddy = InventoryGet(C, "ItemMisc");
	                let shark = InventoryGet(C, "ItemHandheld");
	                if (!!teddy && teddy.Asset.Name == "TeddyBear")
	                    results.push(teddy);
	                if (!!shark && shark.Asset.Name == "Shark")
	                    results.push(shark);
	            }
	            else if (itemType == "CameraItem") {
	                let item = InventoryGet(C, "ItemHandheld");
	                let acc = InventoryGet(C, "ClothAccessory");
	                if (!!item && this.CameraItems.indexOf((_k = item.Asset) === null || _k === void 0 ? void 0 : _k.Name) > -1)
	                    results.push(item);
	                else if (!!acc && this.CameraItems.indexOf((_l = acc.Asset) === null || _l === void 0 ? void 0 : _l.Name) > -1)
	                    results.push(acc);
	            }
	            return results;
	        }, ModuleCategory.ItemUse);
	    }
	    run() {
	        this.activities = getModule("ActivityModule");
	        // Put gag on mouth or neck
	        this.activities.AddActivity({
	            Activity: {
	                Name: "UseGag",
	                MaxProgress: 50,
	                MaxProgressSelf: 80,
	                Prerequisite: ["ZoneAccessible", "ZoneNaked", "UseHands", "Needs-GagGiveItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    TargetLabel: "Gag Mouth",
	                    TargetAction: "SourceCharacter gags TargetCharacter with PronounPossessive ActivityAsset.",
	                    TargetSelfAction: "SourceCharacter gags themselves with their own ActivityAsset.",
	                    SelfAllowed: true
	                }, {
	                    Name: "ItemNeck",
	                    TargetLabel: "Place around Neck",
	                    TargetAction: "SourceCharacter places PronounPossessive ActivityAsset around TargetCharacter's neck.",
	                    TargetSelfAction: "SourceCharacter places PronounPossessive ActivityAsset around PronounPossessive own neck.",
	                    SelfAllowed: true
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "HoldingGag",
	                    Func: (acting, acted, group) => {
	                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
	                        var location = (_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                        let heldItemName = (_c = (_b = InventoryGet(acting, "ItemHandheld")) === null || _b === void 0 ? void 0 : _b.Asset.Name) !== null && _c !== void 0 ? _c : "";
	                        let gagTarget = this.GagTargets.find(t => t.HandItemName == heldItemName);
	                        if (!gagTarget)
	                            return false;
	                        if (group.Name == "ItemMouth") {
	                            var existing = InventoryGet(acted, location);
	                            if (!!existing)
	                                return false;
	                            let mouthItemName = (_d = gagTarget.MouthItemName) !== null && _d !== void 0 ? _d : "";
	                            let assetGroup = AssetFemale3DCG.find(a => a.Group == location);
	                            let allowedAssetNames = assetGroup === null || assetGroup === void 0 ? void 0 : assetGroup.Asset.map(a => { var _a; return (_a = a === null || a === void 0 ? void 0 : a.Name) !== null && _a !== void 0 ? _a : a; });
	                            let targetMouthAssetAllowed = ((_e = allowedAssetNames === null || allowedAssetNames === void 0 ? void 0 : allowedAssetNames.indexOf(mouthItemName)) !== null && _e !== void 0 ? _e : -1) > -1;
	                            var itemAlreadyInMouth = ((_f = InventoryGet(acted, "ItemMouth")) === null || _f === void 0 ? void 0 : _f.Asset.Name) == gagTarget.MouthItemName ||
	                                ((_g = InventoryGet(acted, "ItemMouth2")) === null || _g === void 0 ? void 0 : _g.Asset.Name) == gagTarget.MouthItemName ||
	                                ((_h = InventoryGet(acted, "ItemMouth3")) === null || _h === void 0 ? void 0 : _h.Asset.Name) == gagTarget.MouthItemName;
	                            return targetMouthAssetAllowed && !itemAlreadyInMouth;
	                        }
	                        else if (location == "ItemNeck") {
	                            var existing = InventoryGet(acted, (_j = gagTarget.OverrideNeckLocation) !== null && _j !== void 0 ? _j : "Necklace");
	                            return !existing && !!gagTarget.NeckItemName;
	                        }
	                        return false;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a, _b, _c, _d;
	                    if (!target)
	                        return;
	                    var location = (_a = target.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                    let heldItemName = (_c = (_b = InventoryGet(Player, "ItemHandheld")) === null || _b === void 0 ? void 0 : _b.Asset.Name) !== null && _c !== void 0 ? _c : "";
	                    let gagTarget = this.GagTargets.find(t => t.HandItemName == heldItemName);
	                    if (!!gagTarget) {
	                        if (location == "ItemNeck")
	                            location = (_d = gagTarget.OverrideNeckLocation) !== null && _d !== void 0 ? _d : "Necklace";
	                        this.ApplyGag(target, Player, gagTarget, location);
	                    }
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/ItemHandheld/Preview/Ballgag.png"
	        });
	        // Take Gag
	        this.activities.AddActivity({
	            Activity: {
	                Name: "TakeGag",
	                MaxProgress: 50,
	                MaxProgressSelf: 80,
	                Reverse: true,
	                Prerequisite: ["UseHands", "Needs-GagTakeItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    TargetLabel: "Take Gag",
	                    TargetAction: "SourceCharacter removes TargetCharacter's ActivityAsset.",
	                    TargetSelfAction: "SourceCharacter pulls the ActivityAsset from PronounPossessive mouth.",
	                    SelfAllowed: true
	                }, {
	                    Name: "ItemNeck",
	                    TargetLabel: "Take Gag",
	                    TargetAction: "SourceCharacter takes TargetCharacter's ActivityAsset from around TargetPronounPossessive neck.",
	                    TargetSelfAction: "SourceCharacter takes PronounPossessive own ActivityAsset from around PronounPossessive neck.",
	                    SelfAllowed: true
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsGagged",
	                    Func: (acted, acting, group) => {
	                        var _a;
	                        let location = (_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                        let item;
	                        let gagTarget;
	                        if (location == "ItemNeck") {
	                            location = "Necklace";
	                            item = InventoryGet(acted, location);
	                            gagTarget = this.GagTargets.find(t => !!item && t.NeckItemName == (item === null || item === void 0 ? void 0 : item.Asset.Name) && !!t.HandItemName);
	                            if (!gagTarget) {
	                                location = "ClothAccessory";
	                                item = InventoryGet(acted, location);
	                                gagTarget = this.GagTargets.find(t => !!item && t.NeckItemName == (item === null || item === void 0 ? void 0 : item.Asset.Name) && !!t.HandItemName);
	                            }
	                        }
	                        else {
	                            if (InventoryGroupIsBlocked(acted, location))
	                                return false;
	                            item = InventoryGet(acted, location);
	                            gagTarget = this.GagTargets.find(t => !!item && t.MouthItemName == (item === null || item === void 0 ? void 0 : item.Asset.Name) && !!t.HandItemName);
	                        }
	                        if (!!item && !!gagTarget) {
	                            if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
	                                return false;
	                            var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber);
	                            if (!item && !ValidationCanRemoveItem(item, validParams, false))
	                                return false;
	                        }
	                        return !InventoryGet(acting, "ItemHandheld") && !!gagTarget;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a, _b, _c, _d, _e, _f, _g;
	                    if (!target)
	                        return;
	                    let location = (_a = target.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                    let itemName;
	                    let gagTarget;
	                    if (location == "ItemNeck") {
	                        location = "Necklace";
	                        itemName = (_c = (_b = InventoryGet(target, location)) === null || _b === void 0 ? void 0 : _b.Asset.Name) !== null && _c !== void 0 ? _c : undefined;
	                        gagTarget = this.GagTargets.find(t => !!itemName && t.NeckItemName == itemName);
	                        if (!gagTarget) {
	                            location = "ClothAccessory";
	                            itemName = (_e = (_d = InventoryGet(target, location)) === null || _d === void 0 ? void 0 : _d.Asset.Name) !== null && _e !== void 0 ? _e : undefined;
	                            gagTarget = this.GagTargets.find(t => !!itemName && t.NeckItemName == itemName);
	                        }
	                    }
	                    else {
	                        itemName = (_g = (_f = InventoryGet(target, location)) === null || _f === void 0 ? void 0 : _f.Asset.Name) !== null && _g !== void 0 ? _g : undefined;
	                        gagTarget = this.GagTargets.find(t => !!itemName && t.MouthItemName == itemName);
	                    }
	                    if (!!gagTarget)
	                        this.TakeGag(target, Player, gagTarget, location);
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
	        });
	        // Gag With Necklace
	        this.activities.AddActivity({
	            Activity: {
	                Name: "NecklaceToGag",
	                MaxProgress: 50,
	                MaxProgressSelf: 80,
	                Prerequisite: ["UseHands", "Needs-NecklaceToGag"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    TargetLabel: "Move to Mouth",
	                    TargetAction: "SourceCharacter moves TargetCharacter's ActivityAsset up to their mouth.",
	                    TargetSelfAction: "SourceCharacter moves their own ActivityAsset up to PronounPossessive mouth.",
	                    SelfAllowed: true
	                },
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsWearingGagNecklace",
	                    Func: (acting, acted, group) => {
	                        var _a, _b, _c;
	                        var location = (_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                        var existing = InventoryGet(acted, location);
	                        if (!!existing)
	                            return false;
	                        let gagTarget = this.GagTargets.find(t => { var _a, _b; return t.NeckItemName == ((_b = (_a = InventoryGet(acted, "Necklace")) === null || _a === void 0 ? void 0 : _a.Asset.Name) !== null && _b !== void 0 ? _b : ""); });
	                        if (!gagTarget)
	                            gagTarget = this.GagTargets.find(t => { var _a, _b; return t.NeckItemName == ((_b = (_a = InventoryGet(acted, "ClothAccessory")) === null || _a === void 0 ? void 0 : _a.Asset.Name) !== null && _b !== void 0 ? _b : "") && t.OverrideNeckLocation == "ClothAccessory"; });
	                        if (!gagTarget)
	                            return false;
	                        let mouthItemName = (_b = gagTarget.MouthItemName) !== null && _b !== void 0 ? _b : "";
	                        let assetGroup = AssetFemale3DCG.find(a => a.Group == location);
	                        let allowedAssetNames = assetGroup === null || assetGroup === void 0 ? void 0 : assetGroup.Asset.map(a => { var _a; return (_a = a === null || a === void 0 ? void 0 : a.Name) !== null && _a !== void 0 ? _a : a; });
	                        let targetMouthAssetAllowed = ((_c = allowedAssetNames === null || allowedAssetNames === void 0 ? void 0 : allowedAssetNames.indexOf(mouthItemName)) !== null && _c !== void 0 ? _c : -1) > -1;
	                        return targetMouthAssetAllowed;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a, _b, _c, _d, _e;
	                    var dict = (_a = args[1]) === null || _a === void 0 ? void 0 : _a.Dictionary;
	                    if (!target || !dict)
	                        return;
	                    var activityAsset = dict.find((x) => x.Tag == "ActivityAsset");
	                    var location = (_b = target.FocusGroup) === null || _b === void 0 ? void 0 : _b.Name;
	                    let heldItemName = (_d = (_c = InventoryGet(target, activityAsset.GroupName)) === null || _c === void 0 ? void 0 : _c.Asset.Name) !== null && _d !== void 0 ? _d : "";
	                    let gagTarget = this.GagTargets.find(t => t.NeckItemName == heldItemName);
	                    //if (!gagTarget) gagTarget = this.GagTargets.find(t => t.NeckItemName == (InventoryGet(target, "ClothAccessory")?.Asset.Name ?? "") && t.OverrideNeckLocation == "ClothAccessory");
	                    if (!!gagTarget) {
	                        this.ApplyGag(target, target, gagTarget, location, (_e = gagTarget.OverrideNeckLocation) !== null && _e !== void 0 ? _e : "Necklace");
	                    }
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/Necklace/Preview/NecklaceBallGag.png"
	        });
	        // Move Gag to Necklace
	        this.activities.AddActivity({
	            Activity: {
	                Name: "GagToNecklace",
	                MaxProgress: 50,
	                MaxProgressSelf: 80,
	                Prerequisite: ["UseHands", "Needs-GagToNecklace"]
	            },
	            Targets: [
	                {
	                    Name: "ItemMouth",
	                    TargetLabel: "Wear around Neck",
	                    TargetAction: "SourceCharacter removes TargetCharacter's ActivityAsset, letting it hang around their neck.",
	                    TargetSelfAction: "SourceCharacter removes the ActivityAsset from PronounPossessive mouth and lets it hang around PronounPossessive neck.",
	                    SelfAllowed: true
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "TargetIsGaggedWithNecklace",
	                    Func: (acting, acted, group) => {
	                        var _a, _b, _c;
	                        var location = (_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                        var item = InventoryGet(acted, location);
	                        if (InventoryGroupIsBlocked(acted, location))
	                            return false;
	                        if (!!item) {
	                            if (!!item.Property && item.Property.Effect && item.Property.Effect.indexOf("Lock") > -1)
	                                return false;
	                            var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber);
	                            if (!item && !ValidationCanRemoveItem(item, validParams, false))
	                                return false;
	                        }
	                        var gagTarget = this.GagTargets.find(t => t.MouthItemName == (item === null || item === void 0 ? void 0 : item.Asset.Name) && !!t.NeckItemName);
	                        return !!gagTarget &&
	                            !InventoryGet(acted, (_b = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.OverrideNeckLocation) !== null && _b !== void 0 ? _b : "Necklace") &&
	                            this.GagTargets.map(t => t.MouthItemName).indexOf((_c = item === null || item === void 0 ? void 0 : item.Asset.Name) !== null && _c !== void 0 ? _c : "") > -1;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a, _b, _c, _d;
	                    if (!target)
	                        return;
	                    var location = (_a = target.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                    let mouthItemName = (_c = (_b = InventoryGet(target, location)) === null || _b === void 0 ? void 0 : _b.Asset.Name) !== null && _c !== void 0 ? _c : "";
	                    let gagTarget = this.GagTargets.find(t => t.MouthItemName == mouthItemName);
	                    if (!!gagTarget)
	                        this.TakeGag(target, target, gagTarget, location, (_d = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.OverrideNeckLocation) !== null && _d !== void 0 ? _d : "Necklace");
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/ItemMouth/Preview/BallGag.png"
	        });
	        // Tie Up
	        this.activities.AddActivity({
	            Activity: {
	                Name: "TieUp",
	                MaxProgress: 50,
	                MaxProgressSelf: 80,
	                Prerequisite: ["UseHands", "ZoneAccessible", "Needs-RopeCoil"]
	            },
	            Targets: this.GetHempRopeLocations().map(loc => ({
	                Name: loc.Location,
	                TargetLabel: "Tie Up",
	                TargetAction: `SourceCharacter swiftly wraps PronounPossessive rope around TargetCharacter's ${loc.LocationLabel}, binding TargetPronounPossessive tightly.`,
	                TargetSelfAction: `SourceCharacter wraps PronounPossessive rope around PronounPossessive ${loc.LocationLabel} tightly.`,
	                SelfAllowed: true
	            })),
	            CustomPrereqs: [
	                {
	                    Name: "HasCoiledRope",
	                    Func: (acting, acted, group) => {
	                        var _a, _b;
	                        var location = (_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                        if (!location)
	                            return false;
	                        var ropeTarget = this.GetHempRopeLocations().find(t => t.Location == location);
	                        var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber);
	                        var blocked = (location.startsWith("ItemTorso") || location == "ItemPelvis") ? !InventoryDoItemsExposeGroup(acted, "ItemTorso", ["Cloth"]) : false;
	                        return !blocked &&
	                            ((_b = InventoryGet(acting, "ItemHandheld")) === null || _b === void 0 ? void 0 : _b.Asset.Name.startsWith("RopeCoil")) &&
	                            !InventoryGet(acted, location);
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    var _a;
	                    if (!target)
	                        return;
	                    var location = (_a = target.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name;
	                    let ropeTarget = this.GetHempRopeLocations().find(loc => loc.Location == location);
	                    if (!!ropeTarget)
	                        this.TieUp(target, Player, ropeTarget);
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/ItemArms/Preview/HempRope.png"
	        });
	        // Steal
	        this.activities.AddActivity({
	            Activity: {
	                Name: "Steal",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["Needs-AnyItem"],
	                Reverse: true // acting and acted are flipped!
	            },
	            Targets: [
	                {
	                    Name: "ItemHands",
	                    TargetLabel: "Steal",
	                    TargetAction: "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item.",
	                    SelfAllowed: false
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "CanSteal",
	                    Func: (acted, acting, group) => {
	                        var _a;
	                        if (((_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) != "ItemHandheld" || InventoryGet(acted, "ItemHands") != null)
	                            return false;
	                        var item = InventoryGet(acted, "ItemHandheld");
	                        if (!item)
	                            return false;
	                        var OnCooldown = this.failedStealTime > 0 && (this.failedStealTime + 60000) > CommonTime(); // 1 minute cooldown on steal attempts.
	                        var validParams = ValidationCreateDiffParams(acted, acting.MemberNumber);
	                        var allowed = ValidationCanRemoveItem(item, validParams, false);
	                        return !OnCooldown && allowed && !InventoryGet(acting, "ItemHandheld");
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!target)
	                        return;
	                    this.TrySteal(target, Player, InventoryGet(target, "ItemHandheld"));
	                }
	            },
	            CustomImage: "Icons/Dress.png"
	        });
	        // Give
	        this.activities.AddActivity({
	            Activity: {
	                Name: "Give",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseHands", "ZoneAccessible", "TargetZoneAccessible", "Needs-AnyItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHands",
	                    TargetLabel: "Give Item",
	                    TargetAction: "SourceCharacter grabs at TargetCharacters hands, trying to steal TargetPronounPossessive item!",
	                    SelfAllowed: false
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "CanGive",
	                    Func: (acting, acted, group) => {
	                        var _a;
	                        if (((_a = acted.FocusGroup) === null || _a === void 0 ? void 0 : _a.Name) != "ItemHandheld" || InventoryGet(acted, "ItemHands") != null)
	                            return false;
	                        var emptyTargetHands = !InventoryGet(acted, "ItemHandheld");
	                        var sourceItem = InventoryGet(acting, "ItemHandheld");
	                        return emptyTargetHands && !!sourceItem;
	                    }
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    if (!target)
	                        return;
	                    this.GiveItem(target, Player);
	                }
	            },
	            CustomImage: "Icons/Dress.png"
	        });
	        // Shark Bite
	        this.activities.AddActivity({
	            Activity: {
	                Name: "SharkBite",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseHands", "Needs-AnyItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's arm.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemBoots",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's foot.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemBreast",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's breast.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemButt",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's butt.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemEars",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's ear.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemFeet",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's leg.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemHands",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter on the hand.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemLegs",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter in the thigh.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemNeck",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter on the neck.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemNipples",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset bites TargetCharacter's nipple.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemTorso",
	                    TargetLabel: "Shark Bite",
	                    TargetAction: "SourceCharacter's ActivityAsset chomps on TargetCharacter.",
	                    SelfAllowed: false
	                }, {
	                    Name: "ItemNose",
	                    TargetLabel: "Shark Boop",
	                    TargetAction: "SourceCharacter boops TargetCharacter's nose with PronounPossessive ActivityAsset.",
	                    SelfAllowed: false
	                }
	            ],
	            CustomPrereqs: [
	                {
	                    Name: "HasShark",
	                    Func: (acting, acted, group) => {
	                        var sourceItem = InventoryGet(acting, "ItemHandheld");
	                        return !!sourceItem && sourceItem.Asset.Name == "Shark";
	                    }
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/ItemHandheld/Preview/Shark.png"
	        });
	        // Plush Hug
	        this.activities.AddActivity({
	            Activity: {
	                Name: "PlushHug",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseHands", "Needs-PlushItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemHands",
	                    TargetLabel: "Squeeze",
	                    TargetAction: "SourceCharacter hugs PronounPossessive ActivityAsset tightly.",
	                    SelfAllowed: true,
	                    SelfOnly: true
	                }
	            ],
	            CustomImage: "Assets/Female3DCG/ItemHandheld/Preview/Shark.png"
	        });
	        this.activities.AddActivity({
	            Activity: {
	                Name: "TakePhoto",
	                MaxProgress: 50,
	                MaxProgressSelf: 50,
	                Prerequisite: ["UseHands", "Needs-CameraItem"]
	            },
	            Targets: [
	                {
	                    Name: "ItemArms",
	                    TargetLabel: "Take Photo",
	                    SelfAllowed: true,
	                    TargetAction: "SourceCharacter snaps a photo of TargetCharacter.",
	                    TargetSelfAction: "SourceCharacter takes a selfie."
	                }
	            ],
	            CustomAction: {
	                Func: (target, args, next) => {
	                    this.TakePhoto(target);
	                    return next(args);
	                }
	            },
	            CustomImage: "Assets/Female3DCG/ClothAccessory/Preview/Camera1.png"
	        });
	    }
	    TakePhoto(C) {
	        var _a, _b, _c;
	        if (!C) {
	            return;
	        }
	        CommonPhotoMode = true;
	        let temp = C.FocusGroup;
	        C.FocusGroup = null;
	        ChatRoomDrawBackground((_a = ChatRoomData === null || ChatRoomData === void 0 ? void 0 : ChatRoomData.Background) !== null && _a !== void 0 ? _a : "", 0, 1, 1, false);
	        DrawCharacter(C, 0, 0, 1);
	        // Capture screen as image URL
	        const ImgData = /** @type {HTMLCanvasElement} */ (_b = document === null || document === void 0 ? void 0 : document.getElementById("MainCanvas")) === null || _b === void 0 ? void 0 : _b.getContext('2d').getImageData(0, 0, 500, 1000);
	        let PhotoCanvas = document.createElement('canvas');
	        PhotoCanvas.width = 500;
	        PhotoCanvas.height = 1000;
	        (_c = PhotoCanvas === null || PhotoCanvas === void 0 ? void 0 : PhotoCanvas.getContext('2d')) === null || _c === void 0 ? void 0 : _c.putImageData(ImgData, 0, 0);
	        const PhotoImg = PhotoCanvas.toDataURL("image/png");
	        // Open the image in a new window
	        let newWindow = window.open('about:blank', '_blank');
	        if (newWindow) {
	            newWindow.document.write("<img src='" + PhotoImg + "' alt='from canvas'/>");
	            newWindow.document.title = CharacterNickname(C);
	            newWindow.document.close();
	        }
	        else {
	            console.warn("Popups blocked: Cannot open photo in new tab.");
	        }
	        CommonPhotoMode = false;
	        C.FocusGroup = temp;
	        sendLSCGCommand(C, "photo");
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.ItemUse);
	    }
	    get d20() {
	        return getRandomInt(20) + 1;
	    }
	    getDominance(C) {
	        var _a, _b;
	        return (_b = (_a = C.Reputation.find(r => r.Type == "Dominant")) === null || _a === void 0 ? void 0 : _a.Value) !== null && _b !== void 0 ? _b : 0;
	    }
	    ;
	    getSkill(C, skillName) {
	        var _a, _b;
	        let skill = C.Skill.find(r => r.Type == skillName);
	        return (((_a = skill === null || skill === void 0 ? void 0 : skill.Level) !== null && _a !== void 0 ? _a : 0) * ((_b = skill === null || skill === void 0 ? void 0 : skill.Ratio) !== null && _b !== void 0 ? _b : 1));
	    }
	    getRollMod(C, Opponent, isAggressor = false) {
	        var _a, _b, _c, _d;
	        // Dominant vs Submissive ==> -3 to +3 modifier
	        let dominanceMod = Math.floor(this.getDominance(C) / 33);
	        // +5 if we own our opponent
	        let ownershipMod = (Opponent === null || Opponent === void 0 ? void 0 : Opponent.IsOwnedByMemberNumber(C.MemberNumber)) ? 5 : 0 !== null && 0 !== void 0 ? 0 : 0;
	        // -4 if we're restrained
	        let restrainedMod = C.IsRestrained() ? -4 : 0;
	        // If edged, -0 to -4 based on arousal
	        let edgingMod = C.IsEdged() ? (Math.floor(((_b = (_a = C.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0) / 25) * -1) : 0;
	        // -5 if we're incapacitated, automatic failure if we're also defending
	        let incapacitatedMod = IsIncapacitated(C.IsPlayer() ? C : C) ? (isAggressor ? 5 : 100) * -1 : 0;
	        // -2 for each level of choking
	        let breathMod = (C.IsPlayer() ? getModule("CollarModule").totalChokeLevel : (_d = (_c = C.LSCG) === null || _c === void 0 ? void 0 : _c.CollarModule.chokeLevel) !== null && _d !== void 0 ? _d : 0) * -2;
	        let finalMod = dominanceMod + ownershipMod + restrainedMod + edgingMod + incapacitatedMod + breathMod;
	        console.debug(`${CharacterNickname(C)} is ${isAggressor ? 'rolling against' : 'defending against'} ${!Opponent ? "nobody" : CharacterNickname(Opponent)} [${finalMod}] --
		dominanceMod: ${dominanceMod}
		ownershipMod: ${ownershipMod}
		restrainedMod: ${restrainedMod}
		edgingMod: ${edgingMod}
		incapacitatedMod: ${incapacitatedMod}
		breathMod: ${breathMod}
		`);
	        return finalMod;
	    }
	    UnopposedActivityRoll(C) {
	        return new ActivityRoll(this.d20, this.getRollMod(C));
	    }
	    MakeActivityCheck(attacker, defender) {
	        return {
	            AttackerRoll: new ActivityRoll(this.d20, this.getRollMod(attacker, defender, true)),
	            DefenderRoll: new ActivityRoll(this.d20, this.getRollMod(defender, attacker, false))
	        };
	    }
	    GetHempRopeLocations() {
	        return AssetFemale3DCG.filter(g => g.Asset.some(a => (a === null || a === void 0 ? void 0 : a.Name) == "HempRope")).map(g => ({
	            Location: g.Group,
	            LocationLabel: g.Group.substring(4).toLocaleLowerCase(),
	            ItemName: "HempRope"
	        })).concat([
	            {
	                Location: "ItemHead",
	                LocationLabel: "eyes",
	                ItemName: "RopeBlindfold"
	            }, {
	                Location: "ItemNeck",
	                LocationLabel: "neck",
	                ItemName: "NeckRope"
	            }, {
	                Location: "ItemTorso",
	                LocationLabel: "breasts",
	                ItemName: "HempRopeHarness",
	                Type: "Star"
	            }, {
	                Location: "ItemTorso2",
	                LocationLabel: "waist",
	                ItemName: "HempRopeHarness",
	                Type: "Waist"
	            }, {
	                Location: "ItemBoots",
	                LocationLabel: "toes",
	                ItemName: "ToeTie"
	            }
	        ]);
	    }
	    _handleWeirdColorStuff(itemToMove, gagTarget, sourceLocation, targetLocation) {
	        var color = itemToMove === null || itemToMove === void 0 ? void 0 : itemToMove.Color;
	        // BallGag necklace + mouth gag alternate order...
	        if (!!color && gagTarget.MouthItemName == "BallGag") {
	            if (((sourceLocation === null || sourceLocation === void 0 ? void 0 : sourceLocation.startsWith("ItemMouth")) && targetLocation == "Necklace") ||
	                (sourceLocation == "Necklace" && (targetLocation === null || targetLocation === void 0 ? void 0 : targetLocation.startsWith("ItemMouth"))))
	                color = color.reverse();
	            else if (sourceLocation == "ItemHandheld")
	                color = [color[0], color[0]];
	        }
	        return color;
	    }
	    ApplyGag(target, source, gagTarget, targetLocation, sourceLocation = "ItemHandheld") {
	        var _a, _b, _c;
	        var gagItem = InventoryGet(source, sourceLocation);
	        let sourceItemName = (_a = (sourceLocation == "ItemHandheld" ? gagTarget.HandItemName : gagTarget.NeckItemName)) !== null && _a !== void 0 ? _a : "";
	        let targetItemName = (_b = ((targetLocation === null || targetLocation === void 0 ? void 0 : targetLocation.startsWith("ItemMouth")) ? gagTarget.MouthItemName : gagTarget.NeckItemName)) !== null && _b !== void 0 ? _b : "";
	        if (!!gagItem && gagItem.Asset.Name == sourceItemName) {
	            if (!(gagTarget.LeaveHandItem && sourceLocation == "ItemHandheld"))
	                InventoryRemove(source, sourceLocation, true);
	            var color = this._handleWeirdColorStuff(gagItem, gagTarget, sourceLocation, targetLocation);
	            var gag = InventoryWear(target, targetItemName, targetLocation, color, undefined, source.MemberNumber, gagItem === null || gagItem === void 0 ? void 0 : gagItem.Craft, true);
	            if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
	                var prefType = (_c = gagTarget.PreferredTypes.find(tgt => tgt.Location == targetLocation)) !== null && _c !== void 0 ? _c : gagTarget.PreferredTypes.find(tgt => targetLocation.startsWith(tgt.Location));
	                if (!!gag && !!prefType) {
	                    if (!gag.Property)
	                        gag.Property = {};
	                    gag.Property.Type = prefType.Type;
	                }
	            }
	            setTimeout(() => ChatRoomCharacterUpdate(target));
	        }
	    }
	    TakeGag(target, source, gagTarget, sourceLocation, targetLocation = "ItemHandheld") {
	        var _a, _b, _c;
	        var gag = InventoryGet(target, sourceLocation);
	        var existing = InventoryGet(source, targetLocation);
	        let sourceItemName = (_a = (sourceLocation.startsWith("ItemMouth") ? gagTarget.MouthItemName : gagTarget.NeckItemName)) !== null && _a !== void 0 ? _a : "";
	        let targetItemName = (_b = (targetLocation == "ItemHandheld" ? gagTarget.HandItemName : gagTarget.NeckItemName)) !== null && _b !== void 0 ? _b : "";
	        if (!gag || !!existing || gag.Asset.Name != sourceItemName)
	            return;
	        var validParams = ValidationCreateDiffParams(target, source.MemberNumber);
	        if (ValidationCanRemoveItem(gag, validParams, false)) {
	            InventoryRemove(target, sourceLocation, true);
	            var craft = gag.Craft;
	            if (!!craft) {
	                craft.Lock = "";
	                if (craft.Property == "Large" || craft.Property == "Small") {
	                    craft.Property = "Normal";
	                }
	            }
	            var color = this._handleWeirdColorStuff(gag, gagTarget, sourceLocation, targetLocation);
	            let item = InventoryWear(source, targetItemName, targetLocation, color, undefined, source.MemberNumber, craft, true);
	            if (!!gagTarget.PreferredTypes && gagTarget.PreferredTypes.length > 0) {
	                var prefType = (_c = gagTarget.PreferredTypes.find(tgt => tgt.Location == targetLocation)) !== null && _c !== void 0 ? _c : gagTarget.PreferredTypes.find(tgt => targetLocation.startsWith(tgt.Location));
	                if (!!item && !!prefType) {
	                    if (!item.Property)
	                        item.Property = {};
	                    item.Property.Type = prefType.Type;
	                }
	            }
	            setTimeout(() => ChatRoomCharacterUpdate(target));
	        }
	    }
	    TieUp(target, source, rope) {
	        var handRope = InventoryGet(source, "ItemHandheld");
	        if (handRope === null || handRope === void 0 ? void 0 : handRope.Asset.Name.startsWith("RopeCoil")) {
	            var ropeTie = InventoryWear(target, rope.ItemName, rope.Location, handRope === null || handRope === void 0 ? void 0 : handRope.Color, undefined, source.MemberNumber, handRope === null || handRope === void 0 ? void 0 : handRope.Craft, true);
	            if (!!rope.Type)
	                ropeTie.Property.Type = rope.Type;
	            setTimeout(() => ChatRoomCharacterUpdate(target));
	        }
	    }
	    getItemName(item) {
	        var _a, _b;
	        return (_b = (_a = item.Craft) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : item.Asset.Description.toLocaleLowerCase();
	    }
	    GiveItem(target, source) {
	        var item = InventoryGet(source, "ItemHandheld");
	        if (!item)
	            return;
	        SendAction(`${CharacterNickname(source)} gives %POSSESSIVE% ${this.getItemName(item)} to ${CharacterNickname(target)}.`);
	        InventoryRemove(source, "ItemHandheld", false);
	        let newItem = InventoryWear(target, item === null || item === void 0 ? void 0 : item.Asset.Name, "ItemHandheld", item === null || item === void 0 ? void 0 : item.Color, item === null || item === void 0 ? void 0 : item.Difficulty, source.MemberNumber, item === null || item === void 0 ? void 0 : item.Craft, false);
	        if (!!newItem)
	            newItem.Property = item.Property;
	        setTimeout(() => ChatRoomCharacterUpdate(source));
	        setTimeout(() => ChatRoomCharacterUpdate(target));
	    }
	    TrySteal(target, source, item) {
	        SendAction(`${CharacterNickname(source)} grabs at ${CharacterNickname(target)}'s ${this.getItemName(item)}, trying to steal it!`);
	        setTimeout(() => this.Steal_Roll(target, source, item), 5000);
	    }
	    Steal_Roll(target, source, item) {
	        let check = this.MakeActivityCheck(source, target);
	        if (check.AttackerRoll.Total >= check.DefenderRoll.Total) {
	            SendAction(`${CharacterNickname(source)} ${check.AttackerRoll.TotalStr}manages to wrest ${CharacterNickname(target)}'s ${check.DefenderRoll.TotalStr}${this.getItemName(item)} out of their grasp!`);
	            InventoryRemove(target, "ItemHandheld", false);
	            let newItem = InventoryWear(source, item.Asset.Name, "ItemHandheld", item.Color, item.Difficulty, source.MemberNumber, item.Craft, false);
	            if (!!newItem)
	                newItem.Property = item.Property;
	            setTimeout(() => ChatRoomCharacterUpdate(source));
	            setTimeout(() => ChatRoomCharacterUpdate(target));
	        }
	        else {
	            SendAction(`${CharacterNickname(source)} ${check.AttackerRoll.TotalStr}fails to steal ${CharacterNickname(target)}'s ${check.DefenderRoll.TotalStr}${this.getItemName(item)} and is dazed from the attempt!`);
	            this.failedStealTime = CommonTime();
	        }
	    }
	    ManualGenerateItemActivitiesForNecklaceActivity(allowed, acting, acted, needsItem, activity) {
	        var _a, _b, _c;
	        const itemOwner = needsItem == "GagGiveItem" ? acting : acted;
	        const items = CharacterItemsForActivity(itemOwner, needsItem);
	        if (items.length === 0)
	            return true;
	        let handled = false;
	        for (const item of items) {
	            /** @type {null[] | string[]} */
	            let types;
	            if (!item.Property) {
	                types = [null];
	            }
	            else if (item.Asset.Archetype === ExtendedArchetype.MODULAR) {
	                types = ModularItemDeconstructType((_a = item.Property.Type) !== null && _a !== void 0 ? _a : "") || [null];
	            }
	            else {
	                types = [item.Property.Type];
	            }
	            let blocked = null;
	            let focusGroup = (_b = acted.FocusGroup) === null || _b === void 0 ? void 0 : _b.Name;
	            let itemName = item.Asset.Name;
	            let gagTarget = this.GagTargets.find(t => [t.MouthItemName, t.HandItemName, t.NeckItemName].indexOf(itemName) > -1);
	            let targetItemName = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.MouthItemName;
	            if (focusGroup == "ItemNeck" || needsItem == "GagToNecklace")
	                targetItemName = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.NeckItemName;
	            else if (needsItem == "GagTakeItem")
	                targetItemName = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.HandItemName;
	            let targetAssetGroup = "ItemMouth";
	            if (focusGroup == "ItemNeck" || needsItem == "GagToNecklace")
	                targetAssetGroup = (_c = gagTarget === null || gagTarget === void 0 ? void 0 : gagTarget.OverrideNeckLocation) !== null && _c !== void 0 ? _c : "Necklace";
	            else if (needsItem == "GagTakeItem")
	                targetAssetGroup = "ItemHandheld";
	            let targetItem = { Asset: AssetGet("Female3DCG", targetAssetGroup, targetItemName !== null && targetItemName !== void 0 ? targetItemName : "") };
	            let targetOwner = needsItem == "GagTakeItem" ? acting : acted;
	            if (targetItem.Asset != null) {
	                if (types.some((type) => InventoryIsAllowedLimited(targetOwner, targetItem, type !== null && type !== void 0 ? type : ""))) {
	                    blocked = "limited";
	                }
	                else if (types.some((type) => InventoryBlockedOrLimited(targetOwner, targetItem, type))) {
	                    blocked = "blocked";
	                }
	                else if (InventoryGroupIsBlocked(targetOwner, /** @type {AssetGroupItemName} */ (targetItem.Asset.Group.Name))) {
	                    blocked = "unavail";
	                }
	            }
	            else {
	                blocked = "unavail";
	            }
	            if (!!blocked) {
	                allowed.push({ Activity: activity, Item: item, Blocked: blocked });
	            }
	            else
	                allowed.push({ Activity: activity, Item: item });
	            handled = true;
	        }
	        return handled;
	    }
	}

	function initWait() {
	    console.debug("LSCG: Init wait");
	    if (CurrentScreen == null || CurrentScreen === "Login") {
	        hookFunction("LoginResponse", 0, (args, next) => {
	            console.debug("LSCG: Init LoginResponse caught", args);
	            next(args);
	            const response = args[0];
	            if (isObject(response) && typeof response.Name === "string" && typeof response.AccountName === "string") {
	                loginInit(args[0]);
	            }
	        });
	        console.log(`LSCG Ready!`);
	    }
	    else {
	        console.debug("LSCG: Already logged in, init");
	        init();
	    }
	}
	function loginInit(C) {
	    if (window.LSCG_Loaded)
	        return;
	    init();
	}
	function initSettingsScreen() {
	    PreferenceSubscreenList.push("LSCGMainMenu");
	    hookFunction("TextGet", 2, (args, next) => {
	        if (args[0] == "HomepageLSCGMainMenu")
	            return "LSCG Settings";
	        return next(args);
	    });
	    hookFunction("DrawButton", 2, (args, next) => {
	        if (args[6] == "Icons/LSCGMainMenu.png")
	            args[6] = ICONS.BOUND_GIRL; // "Icons/Asylum.png";
	        return next(args);
	    });
	}
	function init() {
	    var _a, _b, _c, _d, _e, _f;
	    if (window.LSCG_Loaded)
	        return;
	    // clear any old settings.
	    if (!!((_a = Player.OnlineSettings) === null || _a === void 0 ? void 0 : _a.LittleSera))
	        delete Player.OnlineSettings.LittleSera;
	    if (!!((_b = Player.OnlineSettings) === null || _b === void 0 ? void 0 : _b.ClubGames))
	        delete Player.OnlineSettings.ClubGames;
	    if (typeof ((_c = Player.OnlineSettings) === null || _c === void 0 ? void 0 : _c.LSCG) === 'object')
	        Player.LSCG = ((_d = Player.OnlineSettings) === null || _d === void 0 ? void 0 : _d.LSCG) || {};
	    else if (typeof ((_e = Player.OnlineSettings) === null || _e === void 0 ? void 0 : _e.LSCG) === 'string')
	        Player.LSCG = JSON.parse(LZString.decompressFromBase64((_f = Player.OnlineSettings) === null || _f === void 0 ? void 0 : _f.LSCG)) || {};
	    initSettingsScreen();
	    if (!init_modules()) {
	        unload();
	        return;
	    }
	    settingsSave();
	    const currentAccount = Player.MemberNumber;
	    if (currentAccount == null) {
	        throw new Error("No player MemberNumber");
	    }
	    hookFunction("LoginResponse", 0, (args, next) => {
	        const response = args[0];
	        if (isObject(response) && typeof response.Name === "string" && typeof response.AccountName === "string" && response.MemberNumber !== currentAccount) {
	            alert(`Attempting to load LSCG with different account than already loaded (${response.MemberNumber} vs ${currentAccount}). This is not supported, please refresh the page.`);
	            throw new Error("Attempting to load LSCG with different account");
	        }
	        return next(args);
	    });
	    window.LSCG_Loaded = true;
	    console.log(`LSCG loaded! Version: ${LSCG_VERSION}`);
	}
	function init_modules() {
	    registerModule(new CoreModule());
	    registerModule(new GUI());
	    registerModule(new HypnoModule());
	    registerModule(new CollarModule());
	    registerModule(new BoopsModule());
	    registerModule(new MiscModule());
	    registerModule(new LipstickModule());
	    registerModule(new InjectorModule());
	    registerModule(new ActivityModule());
	    registerModule(new ItemUseModule());
	    registerModule(new RemoteUIModule());
	    registerModule(new CommandModule());
	    for (const m of modules()) {
	        m.init();
	    }
	    for (const m of modules()) {
	        m.load();
	    }
	    for (const m of modules()) {
	        m.run();
	    }
	    hookFunction("ChatRoomSafewordRevert", 1, (args, next) => {
	        for (const m of modules()) {
	            m.safeword();
	        }
	        return next(args);
	    });
	    hookFunction("ChatRoomSafewordRelease", 1, (args, next) => {
	        var ret = next(args);
	        for (const m of modules()) {
	            m.safeword();
	        }
	        return ret;
	    });
	    console.info("LSCG Modules Loaded.");
	    return true;
	}
	function unload() {
	    unload_modules();
	    delete window.LSCG_Loaded;
	    console.log("LSCG: Unloaded.");
	    return true;
	}
	function unload_modules() {
	    for (const m of modules()) {
	        m.unload();
	    }
	}
	initWait();

	exports.init = init;
	exports.initSettingsScreen = initSettingsScreen;
	exports.loginInit = loginInit;
	exports.unload = unload;

	return exports;

})({});
//# sourceMappingURL=bundle.js.map
