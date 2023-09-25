import { ICONS, SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export class SleepState extends BaseState {
    Type: LSCGState = "asleep";

    get Icon(): string {
        return "Assets/Female3DCG/Eyes/Closed/Icon.png";
    }
    get Label(): string {
        return "Asleep";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Walk = "whenImmersive";
        this.Restrictions.ChangePose = "true";
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Hearing = "true";
        this.Restrictions.Sight = "true";
        this.Restrictions.Speech = "true";
        this.Restrictions.Stand = "true";
    }

    Init() {
        this.RoomSync();
     }

    Activate(memberNumber?: number, emote?: boolean) {
        if (emote)
            SendAction("%NAME% slumps weakly as %PRONOUN% slips into unconciousness.");
        this.SetSleepExpression();
        this.FallDownIfPossible();
        addCustomEffect(Player, "ForceKneel");
        super.Activate(memberNumber, emote);
    }

    Recover(emote?: boolean) {
        if (this.Active) {
            if (emote)
                SendAction("%NAME%'s eyelids flutter and start to open sleepily...");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed");
            if (WardrobeGetExpression(Player)?.Emoticon == "Sleep")
                CharacterSetFacialExpression(Player, "Emoticon", null);            
            removeCustomEffect(Player, "ForceKneel");
            super.Recover(emote);
        }
    }

    Tick(now: number) {}

    RoomSync(): void {
        if (this.Active) {
            this.SetSleepExpression();
            this.FallDownIfPossible();
            addCustomEffect(Player, "ForceKneel");
        }
    }

    SpeechBlock(): void {
        SendAction(this.sleepBlockStrings[getRandomInt(this.sleepBlockStrings.length)]);
    }

    sleepBlockStrings = [
        "%NAME%'s eyes move dreamily under %POSSESSIVE% closed eyelids...",
        "%NAME% exhales slowly, fully relaxed...",
        "%NAME%'s muscles twitch weakly in %POSSESSIVE% sleep...",
        "%NAME% moans softly and relaxes..."
    ];

    SetSleepExpression() {
        CharacterSetFacialExpression(Player, "Eyes", "Closed");
        CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
    }

    FallDownIfPossible() {
        if (Player.CanKneel()) {
            CharacterSetActivePose(Player, "Kneel", true);
        }
    }
}