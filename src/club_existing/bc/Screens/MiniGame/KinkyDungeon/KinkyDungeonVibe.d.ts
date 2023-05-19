declare function KDStopAllVibeSounds(Exceptions: any): void;
declare function KDUpdateVibeSound(Location: any, Sound: any, Volume: any): void;
declare function KDUpdateVibeSounds(): void;
declare function KDSumVibeLocations(): string[];
/** Gets a list of the groups that should be vibrating here. It is the item's group, plus any 'linked' vibrators */
declare function KDGetVibeLocation(item: any): string[];
/**
 * Starts a vibration, overriding
 * @param {string} source
 * @param {string} name
 * @param {number} intensity
 * @param {number} duration
 * @param {number} [numLoops]
 * @param {number} [denyTime ]
 * @param {number} [denialsLeft ]
 * @param {number} [edgeTime ]
 * @param {boolean} [edgeOnly ]
 * @param {boolean} [alwaysDeny ]
 * @param {number} [denialChance ]
 * @param {number} [denialChanceLikely ]
 * @param {boolean} [tickEdgeAtMaxArousal ]
 * @param {VibeMod[]} [vibeMods ]
 */
declare function KinkyDungeonStartVibration(source: string, name: string, locations: any, intensity: number, duration: number, numLoops?: number, denyTime?: number, denialsLeft?: number, edgeTime?: number, edgeOnly?: boolean, alwaysDeny?: boolean, denialChance?: number, denialChanceLikely?: number, tickEdgeAtMaxArousal?: boolean, vibeMods?: VibeMod[]): void;
/**
 *
 * @param {Record<string, number>} cooldown
 * @returns {boolean}
 */
declare function KDIsVibeCD(cooldown: Record<string, number>): boolean;
declare function KinkyDungeonAddVibeModifier(source: any, name: any, location: any, intensityMod: any, duration: any, intensitySetpoint: any, edgeOnly: any, forceDeny: any, bypassDeny: any, bypassEdge: any, extendDuration: any, denyChanceMod: any, denyChanceLikelyMod: any): void;
declare function KinkyDungeonGetDenyChance(chance: any): number;
declare function KinkyDungeonVibratorsDeny(chance: any): boolean;
declare function KinkyDungeonCalculateVibeLevel(delta: any): void;
declare function KinkyDungeonEndVibration(): void;
declare function KinkyDungeonCanOrgasm(): boolean;
declare namespace KDVibeSounds {
    namespace ItemVulva {
        const sound: string;
        const Audio: any;
        const update: boolean;
    }
    namespace ItemButt {
        const sound_1: string;
        export { sound_1 as sound };
        const Audio_1: any;
        export { Audio_1 as Audio };
        const update_1: boolean;
        export { update_1 as update };
    }
    namespace ItemNipples {
        const sound_2: string;
        export { sound_2 as sound };
        const Audio_2: any;
        export { Audio_2 as Audio };
        const update_2: boolean;
        export { update_2 as update };
        export const vol: number;
    }
}
declare namespace KDVibeSoundRedirect {
    const ItemVulva_1: string;
    export { ItemVulva_1 as ItemVulva };
    export const ItemVulvaPiercings: string;
    const ItemButt_1: string;
    export { ItemButt_1 as ItemButt };
    export const ItemNipplesPiercings: string;
    const ItemNipples_1: string;
    export { ItemNipples_1 as ItemNipples };
    export const ItemPelvis: string;
    export const ItemBreast: string;
    export const ItemBoots: string;
}
declare namespace KDVibeSound {
    const ItemVulva_2: string;
    export { ItemVulva_2 as ItemVulva };
    const ItemButt_2: string;
    export { ItemButt_2 as ItemButt };
    const ItemNipples_2: string;
    export { ItemNipples_2 as ItemNipples };
}
declare let KDVibeVolume: number;
declare let KDVibeVolumeListIndex: number;
declare let KDVibeVolumeList: number[];
declare let KDMusicVolumeMult: number;
declare let KDMusicVolume: number;
declare let KDMusicVolumeListIndex: number;
declare let KDMusicVolumeList: number[];
declare let KDAnimSpeed: number;
declare let KDAnimSpeedListIndex: number;
declare let KDAnimSpeedList: number[];
