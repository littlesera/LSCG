import { StateConfig } from "Settings/Models/states";
import { BaseMigrator } from "./BaseMigrator";

export class StateMigrator extends BaseMigrator {
    get Version(): string {
        return "0.3.0";
    }
    Migrate(fromVersion: string): boolean {
        // Migration to StatesModule
        console.info("Migrating LSCG Data for new States Module.");
        let anyImmersive = (Player.LSCG?.HypnoModule as any).immersive || (Player.LSCG?.InjectorModule as any).immersive || (Player.LSCG?.MiscModule as any).immersiveChloroform;
        Player.LSCG.StateModule.immersive = anyImmersive;

        // Migrate Hypnosis State
        if (!!(Player.LSCG.HypnoModule as any).existingEye1Color) {
            let hypnoState = Player.LSCG.StateModule.states.find(s => s.type == "hypnotized");
            if (!hypnoState) {
                hypnoState = <StateConfig>{
                    type: "hypnotized",
                    active: (Player.LSCG.HypnoModule as any).hypnotized,
                    activatedBy: (Player.LSCG.HypnoModule as any).hypnotizedBy,
                    activatedAt: (Player.LSCG.HypnoModule as any).activatedAt,
                    recoveredAt: (Player.LSCG.HypnoModule as any).recoveredAt,
                    activationCount: Player.LSCG.HypnoModule.stats.hypnotizedCount,
                    extensions: {}
                }
                Player.LSCG.StateModule.states.push(hypnoState);
            }
            hypnoState.extensions["existingEye1Color"] = (Player.LSCG.HypnoModule as any).existingEye1Color;
            hypnoState.extensions["existingEye1Name"] = (Player.LSCG.HypnoModule as any).existingEye1Name;
            hypnoState.extensions["existingEye2Color"] = (Player.LSCG.HypnoModule as any).existingEye2Color;
            hypnoState.extensions["existingEye2Name"] = (Player.LSCG.HypnoModule as any).existingEye2Name;
            hypnoState.extensions["existingEyeExpression"] = (Player.LSCG.HypnoModule as any).existingEyeExpression;
        }
        delete (Player.LSCG.HypnoModule as any).existingEye1Color;
        delete (Player.LSCG.HypnoModule as any).existingEye1Name;
        delete (Player.LSCG.HypnoModule as any).existingEye2Color;
        delete (Player.LSCG.HypnoModule as any).existingEye2Name;
        delete (Player.LSCG.HypnoModule as any).existingEyeExpression;
        delete (Player.LSCG.HypnoModule as any).hypnotized;
        delete (Player.LSCG.HypnoModule as any).hypnotizedBy;
        delete (Player.LSCG.HypnoModule as any).activatedAt;
        delete (Player.LSCG.HypnoModule as any).recoveredAt;
        delete (Player.LSCG.HypnoModule as any).immersive;

        // Migrate Sleep State
        delete (Player.LSCG.InjectorModule as any).immersive;
        delete (Player.LSCG.InjectorModule as any).brainwashed;
        delete (Player.LSCG.InjectorModule as any).asleep;

        // Migrate immersive bools
        delete (Player.LSCG?.MiscModule as any).immersiveChloroform;

        return true;
    }
}