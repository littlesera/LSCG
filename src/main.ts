import { bcModSDK, hookFunction, isObject, settingsSave, VERSION } from './utils';
import { init_modules, unload_modules } from 'modules';
import './modules';
import { getCurrentSubscreen, setSubscreen } from 'Settings/settingUtils';
import { MainMenu } from 'Settings/mainmenu';

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
	} else {
		console.debug("LSCG: Already logged in, init");
		init();
	}
}

export function loginInit(C: any) {
	if (window.LSCG_Loaded)
		return;
	init();
}

export function initSettings() {
	PreferenceSubscreenList.push("LSCGSettings");
	bcModSDK.hookFunction("TextGet", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[0] == "HomepageLSCGSettings") return "Club Games Settings";
		return next(args);
	});
	bcModSDK.hookFunction("DrawButton", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[6] == "Icons/LSCGSettings.png") args[6] = "Icons/Asylum.png";
		return next(args);
	});
	bcModSDK.hookFunction("PreferenceClick", 2, (args, next) => {
		console.info(args);
		return next(args);
	});
	(<any>window).PreferenceSubscreenLSCGSettingsLoad = function() {
		setSubscreen(new MainMenu(Player));
	};
}

export function init() {
	if (window.LSCG_Loaded)
		return;
	
		// clear any old settings.
	if (!!(<any>Player.OnlineSettings)?.LittleSera)
		delete (<any>Player.OnlineSettings).LittleSera;

    Player.ClubGames = Player.OnlineSettings.ClubGames || {};
	settingsSave();

	initSettings();

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

export function unload(): true {
	unload_modules();

	delete window.LSCG_Loaded;
	console.log("LSCG: Unloaded.");
	return true;
}

initWait();