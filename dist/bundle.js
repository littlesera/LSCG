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

	const VERSION = "0.0.1";
	const patchedFunctions = new Map();
	const bcModSDK = bcModSDKRef.registerMod({
	    name: "LSCG",
	    fullName: "Little Sera's Club Games",
	    version: "0.0.1",
	    repository: "https://github.com/littlesera/sera"
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
	function OnChat(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        if (data.Type == "Chat")
	            callback(data, args[1], args[2], args[3]);
	    }, module);
	}
	function OnAction(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        if (data.Type == "Action" || data.Type == "Emote")
	            callback(data, args[1], args[2], args[3]);
	    }, module);
	}
	function OnActivity(priority, module, callback) {
	    hookFunction("ChatRoomMessage", priority, (args, next) => {
	        var data = args[0];
	        if (data.Type == "Activity")
	            callback(data, args[1], args[2], args[3]);
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
	function hookFunction(target, priority, hook, module = null) {
	    const data = initPatchableFunction(target);
	    if (data.hooks.some(h => h.hook === hook)) {
	        console.error(`BCX: Duplicate hook for "${target}"`, hook);
	        return;
	    }
	    const removeCallback = bcModSDK.hookFunction(target, priority, hook);
	    data.hooks.push({
	        hook,
	        priority,
	        module,
	        removeCallback
	    });
	    data.hooks.sort((a, b) => b.priority - a.priority);
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
	function SendAction(action, senderName = '') {
	    ServerSend("ChatRoomChat", { Content: "Beep", Type: "Action", Dictionary: [{ Tag: "Beep", Text: replace_template(action, senderName) }] });
	}
	function SendChat(msg) {
	    ServerSend("ChatRoomChat", { Type: "Chat", Content: msg });
	}
	function replace_template(text, source_name = '') {
	    let result = text;
	    // result = result.replaceAll("%POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive.toLocaleLowerCase())
	    // result = result.replaceAll("%CAP_POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive)
	    // result = result.replaceAll("%PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun.toLocaleLowerCase())
	    // result = result.replaceAll("%CAP_PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun)
	    // result = result.replaceAll("%INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive.toLocaleLowerCase())
	    // result = result.replaceAll("%CAP_INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive)
	    result = result.replaceAll("%NAME%", CharacterNickname(Player)); //Does this works to print "Lilly"? -- it should, yes
	    result = result.replaceAll("%OPP_NAME%", source_name); // finally we can use the source name to make the substitution
	    return result;
	}
	function getRandomInt(max) {
	    return Math.floor(Math.random() * max);
	}
	function settingsSave() {
	    Player.OnlineSettings.ClubGames = Player.ClubGames;
	    window.ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings });
	}
	/** Checks if the `obj` is an object (not null, not array) */
	function isObject(obj) {
	    return !!obj && typeof obj === "object" && !Array.isArray(obj);
	}

	class BaseModule {
	    init() {
	        // Empty
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
	}

	var ModuleCategory;
	(function (ModuleCategory) {
	    ModuleCategory[ModuleCategory["Global"] = 0] = "Global";
	    ModuleCategory[ModuleCategory["Collar"] = 1] = "Collar";
	    ModuleCategory[ModuleCategory["Hypno"] = 2] = "Hypno";
	    ModuleCategory[ModuleCategory["Boops"] = 3] = "Boops";
	    ModuleCategory[ModuleCategory["Lipstick"] = 4] = "Lipstick";
	    ModuleCategory[ModuleCategory["Misc"] = 99] = "Misc";
	})(ModuleCategory || (ModuleCategory = {}));
	const SETTING_NAMES = {
	    [ModuleCategory.Global]: "Global",
	    [ModuleCategory.Collar]: "Choke Collar",
	    [ModuleCategory.Hypno]: "Hypno",
	    [ModuleCategory.Boops]: "Boops",
	    [ModuleCategory.Lipstick]: "Lipstick",
	    [ModuleCategory.Misc]: "Miscellaneous"
	};
	const SETTING_ICONS = {
	    [ModuleCategory.Global]: "Icons/General.png",
	    [ModuleCategory.Collar]: "Icons/Restriction.png",
	    [ModuleCategory.Hypno]: "Icons/Visibility.png",
	    [ModuleCategory.Boops]: "Icons/Use.png",
	    [ModuleCategory.Lipstick]: "Icons/Arousal.png",
	    [ModuleCategory.Misc]: "Icons/ServiceBell.png"
	};

	class HypnoModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.triggerTimeout = 0;
	        this.triggerTimer = 300000; // 5 min
	        this.lingerInterval = 0; // check if need to reroll every 5s
	        this.lingerTimer = 1800000; // 30min
	        this.hornyTimeout = 0;
	        this.hypnoBlockStrings = [
	            "%NAME%'s eyelids flutter as a thought tries to enter her blank mind...",
	            "%NAME% sways weakly in her place, drifting peacefully...",
	            "%NAME% trembles as something deep and forgotten fails to resurface...",
	            "%NAME% moans softly as she drops even deeper into trance...",
	            "%NAME% quivers, patiently awaiting something to fill her empty head..."
	        ];
	    }
	    load() {
	        CommandCombine([
	            {
	                Tag: 'zonk',
	                Description: ": zonk self",
	                Action: () => {
	                    if (!triggerActivated)
	                        this.StartTriggerWord();
	                }
	            },
	            {
	                Tag: 'unzonk',
	                Description: ": unzonk self",
	                Action: () => {
	                    if (triggerActivated)
	                        this.TriggerRestoreTimeout();
	                }
	            }
	        ]);
	        OnChat(1000, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
	            var _a;
	            var lowerMsgWords = parseMsgWords(msg);
	            if (!hypnoActivated() &&
	                !!Player.ClubGames.Hypno.trigger &&
	                ((_a = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf(Player.ClubGames.Hypno.trigger)) !== null && _a !== void 0 ? _a : -1) >= 0 &&
	                sender.MemberNumber != Player.MemberNumber)
	                this.StartTriggerWord();
	        });
	        OnAction(1000, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
	            var _a;
	            var lowerMsgWords = parseMsgWords(msg);
	            if (((_a = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("snaps")) !== null && _a !== void 0 ? _a : -1) >= 0 &&
	                sender.MemberNumber != Player.MemberNumber &&
	                hypnoActivated()) {
	                this.TriggerRestoreSnap();
	            }
	        });
	        OnActivity(1000, ModuleCategory.Hypno, (data, sender, msg, metadata) => {
	            let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
	            if (!!target && target.MemberNumber == Player.MemberNumber) {
	                if (data.Content == "ChatOther-ItemNose-Pet" && triggerActivated)
	                    this.TriggerRestoreBoop();
	            }
	        });
	        hookFunction("Player.HasTints", 4, (args, next) => {
	            if (triggerActivated)
	                return true;
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction("Player.GetTints", 4, (args, next) => {
	            if (triggerActivated)
	                return [{ r: 148, g: 0, b: 211, a: 0.4 }];
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
	            if (triggerActivated)
	                return 3;
	            return next(args);
	        }, ModuleCategory.Hypno);
	        hookFunction('ServerSend', 5, (args, next) => {
	            // Prevent speech at choke level 4
	            if (triggerActivated) {
	                var type = args[0];
	                if (type == "ChatRoomChat" && args[1].Type == "Chat") {
	                    SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
	                    return null;
	                }
	                return next(args);
	            }
	            return next(args);
	        }, ModuleCategory.Hypno);
	        // Set Trigger
	        let wordLength = commonWords.length;
	        if (!Player.ClubGames.Hypno.trigger) {
	            Player.ClubGames.Hypno.trigger = commonWords[getRandomInt(wordLength)];
	            settingsSave();
	        }
	        if (!Player.ClubGames.Hypno.activatedAt) {
	            Player.ClubGames.Hypno.activatedAt = 0;
	            settingsSave();
	        }
	        if (!!Player.ClubGames.Hypno.existingEye1Name)
	            this.ResetEyes();
	        this.lingerInterval = setInterval(this.CheckNewTrigger, 5000);
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Hypno);
	    }
	    StartTriggerWord() {
	        if (triggerActivated)
	            return;
	        triggerActivated = true;
	        if (Player.ClubGames.Hypno.activatedAt == 0)
	            Player.ClubGames.Hypno.activatedAt = new Date().getTime();
	        AudioPlaySoundEffect("SciFiEffect", 1);
	        settingsSave();
	        SendAction("%NAME%'s eyes immediately unfocus, her posture slumping slightly as she loses control of her body at the utterance of a trigger word.");
	        this.SetEyes();
	        CharacterSetFacialExpression(Player, "Blush", "Medium");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
	        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	        CharacterSetFacialExpression(Player, "Fluids", "DroolLow");
	        clearTimeout(this.triggerTimeout);
	        this.triggerTimeout = setTimeout(this.TriggerRestoreTimeout, this.triggerTimer);
	        clearInterval(this.lingerInterval);
	        this.lingerInterval = setInterval(this.CheckNewTrigger, 1000);
	        clearInterval(this.hornyTimeout);
	        this.hornyTimeout = setInterval(this.HypnoHorny, this.triggerTimer / 100);
	    }
	    SetEyes() {
	        var _a, _b, _c, _d;
	        Player.ClubGames.Hypno.existingEye1Name = (_a = InventoryGet(Player, "Eyes")) === null || _a === void 0 ? void 0 : _a.Asset.Name;
	        Player.ClubGames.Hypno.existingEye1Color = (_b = InventoryGet(Player, "Eyes")) === null || _b === void 0 ? void 0 : _b.Color;
	        Player.ClubGames.Hypno.existingEye2Name = (_c = InventoryGet(Player, "Eyes2")) === null || _c === void 0 ? void 0 : _c.Asset.Name;
	        Player.ClubGames.Hypno.existingEye2Color = (_d = InventoryGet(Player, "Eyes2")) === null || _d === void 0 ? void 0 : _d.Color;
	        settingsSave();
	        this.EnforceEyes();
	    }
	    EnforceEyes() {
	        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes9");
	        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes9");
	        var eyes1 = InventoryGet(Player, "Eyes");
	        var eyes2 = InventoryGet(Player, "Eyes2");
	        if (!!eyes1) {
	            eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
	            eyes1.Color = "#A2A2A2";
	        }
	        if (!!eyes2) {
	            eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
	            eyes2.Color = "#A2A2A2";
	        }
	        ChatRoomCharacterUpdate(Player);
	    }
	    ResetEyes() {
	        var _a, _b;
	        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", (_a = Player.ClubGames.Hypno.existingEye1Name) !== null && _a !== void 0 ? _a : "Eyes5");
	        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", (_b = Player.ClubGames.Hypno.existingEye2Name) !== null && _b !== void 0 ? _b : "Eyes5");
	        var eyes1 = InventoryGet(Player, "Eyes");
	        var eyes2 = InventoryGet(Player, "Eyes2");
	        if (!!eyes1) {
	            eyes1.Asset = eyeAsset1 !== null && eyeAsset1 !== void 0 ? eyeAsset1 : {};
	            eyes1.Color = Player.ClubGames.Hypno.existingEye1Color;
	        }
	        if (!!eyes2) {
	            eyes2.Asset = eyeAsset2 !== null && eyeAsset2 !== void 0 ? eyeAsset2 : {};
	            eyes2.Color = Player.ClubGames.Hypno.existingEye2Color;
	        }
	        ChatRoomCharacterUpdate(Player);
	        Player.ClubGames.Hypno.existingEye1Name = undefined;
	        Player.ClubGames.Hypno.existingEye1Color = undefined;
	        Player.ClubGames.Hypno.existingEye2Name = undefined;
	        Player.ClubGames.Hypno.existingEye2Color = undefined;
	        settingsSave();
	    }
	    TriggerRestoreBoop() {
	        SendAction("%NAME% reboots, blinking and gasping as she regains her senses.");
	        this.TriggerRestore();
	    }
	    TriggerRestoreSnap() {
	        SendAction("%NAME% blinks, shaking her head with confusion as she regains her senses.");
	        this.TriggerRestore();
	    }
	    TriggerRestoreTimeout() {
	        SendAction("%NAME% gasps, blinking with confusion and blushing.");
	        this.TriggerRestore();
	    }
	    TriggerRestore() {
	        this.ResetEyes();
	        AudioPlaySoundEffect("SpankSkin");
	        CharacterSetFacialExpression(Player, "Eyes", "None");
	        clearInterval(this.hornyTimeout);
	        clearTimeout(this.triggerTimeout);
	        triggerActivated = false;
	    }
	    HypnoHorny() {
	        var _a, _b;
	        if (triggerActivated) {
	            // enforce eye expression
	            this.EnforceEyes();
	            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
	            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
	            var progress = Math.min(99, (_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0 + 5);
	            ActivitySetArousal(Player, progress);
	        }
	    }
	    CheckNewTrigger() {
	        if (triggerActivated)
	            return;
	        if (Player.ClubGames.Hypno.activatedAt > 0 && new Date().getTime() - Player.ClubGames.Hypno.activatedAt > this.lingerTimer)
	            this.RollTriggerWord();
	    }
	    RollTriggerWord() {
	        SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over her.");
	        Player.ClubGames.Hypno.trigger = commonWords[getRandomInt(commonWords.length)];
	        Player.ClubGames.Hypno.activatedAt = 0;
	        settingsSave();
	    }
	}
	// Trigger Words
	const commonWords = ["able", "about", "absolute", "accept", "account", "achieve", "across", "act", "active", "actual", "add", "address", "admit", "advertise", "affect", "afford", "after", "afternoon", "again", "against", "age", "agent", "ago", "agree", "air", "all", "allow", "almost", "along", "already", "alright", "although", "always", "america", "amount", "another", "answer", "apart", "apparent", "appear", "apply", "appoint", "approach", "appropriate", "area", "argue", "arm", "around", "arrange", "art", "ask", "associate", "assume", "attend", "authority", "available", "aware", "away", "awful", "baby", "back", "bad", "bag", "balance", "ball", "bank", "bar", "base", "basis", "bear", "beat", "beauty", "because", "become", "bed", "before", "begin", "behind", "believe", "benefit", "best", "bet", "between", "big", "bill", "birth", "bit", "black", "bloke", "blood", "blow", "blue", "board", "boat", "body", "book", "both", "bother", "bottle", "bottom", "box", "boy", "break", "brief", "brilliant", "bring", "britain", "brother", "budget", "build", "bus", "business", "busy", "buy", "cake", "call", "car", "card", "care", "carry", "case", "cat", "catch", "cause", "cent", "centre", "certain", "chair", "chairman", "chance", "change", "chap", "character", "charge", "cheap", "check", "child", "choice", "choose", "church", "city", "claim", "class", "clean", "clear", "client", "clock", "close", "closes", "clothe", "club", "coffee", "cold", "colleague", "collect", "college", "colour", "come", "comment", "commit", "committee", "common", "community", "company", "compare", "complete", "compute", "concern", "condition", "confer", "consider", "consult", "contact", "continue", "contract", "control", "converse", "cook", "copy", "corner", "correct", "cost", "could", "council", "count", "country", "county", "couple", "course", "court", "cover", "create", "cross", "cup", "current", "cut", "dad", "danger", "date", "day", "dead", "deal", "dear", "debate", "decide", "decision", "deep", "definite", "degree", "department", "depend", "describe", "design", "detail", "develop", "die", "difference", "difficult", "dinner", "direct", "discuss", "district", "divide", "doctor", "document", "dog", "door", "double", "doubt", "down", "draw", "dress", "drink", "drive", "drop", "dry", "due", "during", "each", "early", "east", "easy", "eat", "economy", "educate", "effect", "egg", "eight", "either", "elect", "electric", "eleven", "else", "employ", "encourage", "end", "engine", "english", "enjoy", "enough", "enter", "environment", "equal", "especial", "europe", "even", "evening", "ever", "every", "evidence", "exact", "example", "except", "excuse", "exercise", "exist", "expect", "expense", "experience", "explain", "express", "extra", "eye", "face", "fact", "fair", "fall", "family", "far", "farm", "fast", "father", "favour", "feed", "feel", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "fine", "finish", "fire", "first", "fish", "fit", "five", "flat", "floor", "fly", "follow", "food", "foot", "force", "forget", "form", "fortune", "forward", "four", "france", "free", "friday", "friend", "from", "front", "full", "fun", "function", "fund", "further", "future", "game", "garden", "gas", "general", "germany", "girl", "give", "glass", "good", "goodbye", "govern", "grand", "grant", "great", "green", "ground", "group", "grow", "guess", "guy", "hair", "half", "hall", "hand", "hang", "happen", "happy", "hard", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "hell", "help", "here", "high", "history", "hit", "hold", "holiday", "home", "honest", "hope", "horse", "hospital", "hot", "hour", "house", "however", "hullo", "hundred", "husband", "idea", "identify", "imagine", "important", "improve", "include", "income", "increase", "indeed", "individual", "industry", "inform", "inside", "instead", "insure", "interest", "into", "introduce", "invest", "involve", "issue", "item", "job", "join", "judge", "jump", "just", "keep", "key", "kid", "kill", "kind", "king", "kitchen", "knock", "know", "labour", "lad", "lady", "land", "language", "large", "last", "late", "laugh", "law", "lay", "lead", "learn", "leave", "left", "leg", "less", "letter", "level", "lie", "life", "light", "like", "likely", "limit", "line", "link", "list", "listen", "little", "live", "load", "local", "lock", "london", "long", "look", "lord", "lose", "lot", "love", "low", "luck", "lunch", "machine", "main", "major", "make", "man", "manage", "many", "mark", "market", "marry", "match", "matter", "may", "mean", "meaning", "measure", "meet", "member", "mention", "middle", "might", "mile", "milk", "million", "mind", "minister", "minus", "minute", "miss", "mister", "moment", "monday", "money", "month", "more", "morning", "most", "mother", "motion", "move", "much", "music", "must", "name", "nation", "nature", "near", "necessary", "need", "never", "news", "next", "nice", "night", "nine", "none", "normal", "north", "not", "note", "notice", "number", "obvious", "occasion", "odd", "off", "offer", "office", "often", "okay", "old", "on", "once", "one", "only", "open", "operate", "opportunity", "oppose", "order", "organize", "original", "other", "otherwise", "ought", "out", "over", "own", "pack", "page", "paint", "pair", "paper", "paragraph", "pardon", "parent", "park", "part", "particular", "party", "pass", "past", "pay", "pence", "pension", "people", "percent", "perfect", "perhaps", "period", "person", "photograph", "pick", "picture", "piece", "place", "plan", "play", "please", "plus", "point", "police", "policy", "politic", "poor", "position", "positive", "possible", "post", "pound", "power", "practise", "prepare", "present", "press", "pressure", "presume", "pretty", "previous", "price", "print", "private", "probable", "problem", "proceed", "process", "produce", "product", "programme", "project", "proper", "propose", "protect", "provide", "public", "pull", "purpose", "push", "quality", "quarter", "question", "quick", "quid", "quiet", "quite", "radio", "rail", "raise", "range", "rate", "rather", "read", "ready", "real", "realise", "really", "reason", "receive", "recent", "reckon", "recognize", "recommend", "record", "red", "reduce", "refer", "regard", "region", "relation", "remember", "report", "represent", "require", "research", "resource", "respect", "responsible", "rest", "result", "return", "right", "ring", "rise", "road", "role", "roll", "room", "round", "rule", "run", "safe", "sale", "same", "saturday", "save", "say", "scheme", "school", "science", "score", "scotland", "seat", "second", "secretary", "section", "secure", "see", "seem", "self", "sell", "send", "sense", "separate", "serious", "serve", "service", "set", "settle", "seven", "sex", "shall", "share", "she", "sheet", "shoe", "shoot", "shop", "short", "should", "show", "shut", "sick", "side", "sign", "similar", "simple", "since", "sing", "single", "sir", "sister", "sit", "site", "situate", "six", "size", "sleep", "slight", "slow", "small", "smoke", "social", "society", "some", "son", "soon", "sorry", "sort", "sound", "south", "space", "speak", "special", "specific", "speed", "spell", "spend", "square", "staff", "stage", "stairs", "stand", "standard", "start", "state", "station", "stay", "step", "stick", "still", "stop", "story", "straight", "strategy", "street", "strike", "strong", "structure", "student", "study", "stuff", "stupid", "subject", "succeed", "such", "sudden", "suggest", "suit", "summer", "sun", "sunday", "supply", "support", "suppose", "sure", "surprise", "switch", "system", "table", "take", "talk", "tape", "tax", "tea", "teach", "team", "telephone", "television", "tell", "ten", "tend", "term", "terrible", "test", "than", "thank", "the", "then", "there", "therefore", "they", "thing", "think", "thirteen", "thirty", "this", "thou", "though", "thousand", "three", "through", "throw", "thursday", "tie", "time", "today", "together", "tomorrow", "tonight", "too", "top", "total", "touch", "toward", "town", "trade", "traffic", "train", "transport", "travel", "treat", "tree", "trouble", "true", "trust", "try", "tuesday", "turn", "twelve", "twenty", "two", "type", "under", "understand", "union", "unit", "unite", "university", "unless", "until", "up", "upon", "use", "usual", "value", "various", "very", "video", "view", "village", "visit", "vote", "wage", "wait", "walk", "wall", "want", "war", "warm", "wash", "waste", "watch", "water", "way", "we", "wear", "wednesday", "week", "weigh", "welcome", "well", "west", "what", "when", "where", "whether", "which", "while", "white", "who", "whole", "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with", "within", "without", "woman", "wonder", "wood", "word", "work", "world", "worry", "worse", "worth", "would", "write", "wrong", "year", "yes", "yesterday", "yet", "you", "young"];
	// ****************** Functions *****************
	let triggerActivated = false;
	function hypnoActivated() {
	    return triggerActivated;
	}

	class CollarModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        // Choke Collar Code
	        this.allowedChokeMembers = [
	            96251,
	            60504
	        ];
	        this.chokeTimeout = 0;
	        this.chokeTimer = 120000;
	        this.chokeEventTimer = 60010;
	        this.passout1Timer = 30000;
	        this.passout2Timer = 15000;
	        this.passout3Timer = 10000;
	        this.eventInterval = 0;
	    }
	    load() {
	        CommandCombine([
	            {
	                Tag: 'tight',
	                Description: ": tighten collar",
	                Action: () => {
	                    this.IncreaseCollarChoke();
	                }
	            },
	            {
	                Tag: 'loose',
	                Description: ": loosen collar",
	                Action: () => {
	                    this.DecreaseCollarChoke();
	                }
	            }
	        ]);
	        OnChat(600, ModuleCategory.Collar, (data, sender, msg, metadata) => {
	            var _a, _b, _c;
	            var lowerMsgWords = parseMsgWords(msg);
	            if (!!sender && this.allowedChokeMembers.indexOf((_a = sender === null || sender === void 0 ? void 0 : sender.MemberNumber) !== null && _a !== void 0 ? _a : 0) >= 0) {
	                if (((_b = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("tight")) !== null && _b !== void 0 ? _b : -1) >= 0)
	                    this.IncreaseCollarChoke();
	                else if (((_c = lowerMsgWords === null || lowerMsgWords === void 0 ? void 0 : lowerMsgWords.indexOf("loose")) !== null && _c !== void 0 ? _c : -1) >= 0)
	                    this.DecreaseCollarChoke();
	            }
	        });
	        // event on room join
	        hookFunction("ChatRoomSync", 4, (args, next) => {
	            next(args);
	            this.ActivateChokeEvent();
	        }, ModuleCategory.Collar);
	        hookFunction('ServerSend', 4, (args, next) => {
	            // Prevent speech at choke level 4
	            if (args[0] == "ChatRoomChat" && args[1].Type == "Chat") {
	                if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
	                    SendAction("%NAME%'s mouth moves silently.");
	                    return null;
	                }
	                else if (Player.ClubGames.ChokeCollar.chokeLevel > 1) {
	                    args[1].Content = SpeechGarbleByGagLevel((Player.ClubGames.ChokeCollar.chokeLevel - 1) ** 2, args[1].Content);
	                    return next(args);
	                }
	                else
	                    return next(args);
	            }
	            else
	                return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.HasTints", 5, (args, next) => {
	            if (Player.ClubGames.ChokeCollar.chokeLevel > 2)
	                return true;
	            return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.GetTints", 5, (args, next) => {
	            if (Player.ClubGames.ChokeCollar.chokeLevel == 3)
	                return [{ r: 0, g: 0, b: 0, a: 0.2 }];
	            else if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
	                return [{ r: 0, g: 0, b: 0, a: 0.5 }];
	            return next(args);
	        }, ModuleCategory.Collar);
	        hookFunction("Player.GetBlurLevel", 5, (args, next) => {
	            if (Player.ClubGames.ChokeCollar.chokeLevel == 3)
	                return 2;
	            if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
	                return 6;
	            return next(args);
	        }, ModuleCategory.Collar);
	        this.eventInterval = setInterval(this.ChokeEvent, this.chokeEventTimer);
	        Player.ClubGames.ChokeCollar.chokeLevel = Player.OnlineSettings.ClubGames.ChokeCollar.chokeLevel || 0;
	        settingsSave();
	        if (Player.ClubGames.ChokeCollar.chokeLevel > 2) {
	            this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
	        }
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Collar);
	    }
	    setChokeTimeout(f, delay) {
	        clearTimeout(this.chokeTimeout);
	        this.chokeTimeout = setTimeout(f, delay);
	    }
	    IncreaseCollarChoke() {
	        if (Player.ClubGames.ChokeCollar.chokeLevel == 4)
	            return;
	        Player.ClubGames.ChokeCollar.chokeLevel++;
	        AudioPlaySoundEffect("HydraulicLock");
	        this.IncreaseArousal();
	        if (Player.ClubGames.ChokeCollar.chokeLevel < 4) {
	            CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	            switch (Player.ClubGames.ChokeCollar.chokeLevel) {
	                case 1:
	                    clearTimeout(this.chokeTimeout);
	                    SendAction("%NAME%'s eyes flutter as her collar starts to tighten around her neck with a quiet hiss.");
	                    CharacterSetFacialExpression(Player, "Blush", "Low");
	                    CharacterSetFacialExpression(Player, "Eyes", "Sad");
	                    break;
	                case 2:
	                    clearTimeout(this.chokeTimeout);
	                    SendAction("%NAME% gasps for air as her collar presses in around her neck with a hiss.");
	                    CharacterSetFacialExpression(Player, "Blush", "Medium");
	                    CharacterSetFacialExpression(Player, "Eyes", "Surprised");
	                    break;
	                case 3:
	                    this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
	                    SendAction("%NAME%'s face runs flush, choking as her collar hisses, barely allowing any air to her lungs.");
	                    CharacterSetFacialExpression(Player, "Blush", "High");
	                    CharacterSetFacialExpression(Player, "Eyes", "Scared");
	                    break;
	                default:
	                    break;
	            }
	        }
	        else if (Player.ClubGames.ChokeCollar.chokeLevel >= 4) {
	            Player.ClubGames.ChokeCollar.chokeLevel = 4;
	            this.StartPassout();
	        }
	        settingsSave();
	    }
	    DecreaseCollarChoke() {
	        if (Player.ClubGames.ChokeCollar.chokeLevel <= 0) {
	            Player.ClubGames.ChokeCollar.chokeLevel = 0;
	            return;
	        }
	        AudioPlaySoundEffect("Deflation");
	        Player.ClubGames.ChokeCollar.chokeLevel--;
	        if (Player.ClubGames.ChokeCollar.chokeLevel > 0)
	            this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
	        switch (Player.ClubGames.ChokeCollar.chokeLevel) {
	            case 3:
	                this.setChokeTimeout(this.DecreaseCollarChoke, this.chokeTimer);
	                SendAction("%NAME% chokes and gasps desperately as her collar slowly releases some pressure.");
	                CharacterSetFacialExpression(Player, "Blush", "High");
	                CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	                break;
	            case 2:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME%'s collar opens a little as she lets out a moan, gulping for air.");
	                CharacterSetFacialExpression(Player, "Blush", "Medium");
	                CharacterSetFacialExpression(Player, "Eyes", "Sad");
	                break;
	            case 1:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% whimpers thankfully as her collar reduces most of its pressure around her neck.");
	                CharacterSetFacialExpression(Player, "Blush", "Low");
	                CharacterSetFacialExpression(Player, "Eyes", "None");
	                break;
	            case 0:
	                clearTimeout(this.chokeTimeout);
	                SendAction("%NAME% takes a deep breath as her collar releases its grip with a hiss.");
	                CharacterSetFacialExpression(Player, "Blush", "None");
	                break;
	            default:
	                break;
	        }
	        settingsSave();
	    }
	    ResetCollarChoke() {
	        Player.ClubGames.ChokeCollar.chokeLevel = 0;
	        clearTimeout(this.chokeTimeout);
	        settingsSave();
	    }
	    StartPassout() {
	        SendAction("%NAME%'s eyes start to roll back, gasping and choking as her collar presses in tightly and completely with a menacing hiss.");
	        CharacterSetFacialExpression(Player, "Blush", "VeryHigh");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        this.setChokeTimeout(this.Passout1, this.passout1Timer);
	    }
	    Passout1() {
	        this.IncreaseArousal();
	        SendAction("%NAME% chokes and spasms, her collar holding tight.");
	        CharacterSetFacialExpression(Player, "Blush", "Extreme");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
	        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
	        this.setChokeTimeout(this.Passout2, this.passout2Timer);
	    }
	    Passout2() {
	        this.IncreaseArousal();
	        SendAction("%NAME% convulses weakly, her eyes rolling back as the collar hisses impossibly tighter.");
	        AudioPlaySoundEffect("HydraulicLock");
	        CharacterSetFacialExpression(Player, "Blush", "ShortBreath");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
	        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
	        this.setChokeTimeout(this.Passout3, this.passout3Timer);
	    }
	    Passout3() {
	        this.IncreaseArousal();
	        SendAction("As %NAME% collapses unconscious, her collar releases all of its pressure with a long hiss.");
	        AudioPlaySoundEffect("Deflation");
	        CharacterSetFacialExpression(Player, "Blush", "Medium");
	        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
	        CharacterSetFacialExpression(Player, "Eyes", "Closed");
	        CharacterSetFacialExpression(Player, "Mouth", "Closed");
	        clearTimeout(this.chokeTimeout);
	        this.ResetCollarChoke();
	    }
	    ChokeEvent() {
	        // only activate 1/4 times triggered unless at high level
	        if (Player.ClubGames.ChokeCollar.chokeLevel > 2)
	            this.ActivateChokeEvent();
	        else if (Player.ClubGames.ChokeCollar.chokeLevel == 2 && getRandomInt(8) == 0)
	            this.ActivateChokeEvent();
	        else if (Player.ClubGames.ChokeCollar.chokeLevel == 1 && getRandomInt(15) == 0)
	            this.ActivateChokeEvent();
	    }
	    ActivateChokeEvent() {
	        const ChokeEvents = {
	            low: [
	                "%NAME% coughs as her collar pushes against her throat.",
	                "%NAME% gulps as she feels the tight collar around her neck.",
	                "%NAME% shifts nervously in her tight collar.",
	                "%NAME% trembles, very conscious of the tight collar around her neck.",
	                "%NAME% huffs uncomfortably in her tight collar."
	            ],
	            mid: [
	                "%NAME% whimpers pleadingly as she struggles to take a full breath.",
	                "%NAME% chokes against her collar, moaning softly.",
	                "%NAME%'s eyes flutter weakly as her collar presses into her neck.",
	                "%NAME% tries to focus on breathing, each inhale an effort in her collar."
	            ],
	            high: [
	                "%NAME% splutters and chokes, struggling to breath.",
	                "%NAME% grunts and moans, straining to breath.",
	                "%NAME%'s eyes have trouble focusing, as she chokes and gets lightheaded."
	            ]
	        };
	        switch (Player.ClubGames.ChokeCollar.chokeLevel) {
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
	        ActivitySetArousal(Player, Math.min(99, (_b = (_a = Player.ArousalSettings) === null || _a === void 0 ? void 0 : _a.Progress) !== null && _b !== void 0 ? _b : 0 + 10));
	    }
	}

	class BoopsModule extends BaseModule {
	    constructor() {
	        super(...arguments);
	        this.boops = 0;
	        this.boopShutdown = false;
	        this.boopDecreaseLoop = 0;
	        this.normalBoopReactions = [
	            "%NAME% wiggles her nose.",
	            "%NAME% wiggles her nose with a small frown.",
	            "%NAME% sneezes in surprise.",
	            "%NAME% looks crosseyed at her nose.",
	            "%NAME% wiggles her nose with a squeak.",
	            "%NAME% meeps!"
	        ];
	        this.protestBoopReactions = [
	            "%NAME% swats at %OPP_NAME%'s hand.",
	            "%NAME% covers her nose protectively, squinting at %OPP_NAME%.",
	            "%NAME% snatches %OPP_NAME%'s booping finger."
	        ];
	        this.bigProtestBoopReactions = [
	            "%NAME%'s nose overloads and shuts down."
	        ];
	        this.boundBoopReactions = [
	            "%NAME% struggles in her bindings, huffing.",
	            "%NAME% frowns and squirms in her bindings.",
	            "%NAME% whimpers in her bondage.",
	            "%NAME% groans helplessly.",
	            "%NAME% whines and wiggles in her bondage."
	        ];
	    }
	    load() {
	        OnActivity(100, ModuleCategory.Boops, (data, sender, msg, metadata) => {
	            let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
	            if (!!target &&
	                target.MemberNumber == Player.MemberNumber &&
	                data.Content == "ChatOther-ItemNose-Pet" &&
	                !hypnoActivated()) {
	                this.BoopReact(sender.MemberNumber);
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
	        CharacterSetFacialExpression(Player, "Blush", "Low");
	        SendAction(this.normalBoopReactions[getRandomInt(this.normalBoopReactions.length)]);
	    }
	    ProtestBoopReact(booper) {
	        CharacterSetFacialExpression(Player, "Blush", "Medium");
	        CharacterSetFacialExpression(Player, "Eyes", "Daydream");
	        if (Player.IsRestrained())
	            SendAction(this.boundBoopReactions[getRandomInt(this.boundBoopReactions.length)]);
	        else
	            SendAction(this.protestBoopReactions[getRandomInt(this.protestBoopReactions.length)], booper.Nickname);
	    }
	    BigProtestBoopReact(booper) {
	        CharacterSetFacialExpression(Player, "Blush", "High");
	        CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
	        SendAction(this.bigProtestBoopReactions[getRandomInt(this.bigProtestBoopReactions.length)]);
	        this.boopShutdown = true;
	        setTimeout(() => this.boopShutdown = false, 30000);
	    }
	}

	class MiscModule extends BaseModule {
	    load() {
	        OnActivity(100, ModuleCategory.Misc, (data, sender, msg, metadata) => {
	            let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
	            if (!!target &&
	                sender.MemberNumber == Player.MemberNumber &&
	                data.Content == "ChatOther-ItemLegs-Sit" &&
	                CharacterCanChangeToPose(Player, "Kneel")) {
	                CharacterSetActivePose(Player, "Kneel");
	            }
	        });
	    }
	    unload() {
	        removeAllHooksByModule(ModuleCategory.Misc);
	    }
	}

	class LipstickModule extends BaseModule {
	    load() {
	        OnActivity(100, ModuleCategory.Lipstick, (data, sender, msg, metadata) => {
	            let target = data.Dictionary.find((d) => d.Tag == "TargetCharacter");
	            if (!!target &&
	                target.MemberNumber == Player.MemberNumber) {
	                if (this.wearingMask())
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
	                    default:
	                        break;
	                }
	                var item = data.Dictionary.find((d) => d.Tag == "ActivityAsset");
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
	    getExistingLipstickMarks() {
	        var mask = InventoryGet(Player, "Mask");
	        if (!!mask && mask.Asset.Name == "Kissmark")
	            return mask;
	        else
	            return null;
	    }
	    addLipstickMarks() {
	        var _a;
	        InventoryRemove(Player, "Mask");
	        InventoryWear(Player, "Kissmark", "Mask", "Default", 1, (_a = Player.MemberNumber) !== null && _a !== void 0 ? _a : 0, null, true);
	        var marks = InventoryGet(Player, "Mask");
	        if (!!marks && !!marks.Property)
	            marks.Property.Type = "c0r1f0n0l0";
	        return marks;
	    }
	    wearingMask() {
	        var mask = InventoryGet(Player, "Mask");
	        if (!!mask && mask.Asset.Name != "Kissmark")
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
	        var _a, _b;
	        var marks = this.getExistingLipstickMarks();
	        if (!marks)
	            return;
	        var status = this.getKissMarkStatus((_b = (_a = marks === null || marks === void 0 ? void 0 : marks.Property) === null || _a === void 0 ? void 0 : _a.Type) !== null && _b !== void 0 ? _b : "c0r1f0n0l0");
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
	                status.cheek2 = false;
	                break;
	            default:
	                break;
	        }
	        if (!!marks && !!marks.Property)
	            marks.Property.Type = this.getKissMarkTypeString(status);
	        ChatRoomCharacterUpdate(Player);
	    }
	    AddKissMark(sender, location) {
	        var _a, _b;
	        var color = this.getKisserLipColor(sender);
	        if (color == "Default")
	            return; // No lipstick
	        var marks = this.getExistingLipstickMarks();
	        if (!marks)
	            marks = this.addLipstickMarks();
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
	                CharacterSetFacialExpression(Player, "Blush", "Low");
	                break;
	            case "forehead":
	                status.forehead = true;
	                CharacterSetFacialExpression(Player, "Blush", "Low");
	                break;
	            case "neck":
	                if (!status.neck1)
	                    status.neck1 = true;
	                else
	                    status.cheek2 = true;
	                CharacterSetFacialExpression(Player, "Blush", "Medium");
	                break;
	            default:
	                break;
	        }
	        if (!!marks && !!marks.Property)
	            marks.Property.Type = this.getKissMarkTypeString(status);
	        ChatRoomCharacterUpdate(Player);
	    }
	}

	const modules = [];
	function registerModule(module) {
	    modules.push(module);
	    return module;
	}
	function init_modules() {
	    for (const m of modules) {
	        m.init();
	    }
	    for (const m of modules) {
	        m.load();
	    }
	    for (const m of modules) {
	        m.run();
	    }
	    return true;
	}
	function unload_modules() {
	    for (const m of modules) {
	        m.unload();
	    }
	}
	registerModule(new HypnoModule());
	registerModule(new CollarModule());
	registerModule(new BoopsModule());
	registerModule(new MiscModule());
	registerModule(new LipstickModule());

	function initWait() {
	    console.debug("BCX: Init wait");
	    if (CurrentScreen == null || CurrentScreen === "Login") {
	        hookFunction("LoginResponse", 0, (args, next) => {
	            console.debug("BCX: Init LoginResponse caught", args);
	            next(args);
	            const response = args[0];
	            if (isObject(response) && typeof response.Name === "string" && typeof response.AccountName === "string") {
	                loginInit(args[0]);
	            }
	        });
	        console.log(`ClubGames Ready!`);
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
	function init() {
	    if (window.LSCG_Loaded)
	        return;
	    Player.ClubGames = Player.OnlineSettings.ClubGames || {};
	    if (!init_modules()) {
	        unload();
	        return;
	    }
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
	    console.log(`LSCG loaded! Version: ${VERSION}`);
	}
	function unload() {
	    unload_modules();
	    delete window.LSCG_Loaded;
	    console.log("LSCG: Unloaded.");
	    return true;
	}
	initWait();

	exports.init = init;
	exports.loginInit = loginInit;
	exports.unload = unload;

	return exports;

})({});
//# sourceMappingURL=bundle.js.map
