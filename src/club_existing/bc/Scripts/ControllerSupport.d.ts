/**
 * Register the gamepad connection/disconnection events.
 */
declare function ControllerStart(): void;
/**
 * Check whether controller support is enabled.
 *
 * Uses the Player's configuration, with a workaround to allow
 * the controller to activate on login.
 */
declare function ControllerIsEnabled(): boolean;
/**
 * Check whether we have detected a gamepad.
 */
declare function ControllerIsActive(): boolean;
/**
 * Main gamepad processing.
 *
 * This functions goes over gamepads and collects their inputs.
 */
declare function ControllerProcess(): void;
/**
 * Adds a point to the active points list.
 *
 * @param {number} X - The X coordinate of the point
 * @param {number} Y - The Y coordinate of the point
 */
declare function ControllerAddActiveArea(X: number, Y: number): void;
/**
 * Removes all active points.
 */
declare function ControllerClearAreas(): void;
/**
 * handles the sitck input
 * @param {readonly number[]} axes the raw data of all axes of the controller
 */
declare function ControllerAxis(axes: readonly number[]): void;
/**
 * Returns TRUE if current screen is a game that handles the controller, sends the input to that screen
 * @param {readonly { pressed: boolean }[]} Buttons - The raw button data
 * @return {boolean}
 */
declare function ControllerManagedByGame(Buttons: readonly {
    pressed: boolean;
}[]): boolean;
/**
 * handles button input
 * @param {readonly GamepadButton[]} buttons raw buttons data
 */
declare function ControllerButton(buttons: readonly GamepadButton[]): void;
declare function ControllerSupportKeyDown(event: KeyboardEvent): boolean;
/**
 * A -> Click
 */
declare function ControllerClick(): void;
/**
 * Finds the closest point in a list, favoring the given direction.
 *
 * Used to navigate the active zones with a controller.
 *
 * @param {[X: number, Y: number]} point
 * @param {[X: number, Y: number][]} points
 * @param {"Up"|"Down"|"Left"|"Right"} direction
 */
declare function ControllerFindClosestPoint(point: [X: number, Y: number], points: [X: number, Y: number][], direction: "Up" | "Down" | "Left" | "Right"): number[];
/**
 * Moves the pointer throught the active zones in the direction wanted.
 *
 * @param {"Up"|"Down"|"Left"|"Right"} direction
 */
declare function ControllerMoveToActiveZone(direction: "Up" | "Down" | "Left" | "Right"): void;
/**
 * A list of points that can be interacted in the UI.
 *
 * @type {[X: number, Y: number][]}
 */
declare var ControllerActiveAreas: [X: number, Y: number][];
/** Number of detected controllers */
declare var ControllerDetectedCount: number;
declare var ControllerButtonsRepeat: boolean;
declare var ControllerA: number;
declare var ControllerB: number;
declare var ControllerX: number;
declare var ControllerY: number;
declare var ControllerTriggerRight: number;
declare var ControllerTriggerLeft: number;
declare var ControllerStickUpDown: number;
declare var ControllerStickLeftRight: number;
declare var ControllerStickRight: number;
declare var ControllerStickDown: number;
declare var ControllerDPadUp: number;
declare var ControllerDPadDown: number;
declare var ControllerDPadLeft: number;
declare var ControllerDPadRight: number;
declare var Calibrating: boolean;
declare var ControllerStick: boolean;
declare var waitasec: boolean;
declare var ControllerSensitivity: number;
/** @type {number[]} */
declare var ControllerIgnoreStick: number[];
declare var ControllerDeadZone: number;
/** @type {Record<string, boolean>} */
declare var ControllerGameActiveButttons: Record<string, boolean>;
