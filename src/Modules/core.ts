import { BaseModule } from "base";
import { getModule } from "modules";
import { BaseSettingsModel } from "Settings/Models/base";
import { InjectorSettingsModel } from "Settings/Models/injector";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush, isPhraseInString } from "../utils";
import { ActivityBundle, ActivityModule } from "./activities";

// Core Module that can handle base states like suffocation, hypnosis, 
export class CoreModule extends BaseModule {
    
    get defaultSettings() {
        return <BaseSettingsModel>{
            enabled: true
        };
    }

    load(): void {
        
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Core);
    }
}