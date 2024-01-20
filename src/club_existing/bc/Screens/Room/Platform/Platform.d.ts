/**
 * Loads a room and it's parameters
 * @param {String} CharacterName - The character name to load
 * @param {String} StatusName - The status of that character
 * @param {Number} X - The X position of the character
 * @param {Boolean} Fix - TRUE if the character won't move
 * @param {Boolean} Combat - TRUE if the character will deal and receive combat damage
 * @param {String} Dialog - The dialog name to open when talking to that character
 * @param {Boolean} FaceLeft  - TRUE if the character should be facing left
 * @param {Number} ReplaceAtPos  - The position in the index to replace the char, if NULL we add it
 * @returns {Object} - Returns the platform character
 */
declare function PlatformCreateCharacter(CharacterName: string, StatusName: string, X: number, Fix?: boolean, Combat?: boolean, Dialog?: string, FaceLeft?: boolean, ReplaceAtPos?: number): any;
/**
 * Returns TRUE if a specific event is already done
 * @param {String} Event - The name of the event
 * @returns {Boolean} - TRUE if done
 */
declare function PlatformEventDone(Event: string): boolean;
/**
 * Adds an event to the list of events done
 * @param {String} Event - The name of the event
 * @returns {void} - Nothing
 */
declare function PlatformEventSet(Event: string): void;
/**
 * Sets the on screen message for 4 seconds
 * @param {String} Text - The text to show
 * @returns {void} - Nothing
 */
declare function PlatformMessageSet(Text: string): void;
/**
 * Loads a room and it's parameters
 * @param {Object} RoomName - The name of the room to load, can be null to reload the current room
 * @returns {void} - Nothing
 */
declare function PlatformLoadRoom(RoomName: any): void;
/**
 * Adds a character to the party
 * @param {Object} C - The character to add to the roster
 * @returns {void} - Nothing
 */
declare function PlatformPartyAdd(C: any): void;
/**
 * Saves the current character stats in the party object
 * @returns {void} - Nothing
 */
declare function PlatformPartySave(): void;
/**
 * Loads the current character stats from the party object
 * @returns {void} - Nothing
 */
declare function PlatformPartyLoad(): void;
/**
 * Activates the next party character
 * @returns {void} - Nothing
 */
declare function PlatformPartyNext(): void;
/**
 * Activates a specific character by name
 * @param {String} CharacterName - The character name to activate
 * @returns {void} - Nothing
 */
declare function PlatformPartyActivate(CharacterName: string): void;
/**
 * Builds the party to switch active characters
 * @returns {void} - Nothing
 */
declare function PlatformPartyBuild(): void;
/**
 * Loads the screen, adds listeners for keys
 * @returns {void} - Nothing
 */
declare function PlatformLoad(): void;
/**
 * Get the proper animation from the cycle to draw
 * @param {Object} C - The character to evaluate
 * @param {String} Pose - The pose we want
 * @param {Boolean} Cycle - TRUE if we must use the animation cycle
 * @returns {Object} - An object with the image, width & height to draw
 */
declare function PlatformGetAnim(C: any, Pose: string, Cycle?: boolean): any;
/**
 * Returns TRUE if the current action for a character is ActionName
 * @param {Object} C - The character to validate
 * @param {String} ActionName - The action to validate (all actions are valid if "Any"
 * @returns {boolean} - TRUE if the character action is that string
 */
declare function PlatformActionIs(C: any, ActionName: string): boolean;
/**
 * Focuses the background camera and draws it
 * @returns {void} - Nothing
 */
declare function PlatformDrawBackground(): void;
/**
 * Draw a specific character on the screen if needed
 * @param {Object} C - The character to draw
 * @param {Number} Time - The current time when the action is done
 * @returns {void} - Nothing
 */
declare function PlatformDrawCharacter(C: any, Time: number): void;
/**
 * Sets the max health and current health for the character based on the level and skill
 * @param {Object} C - The character to evaluate
 * @returns {void} - Nothing
 */
declare function PlatformSetHealth(C: any): void;
/**
 * Adds experience points to the player, can also gain a level which heals fully
 * @param {Object} C - The character that will gain experience
 * @param {Number} Value - The exp value to add
 * @returns {void} - Nothing
 */
declare function PlatformAddExperience(C: any, Value: number): void;
/**
 * Some perks allow the player to steal items from bound enemies
 * @param {Object} C - The character that will gain experience
 * @param {Number} Value - The experience value to factor the quantity
 * @returns {void} - Nothing
 */
declare function PlatformSteal(C: any, Value: number): void;
/**
 * Gives a random inventory to the player
 * @param {Object} Target - The target that gives the inventory
 * @returns {void} - Nothing
 */
declare function PlatformAddRandomInventory(Target: any): void;
/**
 * Random odds of finding inventory on a defeated enemy
 * @param {Object} Source - The victorious character
 * @param {Object} Target - The defeated character
 * @returns {void} - Nothing
 */
declare function PlatformFindInventory(Source: any, Target: any): void;
/**
 * Creates a treasure chest in the current room, tries not to put the chest over the enemy
 * @returns {void} - TRUE if active
 */
declare function PlatformCreateTreasure(): void;
/**
 * Applies damage on a target, can become wounded at 0 health
 * @param {Object} Source - The character doing the damage
 * @param {Object} Target - The character getting the damage
 * @param {Number} Damage - The number of damage to apply
 * @param {Number} Time - The current time when the action is done
 * @param {String} Type - The damage type (Collsion or Action)
 * @param {String} AttackName - The name of the attack that was done
 * @returns {void} - Nothing
 */
declare function PlatformDamage(Source: any, Target: any, Damage: number, Time: number, Type: string, AttackName?: string): void;
/**
 * Checks if the hitbox of an attack clashes with a hitbox of the target
 * @param {Object} Source - The character doing the damage
 * @param {Object} Target - The character getting the damage
 * @param {Array} HitBox - The hitbox of the attack
 * @returns {boolean} - TRUE if there's a clash
 */
declare function PlatformHitBoxClash(Source: any, Target: any, HitBox: any[]): boolean;
/**
 * Plays a sound effect if needed
 * @param {String} Category - The sound effect category
 * @param {Object} Sound - The sound or array of sound to play
 * @param {Number} Factor - The volume factor to apply
 * @returns {void} - Nothing
 */
declare function PlatformSoundEffect(Category: string, Sound: any, Factor?: number): void;
/**
 * Checks if the character action can attack someone else
 * @param {Object} Source - The character doing the action
 * @param {Number} Time - The current time when the action is done
 * @returns {void} - Nothing
 */
declare function PlatformProcessAction(Source: any, Time: number): void;
/**
 * Calculates the X force to apply based on the time it took until the last frame and the speed of the object
 * @param {Number} Speed - The speed of the object
 * @param {Number} Frame - The number of milliseconds since the last frame
 * @returns {Number} - The force to apply
 */
declare function PlatformWalkFrame(Speed: number, Frame: number): number;
/**
 * Does collision damage for a character
 * @param {Object} Target - The character that will be damaged
 * @param {Number} Time - The current time when the action is done
 * @returns {void} - Nothing
 */
declare function PlatformCollisionDamage(Target: any, Time: number): void;
/**
 * Checks if an opponent can bind the player
 * @param {Object} Source - The opponent that can bind
 * @param {Number} Time - The current time when the action is done
 * @returns {void} - Nothing
 */
declare function PlatformBindPlayer(Source: any, Time: number): void;
/**
 * Returns TRUE if the player input is valid for a move
 * @param {Object} Move - The movement type (Crouch, jump, left, right, etc.)
 * @returns {boolean}
 */
declare function PlatformMoveActive(Move: any): boolean;
/**
 * Returns TRUE if an animation is available for the character
 * @param {Object} C - The character to evaluate
 * @param {String} AnimationName - The animation name to search
 * @returns {boolean} - TRUE if it's available
 */
declare function PlatformAnimAvailable(C: any, AnimationName: string): boolean;
/**
 * Creates a projectile that will disappear when it hits the floor or a wall
 * @param {String} Name - The name of the projectile (Arrow, Bullet, etc.)
 * @param {String} Type - The type of the projectile (Wood, Iron, etc.)
 * @param {Boolean} FaceLeft - IF the projectile is facing the left direction
 * @param {Number} X - The X position
 * @param {Number} Y - The Y position
 * @param {Number} Force - The speed of the projectile
 * @param {Number} Gravity - The Y axis gravity pulling that projectile down (default to 0.25)
 * @param {Number} Damage - The damage done by the projectile
 * @param {any} HitAudio - The damage done by the projectile
 * @returns {void} - Nothing
 */
declare function PlatformCreateProjectile(Name: string, Type: string, FaceLeft: boolean, X: number, Y: number, Force: number, Gravity: number, Damage: number, HitAudio: any): void;
/**
 * Calculates the projectiles
 * @param {Number} Time - The current time stamp of the frame
 * @returns {void} - Nothing
 */
declare function PlatformProcessProjectile(Time: number): void;
/**
 * Consume a projectile from the character and creates it on screen
 * @param {Object} C - The character that generates the projectile
 * @param {Boolean} LongShot - TRUE if it's a long shot
 * @returns {void} - Nothing
 */
declare function PlatformProjectile(C: any, LongShot: boolean): void;
/**
 * Draw scenery + all characters, apply X and Y forces
 * @returns {void} - Nothing
 */
declare function PlatformDraw(): void;
/**
 * Draws all the buttons on the right side of the screen for extra lovers/Ds interactions
 * @returns {void} - Nothing
 */
declare function PlatformDrawRightButtons(): void;
/**
 * Plays the dialog ambient music
 * @param {string} Music - The URL of the music to play
 * @returns {void} - Nothing
 */
declare function PlatformBackgroundMusic(Music: string): void;
/**
 * Draws the possible gifts on the top of the screen, exit gift mode if too far from target
 * @returns {void} - Nothing
 */
declare function PlatformDrawGiftButtons(): void;
/**
 * Runs and draws the screen
 * @returns {void} - Nothing
 */
declare function PlatformRun(): void;
/**
 * Starts an attack by the source
 * @param {Object} Source - The character doing the action
 * @param {String} Type - The action type (Punch, Kick, Sweep, etc.)
 * @returns {void} - Nothing
 */
declare function PlatformAttack(Source: any, Type: string): void;
/**
 * Toggles the audio on or off
 * @returns {void} - Nothing
 */
declare function PlatformAudioToggle(): void;
/**
 * Gives an item to the currrent NPC
 * @param {string} ItemName -
 * @returns {void} - Nothing
 */
declare function PlatformGiveItem(ItemName: string): void;
/**
 * Handles clicks in the screen
 * @returns {void} - Nothing
 */
declare function PlatformClick(): void;
/**
 * When the screens exits, we unload the listeners
 * @returns {void} - Nothing
 */
declare function PlatformLeave(): void;
/**
 * Enters a new room if the entry conditions are met
 * @param {String} FromType - The type of room enter (Up, Left, Right)
 * @returns {void} - Nothing
 */
declare function PlatformEnterRoom(FromType: string): void;
/**
 * Checks if there's a target character to bind and starts the binding process
 * @param {Object} Source - The source character that does the binding
 * @returns {void} - Nothing
 */
declare function PlatformBindStart(Source: any): void;
/**
 * Saves the game on a specific slot
 * @param {Number} Slot - The slot to use (from 0 to 9)
 * @returns {void} - Nothing
 */
declare function PlatformSaveGame(Slot: number): void;
/**
 * Adds an item to the player inventory
 * @param {string} InventoryName - The item name to add
 * @param {number} QuantityToAdd - The quantity to add (1 if null)
 * @returns {void} - Nothing
 */
declare function PlatformInventoryAdd(InventoryName: string, QuantityToAdd?: number): void;
/**
 * Removes an item from the player inventory
 * @param {string} InventoryName - The item name to add
 * @param {number} QuantityToRemove - The quantity to add (1 if null)
 * @returns {void} - Nothing
 */
declare function PlatformInventoryRemove(InventoryName: string, QuantityToRemove?: number): void;
/**
 * Loads the game on a specific slot
 * @param {Number} Slot - The slot to use (from 0 to 9)
 * @returns {void} - Nothing
 */
declare function PlatformLoadGame(Slot: number): void;
/**
 * Teleports a character forward
 * @param {Object} C - The character to teleport
 * @returns {void} - Nothing
 */
declare function PlatformCastTeleport(C: any): void;
/**
 * Heals the character for 20% of it's max HP
 * @param {Object} C - The character to teleport
 * @returns {void} - Nothing
 */
declare function PlatformCastHeal(C: any): void;
/**
 * Handles keys pressed
 * @param {Object} e - The key pressed
 * @returns {void} - Nothing
 */
declare function PlatformEventKeyDown(e: any): void;
/**
 * Handles keys released
 * @param {Object} e - The key released
 * @returns {void} - Nothing
 */
declare function PlatformEventKeyUp(e: any): void;
/**
 * Handles the controller inputs
 * @param {Object} Buttons - The buttons pressed on the controller
 * @returns {boolean} - Always TRUE to indicate that the controller is handled
 */
declare function PlatformController(Buttons: any): boolean;
/**
 * Handles the touched regions for mobile play
 * @returns {void}
 */
declare function PlatformTouch(): void;
/**
 * Returns TRUE if a specific perk is allocated for that character
 * @param {Object} C - The platform character to evaluate
 * @param {Object} Perk - The perk name to validate
 * @returns {boolean} - TRUE if the perk is paid
 */
declare function PlatformHasPerk(C: any, Perk: any): boolean;
/**
 * Returns TRUE if a specific cooldown is currently active
 * @param {String} Name - The name of the cooldown to validate
 * @returns {boolean} - TRUE if active
 */
declare function PlatformCooldownActive(Name: string): boolean;
declare var PlatformChar: any[];
declare var PlatformFocusCharacter: any;
declare var PlatformPlayer: any;
declare var PlatformLastTime: any;
declare var PlatformKeys: any[];
declare var PlatformFloor: number;
declare var PlatformViewX: number;
declare var PlatformViewY: number;
declare var PlatformRoom: any;
declare var PlatformMusic: any;
declare var PlatformAllowAudio: boolean;
declare var PlatformGravitySpeed: number;
declare var PlatformLastKeyCode: number;
declare var PlatformLastKeyTime: number;
declare var PlatformExperienceForLevel: number[];
declare var PlatformShowHitBox: boolean;
declare var PlatformMessage: any;
declare var PlatformHeal: any;
declare var PlatformEvent: any[];
declare var PlatformDrawUpArrow: any[];
declare var PlatformButtons: any;
declare var PlatformRunDirection: string;
declare var PlatformRunTime: number;
/** @type {null | TouchList} */
declare var PlatformLastTouch: null | TouchList;
declare var PlatformImmunityTime: number;
declare var PlatformSaveMode: boolean;
declare var PlatformGiftMode: boolean;
declare var PlatformJumpPhase: string;
declare var PlatformParty: any[];
declare var PlatformRegen: number;
declare var PlatformCooldown: any[];
declare namespace PlatformTimedScreenFilter {
    let End: number;
    let Filter: string;
}
declare var PlatformRightButtons: any[];
declare var PlatformInventory: any[];
declare var PlatformInventoryList: {
    Name: string;
    DisplayName: string;
    Description: string;
    OnGive: (Char: any) => void;
}[];
declare var PlatformTemplate: ({
    Name: string;
    Status: string;
    Perk: string;
    PerkName: string[];
    Health: number;
    HealthPerLevel: number;
    Width: number;
    Height: number;
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    DamageAudio: string[];
    DownAudio: string[];
    BindAudio: string[];
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    Attack: {
        Name: string;
        HitBox: number[];
        HitAnimation: number[];
        StartAudio: string[];
        HitAudio: string[];
        Damage: number[];
        Speed: number;
    }[];
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    OnBind?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Perk: string;
    PerkName: string[];
    Width: number;
    Height: number;
    Health: number;
    HealthPerLevel: number;
    Magic: number;
    MagicPerLevel: number;
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    DamageAudio: string[];
    DownAudio: string[];
    BindAudio: string[];
    Animation: ({
        Name: string;
        Cycle: number[];
        Speed: number;
        Audio?: undefined;
    } | {
        Name: string;
        Cycle: number[];
        Speed: number;
        Audio: string[];
    })[];
    Attack: ({
        Name: string;
        HitBox: number[];
        HitAnimation: number[];
        StartAudio: string[];
        HitAudio: string[];
        Damage: number[];
        Speed: number;
        Magic?: undefined;
        Cooldown?: undefined;
    } | {
        Name: string;
        HitBox: number[];
        HitAnimation: number[];
        HitAudio: string[];
        Damage: number[];
        Speed: number;
        StartAudio?: undefined;
        Magic?: undefined;
        Cooldown?: undefined;
    } | {
        Name: string;
        Magic: number;
        Cooldown: number;
        HitBox: number[];
        HitAnimation: number[];
        Damage: number[];
        Speed: number;
        StartAudio?: undefined;
        HitAudio?: undefined;
    })[];
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    OnBind?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Perk: string;
    PerkName: string[];
    Width: number;
    Height: number;
    Health: number;
    HealthPerLevel: number;
    Projectile: number;
    ProjectileName: string;
    ProjectileType: string;
    ProjectileDamage: number[];
    ProjectileTime: number;
    ProjectileHitAudio: string[];
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    DamageAudio: string[];
    DownAudio: string[];
    BindAudio: string[];
    Animation: ({
        Name: string;
        Cycle: number[];
        Speed: number;
        Audio?: undefined;
    } | {
        Name: string;
        Cycle: number[];
        Speed: number;
        Audio: string[];
    })[];
    Attack: ({
        Name: string;
        HitBox: number[];
        HitAnimation: number[];
        StartAudio: string[];
        HitAudio: string[];
        Damage: number[];
        Speed: number;
    } | {
        Name: string;
        Speed: number;
        HitBox?: undefined;
        HitAnimation?: undefined;
        StartAudio?: undefined;
        HitAudio?: undefined;
        Damage?: undefined;
    })[];
    Magic?: undefined;
    MagicPerLevel?: undefined;
    OnBind?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Width: number;
    Height: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    Perk?: undefined;
    PerkName?: undefined;
    Health?: undefined;
    HealthPerLevel?: undefined;
    HitBox?: undefined;
    JumpHitBox?: undefined;
    RunSpeed?: undefined;
    WalkSpeed?: undefined;
    CrawlSpeed?: undefined;
    JumpForce?: undefined;
    CollisionDamage?: undefined;
    ExperienceValue?: undefined;
    DamageBackOdds?: undefined;
    DamageKnockForce?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    OnBind?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Width: number;
    Height: number;
    HitBox: number[];
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    Perk?: undefined;
    PerkName?: undefined;
    Health?: undefined;
    HealthPerLevel?: undefined;
    JumpHitBox?: undefined;
    RunSpeed?: undefined;
    WalkSpeed?: undefined;
    CrawlSpeed?: undefined;
    JumpForce?: undefined;
    CollisionDamage?: undefined;
    ExperienceValue?: undefined;
    DamageBackOdds?: undefined;
    DamageKnockForce?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    OnBind?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    HitBox?: undefined;
    JumpHitBox?: undefined;
    RunSpeed?: undefined;
    WalkSpeed?: undefined;
    CrawlSpeed?: undefined;
    JumpForce?: undefined;
    CollisionDamage?: undefined;
    ExperienceValue?: undefined;
    DamageBackOdds?: undefined;
    DamageKnockForce?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    JumpOdds?: undefined;
    LootOdds?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    JumpOdds: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    JumpOdds: number;
    RunOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    DamageBackOdds?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    CollisionDamage: number;
    ExperienceValue: number;
    RunOdds: number;
    DamageBackOdds: number;
    DamageFaceOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    JumpHitBox?: undefined;
    JumpForce?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Attack?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    JumpOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    JumpHitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    JumpForce: number;
    CollisionDamage: number;
    ExperienceValue: number;
    JumpOdds: number;
    RunOdds: number;
    StandAttackSlowOdds: number;
    DamageBackOdds: number;
    DamageFaceOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: ({
        Name: string;
        Cycle: number[];
        Speed: number;
        CycleLeft?: undefined;
        OffsetY?: undefined;
        Width?: undefined;
        Height?: undefined;
    } | {
        Name: string;
        Cycle: number[];
        CycleLeft: number[];
        Speed: number;
        OffsetY?: undefined;
        Width?: undefined;
        Height?: undefined;
    } | {
        Name: string;
        OffsetY: number;
        Width: number;
        Height: number;
        Cycle: number[];
        Speed: number;
        CycleLeft?: undefined;
    })[];
    Attack: {
        Name: string;
        HitBox: number[];
        HitAnimation: number[];
        Damage: number[];
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    Projectile?: undefined;
    ProjectileName?: undefined;
    ProjectileType?: undefined;
    ProjectileDamage?: undefined;
    ProjectileTime?: undefined;
    ProjectileHitAudio?: undefined;
    ProjectileOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    RunSpeed: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    Projectile: number;
    ProjectileName: string;
    ProjectileType: string;
    ProjectileDamage: number[];
    ProjectileOdds: number;
    ProjectileTime: number;
    CollisionDamage: number;
    ExperienceValue: number;
    RunOdds: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    Attack: {
        Name: string;
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    JumpHitBox?: undefined;
    JumpForce?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    ProjectileHitAudio?: undefined;
    JumpOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
    ProjectileBothSides?: undefined;
} | {
    Name: string;
    Status: string;
    Health: number;
    Width: number;
    Height: number;
    HitBox: number[];
    JumpHitBox: number[];
    JumpForce: number;
    WalkSpeed: number;
    CrawlSpeed: number;
    Projectile: number;
    ProjectileName: string;
    ProjectileType: string;
    ProjectileDamage: number[];
    JumpOdds: number;
    ProjectileOdds: number;
    ProjectileTime: number;
    ProjectileBothSides: boolean;
    CollisionDamage: number;
    ExperienceValue: number;
    DamageBackOdds: number;
    DamageKnockForce: number;
    LootOdds: number;
    Animation: {
        Name: string;
        Cycle: number[];
        Speed: number;
    }[];
    Attack: {
        Name: string;
        Speed: number;
    }[];
    OnBind: () => void;
    Perk?: undefined;
    PerkName?: undefined;
    HealthPerLevel?: undefined;
    RunSpeed?: undefined;
    DamageAudio?: undefined;
    DownAudio?: undefined;
    BindAudio?: undefined;
    Magic?: undefined;
    MagicPerLevel?: undefined;
    ProjectileHitAudio?: undefined;
    RunOdds?: undefined;
    DamageFaceOdds?: undefined;
    StandAttackSlowOdds?: undefined;
})[];
declare var PlatformRoomList: ({
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    LimitRight: number;
    Heal: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Entry?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    AlternateBackground: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    Heal?: undefined;
    Entry?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Heal: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Entry?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    Heal?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    AlternateBackground: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    Character?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    Heal?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    Heal: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Entry?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
        Combat: boolean;
        Fix: boolean;
        Dialog: string;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    Entry?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Entry?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    BackgroundFilter: string;
    Music: string;
    Width: number;
    Height: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Entry?: undefined;
    AlternateBackground?: undefined;
} | {
    Name: string;
    Background: string;
    Music: string;
    Entry: () => void;
    Text?: undefined;
    Width?: undefined;
    Height?: undefined;
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Heal?: undefined;
    Door?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    Heal: number;
    Door: any[];
    LimitLeft?: undefined;
    LimitRight?: undefined;
    Entry?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    AlternateBackground: string;
    Music: string;
    Entry: () => void;
    Width: number;
    Height: number;
    LimitLeft: number;
    Heal: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitRight?: undefined;
    Character?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Entry: () => void;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: ({
        Name: string;
        Status: string;
        X: number;
        Combat: boolean;
        Fix: boolean;
        Dialog: string;
    } | {
        Name: string;
        Status: string;
        X: number;
        Combat?: undefined;
        Fix?: undefined;
        Dialog?: undefined;
    })[];
    LimitLeft?: undefined;
    Heal?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    AlternateBackground: string;
    Music: string;
    Entry: () => void;
    Width: number;
    Height: number;
    LimitLeft: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    LimitRight?: undefined;
    Heal?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    AlternateBackground: string;
    Music: string;
    Entry: () => void;
    Width: number;
    Height: number;
    LimitLeft: number;
    LimitRight: number;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    Character: {
        Name: string;
        Status: string;
        X: number;
    }[];
    Heal?: undefined;
    BackgroundFilter?: undefined;
} | {
    Name: string;
    Text: string;
    Background: string;
    Music: string;
    Width: number;
    Height: number;
    LimitRight: number;
    Heal: number;
    Entry: () => void;
    Door: {
        Name: string;
        FromX: number;
        FromY: number;
        FromW: number;
        FromH: number;
        FromType: string;
        ToX: number;
        ToFaceLeft: boolean;
    }[];
    LimitLeft?: undefined;
    Character?: undefined;
    AlternateBackground?: undefined;
    BackgroundFilter?: undefined;
})[];
