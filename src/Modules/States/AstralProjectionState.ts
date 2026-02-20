import { ApplyItem, BC_ItemToItemBundle, CopyCharacter, GetConfiguredItemBundlesFromOutfitKey, GetHandheldItemNameAndDescriptionConcat, GetItemNameAndDescriptionConcat, hookFunction, isAppearance, isBind, isCloth, isPhraseInString, settingsSave } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";
import { getModule } from "modules";
import { MagicModule } from "Modules/magic";

// TODO:
// - Allow 'soulbind' bindings to be added to ghost and carry over from corporeal form if applied there.
//     - Save 'astral' items in extensions, use without displaying to influence restrictions

export const SoulbindKeywords: string[] = [
	"soulbind",
    "soul-binding",
    "soul-bindings",
    "astral"
];

export function IsSoulBind(item: Item): boolean {
    return SoulbindKeywords.some(key => isPhraseInString(GetItemNameAndDescriptionConcat(item) ?? "", key));
}

export interface GhostConfig {
    a: AppearanceBundle;
    p: Partial<Record<AssetPoseCategory, AssetPoseName>>;
}

export interface SoulBindings extends AppearanceBundle {}

export class AstralProjectionState extends BaseState {
    hideGhost: boolean = false;
    hideCorporeal: boolean = false;
    
    Type: LSCGState = "astral-projection";

    Icon(C: OtherCharacter): string {
        return "Icons/Cage.png";
    }
    Label(C: OtherCharacter): string {
        return "Astral Projection";
    }

    constructor(state: StateModule) {
        super(state);
        this.Restrictions.Wardrobe = "true";
        this.Restrictions.Walk = "true";
        this.Restrictions.Touch = "true";
    }

    get Active(): boolean {
        return this.config.active;
    }

    GetGhostConfig(C: OtherCharacter | PlayerCharacter): GhostConfig {
        return C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")?.extensions["ghost"] as GhostConfig;
    }

    SetGhostConfig(C: OtherCharacter | PlayerCharacter, ghostChar: GhostConfig) {
        if (!C.LSCG) return;
        let stateConfig = C.LSCG.StateModule?.states?.find(state => state.type === "astral-projection");
        if (!stateConfig) return;
        stateConfig.extensions["ghost"] = ghostChar;
    }

    GetProjectionTintColor(C: OtherCharacter | PlayerCharacter): string {
        return C.LSCG.MagicModule.projectionTintColor ?? '#00ced1'; // Darker Teal
    }

    GetGhostCharacter(C: OtherCharacter | PlayerCharacter): Character {
        let activeStateConfig = C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
        if (!activeStateConfig || !activeStateConfig.active) {
            return C;
        } else {
            let ghostChar = CopyCharacter(C, `LSCGAstralProjection-${C.ID}`, true, true);
            let ghostConfig = this.GetGhostConfig(C);
            let soulBindings = C.Appearance.filter(i => isBind(i) && SoulbindKeywords.some(key => isPhraseInString(GetItemNameAndDescriptionConcat(i) ?? "", key)));

            ServerAppearanceLoadFromBundle(ghostChar, "Female3DCG", ghostConfig?.a ?? {}, undefined);
            for (const binding of soulBindings) {
                ApplyItem(BC_ItemToItemBundle(binding), undefined, true, true, ghostChar);
            }
            ghostChar.PoseMapping = ghostConfig?.p ?? C.PoseMapping;
            ghostChar.ActivePoseMapping = ghostChar.PoseMapping;

            ghostChar.ArousalSettings = C.ArousalSettings;
            return ghostChar;
        }
    }

    GetCorporealCharacter(C: OtherCharacter | PlayerCharacter): Character {
        let activeStateConfig = C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
        if (!activeStateConfig || !activeStateConfig.active) {
            return C;
        } else {
            let corporealChar = CopyCharacter(C, `LSCGAstralProjectionCorporeal-${C.ID}`, false, false);
            CharacterSetFacialExpression(corporealChar, "Eyes", "Closed");
            corporealChar.PoseMapping = C.PoseMapping;
            corporealChar.ActivePoseMapping = C.ActivePoseMapping;
            corporealChar.ArousalSettings = C.ArousalSettings;
            return corporealChar;
        }
    }

    Init(): void {
        hookFunction("CommonDrawResolveLayerExpression", 1, (args, next) => {
            let C = args[0] as Character;
            let item = args[1] as Item;
            if (!!C && item.Asset.Group.Name == "Mouth") {
                if (this.IsSoulBindGag(C, item))
                    return "Moan";
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("CommonCallFunctionByName", 1, (args, next) => {
            let funcName = args[0];
            let params = args[1];
            if (!params) {
                return next(args);
            }

            let C = params['C'] as OtherCharacter;
            let CA = params['CA'] as Item;
            let regex = /Assets(.+)BeforeDraw/i;
            if (regex.test(funcName)) {
                let ret = next(args) ?? {};
                if (IsSoulBind(CA)) {
                    let layerName = (params['L'] as string ?? "")?.trim() ?? "";
                    let layerIx = CA.Asset.Layer.findIndex(l => l.Name == layerName);
                    let originalLayerOpacity = (Array.isArray(CA?.Property?.Opacity) ? CA?.Property?.Opacity[layerIx] : CA.Property?.Opacity) ?? CA.Asset.Opacity;
                    let curOpacity = ret.Opacity ?? originalLayerOpacity ?? 1;
                    ret.Opacity = curOpacity * .4;
                    ret.AlphaMasks = [];
                }
                return ret;
            } else
                return next(args);
        }, ModuleCategory.States)

        hookFunction("CharacterLoadCanvas", 1, (args, next) => {
            const C = args[0] as OtherCharacter;

            let activeStateConfig = C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
            if (!activeStateConfig || !activeStateConfig.active) {                
                return next(args);
            } else {
                //var inDialog = !!CurrentCharacter || CurrentScreen != "ChatRoom";
                //var isPlayerDialog = CurrentCharacter?.IsPlayer();

                CommonDrawCanvasPrepare(C);
                const origYOffset = CharacterAppearanceYOffset(C, C.HeightRatio)
                const origCanvases = [C.Canvas, C.CanvasBlink];

                let ghostCanvases = [document.createElement("canvas"), document.createElement("canvas")];
                ghostCanvases.forEach((ghostCanvas, index) => {
                    var oldCanvas = origCanvases[index];
                    const ctx = ghostCanvas.getContext("2d")!;
                    ghostCanvas.width = oldCanvas?.width || CanvasDrawWidth;
                    ghostCanvas.height = oldCanvas?.height || CanvasDrawHeight;
                    ctx!.globalAlpha = 0.5;
                    ctx.shadowColor = this.GetProjectionTintColor(C);
                    ctx.shadowBlur = 50;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                });

                let corporealCanvases = [document.createElement("canvas"), document.createElement("canvas")];
                corporealCanvases.forEach((canvas, index) => {
                    var oldCanvas = origCanvases[index];
                    const ctx = canvas.getContext("2d");
                    canvas.width = oldCanvas?.width || CanvasDrawWidth;
                    canvas.height = oldCanvas?.height || CanvasDrawHeight;
                });

                let ghostChar = this.GetGhostCharacter(C);
                ghostChar.Canvas = ghostCanvases[0];
                ghostChar.CanvasBlink = ghostCanvases[1];

                let corporealChar = this.GetCorporealCharacter(C);
                corporealChar.Canvas = corporealCanvases[0];
                corporealChar.CanvasBlink = corporealCanvases[1];

                let hideGhostChar = this.hideGhost;
                let hideCorpChar = !CurrentCharacter && (CurrentScreen == "ChatRoom") && (this.hideCorporeal || C.LSCG.MagicModule.hideCorporeal);

                if (!hideGhostChar) {
                    next([ghostChar]);

                    ghostCanvases.forEach((canvas, index) => {
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.shadowBlur = 0;
                            ctx.globalAlpha = 0.3;
                            // Apply ghostly tint
                            ctx.globalCompositeOperation = 'source-atop';
                            ctx.fillStyle = this.GetProjectionTintColor(C);
                            ctx.fillRect(0, 0, canvas?.width || CanvasDrawWidth, canvas?.height || CanvasDrawHeight);
                            // Fade out bottom half
                            ctx.globalCompositeOperation = 'destination-in';
                            ctx.globalAlpha = 1;
                            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                            gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)'); 
                            gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.globalCompositeOperation = 'source-over';
                        }
                    });

                    CharacterAppearanceSetHeightModifiers(ghostChar);
                    const ghostYOffset = CharacterAppearanceYOffset(ghostChar, ghostChar.HeightRatio) - origYOffset;
                    origCanvases.forEach((origCanvas, index) => {
                        let ctx = origCanvas?.getContext("2d");
                        if (!!ctx) {
                            ctx.drawImage(ghostCanvases[index], hideCorpChar ? 0 : 80, (hideCorpChar ? 0 : -80) + ghostYOffset);
                        }
                    });
                }

                if (!hideCorpChar) {
                    next([corporealChar]);

                    CharacterAppearanceSetHeightModifiers(corporealChar);
                    const corpYOffset = CharacterAppearanceYOffset(corporealChar, corporealChar.HeightRatio) - origYOffset;
                    origCanvases.forEach((origCanvas, index) => {
                        let ctx = origCanvas?.getContext("2d");
                        if (!!ctx) {
                            ctx.drawImage(corporealCanvases[index], 0, corpYOffset);
                        }
                    });
                }

                C.Canvas = origCanvases[0];
                C.CanvasBlink = origCanvases[1];

                CharacterDelete(ghostChar);
                CharacterDelete(corporealChar);
            }
        }, ModuleCategory.States);

        
        hookFunction("DialogLoad", 1, (args, next) => {
            if (!CurrentCharacter) return next(args);
            let activeStateConfig = (CurrentCharacter as OtherCharacter)?.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
            if (activeStateConfig?.active ?? false) {
                CharacterLoadCanvas(CurrentCharacter);
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("DialogLeave", 1, (args, next) => {
            if (!CurrentCharacter) return next(args);
            let activeStateConfig = (CurrentCharacter as OtherCharacter)?.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
            if (activeStateConfig?.active ?? false) {
                CharacterLoadCanvas(CurrentCharacter);
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("PoseSetActive", 1, (args, next) => {
            const C = args[0] as OtherCharacter;

            // If we're setting our own pose, cache the current pose, perform function, steal new pose for ghost, and reset self pose. 
            let activeStateConfig = C?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (C.IsPlayer() && activeStateConfig?.active) {
                let ghostChar = this.GetGhostCharacter(C);
                args[0] = ghostChar;
                next(args);
                activeStateConfig.extensions["ghost"].p = ghostChar.PoseMapping;
                CharacterDelete(ghostChar);
                CharacterRefresh(C, false);
                settingsSave(true);
            } else {
                next(args);
            }
        }, ModuleCategory.States);

        hookFunction("Player.IsKneeling", 1, (args, next) => {
            let activeStateConfig = Player?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active) {
                let pose = this.GetGhostConfig(Player)?.p ?? Player.PoseMapping;
                return CommonIncludes(PoseAllKneeling, pose.BodyLower);
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.IsStanding", 1, (args, next) => {
            let activeStateConfig = Player?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active) {
                let pose = this.GetGhostConfig(Player)?.p ?? Player.PoseMapping;
                return CommonIncludes(PoseAllStanding, pose.BodyLower);
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("DialogSelfMenuMapping.Pose._ClickButton", 1, (args, next) => {
            let [button, C, pose] = args;
            let activeStateConfig = Player?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active && C?.IsPlayer()) {
                let ghostChar = this.GetGhostCharacter(C);
                if (ghostChar.PoseMapping[(<Pose>pose).Category] === pose.Name) {
                    return;
                }
                PoseSetActive(C, pose.Name, undefined, false);
                if (CurrentScreen === "ChatRoom") {
                    ServerSend("ChatRoomCharacterPoseUpdate", { Pose: C.ActivePose });
                }
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("PoseAvailable", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            if (!C.IsPlayer()) return next(args);

            let activeStateConfig = C?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active) {
                let ghostChar = this.GetGhostCharacter(C);
                PoseRefresh(ghostChar);

                let prevAllowed = C.AllowedActivePoseMapping;
                C.AllowedActivePoseMapping = ghostChar.AllowedActivePoseMapping;
                const result = next(args);
                C.AllowedActivePoseMapping = prevAllowed;
                CharacterDelete(ghostChar);
                return result;
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("PoseCanChangeUnaidedStatus", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            if (!C.IsPlayer()) return next(args);

            let activeStateConfig = C?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active) {
                return PoseChangeStatus.ALWAYS;
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("ActivityAllowedForGroup", 1, (args, next) => {
            if (this.Active) {
                let C = args[0];
                var temp = Player;
                let ghostChar = this.GetGhostCharacter(Player) as PlayerCharacter;
                let corpChar = this.GetCorporealCharacter(C) as PlayerCharacter;
                Player = ghostChar
                if (C.IsPlayer()) {
                    args[0] = corpChar;
                }

                const ret = next(args);
                
                CharacterDelete(ghostChar);
                CharacterDelete(corpChar);
                Player = temp;
                args[0] = C;
                return ret;
            } else {
                return next(args);
            }
        }, ModuleCategory.States);

        hookFunction("CommonSetScreen", 1, (args, next) => {
            if (this.Active) {
                CharacterLoadCanvas(Player);
            }
            return next(args);
        }, ModuleCategory.States);

        hookFunction("ActivityBuildChatTag", 1, (args, next) => {
            let C = args[0] as OtherCharacter;
            if (this.Active && C.IsPlayer()) {
                args[0] = this.GetCorporealCharacter(C) as PlayerCharacter;
                const result = next(args);
                args[0] = C;
                return result;
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("SpeechTransformProcess", 1, (args, next) => {
            let C = args[0];
            if (this.Active && C.IsPlayer()) {
                args[2] = [];
                return next(args);
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.GetDeafLevel', 1, (args, next) => {
            if (this.Active)
                return 0;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('Player.GetBlindLevel', 1, (args, next) => {
            if (this.Active)
                return 0;
            return next(args);
        }, ModuleCategory.States);

        hookFunction('ChatRoomMessageDisplay', 1, (args, next) => {
            let data = args[0];
            let msg = args[1];
            let C = args[2] as OtherCharacter;
            let activeStateConfig = C?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (!!activeStateConfig && activeStateConfig.active && (data.Type == "Chat" || data.Type == "Whisper")) {
                let div = next(args) as HTMLDivElement;
                let chatSpan = div?.getElementsByClassName("chat-room-message-content")[0] as HTMLSpanElement;
                let fxType = Player.LSCG?.MagicModule.spiritTextFormat ?? "Float";
                if (!!chatSpan && fxType != "None") {
                    let tint = this.GetProjectionTintColor(C);
                    chatSpan.classList.add("lscg-ghost-text");
                    chatSpan.style.textShadow = `0 0 10px ${tint}`;
                    if (Player.LSCG?.MagicModule.spiritTextFormat == "Float") {
                        this._splitSpanCharacters(chatSpan);
                    }
                    else {
                        this._wrapOOCContent(chatSpan);
                    }
                }
                return div;
            } else {
                return next(args);
            }
        }, ModuleCategory.States);
    }

    async _splitSpanCharacters(ele: HTMLElement) {
        if (!ele.textContent) return;

        // 1. Instantly hide the container to prevent the "pop"
        const originalText = ele.textContent;
        //ele.style.visibility = "hidden"; 
        ele.textContent = "";

        const regex = /(\([^)]+\))|(.)/g;
        const matches = [...originalText.matchAll(regex)];
        const animationPromises: Promise<void>[] = [];

        let spans: HTMLSpanElement[] = [];
        matches.forEach((match, index) => {
            const [fullMatch, parenthesized, singleChar] = match;
            const span = document.createElement("span");
            
            if (parenthesized) {
                span.classList.add("ooc-text");
                span.textContent = parenthesized;
            } else {
                span.style.display = "inline-block"; // Helps with transforms/blur
                span.style.opacity = "0";
                span.textContent = singleChar === " " ? "\u00A0" : singleChar;
                const delay = index * 0.05;
                // 'forwards' ensures it stays visible at 100% opacity
                span.style.animation = `ghostlyFadeIn 0.8s ease forwards ${delay}s`;
            }

            spans.push(span);
            
            const promise = new Promise<void>((resolve) => {
                span.addEventListener("animationend", () => resolve(), { once: true });
            });
            animationPromises.push(promise);
        });

        ele.append(...spans);
        // 3. Reveal the container now that it's full of invisible spans
        //ele.style.visibility = "visible";

        await Promise.all(animationPromises);

        // 4. Clean up
        ele.textContent = originalText;
        this._wrapOOCContent(ele);
    }

    _wrapOOCContent(ele: HTMLElement) {
        if (!ele.textContent) return;

        const text = ele.textContent;
        ele.textContent = "";

        // Regex: Finds everything inside (parentheses)
        // Matches the parens and the text inside them
        const regex = /(\([^)]+\))/g;
        
        // Split the text by the regex to get an array of OOC parts and normal parts
        const parts = text.split(regex);

        parts.forEach(part => {
            if (part.startsWith('(') && part.endsWith(')')) {
                // This is OOC text
                const oocSpan = document.createElement("span");
                oocSpan.className = "ooc-text";
                oocSpan.textContent = part;
                ele.appendChild(oocSpan);
            } else if (part.length > 0) {
                // This is normal text (we wrap it in a plain text node or span)
                const textNode = document.createTextNode(part);
                ele.appendChild(textNode);
            }
        });
    }

    Activate(memberNumber?: number | undefined, duration?: number | undefined, emote?: boolean | undefined): BaseState | undefined {
        const dummyChar = CopyCharacter(Player, `LSCGAstralProjectionDummy-${Player.ID}`, false, true);
        const baseUpperAllowed = PoseCanChangeUnaidedStatus(dummyChar, "BaseUpper") != PoseChangeStatus.NEVER 
        const baseLowerAllowed = PoseCanChangeUnaidedStatus(dummyChar, "BaseLower") != PoseChangeStatus.NEVER;
        let ghostPose = {
            BodyUpper: baseUpperAllowed ? "BaseUpper" : dummyChar.PoseMapping.BodyUpper,
            BodyLower: baseLowerAllowed ? "BaseLower" : dummyChar.PoseMapping.BodyLower,
        };

        let spiritFormKey = Player.LSCG.MagicModule.spiritFormOutfitKey;
        let spiritForm = !!spiritFormKey ? GetConfiguredItemBundlesFromOutfitKey(Player.LSCG.MagicModule.spiritFormOutfitKey, item => true) : null;
        if (!!spiritForm) {
            CharacterNaked(dummyChar);
            ServerAppearanceLoadFromBundle(dummyChar, "Female3DCG", spiritForm, undefined);
        }
        
        let ghostBundle = ServerAppearanceBundle(dummyChar.Appearance);

        this.SetGhostConfig(Player, { a: spiritForm || ghostBundle, p: ghostPose });
        CharacterDelete(dummyChar);
        
        PoseSetActive(Player, "Kneel");
        if (CurrentScreen === "ChatRoom") {
			ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
		}

        let ret = super.Activate(memberNumber, duration, emote);

        ChatRoomCharacter.forEach(C => {
            CharacterLoadCanvas(C);
        });
        return ret;
    }

    Recover(emote?: boolean | undefined): BaseState | undefined {
        let ret = super.Recover(emote);

        delete this.config.extensions["ghost"];

        ChatRoomCharacter.forEach(C => {
            CharacterLoadCanvas(C);
        });
        return ret;
    }

    RoomSync(): void {
        if (this.Active) {
            if (Player.CanKneel) {
                if (Player.CanKneel()) {
                    Player.PoseMapping.BodyLower = "Kneel";
                    Player.ActivePoseMapping.BodyLower = "Kneel";
                    if (CurrentScreen === "ChatRoom") {
                        ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
                    }
                }
            }
        }
    }

    SpeechBlock(): void {}

    IsSoulBindGag(C: Character, mouthItem: Item | undefined) {
        if (!mouthItem) return false;

        let gags = [
            InventoryGet(C, "ItemMouth"),
            InventoryGet(C, "ItemMouth2"),
            InventoryGet(C, "ItemMouth3")
        ];
        return (!!gags && gags.length > 0 && gags.some(gag => !!gag && IsSoulBind(gag)));
    }
}