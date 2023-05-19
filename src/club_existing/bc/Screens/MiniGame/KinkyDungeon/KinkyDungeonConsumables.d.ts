/**
 *
 * @param {item} item
 * @returns {consumable}
 */
declare function KDConsumable(item: item): consumable;
declare function KinkyDungeonFindConsumable(Name: any): consumable;
declare function KinkyDungeonFindBasic(Name: any): {
    name: string;
    rarity: number;
    shop: boolean;
};
declare function KinkyDungeonFindConsumableOrBasic(Name: any): consumable | {
    name: string;
    rarity: number;
    shop: boolean;
};
declare function KinkyDungeonGetInventoryItem(Name: any, Filter?: string): any;
declare function KinkyDungeonItemCount(Name: any): any;
declare function KinkyDungeonGetShopItem(Level: any, Rarity: any, Shop: any): any;
/**
 *
 * @param {consumable} consumable
 * @param {number} Quantity
 * @return {boolean}
 */
declare function KinkyDungeonChangeConsumable(consumable: consumable, Quantity: number): boolean;
declare function KinkyDungeonConsumableEffect(Consumable: any): void;
declare function KinkyDungeonPotionCollar(): boolean;
declare function KinkyDungeonCanDrink(): boolean;
declare function KinkyDungeonAttemptConsumable(Name: any, Quantity: any): boolean;
declare function KinkyDungeonUseConsumable(Name: any, Quantity: any): boolean;
