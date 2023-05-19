declare function KDGetSleepWillFraction(): number;
declare function KDInitInventory(): void;
declare function KinkyDungeonDefaultStats(Load: any): void;
declare function KinkyDungeonGetVisionRadius(): number;
declare function KinkyDungeonInterruptSleep(): void;
declare function KDGetStamDamageThresh(): number;
declare function KinkyDungeonDealDamage(Damage: any, bullet: any, noAlreadyHit: any): {
    happened: any;
    string: string;
};
declare function KinkyDungeonUpdateDialogue(entity: any, delta: any): void;
/**
 *
 * @param {entity} entity
 * @param {string} dialogue
 * @param {string} color
 * @param {number} duration
 * @param {number} priority
 * @param {boolean} [force]
 * @param {boolean} [nooverride]
 */
declare function KinkyDungeonSendDialogue(entity: entity, dialogue: string, color: string, duration: number, priority: number, force?: boolean, nooverride?: boolean): void;
declare function KinkyDungeonChangeDistraction(Amount: any, NoFloater: any, lowerPerc: any, minimum?: number): void;
declare function KinkyDungeonChangeStamina(Amount: any, NoFloater: any, Pause: any, NoSlow: any, minimum?: number): void;
/**
 *
 * @param {number} Amount]
 * @param {boolean} [NoFloater]
 * @param {number} [PoolAmount]
 * @param {boolean} [Pause]
 * @param {boolean} [spill]
 */
declare function KinkyDungeonChangeMana(Amount: number, NoFloater?: boolean, PoolAmount?: number, Pause?: boolean, spill?: boolean, minimum?: number): void;
declare function KinkyDungeonChangeWill(Amount: any, NoFloater: any, minimum?: number): void;
declare function KinkyDungeonChangeCharge(Amount: any, NoFloater: any): void;
declare function KinkyDungeonHasStamina(Cost: any, AddRate: any): boolean;
declare function KinkyDungeonHasWill(Cost: any, AddRate: any): boolean;
declare function KinkyDungeonHasMana(Cost: any, AddRate: any): boolean;
declare function KinkyDungeonSetMaxStats(delta: any): {
    distractionRate: number;
    staminaRate: number;
};
declare function KinkyDungeonCanUseWeapon(NoOverride: any, e: any): boolean;
declare function KDGetDistractionRate(delta: any): number;
declare function KinkyDungeonUpdateStats(delta: any): void;
declare function KDGetEnvironmentalDmg(): number;
declare function KDUpdatePerksBonus(): void;
declare function KinkyDungeonCalculateMiscastChance(): void;
declare function KinkyDungeonGetBlindLevel(): number;
declare function KinkyDungeonCapStats(): void;
declare function KinkyDungeonLegsBlocked(): boolean;
declare function KinkyDungeonCanStand(): boolean;
declare function KinkyDungeonCanKneel(): boolean;
declare function KinkyDungeonCalculateSlowLevel(delta: any): void;
/**
 * Returns the total level of gagging, 1.0 or higher meaning "fully gagged" and 0.0 being able to speak.
 * @param   {boolean} [AllowFlags] - Whether or not flags such as allowPotions and blockPotions should override the final result
 * @return  {number} - The gag level, sum of all gag properties of worn restraints
 */
declare function KinkyDungeonGagTotal(AllowFlags?: boolean): number;
declare function KinkyDungeonCanTalk(Loose: any): boolean;
declare function KinkyDungeonCalculateSubmissiveMult(): number;
declare function KinkyDungeonCanPlayWithSelf(): boolean;
declare function KinkyDungeonCanTryOrgasm(): boolean;
/**
 * @param {number} [tease] - The teasing power
 * @returns {{orig: number, final: number}}
 */
declare function KDGetPlaySelfPower(tease?: number): {
    orig: number;
    final: number;
};
declare function KinkyDungeonDoPlayWithSelf(tease: any): number;
/**
 * Try to let go...
 * @param {number} [Bonus]
 */
declare function KinkyDungeonDoTryOrgasm(Bonus?: number): void;
declare function KinkyDungeonIsChaste(Breast: any): boolean;
declare function KinkyDungeonChastityMult(): number;
/**
 *
 * @param {any} buffs
 * @param {string} type
 * @returns {number}
 */
declare function KDBuffResist(buffs: any, type: string): number;
declare let KinkyDungeonPlayerEntity: any;
declare let KDSleepWillFraction: number;
declare let KDSleepWillFractionJail: number;
declare let KDMaxStat: number;
declare let KDMaxStatStart: number;
declare let KDMaxStatStartPool: number;
declare let KDStamDamageThresh: number;
declare let KDStamDamageThreshBonus: number;
declare let KDSleepRegenWill: number;
declare let KinkyDungeonStatDistractionMax: number;
declare let KinkyDungeonStatDistractionLower: number;
declare let KinkyDungeonStatDistractionLowerCap: number;
declare let KinkyDungeonStatArousalLowerRegenSleep: number;
declare let KinkyDungeonDistractionUnlockSuccessMod: number;
declare let KinkyDungeonStatDistraction: number;
declare let KinkyDungeonCrotchRopeDistraction: number;
declare let KinkyDungeonStatDistractionRegen: number;
declare let KinkyDungeonStatDistractionRegenPerUpgrade: number;
declare let KDNoUnchasteBraMult: number;
declare let KDNoUnchasteMult: number;
declare let KDDistractionDecayMultDistractionMode: number;
declare let KDDistractedAmount: number;
declare let KinkyDungeonStatDistractionMiscastChance: number;
declare let KinkyDungeonMiscastChance: number;
declare let KinkyDungeonVibeLevel: number;
declare let KinkyDungeonTeaseLevel: number;
declare let KinkyDungeonTeaseLevelBypass: number;
declare let KinkyDungeonOrgasmVibeLevel: number;
declare let KinkyDungeonDistractionPerVibe: number;
declare let KinkyDungeonDistractionPerPlug: number;
declare let KinkyDungeonVibeCostPerIntensity: number;
declare let KinkyDungeonStatWillpowerExhaustion: number;
declare let KinkyDungeonSleepTurnsMax: number;
declare let KinkyDungeonSlowMoveTurns: number;
declare let KinkyDungeonStatStaminaMax: number;
declare let KinkyDungeonStatStamina: number;
declare let KinkyDungeonStatStaminaRegen: number;
declare let KinkyDungeonStatStaminaRegenPerUpgrade: number;
declare let KinkyDungeonStatStaminaRegenPerUpgradeWill: number;
declare let KDNarcolepticRegen: number;
declare let KinkyDungeonStatStaminaRegenJail: number;
declare let KinkyDungeonStatStaminaRegenSleep: number;
declare let KinkyDungeonStatStaminaRegenSleepBedMultiplier: number;
declare let KinkyDungeonStatStaminaRegenWait: number;
declare let KinkyDungeoNStatStaminaLow: number;
declare let KDSprintCost: number;
declare let KDSprintCostSlowLevel: number[];
declare let KinkyDungeonStatWillMax: number;
declare let KinkyDungeonStatWill: number;
declare let KinkyDungeonStatWillRate: number;
declare let KinkyDungeonStatManaMax: number;
declare let KinkyDungeonStatMana: number;
declare let KinkyDungeonStatManaPool: number;
declare let KinkyDungeonStatManaPoolMax: number;
declare let KDManaPoolRatio: number;
declare let KinkyDungeonStatManaRate: number;
declare let KinkyDungeonStatManaRegen: number;
declare let KinkyDungeonStatManaLowRegen: number;
declare let KDMeditationRegen: number;
declare let KinkyDungeonStatManaRegenLowThreshold: number;
declare let KinkyDungeonStatManaPoolRegen: number;
declare let KinkyDungeonStatStaminaRegenPerSlowLevel: number;
declare let KinkyDungeonStatStaminaCostStruggle: number;
declare let KinkyDungeonStatStaminaCostRemove: number;
declare let KinkyDungeonStatStaminaCostTool: number;
declare let KinkyDungeonStatStaminaCostPick: number;
declare let KinkyDungeonStatWillCostStruggle: number;
declare let KinkyDungeonStatWillCostRemove: number;
declare let KinkyDungeonStatWillCostTool: number;
declare let KinkyDungeonStatWillCostPick: number;
declare let KinkyDungeonStatWillCostUnlock: number;
declare let KinkyDungeonStatWillCostEscape: number;
declare let KinkyDungeonStatWillBonusEscape: number;
declare let KinkyDungeonStaminaRate: number;
declare let KinkyDungeonStatBeltLevel: number;
declare let KinkyDungeonStatPlugLevel: number;
declare let KinkyDungeonPlugCount: number;
declare let KinkyDungeonStatVibeLevel: number;
declare let KinkyDungeonStatEdged: boolean;
declare let KinkyDungeonStatDistractionGainChaste: number;
declare let KinkyDungeonSlowLevel: number;
declare let KinkyDungeonMovePoints: number;
declare let KinkyDungeonBlindLevelBase: number;
declare let KinkyDungeonBlindLevel: number;
declare let KinkyDungeonStatBlind: number;
declare let KinkyDungeonStatFreeze: number;
declare let KinkyDungeonStatBind: number;
declare let KinkyDungeonDeaf: boolean;
declare let KinkyDungeonSleepiness: number;
declare let KinkyDungeonSleepinessMax: number;
declare let KinkyDungeonGold: number;
declare let KinkyDungeonLockpicks: number;
declare let KinkyDungeonRedKeys: number;
declare let KinkyDungeonBlueKeys: number;
declare let KinkyDungeonHasCrotchRope: boolean;
declare let KinkyDungeonTorsoGrabChance: number;
declare let KinkyDungeonTorsoGrabChanceBonus: number;
declare let KinkyDungeonWeaponGrabChance: number;
/**
 * Your inventory contains items that are on you
 * @type {Map<string, Map<string, item>>}
 */
declare let KinkyDungeonInventory: Map<string, Map<string, item>>;
declare let KinkyDungeonPlayerTags: Map<any, any>;
declare let KinkyDungeonCurrentDress: string;
declare let KinkyDungeonUndress: number;
/**
 * @type {spell[]}
 */
declare let KinkyDungeonSpells: spell[];
declare let KinkyDungeonPlayerBuffs: {};
declare let KinkyDungeonPlayers: any[];
declare let KinkyDungeonDifficulty: number;
declare let KinkyDungeonSubmissiveMult: number;
declare let KinkyDungeonSpellPoints: number;
declare namespace KDClassStart {
    function Fighter(): void;
    function Rogue(): void;
    function Mage(): void;
    function Peasant(): void;
}
declare let KDMaxVisionDist: number;
declare namespace KDBaseDamageTypes {
    const arouseTypes: string[];
    const bypassTeaseTypes: string[];
    const distractionTypesWeakNeg: string[];
    const distractionTypesWeak: string[];
    const distractionTypesStrong: string[];
    const teaseTypes: string[];
    const staminaTypesWeak: string[];
    const staminaTypesStrong: string[];
    const manaTypesWeak: string[];
    const manaTypesStrong: any[];
    const willTypesVeryWeak: string[];
    const willTypesWeak: string[];
    const willTypesStrong: string[];
}
declare let KDOrigStamina: number;
declare let KDOrigMana: number;
declare let KDOrigWill: number;
declare let KDOrigCharge: number;
declare let KDOrigDistraction: number;
declare let KDBlindnessCap: number;
declare let KDBoundPowerLevel: number;
declare let KDNoRegenFlag: boolean;
declare let KDDamageAmpPerks: number;
declare let KDDamageAmpPerksMelee: number;
declare let KDDamageAmpPerksMagic: number;
declare let KDDamageAmpPerksSpell: number;
declare let KDDamageAmpEnvironmental: number;
declare let KDExtraEnemyTags: {};
declare let KinkyDungeonOrgasmVibeLevelMult: number;
declare let KinkyDungeonOrgasmChanceBase: number;
declare let KinkyDungeonOrgasmChanceScaling: number;
declare let KinkyDungeonMaxOrgasmStage: number;
declare let KinkyDungeonOrgasmStageVariation: number;
declare let KinkyDungeonDistractionSleepDeprivationThreshold: number;
declare let KinkyDungeonPlaySelfOrgasmThreshold: number;
declare let KinkyDungeonOrgasmTurnsMax: number;
declare let KinkyDungeonOrgasmTurnsCrave: number;
declare let KinkyDungeonPlayWithSelfPowerMin: number;
declare let KinkyDungeonPlayWithSelfPowerMax: number;
declare let KinkyDungeonPlayWithSelfPowerVibeWand: number;
declare let KinkyDungeonPlayWithSelfChastityPenalty: number;
declare let KinkyDungeonPlayWithSelfBoundPenalty: number;
declare let KinkyDungeonOrgasmExhaustionAmount: number;
declare let KinkyDungeonOrgasmExhaustionAmountWillful: number;
declare let KDOrgasmStageTimerMax: number;
declare let KDOrgasmStageTimerMaxChance: number;
declare let KDWillpowerMultiplier: number;
declare let KinkyDungeonOrgasmCost: number;
declare let KinkyDungeonOrgasmCostPercent: number;
declare let KinkyDungeonOrgasmWillpowerCost: number;
declare let KinkyDungeonEdgeCost: number;
declare let KinkyDungeonPlayCost: number;
declare let KinkyDungeonOrgasmStunTime: number;
declare let KinkyDungeonPlayWithSelfMult: number;
