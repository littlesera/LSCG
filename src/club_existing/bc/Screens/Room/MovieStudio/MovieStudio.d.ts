/**
 * The player can play in a movie if she doesn't have any locked restraints
 * @returns {boolean} - TRUE if the player can play in a movie
 */
declare function MovieStudioCanPlayInMovie(): boolean;
/**
 * Returns TRUE if the player can receive the camera as payment
 * @returns {boolean} - TRUE if the player can get the item
 */
declare function MovieStudioCanGetCamera(): boolean;
/**
 * Returns TRUE if the player can receive the gavel as payment
 * @returns {boolean} - TRUE if the player can get the item
 */
declare function MovieStudioCanGetGavel(): boolean;
/**
 * Returns TRUE if the player can receive the long duster as payment
 * @returns {boolean} - TRUE if the player can get the item
 */
declare function MovieStudioCanGetLongDuster(): boolean;
/**
 * Returns TRUE if the player can receive the for sale sign as payment
 * @returns {boolean} - TRUE if the player can get the item
 */
declare function MovieStudioCanGetForSaleSign(): boolean;
/**
 * Returns TRUE if the daily movie is of the current type
 * @param {string} Type - The daily movie type
 * @returns {boolean} - TRUE if the daily movie matches
 */
declare function MovieStudioDailyMovieIs(Type: string): boolean;
/**
 * Returns TRUE if the player and the current character can play Club Card
 * @returns {boolean} - Returns TRUE if both aren't restrained
 */
declare function MovieStudioCanPlayClubCard(): boolean;
/**
 * When the player fails the movie, we jump back to the director
 * @returns {void} - Nothing
 */
declare function MovieStudioFail(): void;
/**
 * Change the movie quality meter value, the director stops everything if the meter drops to -100
 * @param {number} Factor - The number to add or substract from the meter
 * @returns {void} - Nothing
 */
declare function MovieStudioChangeMeter(Factor: number): void;
/**
 * Process the movie meter decay over time,
 * @returns {void} - Nothing
 */
declare function MovieStudioProcessDecay(): void;
/**
 * Loads the Movie Studio introduction room screen and saves the player clothes
 * @returns {void} - Nothing
 */
declare function MovieStudioLoad(): void;
/**
 * Runs and draws the Movie Studio screen
 * @returns {void} - Nothing
 */
declare function MovieStudioRun(): void;
/**
 * Handles clicks in the Movie Studio screen
 * @returns {void} - Nothing
 */
declare function MovieStudioClick(): void;
/**
 * When the player needs to dress back in her original clothes after the play
 * @returns {void} - Nothing
 */
declare function MovieStudioPlayerDressBack(): void;
/**
 * When the player needs to change clothes for a role in the movie
 * @param {string} Cloth - The clothes to wear
 * @returns {void} - Nothing
 */
declare function MovieStudioChange(Cloth: string, C: any): void;
/**
 * When the movie scene progresses, we assign the new values
 * @param {string} Movie - The movie type
 * @param {string} Scene - The scene in the movie
 * @param {string} Role - Optional - The role the player is taking
 * @returns {void} - Nothing
 */
declare function MovieStudioProgress(Movie: string, Scene: string, Role: string): void;
/**
 * When an activity is done
 * @param {string} Activity - The activity name
 * @returns {void} - Nothing
 */
declare function MovieStudioDoActivity(Activity: string): void;
/**
 * Changes a parameter for an actor
 * @param {string} Name - The name of the actor
 * @param {string} Param - The parameter to change
 * @param {string} Value - The value to alter
 * @returns {void} - Nothing
 */
declare function MovieStudioChangeParameter(Name: string, Param: string, Value: string): void;
/**
 * Add a parameter for an actor
 * @param {string} Name - The name of the actor
 * @param {string} Param - The parameter to change
 * @param {string} Value - The value to alter
 * @returns {void} - Nothing
 */
declare function MovieStudioAlterParameter(Name: string, Param: string, Value: string): void;
/**
 * Returns TRUE if a parameter value for an actor is between a from and a to value
 * @param {string} Name - The name of the actor
 * @param {string} Param - The parameter to get
 * @param {string} FromValue - From that value
 * @param {string} ToValue - To that value
 * @returns {Boolean} - TRUE if between
 */
declare function MovieStudioParameterValueBetween(Name: string, Param: string, FromValue: string, ToValue: string): boolean;
/**
 * Tests if an activity can be done
 * @param {string} Activity - The activity to test
 * @returns {boolean} - Returns TRUE if the activity can be done
 */
declare function MovieStudioCanDoActivity(Activity: string): boolean;
/**
 * Adds the camera to the player inventory
 * @returns {void} - Nothing
 */
declare function MovieStudioGetCamera(): void;
/**
 * Adds the gavel to the player inventory
 * @returns {void} - Nothing
 */
declare function MovieStudioGetGavel(): void;
/**
 * Adds the long duster to the player inventory
 * @returns {void} - Nothing
 */
declare function MovieStudioGetLongDuster(): void;
/**
 * Adds the for sale sign to the player inventory
 * @returns {void} - Nothing
 */
declare function MovieStudioGetForSaleSign(): void;
/**
 * Adds the movie salary to the player
 * @returns {void} - Nothing
 */
declare function MovieStudioGetMoney(): void;
/**
 * When the player starts a club card game
 * @returns {void} - Nothing
 */
declare function MovieStudioClubCardStart(): void;
/**
 * When the player ends a club card game
 * @returns {void} - Nothing
 */
declare function MovieStudioClubCardEnd(): void;
declare var MovieStudioBackground: string;
/** @type {null | NPCCharacter} */
declare var MovieStudioDirector: null | NPCCharacter;
declare var MovieStudioCurrentMovie: string;
declare var MovieStudioCurrentScene: string;
declare var MovieStudioCurrentRole: string;
/** @type {null | NPCCharacter} */
declare var MovieStudioActor1: null | NPCCharacter;
/** @type {null | NPCCharacter} */
declare var MovieStudioActor2: null | NPCCharacter;
/** @type {null | number} */
declare var MovieStudioTimer: null | number;
declare var MovieStudioMeter: number;
declare var MovieStudioDecay: number;
/** @type {string[]} */
declare var MovieStudioActivity: string[];
declare var MovieStudioMoney: number;
/** @type {null | Item[]} */
declare var MovieStudioOriginalClothes: null | Item[];
declare var MovieStudioDailyMovie: string;
