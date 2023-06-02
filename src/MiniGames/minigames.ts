import { hookFunction } from "utils";

export const miniGameMap: Map<string, BaseMiniGame> = new Map<string, BaseMiniGame>();

export function miniGames(): BaseMiniGame[] {
	return [...miniGameMap.values()];
}

export function registerMiniGame<T extends BaseMiniGame>(miniGame: T): T {
    var name = miniGame.name;
    if (miniGameMap.has(name)) 
        return miniGameMap.get(name) as T ?? miniGame;
    else {
        (<any>window)[name + "Run"] = () => miniGame.Run();
        (<any>window)[name + "Click"] = () => miniGame.Click();
        (<any>window)[name + "Load"] = () => miniGame.Load();
        (<any>window)[name + "Unload"] = () => miniGame.Unload();
        (<any>window)[name + "Resize"] = () => miniGame.Resize();
        (<any>window)[name + "KeyDown"] = () => miniGame.KeyDown();
        (<any>window)[name + "Exit"] = () => miniGame.Exit();
        miniGameMap.set(name, miniGame);
        return miniGame;
    }
}

export function getMiniGame<T extends BaseMiniGame>(miniGameType: string): T {
	return miniGameMap.get(miniGameType) as T;
}

hookFunction("TextLoad", 5, (args, next) => {
    if (CurrentScreen.startsWith("LSCG_"))
        return;
    else
        return next(args);
})

export abstract class BaseMiniGame {
    get name(): string {
        return "LSCG_" + this.constructor.name;
    }

    abstract Run(): void
    abstract Click(): void
    Load(){}
    Unload(){}
    Resize(){}
    KeyDown(){}
    Exit(){}
}