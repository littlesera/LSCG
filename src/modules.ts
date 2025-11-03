import { OutfitMigrator } from "Modules/Migrators/OutfitMigrator";
import { ActivityModule } from "Modules/activities";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { ActivityEntryModel } from "Settings/Models/activities";
import { OutfitCollection } from "Settings/OutfitCollection/outfitCollection";
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

export function Core(): CoreModule {
	return getModule<CoreModule>("CoreModule");
}

export function Activities(): ActivityModule {
	return getModule<ActivityModule>("ActivityModule");
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

export function SedativeKeywords(): string[] {
	return getModule<InjectorModule>("InjectorModule")?.settings.sedativeKeywords;
}

export function HornyKeywords(): string[] {
	return getModule<InjectorModule>("InjectorModule")?.settings.hornyKeywords;
}

export function MindControlKeywords(): string[] {
	return getModule<InjectorModule>("InjectorModule")?.settings.mindControlKeywords;
}

export function CureKeywords(): string[] {
	return getModule<InjectorModule>("InjectorModule")?.settings.cureKeywords;
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

export function CheckVersionUpdate() {
	getModule<CoreModule>("CoreModule")?.CheckVersionUpdate();
}

export function Outfits(): OutfitCollection {
	return getModule<OutfitCollectionModule>("OutfitCollectionModule").data;
}

export function TestOutfitMigration() {
	new OutfitMigrator().Migrate("");
}