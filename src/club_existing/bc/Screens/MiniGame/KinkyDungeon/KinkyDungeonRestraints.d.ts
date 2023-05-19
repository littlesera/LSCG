/**
 *
 * @returns {number}
 */
declare function KDGetWillPenalty(): number;
/**
 * gets a restraint
 * @param {item} item
 * @returns {restraint}
 */
declare function KDRestraint(item: item): restraint;
/**
 * gets a restraint
 * @param {item} item
 * @returns {boolean}
 */
declare function KDItemIsMagic(item: item): boolean;
/**
 *
 * @param {entity} Entity
 * @param {number} CamX
 * @param {number} CamY
 * @returns {void}
 */
declare function KinkyDungeonDrawTether(Entity: entity, CamX: number, CamY: number): void;
declare function KDIsPlayerTethered(): boolean;
declare function KinkyDungeonAttachTetherToEntity(dist: any, entity: any): void;
declare function KDBreakTether(): void;
/**
 *
 * @param {boolean} Msg
 * @param {entity} Entity
 * @param {number} [xTo]
 * @param {number} [yTo]
 * @returns {boolean}
 */
declare function KinkyDungeonUpdateTether(Msg: boolean, Entity: entity, xTo?: number, yTo?: number): boolean;
/**
 * Gets the length of the neck tether
 * @returns {number}
 */
declare function KinkyDungeonTetherLength(): number;
/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
declare function KinkyDungeonKeyGetPickBreakChance(modifier?: number): number;
/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
declare function KinkyDungeonGetKnifeBreakChance(modifier?: number): number;
/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
declare function KinkyDungeonGetEnchKnifeBreakChance(modifier?: number): number;
declare function KinkyDungeonIsLockable(restraint: any): boolean;
/**
 *
 * @param {item} item
 * @param {string} lock
 */
declare function KinkyDungeonLock(item: item, lock: string): void;
/**
 *
 * @param {string} shrine
 * @returns {item[]}
 */
declare function KinkyDungeonGetRestraintsWithShrine(shrine: string, ignoreGold: any, recursive: any): item[];
/**
 *
 * @param {string} shrine
 * @returns {number}
 */
declare function KinkyDungeonRemoveRestraintsWithShrine(shrine: string, maxCount: any, recursive: any, noPlayer: any, ignoreGold: any): number;
/**
 *
 * @param {string} shrine
 * @returns {number}
 */
declare function KinkyDungeonUnlockRestraintsWithShrine(shrine: string): number;
/**
 *
 * @returns {item[]}
 */
declare function KinkyDungeonPlayerGetLockableRestraints(): item[];
/**
 * @param {string[]} Locks
 * @returns {item[]}
 */
declare function KinkyDungeonPlayerGetRestraintsWithLocks(Locks: string[], recursive: any): item[];
/**
 *
 * @param {string} lock
 */
declare function KinkyDungeonRemoveKeysUnlock(lock: string): void;
/**
 *
 * @param {string} lock
 * @returns {string}
 */
declare function KinkyDungeonGetKey(lock: string): string;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonHasGhostHelp(): boolean;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonHasAllyHelp(): boolean;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonHasAngelHelp(): boolean;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonIsWearingLeash(): boolean;
/**
 *
 * @param {boolean} Message - Show a message?
 * @param {string} affinity
 * @returns {boolean}
 */
declare function KinkyDungeonGetAffinity(Message: boolean, affinity: string, group: any): boolean;
declare function KinkyDungeonWallCrackAndKnife(Message: any): boolean;
/**
 * Determines if the entire dynamic item tree has at least one inaccessable item
 * @param {item} item
 * @returns {boolean}
 */
declare function KDIsTreeAccessible(item: item): boolean;
/**
 * Determines if the entire dynamic item tree has at least one chastity item
 * @param {item} item
 * @returns {boolean}
 */
declare function KDIsTreeChastity(item: item): boolean;
/**
 * Determines if the entire dynamic item tree has at least one chastity bra item
 * @param {item} item
 * @returns {boolean}
 */
declare function KDIsTreeChastityBra(item: item): boolean;
/**
 *
 * @param {string} Group - Group
 * @param {boolean} [External] - By enemies or by player?
 * @returns {boolean}
 */
declare function KDGroupBlocked(Group: string, External?: boolean): boolean;
declare function KinkyDungeonCanUseKey(): boolean;
/**
 *
 * @param {boolean} [ApplyGhost] - Can you receive help in this context?
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
declare function KinkyDungeonIsHandsBound(ApplyGhost?: boolean, Other?: boolean): boolean;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonCanUseFeet(): boolean;
/**
 *
 * @param {boolean} [ApplyGhost]
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
declare function KinkyDungeonIsArmsBound(ApplyGhost?: boolean, Other?: boolean): boolean;
/**
 *
 * @param {boolean} ApplyGhost
 * @param {string} Group
 * @param {item} [excludeItem]
 * @returns {number}
 */
declare function KinkyDungeonStrictness(ApplyGhost: boolean, Group: string, excludeItem?: item): number;
/**
 * Gets the list of restraint nammes affecting the Group
 * @param {string} Group
 * @param {item} excludeItem
 * @returns {string[]}
 */
declare function KinkyDungeonGetStrictnessItems(Group: string, excludeItem: item): string[];
/**
 *
 * @returns {number}
 */
declare function KinkyDungeonGetPickBaseChance(): number;
/**
 *
 * @returns {boolean}
 */
declare function KinkyDungeonPickAttempt(): boolean;
/**
 *
 * @param {string} lock
 * @returns {boolean}
 */
declare function KinkyDungeonUnlockAttempt(lock: string): boolean;
/** Gets the affinity of a restraint */
declare function KDGetRestraintAffinity(item: any, data: any): any;
declare function KDGetEscapeChance(restraint: any, StruggleType: any, escapeChancePre: any, limitChancePre: any, ApplyGhost: any, ApplyPlayerBonus: any, Msg: any): {
    escapeChance: any;
    limitChance: any;
};
declare function KDGetDynamicItem(group: any, index: any): {
    restraint: item;
    host: item;
};
/**
 *
 * @param {string} struggleGroup
 * @param {string} StruggleType
 * @returns {string}
 */
declare function KinkyDungeonStruggle(struggleGroup: string, StruggleType: string, index: any): string;
/**
 * "Return the first restraint item in the game that belongs to the given group."
 * @param {string} group - The group of the restraint item you want to get.
 * @returns {item} The item that matches the group.
 */
declare function KinkyDungeonGetRestraintItem(group: string): item;
/**
 * Refreshes the restraints map
 */
declare function KinkyDungeonRefreshRestraintsCache(): void;
/**
 *
 * @param {string} Name
 * @returns {restraint}
 */
declare function KinkyDungeonGetRestraintByName(Name: string): restraint;
/**
 *
 * @param {string} Lock
 * @returns {number}
 */
declare function KinkyDungeonGetLockMult(Lock: string): number;
/**
 *
 * @param {KDHasTags} enemy
 * @param {*} Level
 * @param {*} Index
 * @param {*} Bypass
 * @param {*} Lock
 * @param {*} RequireWill
 * @param {*} LeashingOnly
 * @param {*} NoStack
 * @param {*} extraTags
 * @param {*} agnostic - Determines if playertags and current bondage are ignored
 * @param {{minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[]}} [filter] - Filters for items
 * @returns
 */
declare function KinkyDungeonGetRestraint(enemy: KDHasTags, Level: any, Index: any, Bypass: any, Lock: any, RequireWill: any, LeashingOnly: any, NoStack: any, extraTags: any, agnostic: any, filter?: {
    minPower?: number;
    maxPower?: number;
    onlyLimited?: boolean;
    noUnlimited?: boolean;
    noLimited?: boolean;
    onlyUnlimited?: boolean;
    ignore?: string[];
    require?: string[];
    looseLimit?: boolean;
    ignoreTags?: string[];
}): restraint;
declare function KinkyDungeonUpdateRestraints(delta: any): Map<any, any>;
/**
 *
 * @param {item} item
 * @param {boolean} [NoLink]
 * @param {restraint} [toLink]
 * @returns
 */
declare function KinkyDungeonRestraintPower(item: item, NoLink?: boolean, toLink?: restraint): number;
/**
 * @param {restraint} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [item]
 * @param {string} [newLock]
 * @returns {boolean}
 */
declare function KinkyDungeonLinkableAndStricter(oldRestraint: restraint, newRestraint: restraint, item?: item, newLock?: string): boolean;
declare function KinkyDungeonGenerateRestraintTrap(): string;
declare function KDGetLockVisual(item: any): string;
/**
 *
 * @param {restraint} restraint
 * @param {boolean} Bypass
 * @param {boolean} NoStack
 * @param {string} Lock
 * @param {item} [r]
 * @param {boolean} [Deep]
 * @param {boolean} [noOverpower]
 * @returns {boolean} - Restraint can be added
 */
declare function KDCanAddRestraint(restraint: restraint, Bypass: boolean, Lock: string, NoStack: boolean, r?: item, Deep?: boolean, noOverpower?: boolean): boolean;
/**
 * Returns the first restraint in the stack that can link the given restraint
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @param {boolean} [Deep] - Whether or not it can look deeper into the stack
 * @returns {item}
 */
declare function KDGetLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean, Deep?: boolean): item;
/**
 * Returns whether or not the restraint can go under the currentRestraint
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @returns {boolean}
 */
declare function KDCanLinkUnder(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean): boolean;
/**
 *
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @returns {boolean}
 */
declare function KDCheckLinkSize(currentRestraint: item, restraint: restraint, bypass?: boolean, NoStack?: boolean): boolean;
/**
 * @param {restraint | string} restraint
 * @param {number} [Tightness]
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Trapped]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {string} [faction]
 * @param {boolean} [Deep] - whether or not it can go deeply in the stack
 * @param {string} [Curse] - Curse to apply
 * @returns {number}
 */
declare function KinkyDungeonAddRestraintIfWeaker(restraint: restraint | string, Tightness?: number, Bypass?: boolean, Lock?: string, Keep?: boolean, Trapped?: boolean, events?: KinkyDungeonEvent[], faction?: string, Deep?: boolean, Curse?: string): number;
/**
 *
 * @param {restraint} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [item]
 * @returns {boolean}
 */
declare function KinkyDungeonIsLinkable(oldRestraint: restraint, newRestraint: restraint, item?: item): boolean;
/**
 * Checks if all the items linked under allow this item
 * @param {item} oldRestraint
 * @param {restraint} newRestraint
 * @returns {boolean}
 */
declare function KDCheckLinkTotal(oldRestraint: item, newRestraint: restraint): boolean;
/**
 * Gets the linkability cache
 * @param {item} restraint
 */
declare function KDUpdateLinkCaches(restraint: item): void;
/**
 * Gets the linkability cache
 * @param {item} restraint
 * @returns {string[]}
 */
declare function KDGetLinkCache(restraint: item): string[];
/**
 * @param {restraint} restraint
 * @param {number} Tightness
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Link]
 * @param {boolean} [SwitchItems]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {boolean} [Unlink]
 * @param {string} [faction]
 * @param {item} [dynamicLink]
 * @param {string} [Curse] - Curse to apply
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch messages
 * @returns
 */
declare function KinkyDungeonAddRestraint(restraint: restraint, Tightness: number, Bypass?: boolean, Lock?: string, Keep?: boolean, Link?: boolean, SwitchItems?: boolean, events?: KinkyDungeonEvent[], faction?: string, Unlink?: boolean, dynamicLink?: item, Curse?: string, autoMessage?: boolean): number;
/**
 * It removes a restraint from the player
 * @param {string} Group - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {boolean} [Shrine] - If the item is being removed from a shrine, this is true.
 * @param {boolean} [UnLink] - If the item is being removed as part of an unlinking process
 * @param {entity} [Remover] - Who removes this
 * @returns {boolean} true if the item was removed, false if it was not.
 */
declare function KinkyDungeonRemoveRestraint(Group: string, Keep?: boolean, Add?: boolean, NoEvent?: boolean, Shrine?: boolean, UnLink?: boolean, Remover?: entity): boolean;
declare function KDIInsertRestraintUnderneath(restraint: any): boolean;
/**
 * It removes the item's dynamic link
 * @param {item} hostItem - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {entity} [Remover] - Who removes this
 * @returns {boolean} true if the item was removed, false if it was not.
 */
declare function KinkyDungeonRemoveDynamicRestraint(hostItem: item, Keep?: boolean, NoEvent?: boolean, Remover?: entity): boolean;
/**
 * "Returns an array of all the shrine types that have at least one restraint item."
 *
 * The function takes one argument, `ShrineFilter`, which is an array of shrine types. If the argument is not provided, the
 * function will return all shrine types. If the argument is provided, the function will only return shrine types that are
 * in the argument
 * @param ShrineFilter - An array of strings, each string being the name of a shrine.
 * @returns An array of all the restraint types that can be used in the shrine.
 */
declare function KinkyDungeonRestraintTypes(ShrineFilter: any): string[];
/**
 *
 * @param {restraint} newRestraint
 * @param {item} oldItem
 * @param {number} tightness
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {string} [faction]
 * @param {string} [Curse]
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch a message
 * @returns {boolean}
 */
declare function KinkyDungeonLinkItem(newRestraint: restraint, oldItem: item, tightness: number, Lock?: string, Keep?: boolean, faction?: string, Curse?: string, autoMessage?: boolean): boolean;
/**
 *
 * @param {item} item
 * @param {boolean} Keep
 * @returns
 */
declare function KinkyDungeonUnLinkItem(item: item, Keep: boolean, dynamic: any): boolean;
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {{aoe: number, number: number, dist: number, kind: string, duration?: number, durationExtra?: number}} options
 */
declare function KDCreateDebris(x: number, y: number, options: {
    aoe: number;
    number: number;
    dist: number;
    kind: string;
    duration?: number;
    durationExtra?: number;
}): void;
/**
 *
 * @param {string} StruggleType
 * @param {item} restraint
 * @param {KDLockType} lockType
 * @param {number} index
 * @param {any} data
 * @param {item} host
 */
declare function KDSuccessRemove(StruggleType: string, restraint: item, lockType: KDLockType, index: number, data: any, host: item): boolean;
declare function KDAddDelayedStruggle(amount: any, time: any, StruggleType: any, struggleGroup: any, index: any, data: any, progress?: number, limit?: number): void;
declare let KinkyDungeonRestraintsLocked: any[];
declare let KDWillEscapePenalty: number;
declare let KDWillEscapePenaltyArms: number;
declare let KDWillEscapePenaltyStart: number;
declare let KDWillEscapePenaltyStartArms: number;
declare let KDWillEscapePenaltyEnd: number;
declare let KDMinEscapeRate: number;
declare let KDMinPickRate: number;
declare let KDStruggleTime: number;
declare let KinkyDungeonCurrentEscapingItem: any;
declare let KinkyDungeonCurrentEscapingMethod: any;
declare let KinkyDungeonStruggleTime: number;
declare let KinkyDungeonMultiplayerInventoryFlag: boolean;
declare let KinkyDungeonItemDropChanceArmsBound: number;
declare let KinkyDungeonKeyJamChance: number;
declare let KinkyDungeonKeyPickBreakAmount: number;
declare let KinkyDungeonKeyPickBreakAmountBase: number;
declare let KinkyDungeonPickBreakProgress: number;
declare let KinkyDungeonKnifeBreakAmount: number;
declare let KinkyDungeonKnifeBreakAmountBase: number;
declare let KinkyDungeonKnifeBreakProgress: number;
declare let KinkyDungeonEnchKnifeBreakAmount: number;
declare let KinkyDungeonEnchKnifeBreakAmountBase: number;
declare let KinkyDungeonEnchKnifeBreakProgress: number;
declare let KinkyDungeonMaxImpossibleAttempts: number;
declare let KinkyDungeonEnchantedKnifeBonus: number;
declare let KDLocksmithBonus: number;
declare let KDLocksmithSpeedBonus: number;
declare let KDCluelessBonus: number;
declare let KDCluelessSpeedBonus: number;
declare let KDFlexibleBonus: number;
declare let KDFlexibleSpeedBonus: number;
declare let KDInflexibleBonus: number;
declare let KDInflexibleSpeedBonus: number;
declare let KDUnchainedBonus: number;
declare let KDDamselBonus: number;
declare let KDDamselPickAmount: number;
declare let KDArtistBonus: number;
declare let KDBunnyBonus: number;
declare let KDBunnyKnifeAmount: number;
declare let KDBunnyEnchKnifeAmount: number;
declare let KDSlipperyBonus: number;
declare let KDDollBonus: number;
declare let KDEscapeeBonus: number;
declare let KDDragonBonus: number;
declare let KDStrongBonus: number;
declare let KDWeakBonus: number;
declare let KDBondageLoverAmount: number;
/**
 * @type {Map<string, restraint>}
 */
declare let KinkyDungeonRestraintsCache: Map<string, restraint>;
declare const KinkyDungeonStrictnessTable: Map<string, string[]>;
/**
 * @type {Map<string, {r: restraint, w:number}[]>}
 */
declare let KDRestraintsCache: Map<string, {
    r: restraint;
    w: number;
}[]>;
declare let KDLeashPullCost: number;
declare let KDLeashPullKneelTime: number;
declare namespace KDUnboundAffinityOverride {
    const Sticky: boolean;
    const Edge: boolean;
    const Hook: boolean;
}
/** Tags which the 'agnostic' option on KinkyDungeonGetRestraint does not override */
declare let KDNoOverrideTags: string[];
declare let KinkyDungeonRestraintAdded: boolean;
declare let KinkyDungeonCancelFlag: boolean;
