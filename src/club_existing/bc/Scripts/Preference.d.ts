/**
 * Get the sensory deprivation setting for the player
 * @returns {boolean} - Return true if sensory deprivation is active, false otherwise
 */
declare function PreferenceIsPlayerInSensDep(): boolean;
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
 * Sets the love factor of a sexual activity for the character
 * @param {Character} C - The character for whom the activity factor should be set
 * @param {ActivityName} Type - The type of the activity that is performed
 * @param {boolean} Self - Determines, if the current player is giving (false) or receiving (true)
 * @param {ArousalFactor} Factor - The factor of the sexual activity (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceSetActivityFactor(C: Character, Type: ActivityName, Self: boolean, Factor: ArousalFactor): void;
/**
 * Gets the factor of a fetish for the player, "2" for normal is default if factor isn't found
 * @param {Character} C - The character to query
 * @param {FetishName} Type - The name of the fetish
 * @returns {ArousalFactor} - Returns the love factor of the fetish for the character (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceGetFetishFactor(C: Character, Type: FetishName): ArousalFactor;
/**
 * Sets the arousal factor of a fetish for a character
 * @param {Character} C - The character to set
 * @param {FetishName} Type - The name of the fetish
 * @param {ArousalFactor} Type - New arousal factor for that fetish (0 is horrible, 2 is normal, 4 is great)
 * @returns {void} - Nothing
 */
declare function PreferenceSetFetishFactor(C: Character, Type: FetishName, Factor: any): void;
/**
 * Validates the character arousal object and converts it's objects to compressed string if needed
 * @param {number} Factor - The factor of enjoyability from 0 (turn off) to 4 (very high)
 * @param {boolean} Orgasm - Whether the zone can give an orgasm
 * @returns {string} - A string of 1 char that represents the compressed zone
 */
declare function PreferenceArousalFactorToChar(Factor?: number, Orgasm?: boolean): string;
/**
 * Validates the character arousal object and converts it's objects to compressed string if needed
 * @param {number} Factor1 - The first factor of enjoyability from 0 (turn off) to 4 (very high)
 * @param {number} Factor2 - The second factor of enjoyability from 0 (turn off) to 4 (very high)
 * @returns {string} - A string of 1 char that represents the compressed zone
 */
declare function PreferenceArousalTwoFactorToChar(Factor1?: number, Factor2?: number): string;
/**
 * Gets the corresponding arousal zone definition from a player's preferences (if the group's activities are mirrored,
 * returns the arousal zone definition for the mirrored group).
 * @param {Character} C - The character for whom to get the arousal zone
 * @param {AssetGroupName} ZoneName - The name of the zone to get
 * @returns {null | ArousalZone} - Returns the arousal zone preference object,
 * or null if a corresponding zone definition could not be found.
 */
declare function PreferenceGetArousalZone(C: Character, ZoneName: AssetGroupName): null | ArousalZone;
/**
 * Gets the love factor of a zone for the character
 * @param {Character} C - The character for whom the love factor of a particular zone should be gotten
 * @param {AssetGroupName} ZoneName - The name of the zone to get the love factor for
 * @returns {ArousalFactor} - Returns the love factor of a zone for the character (0 is horrible, 2 is normal, 4 is great)
 */
declare function PreferenceGetZoneFactor(C: Character, ZoneName: AssetGroupName): ArousalFactor;
/**
 * Sets the love factor for a specific body zone on the player
 * @param {Character} C - The character, for whom the love factor of a particular zone should be set
 * @param {AssetGroupName} ZoneName - The name of the zone, the factor should be set for
 * @param {ArousalFactor} Factor - The factor of the zone (0 is horrible, 2 is normal, 4 is great)
 * @returns {void} - Nothing
 */
declare function PreferenceSetZoneFactor(C: Character, ZoneName: AssetGroupName, Factor: ArousalFactor): void;
/**
 * Determines, if a player can reach on orgasm from a particular zone
 * @param {Character} C - The character whose ability to orgasm we check
 * @param {AssetGroupName} ZoneName - The name of the zone to check
 * @returns {boolean} - Returns true if the zone allows orgasms for a character, false otherwise
 */
declare function PreferenceGetZoneOrgasm(C: Character, ZoneName: AssetGroupName): boolean;
/**
 * Sets the ability to induce an orgasm for a given zone*
 * @param {Character} C - The characterfor whom we set the ability to órgasm from a given zone
 * @param {AssetGroupItemName} ZoneName - The name of the zone to set the ability to orgasm for
 * @param {boolean} CanOrgasm - Sets, if the character can cum from the given zone (true) or not (false)
 * @returns {void} - Nothing
 */
declare function PreferenceSetZoneOrgasm(C: Character, ZoneName: AssetGroupItemName, CanOrgasm: boolean): void;
/**
 * Checks, if the arousal activity controls must be activated
 * @returns {boolean} - Returns true if we must activate the preference controls, false otherwise
 */
declare function PreferenceArousalIsActive(): boolean;
/**
 * Initialize and validates the character settings
 * @param {Character} C - The character, whose preferences are initialized
 * @returns {void} - Nothing
 */
declare function PreferenceInit(C: Character): void;
/**
 * Initialise a Gender setting
 * @returns {GenderSetting} - The setting to use
 */
declare function PreferenceInitGenderSetting(): GenderSetting;
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
 * Migrates a named preference from one preference object to another if not already migrated
 * @param {object} from - The preference object to migrate from
 * @param {object} to - The preference object to migrate to
 * @param {string} prefName - The name of the preference to migrate
 * @param {any} defaultValue - The default value for the preference if it doesn't exist
 * @returns {void} - Nothing
 */
declare function PreferenceMigrate(from: object, to: object, prefName: string, defaultValue: any): void;
