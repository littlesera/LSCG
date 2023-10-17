import { ActivityModule } from "Modules/activities";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { ActivityEntryModel } from "Settings/Models/activities";
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

export function DrugKeywords(): string[] {
	let settings = getModule<InjectorModule>("InjectorModule")?.settings;
	if (!settings)
		return [];
	return settings?.hornyKeywords.concat(settings?.sedativeKeywords).concat(settings?.mindControlKeywords).concat(settings?.cureKeywords);
}

export function NetgunKeywords(): string[] {
	return getModule<InjectorModule>("InjectorModule")?.settings.netgunKeywords;
}

export function CraftableItemSpellNames(): string[] {
	return getModule<MagicModule>("MagicModule")?.settings.knownSpells.filter(s => s.AllowPotion).map(s => s.Name) ?? [];
}

export function HypnoTriggers(): string[] {
	return getModule<HypnoModule>("HypnoModule")?.triggers;
}

export function ConfiguredActivities(): ActivityEntryModel[] {
	return getModule<ActivityModule>("ActivityModule")?.settings.activities;
}