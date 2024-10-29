/**
 * Handles the loading of the preference subscreen for extensions
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenExtensionsLoad(): void;
/**
 * Runs and draws the preference subscreen for extensions
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenExtensionsRun(): void;
/**
 * Handles clicks in the preference subscreen for extensions
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenExtensionsClick(): void;
declare function PreferenceSubscreenExtensionsUnload(): void;
declare function PreferenceSubscreenExtensionsExit(): boolean;
/**
 * Exit the preference subscreen for extensions, should be called when
 * leaving custom menu of extensions if the extension exits the menu from itself.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenExtensionsClear(): void;
/** @type {PreferenceExtensionsMenuButtonInfo[]} */
declare let PreferenceExtensionsDisplay: PreferenceExtensionsMenuButtonInfo[];
/** @type {PreferenceExtensionsSettingItem | null}*/
declare let PreferenceExtensionsCurrent: PreferenceExtensionsSettingItem | null;
