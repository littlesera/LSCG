import { BaseModule } from "base";

export const modulesMap: Map<string, BaseModule> = new Map<string, BaseModule>();

export function modules(): BaseModule[] {
	return [...modulesMap.values()];
}

export function registerModule<T extends BaseModule>(module: T): T {
	modulesMap.set(module.constructor.name, module);
	return module;
}

export function getModule<T extends BaseModule>(moduleType: string): T {
	return modulesMap.get(moduleType) as T;
}