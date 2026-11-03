import { COOLDOWNS } from "../../constants/timing";
import type { InjectorPublicSettingsModel, InjectorSettingsModel } from "Settings/Models/injector";

/** The settings keys of `T` whose value is a `V`. */
type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

/** LSCG's own level-based drugs. (The antidote is a cure, not a level, so it isn't one.) */
export type BuiltInDrugId = "sedative" | "mindcontrol" | "horny" | "suggestible";

/**
 * What every built-in drug has in common, as data. The injector's generic code (levels, decay, opt-ins, keywords, the bars, the settings
 * page) reads this table, so a new built-in drug is one entry here plus the settings it names and the behavior only it has
 * (what a dose does, what happens at the top or the bottom), rather than a copy of the same code in two dozen places.
 */
export interface BuiltInDrugDef {
    id: BuiltInDrugId;
    /** Name on the settings page and in the crafting menu. */
    label: string;
    /** Settings page help: what it activates for. */
    activatesFor: string;
    /** Level bar colour. */
    color: string;
    /** Milliseconds one dose takes to wear off, unless the player sets their own. The injector's defaults use the same value. */
    defaultCooldown: number;
    /** Settings keys this drug owns. */
    enableKey: KeysOfType<InjectorSettingsModel, boolean>;
    /** Level and max are published to other players, so they live on the public model. */
    levelKey: KeysOfType<InjectorPublicSettingsModel, number>;
    maxKey: KeysOfType<InjectorPublicSettingsModel, number>;
    cooldownKey: KeysOfType<InjectorSettingsModel, number>;
    keywordsKey: KeysOfType<InjectorSettingsModel, string[]>;
    /** Words that read right in front of "-soaked" or "-laced" ("intoxicant-laced"), for drugs whose plain keywords are adjectives. A drug's
     *  plain keywords work there too. */
    soakKeywords: string[];
}

export const BUILT_IN_DRUGS: readonly BuiltInDrugDef[] = [
    {
        id: "sedative", label: "Sedative", color: "#5C5CFF", defaultCooldown: COOLDOWNS.SEDATIVE,
        activatesFor: "Activates for \"sedative\" or \"tranquilizer\".",
        enableKey: "enableSedative", levelKey: "sedativeLevel", maxKey: "sedativeMax", cooldownKey: "sedativeCooldown", keywordsKey: "sedativeKeywords",
        soakKeywords: ["sedative", "tranquilizer", "sleeping drug"],
    }, {
        id: "mindcontrol", label: "Brainwash drug", color: "#A020F0", defaultCooldown: COOLDOWNS.MIND_CONTROL,
        activatesFor: "Activates for \"mind control,\" \"hypnotizing,\" or \"brainwashing\".",
        enableKey: "enableMindControl", levelKey: "mindControlLevel", maxKey: "mindControlMax", cooldownKey: "mindControlCooldown", keywordsKey: "mindControlKeywords",
        soakKeywords: ["mind control", "hypnotic", "brainwashing"],
    }, {
        id: "horny", label: "Aphrodisiac", color: "#FF647F", defaultCooldown: COOLDOWNS.AROUSAL,
        activatesFor: "Activates for \"horny\" or \"aphrodisiac\".",
        enableKey: "enableHorny", levelKey: "hornyLevel", maxKey: "hornyLevelMax", cooldownKey: "hornyCooldown", keywordsKey: "hornyKeywords",
        soakKeywords: ["aphrodisiac", "arousing", "horny"],
    }, {
        id: "suggestible", label: "Suggestible", color: "#4CD964", defaultCooldown: COOLDOWNS.SUGGESTIBLE,
        activatesFor: "Activates for \"suggestible\", \"intoxicating\" or \"compliance\". The higher it is, the more agreeable you become.",
        enableKey: "enableSuggestible", levelKey: "suggestibleLevel", maxKey: "suggestibleMax", cooldownKey: "suggestibleCooldown", keywordsKey: "suggestibleKeywords",
        soakKeywords: ["suggestible", "intoxicant", "compliance"],
    },
];

export function builtInDrug(id: string): BuiltInDrugDef | undefined {
    return BUILT_IN_DRUGS.find(d => d.id === id);
}

export function isBuiltInDrugId(id: string): id is BuiltInDrugId {
    return builtInDrug(id) !== undefined;
}
