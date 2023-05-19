/**
 * @type {Record<string, {weight: (guard: any, xx: any, yy: any) => number, trigger: (guard: any, xx: any, yy: any) => void}>}
 */
declare let KDJailEvents: Record<string, {
    weight: (guard: any, xx: any, yy: any) => number;
    trigger: (guard: any, xx: any, yy: any) => void;
}>;
declare namespace KDGuardActions {
    namespace jailWander {
        function weight(guard: any, xx: any, yy: any): number;
        function assignable(guard: any, xx: any, yy: any): boolean;
        function assign(guard: any, xx: any, yy: any): void;
        function handle(guard: any, xx: any, yy: any): void;
    }
    namespace release {
        export function weight_1(guard: any, xx: any, yy: any): 0 | 1000;
        export { weight_1 as weight };
        export function assign_1(guard: any, xx: any, yy: any): void;
        export { assign_1 as assign };
        export function handle_1(guard: any, xx: any, yy: any): void;
        export { handle_1 as handle };
    }
    namespace jailTease {
        export function weight_2(guard: any, xx: any, yy: any): number;
        export { weight_2 as weight };
        export function assign_2(guard: any, xx: any, yy: any): void;
        export { assign_2 as assign };
        export function handle_2(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_2 as handle };
    }
    namespace bindings {
        export function weight_3(guard: any, xx: any, yy: any): number;
        export { weight_3 as weight };
        export function assign_3(guard: any, xx: any, yy: any): void;
        export { assign_3 as assign };
        export function handle_3(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_3 as handle };
    }
    namespace jailRemoveRestraints {
        export function weight_4(guard: any, xx: any, yy: any): number;
        export { weight_4 as weight };
        export function assign_4(guard: any, xx: any, yy: any): void;
        export { assign_4 as assign };
        export function handle_4(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_4 as handle };
    }
    namespace jailAddRestraints {
        export function weight_5(guard: any, xx: any, yy: any): number;
        export { weight_5 as weight };
        export function assign_5(guard: any, xx: any, yy: any): void;
        export { assign_5 as assign };
        export function handle_5(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_5 as handle };
    }
    namespace jailLockRestraints {
        export function weight_6(guard: any, xx: any, yy: any): number;
        export { weight_6 as weight };
        export function assign_6(guard: any, xx: any, yy: any): void;
        export { assign_6 as assign };
        export function handle_6(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_6 as handle };
    }
    namespace jailLeashTour {
        export function weight_7(guard: any, xx: any, yy: any): 0 | 5;
        export { weight_7 as weight };
        export function assign_7(guard: any, xx: any, yy: any): void;
        export { assign_7 as assign };
        export function handle_7(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_7 as handle };
    }
    namespace jailLeashTransfer {
        export function weight_8(guard: any, xx: any, yy: any): 0 | 5;
        export { weight_8 as weight };
        export function assign_8(guard: any, xx: any, yy: any): void;
        export { assign_8 as assign };
        export function handle_8(guard: any, xx: any, yy: any, delta: any): void;
        export { handle_8 as handle };
    }
}
declare let KinkyDungeonJailRemoveRestraintsTimerMin: number;
declare let KinkyDungeonJailedOnce: boolean;
declare let KDJailReleaseTurns: {
    minSub: number;
    releaseTurns: number;
}[];
declare let KDSecurityLevelHiSec: number;
/**
 * @type {Record<string, {overridelowerpriority: boolean, priority: number, jail: boolean, parole: boolean, restraints: {Name: string, Level: number}[]}>}
*/
declare let KDJailOutfits: Record<string, {
    overridelowerpriority: boolean;
    priority: number;
    jail: boolean;
    parole: boolean;
    restraints: {
        Name: string;
        Level: number;
    }[];
}>;
