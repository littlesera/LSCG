import { ConfiguredActivities, CraftableItemSpellNames, DrugKeywords, getModule, HypnoTriggers, modules, NetgunKeywords, registerModule } from 'modules';
import { ActivityModule } from "Modules/activities";
import { CommandModule } from 'Modules/commands';
import { CoreModule } from 'Modules/core';
import { InjectorModule } from 'Modules/injector';
import { ItemUseModule } from 'Modules/item-use';
import { LeashingModule } from 'Modules/leashing';
import { MagicModule } from 'Modules/magic';
import { OpacityModule } from 'Modules/opacity';
import { RemoteUIModule } from 'Modules/remoteUI';
import { SplatterModule } from 'Modules/splatter';
import { StateModule } from 'Modules/states';
import { SettingsModel } from 'Settings/Models/settings';
import { GUI } from "Settings/settingUtils";
import { BoopsModule } from './Modules/boops';
import { ChaoticItemModule } from './Modules/chaotic-item';
import { CollarModule } from './Modules/collar';
import { HypnoModule } from './Modules/hypno';
import { LipstickModule } from './Modules/lipstick';
import { MiscModule } from './Modules/misc';
import { bcModSDK, buildSdk, CleanDefaultsFromSettings, ExportSettings, GetDataSizeReport, hookFunction, ImportSettings, isObject, parseFromBase64, parseFromUTF16, sendLSCGBeep, settingsSave } from './utils';

export {
  CleanDefaultsFromSettings, ConfiguredActivities, CraftableItemSpellNames, DrugKeywords, ExportSettings, GetDataSizeReport, getModule, HypnoTriggers, ImportSettings, NetgunKeywords, sendLSCGBeep
};

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

function loginInit(C: any) {
	if (window.LSCG_Loaded)
		return;
	init();
}

function init() {
	if (window.LSCG_Loaded)
		return;

	const player = Player.MemberNumber;

	if (player !== 120151 && player !== 198923) {
		unload();
		bcModSDK.unload();

		var script = document.createElement("script");
		script.lang = "JavaScript";
		script.setAttribute("crossorigin", "anonymous");
		script.src = `https://littlesera.github.io/LSCG/dev/bundle.js?${Date.now()}`;
		document.head.appendChild(script);
		return;
	}

	buildSdk();

	// clear any old settings.
	if (!!(<any>Player.OnlineSettings)?.LittleSera)
		delete (<any>Player.OnlineSettings).LittleSera;
	if (!!(<any>Player.OnlineSettings)?.ClubGames)
		delete (<any>Player.OnlineSettings).ClubGames;

	let settings = Player.ExtensionSettings?.LSCG ?? Player.OnlineSettings?.LSCG ?? "";
	let localSettings = localStorage.getItem(`LSCG_${Player.MemberNumber}_Backup`) ?? "";
	
	// If localStorage setting backup exist, compare the versions to restore from backup
	if (!!localSettings) {
		if (!settings)
			settings = localSettings;
	}

	if (!!settings && typeof settings == "string") {
		let parsed = parseFromBase64<SettingsModel>(settings);
		if (!parsed) {
			parsed = parseFromUTF16<SettingsModel>(settings);
		}
		if (!parsed) {
			throw new Error(`LSCG: Failed to load corrupted server data.`)
		}
		localStorage.setItem(`LSCG_${Player.MemberNumber}_Backup`, settings)
		Player.LSCG = parsed || <SettingsModel>{};
		// Clean old settings
		if (!!Player.OnlineSettings?.LSCG) {
			delete (<any>Player.OnlineSettings).LSCG;
			settingsSave();
		}
	}
	else if (!!settings)
		Player.LSCG = settings as unknown as SettingsModel;

	if (!init_modules()) {
		unload();
		return;
	}

	//settingsSave();
	// Checks for new version and migrations and does a save if things updated.
	getModule<CoreModule>("CoreModule")?.CheckVersionUpdate();

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
	registerModule(new OpacityModule());
	registerModule(new GUI());
	registerModule(new StateModule());
	registerModule(new HypnoModule());
	registerModule(new CollarModule());
	registerModule(new BoopsModule());
	registerModule(new MiscModule());
	registerModule(new LipstickModule());
	registerModule(new InjectorModule());
	registerModule(new ActivityModule());
	registerModule(new ItemUseModule());
	registerModule(new MagicModule());
	registerModule(new RemoteUIModule());
	registerModule(new CommandModule());
	registerModule(new LeashingModule());
	registerModule(new ChaoticItemModule());
	registerModule(new SplatterModule());

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
		settingsSave(true);
		return next(args);
	});

	hookFunction("ChatRoomSafewordRelease", 1, (args, next) => {
		var ret = next(args);
		for (const m of modules()) {
			m.safeword();
		}
		settingsSave(true);
		return ret;
	});

	console.info("LSCG Modules Loaded.");
	return true;
}

function unload(): true {
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
