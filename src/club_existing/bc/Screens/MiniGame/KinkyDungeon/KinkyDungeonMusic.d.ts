declare function KDGetCheckpoint(): string;
declare function KDUpdateMusic(): void;
declare function KDPlayMusic(Sound: any, Volume: any): void;
declare function KDEndMusic(): void;
/** These tracks will loop with a certain chance of forcibly continuing the loop. 0 = no loop*/
declare let KDMusicLoopTracksChance: {
    "AREA1-GRAVEYARD.ogg": number;
    "AREA2-ANCIENTTOMBS.ogg": number;
    "GENERIC-DOLLRACK.ogg": number;
    "AREA4-MAGICLIBRARY.ogg": number;
    "AREA5-UNDERGROUNDJUNGLE.ogg": number;
    "AREA6-CRYSTALCAVE.ogg": number;
    "AREA7-LOSTTEMPLE.ogg": number;
    "AREA8-BELLOWS.ogg": number;
};
declare let KDCurrentSong: string;
declare let KDNewSong: string;
declare let KDLastSong: string;
declare let KDCurrentLoops: number;
declare let KDCurrentFade: number;
declare let KDMusicFadeTime: number;
declare let KDMusicFadeInTime: number;
declare let KDMusicTickRate: number;
/** @type {HTMLAudioElement} */
declare let KDCurrentMusicSound: HTMLAudioElement;
declare let KDCurrentMusicSoundUpdate: any;
declare let lastKDMusicTick: number;
