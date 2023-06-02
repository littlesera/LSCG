import { InjectorModule } from "Modules/injector";
import { SleepyMiniGame } from "./Sleepy";

export class BrainwashMiniGame extends SleepyMiniGame {
    hintText: string = "Click to focus. Try to keep your mind!";
    failText: string = "You have lost control of your body!";
    successText: string = "You shake off the drug!";
    tintColor = [{r: 148, g: 0, b: 211, a: 0}];

    constructor(module: InjectorModule) {
        super(module);
    }
}