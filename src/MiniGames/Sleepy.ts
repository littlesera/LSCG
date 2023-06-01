import { InjectorModule } from "Modules/injector";
import { hookFunction, ICONS } from "utils";
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

    hintText: string = "Click to keep your eyes open. Try to stay awake!";
    failText: string = "You fell asleep!";
    successText: string = "You shake out of it!";
    tintColor = [{r: 0, g: 0, b: 0, a: 0}];

    constructor(module: InjectorModule) {
        super();
        this.Module = module;
    }

    SleepyVelocity = 0;
    SleepyPosition = 0;
    SleepyAcceleration = 0;
    SleepyMaxPosition = 100;
    SleepyGameDuration = 5000;
    SleepyNextTick = 0;
    SleepyText = "";
    SleepyChallenge = 0;
    SleepyBackground = "Introduction";
    removeBlurHook: () => void = () => {};
    removeHasTintHook: () => void = () => {};
    removeGetTintHook: () => void = () => {};

    End(Victory: boolean) {
        MiniGameVictory = Victory;
        MiniGameEnded = true;
        MiniGameTimer = CommonTime();
        CharacterSetFacialExpression(Player, "Eyes", Victory ? null : "Closed");
    }

    Load(): void {
        this.SleepyBackground = ChatRoomBackground;

        this.SleepyVelocity = 0;
        this.SleepyAcceleration = 0;
        if (typeof MiniGameDifficulty != "number") {
            MiniGameTimer = CommonTime() + this.SleepyGameDuration; // 5 seconds base
            this.SleepyChallenge = 0;
        } else {
            var difficultyTimeAdd = (MiniGameDifficulty - 8)*.25;
            var willMod = (SkillGetLevel(Player, "Willpower")/10) * difficultyTimeAdd
            this.SleepyGameDuration = 5000 + 1000 * (difficultyTimeAdd - willMod);
            MiniGameTimer = CommonTime() + this.SleepyGameDuration; // One extra second per challenge level, minus a third of a second per willpower.
            this.SleepyChallenge = MiniGameDifficulty;
        }

        this.SleepyMaxPosition = 400;
        this.SleepyPosition = this.SleepyMaxPosition;

        console.info("Sleepy minigame started: difficulty - " + this.SleepyChallenge + " time - " + this.SleepyGameDuration);

        this.removeBlurHook = hookFunction("Player.GetBlurLevel", 10, (args, next) => {
            var maxBlur = 20;
            var progBlurLevel = (1 - (this.SleepyPosition/this.SleepyMaxPosition)) * maxBlur;
            return Player.ImmersionSettings?.AllowTints ? (next(args) + progBlurLevel) : next(args);
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

    Physics(delta: number) {
        var timeElapsed = 3 + (this.SleepyGameDuration +  CommonTime() - MiniGameTimer) / 2000;

        // Adjust acceleration every .4s ticks
        if (CommonTime() > this.SleepyNextTick) {
            this.SleepyNextTick = CommonTime() + 400;
            this.SleepyAcceleration = -this.SleepyChallenge + -timeElapsed*1 + 1.3*timeElapsed*Math.random();
            this.UpdateEyes();
        }
        this.SleepyVelocity = Math.min(this.SleepyVelocity, this.SleepyVelocity + this.SleepyAcceleration * 0.25);
        if (this.SleepyPosition >= this.SleepyMaxPosition)
            this.SleepyVelocity = Math.min(0, this.SleepyVelocity);

        if (this.SleepyPosition > 0) {
            this.SleepyPosition += this.SleepyVelocity / 1000 * delta * 3.5;
        }
            
        this.SleepyPosition = Math.max(0, Math.min(this.SleepyPosition, this.SleepyMaxPosition));
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
        this.SleepyBackground = ChatRoomBackground;

        //DrawRect(0, 0, 1000, 1000, "Black");
        ChatRoomRun();
        //ChatRoomDrawCharacter(false);

        // The game ends if the time runs out
        var Time = CommonTime();
        if (!MiniGameEnded && (Time >= MiniGameTimer)) {
            if (this.SleepyPosition > 0) {
                this.End(true);
            } else {
                this.End(false);
            }
            SkillProgress("Evasion",  this.SleepyChallenge/2 + 1);
        } else if (Time < MiniGameTimer) {
            this.Physics(TimerRunInterval);
        }
        if (this.SleepyPosition <= 0) {
            MiniGameTimer = Math.min(CommonTime() + 750, MiniGameTimer);
            MiniGameVictory = false;
        }


        DrawProgressBar(500 - this.SleepyMaxPosition, 800, 2*this.SleepyMaxPosition, 50, 100*(this.SleepyPosition/this.SleepyMaxPosition));
        //DrawImage(ICONS.HYPNO, 400 + this.SleepyPosition, 500);
        //DrawCharacter(Player, 400 + this.SleepyPosition, 300, 0.4);
        //DrawCharacterSegment(Player, 400 + this.SleepyPosition, 500, 100, 100);



        if (Time < MiniGameTimer) {
            this.SleepyText = this.hintText;
        } else {
            if (this.SleepyPosition <= 0) {
                this.SleepyText = this.failText;
            } else {
                this.SleepyText = this.successText;
            }
        }
        DrawText(this.SleepyText, 500, 875, "white", "black");


        if (Time >= MiniGameTimer + 1000) MiniGameEnd();

    }

    Click() {
        //CommonIsMobile
        this.SleepyVelocity = Math.max(this.SleepyVelocity + 10, 20);
    }
}