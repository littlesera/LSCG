/**
 * Game Balance Constants
 * Values that affect gameplay mechanics
 */

// Drug Level Configuration
export const DRUG_LEVELS = {
    /** Base multiplier for drug level calculations */
    MULTIPLIER: 100,
    /** Maximum sedative level */
    SEDATIVE_MAX: 4,
    /** Maximum mind control level */
    MIND_CONTROL_MAX: 4,
    /** Maximum horny/arousal level */
    HORNY_MAX: 4,
    /** Default sip limit for drugged drinks */
    DEFAULT_SIP_LIMIT: 0,
} as const;

// Injection Location Multipliers
export const INJECTION_MULTIPLIERS = {
    /** Neck injection effectiveness (2x) */
    NECK: 2,
    /** Breast injection effectiveness (1.8x) */
    BREAST: 1.8,
    /** Arms injection effectiveness (1.2x) */
    ARMS: 1.2,
    /** Butt injection effectiveness (1.5x) */
    BUTT: 1.5,
    /** Vulva piercings injection effectiveness (2.2x) */
    VULVA_PIERCINGS: 2.2,
    /** Legs injection effectiveness (1x) */
    LEGS: 1,
    /** Feet injection effectiveness (0.8x) */
    FEET: 0.8,
} as const;

// Activity Configuration
export const ACTIVITY_VALUES = {
    /** Max progress for netgun activity */
    NETGUN_MAX_PROGRESS: 50,
    /** Max progress for funnel pour activity */
    FUNNEL_POUR_MAX_PROGRESS: 90,
    /** Net difficulty when no crafted net */
    DEFAULT_NET_DIFFICULTY: 8,
} as const;

// Drug Effect Multipliers
export const DRUG_EFFECT_MULTIPLIERS = {
    /** Multiplier for drinking drugs vs injection */
    DRINK_MULTIPLIER: 2,
    /** Horny level effect on arousal */
    HORNY_AROUSAL_FACTOR: 4,
    /** Horny level effect on activity arousal */
    HORNY_ACTIVITY_FACTOR: 2,
    /** Tint alpha divisor for horny effect */
    HORNY_TINT_DIVISOR: 4,
    /** Minigame difficulty multiplier */
    MINIGAME_DIFFICULTY_MULTIPLIER: 8,
    /** Divisor for gradual drug level increases */
    GRADUAL_LEVEL_DIVISOR: 10,
} as const;

// Random Event Odds
export const RANDOM_EVENT_ODDS = {
    /** 1 in X chance for big sedative jump (every ~60s at 2s intervals) */
    BREATH_SEDATIVE_BIG_JUMP: 30,
    /** 1 in X chance for big mind control jump (every ~60s at 2s intervals) */
    BREATH_MIND_CONTROL_BIG_JUMP: 30,
    /** 1 in X chance for big horny jump (every ~90s at 2s intervals) */
    BREATH_HORNY_BIG_JUMP: 45,
    /** 1 in X chance for antidote heal (every ~4 min at 2s intervals) */
    BREATH_ANTIDOTE_HEAL: 120,
    /** 1 in X chance for hypno headset big jump (every ~10s at 2s intervals) */
    HYPNO_HEADSET_BIG_JUMP: 50,
    /** 1 in X chance for chaotic net miss */
    CHAOTIC_NET_HIT_CHANCE: 50,
    /** 1 in X chance to force cum from horny drug */
    HORNY_FORCE_CUM_CHANCE: 3,
    /** 1 in X chance to start minigame from breath drug */
    BREATH_MINIGAME_CHANCE: 3,
    /** 1 in X chance to start minigame from hypno headset */
    HYPNO_HEADSET_MINIGAME_CHANCE: 3,
    /** 1 in X chance for chloro event activation (every ~60s) */
    CHLORO_EVENT_CHANCE: 10,
} as const;

// Breathed Drug Level Increases
export const BREATH_DRUG_INCREASES = {
    /** Minimum random level increase (0.2) */
    MIN_INCREASE: 0.2,
    /** Maximum random level increase (0.5) */
    MAX_INCREASE: 0.5,
    /** Big jump base amount */
    BIG_JUMP_BASE: 1,
    /** Small tick divisor */
    SMALL_TICK_DIVISOR: 4,
} as const;

// Arousal Limits
export const AROUSAL_LIMITS = {
    /** Maximum arousal progress before orgasm cap */
    MAX_PROGRESS: 99,
    /** Minimum BCT arousal for split orgasm */
    BCT_SPLIT_ORGASM: 100,
} as const;
