/**
 * An object defining which genders a setting is active for
 * @typedef {object} GenderSetting
 * @property {boolean} Female - Whether the setting is active for female cases
 * @property {boolean} Male - Whether the setting is active for male cases
 */
/**
 * Compares the arousal preference level and returns TRUE if that level is met, or an higher level is met
 * @param {Character} C - The player who performs the sexual activity
 * @param {ArousalActiveName} Level - The name of the level ("Inactive", "NoMeter", "Manual", "Hybrid", "Automatic")
 * @returns {boolean} - Returns TRUE if the level is met or more
 */
declare function PreferenceArousalAtLeast(C: Character, Level: ArousalActiveName): boolean;
/**
 * Gets the effect of a sexual activity on the player
 * @param {Character} C - The player who performs the sexual activity
 * @param {ActivityName} Type - The type of the activity that is performed
 * @param {boolean} Self - Determines, if the current player is giving (false) or receiving (true)
 * @returns {ArousalFactor} - Returns the love factor of the activity for the character (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceGetActivityFactor(C: Character, Type: ActivityName, Self: boolean): ArousalFactor;
/**
 * Gets the factor of a fetish for the player
 * @param {Character} C - The character to query
 * @param {FetishName} Type - The name of the fetish
 * @returns {ArousalFactor} - Returns the love factor of the fetish for the character (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceGetFetishFactor(C: Character, Type: FetishName): ArousalFactor;
/**
 * Sets the love factor of a sexual activity for the character
 * @param {Character} C - The character for whom the activity factor should be set
 * @param {ActivityName} Type - The type of the activity that is performed
 * @param {boolean} Self - Determines, if the current player is giving (false) or receiving (true)
 * @param {ArousalFactor} Factor - The factor of the sexual activity (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceSetActivityFactor(C: Character, Type: ActivityName, Self: boolean, Factor: ArousalFactor): void;
/**
 * Gets the corresponding arousal zone definition from a player's preferences (if the group's activities are mirrored,
 * returns the arousal zone definition for the mirrored group).
 * @param {Character} C - The character for whom to get the arousal zone
 * @param {AssetGroupItemName} ZoneName - The name of the zone to get
 * @returns {null | ArousalZone} - Returns the arousal zone preference object,
 * or null if a corresponding zone definition could not be found.
 */
declare function PreferenceGetArousalZone(C: Character, ZoneName: AssetGroupItemName): null | ArousalZone;
/**
 * Gets the love factor of a zone for the character
 * @param {Character} C - The character for whom the love factor of a particular zone should be gotten
 * @param {AssetGroupItemName} ZoneName - The name of the zone to get the love factor for
 * @returns {ArousalFactor} - Returns the love factor of a zone for the character (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceGetZoneFactor(C: Character, ZoneName: AssetGroupItemName): ArousalFactor;
/**
 * Sets the love factor for a specific body zone on the player
 * @param {Character} C - The character, for whom the love factor of a particular zone should be set
 * @param {AssetGroupItemName} Zone - The name of the zone, the factor should be set for
 * @param {ArousalFactor} Factor - The factor of the zone (0 is horrible, 2 is normal, 4 is great)
 * @returns {void} - Nothing
 */
declare function PreferenceSetZoneFactor(C: Character, Zone: AssetGroupItemName, Factor: ArousalFactor): void;
/**
 * Determines, if a player can reach on orgasm from a particular zone
 * @param {Character} C - The character whose ability to orgasm we check
 * @param {AssetGroupItemName} ZoneName - The name of the zone to check
 * @returns {boolean} - Returns true if the zone allows orgasms for a character, false otherwise
 */
declare function PreferenceGetZoneOrgasm(C: Character, ZoneName: AssetGroupItemName): boolean;
/**
 * Sets the ability to induce an orgasm for a given zone*
 * @param {Character} C - The characterfor whom we set the ability to órgasm from a given zone
 * @param {AssetGroupItemName} ZoneName - The name of the zone to set the ability to orgasm for
 * @param {boolean} CanOrgasm - Sets, if the character can cum from the given zone (true) or not (false)
 * @returns {void} - Nothing
 */
declare function PreferenceSetZoneOrgasm(C: Character, ZoneName: AssetGroupItemName, CanOrgasm: boolean): void;
/**
 * Gets a color code for a given arousal factor
 * @param {number} Factor - The factor that should be translated in a color code
 * @returns {string} - The color for the given factor in the format "#rrggbbaa"
 */
declare function PreferenceGetFactorColor(Factor: number): string;
/**
 * Checks, if the arousal activity controls must be activated
 * @returns {boolean} - Returns true if we must activate the preference controls, false otherwise
 */
declare function PreferenceArousalIsActive(): boolean;
/**
 * Loads the activity factor combo boxes based on the current activity selected
 * @returns {void} - Nothing
 */
declare function PreferenceLoadActivityFactor(): void;
/**
 * Loads the fetish factor combo boxes based on the current fetish selected
 * @returns {void} - Nothing
 */
declare function PreferenceLoadFetishFactor(): void;
/**
 * Initialize and validates the character settings
 * @param {Character} C - The character, whose preferences are initialized
 * @returns {void} - Nothing
 */
declare function PreferenceInit(C: Character): void;
/**
 * Initialize and validates Player settings
 * @returns {void} - Nothing
 */
declare function PreferenceInitPlayer(): void;
/**
 * Initialise the Notifications settings, converting the old boolean types to objects
 * @param {object} setting - The old version of the setting
 * @param {NotificationAudioType} audio - The audio setting
 * @param {NotificationAlertType} [defaultAlertType] - The default AlertType to use
 * @returns {NotificationSetting} - The setting to use
 */
declare function PreferenceInitNotificationSetting(setting: object, audio: NotificationAudioType, defaultAlertType?: NotificationAlertType): NotificationSetting;
/**
 * Initialise a Gender setting
 * @returns {GenderSetting} - The setting to use
 */
declare function PreferenceInitGenderSetting(): GenderSetting;
/**
 * Migrates a named preference from one preference object to another if not already migrated
 * @param {object} from - The preference object to migrate from
 * @param {object} to - The preference object to migrate to
 * @param {string} prefName - The name of the preference to migrate
 * @param {any} defaultValue - The default value for the preference if it doesn't exist
 * @returns {void} - Nothing
 */
declare function PreferenceMigrate(from: object, to: object, prefName: string, defaultValue: any): void;
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
declare function PreferenceSubscreenGeneralRun(): void;
/**
 * Runs and draw the preference screen, difficulty subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenDifficultyRun(): void;
/**
 * Runs and draw the preference screen, restriction subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenRestrictionRun(): void;
/**
 * Handles click events in the preference screen that are propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceClick(): void;
/**
 * Handles the click events in the preference screen, general sub-screen, propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGeneralClick(): void;
/**
 * Handles the click events in the preference screen, difficulty sub-screen, propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenDifficultyClick(): void;
/**
 * Handles the click events in the preference screen, restriction sub-screen, propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenRestrictionClick(): void;
/**
 * Runs and draws the preference screen, immersion sub-screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenImmersionRun(): void;
/**
 * Handles the click events in the preference screen, immersion sub-screen, propagated from CommonClick()
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenImmersionClick(): void;
/**
 * Is called when the player exits the preference screen. All settings of the preference screen are sent to the server.
 * If the player is in a subscreen, they exit to the main preferences menu instead.
 * @returns {void} - Nothing
 */
declare function PreferenceExit(): void;
/**
 * Sets the audio preferences for the player. Redirected to from the main Run function if the player is in the audio
 * settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenAudioRun(): void;
/**
 * Sets the controller preferences for the player. Redirected to from the main Run function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenControllerRun(): void;
/**
 * Sets the censored words for the player. Redirected to from the main Run function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsRun(): void;
/**
 * Sets the chat preferences for the player. Redirected to from the main Run function if the player is in the chat
 * settings subscreen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenChatRun(): void;
/**
 * Sets the online preferences for the player. Redirected to from the main Run function if the player is in the online
 * settings subscreen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenOnlineRun(): void;
declare function PreferenceSubscreenArousalLoad(): void;
/**
 * Sets the arousal preferences for a player. Redirected to from the main Run function if the player is in the arousal
 * settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenArousalRun(): void;
/**
 * Sets the security preferences for a player. Redirected to from the main Run function if the player is in the
 * security settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityRun(): void;
/**
 * Sets the item visibility preferences for a player. Redirected to from the main Run function if the player is in the
 * visibility settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityRun(): void;
/**
 * Sets the graphical preferences for a player. Redirected to from the main Run function if the player is in the
 * visibility settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGraphicsRun(): void;
/**
 * Sets the gender preferences for a player. Redirected to from the main Run function if the player is in the
 * gender settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGenderRun(): void;
/**
 * Draws the two checkbox row for a gender setting
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {string} Text - The text for the setting's description
 * @param {GenderSetting} Setting - The player setting the row corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceGenderDrawSetting(Left: number, Top: number, Text: string, Setting: GenderSetting): void;
declare function PreferenceSubscreenScriptsRun(): void;
declare function PreferenceScriptsDrawWarningScreen(): void;
/**
 * Handles click events for the audio preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGraphicsClick(): void;
declare function PreferenceSubscreenGraphicsExit(): void;
/**
 * Handles click events for the audio preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenAudioClick(): void;
/**
 * Exists the preference screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenAudioExit(): void;
/**
 * Handles click events for the controller preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenControllerClick(): void;
/**
 * Handles click events for the censored words preference settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsClick(): void;
/**
 * Handles the click events for the chat settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenChatClick(): void;
/**
 * Handles the click events for the online settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenOnlineClick(): void;
/**
 * Handles the click events for the arousal settings.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenArousalClick(): void;
/**
 * Increment the passed arousal factor.
 * @param {ArousalFactor} factor
 * @returns {ArousalFactor}
 */
declare function PreferenceIncrementArousalFactor(factor: ArousalFactor): ArousalFactor;
/**
 * Decrement the passed arousal factor.
 * @param {ArousalFactor} factor
 * @returns {ArousalFactor}
 */
declare function PreferenceDecrementArousalFactor(factor: ArousalFactor): ArousalFactor;
/**
 * Handles the click events in the security settings dialog for a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityClick(): void;
/**
 * Handles the click events for the notifications settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGenderClick(): void;
/**
 * Handles the click for a gender setting row
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {GenderSetting} Setting - The player setting the row corresponds to
 * @param {boolean} MutuallyExclusive - Whether only one option can be enabled at a time
 * @returns {void} - Nothing
 */
declare function PreferenceGenderClickSetting(Left: number, Top: number, Setting: GenderSetting, MutuallyExclusive: boolean): void;
declare function PreferenceSubscreenScriptsClick(): void;
declare function PreferenceSubscreenScriptsExitClick(): void;
declare function PreferenceSubscreenScriptsWarningClick(): void;
/**
 * Handles the click events for the visibility settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityClick(): void;
/**
 * Handles the loading of the visibility settings of a player
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityLoad(): void;
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
 * @param {ItemBundle[]} List - The list to add or remove the item from
 * @param {boolean} CheckSetting - The new true/false setting of the checkbox
 */
declare function PreferenceVisibilityCheckboxChanged(List: ItemBundle[], CheckSetting: boolean): void;
/**
 * Saves changes to the settings, disposes of large lists & exits the visibility preference screen.
 * @param {boolean} SaveChanges - If TRUE, update HiddenItems and BlockItems for the account
 * @returns {void} - Nothing
 */
declare function PreferenceVisibilityExit(SaveChanges: boolean): void;
/**
 * Loads the Preferences screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGeneralLoad(): void;
/**
 * Exists the preference screen. Cleans up elements that are not needed anymore
 * If the selected color is invalid, the player cannot leave the screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenGeneralExit(): void;
/**
 * Exists the difficulty screen. Cleans up elements that are not needed anymore
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenDifficultyExit(): void;
/**
 * Loads the preference security screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityLoad(): void;
/**
 * Loads the preference censored words screen.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsLoad(): void;
/**
 * Get the sensory deprivation setting for the player
 * @returns {boolean} - Return true if sensory deprivation is active, false otherwise
 */
declare function PreferenceIsPlayerInSensDep(): boolean;
/**
 * Loads the preference screen. This function is called dynamically, when the character enters the preference screen
 * for the first time
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsLoad(): void;
/**
 * If the setting's alert type is not allowed for this session, e.g. from using a new device/browser, reset it to 'None'
 * @param {NotificationSetting} setting - The notifications setting to check
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsCheckSetting(setting: NotificationSetting): void;
/**
 * Sets the notifications preferences for a player. Redirected to from the main Run function if the player is in the
 * notifications settings subscreen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsRun(): void;
/**
 * Draws the two checkbox row for a notifications setting
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {string} Text - The text for the setting's description
 * @param {NotificationSetting} Setting - The player setting the row corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsDrawSetting(Left: number, Top: number, Text: string, Setting: NotificationSetting): void;
/**
 * Handles the click events for the notifications settings of a player.  Redirected from the main Click function.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsClick(): void;
/**
 * Handles the click events within a multi-checkbox settings row.
 * @param {number} Left - The X co-ordinate the row starts on
 * @param {number} Top - The Y co-ordinate the row starts on
 * @param {NotificationSetting} Setting - The player setting the row corresponds to
 * @param {NotificationEventType} EventType - The event type the setting corresponds to
 * @returns {void} - Nothing
 */
declare function PreferenceNotificationsClickSetting(Left: number, Top: number, Setting: NotificationSetting, EventType: NotificationEventType): void;
/**
 * Exits the preference screen. Resets the test notifications.
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenNotificationsExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenControllerExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenCensoredWordsExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenChatExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenArousalExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenSecurityExit(): void;
/**
 * Exits the preference screen
 * @returns {void} - Nothing
 */
declare function PreferenceSubscreenVisibilityExit(): void;
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
declare var PreferenceBackground: string;
declare var PreferenceMessage: string;
declare var PreferenceSafewordConfirm: boolean;
/** @type {"InputCharacterLabelColor" | ""} */
declare var PreferenceColorPick: "InputCharacterLabelColor" | "";
/** @type {PreferenceSubscreenName | ""} */
declare var PreferenceSubscreen: PreferenceSubscreenName | "";
/** @type {PreferenceSubscreenName[]} */
declare var PreferenceSubscreenList: PreferenceSubscreenName[];
declare var PreferencePageCurrent: number;
/** @type {ChatColorThemeType[]} */
declare var PreferenceChatColorThemeList: ChatColorThemeType[];
declare var PreferenceChatColorThemeIndex: number;
/** @type {ChatEnterLeaveType[]} */
declare var PreferenceChatEnterLeaveList: ChatEnterLeaveType[];
declare var PreferenceChatEnterLeaveIndex: number;
/** @type {ChatMemberNumbersType[]} */
declare var PreferenceChatMemberNumbersList: ChatMemberNumbersType[];
declare var PreferenceChatMemberNumbersIndex: number;
/** @type {ChatFontSizeType[]} */
declare var PreferenceChatFontSizeList: ChatFontSizeType[];
declare var PreferenceChatFontSizeIndex: number;
/** @type {SettingsSensDepName[]} */
declare var PreferenceSettingsSensDepList: SettingsSensDepName[];
declare var PreferenceSettingsSensDepIndex: number;
/** @type {SettingsVFXName[]} */
declare var PreferenceSettingsVFXList: SettingsVFXName[];
declare var PreferenceSettingsVFXIndex: number;
/** @type {SettingsVFXVibratorName[]} */
declare var PreferenceSettingsVFXVibratorList: SettingsVFXVibratorName[];
declare var PreferenceSettingsVFXVibratorIndex: number;
/** @type {SettingsVFXFilterName[]} */
declare var PreferenceSettingsVFXFilterList: SettingsVFXFilterName[];
declare var PreferenceSettingsVFXFilterIndex: number;
declare var PreferenceSettingsVolumeList: number[];
declare var PreferenceSettingsSensitivityList: number[];
declare var PreferenceSettingsDeadZoneList: number[];
declare var PreferenceSettingsVolumeIndex: number;
declare var PreferenceSettingsMusicVolumeIndex: number;
declare var PreferenceSettingsSensitivityIndex: number;
declare var PreferenceSettingsDeadZoneIndex: number;
/** @type {ArousalActiveName[]} */
declare var PreferenceArousalActiveList: ArousalActiveName[];
declare var PreferenceArousalActiveIndex: number;
/** @type {ArousalVisibleName[]} */
declare var PreferenceArousalVisibleList: ArousalVisibleName[];
declare var PreferenceArousalVisibleIndex: number;
/** @type {ArousalAffectStutterName[]} */
declare var PreferenceArousalAffectStutterList: ArousalAffectStutterName[];
declare var PreferenceArousalAffectStutterIndex: number;
/** @type {null | ActivityName[]} */
declare var PreferenceArousalActivityList: null | ActivityName[];
declare var PreferenceArousalActivityIndex: number;
/** @type {ArousalFactor} */
declare var PreferenceArousalActivityFactorSelf: ArousalFactor;
/** @type {ArousalFactor} */
declare var PreferenceArousalActivityFactorOther: ArousalFactor;
/** @type {ArousalFactor} */
declare var PreferenceArousalZoneFactor: ArousalFactor;
/** @type {null | FetishName[]} */
declare var PreferenceArousalFetishList: null | FetishName[];
declare var PreferenceArousalFetishIndex: number;
/** @type {ArousalFactor} */
declare var PreferenceArousalFetishFactor: ArousalFactor;
declare var PreferenceVisibilityGroupList: any[];
declare var PreferenceVisibilityGroupIndex: number;
declare var PreferenceVisibilityAssetIndex: number;
declare var PreferenceVisibilityHideChecked: boolean;
declare var PreferenceVisibilityBlockChecked: boolean;
declare var PreferenceVisibilityCanBlock: boolean;
/** @type {null | Asset} */
declare var PreferenceVisibilityPreviewAsset: null | Asset;
/** @type {ItemPermissions[]} */
declare var PreferenceVisibilityHiddenList: ItemPermissions[];
/** @type {ItemPermissions[]} */
declare var PreferenceVisibilityBlockList: ItemPermissions[];
declare var PreferenceVisibilityResetClicked: boolean;
/** @type {null | number} */
declare var PreferenceDifficultyLevel: null | number;
declare var PreferenceDifficultyAccept: boolean;
/** @type {GraphicsFontName[]} */
declare var PreferenceGraphicsFontList: GraphicsFontName[];
/** @type {WebGLPowerPreference[]} */
declare var PreferenceGraphicsPowerModes: WebGLPowerPreference[];
declare var PreferenceGraphicsFontIndex: number;
/** @type {null | number} */
declare var PreferenceGraphicsAnimationQualityIndex: null | number;
/** @type {null | number} */
declare var PreferenceGraphicsPowerModeIndex: null | number;
/** @type {null | WebGLContextAttributes} */
declare var PreferenceGraphicsWebGLOptions: null | WebGLContextAttributes;
declare var PreferenceGraphicsAnimationQualityList: number[];
declare var PreferenceCalibrationStage: number;
/** @type {string[]} */
declare var PreferenceCensoredWordsList: string[];
declare var PreferenceCensoredWordsOffset: number;
/** @type {ScriptPermissionProperty[]} */
declare const PreferenceScriptPermissionProperties: ScriptPermissionProperty[];
/** @type {null | "global" | "Hide" | "Block"} */
declare let PreferenceScriptHelp: null | "global" | "Hide" | "Block";
/** @type {null | ReturnType<typeof setTimeout>} */
declare let PreferenceScriptTimeoutHandle: null | ReturnType<typeof setTimeout>;
/** @type {null | number} */
declare let PreferenceScriptTimer: null | number;
declare let PreferenceScriptWarningAccepted: boolean;
declare const ScriptPermissionLevel: Readonly<{
    SELF: "Self";
    OWNER: "Owner";
    LOVERS: "Lovers";
    FRIENDS: "Friends";
    WHITELIST: "Whitelist";
    PUBLIC: "Public";
}>;
declare const ScriptPermissionBits: Readonly<{
    Self: 1;
    Owner: 2;
    Lovers: 4;
    Friends: 8;
    Whitelist: 16;
    Public: 32;
}>;
declare const maxScriptPermission: number;
declare namespace PreferenceActivityEnjoymentDefault {
    let Name: ActivityName | undefined;
    let Self: ArousalFactor;
    let Other: ArousalFactor;
}
declare namespace PreferenceActivityEnjoymentValidate {
    let Name_1: (arg: ActivityName, C: Character) => ActivityName;
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
declare var PreferenceArousalFetishValidate: {
    Name: (arg: FetishName, C: Character) => FetishName;
    Factor: (arg: ArousalFactor, C: Character) => ArousalFactor;
};
declare namespace PreferenceArousalZoneDefault {
    let Name_3: AssetGroupItemName | undefined;
    export { Name_3 as Name };
    let Factor_1: ArousalFactor;
    export { Factor_1 as Factor };
    export let Orgasm: boolean;
}
declare namespace PreferenceArousalZoneValidate {
    let Name_4: (arg: AssetGroupName, C: Character) => AssetGroupItemName;
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
declare var PreferenceArousalSettingsValidate: {
    Active: (arg: ArousalActiveName, C: Character) => ArousalActiveName;
    Visible: (arg: ArousalVisibleName, C: Character) => ArousalVisibleName;
    ShowOtherMeter: (arg: boolean, C: Character) => boolean;
    AffectExpression: (arg: boolean, C: Character) => boolean;
    AffectStutter: (arg: ArousalAffectStutterName, C: Character) => ArousalAffectStutterName;
    VFX: (arg: SettingsVFXName, C: Character) => SettingsVFXName;
    VFXVibrator: (arg: SettingsVFXVibratorName, C: Character) => SettingsVFXVibratorName;
    VFXFilter: (arg: SettingsVFXFilterName, C: Character) => SettingsVFXFilterName;
    Progress: (arg: number, C: Character) => number;
    ProgressTimer: (arg: number, C: Character) => number;
    VibratorLevel: (arg: 0 | 2 | 1 | 3 | 4, C: Character) => 0 | 2 | 1 | 3 | 4;
    ChangeTime: (arg: number, C: Character) => number;
    Activity: (arg: ActivityEnjoyment[], C: Character) => ActivityEnjoyment[];
    Zone: (arg: ArousalZone[], C: Character) => ArousalZone[];
    Fetish: (arg: ArousalFetish[], C: Character) => ArousalFetish[];
    OrgasmTimer: (arg: number, C: Character) => number;
    OrgasmStage: (arg: 0 | 2 | 1, C: Character) => 0 | 2 | 1;
    OrgasmCount: (arg: number, C: Character) => number;
    DisableAdvancedVibes: (arg: boolean, C: Character) => boolean;
};
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
declare var PreferenceOnlineSharedSettingsValidate: {
    AllowFullWardrobeAccess: (arg: boolean, C: Character) => boolean;
    BlockBodyCosplay: (arg: boolean, C: Character) => boolean;
    AllowPlayerLeashing: (arg: boolean, C: Character) => boolean;
    DisablePickingLocksOnSelf: (arg: boolean, C: Character) => boolean;
    GameVersion: (arg: string, C: Character) => string;
    ItemsAffectExpressions: (arg: boolean, C: Character) => boolean;
    ScriptPermissions: (arg: ScriptPermissions, C: Character) => ScriptPermissions;
    WheelFortune: (arg: string, C: Character) => string;
};
/**
 * An object defining which genders a setting is active for
 */
type GenderSetting = {
    /**
     * - Whether the setting is active for female cases
     */
    Female: boolean;
    /**
     * - Whether the setting is active for male cases
     */
    Male: boolean;
};
