/**
 *
 * @param {entity} enemy
 * @param {any} AIData
 */
declare function KDResetIntent(enemy: entity, AIData: any): void;
/**
 * Helper function called to leash player to the nearest furniture
 * @param {entity} enemy
 * @param {any} AIData
 * @returns {boolean}
 */
declare function KDSettlePlayerInFurniture(enemy: entity, AIData: any, tags: any, guardDelay?: number): boolean;
/**
 * Play is actions enemies do when they are NEUTRAL
 * @type {Record<string, EnemyEvent>}
 */
declare let KDIntentEvents: Record<string, EnemyEvent>;
