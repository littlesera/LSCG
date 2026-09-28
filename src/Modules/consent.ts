import { BaseModule } from "base";
import { Core } from "modules";
import { IsIncapacitated, LSCG_SendLocalPrompt, getCharacter, sendLSCGCommand } from "../utils";
import { CommandListener } from "./core";

/** The target's reply to an offer. */
export type ConsentAnswer = "accepted" | "refused" | "unable";

/** How an offer finally ended, as seen by the sender. */
export type ConsentOutcome = "accepted" | "declined" | "forced" | "force-failed";

/**
 * A back-and-forth "offer -> accept/refuse -> force/back off" exchange between two players.
 *
 * Sender: calls Consent().Offer(flowId, target). If the target refuses (or can't answer), the sender
 * gets a Force / Back off prompt. The sender learns the final outcome through onComplete.
 * Target: gets an Accept / Refuse prompt. Accepting runs onAccepted; a force attempt runs onForced.
 *
 * Both players register the same flow definition, and each side only calls its own hooks.
 */
export interface ConsentFlow {
    id: string;

    // ---- Target side ----
    /** Offers are ignored while this returns false (e.g. the owning module is disabled). */
    enabled?(): boolean;
    prompt(sender: Character, payload: any): { text: string; accept: string; refuse: string };
    /** When false, the accept button is replaced with an "unable" button. */
    canAccept?(sender: Character, payload: any): boolean;
    unableLabel?: string;
    onAccepted(sender: Character, payload: any): void;
    /** timedOut: the player never actively answered (prompt expired, or they were incapacitated). */
    onRefused?(sender: Character, payload: any, answer: Exclude<ConsentAnswer, "accepted">, timedOut: boolean): void;
    /** Resolves a force attempt from the sender, returning whether it succeeded. Not needed when forceLocally is set. */
    onForced?(sender: Character, payload: any): boolean;

    // ---- Sender side ----
    /** Prompt shown after a refusal. Returning undefined skips it and the offer ends as declined. */
    forcePrompt?(target: Character, answer: Exclude<ConsentAnswer, "accepted">, payload: any): { text: string; force: string; backOff: string } | undefined;
    /** Handles "force" entirely on the sender's side instead of asking the target to resolve it. */
    forceLocally?(target: Character, payload: any): void;
    onBackOff?(target: Character, payload: any): void;
    /** Final outcome. The target may have left the room by now. */
    onComplete?(target: Character | null, outcome: ConsentOutcome, payload: any): void;
}

interface SentOffer {
    flow: ConsentFlow;
    targetNum: number;
    payload: any;
    stage: "offered" | "deciding" | "forcing";
    timer?: number;
}

interface ReceivedOffer {
    flow: ConsentFlow;
    senderNum: number;
    payload: any;
    timer: number;
}

export class ConsentModule extends BaseModule {
    static readonly PROMPT_TIMEOUT = 12000;
    /** Extra time allowed for a reply to cross the network before the other side gives up. */
    static readonly REPLY_GRACE = 3000;

    // No settings of its own; each flow's owning module decides whether it is enabled.
    get settingsStorage(): string | null {
        return null;
    }

    flows: Map<string, ConsentFlow> = new Map<string, ConsentFlow>();
    sentOffers: Map<string, SentOffer> = new Map<string, SentOffer>();
    /** Offers this player refused, kept long enough to validate a follow-up force. */
    refusedOffers: Map<string, ReceivedOffer> = new Map<string, ReceivedOffer>();
    offerCounter = 0;

    load(): void {
        Core().RegisterCommandListener(<CommandListener>{
            id: "consent_offer_listener",
            command: "consent-offer",
            func: (sender: number, msg: LSCGMessageModel) => this.IncomingOffer(sender, GetArg(msg, "id"), GetArg(msg, "flow"), GetArg(msg, "payload"))
        });
        Core().RegisterCommandListener(<CommandListener>{
            id: "consent_answer_listener",
            command: "consent-answer",
            func: (sender: number, msg: LSCGMessageModel) => this.IncomingAnswer(sender, GetArg(msg, "id"), GetArg(msg, "answer"))
        });
        Core().RegisterCommandListener(<CommandListener>{
            id: "consent_force_listener",
            command: "consent-force",
            func: (sender: number, msg: LSCGMessageModel) => this.IncomingForce(sender, GetArg(msg, "id"))
        });
        Core().RegisterCommandListener(<CommandListener>{
            id: "consent_force_result_listener",
            command: "consent-force-result",
            func: (sender: number, msg: LSCGMessageModel) => this.IncomingForceResult(sender, GetArg(msg, "id"), !!GetArg(msg, "success"))
        });
    }

    RegisterFlow(flow: ConsentFlow) {
        this.flows.set(flow.id, flow);
    }

    // ***************** Sender side *******************

    Offer(flowId: string, target: Character, payload: any = null) {
        const flow = this.flows.get(flowId);
        if (!flow || !target.MemberNumber)
            return;
        const id = `${Player.MemberNumber}-${Date.now()}-${++this.offerCounter}`;
        const offer: SentOffer = { flow, targetNum: target.MemberNumber, payload, stage: "offered" };
        this.sentOffers.set(id, offer);

        // Without LSCG the target never sees the offer, so go straight to the sender's choice.
        if (!(target as unknown as OtherCharacter).LSCG) {
            this.IncomingAnswer(target.MemberNumber, id, "refused");
            return;
        }

        sendLSCGCommand(target, "consent-offer", [
            { name: "id", value: id },
            { name: "flow", value: flowId },
            { name: "payload", value: payload }
        ]);
        offer.timer = setTimeout(() => this.IncomingAnswer(offer.targetNum, id, "refused"), ConsentModule.PROMPT_TIMEOUT + ConsentModule.REPLY_GRACE);
    }

    IncomingAnswer(fromNum: number, id: string, answer: ConsentAnswer) {
        const offer = this.sentOffers.get(id);
        if (!offer || offer.targetNum != fromNum || offer.stage != "offered")
            return;
        clearTimeout(offer.timer);

        const target = getCharacter(fromNum);
        if (answer == "accepted" || !target)
            return this.CompleteOffer(id, answer == "accepted" ? "accepted" : "declined");

        const prompt = offer.flow.forcePrompt?.(target, answer, offer.payload);
        if (!prompt)
            return this.CompleteOffer(id, "declined");

        offer.stage = "deciding";
        LSCG_SendLocalPrompt(prompt.text, [
            { label: prompt.force, color: "orange", onClick: () => this.Force(id) },
            { label: prompt.backOff, color: "green", onClick: () => {
                offer.flow.onBackOff?.(target, offer.payload);
                this.CompleteOffer(id, "declined");
            }}
        ], ConsentModule.PROMPT_TIMEOUT, () => this.CompleteOffer(id, "declined"));
    }

    Force(id: string) {
        const offer = this.sentOffers.get(id);
        const target = getCharacter(offer?.targetNum ?? -1);
        if (!offer || offer.stage != "deciding")
            return;
        if (!target)
            return this.CompleteOffer(id, "declined");

        if (!!offer.flow.forceLocally) {
            offer.flow.forceLocally(target, offer.payload);
            return this.CompleteOffer(id, "forced");
        }

        offer.stage = "forcing";
        sendLSCGCommand(target, "consent-force", [{ name: "id", value: id }]);
        // Nothing happened if the target never resolves the force (e.g. they left).
        offer.timer = setTimeout(() => this.CompleteOffer(id, "declined"), ConsentModule.REPLY_GRACE * 2);
    }

    IncomingForceResult(fromNum: number, id: string, success: boolean) {
        const offer = this.sentOffers.get(id);
        if (!offer || offer.targetNum != fromNum || offer.stage != "forcing")
            return;
        this.CompleteOffer(id, success ? "forced" : "force-failed");
    }

    CompleteOffer(id: string, outcome: ConsentOutcome) {
        const offer = this.sentOffers.get(id);
        if (!offer)
            return;
        clearTimeout(offer.timer);
        this.sentOffers.delete(id);
        offer.flow.onComplete?.(getCharacter(offer.targetNum), outcome, offer.payload);
    }

    // ***************** Target side *******************

    IncomingOffer(fromNum: number, id: string, flowId: string, payload: any) {
        const flow = this.flows.get(flowId);
        const sender = getCharacter(fromNum);
        if (!flow || !sender || !id || flow.enabled?.() === false)
            return;

        // Answered for them, so no emote as if they'd reacted
        if (IsIncapacitated())
            return this.Answer(flow, sender, id, payload, "unable", true);

        const prompt = flow.prompt(sender, payload);
        const acceptButton = (flow.canAccept?.(sender, payload) ?? true)
            ? { label: prompt.accept, color: "green", onClick: () => this.Answer(flow, sender, id, payload, "accepted", false) }
            : { label: flow.unableLabel ?? "Can't...", color: "green", onClick: () => this.Answer(flow, sender, id, payload, "unable", false) };
        LSCG_SendLocalPrompt(prompt.text, [
            acceptButton,
            { label: prompt.refuse, color: "red", onClick: () => this.Answer(flow, sender, id, payload, "refused", false) }
        ], ConsentModule.PROMPT_TIMEOUT, () => this.Answer(flow, sender, id, payload, "refused", true));
    }

    Answer(flow: ConsentFlow, sender: Character, id: string, payload: any, answer: ConsentAnswer, timedOut: boolean) {
        if (answer == "accepted") {
            flow.onAccepted(sender, payload);
        } else {
            flow.onRefused?.(sender, payload, answer, timedOut);
            this.refusedOffers.set(id, {
                flow,
                senderNum: sender.MemberNumber!,
                payload,
                timer: setTimeout(() => this.refusedOffers.delete(id), ConsentModule.PROMPT_TIMEOUT + ConsentModule.REPLY_GRACE * 2)
            });
        }
        sendLSCGCommand(sender, "consent-answer", [
            { name: "id", value: id },
            { name: "answer", value: answer }
        ]);
    }

    IncomingForce(fromNum: number, id: string) {
        const refused = this.refusedOffers.get(id);
        const sender = getCharacter(fromNum);
        if (!refused || refused.senderNum != fromNum || !sender)
            return;
        clearTimeout(refused.timer);
        this.refusedOffers.delete(id);

        const success = refused.flow.onForced?.(sender, refused.payload) ?? false;
        sendLSCGCommand(sender, "consent-force-result", [
            { name: "id", value: id },
            { name: "success", value: success }
        ]);
    }
}

function GetArg(msg: LSCGMessageModel, name: string): any {
    return msg?.command?.args?.find(a => a.name == name)?.value;
}
