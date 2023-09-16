import { StateConfig } from "Settings/Models/states";
import { BaseState } from "./BaseState";
import { SendAction, getRandomInt, hookFunction, setOrIgnoreBlush, settingsSave } from "utils";
import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { HypnoSettingsModel } from "Settings/Models/hypno";
import { ModuleCategory } from "Settings/setting_definitions";

export class HypnoState extends BaseState {
    get config(): StateConfig {
        return this.StateModule.getStateSetting("hypnotized");
    }

    get extensions(): any {
        if (!this.config.extensions)
            this.config.extensions = {};
        return this.config.extensions;
    }

    get hypnoSettings(): HypnoSettingsModel {
        return getModule<HypnoModule>("HypnoModule").settings;
    }

    Init() {
        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.config.active) return true;
            return next(args);
        }, ModuleCategory.States);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.config.active) return [{r: 148, g: 0, b: 211, a: 0.4}];
            return next(args);
        }, ModuleCategory.States);
            
        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.GraphicsSettings?.AllowBlur)
                return next(args);
            if (this.config.active) return 3;
            return next(args);
        }, ModuleCategory.States);

        if (!this.config.activatedAt) {
            this.config.activatedAt = 0;
            this.config.recoveredAt = 0;
            settingsSave();
        }
        if (!!this.extensions["existingEye1Name"])
            this.ResetEyes();
    }

    Activate(memberNumber?: number, emote?: boolean) {
        this.config.active = true;
        this.config.activatedAt = new Date().getTime();
        this.config.activatedBy = memberNumber ?? -1;
        this.hypnoSettings.stats.hypnotizedCount++;
        this.SetEyes();
        this.CheckHypnotizedState();
    }

    Recover(emote?: boolean) {
        this.ResetEyes();
        CharacterSetFacialExpression(Player, "Eyes", null);
        this.config.active = false;
        this.config.recoveredAt = new Date().getTime();
        settingsSave(true);
    }

    CanWalk(): boolean {
        return !this.config.immersive || !this.config.active;
    }

    _hornyCheck: number = 0;
    _hornyInterval: number = 30000; // 30s horny ticks
    Tick(now: number) {
        if (this._hornyCheck > (now + this._hornyInterval)) {
            this._hornyCheck = now;
            this.HornyTick();
        }
    }

    // Emote Strings
    hypnoBlockStrings = [
        "%NAME%'s eyelids flutter as a thought tries to enter %POSSESSIVE% blank mind...",
        "%NAME% sways weakly in %POSSESSIVE% place, drifting peacefully...",
        "%NAME% trembles as something deep and forgotten fails to resurface...",
        "%NAME% moans softly as %PRONOUN% drops even deeper into trance...",
        "%NAME% quivers, patiently awaiting something to fill %POSSESSIVE% empty head..."
    ];

    IdleEmote() {
        SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
    }

    // Hypnosis Handling
    CheckHypnotizedState() {
        if (this.config?.active) {
            this.EnforceEyes();
            setOrIgnoreBlush("Medium");
            CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
            CharacterSetFacialExpression(Player, "Fluids", "DroolLow");    
            CharacterSetFacialExpression(Player, "Mouth", null);   
        }
    }

    SetEyes() {
        this.extensions["existingEye1Name"] = InventoryGet(Player, "Eyes")?.Asset.Name;
        this.extensions["existingEye1Color"] = InventoryGet(Player, "Eyes")?.Color;
        this.extensions["existingEye2Name"] = InventoryGet(Player, "Eyes2")?.Asset.Name;
        this.extensions["existingEye2Color"] = InventoryGet(Player, "Eyes2")?.Color;
        this.extensions["existingEyeExpression"] = WardrobeGetExpression(Player)?.Eyes ?? null;

        settingsSave();
        this.EnforceEyes();
    }

    EnforceEyes() {
        let hypnoSettings = getModule<HypnoModule>("HypnoModule")?.settings;
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes" + hypnoSettings.hypnoEyeType ?? 9);
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes" + hypnoSettings.hypnoEyeType ?? 9);

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        if (!!eyes1) {
            eyes1.Asset = eyeAsset1 ?? <Asset>{};
            eyes1.Color = hypnoSettings.hypnoEyeColor ?? "#A2A2A2";
        }    
        if (!!eyes2) {
            eyes2.Asset = eyeAsset2  ?? <Asset>{};
            eyes2.Color = hypnoSettings.hypnoEyeColor ?? "#A2A2A2";
        }

        ChatRoomCharacterUpdate(Player);
    }

    ResetEyes() {
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", this.extensions["existingEye1Name"] ?? "Eyes5");
        var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", this.extensions["existingEye2Name"] ?? "Eyes5");

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        if (!!eyes1) {
            eyes1.Asset = eyeAsset1 ?? <Asset>{};
            eyes1.Color = this.extensions["existingEye1Color"];
        }    
        if (!!eyes2) {
            eyes2.Asset = eyeAsset2  ?? <Asset>{};
            eyes2.Color = this.extensions["existingEye2Color"];
        }

        CharacterSetFacialExpression(Player, "Eyes", this.extensions["existingEyeExpression"] ?? null);

        ChatRoomCharacterUpdate(Player);

        delete this.extensions["existingEye1Name"];
        delete this.extensions["existingEye1Color"];
        delete this.extensions["existingEye2Name"];
        delete this.extensions["existingEye2Color"];
        settingsSave();
    }

    HornyTick() {
        if (this.config.active && this.hypnoSettings.enableArousal) {
            var progress = Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + 5);
            ActivitySetArousal(Player, progress);
        }
    }
}