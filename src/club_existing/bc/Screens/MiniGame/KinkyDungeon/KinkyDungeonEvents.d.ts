declare function KDMapHasEvent(map: any, event: any): boolean;
declare function KinkyDungeonSendEvent(Event: any, data: any, forceSpell: any): void;
/** Called during initialization */
declare function KinkyDungeonResetEventVariables(): void;
/** Called every tick */
declare function KinkyDungeonResetEventVariablesTick(delta: any): void;
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} kinkyDungeonEvent
 * @param {item} item
 * @param {*} data
 */
declare function KinkyDungeonHandleInventoryEvent(Event: string, kinkyDungeonEvent: KinkyDungeonEvent, item: item, data: any): void;
/**
 *
 * @param {string} Event
 * @param {any} buff
 * @param {any} entity
 * @param {*} data
 */
declare function KinkyDungeonHandleBuffEvent(Event: string, e: any, buff: any, entity: any, data: any): void;
/**
 *
 * @param {string} Event
 * @param {any} outfit
 * @param {*} data
 */
declare function KinkyDungeonHandleOutfitEvent(Event: string, e: any, outfit: any, data: any): void;
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {any} spell
 * @param {*} data
 */
declare function KinkyDungeonHandleMagicEvent(Event: string, e: KinkyDungeonEvent, spell: any, data: any): void;
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {weapon} weapon
 * @param {*} data
 */
declare function KinkyDungeonHandleWeaponEvent(Event: string, e: KinkyDungeonEvent, weapon: weapon, data: any): void;
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {any} b
 * @param {*} data
 */
declare function KinkyDungeonHandleBulletEvent(Event: string, e: KinkyDungeonEvent, b: any, data: any): void;
/**
 *
 * @param {string} Event
 * @param {KinkyDungeonEvent} e
 * @param {entity} enemy
 * @param {*} data
 */
declare function KinkyDungeonHandleEnemyEvent(Event: string, e: KinkyDungeonEvent, enemy: entity, data: any): void;
/**
 *
 * @param {string} Event
 * @param {*} data
 */
declare function KinkyDungeonHandleGenericEvent(Event: string, data: any): void;
declare function KDEventPrereq(e: any, item: any, tags: any): any;
declare let KinkyDungeonAttackTwiceFlag: boolean;
declare let KinkyDungeonSlimeParts: ({
    group: string;
    restraint: string;
    noUnmasked: boolean;
} | {
    group: string;
    restraint: string;
    noUnmasked?: undefined;
})[];
declare let KDAlertCD: number;
declare let KDEventDataReset: {};
declare namespace KDEventDataBase {
    const SlimeLevel: number;
    const SlimeLevelStart: number;
}
declare namespace KDEventData { }
/**
 * Function mapping
 * to expand, keep (e, item, data) => {...} as a constant API call
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, item, *): void>>}
 */
declare let KDEventMapInventory: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: item, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, entity, *): void>>}
 */
declare let KDEventMapBuff: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: any, arg2: entity, arg3: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
declare let KDEventMapOutfit: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: any, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
declare let KDEventMapSpell: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: any, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, weapon, *): void>>}
 */
declare let KDEventMapWeapon: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: weapon, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, *, *): void>>}
 */
declare let KDEventMapBullet: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: any, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(KinkyDungeonEvent, entity, *): void>>}
 */
declare let KDEventMapEnemy: {
    [x: string]: {
        [x: string]: (arg0: KinkyDungeonEvent, arg1: entity, arg2: any) => void;
    };
};
/**
 * @type {Object.<string, Object.<string, function(string, *): void>>}
 */
declare let KDEventMapGeneric: {
    [x: string]: {
        [x: string]: (arg0: string, arg1: any) => void;
    };
};
