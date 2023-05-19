declare function KDChillWalk(entity: any): boolean;
declare namespace KDConduction {
    const id: string;
    const type: string;
    const aura: string;
    const aurasprite: string;
    const power: number;
    const player: boolean;
    const duration: number;
    const enemies: boolean;
    const range: number;
    const events: ({
        type: string;
        duration: number;
        trigger: string;
        power?: undefined;
        damage?: undefined;
        aoe?: undefined;
    } | {
        type: string;
        power: number;
        duration: number;
        damage: string;
        aoe: number;
        trigger: string;
    })[];
}
declare namespace KDDrenched {
    const id_1: string;
    export { id_1 as id };
    const type_1: string;
    export { type_1 as type };
    const aura_1: string;
    export { aura_1 as aura };
    const aurasprite_1: string;
    export { aurasprite_1 as aurasprite };
    const power_1: number;
    export { power_1 as power };
    const player_1: boolean;
    export { player_1 as player };
    const duration_1: number;
    export { duration_1 as duration };
    const enemies_1: boolean;
    export { enemies_1 as enemies };
    const events_1: {
        type: string;
        duration: number;
        trigger: string;
    }[];
    export { events_1 as events };
}
declare namespace KDBurning {
    const id_2: string;
    export { id_2 as id };
    const type_2: string;
    export { type_2 as type };
    const aura_2: string;
    export { aura_2 as aura };
    const aurasprite_2: string;
    export { aurasprite_2 as aurasprite };
    export const noAuraColor: boolean;
    const power_2: number;
    export { power_2 as power };
    const player_2: boolean;
    export { player_2 as player };
    const duration_2: number;
    export { duration_2 as duration };
    const enemies_2: boolean;
    export { enemies_2 as enemies };
    const events_2: ({
        type: string;
        trigger: string;
        power?: undefined;
        damage?: undefined;
        damageTrigger?: undefined;
    } | {
        type: string;
        power: number;
        damage: string;
        trigger: string;
        damageTrigger?: undefined;
    } | {
        type: string;
        power: number;
        damage: string;
        damageTrigger: string;
        trigger: string;
    })[];
    export { events_2 as events };
}
declare namespace KDDisenchant1 {
    const id_3: string;
    export { id_3 as id };
    const type_3: string;
    export { type_3 as type };
    const aura_3: string;
    export { aura_3 as aura };
    const power_3: number;
    export { power_3 as power };
    const player_3: boolean;
    export { player_3 as player };
    const duration_3: number;
    export { duration_3 as duration };
    const enemies_3: boolean;
    export { enemies_3 as enemies };
}
declare namespace KDDisenchant2 {
    const id_4: string;
    export { id_4 as id };
    const type_4: string;
    export { type_4 as type };
    const aura_4: string;
    export { aura_4 as aura };
    const power_4: number;
    export { power_4 as power };
    const player_4: boolean;
    export { player_4 as player };
    const duration_4: number;
    export { duration_4 as duration };
    const enemies_4: boolean;
    export { enemies_4 as enemies };
}
declare namespace KDVolcanism {
    const id_5: string;
    export { id_5 as id };
    const type_5: string;
    export { type_5 as type };
    const aura_5: string;
    export { aura_5 as aura };
    const power_5: number;
    export { power_5 as power };
    const player_5: boolean;
    export { player_5 as player };
    const duration_5: number;
    export { duration_5 as duration };
    const enemies_5: boolean;
    export { enemies_5 as enemies };
    const events_3: {
        type: string;
        power: number;
        damage: string;
        trigger: string;
    }[];
    export { events_3 as events };
}
declare namespace KDDrenched2 {
    const id_6: string;
    export { id_6 as id };
    const type_6: string;
    export { type_6 as type };
    const power_6: number;
    export { power_6 as power };
    const player_6: boolean;
    export { player_6 as player };
    const duration_6: number;
    export { duration_6 as duration };
    const enemies_6: boolean;
    export { enemies_6 as enemies };
}
declare namespace KDDrenched3 {
    const id_7: string;
    export { id_7 as id };
    const type_7: string;
    export { type_7 as type };
    const power_7: number;
    export { power_7 as power };
    const player_7: boolean;
    export { player_7 as player };
    const duration_7: number;
    export { duration_7 as duration };
    const enemies_7: boolean;
    export { enemies_7 as enemies };
}
declare namespace KDEager {
    const id_8: string;
    export { id_8 as id };
    const type_8: string;
    export { type_8 as type };
    const power_8: number;
    export { power_8 as power };
    const duration_8: number;
    export { duration_8 as duration };
    const events_4: ({
        type: string;
        duration: number;
        trigger: string;
        power?: undefined;
    } | {
        type: string;
        duration: number;
        power: number;
        trigger: string;
    })[];
    export { events_4 as events };
}
declare namespace KDMasochist {
    const id_9: string;
    export { id_9 as id };
    const type_9: string;
    export { type_9 as type };
    const power_9: number;
    export { power_9 as power };
    const duration_9: number;
    export { duration_9 as duration };
}
declare namespace KDChilled {
    const id_10: string;
    export { id_10 as id };
    const aura_6: string;
    export { aura_6 as aura };
    const type_10: string;
    export { type_10 as type };
    const power_10: number;
    export { power_10 as power };
    const player_8: boolean;
    export { player_8 as player };
    const enemies_8: boolean;
    export { enemies_8 as enemies };
    const duration_10: number;
    export { duration_10 as duration };
}
declare namespace KDSlimed {
    const id_11: string;
    export { id_11 as id };
    const aura_7: string;
    export { aura_7 as aura };
    const aurasprite_3: string;
    export { aurasprite_3 as aurasprite };
    const noAuraColor_1: boolean;
    export { noAuraColor_1 as noAuraColor };
    const type_11: string;
    export { type_11 as type };
    const power_11: number;
    export { power_11 as power };
    const player_9: boolean;
    export { player_9 as player };
    const enemies_9: boolean;
    export { enemies_9 as enemies };
    const duration_11: number;
    export { duration_11 as duration };
    const range_1: number;
    export { range_1 as range };
    export const hideHelpless: boolean;
    export const tags: string[];
    const events_5: ({
        type: string;
        duration: number;
        trigger: string;
        power?: undefined;
    } | {
        type: string;
        trigger: string;
        duration?: undefined;
        power?: undefined;
    } | {
        type: string;
        duration: number;
        power: number;
        trigger: string;
    })[];
    export { events_5 as events };
}
declare namespace KDEncased {
    const id_12: string;
    export { id_12 as id };
    const type_12: string;
    export { type_12 as type };
    const power_12: number;
    export { power_12 as power };
    const player_10: boolean;
    export { player_10 as player };
    const enemies_10: boolean;
    export { enemies_10 as enemies };
    const duration_12: number;
    export { duration_12 as duration };
    const range_2: number;
    export { range_2 as range };
    export const replaceSprite: string;
    const tags_1: string[];
    export { tags_1 as tags };
    const events_6: ({
        type: string;
        duration: number;
        trigger: string;
        power?: undefined;
    } | {
        type: string;
        trigger: string;
        duration?: undefined;
        power?: undefined;
    } | {
        type: string;
        duration: number;
        power: number;
        trigger: string;
    })[];
    export { events_6 as events };
}
declare namespace KDChastity {
    const id_13: string;
    export { id_13 as id };
    const type_13: string;
    export { type_13 as type };
    const power_13: number;
    export { power_13 as power };
    const aura_8: string;
    export { aura_8 as aura };
    const aurasprite_4: string;
    export { aurasprite_4 as aurasprite };
    const player_11: boolean;
    export { player_11 as player };
    const enemies_11: boolean;
    export { enemies_11 as enemies };
    const duration_13: number;
    export { duration_13 as duration };
    const range_3: number;
    export { range_3 as range };
    const tags_2: string[];
    export { tags_2 as tags };
    const events_7: {
        type: string;
        power: number;
        trigger: string;
        prereq: string;
    }[];
    export { events_7 as events };
}
declare namespace KDVibrate1 {
    const id_14: string;
    export { id_14 as id };
    const type_14: string;
    export { type_14 as type };
    const power_14: number;
    export { power_14 as power };
    const aura_9: string;
    export { aura_9 as aura };
    const duration_14: number;
    export { duration_14 as duration };
    const tags_3: string[];
    export { tags_3 as tags };
    const events_8: {
        type: string;
        trigger: string;
    }[];
    export { events_8 as events };
}
declare namespace KDVibrate2 {
    const id_15: string;
    export { id_15 as id };
    const type_15: string;
    export { type_15 as type };
    const power_15: number;
    export { power_15 as power };
    const aura_10: string;
    export { aura_10 as aura };
    const duration_15: number;
    export { duration_15 as duration };
    const tags_4: string[];
    export { tags_4 as tags };
    const events_9: {
        type: string;
        trigger: string;
    }[];
    export { events_9 as events };
}
declare namespace KDVibrate3 {
    const id_16: string;
    export { id_16 as id };
    const type_16: string;
    export { type_16 as type };
    const power_16: number;
    export { power_16 as power };
    const aura_11: string;
    export { aura_11 as aura };
    const duration_16: number;
    export { duration_16 as duration };
    const tags_5: string[];
    export { tags_5 as tags };
    const events_10: {
        type: string;
        trigger: string;
    }[];
    export { events_10 as events };
}
declare namespace KDToy {
    const id_17: string;
    export { id_17 as id };
    const type_17: string;
    export { type_17 as type };
    const power_17: number;
    export { power_17 as power };
    const aura_12: string;
    export { aura_12 as aura };
    const aurasprite_5: string;
    export { aurasprite_5 as aurasprite };
    const player_12: boolean;
    export { player_12 as player };
    const enemies_12: boolean;
    export { enemies_12 as enemies };
    const duration_17: number;
    export { duration_17 as duration };
    const range_4: number;
    export { range_4 as range };
    const tags_6: string[];
    export { tags_6 as tags };
}
declare namespace KDPlugged {
    const id_18: string;
    export { id_18 as id };
    const type_18: string;
    export { type_18 as type };
    const power_18: number;
    export { power_18 as power };
    const aura_13: string;
    export { aura_13 as aura };
    const aurasprite_6: string;
    export { aurasprite_6 as aurasprite };
    const player_13: boolean;
    export { player_13 as player };
    const enemies_13: boolean;
    export { enemies_13 as enemies };
    const duration_18: number;
    export { duration_18 as duration };
    const range_5: number;
    export { range_5 as range };
    const tags_7: string[];
    export { tags_7 as tags };
    const events_11: ({
        type: string;
        power: number;
        trigger: string;
        prereq?: undefined;
    } | {
        type: string;
        trigger: string;
        prereq: string;
        power?: undefined;
    })[];
    export { events_11 as events };
}
declare namespace KDDoublePlugged {
    const id_19: string;
    export { id_19 as id };
    const type_19: string;
    export { type_19 as type };
    const power_19: number;
    export { power_19 as power };
    const aura_14: string;
    export { aura_14 as aura };
    const aurasprite_7: string;
    export { aurasprite_7 as aurasprite };
    const player_14: boolean;
    export { player_14 as player };
    const enemies_14: boolean;
    export { enemies_14 as enemies };
    const duration_19: number;
    export { duration_19 as duration };
    const range_6: number;
    export { range_6 as range };
    const tags_8: string[];
    export { tags_8 as tags };
    const events_12: ({
        type: string;
        power: number;
        trigger: string;
        prereq?: undefined;
    } | {
        type: string;
        trigger: string;
        prereq: string;
        power?: undefined;
    })[];
    export { events_12 as events };
}
declare namespace KDGlueVulnLow {
    const id_20: string;
    export { id_20 as id };
    const type_20: string;
    export { type_20 as type };
    const power_20: number;
    export { power_20 as power };
    const player_15: boolean;
    export { player_15 as player };
    const enemies_15: boolean;
    export { enemies_15 as enemies };
    const duration_20: number;
    export { duration_20 as duration };
}
declare namespace KDGlueResist {
    const id_21: string;
    export { id_21 as id };
    const type_21: string;
    export { type_21 as type };
    const power_21: number;
    export { power_21 as power };
    const player_16: boolean;
    export { player_16 as player };
    const enemies_16: boolean;
    export { enemies_16 as enemies };
    const duration_21: number;
    export { duration_21 as duration };
}
declare namespace KDDollDebuff {
    const id_22: string;
    export { id_22 as id };
    const type_22: string;
    export { type_22 as type };
    const power_22: number;
    export { power_22 as power };
    const player_17: boolean;
    export { player_17 as player };
    const enemies_17: boolean;
    export { enemies_17 as enemies };
    const duration_22: number;
    export { duration_22 as duration };
    const aura_15: string;
    export { aura_15 as aura };
}
declare namespace KDDollDebuff2 {
    const id_23: string;
    export { id_23 as id };
    const type_23: string;
    export { type_23 as type };
    const power_23: number;
    export { power_23 as power };
    const player_18: boolean;
    export { player_18 as player };
    const enemies_18: boolean;
    export { enemies_18 as enemies };
    const duration_23: number;
    export { duration_23 as duration };
}
declare namespace KDSlowed {
    const id_24: string;
    export { id_24 as id };
    const type_24: string;
    export { type_24 as type };
    const power_24: number;
    export { power_24 as power };
    const player_19: boolean;
    export { player_19 as player };
    const enemies_19: boolean;
    export { enemies_19 as enemies };
    const duration_24: number;
    export { duration_24 as duration };
}
declare namespace KDAttackSlow {
    const id_25: string;
    export { id_25 as id };
    const type_25: string;
    export { type_25 as type };
    const power_25: number;
    export { power_25 as power };
    const player_20: boolean;
    export { player_20 as player };
    const enemies_20: boolean;
    export { enemies_20 as enemies };
    const duration_25: number;
    export { duration_25 as duration };
}
declare namespace KDUnsteady {
    const id_26: string;
    export { id_26 as id };
    const aura_16: string;
    export { aura_16 as aura };
    const type_26: string;
    export { type_26 as type };
    const power_26: number;
    export { power_26 as power };
    const player_21: boolean;
    export { player_21 as player };
    const enemies_21: boolean;
    export { enemies_21 as enemies };
    const duration_26: number;
    export { duration_26 as duration };
}
declare namespace KDUnsteady2 {
    const id_27: string;
    export { id_27 as id };
    const aura_17: string;
    export { aura_17 as aura };
    const type_27: string;
    export { type_27 as type };
    const power_27: number;
    export { power_27 as power };
    const player_22: boolean;
    export { player_22 as player };
    const enemies_22: boolean;
    export { enemies_22 as enemies };
    const duration_27: number;
    export { duration_27 as duration };
}
declare namespace KDUnsteady3 {
    const id_28: string;
    export { id_28 as id };
    const type_28: string;
    export { type_28 as type };
    const power_28: number;
    export { power_28 as power };
    const player_23: boolean;
    export { player_23 as player };
    const enemies_23: boolean;
    export { enemies_23 as enemies };
    const duration_28: number;
    export { duration_28 as duration };
}
declare namespace KDNoChill {
    const id_29: string;
    export { id_29 as id };
    const aura_18: string;
    export { aura_18 as aura };
    const type_29: string;
    export { type_29 as type };
    const power_29: number;
    export { power_29 as power };
    const player_24: boolean;
    export { player_24 as player };
    const enemies_24: boolean;
    export { enemies_24 as enemies };
    const duration_29: number;
    export { duration_29 as duration };
}
declare namespace KDNoChillNoAura {
    const id_30: string;
    export { id_30 as id };
    const type_30: string;
    export { type_30 as type };
    const power_30: number;
    export { power_30 as power };
    const player_25: boolean;
    export { player_25 as player };
    const enemies_25: boolean;
    export { enemies_25 as enemies };
    const duration_30: number;
    export { duration_30 as duration };
}
declare namespace KDRestraintDisarmLight {
    const id_31: string;
    export { id_31 as id };
    const aura_19: string;
    export { aura_19 as aura };
    const type_31: string;
    export { type_31 as type };
    const power_31: number;
    export { power_31 as power };
    const player_26: boolean;
    export { player_26 as player };
    const enemies_26: boolean;
    export { enemies_26 as enemies };
    const duration_31: number;
    export { duration_31 as duration };
    const events_13: {
        type: string;
        trigger: string;
    }[];
    export { events_13 as events };
}
declare namespace KDBuffReference {
    const RestraintDisarmLight: {
        id: string;
        aura: string;
        type: string;
        power: number;
        player: boolean;
        enemies: boolean;
        duration: number;
        events: {
            type: string;
            trigger: string;
        }[];
    }[];
    const Unsteady: {
        id: string;
        type: string;
        power: number;
        player: boolean;
        enemies: boolean;
        duration: number;
    }[];
    const Plugged: {
        id: string;
        type: string;
        power: number;
        aura: string;
        aurasprite: string;
        player: boolean;
        enemies: boolean;
        duration: number;
        range: number;
        tags: string[];
        events: ({
            type: string;
            power: number;
            trigger: string;
            prereq?: undefined;
        } | {
            type: string;
            trigger: string;
            prereq: string;
            power?: undefined;
        })[];
    }[];
    const DoublePlugged: {
        id: string;
        type: string;
        power: number;
        aura: string;
        aurasprite: string;
        player: boolean;
        enemies: boolean;
        duration: number;
        range: number;
        tags: string[];
        events: ({
            type: string;
            power: number;
            trigger: string;
            prereq?: undefined;
        } | {
            type: string;
            trigger: string;
            prereq: string;
            power?: undefined;
        })[];
    }[];
    const Chastity: {
        id: string;
        type: string;
        power: number;
        aura: string;
        aurasprite: string;
        player: boolean;
        enemies: boolean;
        duration: number;
        range: number;
        tags: string[];
        events: {
            type: string;
            power: number;
            trigger: string;
            prereq: string;
        }[];
    }[];
    const Vibrate1: {
        id: string;
        type: string;
        power: number;
        aura: string;
        duration: number;
        tags: string[];
        events: {
            type: string;
            trigger: string;
        }[];
    }[];
    const Vibrate2: {
        id: string;
        type: string;
        power: number;
        aura: string;
        duration: number;
        tags: string[];
        events: {
            type: string;
            trigger: string;
        }[];
    }[];
    const Vibrate3: {
        id: string;
        type: string;
        power: number;
        aura: string;
        duration: number;
        tags: string[];
        events: {
            type: string;
            trigger: string;
        }[];
    }[];
}
declare namespace KDDisenchantSelf {
    const id_32: string;
    export { id_32 as id };
    const aura_20: string;
    export { aura_20 as aura };
    const type_32: string;
    export { type_32 as type };
    const power_32: number;
    export { power_32 as power };
    const player_27: boolean;
    export { player_27 as player };
    const enemies_27: boolean;
    export { enemies_27 as enemies };
    const duration_32: number;
    export { duration_32 as duration };
}
