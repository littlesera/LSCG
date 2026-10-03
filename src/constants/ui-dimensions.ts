/**
 * UI Dimensions and Layout Constants
 * Values for UI positioning, sizing, and layout
 */

// Drug Bar Display
export const DRUG_BAR_DIMENSIONS = {
    /** X offset for drug bars from character */
    X_OFFSET: 380,
    /** Y offset for drug bars from character */
    Y_OFFSET: 540,
    /** Spacing between multiple drug bars */
    BAR_SPACING: 15,
    /** Zoom multiplier for bar size */
    BAR_ZOOM: 0.2,
    /** Bar width base */
    BAR_WIDTH: 40,
    /** Bar height base */
    BAR_HEIGHT: 400,
    /** Bars across before wrapping to another row. Eight fit in the character's width at normal spacing. */
    BARS_PER_ROW: 8,
    /** Vertical distance between rows: a bar's height plus a small gap. Extra rows stack upward. */
    ROW_SPACING: 90,
    /** Rows drawn; any bars beyond BARS_PER_ROW * MAX_ROWS are not shown. */
    MAX_ROWS: 2,
} as const;

// LSCG Effects Menu (Crafting)
export const LSCG_EFFECTS_MENU = {
    /** Menu X position */
    X_POSITION: 150,
    /** Menu Y position */
    Y_POSITION: 100,
    /** Menu width */
    WIDTH: 1000,
    /** Menu height */
    HEIGHT: 800,
} as const;
