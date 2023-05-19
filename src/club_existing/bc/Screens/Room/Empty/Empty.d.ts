/**
 * Checks if the player struggled successfully within the allowed time
 * @returns {boolean} - Returns TRUE if the player managed to struggle out in time
 */
declare function EmptyStruggleSuccess(): boolean;
/**
 * Checks if the player has not managed to struggle out in time
 * @returns {boolean} - Returns TRUE if the player has failed to struggle out.
 */
declare function EmptyStruggleFail(): boolean;
/**
 * Checks if the player is in struggle mode.
 * @returns {boolean} - Returns TRUE if the player still has time to try to struggle out.
 */
declare function EmptyStruggleProgress(): boolean;
/**
 * Checks if the player can do a bondage training.
 * @returns {boolean} - Whether the player is ready to do a bondage training or not.
 */
declare function EmptySlaveMarketReadyForBondageTraining(): boolean;
/**
 * Loads the empty room screen. Does nothing, required for future use and because it is called dynamically when loading the screen.
 * @returns {void} - Nothing
 */
declare function EmptyLoad(): void;
/**
 * Runs and draws the empty room screen, it will place each character inside the room evenly
 * @returns {void} - Nothing
 */
declare function EmptyRun(): void;
/**
 * Handles clicks in the empty room screen
 * @returns {void} - Nothing
 */
declare function EmptyClick(): void;
/**
 * Used to return the player to the main hall from the empty room when in the management room
 * @returns {void} - Nothing
 */
declare function EmptyManagementMainHall(): void;
/**
 * Triggered when management sends the player in a cell for 5 minutes with full restraints on
 * @returns {void} - Nothing
 */
declare function EmptyManagementCell(): void;
/**
 * Releases the player from the item applied by the shop vendor at the start of the job
 * @returns {void} - Nothing
 */
declare function EmptyShopRelease(): void;
/**
 * Releases the player from the item she was trying to sell, and sets the following dialog.
 * @param {string} Sold - Whether or not the item was sold, "true" if sold
 * @returns {void} - Nothing
 */
declare function EmptyShopEnd(Sold: string): void;
/**
 * Starts the slave training
 * @param {number} TrainingType - The type of training to do
 * @returns {void} - Nothing
 */
declare function EmptySlaveMarketTrainingStart(TrainingType: number): void;
/**
 * Checks if the intensity of the training is on par with the required level
 * @param {string} TestLevel - Required level of intensity
 * @returns {boolean} - Returns TRUE if the intensity level matches the level to test
 */
declare function EmptySlaveMarketTrainingLevelIs(TestLevel: string): boolean;
/**
 * Handles progressing through the slave market training
 * @param {number} Intensity - Intensity of the activity performed
 * @returns {void} - Nothing
 */
declare function EmptySlaveMarketTrainingProgress(Intensity: number): void;
/**
 * Triggered when the slave market training ends
 * @param {string} Status - The status the game ended with, "Success" if won
 * @returns {void} - Nothing
 */
declare function EmptySlaveMarketTrainingEnd(Status: string): void;
declare var EmptyBackground: string;
/** @type {Character[]} */
declare var EmptyCharacter: Character[];
declare var EmptyCharacterOffset: number;
