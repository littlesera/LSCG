import { BaseModule } from "base";

export const modules: BaseModule[] = [];

export function registerModule<T extends BaseModule>(module: T): T {
	modules.push(module);
	return module;
}

