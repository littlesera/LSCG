import bcModSDKRef from "bondage-club-mod-sdk";

export const bcModSDK = bcModSDKRef.registerMod({
	name: "CG",
	fullName: "Club Games",
	version: "0.0.1",
	repository: "https://github.com/littlesera/sera"
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

export function OnChat(priority: any, callback: (data: any, sender: PlayerCharacter, msg: string, metadata: any) => void) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Chat")
            callback(data, args[1], args[2], args[3]);
    });
}

export function OnAction(priority: any, callback: (data: any, sender: PlayerCharacter, msg: string, metadata: any) => void) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Action" || data.Type == "Emote")
            callback(data, args[1], args[2], args[3]);
    });
}

export function OnActivity(priority: any, callback: (data: any, sender: PlayerCharacter, msg: string, metadata: any) => void) {
    bcModSDK.hookFunction("ChatRoomMessage", priority, (args, next) => {
        var data = args[0];
        if (data.Type == "Activity")
            callback(data, args[1], args[2], args[3]);
    });
}

export function SendAction(action: string, senderName: string = '') {
    ServerSend("ChatRoomChat", {Content: "Beep", Type: "Action", Dictionary: [{Tag: "Beep", Text: replace_template(action, senderName)}]});
}

export function SendChat(msg: string) {
    ServerSend("ChatRoomChat", {Type: "Chat", Content: msg})
}

export function replace_template(text: string, source_name = '') {
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

export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function settingsSave() {
    Player.OnlineSettings.ClubGames = Player.ClubGames
    window.ServerAccountUpdate.QueueData({OnlineSettings: Player.OnlineSettings})
}

await waitFor(() => ServerSocket && ServerIsConnected);	
await waitFor(() => !!Player?.AccountName);
Player.ClubGames = Player.OnlineSettings.ClubGames || {};