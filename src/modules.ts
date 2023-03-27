import { BaseModule } from "base";
import { HypnoModule } from './Modules/hypno';
import { CollarModule } from './Modules/collar';
import { BoopsModule } from './Modules/boops';
import { MiscModule } from './Modules/misc';
import { LipstickModule } from './Modules/lipstick';
import { GUI } from "Settings/settingUtils";

const modules: BaseModule[] = [];

export function registerModule<T extends BaseModule>(module: T): T {
	modules.push(module);
	return module;
}

export function init_modules(): boolean {
	registerModule(new GUI());
	registerModule(new HypnoModule());
	registerModule(new CollarModule());
	registerModule(new BoopsModule());
	registerModule(new MiscModule());
	registerModule(new LipstickModule());

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

export function unload_modules() {
	for (const m of modules) {
		m.unload();
	}
}