export abstract class BaseModule {
    private _s: any;
    get settings(): any { return this._s ??= (this as any).defaultSettings; }
    get Enabled() { return true; }
    get settingsScreen(): any { return null; }
    get commands(): any[] { return []; }
    init() {} load() {} unload() {} safeword() {}
}
export enum ModuleCategory { SpeechAnalysis = 16 }
export type Subscreen = any;
export class GuiSpeechAnalysis {}
export const listeners: any[] = [];

class FakeState {
    Active = false;
    calls: string[] = [];
    constructor(public Type: string) {}
    Activate(by?: number, duration?: number) { this.Active = true; this.calls.push(`activate:${by}:${duration}`); }
    Recover(emote?: boolean) { this.Active = false; this.calls.push(`recover:${emote}`); }
}
class FakeRedressed extends FakeState {
    lastSpell: any;
    lastStrip: number | undefined;
    ApplyAdditive(spell: any, by: number | undefined, duration: number | undefined, strip: number) {
        this.lastSpell = spell; this.lastStrip = strip; this.Active = true;
        this.calls.push(`apply:${spell.Outfit.Key}:${by}:${duration}`);
    }
}
export const fakeStates: FakeState[] = [...["denied", "gagged", "horny", "hypnotized"].map(t => new FakeState(t)), new FakeRedressed("redressed")];
const stateModule = {
    States: fakeStates,
    get GaggedState() { return fakeStates[1]; },
    get HypnoState() { return fakeStates[3]; },
    get RedressedState() { return fakeStates[4]; },
};
export const RedressedState = { ItemIsAllowed: (_: any) => true };
export function getModule(name: string): any {
    if (name === "StateModule") return stateModule;
    return { RegisterCommandListener: (l: any) => listeners.push(l), RemoveCommandListenerById: () => {} };
}
