/**
 * Checks if the vendor is restrained
 * @returns {boolean} - Returns TRUE if the vendor is restrained or gagged
 */
declare function ShopIsVendorRestrained(): boolean;
/**
 * Checks if the current rescue scenario corresponds to the given one
 * @param {string} ScenarioName - Name of the rescue scenario to check for
 * @returns {boolean} - Returns TRUE if the current rescue scenario is the given one
 */
declare function ShopIsRescueScenario(ScenarioName: string): boolean;
/**
 * Activates the mode which allows the player to buy the items that appear in the inventory screen
 * @returns {void} - Nothing
 */
declare function ShopSetBuyMode(): void;
/**
 * Activates the mode which allows the player to sell the items that appear in the inventory screen
 * @returns {void} - Nothing
 */
declare function ShopSetSellMode(): void;
/**
 * Loads the shop room and its NPC
 * @returns {void} - Nothing
 */
declare function ShopLoad(): void;
/**
 * Runs and draws the shop screen.
 * @returns {void} - Nothing
 */
declare function ShopRun(): void;
/**
 * Checks if an asset is from the focus group and if it can be bought/sold. An asset can be bought/sold if it has a value greater than
 * 0. (0 is a default item, -1 is a non-purchasable item)
 * @param {Asset} Asset - The asset to check for availability
 * @returns {boolean} - Returns TRUE if the item is purchasable and part of the focus group.
 */
declare function ShopAssetFocusGroup(Asset: Asset): boolean;
/**
 * Checks if an asset can be bought. An asset is considered missing if it is not owned and has a value greater than 0. (0 is a default
 * item, -1 is a non-purchasable item)
 * @param {Asset} Asset - The asset to check for availability
 * @returns {boolean} - Returns TRUE if the item is purchasable and unowned.
 */
declare function ShopAssetMissing(Asset: Asset): boolean;
/**
 * Check if the player configured settings to hide items only for a specific gender
 * @param {Asset} Asset - The asset to check
 * @returns {boolean} - Returns whether the asset should be hidden
 */
declare function ShopHideGenderedAsset(Asset: Asset): boolean;
/**
 * Used to display all the items the player does not own
 * @returns {void} - Nothing
 */
declare function ShopSelectAssetMissing(): void;
/**
 * Click handler for the shop screen
 * @returns {void} - Nothing
 */
declare function ShopClick(): void;
/**
 * Add the item and any other items linked by the buy-group to the player's inventory if able
 * @param {Asset} asset - The item being bought
 */
declare function ShopBuyItem(asset: Asset): void;
/**
 * Remove the item and any other items linked by the buy-group from the player's inventory
 * @param {Asset} asset - The item being sold
 */
declare function ShopSellItem(asset: Asset): void;
/**
 * Builds the array of items the player can buy in the current category.
 * @returns {void} - Nothing
 */
declare function ShopCartBuild(): void;
/**
 * If selling items, checks whether the player owns any items in the specified groups that can be sold
 * @param {string} groupList - The list of groups to check, with separator "|"
 * @returns {boolean} - If TRUE the player is either buying items or owns at least one item in one of the groups
 */
declare function ShopCanShow(groupList: string): boolean;
/**
 * Returns whether the player is able to sell the item back to the shop
 * @param {Asset} asset - The item to check
 * @returns {boolean} - If TRUE the item can be sold
 */
declare function ShopCanSell(asset: Asset): boolean;
/**
 * Sets the current asset group the player is shopping for
 * @param {AssetGroupItemName} ItemGroup - Name of the asset group to look for
 * @returns {void} - Nothing
 */
declare function ShopStart(ItemGroup: AssetGroupItemName): void;
/**
 * Triggered when the player rescues the shop vendor
 * @returns {void} - Nothing
 */
declare function ShopCompleteRescue(): void;
/**
 * Checks if the player bought all items that can be bought, including appearance items
 * @returns {void} - Nothing
 */
declare function ShopCheckBoughtEverything(): void;
/**
 * Allows the player to tie the shop vendor if the player has bought everything
 * @returns {void} - Nothing
 */
declare function ShopVendorBondage(): void;
/**
 * Restrains the player with a random shop item before the shop demo job starts. The customer will have a 50/50 chance of being willing to
 * release the player
 * @returns {void} - Nothing
 */
declare function ShopJobRestrain(): void;
/**
 * Handles starting the shop demo job, the player is sent in an empty room with a customer
 * @returns {void} - Nothing
 */
declare function ShopJobStart(): void;
/**
 * Filters the list of shop demo items down to the groups that are currently available on the player
 * @returns {AssetGroupItemName[]} - The filtered list demo item groups that are both empty and unblocked
 */
declare function ShopJobFilterAvailableGroups(): AssetGroupItemName[];
/**
 * Checks whether or not the player is able to retry the shop job after completing one
 * @returns {boolean} - Returns true if the player is able to continue running shop jobs (are able to interact, not all
 * demo item groups are occupied/blocked)
 */
declare function ShopJobCanGoAgain(): boolean;
declare var ShopBackground: string;
/** @type {null | NPCCharacter} */
declare var ShopVendor: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var ShopCustomer: null | NPCCharacter;
declare var ShopVendorAllowItem: boolean;
declare var ShopBoughtEverything: boolean;
declare var ShopStarted: boolean;
declare var ShopText: string;
declare var ShopRescueScenario: string;
declare var ShopRescueScenarioList: string[];
declare var ShopItemOffset: number;
declare var ShopDemoItemPayment: number;
/** @type {"" | AssetGroupItemName} */
declare var ShopDemoItemGroup: "" | AssetGroupItemName;
/** @type {AssetGroupItemName[]} */
declare var ShopDemoItemGroupList: AssetGroupItemName[];
/**
 * Checks if an asset is from the focus group and if it can be bought/sold. An asset can be bought/sold if it has a value greater than
 * 0. (0 is a default item, -1 is a non-purchasable item)
 * @param {Asset} Asset - The asset to check for availability
 * @returns {boolean} - Returns TRUE if the item is purchasable and part of the focus group.
 */
declare function ShopSelectAsset(Asset: Asset): boolean;
/** @type {Asset[]} */
declare var ShopCart: Asset[];
declare var ShopBuyMode: boolean;
declare var ShopSellExceptions: {
    Name: string;
    Group: string;
}[];
