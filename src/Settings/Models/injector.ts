import { BaseSettingsModel, ModuleStats } from "./base";
import type { BuiltInDrugId } from "Modules/drugs/builtin";

export interface DrugSpecificSettingsModel {
    weakKeywords: string[];
    strongKeywords: string[];
}

export interface InjectorModuleStats extends ModuleStats {
    forcedOrgasmCount: number;
    sedatedCount: number;
    brainwashedCount: number;
    curedCount: number;
}

/** One extension drug's level bar, as published to other players. */
export interface ExtensionDrugBar {
    id: string;
    level: number;
    max: number;
    color: string;
    /** Level units lost per second, so other clients can animate the bar between syncs. Optional: older clients omit it. */
    decayPerSec?: number;
}

export interface InjectorSettingsModel extends InjectorPublicSettingsModel {
    //immersive: boolean;
    enableSedative: boolean;
    enableMindControl: boolean;
    enableHorny: boolean;
    enableSuggestible: boolean;
    sedativeKeywords: string[];
    mindControlKeywords: string[];
    hornyKeywords: string[];
    suggestibleKeywords: string[];
    cureKeywords: string[];
    hornyTickTime: number;
    heartbeat: boolean;
    sedativeCooldown: number;
    mindControlCooldown: number;
    hornyCooldown: number;
    suggestibleCooldown: number;
    showDrugLevels: boolean;
    enableContinuousDelivery: boolean;
    continuousDeliveryActivatedAt: number;
    continuousDeliveryTimeout: number;
    continuousDeliveryForever: boolean;
    /** Allow mouth/nose/face items crafted as "<drug>-soaked" to dose the wearer. */
    /** Visual effects of the drugs: the suggestible sway and the hypno spiral. */
    enableDrugVisuals: boolean;
    /** The swaying, warped screen of the suggestible (the tint and blur follow the drug visuals and BC preferences). */
    enableSuggestibleWave: boolean;
    /** The flavor emotes of breathed gases and soaked items (the doses still land without them). */
    enableDrugEmotes: boolean;
    /** Show the emotes only to the player instead of saying them to the room. */
    drugEmotesLocal: boolean;
    /** Least minutes between breathed-drug emotes (0 for no limit). */
    drugEmoteMinutes: number;
    /** How strong each breath from a gas is, in percent (100 = standard). */
    gasStrength: number;
    /** How strong each breath from a soaked item is, in percent of a standard gas dose. */
    soakedStrength: number;
    enableSoakedItems: boolean;
    /** How long (ms) a soaked item stays potent once worn. */
    soakedPotencyTime: number;
    /** Soaked items never dry out while worn. */
    infiniteSoakPotency: boolean;
    /** When each worn soaked item was first seen, by "group:name:crafter" key. */
    soakedAt: Record<string, number>;
    stats: InjectorModuleStats;
    sipLimit: number;
    /** Extension drugs the player has opted in to (like enableSedative, but per drug). */
    enabledExtensionDrugs: string[];
    /** Current level of each extension drug, by id. */
    extensionDrugLevels: Record<string, number>;
    /** The player's values for each extension drug's declared options, by drug id then option key. Checked against the drug's fields when read. */
    extensionDrugOptions?: Record<string, Record<string, unknown>>;
    /** Player overrides of the built-in drugs' decay: minutes for one dose to wear off. Missing means LSCG's default. */
    decayMinutes?: Partial<Record<BuiltInDrugId, number>>;
}

export interface InjectorPublicSettingsModel extends BaseSettingsModel {
    //asleep: boolean;
    //brainwashed: boolean;
    sedativeLevel: number;
    mindControlLevel: number;
    hornyLevel: number;
    suggestibleLevel: number;
    drugLevelMultiplier: number;
    sedativeMax: number;
    mindControlMax: number;
    hornyLevelMax: number;
    suggestibleMax: number;
    /** Extension drug bars. Filled at sync time from the registry and levels, never persisted. */
    drugLevels?: ExtensionDrugBar[];
    /** Each built-in drug's decay in level units per second, so other clients can animate the bar between syncs.
     *  Filled at sync time, never persisted. */
    drugDecay?: Partial<Record<BuiltInDrugId, number>>;
    /** Set by the receiving client when this packet arrived (not sent): the time the levels above were current. */
    receivedAt?: number;
}