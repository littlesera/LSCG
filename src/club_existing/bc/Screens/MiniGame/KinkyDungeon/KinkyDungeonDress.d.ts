declare function KDOutfit(item: any): any;
declare function KinkyDungeonRefreshOutfitCache(): void;
declare function KinkyDungeonInitializeDresses(): void;
declare function KinkyDungeonDressSet(): void;
declare function KinkyDungeonSetDress(Dress: any, Outfit: any): void;
/**
 * It sets the player's appearance based on their stats.
 */
declare function KinkyDungeonDressPlayer(): void;
/**
 * Initializes protected groups like ears and tail
 */
declare function KDInitProtectedGroups(): void;
/**
 * If the player is wearing a restraint that has a `alwaysDress` property, and the player is not wearing the item specified
 * in the `alwaysDress` property, the player will be forced to wear the items.
 */
/**
 *
 * @param {item[]} [restraints]
 */
declare function KinkyDungeonWearForcedClothes(restraints?: item[]): void;
declare function KDCharacterAppearanceSetColorForGroup(Player: any, Color: any, Group: any): void;
declare function KinkyDungeonGetOutfit(Name: any): {};
/**
 * Makes the KinkyDungeonPlayer wear an item on a body area
 * @param {string} AssetName - The name of the asset to wear
 * @param {string} AssetGroup - The name of the asset group to wear
 * @param {string} par - parent item
 * @param {string | string[]} color - parent item
 */
declare function KDInventoryWear(AssetName: string, AssetGroup: string, par: string, color: string | string[]): Item;
declare function KDCharacterNaked(): void;
/**
 * Removes all items that can be removed, making the player naked. Checks for a blocking of CosPlayItem removal.
 * @returns {void} - Nothing
 */
declare function KDCharacterAppearanceNaked(): void;
declare function KDApplyItem(inv: any, tags: any): void;
declare function KinkyDungeonSendOutfitEvent(Event: any, data: any): void;
declare let KinkyDungeonOutfitCache: Map<any, any>;
/**@type {string[]} Contains protected zones*/
declare let KDProtectedCosplay: string[];
/**
 * These priorities override the default BC
 * @type {Record<string, Record<string, number>>}
 */
declare let KDClothOverrides: Record<string, Record<string, number>>;
/** @type {KinkyDungeonDress} */
declare let KinkyDungeonDefaultDefaultDress: KinkyDungeonDress;
declare let KinkyDungeonCheckClothesLoss: boolean;
declare let KinkyDungeonNewDress: boolean;
declare let KDNaked: boolean;
declare let KDRefresh: boolean;
