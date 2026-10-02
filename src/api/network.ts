import { LSCGCommandOptions, LSCGIncomingCommand, LSCGJson, LSCGNetworkApi, LSCGSendOptions } from "./types";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import { getCharacter, isAllowedMember, sendLSCGCommand, sendLSCGCommandBeep } from "utils";

/** Largest args payload (as JSON) sent or accepted. Commands travel in chat messages, which are kept small. */
export const MAX_COMMAND_BYTES = 4000;

interface CommandHandler {
    owner: ErrorOwner;
    /** Wire name: "<extension id>.<name>". */
    wireName: string;
    permission: "itemPermission" | "anyone";
    handler: (command: LSCGIncomingCommand) => void;
}

const handlers: CommandHandler[] = [];

/** Parses `value` as plain JSON, within `MAX_COMMAND_BYTES`. Returns undefined if it isn't (or is too big). */
function toJson(value: unknown): LSCGJson | undefined {
    try {
        const text = JSON.stringify(value);
        if (text === undefined || text.length > MAX_COMMAND_BYTES) return undefined;
        return JSON.parse(text) as LSCGJson;
    } catch {
        return undefined; // cycles, BigInt, ...
    }
}

/** Called by CoreModule for every command addressed to the player, after LSCG's own handling. */
export function dispatchExtensionCommand(sender: number, msg: LSCGMessageModel): void {
    const name = msg.command?.name;
    if (typeof name !== "string" || !name.includes(".") || handlers.length === 0)
        return;
    const matching = handlers.filter(h => h.wireName === name);
    if (matching.length === 0)
        return;

    // Arrives as a list of {name, value}; hand over a null-prototype object so odd names (like __proto__) are just data.
    const args: Record<string, LSCGJson> = Object.create(null);
    const raw = Array.isArray(msg.command?.args) ? msg.command!.args : [];
    const size = toJson(raw);
    if (size === undefined) {
        console.warn(`LSCG: dropped extension command "${name}" from ${sender}: unreadable or over ${MAX_COMMAND_BYTES} bytes.`);
        return;
    }
    for (const entry of raw) {
        if (entry && typeof entry.name === "string")
            args[entry.name] = entry.value as LSCGJson;
    }
    Object.freeze(args);
    const command: LSCGIncomingCommand = Object.freeze({ sender, args });

    // Item permission needs the sender's character, so it can only be checked for players in the room.
    const senderAllowed = isAllowedMember(getCharacter(sender) ?? undefined);
    for (const h of matching) {
        if (h.permission === "itemPermission" && !senderAllowed)
            continue;
        safeInvoke(h.owner, () => h.handler(command));
    }
}

/** Builds the `network` member of an extension handle. */
export function createNetworkApi(owner: ErrorOwner, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGNetworkApi {
    return {
        on(name: string, handler: (command: LSCGIncomingCommand) => void, options?: LSCGCommandOptions): () => void {
            if (typeof handler !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: a command handler must be a function.`);
            const entry: CommandHandler = {
                owner,
                wireName: scopedId(name),
                permission: options?.permission === "anyone" ? "anyone" : "itemPermission",
                handler,
            };
            handlers.push(entry);
            const remove = () => {
                const i = handlers.indexOf(entry);
                if (i >= 0) handlers.splice(i, 1);
            };
            track(remove);
            return remove;
        },

        send(target: number, name: string, args: Record<string, LSCGJson> = {}, options?: LSCGSendOptions): boolean {
            const wireName = scopedId(name);
            if (typeof target !== "number" || !Number.isInteger(target) || target <= 0)
                throw new Error(`LSCG[ext:${owner.id}]: send needs a member number.`);
            if (!args || typeof args !== "object" || Array.isArray(args))
                throw new Error(`LSCG[ext:${owner.id}]: a command's args must be an object.`);
            const json = toJson(args);
            if (json === undefined)
                throw new Error(`LSCG[ext:${owner.id}]: command "${name}" args must be JSON and at most ${MAX_COMMAND_BYTES} bytes.`);
            if (target === Player.MemberNumber)
                return false;

            const list = Object.entries(json as Record<string, LSCGJson>).map(([k, v]) => ({ name: k, value: v }));
            if (options?.beep) {
                sendLSCGCommandBeep(target, wireName, list);
                return true;
            }
            const character = getCharacter(target);
            if (!character)
                return false;
            sendLSCGCommand(character, wireName, list);
            return true;
        },
    };
}
