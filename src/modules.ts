import { BaseModule } from "base";

const modules: BaseModule[] = [];

export function registerModule<T extends BaseModule>(module: T): T {
	modules.push(module);
	return module;
}

export function init_modules(): boolean {
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

import { HypnoModule } from './Modules/hypno';
import { CollarModule } from './Modules/collar';
import { BoopsModule } from './Modules/boops';
import { MiscModule } from './Modules/misc';
import { LipstickModule } from './Modules/lipstick';

registerModule(new HypnoModule());
registerModule(new CollarModule());
registerModule(new BoopsModule());
registerModule(new MiscModule());
registerModule(new LipstickModule());