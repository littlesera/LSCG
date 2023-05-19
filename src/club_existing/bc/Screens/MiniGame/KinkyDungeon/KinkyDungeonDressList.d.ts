declare let KinkyDungeonOutfitsBase: ({
    name: string;
    dress: string;
    shop: boolean;
    rarity: number;
    events?: undefined;
} | {
    name: string;
    dress: string;
    shop: boolean;
    rarity: number;
    events: {
        trigger: string;
        type: string;
        requiredTag: string;
        power: number;
    }[];
})[];
/**
 * List off all dresses items
 * @type {Record<string,KinkyDungeonDress>}
 */
declare let KinkyDungeonDresses: Record<string, KinkyDungeonDress>;
