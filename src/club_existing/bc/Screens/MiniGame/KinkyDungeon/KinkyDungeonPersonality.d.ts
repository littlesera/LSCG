/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
declare function KDGetPersonality(enemy: entity): string;
/**
 *
 * @param {entity} enemy
 * @returns {string}
 */
declare function KDJailPersonality(enemy: entity): string;
declare namespace KDJailPersonalities {
    const Robot: boolean;
    const Dom: boolean;
    const Sub: boolean;
}
declare let KDStrictPersonalities: string[];
declare let KDLoosePersonalities: string[];
declare let KDEnemyPersonalities: {
    "": {
        weight: number;
        loose: boolean;
        strict: boolean;
        brat: boolean;
        domVariance: number;
        tags: {
            robot: number;
        };
    };
    Robot: {
        weight: number;
        loose: boolean;
        strict: boolean;
        brat: boolean;
        tags: {
            robot: number;
        };
    };
    Dom: {
        weight: number;
        loose: boolean;
        strict: boolean;
        brat: boolean;
        tags: {
            minor: number;
            alchemist: number;
            elite: number;
            boss: number;
            robot: number;
        };
    };
    Sub: {
        weight: number;
        loose: boolean;
        strict: boolean;
        brat: boolean;
        tags: {
            minor: number;
            human: number;
            elite: number;
            boss: number;
            robot: number;
        };
    };
    Brat: {
        weight: number;
        loose: boolean;
        strict: boolean;
        brat: boolean;
        domMod: number;
        tags: {
            minor: number;
            human: number;
            boss: number;
            robot: number;
        };
    };
};
