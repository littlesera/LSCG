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
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
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
    } | {
        Background: string;
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
    } | {
        Text: string;
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
        ID?: undefined;
    } | {
        Text: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
        })[];
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: {
            Text: string;
            Reply: string;
        }[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
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
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
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
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
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
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        ID: string;
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        ID?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        TextScript: () => "Can I have my orgasm Lady Olivia?" | "It's time for the climax";
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        TextScript: () => "Yes, you can have your orgasm my maid." | "(She smiles and watches you carefully.)";
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Entry: () => void;
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        ID?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Background?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        ID?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        TextScript?: undefined;
    })[];
} | {
    Name: string;
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
        ID?: undefined;
    } | {
        Text: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        Background?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        TextScript?: undefined;
        Text?: undefined;
        Answer?: undefined;
    } | {
        TextScript: () => "Is it you Melody?  Are you a zombie?" | "Hey!  I'm Edlaran, a wood elf, are you a zombie?";
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Script?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Script?: undefined;
        } | {
            Text: string;
            Script: () => void;
            Reply?: undefined;
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
        }[];
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: {
            Text: string;
            Reply: string;
            Love: number;
        }[];
        Background?: undefined;
        Character?: undefined;
    })[];
} | {
    Name: string;
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
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
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
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
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
            Love: number;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
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
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
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
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
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
            Love: number;
            Domination: number;
            Goto: string;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
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
    } | {
        Text: string;
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
        Answer?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk: boolean;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk: boolean;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
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
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
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
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Background: string;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
} | {
    Name: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        Answer?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
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
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Dialog: ({
        Text: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Perk: boolean;
        })[];
        Background?: undefined;
        Character?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Perk: boolean;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Perk?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Perk?: undefined;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
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
        TextScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        TextScript: () => "My dear Olivia, together we are unstoppable." | "I'm glad we are in this mess together Olivia." | "And I'll be there to lock you up every night little lady." | "And I'll be there to protect you Olivia." | "And your maid will be there to serve and obey you Lady Olivia.  (You do a maid curtsy.)" | "And I'll be there to help you Lady Olivia.";
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
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
        Answer?: undefined;
        TextScript?: undefined;
        ID?: undefined;
    } | {
        Text: string;
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
            Love: number;
            Goto: string;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        TextScript?: undefined;
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
        Answer?: undefined;
        TextScript?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        TextScript?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
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
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        ID?: undefined;
        Prerequisite?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
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
        Answer?: undefined;
        ID?: undefined;
    })[];
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Background: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Entry?: undefined;
        Text?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Entry?: undefined;
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
        Background?: undefined;
        Entry?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love?: undefined;
            Script?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Script: () => void;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Script?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Entry?: undefined;
        Character?: undefined;
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
        Entry?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
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
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Domination?: undefined;
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
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
    })[];
} | {
    Name: string;
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
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
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
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Animation: string;
        }[];
        Text?: undefined;
        Entry?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        Answer?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
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
    } | {
        Text: string;
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
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
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
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
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
        Background?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
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
    Exit: () => void;
    Dialog: ({
        Text: string;
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
    } | {
        Text: string;
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
        Answer?: undefined;
    } | {
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Answer?: undefined;
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text?: undefined;
        Background?: undefined;
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
        Answer?: undefined;
    })[];
} | {
    Name: string;
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
    Dialog: ({
        Background: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Text: string;
        Answer?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
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
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Entry: () => void;
        Background?: undefined;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Perk: boolean;
            Domination?: undefined;
        })[];
        Background?: undefined;
        Character?: undefined;
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
        Entry?: undefined;
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
        Background?: undefined;
        Character?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Background?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Entry?: undefined;
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
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination?: undefined;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        ID?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Exit: () => void;
    Dialog: ({
        Text: string;
        Character?: undefined;
        Answer?: undefined;
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
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Domination: number;
        })[];
        Character?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Perk?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Perk?: undefined;
            Domination?: undefined;
        } | {
            Text: string;
            Reply: string;
            Perk: boolean;
            Domination: number;
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
        Answer?: undefined;
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
        Answer?: undefined;
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
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love?: undefined;
            Domination?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        Answer?: undefined;
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
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
            Love: number;
            Goto: string;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Domination?: undefined;
            Love?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
            Love: number;
            Domination: number;
            Goto?: undefined;
            Perk?: undefined;
        } | {
            Text: string;
            Reply: string;
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
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Text: string;
        Character?: undefined;
        Answer?: undefined;
        Background?: undefined;
        Entry?: undefined;
    })[];
} | {
    Name: string;
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
    } | {
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Background?: undefined;
        Text?: undefined;
        Answer?: undefined;
    })[];
} | {
    Name: string;
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
        Answer?: undefined;
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
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Prerequisite: () => boolean;
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
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
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
        }[];
        Entry?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Answer?: undefined;
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
        Answer?: undefined;
        ID?: undefined;
    } | {
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Domination: number;
        } | {
            Text: string;
            Reply: string;
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
        Answer?: undefined;
        Background?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Prerequisite?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Background?: undefined;
    })[];
    Exit?: undefined;
} | {
    Name: string;
    Dialog: ({
        Entry: () => void;
        Character: {
            Name: string;
            Status: string;
            Pose: string;
            X: number;
        }[];
        Text?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Entry?: undefined;
        Character?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
        ID?: undefined;
    } | {
        Text: string;
        Answer: ({
            Text: string;
            Reply: string;
            Script: () => void;
            Goto?: undefined;
        } | {
            Text: string;
            Reply: string;
            Goto: string;
            Script?: undefined;
        })[];
        Entry?: undefined;
        Character?: undefined;
        Prerequisite?: undefined;
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
        Answer?: undefined;
        ID?: undefined;
    } | {
        ID: string;
        Entry: () => void;
        Character?: undefined;
        Text?: undefined;
        Answer?: undefined;
        Prerequisite?: undefined;
    })[];
    Exit?: undefined;
})[];
