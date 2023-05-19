declare function KDFactionRelation(a: any, b: any): number;
declare function KDInitFactions(Reset: any): void;
/**
 * Sets faction relation and refreshes the map
 * @param {string} a
 * @param {string} b
 * @param {number} relation
 */
declare function KDSetFactionRelation(a: string, b: string, relation: number): void;
/**
 * Changes faction relation and refreshes the map
 * @param {string} a
 * @param {string} b
 * @param {number} amount
 */
declare function KDChangeFactionRelation(a: string, b: string, amount: number, AffectRivals: any): void;
declare namespace KinkyDungeonFactionColors {
    const Jail: string[];
    const Slime: string[];
    const Dressmaker: string[];
    const Alchemist: string[];
    const Elf: string[];
    const Bountyhunter: string[];
    const AncientRobot: string[];
    const Mushy: string[];
    const Apprentice: string[];
    const Witch: string[];
}
/** Hidden factions do not auto-rep change when you attack them */
declare let KinkyDungeonHiddenFactions: string[];
declare namespace KDPiousFactions {
    const Angel: number;
}
/** Shows tooltips for these factions even though they are hidden */
declare let KinkyDungeonTooltipFactions: string[];
declare namespace KinkyDungeonFactionTag {
    const Bountyhunter_1: string;
    export { Bountyhunter_1 as Bountyhunter };
    export const Bandit: string;
    const Alchemist_1: string;
    export { Alchemist_1 as Alchemist };
    export const Nevermere: string;
    const Apprentice_1: string;
    export { Apprentice_1 as Apprentice };
    const Dressmaker_1: string;
    export { Dressmaker_1 as Dressmaker };
    const Witch_1: string;
    export { Witch_1 as Witch };
    export const Elemental: string;
    export const Dragon: string;
    export const Maidforce: string;
    export const Bast: string;
    const Elf_1: string;
    export { Elf_1 as Elf };
    const Mushy_1: string;
    export { Mushy_1 as Mushy };
    const AncientRobot_1: string;
    export { AncientRobot_1 as AncientRobot };
}
declare namespace KinkyDungeonFactionRelationsBase {
    export namespace Player {
        export const Enemy: number;
        const Jail_1: number;
        export { Jail_1 as Jail };
        export const Prisoner: number;
        export const KinkyConstruct: number;
        export const Plant: number;
        const Slime_1: number;
        export { Slime_1 as Slime };
        export const Mold: number;
        export const Beast: number;
        const Bountyhunter_2: number;
        export { Bountyhunter_2 as Bountyhunter };
        const Bandit_1: number;
        export { Bandit_1 as Bandit };
        const Alchemist_2: number;
        export { Alchemist_2 as Alchemist };
        const Nevermere_1: number;
        export { Nevermere_1 as Nevermere };
        const Apprentice_2: number;
        export { Apprentice_2 as Apprentice };
        const Dressmaker_2: number;
        export { Dressmaker_2 as Dressmaker };
        const Witch_2: number;
        export { Witch_2 as Witch };
        const Elemental_1: number;
        export { Elemental_1 as Elemental };
        const Dragon_1: number;
        export { Dragon_1 as Dragon };
        const Maidforce_1: number;
        export { Maidforce_1 as Maidforce };
        const Bast_1: number;
        export { Bast_1 as Bast };
        const Elf_2: number;
        export { Elf_2 as Elf };
        const Mushy_2: number;
        export { Mushy_2 as Mushy };
        const AncientRobot_2: number;
        export { AncientRobot_2 as AncientRobot };
        const Angel_1: number;
        export { Angel_1 as Angel };
        export const Demon: number;
    }
    export namespace Angel_2 {
        const Demon_1: number;
        export { Demon_1 as Demon };
        const Elemental_2: number;
        export { Elemental_2 as Elemental };
        const Dragon_2: number;
        export { Dragon_2 as Dragon };
        const AncientRobot_3: number;
        export { AncientRobot_3 as AncientRobot };
        const Nevermere_2: number;
        export { Nevermere_2 as Nevermere };
        const Enemy_1: number;
        export { Enemy_1 as Enemy };
    }
    export { Angel_2 as Angel };
    export namespace Natural {
        const Player_1: number;
        export { Player_1 as Player };
        const Jail_2: number;
        export { Jail_2 as Jail };
    }
    export namespace Ghost {
        const Player_2: number;
        export { Player_2 as Player };
        const Jail_3: number;
        export { Jail_3 as Jail };
    }
    export namespace Rock {
        const Player_3: number;
        export { Player_3 as Player };
    }
    export namespace Rebel {
        const Jail_4: number;
        export { Jail_4 as Jail };
    }
    export namespace Demon_2 {
        const Elf_3: number;
        export { Elf_3 as Elf };
        const Bast_2: number;
        export { Bast_2 as Bast };
        const Witch_3: number;
        export { Witch_3 as Witch };
        const Bountyhunter_3: number;
        export { Bountyhunter_3 as Bountyhunter };
        const Bandit_2: number;
        export { Bandit_2 as Bandit };
        const Alchemist_3: number;
        export { Alchemist_3 as Alchemist };
        const Nevermere_3: number;
        export { Nevermere_3 as Nevermere };
        const Apprentice_3: number;
        export { Apprentice_3 as Apprentice };
        const Dressmaker_3: number;
        export { Dressmaker_3 as Dressmaker };
        const Elemental_3: number;
        export { Elemental_3 as Elemental };
        const Dragon_3: number;
        export { Dragon_3 as Dragon };
        const Maidforce_2: number;
        export { Maidforce_2 as Maidforce };
        const Mushy_3: number;
        export { Mushy_3 as Mushy };
        const AncientRobot_4: number;
        export { AncientRobot_4 as AncientRobot };
    }
    export { Demon_2 as Demon };
    export namespace Enemy_2 {
        const KinkyConstruct_1: number;
        export { KinkyConstruct_1 as KinkyConstruct };
        const Dragon_4: number;
        export { Dragon_4 as Dragon };
        const Bountyhunter_4: number;
        export { Bountyhunter_4 as Bountyhunter };
        const Bandit_3: number;
        export { Bandit_3 as Bandit };
        const Alchemist_4: number;
        export { Alchemist_4 as Alchemist };
        const Nevermere_4: number;
        export { Nevermere_4 as Nevermere };
        const Apprentice_4: number;
        export { Apprentice_4 as Apprentice };
        const Dressmaker_4: number;
        export { Dressmaker_4 as Dressmaker };
        const Witch_4: number;
        export { Witch_4 as Witch };
        const Elemental_4: number;
        export { Elemental_4 as Elemental };
        const Maidforce_3: number;
        export { Maidforce_3 as Maidforce };
        const Bast_3: number;
        export { Bast_3 as Bast };
        const Elf_4: number;
        export { Elf_4 as Elf };
        const Mushy_4: number;
        export { Mushy_4 as Mushy };
        const AncientRobot_5: number;
        export { AncientRobot_5 as AncientRobot };
    }
    export { Enemy_2 as Enemy };
    export namespace Delinquent {
        const Player_4: number;
        export { Player_4 as Player };
        const Maidforce_4: number;
        export { Maidforce_4 as Maidforce };
        export const Chase: number;
    }
    export namespace Wolfhunter {
        const Player_5: number;
        export { Player_5 as Player };
        const Nevermere_5: number;
        export { Nevermere_5 as Nevermere };
        const Chase_1: number;
        export { Chase_1 as Chase };
    }
    export namespace Trap {
        const Enemy_3: number;
        export { Enemy_3 as Enemy };
        const Jail_5: number;
        export { Jail_5 as Jail };
        const Prisoner_1: number;
        export { Prisoner_1 as Prisoner };
        const KinkyConstruct_2: number;
        export { KinkyConstruct_2 as KinkyConstruct };
        const Plant_1: number;
        export { Plant_1 as Plant };
        const Slime_2: number;
        export { Slime_2 as Slime };
        const Mold_1: number;
        export { Mold_1 as Mold };
        const Beast_1: number;
        export { Beast_1 as Beast };
        const Bountyhunter_5: number;
        export { Bountyhunter_5 as Bountyhunter };
        const Bandit_4: number;
        export { Bandit_4 as Bandit };
        const Alchemist_5: number;
        export { Alchemist_5 as Alchemist };
        const Nevermere_6: number;
        export { Nevermere_6 as Nevermere };
        const Apprentice_5: number;
        export { Apprentice_5 as Apprentice };
        const Dressmaker_5: number;
        export { Dressmaker_5 as Dressmaker };
        const Witch_5: number;
        export { Witch_5 as Witch };
        const Elemental_5: number;
        export { Elemental_5 as Elemental };
        const Dragon_5: number;
        export { Dragon_5 as Dragon };
        const Maidforce_5: number;
        export { Maidforce_5 as Maidforce };
        const Bast_4: number;
        export { Bast_4 as Bast };
        const Elf_5: number;
        export { Elf_5 as Elf };
        const Mushy_5: number;
        export { Mushy_5 as Mushy };
        const AncientRobot_6: number;
        export { AncientRobot_6 as AncientRobot };
        const Angel_3: number;
        export { Angel_3 as Angel };
        const Demon_3: number;
        export { Demon_3 as Demon };
        const Chase_2: number;
        export { Chase_2 as Chase };
    }
    export namespace Boss {
        const Chase_3: number;
        export { Chase_3 as Chase };
    }
    const Chase_4: {};
    export { Chase_4 as Chase };
    export namespace Ambush {
        const Player_6: number;
        export { Player_6 as Player };
        const Jail_6: number;
        export { Jail_6 as Jail };
        const Chase_5: number;
        export { Chase_5 as Chase };
    }
    const Prisoner_2: {};
    export { Prisoner_2 as Prisoner };
    const Jail_7: {};
    export { Jail_7 as Jail };
    export namespace Slime_3 {
        const Jail_8: number;
        export { Jail_8 as Jail };
        const Bountyhunter_6: number;
        export { Bountyhunter_6 as Bountyhunter };
        const Bandit_5: number;
        export { Bandit_5 as Bandit };
        const Alchemist_6: number;
        export { Alchemist_6 as Alchemist };
        const Nevermere_7: number;
        export { Nevermere_7 as Nevermere };
        const Apprentice_6: number;
        export { Apprentice_6 as Apprentice };
        const Dressmaker_6: number;
        export { Dressmaker_6 as Dressmaker };
        const Witch_6: number;
        export { Witch_6 as Witch };
        const Elemental_6: number;
        export { Elemental_6 as Elemental };
        const Dragon_6: number;
        export { Dragon_6 as Dragon };
        const Maidforce_6: number;
        export { Maidforce_6 as Maidforce };
        const Bast_5: number;
        export { Bast_5 as Bast };
        const Elf_6: number;
        export { Elf_6 as Elf };
        const Mushy_6: number;
        export { Mushy_6 as Mushy };
        const AncientRobot_7: number;
        export { AncientRobot_7 as AncientRobot };
    }
    export { Slime_3 as Slime };
    export namespace Mold_2 {
        const Jail_9: number;
        export { Jail_9 as Jail };
        const Enemy_4: number;
        export { Enemy_4 as Enemy };
        const Bountyhunter_7: number;
        export { Bountyhunter_7 as Bountyhunter };
        const Bandit_6: number;
        export { Bandit_6 as Bandit };
        const Alchemist_7: number;
        export { Alchemist_7 as Alchemist };
        const Nevermere_8: number;
        export { Nevermere_8 as Nevermere };
        const Apprentice_7: number;
        export { Apprentice_7 as Apprentice };
        const Dressmaker_7: number;
        export { Dressmaker_7 as Dressmaker };
        const Witch_7: number;
        export { Witch_7 as Witch };
        const Elemental_7: number;
        export { Elemental_7 as Elemental };
        const Dragon_7: number;
        export { Dragon_7 as Dragon };
        const Maidforce_7: number;
        export { Maidforce_7 as Maidforce };
        const Bast_6: number;
        export { Bast_6 as Bast };
        const Elf_7: number;
        export { Elf_7 as Elf };
        const Mushy_7: number;
        export { Mushy_7 as Mushy };
        const AncientRobot_8: number;
        export { AncientRobot_8 as AncientRobot };
    }
    export { Mold_2 as Mold };
    export namespace Beast_2 {
        const Jail_10: number;
        export { Jail_10 as Jail };
        const Bountyhunter_8: number;
        export { Bountyhunter_8 as Bountyhunter };
        const Bandit_7: number;
        export { Bandit_7 as Bandit };
        const Alchemist_8: number;
        export { Alchemist_8 as Alchemist };
        const Nevermere_9: number;
        export { Nevermere_9 as Nevermere };
        const Apprentice_8: number;
        export { Apprentice_8 as Apprentice };
        const Dressmaker_8: number;
        export { Dressmaker_8 as Dressmaker };
        const Witch_8: number;
        export { Witch_8 as Witch };
        const Elemental_8: number;
        export { Elemental_8 as Elemental };
        const Dragon_8: number;
        export { Dragon_8 as Dragon };
        const Maidforce_8: number;
        export { Maidforce_8 as Maidforce };
        const Mushy_8: number;
        export { Mushy_8 as Mushy };
        const AncientRobot_9: number;
        export { AncientRobot_9 as AncientRobot };
    }
    export { Beast_2 as Beast };
    export namespace KinkyConstruct_3 {
        const Jail_11: number;
        export { Jail_11 as Jail };
        const Apprentice_9: number;
        export { Apprentice_9 as Apprentice };
        const Witch_9: number;
        export { Witch_9 as Witch };
        const Dressmaker_9: number;
        export { Dressmaker_9 as Dressmaker };
        const Dragon_9: number;
        export { Dragon_9 as Dragon };
    }
    export { KinkyConstruct_3 as KinkyConstruct };
    export namespace Plant_2 {
        const Jail_12: number;
        export { Jail_12 as Jail };
    }
    export { Plant_2 as Plant };
    export namespace Nevermere_10 {
        const Alchemist_9: number;
        export { Alchemist_9 as Alchemist };
        const Bast_7: number;
        export { Bast_7 as Bast };
        const Mushy_9: number;
        export { Mushy_9 as Mushy };
        const Bandit_8: number;
        export { Bandit_8 as Bandit };
        const Witch_10: number;
        export { Witch_10 as Witch };
        const Apprentice_10: number;
        export { Apprentice_10 as Apprentice };
        const AncientRobot_10: number;
        export { AncientRobot_10 as AncientRobot };
    }
    export { Nevermere_10 as Nevermere };
    export namespace Alchemist_10 {
        const Bandit_9: number;
        export { Bandit_9 as Bandit };
        const AncientRobot_11: number;
        export { AncientRobot_11 as AncientRobot };
        const Dressmaker_10: number;
        export { Dressmaker_10 as Dressmaker };
    }
    export { Alchemist_10 as Alchemist };
    export namespace Bountyhunter_9 {
        const Jail_13: number;
        export { Jail_13 as Jail };
        const Dragon_10: number;
        export { Dragon_10 as Dragon };
        const Bandit_10: number;
        export { Bandit_10 as Bandit };
        const Maidforce_9: number;
        export { Maidforce_9 as Maidforce };
        const Witch_11: number;
        export { Witch_11 as Witch };
        const Dressmaker_11: number;
        export { Dressmaker_11 as Dressmaker };
        const Nevermere_11: number;
        export { Nevermere_11 as Nevermere };
    }
    export { Bountyhunter_9 as Bountyhunter };
    export namespace Elf_8 {
        const Mushy_10: number;
        export { Mushy_10 as Mushy };
        const Beast_3: number;
        export { Beast_3 as Beast };
    }
    export { Elf_8 as Elf };
    export namespace Bast_8 {
        const Elf_9: number;
        export { Elf_9 as Elf };
        const Witch_12: number;
        export { Witch_12 as Witch };
        const Beast_4: number;
        export { Beast_4 as Beast };
    }
    export { Bast_8 as Bast };
    export namespace Bandit_11 {
        const Mushy_11: number;
        export { Mushy_11 as Mushy };
    }
    export { Bandit_11 as Bandit };
    export namespace Elemental_9 {
        const KinkyConstruct_4: number;
        export { KinkyConstruct_4 as KinkyConstruct };
        const Dressmaker_12: number;
        export { Dressmaker_12 as Dressmaker };
        const Witch_13: number;
        export { Witch_13 as Witch };
        const Bandit_12: number;
        export { Bandit_12 as Bandit };
        const Elf_10: number;
        export { Elf_10 as Elf };
        const Bast_9: number;
        export { Bast_9 as Bast };
        const Dragon_11: number;
        export { Dragon_11 as Dragon };
        const AncientRobot_12: number;
        export { AncientRobot_12 as AncientRobot };
    }
    export { Elemental_9 as Elemental };
    export namespace AncientRobot_13 {
        const Bast_10: number;
        export { Bast_10 as Bast };
        const Elf_11: number;
        export { Elf_11 as Elf };
    }
    export { AncientRobot_13 as AncientRobot };
    export namespace Dragon_12 {
        const Jail_14: number;
        export { Jail_14 as Jail };
        const Apprentice_11: number;
        export { Apprentice_11 as Apprentice };
        const Bandit_13: number;
        export { Bandit_13 as Bandit };
        const Witch_14: number;
        export { Witch_14 as Witch };
        const Alchemist_11: number;
        export { Alchemist_11 as Alchemist };
        const Beast_5: number;
        export { Beast_5 as Beast };
        const Mushy_12: number;
        export { Mushy_12 as Mushy };
    }
    export { Dragon_12 as Dragon };
    export namespace Mushy_13 {
        const Alchemist_12: number;
        export { Alchemist_12 as Alchemist };
    }
    export { Mushy_13 as Mushy };
    export namespace Witch_15 {
        const Apprentice_12: number;
        export { Apprentice_12 as Apprentice };
        const Dressmaker_13: number;
        export { Dressmaker_13 as Dressmaker };
        const Elf_12: number;
        export { Elf_12 as Elf };
    }
    export { Witch_15 as Witch };
    export namespace Dressmaker_14 {
        const Witch_16: number;
        export { Witch_16 as Witch };
        const Nevermere_12: number;
        export { Nevermere_12 as Nevermere };
        const Bandit_14: number;
        export { Bandit_14 as Bandit };
        const Dragon_13: number;
        export { Dragon_13 as Dragon };
    }
    export { Dressmaker_14 as Dressmaker };
    export namespace Apprentice_13 {
        const Jail_15: number;
        export { Jail_15 as Jail };
        const Elf_13: number;
        export { Elf_13 as Elf };
    }
    export { Apprentice_13 as Apprentice };
    export namespace Maidforce_10 {
        const Alchemist_13: number;
        export { Alchemist_13 as Alchemist };
        const Jail_16: number;
        export { Jail_16 as Jail };
        const Dragon_14: number;
        export { Dragon_14 as Dragon };
        const Apprentice_14: number;
        export { Apprentice_14 as Apprentice };
        const Bandit_15: number;
        export { Bandit_15 as Bandit };
        const Witch_17: number;
        export { Witch_17 as Witch };
    }
    export { Maidforce_10 as Maidforce };
}
declare namespace KinkyDungeonFactionRelations { }
/**
 * @type {Map<string, Map<string, number>>};
 */
declare let KDFactionRelations: Map<string, Map<string, number>>;
