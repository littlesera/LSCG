declare function KinkyDungeonBossFloor(Floor: any): {
    boss: string;
    bossroom: boolean;
    width: number;
    height: number;
    setpieces: {
        GuaranteedCell: number;
        FuukaAltar: number;
    };
    genType: string;
    spawns: boolean;
    chests: boolean;
    shrines: boolean;
    chargers: boolean;
    torches: boolean;
    heart: boolean;
    specialtiles: boolean;
    shortcut: boolean;
    enemies: boolean;
    nokeys: boolean;
    nojail: boolean;
};
declare namespace bosses {
    namespace Fuuka {
        const boss: string;
        const bossroom: boolean;
        const width: number;
        const height: number;
        namespace setpieces {
            const GuaranteedCell: number;
            const FuukaAltar: number;
        }
        const genType: string;
        const spawns: boolean;
        const chests: boolean;
        const shrines: boolean;
        const chargers: boolean;
        const torches: boolean;
        const heart: boolean;
        const specialtiles: boolean;
        const shortcut: boolean;
        const enemies: boolean;
        const nokeys: boolean;
        const nojail: boolean;
    }
}
