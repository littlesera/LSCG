/**
 * @type {enemy[]}
 */
declare let KinkyDungeonEnemies: enemy[];
declare namespace KDOndeath {
    function summon(enemy: any, o: any): void;
    function dialogue(enemy: any, o: any): void;
    function spellOnSelf(enemy: any, o: any): void;
    function removeQuest(enemy: any, o: any): void;
    function addQuest(enemy: any, o: any): void;
}
/**
 * @type {Record<string, AIType>}
 */
declare let KDAIType: Record<string, AIType>;
/**
 * @type {Record<string, KDLoadout>}
 */
declare let KDLoadouts: Record<string, KDLoadout>;
