/**
 * Loads the rythm mini game after saving the main cancas to restore it once the game is done.
 * @returns {void} - Nothing
 */
declare function RhythmGameLoad(): void;
/**
 * Runs and draws the canvas for the rythm mini game. The game uses objects to handle various processes.
 * @returns {void} - Nothing
 */
declare function RhythmGameRun(): void;
/**
 * Handles the clicks in the rhythm mini-game.
 * @returns {void} - Nothing
 */
declare function RhythmGameClick(): void;
declare var RhythmGameBackground: string;
declare let RhythmGameBeatmap: string;
declare let RhythmGameDifficulty: string;
declare let RhythmGameStarted: boolean;
declare let RhythmGameEnded: boolean;
declare let RhythmGamePassed: boolean;
declare let RhythmGamePreloadCompleted: boolean;
/**
 * Rhythm game initialization object: Handles pre and post loading, invokes initialization of other objects.
 * @constant
 * @type {object} - The game initialization object. Contains the functions required to load the game.
 */
declare let RhythmGameInit: object;
/**
 * Rhythm game image object: Loads and caches the image resources.
 * @constant
 * @type {object} - The game image object. Contains the functions required to load the images.
 */
declare let RhythmGameImage: object;
/**
 * Rhythm game audio object: Handles loading audio and starting the music
 * @constant
 * @type {object} - The game audio object. Contains the functions required to load, start and stop the audio files.
 */
declare let RhythmGameAudio: object;
/**
 * Rhythm game chart object: Handles loading chart, parsing xml, caching chart for rendering and judging.
 * @constant
 * @type {object} - The game chart object. Contains the functions required to load the charts.
 */
declare let RhythmGameChart: object;
/**
 * Rhythm game keyboard input handler object: Handles keyboard inputs.
 * @constant
 * @type {object} - The game keyboard input handler object. Contains the functions and properties required to handle key press events.
 */
declare let RhythmGameKey: object;
/**
 * Rhythm game kernel object: Handles game timing.
 * @constant
 * @type {object} - The game kernel object. Contains the functions required to handle the game's timing.
 */
declare let RhythmGameKernel: object;
/**
 * Rhythm game script object: Handles game mechanics.
 * @constant
 * @type {object} - The game kernel object. Contains the functions related to game mechanics such as health, score and accuracy.
 */
declare let RhythmGameScript: object;
/**
 * Rhythm game render object: Handles game rendering.
 * @constant
 * @type {object} - The game render object. Contains the functions related to game rendering such as the visual effects and notes.
 */
declare let RhythmGameRender: object;
/**
 * Rhythm game integration object: Handles bondage club specific functions.
 * @constant
 * @type {object} - The game integration object. Contains the functions related to handling functions from the club such as punishing the player for being inaccurate.
 */
declare let RhythmGameIntegration: object;
