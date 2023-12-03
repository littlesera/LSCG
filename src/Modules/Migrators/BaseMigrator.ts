export abstract class BaseMigrator {
    abstract get Version(): string;
    abstract Migrate(fromVersion: string): boolean;
}