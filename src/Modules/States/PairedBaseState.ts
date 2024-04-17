import { SendAction, sendLSCGCommandBeep, settingsSave } from "utils";
import { BaseState } from "./BaseState";

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

    DoPair(target: Character, matchmaker: Character | null, duration?: number) {
        let newPairing = <Pairing>{
            PairedMember: target.MemberNumber,
            PairedBy: matchmaker?.MemberNumber,
            IsSource: true
        };
        this.AddPairing(newPairing);
        this.Activate(matchmaker?.MemberNumber, duration);
        return newPairing;
    }

    RespondToPairing(source: Character, matchmaker: Character | null, duration?: number) {
        let newPairing = <Pairing>{
            PairedMember: source.MemberNumber,
            PairedBy: matchmaker?.MemberNumber,
            IsSource: false
        };
        this.AddPairing(newPairing);
        this.Activate(matchmaker?.MemberNumber, duration);
        return newPairing
    }

    NotifyUnpair(member: number) {
        sendLSCGCommandBeep(member, "unpair", [{
            name: "type",
            value: this.Type
        }]);
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        this.Pairings.forEach(pair => {
            sendLSCGCommandBeep(pair.PairedMember, "unpair", [{
                name: "type",
                value: this.Type
            }])
        });
        this.Pairings = [];
        return super.Recover(false);
    }

    Init(): void {}

    RoomSync(): void {}

    SpeechBlock(): void {}

    // ******* Pairing Manipulations *********

    AddPairing(pairing: Pairing) {
        let exists = this.Pairings.find(p => p.PairedMember == pairing.PairedMember);
        if (!exists)
            this.Pairings.push(pairing);
        else // Update if existing pairing to member of matching type
            pairing = Object.assign(exists, pairing);
        settingsSave();
    }

    RemovePairing(pairedMember: number) {
        this.Pairings = this.Pairings.filter(p => p.PairedMember != pairedMember)
        this.CheckIfPairingsEmpty();
    }

    RemovePairingsByMember(matchmaker: number) {
        this.Pairings = this.Pairings.filter(p => p.PairedBy != matchmaker);
        this.CheckIfPairingsEmpty();
    }

    CheckIfPairingsEmpty() {
        if (this.Pairings.length <= 0)
            super.Recover();
        else
            settingsSave();
    }

    ClearAllPairings() {
        this.Recover();
    }
}