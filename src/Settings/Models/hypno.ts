import { BaseSettingsModel, ModuleStats } from "./base";

export interface HypnoModuleStats extends ModuleStats {
    hypnotizedCount: number;
}

export interface HypnoSettingsModel extends HypnoPublicSettingsModel {
    trigger: string;
    existingEye1Color: ItemColor | undefined;
    existingEye1Name: string | undefined;
    existingEye2Color: ItemColor | undefined;
    existingEye2Name: string | undefined;
    existingEyeExpression: ExpressionName | null;
    enableArousal: boolean;
    stats: HypnoModuleStats;
    triggerCycled: boolean;
}

export interface HypnoPublicSettingsModel extends BaseSettingsModel {
    immersive: boolean;
    triggerTime: number;
    cooldownTime: number;
    enableCycle: boolean;
    cycleTime: number;
    awakeners: string;
    overrideWords: string;
    overrideMemberIds: string;
    activatedAt: number;
    recoveredAt: number;
    remoteAccess: boolean;
    remoteAccessRequiredTrance: boolean;
    limitRemoteAccessToHypnotizer: boolean;
    allowRemoteModificationOfMemberOverride: boolean;
    allowLocked: boolean;
    locked: boolean;
    hypnotized: boolean;
    hypnotizedBy: number;
}