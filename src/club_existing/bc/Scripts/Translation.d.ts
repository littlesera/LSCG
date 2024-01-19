/**
 * Checks whether we're running a translation
 */
declare function TranslationEnabled(): boolean;
/**
 * Checks if a file can be translated in the selected language
 * @param {string} FullPath - Full path of the file to check for a corresponding translation file
 * @returns {boolean} - Returns TRUE if a translation is available for the given file
 */
declare function TranslationAvailable(FullPath: string): boolean;
/**
 * Parse a TXT translation file and returns it as an array
 * @param {string} str - Content of the translation text file
 * @returns {string[]} - Array of strings with each line divided. For each translated line, the english string precedes the translated one in the array.
 */
declare function TranslationParseTXT(str: string): string[];
/**
 * Translates a string to another language from the array, the translation is always the one right after the english line
 * @param {string} S - The original english string to translate
 * @param {readonly string[]} T - The active translation dictionary
 * @returns {string} - The translated string
 */
declare function TranslationString(S: string, T: readonly string[]): string;
/**
 * Translates a character dialog from the specified array
 * @param {Character} C - The character for which we need to translate the dialog array.
 * @param {readonly string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
declare function TranslationDialogArray(C: Character, T: readonly string[]): void;
/**
 * Translates a set of tags. Rerenders the login message when on the login page.
 * @param {readonly { Tag: string, Value: string }[]} S - Array of current tag-value pairs
 * @param {readonly string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
declare function TranslationTextArray(S: readonly {
    Tag: string;
    Value: string;
}[], T: readonly string[]): void;
/**
 * Loads a character dialog translation and caches it
 * @param {Character} C - The character for which we want to translate the dialog
 * @returns {void} - Nothing
 */
declare function TranslationLoadDialog(C: Character, cb: any): void;
/**
 * Translate a character dialog if the file is in the dictionary
 * @param {Character} C
 */
declare function TranslationTranslateDialog(C: Character): void;
/**
 * Translate an array of tags in the current selected language
 * @param {readonly {Tag: string, Value: string}[]} Text - Array of current tag-value pairs
 * @returns {void} - Nothing
 */
declare function TranslationText(Text: readonly {
    Tag: string;
    Value: string;
}[]): void;
/**
 * Translates the asset group and asset descriptions based on the given dictionary
 * @param {string[]} T - The active translation dictionary
 * @returns {void} - Nothing
 */
declare function TranslationAssetProcess(T: string[]): void;
/**
 * Translates the description of the assets and groups of an asset family
 * @param {IAssetFamily} Family - Name of the asset family to translate
 * @returns {void} - Nothing
 */
declare function TranslationAsset(Family: IAssetFamily): void;
/**
 * Returns the translated language name for the given code.
 * @param {string} code - The language code to get the human-readable name of.
 * @param {boolean} [english] - Get the english name of it.
 */
declare function TranslationGetLanguageName(code: string, english?: boolean): string;
/**
 * Changes the current language and save the new selected language to local storage
 * @returns {void} - Nothing
 */
declare function TranslationNextLanguage(): void;
/**
 * Loads the previous translation language from local storage if it exists
 * @returns {void} - Nothing
 */
declare function TranslationLoad(): void;
declare var TranslationLanguage: string;
/** @type {Record<string, string[]>} */
declare var TranslationCache: Record<string, string[]>;
/**
 * Dictionary for all supported languages and their files
 * @constant
 */
declare var TranslationDictionary: {
    LanguageCode: string;
    LanguageName: string;
    EnglishName: string;
    Files: string[];
}[];
