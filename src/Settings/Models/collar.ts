import type { RemoteAccessLevel } from "utils";
import { BaseSettingsModel, ModuleStats } from "./base";

export interface CollarSettingsModel extends CollarPublicSettingsModel {        
    stats: CollarModuleStats;
}

export interface CollarModuleStats extends ModuleStats {
    collarPassoutCount: number;
    handPassoutCount: number;
    gagPassoutCount: number;
    chainPassoutCount: number;
}

export interface CollarPublicSettingsModel extends BaseSettingsModel {
    /** Opts into breathplay as a whole: choking by hand, gag or chain, and the control collar. */
    breathplayEnabled: boolean;
    chokeLevel: number;
    allowedMembers: string;
    remoteAccess: boolean;
    /** Who may get in: the owner always, and otherwise anyone within this level (see utils REMOTE_ACCESS_LEVELS). */
    remoteLevel: RemoteAccessLevel;
    /** Take who may get in, and when, from the General > Remote Access defaults instead of this section's own settings. */
    useGlobalRemote: boolean;
    /** Members let in whatever the level says (member numbers, comma separated). */
    remoteMemberIds: string;
    remoteAccessRequiredTrance: boolean;
    limitRemoteAccessToHypnotizer: boolean;
    lockable: boolean;
    locked: boolean;
    immersive: boolean;
    anyCollar: boolean;
    limitToCrafted: boolean;
    collar: CollarModel;
    tightTrigger: string;
    looseTrigger: string;
    allowSelfTightening: boolean;
    allowSelfLoosening: boolean;
    allowButtons: boolean;
    knockout: boolean;
    knockoutMinutes: number;
}

export interface CollarModel {
    name: string;
    creator: number;
}