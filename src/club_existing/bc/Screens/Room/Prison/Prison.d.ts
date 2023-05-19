declare function PrisonPlayerIsHandcuffed(): boolean;
declare function PrisonPlayerIsPanelGag(): boolean;
declare function PrisonPlayerIsLegTied(): boolean;
declare function PrisonPlayerIsFeetTied(): boolean;
declare function PrisonPlayerIsOTMGag(): boolean;
declare function PrisonPlayerIsStriped(): boolean;
declare function PrisonPlayerIsBadGirl(): boolean;
declare function PrisonPlayerIsBadGirlThief(): boolean;
declare function PrisonPlayerHasSleepingPills(): boolean;
declare function PrisonPlayerHasSpankingToys(): boolean;
declare function PrisonPlayerHasKeys(): boolean;
declare function PrisonSubIsHandcuffedOut(): boolean;
declare function PrisonSubIsBehindBars(): boolean;
declare function PrisonSubIsFree(): boolean;
declare function PrisonSubAskForCuff(): boolean;
declare function PrisonSubCanStripSearch(): boolean;
declare function PrisonSubCanClothBack(): boolean;
declare function PrisonLoad(): void;
declare function PrisonRun(): void;
declare function PrisonClick(): void;
declare function PrisonCharacterAppearanceAvailable(C: any, AppearanceName: any, AppearanceGroup: any): boolean;
declare function PrisonCharacterAppearanceGroupAvailable(C: any, AppearanceGroup: any): boolean;
declare function PrisonCellPlayerIn(): void;
declare function PrisonCellPlayerOut(): void;
/**
 * @param {InventoryItem[]} items
 */
declare function PrisonSaveConfiscatedItems(items: InventoryItem[]): void;
/** */
declare function PrisonRestoreConfiscatedItems(): void;
declare function PrisonMaidLeave(): void;
declare function PrisonCellRelease(C: any): void;
declare function PrisonHavySearch(C: any): void;
declare function PrisonLightSearch(C: any): void;
declare function PrisonerClothBack(C: any): void;
declare function PrisonCuffsRelief(): void;
declare function PrisonMaidLightTorture(): void;
declare function PrisonMaidHevyTorture(): void;
declare function PrisonDisableKey(C: any): void;
declare function PrisonCellPlayerAsk(): void;
declare function PrisonCellPlayerShake(): void;
declare function PrisonCellPlayerTry(): void;
declare function PrisonCellPlayerWimper(): void;
declare function PrisonCellPlayerWait(): void;
declare function PrisonSubSendAway(): void;
declare function PrisonSubHandcuffing(): void;
declare function PrisonCellSubIn(): void;
declare function PrisonSubHavySearch(): void;
declare function PrisonCellSubOut(): void;
declare function PrisonLeaveCell(): void;
declare function PrisonSubClothBack(): void;
declare function PrisonBecomeBadGirl(): void;
declare function PrisonLeaveBadGirl(): void;
declare function PrisonWearPoliceEquipment(C: any): void;
declare function PrisonWantedPlayer(): 1 | 4 | 7 | 9;
declare function PrisonMeetPoliceIntro(RoomBackground: any): void;
declare function PrisonPutHandsInTheAir(): void;
declare function PrisonRaiseHandsHigher(): void;
declare function PrisonCatchKneel(): void;
declare function PrisonCatchHandcuffed(): void;
declare function PrisonCatchKneelingEscape(): void;
declare function PrisonCatchComplain(): void;
declare function PrisonCatchAdmitDefeat(): void;
declare function PrisonFightPolice(): void;
declare function PrisonFightPoliceEnd(): void;
declare function PrisonFightPoliceOutro(): void;
declare function PrisonCatchByPolice(): void;
declare function PrisonSetBehavior(Behavior: any): void;
declare function PrisonArrestHandoverDices(): void;
declare function PrisonArrestHandoverKeys(): void;
declare function PrisonArrestHandoverSleepingPills(): void;
declare function PrisonArrestHandoverSpankingToys(): void;
declare function PrisonArrestStripOuterCloth(): void;
declare function PrisonCharacterIsInUnderwear(): boolean;
declare function PrisonArrestStripUnderware(): void;
declare function PrisonArrestSuit(): void;
declare function PrisonArrestShackle(): void;
declare function PrisonArrestEquipmentSearch(): void;
declare function PrisonArrestConfiscatDices(): void;
declare function PrisonArrestConfiscatKeys(): void;
declare function PrisonArrestConfiscatSleepingPills(): void;
declare function PrisonArrestConfiscatSpankingToys(): void;
declare function PrisonArrestLeave(): void;
declare function PrisonDiceBack(): void;
declare var PrisonBackground: string;
/** @type {null | number} */
declare var PrisonNextEventTimer: null | number;
declare var PrisonNextEvent: boolean;
declare var PrisonBehavior: number;
/** @type {null | NPCCharacter} */
declare var PrisonMaid: null | NPCCharacter;
/** @type {null | Item[]} */
declare var PrisonMaidAppearance: null | Item[];
declare var PrisonMaidIsPresent: boolean;
declare var PrisonMaidIsAngry: boolean;
/** @type {null | string} */
declare var PrisonMaidCharacter: null | string;
declare var PrisonMaidCharacterList: string[];
/** @type {null | number} */
declare var PrisonMaidChaotic: null | number;
/** @type {null | NPCCharacter} */
declare var PrisonSub: null | NPCCharacter;
/** @type {null | Item[]} */
declare var PrisonSubAppearance: null | Item[];
declare var PrisonSubBehindBars: boolean;
declare var PrisonSubSelfCuffed: boolean;
declare var PrisonSubIsPresent: boolean;
declare var PrisonSubAskedCuff: boolean;
declare var PrisonSubIsLeaveOut: boolean;
declare var PrisonSubIsStripSearch: boolean;
/** @type {null | NPCCharacter} */
declare var PrisonPolice: null | NPCCharacter;
declare var PrisonPoliceIsPresent: boolean;
declare var PrisonPlayerCatchedBadGirl: boolean;
/** @type {null | Item[]} */
declare var PrisonPlayerAppearance: null | Item[];
declare var PrisonPlayerBehindBars: boolean;
declare var PrisonPlayerForIllegalChange: boolean;
