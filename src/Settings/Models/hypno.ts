import { BaseSettingsModel } from "./base";

export interface HypnoSettingsModel extends BaseSettingsModel {
    trigger: string;
    triggerTime: number;
    activatedAt: number;
    enableCycle: boolean;
    cycleTime: number;
    overrideWords: string;
    overrideMemberIds: string;
    existingEye1Color: ItemColor | undefined;
    existingEye1Name: string | undefined;
    existingEye2Color: ItemColor | undefined;
    existingEye2Name: string | undefined;
}