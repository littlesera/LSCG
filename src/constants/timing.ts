/**
 * Timing Constants for LSCG Module
 * All values in milliseconds unless otherwise specified
 */

// Cooldown Durations
export const COOLDOWNS = {
    /** 3 minutes - Sedative injection cooldown */
    SEDATIVE: 3 * 60 * 1000,        // 180000
    /** 4 minutes - Mind control cooldown */
    MIND_CONTROL: 4 * 60 * 1000,    // 240000
    /** 5 minutes - Arousal/horny effect cooldown */
    AROUSAL: 5 * 60 * 1000,         // 300000
} as const;

// Effect Durations
export const EFFECT_DURATIONS = {
    /** 5 seconds - Delay before action resolution */
    ACTION_DELAY: 5 * 1000,                     // 5000
    /** 1 second - Delay between suggestion instructions */
    SUGGESTION_INSTRUCTION_DELAY: 1 * 1000,     // 1000
    /** 4 seconds - Delay before hypno trigger activation */
    HYPNO_TRIGGER_DELAY: 4 * 1000,              // 4000
    /** 2 seconds - Delay before netgun resolution */
    NETGUN_RESOLVE_DELAY: 2 * 1000,             // 2000
    /** 1 second - Flash screen duration */
    FLASH_SCREEN: 1 * 1000,                     // 1000
} as const;

// Chloroform Timing
export const CHLOROFORM_TIMING = {
    /** 1 hour - Chloroform potency duration */
    POTENCY_TIME: 60 * 60 * 1000,               // 3600000
    /** 20 seconds - First passout warning stage */
    PASSOUT_STAGE_1: 20 * 1000,                 // 20000
    /** 10 seconds - Second passout warning stage */
    PASSOUT_STAGE_2: 10 * 1000,                 // 10000
    /** 5 seconds - Final passout stage */
    PASSOUT_FINAL: 5 * 1000,                    // 5000
    /** 45 seconds - Time to start removal after wearing off */
    REMOVAL_STAGE_1_WEARING_OFF: 45 * 1000,     // 45000
    /** 20 seconds - Time to start removal when removed */
    REMOVAL_STAGE_1_REMOVED: 20 * 1000,         // 20000
    /** 10 seconds - Second removal stage */
    REMOVAL_STAGE_2: 10 * 1000,                 // 10000
    /** ~60 seconds - Chloroform event interval (slightly over 1 min) */
    EVENT_INTERVAL: 60010,
} as const;

// Check Intervals
export const CHECK_INTERVALS = {
    /** 2 seconds - Breath drug event check interval */
    BREATH_DRUG_EVENT: 2 * 1000,                // 2000
    /** 2 seconds - Chloroform check interval */
    CHLOROFORM_CHECK: 2 * 1000,                 // 2000
    /** 2 seconds - BCX voice check interval */
    BCX_CHECK: 2 * 1000,                        // 2000
    /** 5 seconds - Horny tick interval */
    HORNY_TICK: 5 * 1000,                       // 5000
    /** 5 seconds - Hypno trigger check interval */
    HYPNO_TRIGGER_CHECK: 5 * 1000,              // 5000
    /** 6 seconds - Drug cooldown tick interval */
    COOLDOWN_TICK: 6 * 1000,                    // 6000
    /** 10 seconds - Influence downgrade check */
    INFLUENCE_CHECK: 10 * 1000,                 // 10000
    /** 10 minutes - Influence downgrade interval */
    INFLUENCE_DOWNGRADE: 10 * 60 * 1000,        // 600000
    /** 10 seconds - Chloroform downgrade interval */
    CHLOROFORM_DOWNGRADE: 10 * 1000,           // 10000
} as const;

// Trigger Timing
export const TRIGGER_TIMES = {
    /** 5 minutes - Default hypno trigger duration */
    DEFAULT_HYPNO_TRIGGER: 5 * 60 * 1000,       // 300000
    /** 5 minutes - Delayed activity activation timeout */
    DELAYED_ACTIVATION: 5 * 60 * 1000,          // 300000
    /** 30 minutes - Hypno trigger cycle time (in minutes, not ms) */
    HYPNO_CYCLE_TIME_MINUTES: 30,
    /** 5 minutes - Default trigger time (in minutes, not ms) */
    DEFAULT_TRIGGER_TIME_MINUTES: 5,
} as const;

// Continuous Delivery
export const CONTINUOUS_DELIVERY = {
    /** 1 hour - Default timeout for continuous drug delivery */
    DEFAULT_TIMEOUT: 60 * 60 * 1000,            // 3600000
} as const;
