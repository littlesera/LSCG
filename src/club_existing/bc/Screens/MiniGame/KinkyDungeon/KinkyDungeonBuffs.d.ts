declare function KinkyDungeonSendBuffEvent(Event: any, data: any): void;
declare function KinkyDungeonTickBuffs(list: any, delta: any, endFloor: any, entity: any): void;
declare function KinkyDungeonTickBuffTag(list: any, tag: any, Amount?: number): void;
/**
 *
 * @param {entity} entity
 * @param {string} tag
 * @returns {boolean}
 */
declare function KDEntityHasBuffTags(entity: entity, tag: string): boolean;
/**
 *
 * @param {entity} entity
 * @param {string} tag
 * @returns {Record<string, any>}
 */
declare function KDGetBuffsWithTag(entity: entity, tag: string): Record<string, any>;
/**
 *
 * @param {entity} entity
 * @param {string[]} tags
 */
declare function KinkyDungeonRemoveBuffsWithTag(entity: entity, tags: string[]): void;
declare function KinkyDungeonUpdateBuffs(delta: any, endFloor: any): void;
declare function KinkyDungeonGetBuffedStat(list: any, Stat: any, onlyPositiveDuration: any): number;
declare function KinkyDungeonExpireBuff(list: any, key: any): void;
declare function KinkyDungeonApplyBuffToEntity(entity: any, origbuff: any, changes: any): void;
declare function KinkyDungeonApplyBuff(list: any, origbuff: any, changes: any): void;
declare function KinkyDungeonGetbuff(list: any, Buff: any): any;
declare function KinkyDungeonHasBuff(list: any, Buff: any): boolean;
declare function KDEntityHasBuff(entity: any, buff: any): boolean;
declare function KDEntityBuffedStat(entity: any, stat: any): number;
declare function KDEntityGetBuff(entity: any, buff: any): any;
