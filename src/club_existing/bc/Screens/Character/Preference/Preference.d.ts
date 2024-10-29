/**
 * Loads the preference screen. This function is called dynamically, when the character enters the preference screen
 * for the first time
 * @returns {void} - Nothing
 */
declare function PreferenceLoad(): void;
/**
 * Runs the preference screen. This function is called dynamically on a repeated basis.
 * So don't use complex loops or other function calls within this method
 * @returns {void} - Nothing
 */
declare function PreferenceRun(): void;
/**
 * Handles click events in the preference screen that are propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceClick(): void;
/**
 * Is called when the player exits the preference screen. All settings of the preference screen are sent to the server.
 * If the player is in a subscreen, they exit to the main preferences menu instead.
 * @returns {void} - Nothing
 */
declare function PreferenceExit(): void;
/**
 * Exit from a specific subscreen by running its handler and checking its validity
 */
declare function PreferenceSubscreenExit(): boolean;
/**
 * Draw a button to navigate multiple pages in a preference subscreen
 * @param {number} Left - The X co-ordinate of the button
 * @param {number} Top - The Y co-ordinate of the button
 * @param {number} TotalPages - The total number of pages on the subscreen
 * @returns {void} - Nothing
 */
declare function PreferencePageChangeDraw(Left: number, Top: number, TotalPages: number): void;
/**
 * Handles clicks of the button to navigate multiple pages in a preference subscreen
 * @param {number} Left - The X co-ordinate of the button
 * @param {number} Top - The Y co-ordinate of the button
 * @param {number} TotalPages - The total number of pages on the subscreen
 * @returns {void} - Nothing
 */
declare function PreferencePageChangeClick(Left: number, Top: number, TotalPages: number): void;
/**
 * Draws a back/next button for use on preference pages
 * @param {number} Left - The left offset of the button
 * @param {number} Top - The top offset of the button
 * @param {number} Width - The width of the button
 * @param {number} Height - The height of the button
 * @param {readonly string[]} List - The preference list that the button should be associated with
 * @param {number} Index - The current preference index for the given preference list
 * @returns {void} - Nothing
 */
declare function PreferenceDrawBackNextButton(Left: number, Top: number, Width: number, Height: number, List: readonly string[], Index: number): void;
/**
 * Returns the index of the previous preference list item (and wraps back to the end of the list if currently at 0)
 * @param {readonly unknown[]} List - The preference list
 * @param {number} Index - The current preference index for the given list
 * @returns {number} - The index of the previous item in the array, or the last item in the array if currently at 0
 */
declare function PreferenceGetPreviousIndex(List: readonly unknown[], Index: number): number;
/**
 * Returns the index of the next preference list item (and wraps back to the start of the list if currently at the end)
 * @param {readonly unknown[]} List - The preference list
 * @param {number} Index - The current preference index for the given list
 * @returns {number} - The index of the next item in the array, or 0 if the array is currently at the last item
 */
declare function PreferenceGetNextIndex(List: readonly unknown[], Index: number): number;
/**
 * Registers a new extension setting to the preference screen
 * @param {PreferenceExtensionsSettingItem} Setting - The extension setting to register
 * @returns {void} - Nothing
 */
declare function PreferenceRegisterExtensionSetting(Setting: PreferenceExtensionsSettingItem): void;
/**
 * Validates the character arousal object and converts it's objects to compressed string if needed
 * @param {Character} C - The character to check
 * @returns {void} - Nothing
 */
declare function PreferenceValidateArousalData(C: Character): void;
/**
 * Return a new object with default item permissions
 * @returns {ItemPermissions} - The item permissions
 */
declare function PreferencePermissionGetDefault(): ItemPermissions;
/**
 * The background to use for the settings screen
 */
declare var PreferenceBackground: string;
/**
 * A message shown by some subscreen
 * @type {string}
 */
declare var PreferenceMessage: string;
/**
 * The currently active subscreen
 *
 * @type {PreferenceSubscreen?}
 */
declare var PreferenceSubscreen: PreferenceSubscreen | null;
/**
 * @type {PreferenceSubscreenName[]}
 * @deprecated the old name. Remove after the extensions have caught up
 */
declare var PreferenceSubscreenList: PreferenceSubscreenName[];
/**
 * All the base settings screens
 * @type {PreferenceSubscreen[]}
 */
declare const PreferenceSubscreens: PreferenceSubscreen[];
/**
 * The current page ID for multi-page screens.
 *
 * This is automatically reset to 1 when a screen loads
 */
declare var PreferencePageCurrent: number;
/** @type {Record<string,PreferenceExtensionsSettingItem>} */
declare let PreferenceExtensionsSettings: Record<string, PreferenceExtensionsSettingItem>;
declare let PreferenceDidAddOldStyleScreens: boolean;
declare namespace PreferenceActivityEnjoymentDefault {
    let Name: ActivityName | undefined;
    let Self: ArousalFactor;
    let Other: ArousalFactor;
}
declare namespace PreferenceActivityEnjoymentValidate {
    let Name_1: (arg: ActivityName, C: Character) => undefined | ActivityName;
    export { Name_1 as Name };
    export function Self_1(arg: ArousalFactor, C: Character): ArousalFactor;
    export { Self_1 as Self };
    export function Other_1(arg: ArousalFactor, C: Character): ArousalFactor;
    export { Other_1 as Other };
}
declare namespace PreferenceArousalFetishDefault {
    let Name_2: FetishName | undefined;
    export { Name_2 as Name };
    export let Factor: ArousalFactor;
}
/**
 * Namespace with default values for {@link ArousalFetish} properties.
 * @type {{ [k in keyof ArousalFetish]: (arg: ArousalFetish[k], C: Character) => ArousalFetish[k] }}
 * @namespace
 */
declare var PreferenceArousalFetishValidate: { [k in keyof ArousalFetish]: (arg: ArousalFetish[k], C: Character) => ArousalFetish[k]; };
declare namespace PreferenceArousalZoneDefault {
    let Name_3: AssetGroupItemName | undefined;
    export { Name_3 as Name };
    let Factor_1: ArousalFactor;
    export { Factor_1 as Factor };
    export let Orgasm: boolean;
}
declare namespace PreferenceArousalZoneValidate {
    let Name_4: (arg: AssetGroupName, C: Character) => undefined | AssetGroupItemName;
    export { Name_4 as Name };
    export function Factor_2(arg: ArousalFactor, C: Character): ArousalFactor;
    export { Factor_2 as Factor };
    export function Orgasm_1(arg: boolean, C: Character): boolean;
    export { Orgasm_1 as Orgasm };
}
/**
 * Namespace with default values for {@link ArousalSettingsType} properties.
 * @type {Required<ArousalSettingsType>}
 * @namespace
 */
declare var PreferenceArousalSettingsDefault: Required<ArousalSettingsType>;
/**
 * Namespace with functions for validating {@link ArousalSettingsType} properties
 * @type {{ [k in keyof Required<ArousalSettingsType>]: (arg: ArousalSettingsType[k], C: Character) => ArousalSettingsType[k] }}
 * @namespace
 */
declare var PreferenceArousalSettingsValidate: { [k in keyof Required<ArousalSettingsType>]: (arg: ArousalSettingsType[k], C: Character) => ArousalSettingsType[k]; };
/**
 * Namespace with default values for {@link CharacterOnlineSharedSettings} properties.
 * @type {CharacterOnlineSharedSettings}
 * @namespace
 */
declare var PreferenceOnlineSharedSettingsDefault: CharacterOnlineSharedSettings;
/**
 * Namespace with default values for {@link CharacterOnlineSharedSettings} properties.
 * @type {{ [k in keyof Required<CharacterOnlineSharedSettings>]: (arg: CharacterOnlineSharedSettings[k], C: Character) => CharacterOnlineSharedSettings[k] }}
 * @namespace
 */
declare var PreferenceOnlineSharedSettingsValidate: { [k in keyof Required<CharacterOnlineSharedSettings>]: (arg: CharacterOnlineSharedSettings[k], C: Character) => CharacterOnlineSharedSettings[k]; };
