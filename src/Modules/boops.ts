import { BaseModule } from "base";
import { BaseSettingsModel } from "Settings/Models/base";
import { ModuleCategory, Subscreen } from "Settings/setting_definitions";
import { OnActivity, SendAction, getRandomInt, removeAllHooksByModule, setOrIgnoreBlush } from "../utils";
import { hypnoActivated } from "./hypno";
import { GuiBoops } from "Settings/boops";

export class BoopsModule extends BaseModule {
    boops: number = 0;
    boopShutdown: boolean = false;
    boopDecreaseLoop: number = 0;

    // Disabled as it's managed via General
    // get settingsScreen(): Subscreen | null {
    //     return GuiBoops;
    // }

    get defaultSettings() {
        return <BaseSettingsModel>{
            enabled: true
        };
    }

    load(): void {
        OnActivity(100, ModuleCategory.Boops, (data, sender, msg, metadata) => {
            if (!this.Enabled)
                return;
            let target = data.Dictionary?.find((d: any) => d.Tag == "TargetCharacter");
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
        "%NAME% wiggles %POSSESSIVE% nose.",
        "%NAME% wiggles %POSSESSIVE% nose with a small frown.",
        "%NAME% sneezes in surprise.",
        "%NAME% looks crosseyed at %POSSESSIVE% nose.",
        "%NAME% wiggles %POSSESSIVE% nose with a squeak.",
        "%NAME% meeps!"
    ]
    
    protestBoopReactions = [
        "%NAME% swats at %OPP_NAME%'s hand.",
        "%NAME% covers %POSSESSIVE% nose protectively, squinting at %OPP_NAME%.",
        "%NAME% snatches %OPP_NAME%'s booping finger."
    ]
    
    bigProtestBoopReactions = [
        "%NAME%'s nose overloads and shuts down."
    ]
    
    boundBoopReactions = [
        "%NAME% struggles in %POSSESSIVE% bindings, huffing.",
        "%NAME% frowns and squirms in %POSSESSIVE% bindings.",
        "%NAME% whimpers in %POSSESSIVE% bondage.",
        "%NAME% groans helplessly.",
        "%NAME% whines and wiggles in %POSSESSIVE% bondage."
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
        setOrIgnoreBlush("Low");
        SendAction(this.normalBoopReactions[getRandomInt(this.normalBoopReactions.length)]);
    }
    
    ProtestBoopReact(booper: Character) {
        // CharacterSetFacialExpression(Player, "Eyes", "Daydream");
        setOrIgnoreBlush("Medium");
    
        if (Player.IsRestrained())
            SendAction(this.boundBoopReactions[getRandomInt(this.boundBoopReactions.length)]);
        else
            SendAction(this.protestBoopReactions[getRandomInt(this.protestBoopReactions.length)], booper);
    }
    
    BigProtestBoopReact(booper: Character) {
        // CharacterSetFacialExpression(Player, "Eyes", "Dizzy");
        setOrIgnoreBlush("High");
        SendAction(this.bigProtestBoopReactions[getRandomInt(this.bigProtestBoopReactions.length)]);
        this.boopShutdown = true;
        setTimeout(() => this.boopShutdown = false, 30000);
    }
}