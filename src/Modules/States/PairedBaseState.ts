import { SendAction, addCustomEffect, getRandomInt, removeCustomEffect, sendLSCGCommand, sendLSCGCommandBeep, settingsSave } from "utils";
import { BaseState, StateRestrictions } from "./BaseState";
import { StateModule } from "Modules/states";

export interface Pairing {
    PairedMember: number;
    PairedBy: number;
    IsSource: boolean;
}

export abstract class PairedBaseState extends BaseState {
    get Pairings(): Pairing[] {
        if (!this.config.extensions["pairings"])
            this.config.extensions["pairings"] = [];
        return this.config.extensions["pairings"] as Pairing[];
    }

    set Pairings(pairings: Pairing[]) {
        this.config.extensions["pairings"] = pairings;
    }

    abstract Update(source: number, args: {name: string, value: any}[]): void;

    DoPair(target: Character, matchmaker: Character | null) {
        this.AddPairing(<Pairing>{
            PairedMember: target.MemberNumber,
            PairedBy: matchmaker?.MemberNumber,
            IsSource: true
        });
        this.Activate(matchmaker?.MemberNumber);
    }

    RespondToPairing(source: Character, matchmaker: Character | null) {
        this.AddPairing(<Pairing>{
            PairedMember: source.MemberNumber,
            PairedBy: matchmaker?.MemberNumber,
            IsSource: false
        });
        this.Activate(matchmaker?.MemberNumber);
    }

    Recover(emote?: boolean | undefined): void {
        this.Pairings.forEach(pair => {
            sendLSCGCommandBeep(pair.PairedMember, "unpair", [{
                name: "type",
                value: this.Type
            }])
        });
        this.Pairings = [];
        super.Recover();
    }

    Init(): void {}

    Tick(now: number) {}

    RoomSync(): void {}

    SpeechBlock(): void {}

    // ******* Pairing Manipulations *********

    AddPairing(pairing: Pairing) {
        let exists = this.Pairings.find(p => p.PairedMember == pairing.PairedMember);
        if (!exists)
            this.Pairings.push(pairing);
        else // Update if existing pairing to member of matching type
            Object.assign(exists, pairing);
        settingsSave();
    }

    RemovePairing(paired: number) {
        this.Pairings = this.Pairings.filter(p => p.PairedMember != paired)
        if (this.Pairings.length <= 0)
            super.Recover();
        else
            settingsSave();
    }

    RemovePairingsByMember(matchmaker: number) {
        this.Pairings = this.Pairings.filter(p => p.PairedBy != matchmaker);
        if (this.Pairings.length <= 0)
            super.Recover();
        else
            settingsSave();
    }

    ClearAllPairings() {
        this.Recover();
    }
}