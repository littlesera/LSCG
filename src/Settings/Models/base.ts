import type { RemoteAccessLevel } from "utils";
import { OutfitStorageStrategy } from "Settings/OutfitCollection/IOutfitCollection";

export interface BaseSettingsModel {
    enabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the base each module's stats extend
export interface ModuleStats {

}

export interface GlobalSettingsModel extends GlobalPublicSettingsModel {
    edgeBlur: boolean;
    showCheckRolls: boolean;
    blockSettingsWhileRestrained: boolean;
    seeSharedCrafts: boolean;
    hideResizing: boolean;
    erectionDetection: boolean;
    tamperproofEnabled: boolean;
    tamperproofElectricityEnabled: boolean;
}

/** Who may copy your outfit with /lscg get-outfit-code, on top of BC's item permission. */
export type OutfitCopyLevel = "Public" | "Whitelist" | "Nobody";

export interface GlobalPublicSettingsModel extends BaseSettingsModel {
    sharePublicCrafting: boolean;
    blockDOGS: boolean;
    /** Older versions don't send it: treat that as "Public". */
    outfitCopy?: OutfitCopyLevel;

    // Who may get in, used by every section that has "use global defaults" on (hypno, collar, magic, speech analysis). Whether a
    // section allows remote access at all, whether it is lockable, and its trance rules stay each section's own.
    remoteLevel: RemoteAccessLevel;
    remoteMemberIds: string;
}

export interface LipstickSettingsModel extends BaseSettingsModel {
    dry: boolean;
}

export interface SplatterSettingsModel extends BaseSettingsModel {
    giver: boolean;
    taker: boolean;
    autoSplat: boolean;
    uncontrollableWhenBound: boolean;
    colorOverride: BCColor | null;
    opacityOverride: string | null;
    whitelist: number[] | null;
    blacklist: number[] | null;
    requireLover: boolean;
    minArousal: number;
}

export interface MapSettingsModel extends BaseSettingsModel {
    enhancedLighting: boolean;
    useRoomCustomization: boolean;
    useEnhancedBlinding: boolean;
    disableLightAnimation: boolean;
    hideVanillaFog: boolean;
    hideDarkLights: boolean;
}

export interface MiscSettingsModel extends BaseSettingsModel {
    chloroformEnabled: boolean;
    chloroformedAt: number;
    chloroformPotencyTime: number;
    //immersiveChloroform: boolean;
    infiniteChloroformPotency: boolean;
    handChokeEnabled: boolean;
    gagChokeEnabled: boolean;
    chokeChainEnabled: boolean;
    netgunEnabled: boolean;
    netgunIsChaotic: boolean;
    netgunKeywords: string[];
    stats: MiscModuleStats;
}

export interface MiscModuleStats extends ModuleStats {
    successfulNettingsCount: number;
    totalNettingsCount: number;
}

export interface OpacitySettingsModel extends OpacityPublicSettingsModel {
}

export interface LeashingPublicSettingsModel extends BaseSettingsModel {
    /** Who we're clasped to, so everyone can tell who's held in place. Older versions don't send it */
    clasps?: number[];
    /** Where each of those clasps is anchored, on their side and the other's. Older versions don't send it */
    claspSlots?: { member: number; slot?: string; pairedSlot?: string; role?: "line" | "anchor" }[];
}

export interface OpacityPublicSettingsModel extends BaseSettingsModel {
    preventExternalMod: boolean;
}

export interface OutfitSettings extends BaseSettingsModel {
    strategy: OutfitStorageStrategy;
}