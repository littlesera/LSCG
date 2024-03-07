/**
 * Plays a sound at a given volume
 * @param {string} src - Source of the audio file to play
 * @param {number} [volume] - Volume of the audio in percentage (ranges from 0 to 1)
 * @returns {void} - Nothing
 */
declare function AudioPlayInstantSound(src: string, volume?: number): void;
/**
 * Begins to play a sound when applying/removing an item
 * @param {string} SourceFile - Source of the audio file to play
 * @returns {void} - Nothing
 */
declare function AudioDialogStart(SourceFile: string): void;
/**
 * Stops playing the sound when done applying/removing an item
 * @returns {void} - Nothing
 */
declare function AudioDialogStop(): void;
/**
 * Returns the actual volume given a volume modifier.
 *
 * @param {number} modifier - The volume modifier to use, from -4 to 4
 * @returns {number} The volume level, from 0.0 to 1.0
 */
declare function AudioVolumeFromModifier(modifier: number): number;
/**
 * Is sound allowed to play.
 *
 * @param {boolean} IsPlayerInvolved - Whether the player was involved in what caused the sound to play.
 * @returns {boolean} True if the player has item sound enabled, and a non-muted volume, false otherwise.
 */
declare function AudioShouldSilenceSound(IsPlayerInvolved?: boolean): boolean;
/**
 * Takes the received data dictionary content and identifies the audio to be played
 * @param {ServerChatRoomMessage} data - Data received
 * @param {Character} sender
 * @param {string} msg
 * @param {IChatRoomMessageMetadata} metadata
 * @returns {boolean}
 */
declare function AudioPlaySoundForChatMessage(data: ServerChatRoomMessage, sender: Character, msg: string, metadata: IChatRoomMessageMetadata): boolean;
/**
 * Low-level function to play a sound effect.
 * @param {AudioSoundEffect|string} soundEffect
 * @param {number} [volumeModifier]
 * @returns {boolean} if a sound was played or not.
 */
declare function AudioPlaySoundEffect(soundEffect: AudioSoundEffect | string, volumeModifier?: number): boolean;
/**
 * Plays a given asset sound effect.
 * @param {Character} character
 * @param {Asset} asset
 * @returns {boolean} Whether a sound was played.
 */
declare function AudioPlaySoundForAsset(character: Character, asset: Asset): boolean;
/**
 * Get the sound effect for a given asset.
 *
 * @param {Character} character
 * @param {AssetGroupName} groupName
 * @param {string} assetName
 * @returns {AudioSoundEffect?}
 */
declare function AudioGetSoundFromAsset(character: Character, groupName: AssetGroupName, assetName: string): AudioSoundEffect | null;
/**
 * Get a file name for a given sound effect.
 * @param {string} sound - The sound effect to load a file from.
 * @returns {string?}
 */
declare function AudioGetFileName(sound: string): string | null;
/**
 * Processes which sound should be played for items
 * @param {ServerChatRoomMessage} data - Data content triggering the potential sound
 * @param {IChatRoomMessageMetadata} metadata - The chat message metadata
 * @returns {AudioSoundEffect | undefined} - The name of the sound to play, followed by the noise modifier
 */
declare function AudioGetSoundFromChatMessage(data: ServerChatRoomMessage, metadata: IChatRoomMessageMetadata): AudioSoundEffect | undefined;
/**
 * Processes the sound for vibrators
 * @param {ServerChatRoomMessage} data - Represents the chat message received
 * @param {IChatRoomMessageMetadata} metadata - The metadata from the recieved message
 * @returns {[string, number]} - The name of the sound to play, followed by the noise modifier
 */
declare function AudioVibratorSounds(data: ServerChatRoomMessage, metadata: IChatRoomMessageMetadata): [string, number];
/**
 * Processes the sound for shocks
 * @param {ServerChatRoomMessage} data - Represents the chat message received
 * @returns {[string, number]} - The name of the sound to play, followed by the noise modifier
 */
declare function AudioShockSounds(data: ServerChatRoomMessage): [string, number];
declare var AudioDialog: HTMLAudioElement;
/** @type AudioEffect[] */
declare var AudioList: AudioEffect[];
/**
 * A list of chat message audio effect "detectors".
 *
 * They get checked in the order they're defined, so be careful where you insert new entries.
 *
 * @type AudioChatAction[]
 */
declare var AudioActions: AudioChatAction[];
/** The "normal" volume for a game sound, a.k.a a sound with modifier 0 */
declare let AudioVolumeNormalLevel: number;
/** Number of available modifier steps */
declare let AudioVolumeModifierSteps: number;
