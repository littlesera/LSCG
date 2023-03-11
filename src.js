const SeraScripts_Version = '0.0.1';

// Bondage Club Mod Development Kit (1.1.0)
// For more info see: https://github.com/Jomshir98/bondage-club-mod-sdk
/** @type {ModSDKGlobalAPI} */
var bcModSdk=function(){"use strict";const e="1.1.0";function o(e){alert("Mod ERROR:\n"+e);const o=new Error(e);throw console.error(o),o}const t=new TextEncoder;function n(e){return!!e&&"object"==typeof e&&!Array.isArray(e)}function r(e){const o=new Set;return e.filter((e=>!o.has(e)&&o.add(e)))}const i=new Map,a=new Set;function d(e){a.has(e)||(a.add(e),console.warn(e))}function s(e){const o=[],t=new Map,n=new Set;for(const r of p.values()){const i=r.patching.get(e.name);if(i){o.push(...i.hooks);for(const[o,a]of i.patches.entries())t.has(o)&&t.get(o)!==a&&d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o)||""}\nPatch2:\n${a}`),t.set(o,a),n.add(r.name)}}o.sort(((e,o)=>o.priority-e.priority));const r=function(e,o){if(0===o.size)return e;let t=e.toString().replaceAll("\r\n","\n");for(const[n,r]of o.entries())t.includes(n)||d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(e.original,t);let i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,e.name,n),d=r.apply(this,o);return null==a||a(),d};for(let t=o.length-1;t>=0;t--){const n=o[t],r=i;i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,e.name,n.mod),d=n.hook.apply(this,[o,e=>{if(1!==arguments.length||!Array.isArray(o))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`);return r.call(this,e)}]);return null==a||a(),d}}return{hooks:o,patches:t,patchesSources:n,enter:i,final:r}}function c(e,o=!1){let r=i.get(e);if(r)o&&(r.precomputed=s(r));else{let o=window;const a=e.split(".");for(let t=0;t<a.length-1;t++)if(o=o[a[t]],!n(o))throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const d=o[a[a.length-1]];if("function"!=typeof d)throw new Error(`ModSDK: Function ${e} to be patched not found`);const c=function(e){let o=-1;for(const n of t.encode(e)){let e=255&(o^n);for(let o=0;o<8;o++)e=1&e?-306674912^e>>>1:e>>>1;o=o>>>8^e}return((-1^o)>>>0).toString(16).padStart(8,"0").toUpperCase()}(d.toString().replaceAll("\r\n","\n")),l={name:e,original:d,originalHash:c};r=Object.assign(Object.assign({},l),{precomputed:s(l),router:()=>{},context:o,contextProperty:a[a.length-1]}),r.router=function(e){return function(...o){return e.precomputed.enter.apply(this,[o])}}(r),i.set(e,r),o[r.contextProperty]=r.router}return r}function l(){const e=new Set;for(const o of p.values())for(const t of o.patching.keys())e.add(t);for(const o of i.keys())e.add(o);for(const o of e)c(o,!0)}function f(){const e=new Map;for(const[o,t]of i)e.set(o,{name:o,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((e=>e.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return e}const p=new Map;function u(e){p.get(e.name)!==e&&o(`Failed to unload mod '${e.name}': Not registered`),p.delete(e.name),e.loaded=!1,l()}function g(e,t,r){"string"==typeof e&&"string"==typeof t&&(alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`),e={name:e,fullName:e,version:t},t={allowReplace:!0===r}),e&&"object"==typeof e||o("Failed to register mod: Expected info object, got "+typeof e),"string"==typeof e.name&&e.name||o("Failed to register mod: Expected name to be non-empty string, got "+typeof e.name);let i=`'${e.name}'`;"string"==typeof e.fullName&&e.fullName||o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`),i=`'${e.fullName} (${e.name})'`,"string"!=typeof e.version&&o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`),e.repository||(e.repository=void 0),void 0!==e.repository&&"string"!=typeof e.repository&&o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`),null==t&&(t={}),t&&"object"==typeof t||o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`);const a=!0===t.allowReplace,d=p.get(e.name);d&&(d.allowReplace&&a||o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(d));const s=e=>{"string"==typeof e&&e||o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`);let t=g.patching.get(e);return t||(t={hooks:[],patches:new Map},g.patching.set(e,t)),t},f={unload:()=>u(g),hookFunction:(e,t,n)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);"number"!=typeof t&&o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`);const a={mod:g.name,priority:t,hook:n};return r.hooks.push(a),l(),()=>{const e=r.hooks.indexOf(a);e>=0&&(r.hooks.splice(e,1),l())}},patchFunction:(e,t)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);n(t)||o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`);for(const[n,a]of Object.entries(t))"string"==typeof a?r.patches.set(n,a):null===a?r.patches.delete(n):o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`);l()},removePatches:e=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);s(e).patches.clear(),l()},callOriginal:(e,t,n)=>(g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),"string"==typeof e&&e||o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`),Array.isArray(t)||o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`),function(e,o,t=window){return c(e).original.apply(t,o)}(e,t,n)),getOriginalHash:e=>("string"==typeof e&&e||o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`),c(e).originalHash)},g={name:e.name,fullName:e.fullName,version:e.version,repository:e.repository,allowReplace:a,api:f,loaded:!0,patching:new Map};return p.set(e.name,g),Object.freeze(f)}function h(){const e=[];for(const o of p.values())e.push({name:o.name,fullName:o.fullName,version:o.version,repository:o.repository});return e}let m;const y=function(){if(void 0===window.bcModSdk)return window.bcModSdk=function(){const o={version:e,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:f,errorReporterHooks:Object.seal({hookEnter:null,hookChainExit:null})};return m=o,Object.freeze(o)}();if(n(window.bcModSdk)||o("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==e&&(alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk.version.startsWith("1.0.")&&void 0===window.bcModSdk._shim10register)){const e=window.bcModSdk,o=Object.freeze(Object.assign(Object.assign({},e),{registerMod:(o,t,n)=>o&&"object"==typeof o&&"string"==typeof o.name&&"string"==typeof o.version?e.registerMod(o.name,o.version,"object"==typeof t&&!!t&&!0===t.allowReplace):e.registerMod(o,t,n),_shim10register:!0}));window.bcModSdk=o}return window.bcModSdk}();return"undefined"!=typeof exports&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();

(async function () {
	
    await waitFor(() => ServerSocket && ServerIsConnected);	

	//do not touch this
	async function waitFor(func, cancelFunc = () => false) {
		while (!func()) {
			if (cancelFunc()) return false;
			await sleep(10);
		}
		return true;
	}

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  //end of do not touch this
	
    const SDK = bcModSDK.registerMod({
        name: 'SeraScripts',
        fullName: 'Sera Scripts',
        version: SeraScripts_Version
    });

    if(Player.SeraScripts != null){
	    console.log("Sera Scripts loaded");
    }

    window.SeraScripts_Version = SeraScripts_Version

    // wait for actual player
    await waitFor(() => !!Player?.AccountName);
    if (Player.MemberNumber != 74298)
        return;

    window.ChatRoomRegisterMessageHandler({ Priority: 600, Description: "Sera Scripts", Callback: (data, sender, msg, metadata) => {
        var lowerMsg = msg.toLowerCase();
        var lowerMsgWords = lowerMsg.match(/\b(\w+)\b/g);
        if (!!lowerMsgWords && lowerMsgWords.length > 0) {
            if (data.Type == "Chat") {
                if (!!sender && allowedChokeMembers.indexOf(sender.MemberNumber) >= 0) {
                    if (lowerMsgWords.indexOf("tight") >= 0)
                        IncreaseCollarChoke();
                    else if (lowerMsgWords.indexOf("loose") >= 0)
                        DecreaseCollarChoke();
                }
                if (!triggerActivated && !!Player.LittleSera.trigger && lowerMsgWords.indexOf(Player.LittleSera.trigger) >= 0 && sender.MemberNumber != Player.MemberNumber) {
                    StartTriggerWord();
                }
            }
            else if (data.Type == "Action" || data.Type == "Emote") {
                if (!!sender && sender.MemberNumber != Player.MemberNumber) {
                    if (lowerMsgWords.indexOf("snaps") >= 0 && triggerActivated) {
                        TriggerRestoreSnap();
                    }
                }
            }
            else if (data.Type == "Activity") {
                let target = data.Dictionary.find(d => d.Tag == "TargetCharacter");
                if (!!target && target.MemberNumber == Player.MemberNumber) {
                    if (data.Content == "ChatOther-ItemNose-Pet")
                    {
                        if (triggerActivated)
                            TriggerRestoreBoop();
                        else
                            BoopReact(sender.MemberNumber);
                    }
                }
            }
        }
    }});

    CommandCombine([
        {
            Tag: 'tight',
            Description: ": tighten collar",
    
            Action: () => {
                IncreaseCollarChoke();
            }
        },
        {
            Tag: 'loose',
            Description: ": loosen collar",
    
            Action: () => {
                DecreaseCollarChoke();
            }
        },
        {
            Tag: 'zonk',
            Description: ": zonk self",
    
            Action: () => {
                if (!triggerActivated)
                    StartTriggerWord();
            }
        },
        {
            Tag: 'unzonk',
            Description: ": unzonk self",
    
            Action: () => {
                if (triggerActivated)
                    TriggerRestoreTimeout();
            }
        }
    ])

    function SendAction(action, senderName = '') {
        ServerSend("ChatRoomChat", {Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: replace_template(action, senderName)}]});
    }

    function SendChat(msg) {
        ServerSend("ChatRoomChat", {Type: "Chat", Content: msg})
    }

    function replace_template(text, source_name = '') {
        let result = text
        // result = result.replaceAll("%POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive.toLocaleLowerCase())
        // result = result.replaceAll("%CAP_POSSESSIVE%", Player.BCAR.bcarSettings.genderDefault.capPossessive)
        // result = result.replaceAll("%PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun.toLocaleLowerCase())
        // result = result.replaceAll("%CAP_PRONOUN%", Player.BCAR.bcarSettings.genderDefault.capPronoun)
        // result = result.replaceAll("%INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive.toLocaleLowerCase())
        // result = result.replaceAll("%CAP_INTENSIVE%", Player.BCAR.bcarSettings.genderDefault.capIntensive)
        result = result.replaceAll("%NAME%", CharacterNickname(Player)) //Does this works to print "Lilly"? -- it should, yes
        result = result.replaceAll("%OPP_NAME%", source_name) // finally we can use the source name to make the substitution

        return result
    }

    // Boops

    const normalBoopReactions = [
        "%NAME% wiggles her nose.",
        "%NAME% wiggles her nose with a small frown.",
        "%NAME% sneezes in surprise.",
        "%NAME% looks crosseyed at her nose.",
        "%NAME% wiggles her nose with a squeak.",
        "%NAME% meeps!"
    ]

    const protestBoopReactions = [
        "%NAME% swats at %OPP_NAME%'s hand.",
        "%NAME% covers her nose protectively, squinting at %OPP_NAME%.",
        "%NAME% snatches %OPP_NAME%'s booping finger."
    ]

    const bigProtestBoopReactions = [
        "%NAME%'s nose overloads and shuts down."
    ]

    const boundBoopReactions = [
        "%NAME% struggles in her bindings, huffing.",
        "%NAME% frowns and squirms in her bindings.",
        "%NAME% whimpers in her bondage.",
        "%NAME% groans helplessly.",
        "%NAME% whines and wiggles in her bondage."
    ]

    boopsPerPerson = {};
    boopShutdown = false;

    function BoopReact(booperId) {
        if (boopShutdown)
            return;
        var booper = ChatRoomCharacter.find(c => c.MemberNumber == booperId);
        if (booper) {
            if (!boopsPerPerson[booperId])
                boopsPerPerson[booperId] = 1;
            else
                boopsPerPerson[booperId]++;
            setTimeout((booperId) => {
                if (!!boopsPerPerson[booperId])
                    boopsPerPerson[booperId]--;
            },5000);
        }
        if (!!boopsPerPerson[booperId] && boopsPerPerson[booperId] > 5)
            ProtestBoopReact(booper);
        else if (!!boopsPerPerson[booperId] && boopsPerPerson[booperId] > 10)
            BigProtestBoopReact(booper);            
        else
            NormalBoopReact();
    }

    function NormalBoopReact() {
        SendAction(normalBoopReactions[getRandomInt(normalBoopReactions.length)]);
    }

    function ProtestBoopReact(booper) {
        if (Player.IsRestrained())
            SendAction(boundBoopReactions[getRandomInt(boundBoopReactions.length)]);
        else
            SendAction(protestBoopReactions[getRandomInt(protestBoopReactions.length)], booper.Nickname);
    }

    function BigProtestBoopReact(booper) {
        SendAction(bigProtestBoopReactions[getRandomInt(bigProtestBoopReactions.length)]);
        boopShutdown = true;
        setTimeout(() => boopShutdown = false, 30000);
    }

    // Choke Collar Code

    allowedChokeMembers = [
        96251,
        60504
    ];

    chokeTimeout = 0;
    chokeTimer = 120000;
    chokeEventTimer = 60010;
    passout1Timer = 30000;
    passout2Timer = 15000;
    passout3Timer = 10000;

    Player.LittleSera = Player.OnlineSettings.LittleSera || {chokeLevel: 0}
    settingsSave();

    if (Player.LittleSera.chokeLevel > 2) {
        setChokeTimeout(DecreaseCollarChoke, chokeTimer);
    }
    
    eventInterval = setInterval(ChokeEvent, chokeEventTimer);

    function settingsSave() {
        Player.OnlineSettings.LittleSera = Player.LittleSera
        window.ServerAccountUpdate.QueueData({OnlineSettings: window.Player.OnlineSettings})
    }

    function setChokeTimeout(f, delay) {
        clearTimeout(chokeTimeout);
        chokeTimeout = setTimeout(f, delay);
    }

    // event on room join
    SDK.hookFunction("ChatRoomSync", 4, (args, next) => {
		next(args);
		ActivateChokeEvent();
	});

    SDK.hookFunction('ServerSend', 4, (args, next) => {
        // Prevent speech at choke level 4
        if (args[0] == "ChatRoomChat" && args[1].Type == "Chat"){
            if (Player.LittleSera.chokeLevel >= 4) {
                SendAction("%NAME%'s mouth moves silently.");
                return null;
            }
            else if (Player.LittleSera.chokeLevel > 1) {
                args[1].Content = SpeechGarbleByGagLevel((Player.LittleSera.chokeLevel-1)**2, args[1].Content);
                return next(args);
            }
            else
                return next(args);
        }
        else
            return next(args);
    });

    SDK.hookFunction("Player.HasTints", 5, (args, next) => {
        if (Player.LittleSera.chokeLevel > 2) return true;
        return next(args);
    });

    SDK.hookFunction("Player.GetTints", 5, (args, next) => {
        if (Player.LittleSera.chokeLevel == 3) return [{r: 0, g: 0, b: 0, a: 0.2}];
        else if (Player.LittleSera.chokeLevel == 4) return [{r: 0, g: 0, b: 0, a: 0.5}];
        return next(args);
    });
        
    SDK.hookFunction("Player.GetBlurLevel", 5, (args, next) => {
        if (Player.LittleSera.chokeLevel == 3) return 2;
        if (Player.LittleSera.chokeLevel == 4) return 6;
        return next(args);
    });

    function IncreaseCollarChoke() {
        if (Player.LittleSera.chokeLevel == 4)
            return;
        Player.LittleSera.chokeLevel++;
        AudioPlaySoundEffect("HydraulicLock");
        IncreaseArousal();
        if (Player.LittleSera.chokeLevel < 4) {
            CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
            switch (Player.LittleSera.chokeLevel) {
                case 1:
                    clearTimeout(chokeTimeout);
                    SendAction("%NAME%'s eyes flutter as her collar starts to tighten around her neck with a quiet hiss.");
                    CharacterSetFacialExpression(Player, "Blush", "Low");
                    CharacterSetFacialExpression(Player, "Eyes", "Sad");
                    break;
                case 2:
                    clearTimeout(chokeTimeout);
                    SendAction("%NAME% gasps for air as her collar presses in around her neck with a hiss.");
                    CharacterSetFacialExpression(Player, "Blush", "Medium");
                    CharacterSetFacialExpression(Player, "Eyes", "Surprised");
                    break;
                case 3:
                    setChokeTimeout(DecreaseCollarChoke, chokeTimer);
                    SendAction("%NAME%'s face runs flush, choking as her collar hisses, barely allowing any air to her lungs.");
                    CharacterSetFacialExpression(Player, "Blush", "High");
                    CharacterSetFacialExpression(Player, "Eyes", "Scared");
                    break;
                default:
                    break;
            }
        }
        else if (Player.LittleSera.chokeLevel >= 4) {
            Player.LittleSera.chokeLevel = 4;
            StartPassout();
        }

        settingsSave();
    }

    function DecreaseCollarChoke() {
        if (Player.LittleSera.chokeLevel <= 0) {
            Player.LittleSera.chokeLevel = 0;
            return;
        }

        AudioPlaySoundEffect("Deflation");
        Player.LittleSera.chokeLevel--;
        if (Player.LittleSera.chokeLevel > 0)
            setChokeTimeout(DecreaseCollarChoke, chokeTimer);

        switch (Player.LittleSera.chokeLevel) {
            case 3:
                setChokeTimeout(DecreaseCollarChoke, chokeTimer);
                SendAction("%NAME% chokes and gasps desperately as her collar slowly releases some pressure.");
                CharacterSetFacialExpression(Player, "Blush", "High");
                CharacterSetFacialExpression(Player, "Eyes", "Lewd");
                break;
            case 2:
                clearTimeout(chokeTimeout);
                SendAction("%NAME%'s collar opens a little as she lets out a moan, gulping for air.");
                CharacterSetFacialExpression(Player, "Blush", "Medium");
                CharacterSetFacialExpression(Player, "Eyes", "Sad");
                break;
            case 1:
                clearTimeout(chokeTimeout);
                SendAction("%NAME% whimpers thankfully as her collar reduces most of its pressure around her neck.");
                CharacterSetFacialExpression(Player, "Blush", "Low");
                CharacterSetFacialExpression(Player, "Eyes", "None");
                break;
            case 0:
                clearTimeout(chokeTimeout);
                SendAction("%NAME% takes a deep breath as her collar releases its grip with a hiss.");
                CharacterSetFacialExpression(Player, "Blush", "None");
                break;
            default:
                break;
        }

        settingsSave();
    }

    function ResetCollarChoke() {
        Player.LittleSera.chokeLevel = 0;
        clearTimeout(chokeTimeout);
        settingsSave();
    }

    function StartPassout() {
        SendAction("%NAME%'s eyes start to roll back, gasping and choking as her collar presses in tightly and completely with a menacing hiss.");
        CharacterSetFacialExpression(Player, "Blush", "VeryHigh");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        setChokeTimeout(Passout1, passout1Timer);
    }

    function Passout1() {
        IncreaseArousal();
        SendAction("%NAME% chokes and spasms, her collar holding tight.");
        CharacterSetFacialExpression(Player, "Blush", "Extreme");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        setChokeTimeout(Passout2, passout2Timer);
    }

    function Passout2() {
        IncreaseArousal();
        SendAction("%NAME% convulses weakly, her eyes rolling back as the collar hisses impossibly tighter.");
        AudioPlaySoundEffect("HydraulicLock");
        CharacterSetFacialExpression(Player, "Blush", "ShortBreath");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
        CharacterSetFacialExpression(Player, "Mouth", "HalfOpen");
        setChokeTimeout(Passout3, passout3Timer);
    }

    function Passout3() {
        IncreaseArousal();
        SendAction("As %NAME% collapses unconscious, her collar releases all of its pressure with a long hiss.");
        AudioPlaySoundEffect("Deflation");
        CharacterSetFacialExpression(Player, "Blush", "Medium");
        CharacterSetFacialExpression(Player, "Eyebrows", "Soft");
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Mouth", "Closed");
        clearTimeout(chokeTimeout);
        ResetCollarChoke();
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    function ChokeEvent() {
        // only activate 1/4 times triggered unless at high level
        if (Player.LittleSera.chokeLevel > 2)
            ActivateChokeEvent();
        else if (Player.LittleSera.chokeLevel == 2 && getRandomInt(8) == 0)
            ActivateChokeEvent();
        else if (Player.LittleSera.chokeLevel == 1 && getRandomInt(15) == 0)
            ActivateChokeEvent();
    }

    function ActivateChokeEvent() {
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
        }
        let choice = getRandomInt(3);
        switch (Player.LittleSera.chokeLevel) {
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

    function IncreaseArousal() {
        ActivitySetArousal(Player, Math.min(99, Player.ArousalSettings.Progress + 10));
        Player.BCT.splitOrgasmArousal.arousalProgress = Math.min(Player.BCT.splitOrgasmArousal.arousalProgress + 25, 100);
        BCT_API?.ActivityChatRoomBCTArousalSync(Player);
    }

    // Set Trigger
    var wordLength = commonWords.length;
    if (!Player.LittleSera.trigger) {
        Player.LittleSera.trigger = commonWords[getRandomInt(wordLength)];
        settingsSave();
    }
    if (!Player.LittleSera.activatedAt) {
        Player.LittleSera.activatedAt = 0;
        settingsSave();
    }
    if (!!Player.LittleSera.existingEye1Name)
        ResetEyes();

    triggerTimeout = 0;
    triggerActivated = false;
    triggerTimer = 300000; // 5 min
    lingerInterval = 0;
    lingerTimer = 1800000; // 30min
    hornyTimeout = 0;

    SDK.hookFunction("Player.HasTints", 4, (args, next) => {
        if (triggerActivated) return true;
        return next(args);
    });

    SDK.hookFunction("Player.GetTints", 4, (args, next) => {
        if (triggerActivated) return [{r: 148, g: 0, b: 211, a: 0.4}];
        return next(args);
    });
        
    SDK.hookFunction("Player.GetBlurLevel", 4, (args, next) => {
        if (triggerActivated) return 3;
        return next(args);
    });

    const hypnoBlockStrings = [
        "%NAME%'s eyelids flutter as a thought tries to enter her blank mind...",
        "%NAME% sways weakly in her place, drifting peacefully...",
        "%NAME% trembles as something deep and forgotten fails to resurface...",
        "%NAME% moans softly as she drops even deeper into trance...",
        "%NAME% quivers, patiently awaiting something to fill her empty head..."
    ];

    SDK.hookFunction('ServerSend', 5, (args, next) => {
        // Prevent speech at choke level 4
        if (triggerActivated) {
            var type = args[0];
            if (type == "ChatRoomChat" && args[1].Type == "Chat"){
                SendAction(hypnoBlockStrings[getRandomInt(hypnoBlockStrings.length)]);
                return null;
            }
            return next(args);
        }
        return next(args);
    });

    clearInterval(lingerInterval);
    lingerInterval = setInterval(CheckNewTrigger, 1000);

    function StartTriggerWord() {
        if (triggerActivated)
            return;

        triggerActivated = true;
        Player.LittleSera.activatedAt = new Date().getTime();
        AudioPlaySoundEffect("SciFiEffect", 1);
        settingsSave();
        
        SendAction("%NAME%'s eyes immediately unfocus, her posture slumping slightly as she loses control of her body at the utterance of a trigger word.");
        SetEyes();
        CharacterSetFacialExpression(Player, "Blush", "Medium");
        CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        CharacterSetFacialExpression(Player, "Fluids", "DroolLow");    

        clearTimeout(triggerTimeout);
        triggerTimeout = setTimeout(TriggerRestoreTimeout, triggerTimer);

        clearInterval(lingerInterval);
        lingerInterval = setInterval(CheckNewTrigger, 1000);

        clearInterval(hornyTimeout);
        hornyTimeout = setInterval(HypnoHorny, triggerTimer / 100);
    }

    function SetEyes() {
        Player.LittleSera.existingEye1Name = InventoryGet(Player, "Eyes").Asset.Name;
        Player.LittleSera.existingEye1Color = InventoryGet(Player, "Eyes").Color;
        Player.LittleSera.existingEye2Name = InventoryGet(Player, "Eyes2").Asset.Name;
        Player.LittleSera.existingEye2Color = InventoryGet(Player, "Eyes2").Color;
        settingsSave();
        EnforceEyes();
    }

    function EnforceEyes() {
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes9");
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes9");

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        eyes1.Asset = eyeAsset1;
        eyes1.Color = "#A2A2A2";
        
        eyes2.Asset = eyeAsset2;
        eyes2.Color = "#A2A2A2";

        ChatRoomCharacterUpdate(Player);
    }

    function ResetEyes() {
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", Player.LittleSera.existingEye1Name);
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", Player.LittleSera.existingEye2Name);

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        eyes1.Asset = eyeAsset1;
        eyes1.Color = Player.LittleSera.existingEye1Color;
        
        eyes2.Asset = eyeAsset2;
        eyes2.Color = Player.LittleSera.existingEye2Color;

        ChatRoomCharacterUpdate(Player);

        Player.LittleSera.existingEye1Name = null;
        Player.LittleSera.existingEye1Color = null;
        Player.LittleSera.existingEye2Name = null;
        Player.LittleSera.existingEye2Color = null;
        settingsSave();
    }

    function TriggerRestoreBoop() {
        SendAction("%NAME% reboots, blinking and gasping as she regains her senses.");
        TriggerRestore();
    }

    function TriggerRestoreSnap() {
        SendAction("%NAME% blinks, shaking her head with confusion as she regains her senses.");
        TriggerRestore();
    }

    function TriggerRestoreTimeout() {
        SendAction("%NAME% gasps, blinking with confusion and blushing.");
        TriggerRestore();
    }

    function TriggerRestore() {
        ResetEyes();
        AudioPlaySoundEffect("SpankSkin");
        CharacterSetFacialExpression(Player, "Eyes", "None");
        clearInterval(hornyTimeout);
        clearTimeout(triggerTimeout);
        triggerActivated = false;
    }

    function HypnoHorny() {
        if (triggerActivated) {
            // enforce eye expression
            EnforceEyes();
            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");

            var progress = Math.min(99, Player.ArousalSettings.Progress + 5);
            Player.BCT.splitOrgasmArousal.arousalProgress = Math.min(Player.BCT.splitOrgasmArousal.arousalProgress + 10, 100);
            BCT_API?.ActivityChatRoomBCTArousalSync(Player);
            ActivitySetArousal(Player, progress);
        }
    }

    function CheckNewTrigger() {
        if (triggerActivated)
            return;
        if (Player.LittleSera.activatedAt > 0 && new Date().getTime() - Player.LittleSera.activatedAt > lingerTimer)
            RollTriggerWord();
    }

    function RollTriggerWord() {

        SendAction("%NAME% concentrates, breaking the hold the previous trigger word held over her.");
        Player.LittleSera.trigger = commonWords[getRandomInt(commonWords.length)];
        Player.LittleSera.activatedAt = 0;
        settingsSave();
    }
})();


// Trigger Words
const commonWords = [
    "able",
    "about",
    "absolute",
    "accept",
    "account",
    "achieve",
    "across",
    "act",
    "active",
    "actual",
    "add",
    "address",
    "admit",
    "advertise",
    "affect",
    "afford",
    "after",
    "afternoon",
    "again",
    "against",
    "age",
    "agent",
    "ago",
    "agree",
    "air",
    "all",
    "allow",
    "almost",
    "along",
    "already",
    "alright",
    "although",
    "always",
    "america",
    "amount",
    "another",
    "answer",
    "apart",
    "apparent",
    "appear",
    "apply",
    "appoint",
    "approach",
    "appropriate",
    "area",
    "argue",
    "arm",
    "around",
    "arrange",
    "art",
    "ask",
    "associate",
    "assume",
    "attend",
    "authority",
    "available",
    "aware",
    "away",
    "awful",
    "baby",
    "back",
    "bad",
    "bag",
    "balance",
    "ball",
    "bank",
    "bar",
    "base",
    "basis",
    "bear",
    "beat",
    "beauty",
    "because",
    "become",
    "bed",
    "before",
    "begin",
    "behind",
    "believe",
    "benefit",
    "best",
    "bet",
    "between",
    "big",
    "bill",
    "birth",
    "bit",
    "black",
    "bloke",
    "blood",
    "blow",
    "blue",
    "board",
    "boat",
    "body",
    "book",
    "both",
    "bother",
    "bottle",
    "bottom",
    "box",
    "boy",
    "break",
    "brief",
    "brilliant",
    "bring",
    "britain",
    "brother",
    "budget",
    "build",
    "bus",
    "business",
    "busy",
    "buy",
    "cake",
    "call",
    "car",
    "card",
    "care",
    "carry",
    "case",
    "cat",
    "catch",
    "cause",
    "cent",
    "centre",
    "certain",
    "chair",
    "chairman",
    "chance",
    "change",
    "chap",
    "character",
    "charge",
    "cheap",
    "check",
    "child",
    "choice",
    "choose",
    "church",
    "city",
    "claim",
    "class",
    "clean",
    "clear",
    "client",
    "clock",
    "close",
    "closes",
    "clothe",
    "club",
    "coffee",
    "cold",
    "colleague",
    "collect",
    "college",
    "colour",
    "come",
    "comment",
    "commit",
    "committee",
    "common",
    "community",
    "company",
    "compare",
    "complete",
    "compute",
    "concern",
    "condition",
    "confer",
    "consider",
    "consult",
    "contact",
    "continue",
    "contract",
    "control",
    "converse",
    "cook",
    "copy",
    "corner",
    "correct",
    "cost",
    "could",
    "council",
    "count",
    "country",
    "county",
    "couple",
    "course",
    "court",
    "cover",
    "create",
    "cross",
    "cup",
    "current",
    "cut",
    "dad",
    "danger",
    "date",
    "day",
    "dead",
    "deal",
    "dear",
    "debate",
    "decide",
    "decision",
    "deep",
    "definite",
    "degree",
    "department",
    "depend",
    "describe",
    "design",
    "detail",
    "develop",
    "die",
    "difference",
    "difficult",
    "dinner",
    "direct",
    "discuss",
    "district",
    "divide",
    "doctor",
    "document",
    "dog",
    "door",
    "double",
    "doubt",
    "down",
    "draw",
    "dress",
    "drink",
    "drive",
    "drop",
    "dry",
    "due",
    "during",
    "each",
    "early",
    "east",
    "easy",
    "eat",
    "economy",
    "educate",
    "effect",
    "egg",
    "eight",
    "either",
    "elect",
    "electric",
    "eleven",
    "else",
    "employ",
    "encourage",
    "end",
    "engine",
    "english",
    "enjoy",
    "enough",
    "enter",
    "environment",
    "equal",
    "especial",
    "europe",
    "even",
    "evening",
    "ever",
    "every",
    "evidence",
    "exact",
    "example",
    "except",
    "excuse",
    "exercise",
    "exist",
    "expect",
    "expense",
    "experience",
    "explain",
    "express",
    "extra",
    "eye",
    "face",
    "fact",
    "fair",
    "fall",
    "family",
    "far",
    "farm",
    "fast",
    "father",
    "favour",
    "feed",
    "feel",
    "few",
    "field",
    "fight",
    "figure",
    "file",
    "fill",
    "film",
    "final",
    "finance",
    "find",
    "fine",
    "finish",
    "fire",
    "first",
    "fish",
    "fit",
    "five",
    "flat",
    "floor",
    "fly",
    "follow",
    "food",
    "foot",
    "force",
    "forget",
    "form",
    "fortune",
    "forward",
    "four",
    "france",
    "free",
    "friday",
    "friend",
    "from",
    "front",
    "full",
    "fun",
    "function",
    "fund",
    "further",
    "future",
    "game",
    "garden",
    "gas",
    "general",
    "germany",
    "girl",
    "give",
    "glass",
    "good",
    "goodbye",
    "govern",
    "grand",
    "grant",
    "great",
    "green",
    "ground",
    "group",
    "grow",
    "guess",
    "guy",
    "hair",
    "half",
    "hall",
    "hand",
    "hang",
    "happen",
    "happy",
    "hard",
    "hate",
    "have",
    "head",
    "health",
    "hear",
    "heart",
    "heat",
    "heavy",
    "hell",
    "help",
    "here",
    "high",
    "history",
    "hit",
    "hold",
    "holiday",
    "home",
    "honest",
    "hope",
    "horse",
    "hospital",
    "hot",
    "hour",
    "house",
    "however",
    "hullo",
    "hundred",
    "husband",
    "idea",
    "identify",
    "imagine",
    "important",
    "improve",
    "include",
    "income",
    "increase",
    "indeed",
    "individual",
    "industry",
    "inform",
    "inside",
    "instead",
    "insure",
    "interest",
    "into",
    "introduce",
    "invest",
    "involve",
    "issue",
    "item",
    "job",
    "join",
    "judge",
    "jump",
    "just",
    "keep",
    "key",
    "kid",
    "kill",
    "kind",
    "king",
    "kitchen",
    "knock",
    "know",
    "labour",
    "lad",
    "lady",
    "land",
    "language",
    "large",
    "last",
    "late",
    "laugh",
    "law",
    "lay",
    "lead",
    "learn",
    "leave",
    "left",
    "leg",
    "less",
    "letter",
    "level",
    "lie",
    "life",
    "light",
    "like",
    "likely",
    "limit",
    "line",
    "link",
    "list",
    "listen",
    "little",
    "live",
    "load",
    "local",
    "lock",
    "london",
    "long",
    "look",
    "lord",
    "lose",
    "lot",
    "love",
    "low",
    "luck",
    "lunch",
    "machine",
    "main",
    "major",
    "make",
    "man",
    "manage",
    "many",
    "mark",
    "market",
    "marry",
    "match",
    "matter",
    "may",
    "mean",
    "meaning",
    "measure",
    "meet",
    "member",
    "mention",
    "middle",
    "might",
    "mile",
    "milk",
    "million",
    "mind",
    "minister",
    "minus",
    "minute",
    "miss",
    "mister",
    "moment",
    "monday",
    "money",
    "month",
    "more",
    "morning",
    "most",
    "mother",
    "motion",
    "move",
    "much",
    "music",
    "must",
    "name",
    "nation",
    "nature",
    "near",
    "necessary",
    "need",
    "never",
    "news",
    "next",
    "nice",
    "night",
    "nine",
    "none",
    "normal",
    "north",
    "not",
    "note",
    "notice",
    "number",
    "obvious",
    "occasion",
    "odd",
    "off",
    "offer",
    "office",
    "often",
    "okay",
    "old",
    "on",
    "once",
    "one",
    "only",
    "open",
    "operate",
    "opportunity",
    "oppose",
    "order",
    "organize",
    "original",
    "other",
    "otherwise",
    "ought",
    "out",
    "over",
    "own",
    "pack",
    "page",
    "paint",
    "pair",
    "paper",
    "paragraph",
    "pardon",
    "parent",
    "park",
    "part",
    "particular",
    "party",
    "pass",
    "past",
    "pay",
    "pence",
    "pension",
    "people",
    "percent",
    "perfect",
    "perhaps",
    "period",
    "person",
    "photograph",
    "pick",
    "picture",
    "piece",
    "place",
    "plan",
    "play",
    "please",
    "plus",
    "point",
    "police",
    "policy",
    "politic",
    "poor",
    "position",
    "positive",
    "possible",
    "post",
    "pound",
    "power",
    "practise",
    "prepare",
    "present",
    "press",
    "pressure",
    "presume",
    "pretty",
    "previous",
    "price",
    "print",
    "private",
    "probable",
    "problem",
    "proceed",
    "process",
    "produce",
    "product",
    "programme",
    "project",
    "proper",
    "propose",
    "protect",
    "provide",
    "public",
    "pull",
    "purpose",
    "push",
    "quality",
    "quarter",
    "question",
    "quick",
    "quid",
    "quiet",
    "quite",
    "radio",
    "rail",
    "raise",
    "range",
    "rate",
    "rather",
    "read",
    "ready",
    "real",
    "realise",
    "really",
    "reason",
    "receive",
    "recent",
    "reckon",
    "recognize",
    "recommend",
    "record",
    "red",
    "reduce",
    "refer",
    "regard",
    "region",
    "relation",
    "remember",
    "report",
    "represent",
    "require",
    "research",
    "resource",
    "respect",
    "responsible",
    "rest",
    "result",
    "return",
    "right",
    "ring",
    "rise",
    "road",
    "role",
    "roll",
    "room",
    "round",
    "rule",
    "run",
    "safe",
    "sale",
    "same",
    "saturday",
    "save",
    "say",
    "scheme",
    "school",
    "science",
    "score",
    "scotland",
    "seat",
    "second",
    "secretary",
    "section",
    "secure",
    "see",
    "seem",
    "self",
    "sell",
    "send",
    "sense",
    "separate",
    "serious",
    "serve",
    "service",
    "set",
    "settle",
    "seven",
    "sex",
    "shall",
    "share",
    "she",
    "sheet",
    "shoe",
    "shoot",
    "shop",
    "short",
    "should",
    "show",
    "shut",
    "sick",
    "side",
    "sign",
    "similar",
    "simple",
    "since",
    "sing",
    "single",
    "sir",
    "sister",
    "sit",
    "site",
    "situate",
    "six",
    "size",
    "sleep",
    "slight",
    "slow",
    "small",
    "smoke",
    "social",
    "society",
    "some",
    "son",
    "soon",
    "sorry",
    "sort",
    "sound",
    "south",
    "space",
    "speak",
    "special",
    "specific",
    "speed",
    "spell",
    "spend",
    "square",
    "staff",
    "stage",
    "stairs",
    "stand",
    "standard",
    "start",
    "state",
    "station",
    "stay",
    "step",
    "stick",
    "still",
    "stop",
    "story",
    "straight",
    "strategy",
    "street",
    "strike",
    "strong",
    "structure",
    "student",
    "study",
    "stuff",
    "stupid",
    "subject",
    "succeed",
    "such",
    "sudden",
    "suggest",
    "suit",
    "summer",
    "sun",
    "sunday",
    "supply",
    "support",
    "suppose",
    "sure",
    "surprise",
    "switch",
    "system",
    "table",
    "take",
    "talk",
    "tape",
    "tax",
    "tea",
    "teach",
    "team",
    "telephone",
    "television",
    "tell",
    "ten",
    "tend",
    "term",
    "terrible",
    "test",
    "than",
    "thank",
    "the",
    "then",
    "there",
    "therefore",
    "they",
    "thing",
    "think",
    "thirteen",
    "thirty",
    "this",
    "thou",
    "though",
    "thousand",
    "three",
    "through",
    "throw",
    "thursday",
    "tie",
    "time",
    "today",
    "together",
    "tomorrow",
    "tonight",
    "too",
    "top",
    "total",
    "touch",
    "toward",
    "town",
    "trade",
    "traffic",
    "train",
    "transport",
    "travel",
    "treat",
    "tree",
    "trouble",
    "true",
    "trust",
    "try",
    "tuesday",
    "turn",
    "twelve",
    "twenty",
    "two",
    "type",
    "under",
    "understand",
    "union",
    "unit",
    "unite",
    "university",
    "unless",
    "until",
    "up",
    "upon",
    "use",
    "usual",
    "value",
    "various",
    "very",
    "video",
    "view",
    "village",
    "visit",
    "vote",
    "wage",
    "wait",
    "walk",
    "wall",
    "want",
    "war",
    "warm",
    "wash",
    "waste",
    "watch",
    "water",
    "way",
    "we",
    "wear",
    "wednesday",
    "week",
    "weigh",
    "welcome",
    "well",
    "west",
    "what",
    "when",
    "where",
    "whether",
    "which",
    "while",
    "white",
    "who",
    "whole",
    "why",
    "wide",
    "wife",
    "will",
    "win",
    "wind",
    "window",
    "wish",
    "with",
    "within",
    "without",
    "woman",
    "wonder",
    "wood",
    "word",
    "work",
    "world",
    "worry",
    "worse",
    "worth",
    "would",
    "write",
    "wrong",
    "year",
    "yes",
    "yesterday",
    "yet",
    "you",
    "young"
  ];
