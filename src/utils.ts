import bcModSDKRef from "bondage-club-mod-sdk";
import { ModuleCategory } from "Settings/setting_definitions";

export const VERSION = "0.0.1";

type PatchHook = (args: any[], next: (args: any[]) => any) => any;
interface IPatchedFunctionData {
	name: string;
	hooks: {
		hook: PatchHook;
		priority: number;
		module: ModuleCategory | null;
		removeCallback: () => void;
	}[];
}

const patchedFunctions: Map<string, IPatchedFunctionData> = new Map();

export const bcModSDK = bcModSDKRef.registerMod({
	name: "LSCG",
	fullName: "Little Sera's Club Games",
	version: "0.0.1",
	repository: "https://github.com/littlesera/LSCG"
});

export function patchFunction(target: string, patches: Record<string, string>): void {
	bcModSDK.patchFunction(target, patches);
}

export function callOriginal(target: string, args: any[]): any {
	return bcModSDK.callOriginal(target, args);
}

//do not touch this
export async function waitFor(func: { (): any; (): boolean; (): any; }, cancelFunc = () => false) {
    while (!func()) {
        if (cancelFunc()) return false;
        await sleep(10);
    }
    return true;
}

export function sleep(ms: number | undefined) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseMsgWords(msg: string): RegExpMatchArray | null {
    var lowerMsg = msg.toLowerCase();
    var lowerMsgWords = lowerMsg.match(/\b(\w+)\b/g);
    return lowerMsgWords;
}

export function getCharacter(memberNumber: number) {
	return ChatRoomCharacter.find(c => c.MemberNumber == memberNumber) ?? null;
}

export function OnChat(priority: any, module: ModuleCategory, callback: (data: any, sender: Character | null, msg: string, metadata: any) => void) {
    hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
		var sender = getCharacter(data.Sender);
        if (data.Type == "Chat")
            callback(data, sender, data.Content, data.Dictionary);
		next(args);
    }, module);
}

export function OnAction(priority: any, module: ModuleCategory, callback: (data: any, sender: Character | null, msg: string, metadata: any) => void) {
    hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
		var sender = getCharacter(data.Sender);
        if (data.Type == "Action" || data.Type == "Emote")
			callback(data, sender, data.Content, data.Dictionary);
		next(args);
    }, module);
}

export function OnActivity(priority: any, module: ModuleCategory, callback: (data: any, sender: Character | null, msg: string, metadata: any) => void) {
    hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
		var sender = getCharacter(data.Sender);
        if (data.Type == "Activity")
			callback(data, sender, data.Content, data.Dictionary);
		next(args);
    }, module);
}

function initPatchableFunction(target: string): IPatchedFunctionData {
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

export function hookFunction(target: string, priority: number, hook: PatchHook, module: ModuleCategory | null = null): () => void {
	const data = initPatchableFunction(target);

	if (data.hooks.some(h => h.hook === hook)) {
		console.error(`BCX: Duplicate hook for "${target}"`, hook);
		return () => null;
	}

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

export function removeHooksByModule(target: string, module: ModuleCategory): boolean {
	const data = initPatchableFunction(target);

	for (let i = data.hooks.length - 1; i >= 0; i--) {
		if (data.hooks[i].module === module) {
			data.hooks[i].removeCallback();
			data.hooks.splice(i, 1);
		}
	}

	return true;
}

export function removeAllHooksByModule(module: ModuleCategory): boolean {
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

export function SendAction(action: string, sender: Character | null = null) {
    ServerSend("ChatRoomChat", {Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: replace_template(action, sender)}]});
}

export function SendChat(msg: string) {
    ServerSend("ChatRoomChat", {Type: "Chat", Content: msg})
}

export function replace_template(text: string, source: Character | null = null) {
    let result = text;
	let pronounItem = InventoryGet(Player, "Pronouns");
	let posessive = "Her";
	let intensive = "Her"
	let pronoun = "She";
	if (pronounItem?.Asset.Name == "HeHim") {
		posessive = "His";
		intensive = "Him";
		pronoun = "He";
	}

	let oppName = !!source ? CharacterNickname(source) : "";

    result = result.replaceAll("%POSSESSIVE%", posessive.toLocaleLowerCase())
    result = result.replaceAll("%CAP_POSSESSIVE%", posessive)
    result = result.replaceAll("%PRONOUN%", pronoun.toLocaleLowerCase())
    result = result.replaceAll("%CAP_PRONOUN%", pronoun)
    result = result.replaceAll("%INTENSIVE%", intensive.toLocaleLowerCase())
    result = result.replaceAll("%CAP_INTENSIVE%", intensive)
    result = result.replaceAll("%NAME%", CharacterNickname(Player)) //Does this works to print "Lilly"? -- it should, yes
    result = result.replaceAll("%OPP_NAME%", oppName) // finally we can use the source name to make the substitution

    return result
}

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function settingsSave() {
    Player.OnlineSettings.LSCG = Player.LSCG
    window.ServerAccountUpdate.QueueData({OnlineSettings: Player.OnlineSettings})
}

/** Checks if the `obj` is an object (not null, not array) */
export function isObject(obj: unknown): obj is Record<string, any> {
	return !!obj && typeof obj === "object" && !Array.isArray(obj);
}