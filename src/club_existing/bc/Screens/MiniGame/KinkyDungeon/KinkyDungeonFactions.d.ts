/**
 * Determines if the enemy (which can be hostile) is aggressive, i.e. will pursue the player or ignore
 * @param {entity} [enemy]
 * @returns {boolean}
 */
declare function KinkyDungeonAggressive(enemy?: entity): boolean;
/**
 * Returns whether or not the enemy is ALLIED, i.e it will follow the player
 * @param {entity} enemy
 * @returns {boolean}
 */
declare function KDAllied(enemy: entity): boolean;
/**
 * Returns whether the enemy is HOSTILE to the player (if no optional argument) or the optional enemy
 * @param {entity} enemy
 * @param {entity} [enemy2]
 * @returns {boolean}
 */
declare function KDHostile(enemy: entity, enemy2?: entity): boolean;
/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
declare function KDGetFaction(enemy: entity): string;
/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
declare function KDGetFactionOriginal(enemy: entity): string;
/**
 * Consults the faction table and decides if the two mentioned factions are hostile
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @returns {boolean}
 */
declare function KDFactionHostile(a: string, b: string | entity): boolean;
/**
 * Consults the faction table and decides if the two mentioned factions are allied
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @param {number} [threshold] - Faction 2
 * @returns {boolean}
 */
declare function KDFactionAllied(a: string, b: string | entity, threshold?: number): boolean;
/**
 * Consults the faction table and decides if the two mentioned factions are favorable (i.e no friendly fire)
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @returns {boolean}
 */
declare function KDFactionFavorable(a: string, b: string | entity): boolean;
