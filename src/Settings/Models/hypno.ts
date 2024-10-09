import { HypnoSuggestion } from "Modules/hypno";
import { BaseSettingsModel, ModuleStats } from "./base";

export const SUGGESTION_LIMIT: number = 100;

export enum LSCGHypnoInstruction {
    none = "None",
    orgasm = "Orgasm",
    denial = "Denial",
    insatiable = "Insatiable",
    activity = "Perform Activity",
    strip = "Strip",
    pose = "Assume Pose",
    follow = "Follow",
    say = "Speak Phrase",
    maid = "Serve",
    forget = "Forget"
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

    // Suggestion Settings
    allowSuggestions: boolean;
    allowSuggestionRemoval: boolean;
    blockedInstructions: LSCGHypnoInstruction[];
    alwaysSubmit: boolean;
    alwaysSubmitMemberIds: string;
}

export function InstructionDescription(instruction: LSCGHypnoInstruction): string {
    switch (instruction) {
        case LSCGHypnoInstruction.activity:
            return "Compel the subject to perform an activity.";
        case LSCGHypnoInstruction.follow:
            return "Compel the subject to follow someone. (Requires LSCG leashing enabled on both)";
        case LSCGHypnoInstruction.maid:
            return "Compel the subject to serve drinks.";
        case LSCGHypnoInstruction.orgasm:
            return "Induce overwhelming pleasure in the subject.";
        case LSCGHypnoInstruction.pose:
            return "Compel the subject to assume a pose.";
        case LSCGHypnoInstruction.say:
            return "Compel the subject to speak a phrase.";
        case LSCGHypnoInstruction.strip:
            return "Make the subjects clothing uncomfortable.";
        case LSCGHypnoInstruction.denial:
            return "Prevent the subject from achieving orgasm.";
        case LSCGHypnoInstruction.insatiable:
            return "Infuse the subject with an endless arousal.";
        case LSCGHypnoInstruction.forget:
            return "Remove a previous instruction from the subject.";
        case LSCGHypnoInstruction.none:
            return "None";
        default:
            return "";
    }
}