/**
 * @type {Record<string, (spell: any, data: any, targetX: any, targetY: any, tX: any, tY: any, entity: any, enemy: any, moveDirection: any, bullet: any, miscast: any, faction: any, cast: any, selfCast: any) => void | string>}
 */
declare let KinkyDungeonSpellSpecials: Record<string, (spell: any, data: any, targetX: any, targetY: any, tX: any, tY: any, entity: any, enemy: any, moveDirection: any, bullet: any, miscast: any, faction: any, cast: any, selfCast: any) => void | string>;
declare namespace KDCommandCaptureBindings {
    function vine(spell: any, entity: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    function rope(spell: any, entity: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    function fabric(spell: any, entity: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    function belt(spell: any, entity: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    function chain(spell: any, entity: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
}
declare namespace KDCommandBindBindings {
    export function vine_1(spell: any, x: any, y: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    export { vine_1 as vine };
    export function rope_1(spell: any, x: any, y: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    export { rope_1 as rope };
    export function rofabricpe(spell: any, x: any, y: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    export function chain_1(spell: any, x: any, y: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    export { chain_1 as chain };
    export function belt_1(spell: any, x: any, y: any, faction: any, bullet: any, miscast: any, attacker: any, counter: any): void;
    export { belt_1 as belt };
}
