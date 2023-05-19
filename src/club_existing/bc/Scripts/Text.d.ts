/**
 * Finds the text value linked to the tag in the buffer
 * @param {string} TextTag - Tag for the text to find
 * @returns {string} - Returns the text associated to the tag, will return a missing tag text if the tag was not found.
 */
declare function TextGet(TextTag: string): string;
/**
 * Loads the CSV text file of the current screen into the buffer. It will get the CSV from the cache if the file was already fetched from
 * the server
 * @param {string} [TextGroup] - Screen for which to load the CSV of
 * @returns {void} - Nothing
 */
declare function TextLoad(TextGroup?: string): void;
/**
 * Cache the Module and TextGroup for later use, speeds up first use
 * @param {string} Module
 * @param {string} TextGroup
 */
declare function TextPrefetch(Module: string, TextGroup: string): void;
/** @type {TextCache | null} */
declare let TextScreenCache: TextCache | null;
/** @type {Map<string, TextCache>} */
declare const TextAllScreenCache: Map<string, TextCache>;
/**
 * A class that can be used to cache a simple key/value CSV file for easy text lookups. Text lookups will be automatically translated to
 * the game's current language, if a translation is available.
 */
declare class TextCache {
    /**
     * Creates a new TextCache from the provided CSV file path.
     * @param {string} path - The path to the CSV lookup file for this TextCache instance
     * @param {string} [warn] - prefix for warning when key is not found
     */
    constructor(path: string, warn?: string);
    path: string;
    warn: string;
    language: string;
    /** @type {Record<string, string>} */
    cache: Record<string, string>;
    /** @type {((cache?: TextCache) => void)[]} */
    rebuildListeners: ((cache?: TextCache) => void)[];
    loaded: boolean;
    /**
     * Looks up a string from this TextCache. If the cache contains a value for the provided key and a translation is available, the return
     * value will be automatically translated. Otherwise the EN string will be used. If the cache does not contain a value for the requested
     * key, the key will be returned.
     * @param {string} key - The text key to lookup
     * @returns {string} - The text value corresponding to the provided key, translated into the current language, if available
     */
    get(key: string): string;
    /**
     * Adds a callback function as a rebuild listener. Rebuild listeners will
     * be called whenever the cache has completed a rebuild (either after
     * initial construction, or after a language change).
     * @param {(cache?: TextCache) => void} callback - The callback to register
     * @param {boolean} [immediate] - Whether or not the callback should be called on registration
     * @returns {Function} - A callback function which can be used to unsubscribe the added listener
     */
    onRebuild(callback: (cache?: TextCache) => void, immediate?: boolean): Function;
    /**
     * Kicks off a build of the text lookup cache
     * @returns {void} - Nothing
     */
    buildCache(): void;
    /**
     * Fetches and parses the CSV file for this TextCache
     * @returns {Promise<string[][]>} - A promise resolving to an array of string arrays, corresponding to lines of CSV values in the CSV
     * file.
     */
    fetchCsv(): Promise<string[][]>;
    /**
     * Stores the contents of a CSV file in the TextCache's internal cache
     * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
     * @returns {void} - Nothing
     */
    cacheLines(lines: string[][]): void;
    /**
     * Translates the contents of a CSV file into the current game language
     * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
     * @returns {Promise<string[][]>} - A promise resolving to an array of string arrays corresponding to lines in the CSV file with the
     * values translated to the current game language
     */
    translate(lines: string[][]): Promise<string[][]>;
    /**
     * Maps lines of a CSV to equivalent CSV lines with values translated according to the corresponding translation file
     * @param {string[][]} lines - An array of string arrays corresponding to lines in the CSV file
     * @param {string[]} translations - An array of strings in translation file format (with EN and translated values on alternate lines)
     * @returns {string[][]} - An array of string arrays corresponding to lines in the CSV file with the
     * values translated to the current game language
     */
    buildTranslations(lines: string[][], translations: string[]): string[][];
}
