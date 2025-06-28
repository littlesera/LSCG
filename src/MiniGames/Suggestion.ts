import { InjectorModule } from "Modules/injector";
import { getRandomInt, hookFunction, ICONS } from "utils";
import { BaseMiniGame } from "./minigames";
import { HypnoModule, HypnoSuggestion, SuggestionMiniGameOptions } from "Modules/hypno";
import { getModule } from "modules";

export class SuggestionMiniGame extends BaseMiniGame {
    Module: HypnoModule;
    get Options(): SuggestionMiniGameOptions | undefined { return this.Module.MiniGameOptions; }

    get name(): LSCGMiniGames {
        return "LSCG_SuggestionMiniGame";
    }

    constructor(module: HypnoModule) {
        super();
        this.Module = module;
    }

    GameStartTime: number = 0;
    GameEndTime: number = 0;
    StartDelay: number = 1500; // 1.5 second delay before prompting
    ResistTime: number = 1200;
    
    Suggestion: HypnoSuggestion | undefined;
    Influence: number = 0;
    Submitted: boolean = false;
    ResistRoll?: number;
    ResistStarted: number = 0;
    get Resisting(): boolean { return this.ResistStarted > (CommonTime() - this.ResistTime) };

    removeBlurHook: () => void = () => {};
    removeHasTintHook: () => void = () => {};
    removeGetTintHook: () => void = () => {};

    End(Victory: boolean) {
        this.ResistStarted = 0;
        MiniGameVictory = Victory;
        MiniGameEnded = true;
        MiniGameTimer = CommonTime();
        this.GameEndTime = MiniGameTimer;
    }

    Load(): void {
        if (!this.Options) {
            this.End(true);
            return;
        }

        this.Submitted = false;
        this.ResistRoll = undefined;
        DrawFlashScreen("#000000", 750, 1000);
        this.GameStartTime = CommonTime() + this.StartDelay;
        MiniGameTimer = CommonTime() + this.StartDelay + (this.Options?.gameLength ??  10000);
        
        if (typeof MiniGameDifficulty != "number") {
            MiniGameDifficulty = this.Module.GetSuggestionInfluence(this.Options.suggestion, this.Options?.sender);
        }

        console.info(this.Options);
        console.info(MiniGameDifficulty);

        this.removeBlurHook = hookFunction("Player.GetBlurLevel", 10, (args, next) => {
            if (!this.Options)
                return next(args);
            if (this.IsStartDelay && Player.GraphicsSettings?.AllowBlur) {
                return 5;
            }
            var maxBlur = 20;
            var progBlurLevel = (1 - (MiniGameDifficulty/100)) * maxBlur;
            return Player.GraphicsSettings?.AllowBlur ? (next(args) + progBlurLevel) : next(args);
        });
        this.removeHasTintHook = hookFunction("Player.HasTints", 10, (args, next) => {
            if (!this.Options)
                return next(args);
            return Player.ImmersionSettings?.AllowTints ? true : next(args);
        });
        this.removeGetTintHook = hookFunction("Player.GetTints", 10, (args, next) => {
            if (!this.Options)
                return next(args);
            var progTintAlpha = Math.min(1, .1 + (1 - (MiniGameDifficulty/100)));
            var tint = this.Options?.tintColor;
            tint[0].a = progTintAlpha;
            return Player.ImmersionSettings?.AllowTints ? tint : next(args);
        });
    }

    Unload(): void {
        this.removeBlurHook();
        this.removeHasTintHook();
        this.removeGetTintHook();
    }

    get IsStartDelay() {
        return CommonTime() < this.GameStartTime;
    }

    get IsGameActive() {
        return !this.GameFailed && (this.Resisting || (CommonTime() < MiniGameTimer && !MiniGameEnded));
    }

    get IsGameTimeout() {
        return CommonTime() >= MiniGameTimer && !MiniGameEnded;
    }

    get IsEndGameReport() {
        return MiniGameEnded && CommonTime() < (this.GameEndTime + 2000);
    }

    GameFailed: boolean = false;

    Run() {
        ChatRoomRun(CommonTime());
        if (!this.Options) {
            return this.End(true);
        }
        if (this.IsStartDelay) {
            DrawText(this.Options?.hintText, 500, 500, "white", "black");
        } else if (this.IsGameActive) {
            this.RunGame(TimerRunInterval);
        } else if ((this.IsGameTimeout || this.GameFailed) && !MiniGameEnded) {
            this.End(false);
        } else if (this.IsEndGameReport) {
            let endText = MiniGameVictory ?
                this.Options.successText :
                (this.Submitted ? this.Options.submissionText : this.Options.failText)
            if (this.Resisting) {
                let color = (this.ResistRoll ?? 0) > MiniGameDifficulty ? "green" : "red";
                DrawText(`${this.ResistRoll} > ${MiniGameDifficulty} ?`, 500, 500, color, "black");
            }
            DrawText(endText, 500, 875, "white", "black");
        }else {
            MiniGameEnd();
        }
    }

    Click() {
        if (this.IsGameActive && !this.Resisting){
            if (MouseIn(200, 532, 250, 64)) { // Resist Click
                this.Resist();
            } else if (MouseIn(550, 532, 250, 64)) { // Submit Click
                this.Submit();
            }
        }
    }

    Resist() {
        this.ResistStarted = CommonTime();
        this.ResistRoll = this.Module.GetResistRoll();
        console.info(`Resist ${this.ResistRoll}`);
    }

    Submit() {
        this.Submitted = true;
        this.End(false);
    }

    RunGame(delta: number) {
        if (!this.Options)
            return;

        if (!!this.ResistRoll) {
            let elapsed = CommonTime() - this.ResistStarted;
            if (elapsed > this.ResistTime) {
                this.End(this.ResistRoll > MiniGameDifficulty); // Once the walk-up is done, do the end game stage
            }
            let tempVal = Math.ceil(this.ResistRoll * (elapsed / this.ResistTime));
            let color = tempVal > MiniGameDifficulty ? "green" : "red";
            DrawText(`${tempVal} > ${MiniGameDifficulty} ?`, 500, 500, color, "black");
        } else {
            var timeElapsed = (CommonTime() - this.GameStartTime);
            let perc = Math.min(100, Math.max(0, (1 - (timeElapsed/this.Options.gameLength)) * 100));
            DrawProgressBar(50, 970, 900, 25, perc);
            DrawText(this.Options.hintText, 500, 875, "white", "black");
            DrawButton(200, 532, 250, 64, "Resist", "White");
            DrawButton(550, 532, 250, 64, "Submit", "White");
        }
    }
}