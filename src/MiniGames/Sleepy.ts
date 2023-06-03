import { InjectorModule } from "Modules/injector";
import { getRandomInt, hookFunction, ICONS } from "utils";
import { BaseMiniGame } from "./minigames";

export interface SleepyMiniGameOptions {
    name?: string;
    hintText?: string;
    failText?: string;
    successText?: string;
    tintColor?: {r: number, g: number, b: number, a: number}[];
}

export class SleepyMiniGame extends BaseMiniGame {
    Module: InjectorModule;

    startText: string = "You are feeling extrodinarily sleepy..."
    hintText: string = "Click to keep your eyes open. Try to stay awake!";
    failText: string = "You fell asleep!";
    successText: string = "You shake out of it!";
    tintColor = [{r: 0, g: 0, b: 0, a: 0}];

    constructor(module: InjectorModule) {
        super();
        this.Module = module;
    }

    GameStartTime: number = 0;
    GameEndTime: number = 0;
    StartDelay: number = 4000; // 2 second delay before starting

    SleepyVelocity = 0;
    SleepyPosition = 0;
    SleepyAcceleration = 0;
    SleepyMaxPosition = 100;
    SleepyGameDuration = 5000;
    SleepyNextTick = 0;
    SleepyText = "";
    SleepyChallenge = 0;

    BaseGameLength: number = 6000;

    removeBlurHook: () => void = () => {};
    removeHasTintHook: () => void = () => {};
    removeGetTintHook: () => void = () => {};

    End(Victory: boolean) {
        MiniGameVictory = Victory;
        MiniGameEnded = true;
        MiniGameTimer = CommonTime();
        this.GameEndTime = MiniGameTimer;
        CharacterSetFacialExpression(Player, "Eyes", Victory ? null : "Closed");
        if (Victory)
            SkillProgress("Willpower", this.SleepyChallenge);
    }

    Load(): void {
        DrawFlashScreen("#000000", 750, 1000);

        this.GameStartTime = CommonTime() + this.StartDelay;
        this.SleepyVelocity = 0;
        this.SleepyAcceleration = 0;
        if (typeof MiniGameDifficulty != "number") {
            MiniGameTimer = CommonTime() + this.BaseGameLength; // 5 seconds base
            this.SleepyChallenge = 5;
        } else {
            var difficultyTimeAdd = (MiniGameDifficulty - 8)*.25;
            var willMod = (SkillGetLevel(Player, "Willpower")/10) * difficultyTimeAdd
            this.SleepyGameDuration = this.BaseGameLength + 1000 * (difficultyTimeAdd - willMod);
            MiniGameTimer = this.GameStartTime + this.SleepyGameDuration; // One extra second per challenge level, minus a third of a second per willpower.
            this.SleepyChallenge = MiniGameDifficulty;
        }

        this.SleepyMaxPosition = 400;
        this.SleepyPosition = this.SleepyMaxPosition;

        console.info("Sleepy minigame started: difficulty - " + this.SleepyChallenge + " time - " + this.SleepyGameDuration);

        this.removeBlurHook = hookFunction("Player.GetBlurLevel", 10, (args, next) => {
            if (this.IsStartDelay) {
                return 5;
            }
            var maxBlur = 20;
            var progBlurLevel = (1 - (this.SleepyPosition/this.SleepyMaxPosition)) * maxBlur;
            return Player.GraphicsSettings?.AllowBlur ? (next(args) + progBlurLevel) : next(args);
        });
        this.removeHasTintHook = hookFunction("Player.HasTints", 10, (args, next) => {
            return Player.ImmersionSettings?.AllowTints ? true : next(args);
        });
        this.removeGetTintHook = hookFunction("Player.GetTints", 10, (args, next) => {
            var progTintAlpha = Math.min(1, .1 + (1 - (this.SleepyPosition/this.SleepyMaxPosition)));
            var tint = this.tintColor;
            tint[0].a = progTintAlpha;
            return Player.ImmersionSettings?.AllowTints ? tint : next(args);
        });
        CharacterSetFacialExpression(Player, "Eyes", "Dazed");
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
        return CommonTime() < MiniGameTimer && !MiniGameEnded && !this.GameFailed;
    }

    get IsGameTimeout() {
        return CommonTime() >= MiniGameTimer && !MiniGameEnded;
    }

    get IsEndGameReport() {
        return CommonTime() < (this.GameEndTime + 5000);
    }

    get GameFailed() {
        return this.SleepyPosition <= 0;
    }

    RunGame(delta: number) {
        var timeElapsed = (this.SleepyGameDuration +  CommonTime() - MiniGameTimer) / 1000;

        // Adjust acceleration every .4s ticks
        if (CommonTime() > this.SleepyNextTick) {
            this.SleepyNextTick = CommonTime() + 400;
            this.SleepyAcceleration = -(this.SleepyChallenge*1.25) - timeElapsed*Math.random();
            this.UpdateEyes();
        }
        this.SleepyVelocity = Math.min(this.SleepyVelocity, this.SleepyVelocity + this.SleepyAcceleration * 0.25);
        if (this.SleepyPosition >= this.SleepyMaxPosition)
            this.SleepyVelocity = Math.min(0, this.SleepyVelocity);

        if (this.SleepyPosition > 0) {
            this.SleepyPosition += this.SleepyVelocity / 1000 * delta * 3.5;
        }
            
        this.SleepyPosition = Math.max(0, Math.min(this.SleepyPosition, this.SleepyMaxPosition));

        DrawProgressBar(500 - this.SleepyMaxPosition, 800, 2*this.SleepyMaxPosition, 50, 100*(this.SleepyPosition/this.SleepyMaxPosition));
        DrawText(this.hintText, 500, 875, "white", "black");

        // var debugStr = "Chal: " + this.SleepyChallenge + " Pos: " + this.SleepyPosition + " Vel: " + this.SleepyVelocity + " Acc: " + this.SleepyAcceleration;
        // var prev = MainCanvas.textAlign;
        // MainCanvas.textAlign = "left";
        // DrawText(debugStr, 0, 100, "White", "Black");
        // MainCanvas.textAlign = prev;
        // console.info(debugStr);
    }

    UpdateEyes() {
        if (this.SleepyPosition < 50)
            CharacterSetFacialExpression(Player, "Eyes", "Closed");
        else if (this.SleepyPosition < 100)
            CharacterSetFacialExpression(Player, "Eyes", "VeryLewd");
        else if (this.SleepyPosition < 250)
            CharacterSetFacialExpression(Player, "Eyes", "Lewd");
        else
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
    }

    Run() {
        ChatRoomRun();

        if (this.IsStartDelay) {
            DrawText(this.startText, 500, 500, "white", "black");
        } else if (this.IsGameActive) {
            this.RunGame(TimerRunInterval);
        } else if ((this.IsGameTimeout || this.GameFailed) && !MiniGameEnded) {
            this.End(this.SleepyPosition > 0);
        } else if (this.IsEndGameReport) {
            DrawProgressBar(500 - this.SleepyMaxPosition, 800, 2*this.SleepyMaxPosition, 50, 100*(this.SleepyPosition/this.SleepyMaxPosition));
            DrawText(MiniGameVictory ? this.successText : this.failText, 500, 875, "white", "black");
        } else {
            MiniGameEnd();
        }
    }

    Click() {
        //CommonIsMobile
        if (this.IsGameActive)
            this.SleepyVelocity = Math.max(this.SleepyVelocity + (getRandomInt(11)+5), 20);
    }
}