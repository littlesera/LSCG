import { h } from "tsx-dom";
import { CleanDefaultsFromSettings, ExportSettings, GetDataSizeReport, hookFunction, ICONS, ImportSettings, isObject, parseFromBase64, parseFromUTF16, sendLSCGBeep, settingsSave } from './utils';
import { CheckVersionUpdate, ConfiguredActivities, CraftableItemSpellNames, DrugKeywords, getModule, HypnoTriggers, modules, NetgunKeywords, Outfits, registerModule, TestOutfitMigration } from 'modules';
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
import { StateModule } from 'Modules/states';
import { MagicModule } from 'Modules/magic';
import { CursedItemModule } from 'Modules/cursed-outfit';
import { OpacityModule } from 'Modules/opacity';
import { lt } from 'semver';
import { LeashingModule } from 'Modules/leashing';
import { ChaoticItemModule } from './Modules/chaotic-item';
import { SplatterModule } from 'Modules/splatter';
import { OutfitCollectionModule } from 'Modules/outfitCollection';

import styles from "./main.scss";

export { 
	DrugKeywords, 
	NetgunKeywords, 
	CraftableItemSpellNames, 
	HypnoTriggers, 
	ConfiguredActivities, 
	GetDataSizeReport,
	CleanDefaultsFromSettings,
	ExportSettings,
	ImportSettings,
	getModule,
	sendLSCGBeep,
	CheckVersionUpdate,
	TestOutfitMigration,
	Outfits
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
	
	// clear any old settings.
	if (!!(Player.OnlineSettings as any)?.LittleSera)
		delete (Player.OnlineSettings as any).LittleSera;
	if (!!(Player.OnlineSettings as any)?.ClubGames)
		delete (Player.OnlineSettings as any).ClubGames;

	let settings = Player.ExtensionSettings?.LSCG ?? Player.OnlineSettings?.LSCG ?? "";
	let localSettings = localStorage.getItem(`LSCG_${Player.MemberNumber}_Backup`) ?? "";
	
	// If localStorage setting backup exist, compare the versions to restore from backup
	if (!!localSettings) {
		let localIsMoreRecent = false;
		try {
			let settingsVer = parseFromBase64<SettingsModel>(settings)?.Version || "v0.0.0";
			let localSettingsVer = parseFromBase64<SettingsModel>(localSettings)?.Version || "v0.0.0";
			localIsMoreRecent = lt(settingsVer, localSettingsVer);
		} catch (error) {
			console.debug(`LSCG: Failed to compare local and remote setting versions -- ${error}`);
		}

		if (!settings || localIsMoreRecent)
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
		Player.LSCG = parsed || {} as SettingsModel;
		// Clean old settings
		if (!!Player.OnlineSettings?.LSCG) {
			delete (Player.OnlineSettings as any).LSCG;
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
	document.body.appendChild(<style id="lscg-style">{styles.toString()}</style>);
	console.log(`LSCG loaded! Version: ${LSCG_VERSION}`);
}

function init_modules(): boolean {
	registerModule(new CoreModule());
	registerModule(new OpacityModule());
	registerModule(new GUI());
	registerModule(new OutfitCollectionModule());
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
	registerModule(new CursedItemModule());

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