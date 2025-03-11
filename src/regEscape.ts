'use strict';

/**
core-js 3.40.0 - 2025.01.08

Copyright (c) 2014-2025 Denis Pushkarev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

/**
 * Escapes any potential regex syntax characters in a string, and returns a new string that can be safely used as a literal pattern for the {@link RegExp} constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
 * @param S The string to escape.
 * @returns A new string that can be safely used as a literal pattern for the {@link RegExp} constructor. 
 */
// Adapted from https://github.com/zloirock/core-js/blob/v3.40.0/packages/core-js/modules/esnext.regexp.escape.js
export var regEscape = (() => {
    // As of the time of writing a limited number of browsers have native `RegExp.escape` support
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
    if ("escape" in RegExp && typeof RegExp.escape === "function") {
        return RegExp.escape as (S: string) => string;
    }

    var WHITESPACES = (
        '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
        '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'
    );

    var FIRST_DIGIT_OR_ASCII = /^[0-9a-z]/i;
    var SYNTAX_SOLIDUS = /^[$()*+./?[\\\]^{|}]/;
    var OTHER_PUNCTUATORS_AND_WHITESPACES = RegExp('^[!"#%&\',\\-:;<=>@`~' + WHITESPACES + ']');
    var ControlEscape = {
        '\u0009': 't',
        '\u000A': 'n',
        '\u000B': 'v',
        '\u000C': 'f',
        '\u000D': 'r',
    };

    function escapeChar(chr: string): string {
        var hex = chr.charCodeAt(0).toString(16);
        return hex.length < 3 ? '\\x' + hex.padStart(2, '0') : '\\u' + hex.padStart(4, '0');
    };

    // `RegExp.escape` method
    // https://github.com/tc39/proposal-regex-escaping
    return function escape(S: string): string {
        if (typeof S !== 'string') {
            throw new TypeError('Argument is not a string');
        }
    
        var length = S.length;
        var result = Array(length);

        for (var i = 0; i < length; i++) {
            var chr = S.charAt(i);
            if (i === 0 && FIRST_DIGIT_OR_ASCII.exec(chr)) {
                result[i] = escapeChar(chr);
            } else if (chr in ControlEscape) {
                result[i] = '\\' + ControlEscape[chr as keyof typeof ControlEscape];
            } else if (SYNTAX_SOLIDUS.exec(chr)) {
                result[i] = '\\' + chr;
            } else if (OTHER_PUNCTUATORS_AND_WHITESPACES.exec(chr)) {
                result[i] = escapeChar(chr);
            } else {
                var charCode = chr.charCodeAt(0);
                if ((charCode & 0xF800) !== 0xD800) { // single UTF-16 code unit
                    result[i] = chr;
                } else if (charCode >= 0xDC00 || i + 1 >= length || (S.charCodeAt(i + 1) & 0xFC00) !== 0xDC00) { // unpaired surrogate
                    result[i] = escapeChar(chr);
                } else { // surrogate pair
                    result[i] = chr;
                    result[++i] = S.charAt(i);
                }
            }
        }

        return result.join('');
    };
})();
