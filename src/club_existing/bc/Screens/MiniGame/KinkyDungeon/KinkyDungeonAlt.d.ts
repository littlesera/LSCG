declare function KinkyDungeonAltFloor(Type: any): any;
declare function KinkyDungeonCreateMaze(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
/**
 *
 * @param {*} POI
 * @param {*} VisitedRooms
 * @param {*} width
 * @param {*} height
 * @param {*} openness
 * @param {*} density
 * @param {*} hallopenness
 * @param {{params: floorParams; chestlist: any[]; traps: any[]; shrinelist: any[]; chargerlist: any[]; spawnpoints: any[]}} data
 */
declare function KinkyDungeonCreateTileMaze(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: {
    params: floorParams;
    chestlist: any[];
    traps: any[];
    shrinelist: any[];
    chargerlist: any[];
    spawnpoints: any[];
}): void;
declare function KinkyDungeonCreateRoom(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
declare function KinkyDungeonCreateTunnel(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
declare function KinkyDungeonCreatePerkRoom(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
declare function KinkyDungeonCreateJourneyFloor(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
declare function KinkyDungeonCreateTutorial(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
declare namespace KDJourneyMapMod {
    const Random: boolean;
}
declare namespace KDDefaultMaxFlags {
    const goldchest: number;
    const silverchest: number;
    const darkchest: number;
    const redchest: number;
    const bluechest: number;
    const forbidden: number;
    const artifact: number;
    const jail: number;
    const playroom: number;
    const supplydepot: number;
    const barracks: number;
    const robotroom: number;
    const laboratory: number;
    const library: number;
    const armory: number;
    const workshop: number;
    const tinker: number;
    const office: number;
    const worship: number;
    const graveyard: number;
    const well: number;
    const wildlife: number;
    const range: number;
    const arena: number;
    const arena_boss: number;
    const arena_miniboss: number;
    const slimespawn: number;
    const beastspawn: number;
    const magicspawn: number;
    const robotspawn: number;
}
declare namespace alts {
    namespace Tunnel {
        const name: string;
        const bossroom: boolean;
        const width: number;
        const height: number;
        const genType: string;
        const spawns: boolean;
        const chests: boolean;
        const shrines: boolean;
        const orbs: number;
        const setpieces: {};
        const chargers: boolean;
        const torches: boolean;
        const heart: boolean;
        const specialtiles: boolean;
        const shortcut: boolean;
        const enemies: boolean;
        const nojail: boolean;
        const nolore: boolean;
        const nokeys: boolean;
        const nostairs: boolean;
        const notraps: boolean;
        const noClutter: boolean;
        const noShrineTypes: string[];
        const tickFlags: boolean;
        const noMusic: boolean;
    }
    namespace PerkRoom {
        const name_1: string;
        export { name_1 as name };
        const bossroom_1: boolean;
        export { bossroom_1 as bossroom };
        const width_1: number;
        export { width_1 as width };
        const height_1: number;
        export { height_1 as height };
        const genType_1: string;
        export { genType_1 as genType };
        export namespace setpieces_1 {
            const PearlChest: number;
        }
        export { setpieces_1 as setpieces };
        const spawns_1: boolean;
        export { spawns_1 as spawns };
        const chests_1: boolean;
        export { chests_1 as chests };
        const shrines_1: boolean;
        export { shrines_1 as shrines };
        const orbs_1: number;
        export { orbs_1 as orbs };
        const chargers_1: boolean;
        export { chargers_1 as chargers };
        const torches_1: boolean;
        export { torches_1 as torches };
        const heart_1: boolean;
        export { heart_1 as heart };
        const specialtiles_1: boolean;
        export { specialtiles_1 as specialtiles };
        const shortcut_1: boolean;
        export { shortcut_1 as shortcut };
        const enemies_1: boolean;
        export { enemies_1 as enemies };
        const nojail_1: boolean;
        export { nojail_1 as nojail };
        const nolore_1: boolean;
        export { nolore_1 as nolore };
        const nokeys_1: boolean;
        export { nokeys_1 as nokeys };
        const nostairs_1: boolean;
        export { nostairs_1 as nostairs };
        const notraps_1: boolean;
        export { notraps_1 as notraps };
        const noClutter_1: boolean;
        export { noClutter_1 as noClutter };
        const noShrineTypes_1: string[];
        export { noShrineTypes_1 as noShrineTypes };
        const noMusic_1: boolean;
        export { noMusic_1 as noMusic };
    }
    namespace Jail {
        const name_2: string;
        export { name_2 as name };
        const bossroom_2: boolean;
        export { bossroom_2 as bossroom };
        const width_2: number;
        export { width_2 as width };
        const height_2: number;
        export { height_2 as height };
        export const enemyMult: number;
        export namespace setpieces_2 {
            const GuaranteedCell: number;
            const ExtraCell: number;
            const Bedroom: number;
            const QuadCell: number;
            const Storage: number;
        }
        export { setpieces_2 as setpieces };
        export namespace bonusTags {
            namespace construct {
                const bonus: number;
                const mult: number;
            }
        }
        const genType_2: string;
        export { genType_2 as genType };
        const spawns_2: boolean;
        export { spawns_2 as spawns };
        const chests_2: boolean;
        export { chests_2 as chests };
        const shrines_2: boolean;
        export { shrines_2 as shrines };
        const orbs_2: number;
        export { orbs_2 as orbs };
        const chargers_2: boolean;
        export { chargers_2 as chargers };
        const torches_2: boolean;
        export { torches_2 as torches };
        const heart_2: boolean;
        export { heart_2 as heart };
        const specialtiles_2: boolean;
        export { specialtiles_2 as specialtiles };
        const shortcut_2: boolean;
        export { shortcut_2 as shortcut };
        const enemies_2: boolean;
        export { enemies_2 as enemies };
        const nojail_2: boolean;
        export { nojail_2 as nojail };
        const nokeys_2: boolean;
        export { nokeys_2 as nokeys };
        const nostairs_2: boolean;
        export { nostairs_2 as nostairs };
        const notraps_2: boolean;
        export { notraps_2 as notraps };
        export const noRelease: boolean;
        export const releaseOnLowSec: boolean;
        const noShrineTypes_2: string[];
        export { noShrineTypes_2 as noShrineTypes };
    }
    namespace JourneyFloor {
        const name_3: string;
        export { name_3 as name };
        const bossroom_3: boolean;
        export { bossroom_3 as bossroom };
        const width_3: number;
        export { width_3 as width };
        const height_3: number;
        export { height_3 as height };
        const setpieces_3: {};
        export { setpieces_3 as setpieces };
        const genType_3: string;
        export { genType_3 as genType };
        const spawns_3: boolean;
        export { spawns_3 as spawns };
        const chests_3: boolean;
        export { chests_3 as chests };
        const shrines_3: boolean;
        export { shrines_3 as shrines };
        const orbs_3: number;
        export { orbs_3 as orbs };
        const chargers_3: boolean;
        export { chargers_3 as chargers };
        const torches_3: boolean;
        export { torches_3 as torches };
        const heart_3: boolean;
        export { heart_3 as heart };
        const specialtiles_3: boolean;
        export { specialtiles_3 as specialtiles };
        const shortcut_3: boolean;
        export { shortcut_3 as shortcut };
        const enemies_3: boolean;
        export { enemies_3 as enemies };
        const nojail_3: boolean;
        export { nojail_3 as nojail };
        const nokeys_3: boolean;
        export { nokeys_3 as nokeys };
        const nolore_2: boolean;
        export { nolore_2 as nolore };
        const nostairs_3: boolean;
        export { nostairs_3 as nostairs };
        const notraps_3: boolean;
        export { notraps_3 as notraps };
        const noClutter_2: boolean;
        export { noClutter_2 as noClutter };
        export const skiptunnel: boolean;
    }
    namespace Tutorial {
        const name_4: string;
        export { name_4 as name };
        const bossroom_4: boolean;
        export { bossroom_4 as bossroom };
        const width_4: number;
        export { width_4 as width };
        const height_4: number;
        export { height_4 as height };
        const setpieces_4: {};
        export { setpieces_4 as setpieces };
        const genType_4: string;
        export { genType_4 as genType };
        const spawns_4: boolean;
        export { spawns_4 as spawns };
        const chests_4: boolean;
        export { chests_4 as chests };
        const shrines_4: boolean;
        export { shrines_4 as shrines };
        const orbs_4: number;
        export { orbs_4 as orbs };
        const chargers_4: boolean;
        export { chargers_4 as chargers };
        const torches_4: boolean;
        export { torches_4 as torches };
        const heart_4: boolean;
        export { heart_4 as heart };
        const specialtiles_4: boolean;
        export { specialtiles_4 as specialtiles };
        const shortcut_4: boolean;
        export { shortcut_4 as shortcut };
        const enemies_4: boolean;
        export { enemies_4 as enemies };
        const nojail_4: boolean;
        export { nojail_4 as nojail };
        const nokeys_4: boolean;
        export { nokeys_4 as nokeys };
        const nolore_3: boolean;
        export { nolore_3 as nolore };
        const nostairs_4: boolean;
        export { nostairs_4 as nostairs };
        const notraps_4: boolean;
        export { notraps_4 as notraps };
        const noClutter_3: boolean;
        export { noClutter_3 as noClutter };
    }
}
declare let KDJourneyList: string[];
declare namespace KinkyDungeonCreateMapGenType {
    export function Room(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export function JourneyFloor_1(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export { JourneyFloor_1 as JourneyFloor };
    export function Tutorial_1(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export { Tutorial_1 as Tutorial };
    export function Tunnel_1(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export { Tunnel_1 as Tunnel };
    export function PerkRoom_1(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export { PerkRoom_1 as PerkRoom };
    export function Chamber(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export function Maze(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export function TileMaze(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
    export function NarrowMaze(POI: any, VisitedRooms: any, width: any, height: any, openness: any, density: any, hallopenness: any, data: any): void;
}
