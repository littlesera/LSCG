/**
 * Sets up the KD crash handler
 */
declare function KinkyDungeonSetupCrashHandler(): void;
/**
 * Tears down the KD crash handler
 */
declare function KinkyDungeonTeardownCrashHandler(): void;
/**
 * Error event handler for uncaught errors
 * @param {ErrorEvent} event - The error event
 */
declare function KinkyDungeonOnUncaughtError(event: ErrorEvent): void;
/**
 * Generates an error report string containing crash debug data
 * @param {ErrorEvent} event - The error event
 * @returns {string} - The report
 */
declare function KinkyDungeonGenerateErrorReport(event: ErrorEvent): string;
/**
 * Generates a report string containing debug data about the current state of the game
 * @returns {string} - The report
 */
declare function KinkyDungeonCrashReportStateData(): string;
/**
 * Generates an error report string containing debug data about the thrown error
 * @param {ErrorEvent} event - The error event
 * @returns {string} - The report
 */
declare function KinkyDungeonCrashReportErrorDetails(event: ErrorEvent): string;
/**
 * Generates a report string containing the current save state of the game
 * @returns {string} - The report
 */
declare function KinkyDungeonCrashReportSaveData(): string;
/**
 * Generates a report string containing debug data with general diagnostics information
 * @returns {string} - The report
 */
declare function KinkyDungeonCrashReportDiagnostics(): string;
/**
 * Generates a report string containing debug data with device detection information
 * @returns {string} - The report
 */
declare function KinkyDungeonCrashReportDeviceDetails(): string;
/**
 * Sanitizes a string to remove beta codes from it
 * @returns {string} - The sanitized string
 */
declare function KinkyDungeonStackSanitize(stack: any): string;
/**
 * Opens the KD crash report modal, displaying the provided report
 * @param {string} report - The report to display
 */
declare function KinkyDungeonShowCrashReportModal(report: string): void;
declare function KinkyDungeonErrorImage(src: any): HTMLImageElement;
declare function KinkyDungeonErrorPreamble(content: any): HTMLParagraphElement;
declare function KinkyDungeonErrorModalButton(text: any): HTMLButtonElement;
declare function KinkyDungeonErrorCopy(report: any, reportElement: any): Promise<boolean>;
