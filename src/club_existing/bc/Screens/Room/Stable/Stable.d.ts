declare function StablePlayerIsPony(): boolean;
declare function StablePlayerIsExamPony(): boolean;
declare function StablePlayerIsTrainer(): boolean;
declare function StablePlayerIsExamTrainer(): boolean;
declare function StablePlayerCanTrainPony(): boolean;
declare function StablePlayerIsReadyToTrain(): boolean;
declare function StablePlayerIsNewby(): boolean;
/**
 * Check what outfit the player is currently wearing.
 * @param {"Pony" | "Trainer" | null} Outfit
 */
declare function StablePlayerIsWearingOutfit(Outfit: "Pony" | "Trainer" | null): boolean;
declare function StablePlayerIsCollared(): boolean;
declare function StablePlayerOtherPony(): boolean;
declare function StablePlayerIsolation(): boolean;
declare function StableTrainingExercisesAvailable(): boolean;
declare function StablePlayerAllowedPonyExamen(): boolean;
declare function StablePlayerDisallowedPonyExamen(): boolean;
declare function StablePlayerAllowedTrainerExamen(): boolean;
declare function StablePlayerDisallowedTrainerExamen(): boolean;
declare function StableCanHideDice(): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function StableCanPlayClubCard(): boolean;
declare function StableLoad(): void;
declare function StableRun(): void;
declare function StableClick(): void;
declare function StableTrialPonyTraining(): void;
declare function StableTrialTrainerTraining(): void;
declare function StableTrialTrainerTrainingEnd(): void;
/**
 * @param {"PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"} Fee
 * @returns {number}
 */
declare function StableFeeValue(Fee: "PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"): number;
/**
 * @param {"PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"} Fee
 * @returns {boolean}
 */
declare function StableCanPayTheFee(Fee: "PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"): boolean;
/**
 * @param {"PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"} Fee
 * @returns {void}
 */
declare function StablePayTheFee(Fee: "PonyExam" | "TrainPony" | "TrainerExam" | "BecomeTrainer" | "WhiskeyRounds"): void;
declare function StableCanBecomePony(): void;
declare function StablePlayerStartTrainingLesson(): void;
declare function StablePlayerGetTrainingLesson(): void;
/**
 * Start Traning Gallop
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingGallop(Behavior: string): void;
/**
 * Start Traning Walk
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingWalk(Behavior: string): void;
/**
 * Start Traning Dance
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingDance(Behavior: string): void;
/**
 * Start Traning Hurdle
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingHurdles(Behavior: string): void;
declare function StablePlayerTrainingHurdlesEnd(): void;
/**
 * Start Traning Treadmill
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingTreadmill(Behavior: string): void;
/**
 * Start Traning Strong Treadmill
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingStrongTreadmill(Behavior: string): void;
/**
 * Start Traning Carriage
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingCarriage(Behavior: string): void;
/**
 * Start Traning Strong Carriage
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingStrongCarriage(Behavior: string): void;
/**
 * Start Traning Race
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingRace(Behavior: string): void;
/**
 * Start Traning Strong Race
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingStrongRace(Behavior: string): void;
/**
 * Start Traning Carrots - MiniGame
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingCarrots(Behavior: string): void;
declare function StablePlayerTrainingCarrotsEnd(): void;
/**
 * Reward for passed
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingPass(Behavior: string): void;
/**
 * Guarantee for failed
 * @param {string} Behavior
 * @returns {void}
 */
declare function StablePlayerTrainingFail(Behavior: string): void;
declare function StablePlayerOtherPonys(): void;
declare function StablePlayerToStable(): void;
declare function StableDressPonyStart(): void;
declare function StableBecomePonyFin(): void;
declare function StableTrainingStoped(): void;
declare function StablePlayerToHerd(): void;
declare function StableDressBackPlayer(): void;
declare function StableCheckEquipment(): void;
declare function StablePlayerWearEquipment(Behavior: any): void;
declare function StableWearPonyEquipment(C: any): void;
declare function StablePlayerStartExam(): void;
declare function StablePlayerExamHurdles(): void;
declare function StablePlayerExamHurdlesEnd(): void;
declare function StablePlayerExamRace(): void;
declare function StablePlayerExamDressage(): void;
declare function StablePlayerExamPass(): void;
declare function StablePlayerExamEnd(): void;
declare function StableCanBecomeTrainer(): void;
declare function StableBecomeTrainer(): void;
declare function StableWearTrainerEquipment(C: any): void;
declare function StableTrainerStart(): void;
declare function StablePonyWearEquipment(): void;
declare function StablePonyTraining(probability: any): void;
declare function StablePonyTrainingHurdles(): void;
declare function StablePonyTrainingHurdlesEnd(): void;
declare function StableTrainerWhip(): void;
declare function StableTrainerWhipEnd(): void;
/**
 * @param {null | Character} C
 * @returns {void}
 */
declare function StablePonyStraightens(C: null | Character): void;
declare function StablePlayerStartTExam(): void;
declare function StablePlayerTExamKnow(): void;
declare function StablePlayerTExamWhip(): void;
declare function StablePlayerTExamWhipEnd(): void;
declare function StablePlayerTExamHurdles(): void;
declare function StablePlayerTExamHurdlesEnd(): void;
declare function StablePlayerTExamPass(): void;
declare function StablePlayerTExamEnd(): void;
declare function StableGenericProgressStart(Timer: any, S: any, S2: any, Item: any, Background: any, Character: any, SecondCharacter: any, Stage: any, CurrentDialog: any, CancelStage: any, CancelCurrentDialog: any, Behavior: any, ProgressOperation: any): void;
declare function StableGenericDrawProgress(): void;
declare function StableGenericFinished(): void;
declare function StableGenericCancel(): void;
declare function StableGenericProgressEnd(): void;
declare function StableKeyDown(): void;
/**
 * @param {boolean} Reverse
 */
declare function StableGenericRun(Reverse: boolean): void;
/**
 * Returns true if a Appearance Group for Character available
 * @param {Character} C
 * @param {AssetGroupName} AppearanceGroup
 * @returns {boolean}
 */
declare function StableCharacterAppearanceGroupAvailable(C: Character, AppearanceGroup: AssetGroupName): boolean;
declare function StableHideDice(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function StableClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function StableClubCardEnd(): void;
declare var StableBackground: string;
/** @type {null | NPCCharacter} */
declare var StableTrainer: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var StablePony: null | NPCCharacter;
declare var StablePonyPass: boolean;
declare var StablePonyFail: boolean;
/** @type {Item[]} */
declare var StablePlayerAppearance: Item[];
/** @type {"Pony" | "Trainer" | null} */
declare var StablePlayerOutfitWorn: "Pony" | "Trainer" | null;
declare var StablePlayerTrainingActiv: boolean;
declare var StablePlayerTrainingLessons: number;
declare var StablePlayerTrainingBehavior: number;
declare var StableTrainerTrainingExercises: number;
declare var StablePlayerInIsolation: boolean;
/** @type {null | number} */
declare var StablePlayerInIsolationStart: null | number;
/** @type {null | number} */
declare var StablePlayerInIsolationEnd: null | number;
declare var StableExamPoint: number;
declare var StableProgress: number;
declare var StableSecondProgress: number;
declare var StableProgressAuto: number;
declare var StableSecondProgressAuto: number;
declare var StableProgressClick: number;
declare var StableProgressLastKeyPress: number;
declare var StableProgressItem: string;
declare var StableProgressFinished: boolean;
declare var StableProgressCharacter: any;
declare var StableProgressSecondCharacter: any;
declare var StableProgressEndStage: number;
declare var StableProgressEndDialog: any;
declare var StableProgressCancelStage: any;
declare var StableProgressCancelDialog: any;
declare var StableProgressBehavior: number;
declare var StableProgressOperation: any;
declare var StableProgressStruggleCount: any;
