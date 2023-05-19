/**
 * Tags that are deleted on ng++
 * @type {string[]}
 */
declare let KDResertNGTags: string[];
/**
 * @type {Record<string, {name: string, tags: string[], singletag: string[], chance: number, items?: string[]}>}
 */
declare let KDShops: Record<string, {
    name: string;
    tags: string[];
    singletag: string[];
    chance: number;
    items?: string[];
}>;
/**
 * @type {Record<string, {name: string, outfit: string, tags: string[], singletag: string[], excludeTags: string[], chance: number}>}
 */
declare let KDRecruitDialog: Record<string, {
    name: string;
    outfit: string;
    tags: string[];
    singletag: string[];
    excludeTags: string[];
    chance: number;
}>;
/**
 * @type {Record<string, {name: string, tags: string[], singletag: string[], excludeTags: string[], weight: number}>}
 */
declare let KDAllyDialog: Record<string, {
    name: string;
    tags: string[];
    singletag: string[];
    excludeTags: string[];
    weight: number;
}>;
declare let KDSleepBedPercentage: number;
/** @type {Record<string, KinkyDialogue>} */
declare let KDDialogue: Record<string, KinkyDialogue>;
