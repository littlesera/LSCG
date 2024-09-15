/**
 * Handles the value of a HTML element. It sets the value of the element when the Value parameter is provided or it returns the value when the parameter is omitted
 * @param {string} ID - The id of the element for which we want to get/set the value.
 * @param {string} [Value] - The value to give to the element (if applicable)
 * @returns {string} - The value of the element (When no value parameter was passed to the function)
 */
declare function ElementValue(ID: string, Value?: string): string;
/**
 * Handles the content of a HTML element. It sets the content of the element when the Content parameter is provided or it returns the value when the parameter is omitted
 * @param {string} ID - The id of the element for which we want to get/set the value.
 * @param {string} [Content] - The content/inner HTML to give to the element (if applicable)
 * @returns {string} - The content of the element (When no Content parameter was passed to the function)
 */
declare function ElementContent(ID: string, Content?: string): string;
/**
 * Creates a new from element in the main document.
 *
 * @param {string} ID - The id of the form to create
 * @returns {HTMLFormElement}
 */
declare function ElementCreateForm(ID: string): HTMLFormElement;
/**
 * Creates a new text area element in the main document. Does not create a new element if there is already an existing one with the same ID
 * @param {string} ID - The id of the text area to create.
 * @param {HTMLFormElement} [form] - The form the element belongs to
 * @returns {HTMLTextAreaElement}
 */
declare function ElementCreateTextArea(ID: string, form?: HTMLFormElement): HTMLTextAreaElement;
/**
 * Creates a new text input element in the main document.Does not create a new element if there is already an existing one with the same ID
 * @param {string} ID - The id of the input tag to create.
 * @param {string} Type - Type of the input tag to create.
 * @param {string} Value - Value of the input tag to create.
 * @param {string | number} [MaxLength] - Maximum input tag of the input to create.
 * * @param {HTMLFormElement} [form] - The form the element belongs to
 * @returns {HTMLInputElement} - The created HTML input element
 */
declare function ElementCreateInput(ID: string, Type: string, Value: string, MaxLength?: string | number, form?: HTMLFormElement): HTMLInputElement;
/**
 * Creates a new range input element in the main document. Does not create a new element if there is already an
 * existing one with the same id
 * @param {string} id - The id of the input tag to create
 * @param {number} value - The initial value of the input
 * @param {number} min - The minimum value of the input
 * @param {number} max - The maximum value of the input
 * @param {number} step - The increment size of the input
 * @param {ThumbIcon} [thumbIcon] - The icon to use for the range input's "thumb" (handle). If not set, the slider will
 * have a default appearance with no custom thumb.
 * @param {boolean} [vertical] - Whether this range input is a vertical slider (defaults to false)
 * @returns {HTMLInputElement} - The created HTML input element
 */
declare function ElementCreateRangeInput(id: string, value: number, min: number, max: number, step: number, thumbIcon?: ThumbIcon, vertical?: boolean): HTMLInputElement;
/**
 * Creates a dropdown element and adjusts it to the BC look and feel. In the HTML Code this will look like this:
 * <div> -- enclosing div used for css and postioning
 *     <select> -- the select statement with its options
 *         <option 1>
 *         <option n>
 *     </select>
 *     <div></div> -- the div representing the currently selected item
 *     <div> -- div for the various options
 *        <div>Option 1</div>
 *        <div>Option n</div>
 *     </div>
 * </div>
 * This construct is built automatically and ignores the original select statement. All the logic is handled by
 * event handlers that are connected to the various divs. See comments in the code.
 * What this function cannot handle at the moment:
 * - The size is always set to 1
 * - Multiple selects are impossible
 * @param {string} ID - The name of the select item. The outer div will get this name, for positioning. The select
 * tag will get the name ID+"-select"
 * @param {readonly string[]} Options - The list of options for the current select statement
 * @param {EventListenerOrEventListenerObject} [ClickEventListener=null] - An event listener to be called, when the value of the drop down box changes
 * @returns {void} - Nothing
 */
declare function ElementCreateDropdown(ID: string, Options: readonly string[], ClickEventListener?: EventListenerOrEventListenerObject): void;
/**
 * Closes all select boxes in the current document, except the current select box
 * @param {object} elmnt - The select box to exclude from the closing
 * @returns {void} - Nothing
 */
declare function ElementCloseAllSelect(elmnt: object): void;
/**
 * Creates a new div element in the main document. Does not create a new element if there is already an existing one with the same ID
 * @param {string} ID - The id of the div tag to create.
 * @returns {void} - Nothing
 */
declare function ElementCreateDiv(ID: string): void;
/**
 * Removes an element from the main document
 * @param {string} ID - The id of the tag to remove from the document.
 * @returns {void} - Nothing
 */
declare function ElementRemove(ID: string): void;
/**
 * Draws an existing HTML element at a specific position within the document. The element is "centered" on the given coordinates by dividing its height and width by two.
 * @param {string} ElementID - The id of the input tag to (re-)position.
 * @param {number} X - Center point of the element on the X axis.
 * @param {number} Y - Center point of the element on the Y axis.
 * @param {number} W - Width of the element.
 * @param {number} [H] - Height of the element.
 * @returns {void} - Nothing
 */
declare function ElementPosition(ElementID: string, X: number, Y: number, W: number, H?: number): void;
/**
 * Draws an existing HTML element at a specific position within the document. The element will not be centered on its given coordinates unlike the ElementPosition function.
 * Not same as ElementPositionFix. Calculates Font size itself.
 * @param {string} ElementID - The id of the input tag to (re-)position.
 * @param {number} X - Starting point of the element on the X axis.
 * @param {number} Y - Starting point of the element on the Y axis.
 * @param {number} W - Width of the element.
 * @param {number} [H] - Height of the element.
 * @returns {void} - Nothing
 */
declare function ElementPositionFixed(ElementID: string, X: number, Y: number, W: number, H?: number): void;
/**
 * Draws an existing HTML element at a specific position within the document. The element will not be centered on its given coordinates unlike the ElementPosition function.
 * @param {string} ElementID - The id of the input tag to (re-)position.
 * @param {number} Font - The size of the font to use.
 * @param {number} X - Starting point of the element on the X axis.
 * @param {number} Y - Starting point of the element on the Y axis.
 * @param {number} W - Width of the element.
 * @param {number} H - Height of the element.
 * @returns {void} - Nothing
 */
declare function ElementPositionFix(ElementID: string, Font: number, X: number, Y: number, W: number, H: number): void;
/**
 * Sets a custom data-attribute to a specified value on a specified element
 * @param {string} ID - The id of the element to create/set the data attribute of.
 * @param {string} Name - Name of the data attribute. ("data-" will be automatically appended to it.)
 * @param {string} Value - Value to give to the attribute.
 * @returns {void} - Nothing
 */
declare function ElementSetDataAttribute(ID: string, Name: string, Value: string): void;
/**
 * Sets an attribute to a specified value on a specified element
 * @param {string} ID - The id of the element to create/set the data attribute of.
 * @param {string} Name - Name of the attribute.
 * @param {string} Value - Value to give to the attribute.
 * @returns {void} - Nothing
 */
declare function ElementSetAttribute(ID: string, Name: string, Value: string): void;
/**
 * Removes an attribute from a specified element.
 * @param {string} ID - The id of the element from which to remove the attribute.
 * @param {string} Name - Name of the attribute to remove.
 * @returns {void} - Nothing
 */
declare function ElementRemoveAttribute(ID: string, Name: string): void;
/**
 * Scrolls to the end of a specified element
 * @param {string} ID - The id of the element to scroll down to the bottom of.
 * @returns {void} - Nothing
 */
declare function ElementScrollToEnd(ID: string): void;
/**
 * Returns the given element's scroll position as a percentage, with the top of the element being close to 0 depending on scroll bar size, and the bottom being around 1.
 * To clarify, this is the position of the bottom edge of the scroll bar.
 * @param {string} ID - The id of the element to find the scroll percentage of.
 * @returns {(number|null)} - A float representing the scroll percentage.
 */
declare function ElementGetScrollPercentage(ID: string): (number | null);
/**
 * Checks if a given HTML element is scrolled to the very bottom.
 * @param {string} ID - The id of the element to check for scroll height.
 * @returns {boolean} - Returns TRUE if the specified element is scrolled to the very bottom
 */
declare function ElementIsScrolledToEnd(ID: string): boolean;
/**
 * Gives focus to a specified existing element for non-mobile users.
 * @param {string} ID - The id of the element to give focus to.
 * @returns {void} - Nothing
 */
declare function ElementFocus(ID: string): void;
/**
 * Toggles HTML elements that were created by a given screen. When toggled off, they are hidden (not removed)
 * @param {string} Screen - Screen for which to hide the elements generated
 * @param {boolean} ShouldDisplay - TRUE if we are toggling on the elements, FALSE if we are hiding them.
 */
declare function ElementToggleGeneratedElements(Screen: string, ShouldDisplay: boolean): void;
