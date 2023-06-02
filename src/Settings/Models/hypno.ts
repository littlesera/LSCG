import { BaseSettingsModel } from "./base";

export interface HypnoSettingsModel extends HypnoPublicSettingsModel {
    trigger: string;
    triggerTime: number;
    enableCycle: boolean;
    immersive: boolean;
    cycleTime: number;
    overrideWords: string;
    overrideMemberIds: string;
    existingEye1Color: ItemColor | undefined;
    existingEye1Name: string | undefined;
    existingEye2Color: ItemColor | undefined;
    existingEye2Name: string | undefined;
    existingEyeExpression: ExpressionName | null;
    enableArousal: boolean;
    cooldownTime: number;
}

export interface HypnoPublicSettingsModel extends BaseSettingsModel {
    activatedAt: number;
    recoveredAt: number;
}