import { hookFunction, ICONS, isObject, settingsSave } from './utils';
import { modules, registerModule } from 'modules';
import { SettingsModel } from 'Settings/Models/settings';
import { HypnoModule } from './Modules/hypno';
import { CollarModule } from './Modules/collar';
import { BoopsModule } from './Modules/boops';
import { MiscModule } from './Modules/misc';
import { LipstickModule } from './Modules/lipstick';
import { GUI } from "Settings/settingUtils";
import { ActivityModule } from "Modules/activities";
import { InjectorModule } from 'Modules/injector';
import { CoreModule } from 'Modules/core';
import { RemoteUIModule } from 'Modules/remoteUI';
import { CommandModule } from 'Modules/commands';
import { ItemUseModule } from 'Modules/item-use';

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

export function initSettingsScreen() {
	PreferenceSubscreenList.push("LSCGMainMenu");
	hookFunction("TextGet", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[0] == "HomepageLSCGMainMenu") return "LSCG Settings";
		return next(args);
	});
	hookFunction("DrawButton", 2, (args: string[], next: (arg0: any) => any) => {
		if (args[6] == "Icons/LSCGMainMenu.png") args[6] = ICONS.BOUND_GIRL;// "Icons/Asylum.png";
		return next(args);
	});
}

export function init() {
	if (window.LSCG_Loaded)
		return;
	
	// clear any old settings.
	if (!!(<any>Player.OnlineSettings)?.LittleSera)
		delete (<any>Player.OnlineSettings).LittleSera;
	if (!!(<any>Player.OnlineSettings)?.ClubGames)
		delete (<any>Player.OnlineSettings).ClubGames;

    Player.LSCG = Player.OnlineSettings?.LSCG || <SettingsModel>{};

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

function init_modules(): boolean {
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

export function unload(): true {
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