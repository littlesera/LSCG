import { LSCGBuiltInStateType, LSCGBuiltInStatesApi, LSCGStateHandle } from "./types";
import type { StateModule } from "Modules/states";

/** States an extension may drive directly; the rest need special entry points (outfits, pairings, sizes...). */
const DRIVABLE_STATES: readonly LSCGBuiltInStateType[] = ["asleep", "hypnotized", "horny", "denied", "blind", "deaf", "frozen", "gagged", "x-ray-vision"];

export function builtInStates(stateModule: StateModule, defaultActivator?: number): LSCGBuiltInStatesApi {
    return {
        get(type: LSCGBuiltInStateType): LSCGStateHandle | undefined {
            if (DRIVABLE_STATES.indexOf(type) < 0) return undefined;
            const state = stateModule.States.find(s => s.Type === type);
            if (!state) return undefined;
            return Object.freeze({
                type,
                get active() { return state.Active; },
                activate: (activatedBy?: number, durationMs?: number) => {
                    const duration = typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : undefined;
                    state.Activate(activatedBy ?? defaultActivator, duration);
                },
                recover: () => { state.Recover(); },
            });
        },
    };
}
