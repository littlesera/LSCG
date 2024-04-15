import { HypnoSuggestion } from "Modules/hypno";
import { BaseSettingsModel, ModuleStats } from "./base";

export const SUGGESTION_LIMIT: number = 64;

export enum LSCGHypnoInstruction {
    none = "None",
    orgasm = "Orgasm",
    activity = "Perform Activity",
    strip = "Strip",
    pose = "Assume Pose",
    follow = "Follow",
    say = "Speak Phrase",
    maid = "Serve"
}

export interface HypnoModuleStats extends ModuleStats {
    hypnotizedCount: number;
}

export interface HypnoInfluence {
    memberId: number;
    memberName: string;
    influence: number;
    lastInfluenced: number;
}

export interface HypnoSettingsModel extends HypnoPublicSettingsModel {
    trigger: string;
    hypnoEyeColor: string | undefined;
    hypnoEyeType: number | undefined;
    enableArousal: boolean;
    stats: HypnoModuleStats;
    triggerCycled: boolean;
    triggerRevealed: boolean;
    influence: HypnoInfluence[];
    suggestions: HypnoSuggestion[];
}

export interface HypnoPublicSettingsModel extends BaseSettingsModel {
    triggerTime: number;
    cooldownTime: number;
    enableCycle: boolean;
    cycleTime: number;
    awakeners: string;
    overrideWords: string;
    overrideMemberIds: string;
    remoteAccess: boolean;
    remoteAccessRequiredTrance: boolean;
    limitRemoteAccessToHypnotizer: boolean;
    allowRemoteModificationOfMemberOverride: boolean;
    allowLocked: boolean;
    locked: boolean;
    speakTriggers: string;
    silenceTriggers: string;
    allowSuggestions: boolean;
}