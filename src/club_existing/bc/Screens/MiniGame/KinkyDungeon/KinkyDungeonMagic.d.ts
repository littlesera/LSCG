declare function KinkyDungeonSearchSpell(list: any, name: any): any;
declare function KinkyDungeonFindSpell(name: any, SearchEnemies: any): any;
declare function KinkyDungeonDisableSpell(Name: any): void;
declare function KinkyDungeonResetMagic(): void;
/**
 *
 * @param {string} name
 * @returns {boolean}
 */
declare function KDHasSpell(name: string): boolean;
/**
 *
 * @param {string} name
 * @param {number} Level - Spell level. Set to -1 to allow any level
 * @returns {spell}
 */
declare function KDGetUpcast(name: string, Level: number): spell;
/**
 *
 * @param {string} name
 * @returns {boolean}
 */
declare function KDHasUpcast(name: string): boolean;
/**
 *
 * @returns {boolean}
 */
declare function KDCanUpcast(): boolean;
declare function KDEmpower(data: any, entity: any): void;
declare function KinkyDungeoCheckComponents(spell: any, x: any, y: any): string[];
declare function KinkyDungeonHandleSpellChoice(SpellChoice: any): any;
declare function KDSpellIgnoreComp(spell: any): boolean;
declare function KinkyDungeonHandleSpellCast(spell: any): any;
declare function KinkyDungeonClickSpell(i: any): {
    spell: any;
    clicked: boolean;
};
declare function KinkyDungeonHandleSpell(): boolean;
declare function KinkyDungeonGetManaCost(Spell: any): any;
declare function KinkyDungeonGetCost(Spell: any): any;
declare function KinkyDungeonMakeNoise(radius: any, noiseX: any, noiseY: any): void;
/**
 *
 * @param {number} targetX
 * @param {number} targetY
 * @param {spell} spell
 * @param {*} enemy
 * @param {*} player
 * @param {*} bullet
 * @param {string} [forceFaction]
 * @param {any} [castData]
 * @returns {{result: string, data: any}}
 */
declare function KinkyDungeonCastSpell(targetX: number, targetY: number, spell: spell, enemy: any, player: any, bullet: any, forceFaction?: string, castData?: any): {
    result: string;
    data: any;
};
declare function KinkyDungeonClickSpellChoice(I: any, CurrentSpell: any): void;
declare function KinkyDungeonHandleMagic(): boolean;
declare function KDGetPrerequisite(spell: any): string;
declare function KinkyDungeonCheckSpellPrerequisite(spell: any): boolean;
declare function KinkyDungeonDetectLanguageForMaxWidth(str: any, maxWidthTranslate: any, maxWidthEnglish: any): any;
declare function KinkyDungeonWordWrap(str: any, maxWidthTranslate: any, maxWidthEnglish: any): string;
declare function KinkyDungeonTestWhite(x: any): boolean;
declare function KDSchoolColor(school: any): string;
declare function KinkyDungeonDrawMagic(): void;
declare function KDFilterSpellPages(): string[][][];
declare function KDFilterSpellPageNames(): string[];
declare function KDCorrectCurrentSpellPage(pages: any): number;
declare function KinkyDungeonListSpells(Mode: any): any;
declare function KinkyDungeonDrawMagicSpells(): void;
declare function KinkyDungeonHandleMagicSpells(): boolean;
declare function KinkyDungeonSpellIndex(Name: any): number;
declare function KinkyDungeonSetPreviewSpell(spell: any): void;
declare function KinkyDungeonGetCompList(spell: any): string;
declare function KinkyDungeonSendMagicEvent(Event: any, data: any, forceSpell: any): void;
declare function KDCastSpellToEnemies(fn: any, tX: any, tY: any, spell: any): boolean;
/**
 * Returns true if the enemy matches one of the tags
 * @param {string[]} tags
 * @param {entity} entity
 * @returns {boolean}
 */
declare function KDMatchTags(tags: string[], entity: entity): boolean;
declare let KinkyDungeonManaCost: number;
declare let KDEmpowerSprite: string;
declare let KDMaxEmpower: number;
declare let KinkyDungeonBookScale: number;
declare let KinkyDungeonMysticSeals: number;
declare let KinkyDungeonCurrentBook: string;
declare let KinkyDungeonCurrentPage: number;
declare let KinkyDungeonCurrentSpellsPage: number;
declare let KinkyDungeonBooks: string[];
declare let KinkyDungeonPreviewSpell: any;
declare let KinkyDungeonSpellChoices: number[];
declare let KinkyDungeonSpellChoicesToggle: boolean[];
declare let KinkyDungeonSpellChoiceCount: number;
declare let KinkyDungeonSpellChoiceCountPerPage: number;
declare let KDSpellPage: number;
declare let KinkyDungeonSpellOffset: number;
declare let KinkyDungeonSpellChoiceOffset: number;
declare let KDPlayerHitBy: any[];
declare let KinkyDungeonMiscastPityModifier: number;
declare let KinkyDungeonMiscastPityModifierIncrementPercentage: number;
declare let KinkyDungeonSpellPress: string;
declare let KDSwapSpell: number;
declare let selectedFilters: string[];
declare let genericfilters: string[];
declare let KDSpellListIndex: number;
declare let KDSpellListIndexVis: number;
declare let KDMaxSpellPerColumn: number;
declare let KDMaxSpellYY: number;
declare let MagicSpellsUIShift: number;
