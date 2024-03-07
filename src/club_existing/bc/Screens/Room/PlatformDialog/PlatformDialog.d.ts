/**
 * Players the audio track for the dialog
 * @param {string} Source - The source file to use
 * @returns {void} - Nothing
 */
declare function PlatformDialogVoice(Source: string): void;
/**
 * Loads the dialog at a specific position
 * @param {Number} Position - The position # to load
 * @returns {void} - Nothing
 */
declare function PlatformDialogLoadPosition(Position: number): void;
/**
 * Starts a specific dialog
 * @param {String} DialogName - The name of the dialog to start
 * @returns {void} - Nothing
 */
declare function PlatformDialogStart(DialogName: string): void;
/**
 * Loads the screen
 * @returns {void} - Nothing
 */
declare function PlatformDialogLoad(): void;
/**
 * Draws the dialog character, text & answers
 * @returns {void} - Nothing
 */
declare function PlatformDialogDraw(): void;
/**
 * Runs and draws the screen.
 * @returns {void} - Nothing
 */
declare function PlatformDialogRun(): void;
/**
 * Change the love/domination value based on the option picked, influenced also by perks
 * @param {Number} CurrentValue - The current value
 * @param {Number} Change - The modifier to apply
 * @param {Boolean} Bonus - If there's a bonus to apply or not
 * @returns {Number} - The new stat after changes
 */
declare function PlatformDialogChangeValue(CurrentValue: number, Change: number, Bonus: boolean, Level: any): number;
/**
 * Pick a specific idle pose if the character allows it
 * @param {Object} Character - The character to evaluate
 * @param {Number} Love - The love value that changed
 * @param {Number} Domination - The domination value that changed
 * @returns {Object} - A unused object
 */
declare function PlatformDialogSetIdlePose(Character: any, Love: number, Domination: number): any;
/**
 * Pick an answer in a specific dialog
 * @param {Number} Position - The position of the answer picked
 * @returns {void} - Nothing
 */
declare function PlatformDialogPickAnswer(Position: number): void;
/**
 * Alters a property (love or domination) for a specific character
 * @param {String} CharacterName - The name of the character to alter
 * @param {String} Property - The name of the property to alter
 * @param {Number} Value - The value to change
 * @returns {void} - Nothing
 */
declare function PlatformDialogAlterProperty(CharacterName: string, Property: string, Value: number): void;
/**
 * Processes the current dialog, can answer or skip to the next phase
 * @returns {void} - Nothing
 */
declare function PlatformDialogProcess(): void;
/**
 * When the user presses keys in the dialog screen
 * @param {object | number} Key - The key or keyCode pressed
 * @returns {void} - Nothing
 */
declare function PlatformDialogKeyDown(Key: object | number): void;
/**
 * Exits the dialog and returns to the game
 * @returns {void} - Nothing
 */
declare function PlatformDialogLeave(): void;
/**
 * Handles clicks in the screen
 * @returns {void} - Nothing
 */
declare function PlatformDialogClick(): void;
/**
 * Returns a dialog character
 * @param {String} Name - The name of a character
 * @returns {Object} - The character object
 */
declare function PlatformDialogGetCharacter(Name: string): any;
/**
 * Handles the controller inputs
 * @param {Object} Buttons - The buttons pressed on the controller
 * @returns {boolean} - Always TRUE to indicate that the controller is handled
 */
declare function PlatformDialogController(Buttons: any): boolean;
/**
 * Returns TRUE if the party leader (Melody) has a specific social perk
 * @param {String} PerkName - The name of the perk
 * @returns {boolean} - TRUE if the perk is active
 */
declare function PlatformDialogLeaderHasPerk(PerkName: string): boolean;
/**
 * Sets up some special event parameters based on the game progress
 * @returns {void}
 */
declare function PlatformDialogEvent(): void;
/**
 * Returns TRUE if the character is Melody's lover, make sure that character or Melody is currently active
 * @param {String} Name - The name of a character
 * @returns {boolean} - TRUE if lover
 */
declare function PlatformDialogIsLover(Name: string): boolean;
/**
 * Returns TRUE if two characters are lovers
 * @param {String} Char1 - The name of the first character
 * @param {String} Char2 - The name of the second character
 * @returns {boolean} - TRUE if lover
 */
declare function PlatformDialogCharactersAreLovers(Char1: string, Char2: string): boolean;
/**
 * Returns TRUE if the character is Melody's slave, make sure that character or Melody is currently active
 * @param {String} Name - The name of a character
 * @returns {boolean} - TRUE if lover
 */
declare function PlatformDialogIsSlave(Name: string): boolean;
/**
 * Returns TRUE if the first character is the slave of the second character
 * @param {String} Char1 - The name of the first character
 * @param {String} Char2 - The name of the second character
 * @returns {boolean} - TRUE if slave
 */
declare function PlatformDialogIsSlaveOfCharacter(Char1: string, Char2: string): boolean;
/**
 * Returns TRUE if the character is Melody's owner, make sure that character or Melody is currently active
 * @param {String} Name - The name of a character
 * @returns {boolean} - TRUE if lover
 */
declare function PlatformDialogIsOwner(Name: string): boolean;
/**
 * Called manually to output the full dialog text to the console for text proofing
 * @returns {void} - Nothing
 */
declare function PlatformDialogOutputAll(): void;
declare var PlatformDialog: any;
declare var PlatformDialogBackground: any;
declare var PlatformDialogText: any;
declare var PlatformDialogAnswer: any;
declare var PlatformDialogAnswerPosition: number;
declare var PlatformDialogReply: any;
declare var PlatformDialogGoto: any;
declare var PlatformDialogCharacterDisplay: any;
declare var PlatformDialogPosition: number;
declare var PlatformDialogCharacter: any;
declare var PlatformDialogAudio: any;
declare var PlatformDialogAudioStyle: string[];
declare var PlatformDialogCharacterTemplate: ({
    Name: string;
    Color: string;
    IdlePose?: undefined;
    Love?: undefined;
    Domination?: undefined;
    NickName?: undefined;
} | {
    Name: string;
    Color: string;
    IdlePose: string[];
    Love: number;
    Domination: number;
    NickName?: undefined;
} | {
    Name: string;
    Color: string;
    Love: number;
    Domination: number;
    IdlePose?: undefined;
    NickName?: undefined;
} | {
    Name: string;
    NickName: string;
    Color: string;
    IdlePose?: undefined;
    Love?: undefined;
    Domination?: undefined;
})[];
declare var PlatformDialogData: ({
    Name: string;
    Music: string;
    Dialog: ({
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
            Y: number;
        }[];
        Audio?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
            Y: number;
        }[];
        Text?: undefined;
        Background?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
    } | {
        Background: string;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
        })[];
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: {
            Text: string;
            Reply: string;
            Audio: string;
        }[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: {
            Text: string;
            Reply: string;
            Audio: string;
        }[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Audio?: undefined;
            Domination?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Audio?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Audio?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Audio?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        TextScript: () => "Can I have my orgasm Lady Olivia?" | "It's time for the climax.";
        AudioScript: () => "O221" | "O222";
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
    } | {
        TextScript: () => "Yes, you can have your orgasm my maid." | "(She smiles and watches you carefully.)";
        AudioScript: () => string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
        ID?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
        })[];
        Background?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: {
            Text: string;
            Reply: string;
        }[];
        Background?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            AudioStyle: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            AudioStyle?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            AudioStyle: string;
            Audio: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            AudioStyle: string;
            Audio: string;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        TextScript?: undefined;
        AudioScript?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        TextScript: () => "Is it you Melody?  Are you a zombie?" | "Hey!  I'm Edlaran, a wood elf, are you a zombie?";
        AudioScript: () => "12" | "11";
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Love?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Script?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Script?: undefined;
        } | {
            Text: string;
            Script: () => void;
            Reply?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Audio?: undefined;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
            Domination?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Goto: string;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
            Goto: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
            Goto: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
        })[];
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Answer?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Script?: undefined;
        } | {
            Text: string;
            Script: () => void;
            Reply?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Audio?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Answer?: undefined;
        Audio?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            Y: number;
        }[];
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
            Perk: boolean;
        })[];
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Perk: boolean;
            AudioStyle?: undefined;
            Love?: undefined;
        })[];
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            Perk: boolean;
        })[];
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            Y: number;
        }[];
    } | {
        Text: string;
        Audio: string;
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            Y: number;
        }[];
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Background: string;
        Audio?: undefined;
        AudioStyle?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            Y: number;
        }[];
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Text: string;
        Audio: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            Y: number;
        }[];
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio?: undefined;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
            Perk: boolean;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Perk?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Perk?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        TextScript: () => "My dear Olivia, together we are unstoppable." | "Olivia, I'm glad we are in this mess together." | "Little lady, I'll be there to lock you up every night." | "Olivia, I'll be there to protect you." | "Lady Olivia, your maid will be there to serve and obey you.  (You do a maid curtsy.)" | "Lady Olivia, I'll be there to help you.";
        AudioScript: () => "81" | "82" | "83" | "84" | "85" | "86";
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        AudioScript?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        ID: string;
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Background?: undefined;
        Entry?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Love?: undefined;
            Script?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Script: () => void;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            Perk: boolean;
            AudioStyle?: undefined;
            Script?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        ID: string;
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text: string;
        Background?: undefined;
        Entry?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Audio?: undefined;
            AudioStyle?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        AudioStyle?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: ({
            Name: string;
            Status: string;
            X: number;
            Pose: string;
            Animation?: undefined;
        } | {
            Name: string;
            Status: string;
            X: number;
            Animation: string;
            Pose?: undefined;
        })[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: ({
            Name: string;
            Status: string;
            X: number;
            Animation: string;
            Pose?: undefined;
        } | {
            Name: string;
            Status: string;
            X: number;
            Pose: string;
            Animation?: undefined;
        })[];
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Script: () => void;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Script?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Script?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Script: () => void;
            Domination?: undefined;
            Love?: undefined;
            Reply?: undefined;
        } | {
            Text: string;
            Domination: number;
            Love: number;
            Script: () => void;
            Reply?: undefined;
        } | {
            Text: string;
            Reply: string;
            Script: () => void;
            Domination?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry: () => void;
        TextScript?: undefined;
    } | {
        TextScript: () => "(The crate is open and empty.)" | "(It's too dangerous to inspect the crate while it's guarded.)";
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Script: () => void;
        } | {
            Text: string;
            Script: () => void;
            Reply?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Character: ({
            Name: string;
            Status: string;
            Pose: string;
            Animation?: undefined;
        } | {
            Name: string;
            Status: string;
            Animation: string;
            Pose?: undefined;
        })[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
            Goto: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
            Y: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        })[];
        Character?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Perk?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Love?: undefined;
            Perk?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Perk: boolean;
            Domination: number;
            AudioStyle?: undefined;
            Love?: undefined;
        })[];
        Character?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character?: undefined;
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Background: string;
        Character: ({
            Name: string;
            Status: string;
            Pose: string;
            X: number;
            Y: number;
        } | {
            Name: string;
            Status: string;
            Pose: string;
            X?: undefined;
            Y?: undefined;
        })[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        })[];
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love?: undefined;
            Domination?: undefined;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Love: number;
            Domination: number;
        })[];
        Character?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Text?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Love: number;
            Goto: string;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Goto: string;
            Domination?: undefined;
            Love?: undefined;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination: number;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Domination: number;
            Love?: undefined;
            Goto?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Audio: string;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Script: () => void;
            Reply?: undefined;
        } | {
            Text: string;
            Reply: string;
            Script?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Audio?: undefined;
        Entry?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Audio?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            X: number;
            Y: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
    } | {
        Background: string;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            X: number;
            Y: number;
        }[];
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
            Y: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Answer?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Domination: number;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Love: number;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
    } | {
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text: string;
        Audio: string;
        AudioStyle: string;
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Domination: number;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Love: number;
            AudioStyle?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Perk: boolean;
            Love: number;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Prerequisite?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Audio: string;
        Background?: undefined;
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    } | {
        Prerequisite: () => boolean;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text: string;
        Background?: undefined;
        Entry?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Love?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Script: () => void;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Audio?: undefined;
            AudioStyle?: undefined;
            Script?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio?: undefined;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Audio?: undefined;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Script: () => void;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Audio?: undefined;
            AudioStyle?: undefined;
            Script?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Love?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
            Love: number;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            Goto: string;
            AudioStyle?: undefined;
            Love?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Background?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Script: () => void;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Audio?: undefined;
            AudioStyle?: undefined;
            Script?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Audio: string;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            Domination: number;
            AudioStyle?: undefined;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Goto: string;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Audio: string;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle?: undefined;
            Domination?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        AudioStyle?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Audio?: undefined;
        AudioStyle?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Music: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Answer: ({
            Text: string;
            Reply: string;
            Audio: string;
            AudioStyle: string;
            Script: () => void;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Audio?: undefined;
            AudioStyle?: undefined;
            Script?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        AudioStyle?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        AudioStyle: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Entry?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Audio: string;
        AudioStyle: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Audio: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Audio?: undefined;
        Answer?: undefined;
        AudioStyle?: undefined;
        Prerequisite?: undefined;
    })[];
    Exit?: undefined;
})[];
