import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { getModule } from "modules";
import { LeashingModule } from "Modules/leashing";

export class SleepState extends BaseState {
    Type: LSCGState = "asleep";

    Icon(C: OtherCharacter): string {
        return "Assets/Female3DCG/Eyes/Closed/Icon.png";
    }
    Label(C: OtherCharacter): string {
        return "Asleep";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Walk = "whenImmersive";
        this.Restrictions.Move = "true";
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Hearing = "true";
        this.Restrictions.Sight = "true";
        this.Restrictions.Speech = "true";
        this.Restrictions.Stand = "true";
        this.Restrictions.Emoticon = "true";
        if (GameVersion !== "R114" && (DialogSelfMenuSelected as unknown) === "Expression" && DialogSelfMenuMapping.Expression.C.IsPlayer()) {
            // Refresh the expression pannel upon modifying the `Emoticon`, `Walk` or `Eyes` restrictions
            DialogSelfMenuMapping.Expression.Reload();
        }
    }

    Init() {
        this.RoomSync();
     }

    Activate(memberNumber?: number, duration?: number, emote?: boolean): BaseState | undefined {
        if (!this.Active) {
            if (emote)
                SendAction("%NAME% slumps weakly as %PRONOUN% slips into unconciousness.");
            this.SetSleepExpression(duration);
            this.FallDownIfPossible();
            this.ReleaseAllGrabs()
            addCustomEffect(Player, "ForceKneel");
            return super.Activate(memberNumber, duration, emote);
        }
        return;
    }

    Recover(emote?: boolean) {
        if (this.Active) {
            if (emote)
                SendAction("%NAME%'s eyelids flutter and start to open sleepily...");
            CharacterSetFacialExpression(Player, "Eyes", "Dazed", 15);
            if (WardrobeGetExpression(Player)?.Emoticon == "Sleep")
                CharacterSetFacialExpression(Player, "Emoticon", null);
            removeCustomEffect(Player, "ForceKneel");
            super.Recover(false);
        }
        return this;
    }

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

    SetSleepExpression(duration?: number) {
        if (!!duration) {
            CharacterSetFacialExpression(Player, "Eyes", "Closed", duration / 1000);
            CharacterSetFacialExpression(Player, "Emoticon", "Sleep", duration / 1000);
        } else {
            CharacterSetFacialExpression(Player, "Eyes", "Closed");
            CharacterSetFacialExpression(Player, "Emoticon", "Sleep");
        }
    }

    FallDownIfPossible() {
        if (Player.CanKneel()) {
            PoseSetActive(Player, "Kneel", true);
        }
    }

    ReleaseAllGrabs() {
        getModule<LeashingModule>("LeashingModule").ReleaseAllLeashingsAsSource();
    }
}