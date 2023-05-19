/**
 * Gets the dynamic data storage name for a given item on a given character.
 * @param {Character} C - Character wearing the animated object
 * @param {AnimationDataTypes} Type - Type of data to query
 * @param {Asset} [Asset] - The animated object
 * @returns {string} - Contains the name of the persistent data key.
 */
declare function AnimationGetDynamicDataName(C: Character, Type: AnimationDataTypes, Asset?: Asset): string;
/**
 * Gets the persistent data  for a given item on a given character. This method should not be called explicitly, use the Data builder passed to the dynamic drawing functions.
 * @param {Character} C - Character wearing the animated object
 * @param {Asset} Asset - The animated object
 * @returns {any} - Contains the persistent data of the animated object, returns a new empty object if it was never initialized previously.
 */
declare function AnimationPersistentDataGet(C: Character, Asset: Asset): any;
/**
 * Sets the maximum animation refresh rate for a given character.
 * @param {Character} C - Character wearing the dynamic object
 * @param {number} RequestedRate - The maximum refresh rate to request in ms
 * @returns {void} - Nothing
 */
declare function AnimationRequestRefreshRate(C: Character, RequestedRate: number): void;
/**
 * Marks a given character to be redrawn on the next animation refresh.
 * @param {Character} C - Character wearing the dynamic object
 * @returns {void} - Nothing
 */
declare function AnimationRequestDraw(C: Character): void;
/**
 * Gets the group object for a given character. This method should not be called explicitly, use the Data builder passed to the dynamic drawing functions.
 * @param {Character} C - Character wearing the animated object
 * @param {string} Name - Name of the animated object
 * @returns {{ Subscriptions: string[] }} - Contains the persistent group data, returns a new empty object if it was never initialized previously.
 */
declare function AnimationGroupGet(C: Character, Name: string): {
    Subscriptions: string[];
};
/**
 * Marks a given asset as part of a shared data group.
 * @param {Character} C - Character wearing the dynamic object
 * @param {Asset} Asset - The animated object
 * @param {string} Name - Name of the group to subscribe to.
 * @returns {void} - Nothing
 */
declare function AnimationGroupSubscribe(C: Character, Asset: Asset, Name: string): void;
/**
 * Generates a temporary canvas used draw on for dynamic assets.
 * Careful! The width of the canvas should never be higher than 500px.
 * @param {Character} C - Character for which the temporary canvas is
 * @param {Asset} A - Asset for which the canvas is
 * @param {number} W - Width of the canvas (can be changed later)
 * @param {number} H - Height of the canvas (can be changed later)
 * @returns {HTMLCanvasElement} - The temporary canvas to use
 */
declare function AnimationGenerateTempCanvas(C: Character, A: Asset, W: number, H: number): HTMLCanvasElement;
/**
 * Purges all dynamic asset data corresponding to a given character.
 * @param {Character} C - The character to delete the animation data of
 * @param {boolean} IncludeAll - TRUE if we should delete every animation data for the given character.
 * @returns {void} - Nothing
 */
declare function AnimationPurge(C: Character, IncludeAll: boolean): void;
/**
 * Where animation data is stored. Animation data is only managed client side, nothing should be synced.
 * @constant
 * @type {Record<string, any>} - The animation data object.
 */
declare var AnimationPersistentStorage: Record<string, any>;
/**
 * Types of dynamic data that can be stored.
 * @type {{ AssetGroup: "AssetGroup", Base: "", Canvas: "DynamicPlayerCanvas", PersistentData: "PersistentData", Rebuild: "Rebuild", RefreshTime: "RefreshTime", RefreshRate: "RefreshRate" }}
 */
declare var AnimationDataTypes: {
    AssetGroup: "AssetGroup";
    Base: "";
    Canvas: "DynamicPlayerCanvas";
    PersistentData: "PersistentData";
    Rebuild: "Rebuild";
    RefreshTime: "RefreshTime";
    RefreshRate: "RefreshRate";
};
