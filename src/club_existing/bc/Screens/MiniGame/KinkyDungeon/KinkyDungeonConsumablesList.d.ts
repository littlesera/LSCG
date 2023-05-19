/**
 * @type {Record<string, consumable>}
 */
declare let KinkyDungeonConsumables: Record<string, consumable>;
declare let KDRechargeCost: number;
declare let KinkyDungneonBasic: {
    RedKey: {
        name: string;
        rarity: number;
        shop: boolean;
    };
    BlueKey: {
        name: string;
        rarity: number;
        costMod: number;
        shop: boolean;
    };
    Lockpick: {
        name: string;
        rarity: number;
        shop: boolean;
    };
    "3Bola": {
        name: string;
        consumable: string;
        quantity: number;
        rarity: number;
        shop: boolean;
    };
    "3Bomb": {
        name: string;
        consumable: string;
        quantity: number;
        rarity: number;
        shop: boolean;
    };
    MaidUniform: {
        name: string;
        rarity: number;
        shop: boolean;
        ignoreInventory: string;
    };
};
declare namespace KinkyDungneonShopRestraints {
    namespace SlimeWalkers {
        const name: string;
        const rarity: number;
        const shop: boolean;
    }
    namespace PotionCollar {
        const name_1: string;
        export { name_1 as name };
        const rarity_1: number;
        export { rarity_1 as rarity };
        const shop_1: boolean;
        export { shop_1 as shop };
    }
}
/** @type {Record<string, (consumable) => void>} */
declare let KDConsumableEffects: Record<string, (consumable: any) => void>;
/** @type {Record<string, (item: item, Quantity: number) => boolean>} */
declare let KDConsumablePrereq: Record<string, (item: item, Quantity: number) => boolean>;
