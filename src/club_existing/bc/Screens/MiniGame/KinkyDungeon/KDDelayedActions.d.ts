/** Prunes delayed actions with tags
 * @param {string[]} tags
*/
declare function KDDelayedActionPrune(tags: string[]): void;
/**
 * Adds a delayed action
 * @param {KDDelayedAction} action
 */
declare function KDAddDelayedAction(action: KDDelayedAction): void;
/** This is processed for delayed actions
 * @type {Record<string, (action: KDDelayedAction) => void>}
 */
declare let KDDelayedActionUpdate: Record<string, (action: KDDelayedAction) => void>;
/** This is processed for delayed actions
 * @type {Record<string, (action: KDDelayedAction) => void>}
 */
declare let KDDelayedActionCommit: Record<string, (action: KDDelayedAction) => void>;
