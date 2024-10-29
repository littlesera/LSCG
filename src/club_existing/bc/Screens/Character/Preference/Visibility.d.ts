/**
 * Handles the loading of the visibility settings of a player
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityLoad(): void;
/**
 * Sets the item visibility preferences for a player. Redirected to from the main Run function if the player is in the
 * visibility settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityRun(): void;
/**
 * Handles the click events for the visibility settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityClick(): void;
/**
 * Update the checkbox settings and asset preview image based on the new asset selection
 * @param {boolean} RefreshCheckboxes - If TRUE, load the new asset settings. If FALSE, a checkbox was just manually
 *     changed so don't refresh them
 * @returns {void} - Nothing
 */
declare function PreferenceVisibilityAssetChanged(RefreshCheckboxes: boolean): void;
/**
 * Toggles the Hide checkbox
 * @returns {void} - Nothing
 */
declare function PreferenceVisibilityHideChange(): void;
/**
 * Toggles the Block checkbox
 * @returns {void} - Nothing
 */
declare function PreferenceVisibilityBlockChange(): void;
/**
 * Adds or removes the current item to/from the list based on the new state of the corresponding checkbox
 * @param {Partial<Record<`${AssetGroupName}/${string}`, ItemPermissions>>} permissionRecord - The record to add or remove the item from
 * @param {boolean} CheckSetting - The new true/false setting of the checkbox
 * @param {"Hidden" | "Block"} Type
 */
declare function PreferenceVisibilityCheckboxChanged(permissionRecord: Partial<Record<`${AssetGroupName}/${string}`, ItemPermissions>>, CheckSetting: boolean, Type: "Hidden" | "Block"): void;
/**
 * Exits the preference screen
 */
declare function PreferenceSubscreenVisibilityExit(): boolean;
/**
 * Trigger a subscreen exit
 * @param {boolean} SaveChanges - If TRUE, this will commit the configuration
 * @returns {void} - Nothing
 */
declare function PreferenceVisibilityExit(SaveChanges: boolean): void;
declare var PreferenceVisibilityGroupList: any[];
declare var PreferenceVisibilityGroupIndex: number;
declare var PreferenceVisibilityAssetIndex: number;
declare var PreferenceVisibilityHideChecked: boolean;
declare var PreferenceVisibilityBlockChecked: boolean;
declare var PreferenceVisibilityCanBlock: boolean;
/** @type {null | Asset} */
declare var PreferenceVisibilityPreviewAsset: null | Asset;
declare var PreferenceVisibilityResetClicked: boolean;
/** @type {Partial<Record<`${AssetGroupName}/${string}`, ItemPermissions>>} */
declare var PreferenceVisibilityRecord: Partial<Record<`${AssetGroupName}/${string}`, ItemPermissions>>;
