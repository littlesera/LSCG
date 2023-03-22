import { BaseModule } from "base";
import { ModuleCategory } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule } from "../utils";
import { hypnoActivated } from "./hypno";

export class BoopsModule extends BaseModule {
    boops: number = 0;
    boopShutdown: boolean = false;
    boopDecreaseLoop: number = 0;

    load(): void {
        OnActivity(100, ModuleCategory.Boops, (data, sender, msg, metadata) => {
            let target = data.Dictionary.find((d: any) => d.Tag == "TargetCharacter");
            if (!!target && 
                target.MemberNumber == Player.MemberNumber && 
                data.Content == "ChatOther-ItemNose-Pet" && 
                !hypnoActivated()) {
                this.BoopReact(sender?.MemberNumber);
            }
        });

        this.boopDecreaseLoop = setInterval(() => {
            if (this.boops > 0)
                this.boops--;
        }, 5000);
    }

    unload(): void {
        removeAllHooksByModule(ModuleCategory.Boops);
        clearInterval(this.boopDecreaseLoop);
    }

    normalBoopReactions = [
        "%NAME% wiggles her nose.",
        "%NAME% wiggles her nose with a small frown.",
        "%NAME% sneezes in surprise.",
        "%NAME% looks crosseyed at her nose.",
        "%NAME% wiggles her nose with a squeak.",
        "%NAME% meeps!"
    ]
    
    protestBoopReactions = [
        "%NAME% swats at %OPP_NAME%'s hand.",
        "%NAME% covers her nose protectively, squinting at %OPP_NAME%.",
        "%NAME% snatches %OPP_NAME%'s booping finger."
    ]
    
    bigProtestBoopReactions = [
        "%NAME%'s nose overloads and shuts down."
    ]
    
    boundBoopReactions = [
        "%NAME% struggles in her bindings, huffing.",
        "%NAME% frowns and squirms in her bindings.",
        "%NAME% whimpers in her bondage.",
        "%NAME% groans helplessly.",
        "%NAME% whines and wiggles in her bondage."
    ]
    
    BoopReact(booperId: number | undefined) {
        if (this.boopShutdown || !booperId)
            return;
    
        let booper = ChatRoomCharacter.find(c => c.MemberNumber == booperId);
        if (!booper)
            return;
    
        this.boops++;
        
        if (this.boops >= 5)
            this.BigProtestBoopReact(booper);            
        else if (this.boops >= 3)
            this.ProtestBoopReact(booper);
        else
            this.NormalBoopReact();
    }
    
    NormalBoopReact() {
        CharacterSetFacialExpression(Player, "Blush", "Low");
        SendAction(this.normalBoopReactions[getRandomInt(this.normalBoopReactions.length)]);
    }
    
    ProtestBoopReact(booper: Character) {
        CharacterSetFacialExpression(Player, "Blush", "Medium");
        CharacterSetFacialExpression(Player, "Eyes", "Daydream");
    
        if (Player.IsRestrained())
            SendAction(this.boundBoopReactions[getRandomInt(this.boundBoopReactions.length)]);
        else
            SendAction(this.protestBoopReactions[getRandomInt(this.protestBoopReactions.length)], booper.Nickname);
    }
    
    BigProtestBoopReact(booper: Character) {
        CharacterSetFacialExpression(Player, "Blush", "High");
        CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
        SendAction(this.bigProtestBoopReactions[getRandomInt(this.bigProtestBoopReactions.length)]);
        this.boopShutdown = true;
        setTimeout(() => this.boopShutdown = false, 30000);
    }
}