declare function SarahStatusIs(QueryStatus: any): boolean;
declare function SarahAmandaStatusIs(QueryStatus: any): boolean;
declare function SarahCanKissLover(): boolean;
declare function SarahCanKissNotLover(): boolean;
declare function SarahCanSpankOwner(): boolean;
declare function SarahCanSpankNotOwner(): boolean;
declare function SarahCanReleaseToClub(): boolean;
declare function SarahCanInviteToRoomFriend(): boolean;
declare function SarahCanInviteToRoomSlave(): boolean;
declare function SarahCanInviteAmandaToRoom(): boolean;
declare function SarahCanInviteAmandaToRoomRefuse(): boolean;
declare function SarahCanInviteSophieToRoom(): boolean;
declare function SarahCanInviteSophieToRoomAccept(): boolean;
declare function SarahCanInviteSophieToRoomRefuse(): boolean;
declare function SarahCanKickAmandaOut(): boolean;
declare function SarahCanKickAmandaOutRefuse(): boolean;
declare function SarahShackled(): boolean;
declare function SarahAmandaHasStrapon(): boolean;
declare function SarahAmandaHasNoStrapon(): boolean;
declare function SarahKnowAmandaInRoom(): boolean;
declare function SarahAmandaCanKiss(): boolean;
declare function SarahIsClubSlave(): boolean;
declare function SarahCanKissSophie(): boolean;
declare function SarahCanFightSophie(): boolean;
declare function SarahSophiePunishmentStageIs(Stage: any): boolean;
declare function SarahSophieLikesPlayer(): boolean;
declare function SarahCanStrip(): boolean;
declare function SarahIsInside(): boolean;
declare function SarahAmandaIsInside(): boolean;
declare function SarahAndAmandaAreInside(): boolean;
declare function SarahOrAmandaAreInside(): boolean;
declare function SarahIsPlayerSlave(): boolean;
declare function SarahAmandaIsPlayerSlave(): boolean;
declare function SarahAmandaAndSarahArePlayerSlave(): boolean;
declare function SarahRoomLabel(): "ExploreClub" | "SearchSarah" | "SarahBedroom";
declare function SarahSetStatus(): void;
declare function SarahLoad(): void;
declare function AmandaLoad(): void;
declare function SophieLoad(): void;
declare function SarahLoadNewCharacter(): void;
declare function SarahLoadBackground(): void;
declare function SarahRun(): void;
declare function SarahClick(): void;
declare function SarahActivityRun(): void;
declare function SarahCheckShackles(): void;
declare function SarahStartUnlockQuest(): void;
declare function SarahUnlock(): void;
declare function SarahEvasion(): void;
declare function SarahLeaveRoom(): void;
declare function SarahTransferToRoom(): void;
declare function SarahAmandaLeaveRoom(): void;
declare function SarahSophieLeaveRoom(): void;
declare function SarahTransferAmandaToRoom(): void;
declare function SarahUpsetSophie(Offset: any): void;
declare function SarahRestrainedBySophie(Phase: any, DomRep: any): void;
declare function SarahFightSophie(): void;
declare function SarahFightSophieEnd(): void;
declare function SarahSophiePunishGirls(): void;
declare function SarahSophieFreeSarahAndLeave(): void;
declare function SarahSophieFreePlayerAndAmandaTheyLeave(): void;
declare function SarahKickPlayerOut(): void;
declare function SarahTransferSophieToRoom(Love: any): void;
declare function SarahSophieSetPunishmentIntro(DomRep: any): void;
/**
 * Strips and restrains a character
 * @param {Character} C
 */
declare function SarahSophiePreparePunishCharacter(C: Character): void;
/**
 * When Sophie starts a character vibrator
 * @param {Character} C
 * @param {string|number} Intensity
 */
declare function SarahSophieStartBuzz(C: Character, Intensity: string | number): void;
/**
 * Sets the Sophie punishment for the player
 * @param {string} EventType
 * @param {string|number} DomRep
 */
declare function SarahSophiePunishEvent(EventType: string, DomRep: string | number): void;
/**
 * When the player plays Sophie Orgasm Game
 * @param {string} Factor
 */
declare function SarahSophieOrgasmGame(Factor: string): void;
declare function SarahSophieReleaseEveryoneButSarah(): void;
declare function SarahPlayerPunishGirls(): void;
/**
 * Returns TRUE if the current slave(s) are naked and without restrains
 * @param {NPCCharacter} C
 */
declare function SarahSlaveNakedWithoutRestrains(C: NPCCharacter): any;
/**
 * Returns TRUE if the current slave(s) are wearing clamps, egg and butt plug
 * @param {NPCCharacter} C
 */
declare function SarahSlaveWithClampEggPlug(C: NPCCharacter): any;
/**
 * Returns TRUE if the current slave(s) are wearing clamps, egg, butt plug, chastity belt & bra
 * @param {NPCCharacter} C
 */
declare function SarahSlaveChaste(C: NPCCharacter): any;
/**
 * Returns TRUE if the current slave(s) are wearing clamps, egg, butt plug, chastity belt, bra & locked cuffs
 * @param {NPCCharacter} C
 */
declare function SarahSlaveLockedCuffs(C: NPCCharacter): any;
/**
 * Returns TRUE if the current slave(s) had their orgasms
 * @returns {boolean}
 */
declare function SarahSlaveOrgasm(): boolean;
/**
 * Gives the restrains temporarily to Sarah and Amanda so they can be punished
 * @param {NPCCharacter} C
 */
declare function SarahGiveFirstSlaveItem(C: NPCCharacter): void;
/**
 * Gives the second set of restrains temporarily to Sarah and Amanda so they can be punished
 * @param {NPCCharacter} C
 */
declare function SarahGiveSecondSlaveItem(C: NPCCharacter): void;
/**
 * Gives the third set of restrains temporarily to Sarah and Amanda so they can be punished
 * @param {NPCCharacter} C
 */
declare function SarahGiveThirdSlaveItem(C: NPCCharacter): void;
/**
 * Gives the fourth set of restrains temporarily to Sarah and Amanda so they can be punished
 * @param {NPCCharacter} C
 */
declare function SarahGiveFourthSlaveItem(C: NPCCharacter): void;
/**
 * Build the orgasm meter for the slaves
 * @param {string|number} Pleasure
 * @param {string|number} Bonus
 * @param {string|number} Intensity
 */
declare function SarahSlaveOrgasmBuild(Pleasure: string | number, Bonus: string | number, Intensity: string | number): void;
declare function SarahSlaveReset(): void;
declare var SarahRoomAvailable: boolean;
declare var SarahBackground: string;
declare var SarahStatus: string;
declare var AmandaStatus: string;
declare var SophieStatus: string;
/** @type {null | NPCCharacter} */
declare var Sarah: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var Amanda: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var Sophie: null | NPCCharacter;
declare var SarahInside: boolean;
declare var AmandaInside: boolean;
declare var SophieInside: boolean;
declare var SarahUnlockQuest: boolean;
/** @type {Character[]} */
declare var SarahCharacter: Character[];
declare var SophieUpsetCount: number;
declare var SophieFightDone: boolean;
declare var SophiePunishmentStage: number;
declare var SophieOrgasmGameCount: number;
declare var SophieOrgasmGamePleasure: number;
