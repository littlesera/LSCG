import { LSCGHypnoApi, LSCGHypnoInstructionContext, LSCGHypnoInstructionDefinition } from "./types";
import { Registry } from "./registry";
import { ErrorOwner, safeInvoke } from "./safeInvoke";
import { sanitizeOptions, validateOptionFields, type OptionField } from "./options";

/** A suggestion instruction an extension registered, with its callback already wrapped so errors stay contained. */
export interface ExtensionInstruction {
    /** "<extension id>.<name>" */
    id: string;
    /** Display name of the extension that registered it. */
    source: string;
    label: string;
    description: string;
    options: OptionField[];
    unrepeatable: boolean;
    terminating: boolean;
    perform(ctx: LSCGHypnoInstructionContext): void;
}

/** Read by the hypnosis module and its editors at the point of use, so instructions can be registered before or after they load. */
export const extensionInstructions = new Registry<ExtensionInstruction>("hypno instruction");

/** Whether an instruction type belongs to an extension (they are namespaced; LSCG's own, like "Perform Activity", never contain a "."). */
export function isExtensionInstruction(type: unknown): type is string {
    return typeof type === "string" && type.includes(".");
}

export function extensionInstructionIds(): string[] {
    return extensionInstructions.all().map(i => i.id);
}

/** What a player sees for an instruction: LSCG's own are named by their type, an extension's by its label. One whose extension isn't installed says so. */
export function instructionLabel(type: string): string {
    if (!isExtensionInstruction(type)) return type;
    return extensionInstructions.get(type)?.label ?? `(unavailable) ${type}`;
}

/** An extension instruction as stored in a suggestion that came from another player: only its own options, each checked against its
 *  declaration. One whose extension isn't installed can't be checked, so it keeps nothing. Edits the instruction in place. */
export function sanitizeExtensionInstruction(instruction: { type?: unknown; arguments?: unknown }): void {
    if (!isExtensionInstruction(instruction?.type)) return;
    const def = extensionInstructions.get(instruction.type);
    const args = instruction.arguments as { options?: unknown } | undefined;
    instruction.arguments = def ? { options: sanitizeOptions(def.options, args?.options) } : {};
}

function requireText(owner: ErrorOwner, what: string, value: unknown): string {
    if (typeof value !== "string" || value.trim() === "")
        throw new Error(`LSCG[ext:${owner.id}]: ${what} must be a non-empty string.`);
    return value.trim();
}

/** Builds the `hypno` member of an extension handle. */
export function createHypnoApi(owner: ErrorOwner & { readonly info: { name: string } }, scopedId: (name: string) => `${string}.${string}`, track: (disposer: () => void) => void): LSCGHypnoApi {
    const mine = new Map<string, () => void>();

    return {
        registerInstruction(def: LSCGHypnoInstructionDefinition): () => void {
            if (!def || typeof def !== "object")
                throw new Error(`LSCG[ext:${owner.id}]: an instruction definition is required.`);
            if (typeof def.perform !== "function")
                throw new Error(`LSCG[ext:${owner.id}]: instruction "${def.name}" needs a perform(ctx) function.`);
            const id = scopedId(requireText(owner, "an instruction's name", def.name));
            const unregister = extensionInstructions.register({
                id,
                source: owner.info.name,
                label: requireText(owner, `instruction "${def.name}" label`, def.label),
                description: typeof def.description === "string" ? def.description : "",
                options: validateOptionFields(owner, `instruction "${def.name}"`, def.options),
                unrepeatable: !!def.unrepeatable,
                terminating: !!def.terminating,
                perform: ctx => { safeInvoke(owner, () => def.perform(ctx)); },
            });
            const remove = () => {
                if (mine.delete(def.name)) unregister();
            };
            mine.set(def.name, remove);
            track(remove);
            return remove;
        },

        unregisterInstruction(name: string): boolean {
            const remove = mine.get(name);
            if (!remove) return false;
            remove();
            return true;
        },
    };
}
