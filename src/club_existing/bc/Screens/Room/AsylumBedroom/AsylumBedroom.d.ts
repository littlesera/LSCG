/**
 * Loads the room and initializes the UI elements. Called dynamically
 * @returns {void} - Nothing
 */
declare function AsylumBedroomLoad(): void;
/**
 * Runs the bedroom. Is called dynamically at very short intervals so don't use espensive loops or other functions from within
 * @returns {void} - Nothing
 */
declare function AsylumBedroomRun(): void;
/**
 * Handles the click events. Is called from CommonClick()
 * @returns {void} - Nothing
 */
declare function AsylumBedroomClick(): void;
declare var AsylumBedroomBackground: string;
