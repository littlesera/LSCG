import { BaseSettingsModel } from "./base";

export interface HypnoSettingsModel extends HypnoPublicSettingsModel {
    trigger: string;
    existingEye1Color: ItemColor | undefined;
    existingEye1Name: string | undefined;
    existingEye2Color: ItemColor | undefined;
    existingEye2Name: string | undefined;
    existingEyeExpression: ExpressionName | null;
    enableArousal: boolean;
}

export interface HypnoPublicSettingsModel extends BaseSettingsModel {
    immersive: boolean;
    triggerTime: number;
    cooldownTime: number;
    enableCycle: boolean;
    cycleTime: number;
    overrideWords: string;
    overrideMemberIds: string;
    activatedAt: number;
    recoveredAt: number;
    remoteAccess: boolean;
    allowLocked: boolean;
    locked: boolean;
}