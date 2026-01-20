import { CopyCharacter, GetItemNameAndDescriptionConcat, hookFunction, isCloth, isPhraseInString, settingsSave } from "utils";
import { BaseState } from "./BaseState";
import { StateModule } from "Modules/states";
import { ModuleCategory } from "Settings/setting_definitions";

export class AstralProjectionState extends BaseState {
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

    GetGhostCharacter(C: OtherCharacter | PlayerCharacter): Character {
        let activeStateConfig = C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
        if (!activeStateConfig || !activeStateConfig.active) {
            return C;
        } else {
            let ghostChar = CopyCharacter(C, `LSCGAstralProjection-${C.ID}`, false, true);
            ghostChar.PoseMapping = activeStateConfig.extensions["ghost"] ?? C.PoseMapping;
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
            return corporealChar;
        }
    }

    Init(): void {
        hookFunction("CharacterLoadCanvas", 1, (args, next) => {
            const C = args[0] as OtherCharacter;
            
            let activeStateConfig = C.LSCG?.StateModule.states.find(state => state.type === "astral-projection")
            if (!activeStateConfig || !activeStateConfig.active) {
                return next(args);
            } else {
                var inDialog = !!CurrentCharacter || CurrentScreen != "ChatRoom";
                var isPlayerDialog = CurrentCharacter?.IsPlayer();

                CommonDrawCanvasPrepare(C);
                const origYOffset = CharacterAppearanceYOffset(C, C.HeightRatio)
                const origCanvases = [C.Canvas, C.CanvasBlink];

                let ghostCanvases = [document.createElement("canvas"), document.createElement("canvas")];
                ghostCanvases.forEach((ghostCanvas, index) => {
                    var oldCanvas = origCanvases[index];
                    const ctx = ghostCanvas.getContext("2d");
                    ghostCanvas.width = oldCanvas?.width || CanvasDrawWidth;
                    ghostCanvas.height = oldCanvas?.height || CanvasDrawHeight;
                    ctx!.globalAlpha = isPlayerDialog ? 1 : 0.5;
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

                if (!inDialog || isPlayerDialog) {
                    next([ghostChar]);

                    ghostCanvases.forEach((canvas, index) => {
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx!.globalAlpha = 0.5;
                            // Apply ghostly tint
                            ctx.globalCompositeOperation = 'source-atop';
                            ctx.fillStyle = Player.LSCG.MagicModule.projectionTintColor ?? '#00ced1'; // Darker Teal
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
                            ctx.drawImage(ghostCanvases[index], inDialog ? 0 : 80, (inDialog ? 0 : -80) + ghostYOffset);
                        }
                    });
                }

                if (!inDialog || !isPlayerDialog) {
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
                activeStateConfig.extensions["ghost"] = ghostChar.PoseMapping;
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
                let pose = activeStateConfig.extensions["ghost"] ?? Player.PoseMapping;
                return CommonIncludes(PoseAllKneeling, pose.BodyLower);
            } else return next(args);
        }, ModuleCategory.States);

        hookFunction("Player.IsStanding", 1, (args, next) => {
            let activeStateConfig = Player?.LSCG?.StateModule.states.find(state => state.type === "astral-projection");
            if (activeStateConfig?.active) {
                let pose = activeStateConfig.extensions["ghost"] ?? Player.PoseMapping;
                return CommonIncludes(PoseAllStanding, pose.BodyLower);
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
                var temp = Player
                Player = this.GetGhostCharacter(Player) as PlayerCharacter;
                const ret = next(args);
                Player = temp;
                return ret;
            } else {
                return next(args);
            }
        }, ModuleCategory.States);
    }

    Activate(memberNumber?: number | undefined, duration?: number | undefined, emote?: boolean | undefined): BaseState | undefined {
        const dummyChar = CopyCharacter(Player, `LSCGAstralProjectionDummy-${Player.ID}`, false, true);
        const baseUpperAllowed = PoseCanChangeUnaidedStatus(dummyChar, "BaseUpper") != PoseChangeStatus.NEVER 
        const baseLowerAllowed = PoseCanChangeUnaidedStatus(dummyChar, "BaseLower") != PoseChangeStatus.NEVER;
        this.config.extensions["ghost"] = {
            BodyUpper: baseUpperAllowed ? "BaseUpper" : dummyChar.PoseMapping.BodyUpper,
            BodyLower: baseLowerAllowed ? "BaseLower" : dummyChar.PoseMapping.BodyLower,
        };
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

    RoomSync(): void {}

    SpeechBlock(): void {}
}