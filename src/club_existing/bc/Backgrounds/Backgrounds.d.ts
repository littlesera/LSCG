/**
 * Builds the selectable background arrays based on the tags supplied
 * @param {readonly BackgroundTag[]} BackgroundTagList - An array of string of all the tags to load
 * @returns {string[]} - The list of all background names
 */
declare function BackgroundsGenerateList(BackgroundTagList: readonly BackgroundTag[]): string[];
declare const BackgroundsTagNone: "Filter by tag";
declare const BackgroundsTagIndoor: "Indoor";
declare const BackgroundsTagOutdoor: "Outdoor";
declare const BackgroundsTagAquatic: "Aquatic";
declare const BackgroundsTagSpecial: "Special Events";
declare const BackgroundsTagSciFiFantasy: "SciFi & Fantasy";
declare const BackgroundsTagClub: "Club & College";
declare const BackgroundsTagHouse: "Regular house";
declare const BackgroundsTagDungeon: "Dungeon";
declare const BackgroundsTagAsylum: "Asylum";
/**
 * List of all tags to create online chat rooms
 * @constant
 * @type {BackgroundTag[]}
 */
declare const BackgroundsTagList: BackgroundTag[];
/**
 * List of all tags to setup your main hall or private room
 * @constant
 * @type {BackgroundTag[]}
 */
declare const BackgroundsPrivateRoomTagList: BackgroundTag[];
/**
 * List of all the common backgrounds.
 * @constant
 * @type {{ Name: string; Tag: BackgroundTag[]; }[]}
 */
declare const BackgroundsList: {
    Name: string;
    Tag: BackgroundTag[];
}[];
