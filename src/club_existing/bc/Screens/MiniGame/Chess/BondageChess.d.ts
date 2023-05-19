/**
 * Loads the chess mini game and sets the difficulty ratio before serving the first ball
 * @returns {void} - Nothing
 */
declare function ChessLoad(): void;
/**
 * Runs the chess mini game and draws its components on screen
 * @returns {void} - Nothing
 */
declare function ChessRun(): void;
/**
 * Handles clicks during the chess mini game
 * @returns {void} - Nothing
 */
declare function ChessClick(): void;
/**
 * Returns a single letter character indicating which color pieces the player is controlling
 * @returns {"w" | "b"} - "w" for white or "b" for black
 */
declare function ChessPlayerColor(): "w" | "b";
declare var ChessBackground: string;
/** @type {null | Character} */
declare var ChessCharacterWhite: null | Character;
/** @type {null | Character} */
declare var ChessCharacterBlack: null | Character;
declare var ChessEndStatus: string;
declare var ChessMinorPieceWhite: number;
declare var ChessMajorPieceWhite: number;
declare var ChessMinorPieceBlack: number;
declare var ChessMajorPieceBlack: number;
