declare function NurseryPlayerIsPacified(): boolean;
declare function NurseryPlayerIsHarnessPacified(): boolean;
declare function NurseryPlayerLostBinky(): boolean;
declare function NurseryPlayerLostBinkyAgain(): boolean;
declare function NurseryPlayerWearingBabyDress(): boolean;
declare function NurseryPlayerReadyToAppologise(): boolean;
declare function NurseryPlayerDiapered(): boolean;
declare function NurseryPlayerReadyDiapered(): boolean;
declare function NurseryPlayerCanRegress(): boolean;
declare function NurseryLoad(): void;
declare function NurseryRun(): void;
declare function NurseryClick(): void;
declare function NurseryDrawText(): void;
declare function NurseryLoadNurse(): void;
declare function NurseryClothCheck(): void;
declare function NurseryNurseOutfitForNPC(CurrentNPC: any): void;
declare function NurseryABDLOutfitForNPC(CurrentNPC: any): void;
declare function NurseryNPCResrained(CurrentNPC: any, RestraintSet: any): void;
declare function NurseryRandomDressSelection(): void;
declare function NurseryRandomColorSelection(): void;
declare function NurseryDeleteItem(): void;
declare function NurseryPlayerUndress(Cost: any): void;
declare function NurseryPlayerGetsDiapered(DomChange: any): void;
declare function NurseryPlayerAdmitted(): void;
declare function NurseryPlayerWearBabyDress(): void;
declare function NurseryPlayerRestrained(RestraintSet: any): void;
declare function NurseryPlayerRePacified(): void;
declare function NurseryPlayerDePacified(): void;
declare function NurseryPlayerRedressed(): void;
declare function NurseryBadBabies(): void;
declare function NurseryPlayerSkillsAmnesia(): void;
declare function NurseryReplaceSkill(): void;
declare function NurseryPlayerChangeDress(): void;
declare function NurseryPlayerChangeDressColor(): void;
declare function NurseryPlayerRemoveDress(): void;
declare function NurseryPlayerCuteRelpy(): void;
declare function NurseryEscapeGate(): void;
declare function NurseryPlayerForgiven(): void;
declare function NurseryPlayerReadmitted(): void;
declare function NurseryPlayerRemoveCloth(): void;
declare function NurseryPlayerNeedsPunishing(Severity: any): void;
declare function NurseryPlayerPunished(Severity: any): void;
declare function NurseryGoodBehaviour(): void;
declare var NurseryBackground: string;
/** @type {null | string} */
declare var NurserySituation: null | string;
declare var NurseryJustClicked: any;
/** @type {null | NPCCharacter} */
declare var NurseryNurse: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NurseryABDL1: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var NurseryABDL2: null | NPCCharacter;
/** 0 = Good girl; 1 = ready to be forgiven; >= 2 = severity of naughtiness. */
declare var NurseryPlayerBadBabyStatus: number;
/** @type {null | boolean} */
declare var NurseryPlayerInappropriateCloth: null | boolean;
declare var NurseryCoolDownTime: number;
/** @type {null | Item[]} */
declare var NurseryPlayerAppearance: null | Item[];
declare var RandomNumber: number;
/** @type {null | string} */
declare var RandomResult: null | string;
/** @type {null | string} */
declare var RandomResultB: null | string;
declare var PreviousDress: string;
declare var PreviousDressColor: string;
/** @type {null | boolean} */
declare var NurseryPlayerKeepsLoosingBinky: null | boolean;
/**
 * message about nursery gate
 * @type {null | boolean}
 */
declare var NurseryGateMsg: null | boolean;
/**
 * message about ease of opening nursery gate
 * @type {number}
 */
declare var NurseryLeaveMsg: number;
/** @type {null | number} */
declare var NurseryEscapeAttempts: null | number;
/** @type {null | number} */
declare var NursuryEscapeFailMsg: null | number;
/** @type {null | number} */
declare var NurseryRepeatOffender: null | number;
