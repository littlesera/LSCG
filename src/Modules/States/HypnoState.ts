import { StateConfig } from "Settings/Models/states";
import { BaseState, StateRestrictions } from "./BaseState";
import { ICONS, LSCG_SendLocal, SendAction, getRandomInt, hookFunction, setOrIgnoreBlush, settingsSave } from "utils";
import { getModule } from "modules";
import { HypnoModule } from "Modules/hypno";
import { HypnoSettingsModel } from "Settings/Models/hypno";
import { ModuleCategory } from "Settings/setting_definitions";
import { StateModule } from "Modules/states";

export class HypnoState extends BaseState {
    Type: LSCGState = "hypnotized";

    Icon(C: OtherCharacter): string {
        return ICONS.HYPNO;
    }
    Label(C: OtherCharacter): string {
        return "Hypnotized";
    }

    get hypnoSettings(): HypnoSettingsModel {
        return getModule<HypnoModule>("HypnoModule").settings;
    }

    constructor(stateModule: StateModule) {
        super(stateModule);
        this.Restrictions.Speech = "true";
        this.Restrictions.Walk = "whenImmersive";
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Eyes = "true";
    }

    Init() {
        hookFunction("Player.HasTints", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.Active) return true;
            return next(args);
        }, ModuleCategory.States);
        
        hookFunction("Player.GetTints", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.ImmersionSettings?.AllowTints)
                return next(args);
            if (this.Active) return [{r: 148, g: 0, b: 211, a: 0.4}];
            return next(args);
        }, ModuleCategory.States);
            
        hookFunction("Player.GetBlurLevel", 4, (args, next) => {
            if (!this.StateModule.Enabled || !Player.GraphicsSettings?.AllowBlur)
                return next(args);
            if (this.Active) return 3;
            return next(args);
        }, ModuleCategory.States);

        if (!this.config.activatedAt) {
            this.config.activatedAt = 0;
            this.config.recoveredAt = 0;
        }
    }

    Activate(memberNumber?: number, duration?: number, emote?: boolean): BaseState {
        if (!this.Active) {
            super.Activate(memberNumber, duration, emote);
            this.SaveExistingEyes();
            this.SetHypnotizedFace();
        }
        return this;
    }

    Recover(emote?: boolean) {
        if (this.Active) {
            if (emote) SendAction("%NAME% blinks and returns to %POSSESSIVE% senses.")
            this.ResetEyes();
            super.Recover(false);
        }
        return this;
    }

    RoomSync() {
        this.IdleEmote();
    }

    SpeechBlock() {
        this.IdleEmote();
    }

    _hornyCheck: number = 0;
    _hornyInterval: number = 30000; // 30s horny ticks
    Tick(now: number) {
        if (this._hornyCheck > (now + this._hornyInterval)) {
            this._hornyCheck = now;
            this.ArousalTick();
        }
        super.Tick(now);
    }

    // Emote Strings
    hypnoBlockStrings = [
        "%NAME%'s eyelids flutter as a thought tries to enter %POSSESSIVE% blank mind...",
        "%NAME% sways weakly in %POSSESSIVE% place, drifting peacefully...",
        "%NAME% trembles as something deep and forgotten fails to resurface...",
        "%NAME% moans softly as %PRONOUN% drops even deeper into trance...",
        "%NAME% quivers, patiently awaiting something to fill %POSSESSIVE% empty head...",
        "%NAME% stares blankly, %POSSESSIVE% mind open and suggestible...",
        "%NAME%'s eyelids flutter gently, awaiting a command...",
        "%NAME% trembles with a quiet moan as %PRONOUN% yearns to obey..."
    ];

    allowSpeechStrings = [
        "%NAME% groans softly as %PRONOUN% is allowed speech once more...",
        "%NAME% gasps quietly as %POSSESSIVE% mind can suddenly form sentences once again...",
        "%NAME% furrows %POSSESSIVE% brow briefly, words returning to %INTENSIVE%"
    ];

    blockSpeechStrings = [
        "%NAME% moans quietly as %PRONOUN% slips back down under trance...",
        "%NAME%'s eyelids flutter gently as %PRONOUN% slumps back into silence...",
        "%NAME%'s mouth falls silent once again..."
    ];

    IdleEmote() {
        if (this.Active)
            SendAction(this.hypnoBlockStrings[getRandomInt(this.hypnoBlockStrings.length)]);
    }

    // Hypnosis Handling
    SetHypnotizedFace() {
        if (this.Active) {
            setOrIgnoreBlush("Medium");
            CharacterSetFacialExpression(Player, "Fluids", "DroolLow");    
            CharacterSetFacialExpression(Player, "Mouth", null);   
            this.SetHypnoEyes();
            ChatRoomCharacterUpdate(Player);
        }
    }

    SaveExistingEyes() {
        if (!this.extensions["existingEye1Name"]) {
            this.extensions["existingEye1Name"] = InventoryGet(Player, "Eyes")?.Asset.Name;
            this.extensions["existingEye1Color"] = InventoryGet(Player, "Eyes")?.Color;
            this.extensions["existingEye2Name"] = InventoryGet(Player, "Eyes2")?.Asset.Name;
            this.extensions["existingEye2Color"] = InventoryGet(Player, "Eyes2")?.Color;
            this.extensions["existingEyeExpression"] = WardrobeGetExpression(Player)?.Eyes ?? null;
        }
        settingsSave();
    }

    SetHypnoEyes() {
        let hypnoSettings = getModule<HypnoModule>("HypnoModule")?.settings;
        var eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes" + hypnoSettings.hypnoEyeType ?? 9);
        if (!eyeAsset1)
            eyeAsset1 = AssetGet("Female3DCG", "Eyes", "Eyes9");
        
            var eyeAsset2 = AssetGet("Female3DCG", "Eyes2", "Eyes" + hypnoSettings.hypnoEyeType ?? 9);
        if (!eyeAsset2)
            eyeAsset2 = AssetGet("Female3DCG", "Eyes", "Eyes9");

        var eyes1 = InventoryGet(Player, "Eyes");
        var eyes2 = InventoryGet(Player, "Eyes2");

        let hypnoEyeColors = hypnoSettings.hypnoEyeColor?.split(",") || hypnoSettings.hypnoEyeColor;
        if (!!eyes1) {
            eyes1.Asset = eyeAsset1 ?? eyes1.Asset;
            eyes1.Color = hypnoEyeColors ?? "#A2A2A2";
        }    
        if (!!eyes2) {
            eyes2.Asset = eyeAsset2  ?? eyes2.Asset;
            eyes2.Color = hypnoEyeColors ?? "#A2A2A2";
        }

        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
        CharacterSetFacialExpression(Player, "Eyebrows", "Lowered");
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

        delete this.extensions["existingEye1Name"];
        delete this.extensions["existingEye1Color"];
        delete this.extensions["existingEye2Name"];
        delete this.extensions["existingEye2Color"];

        settingsSave();
        ChatRoomCharacterUpdate(Player);
    }

    ArousalTick() {
        if (this.Active && this.hypnoSettings.enableArousal) {
            var progress = Math.min(99, (Player.ArousalSettings?.Progress ?? 0) + 5);
            ActivitySetArousal(Player, progress);
        }
    }
    
    AllowSpeech() {
        if (this.Restrictions.Speech != "false") {
            this.Restrictions.Speech = "false";
            SendAction(this.allowSpeechStrings[getRandomInt(this.allowSpeechStrings.length)]);
        }
    }

    PreventSpeech() {
        if (this.Restrictions.Speech != "true") {
            this.Restrictions.Speech = "true";
            SendAction(this.blockSpeechStrings[getRandomInt(this.blockSpeechStrings.length)]);
        }
    }
}
