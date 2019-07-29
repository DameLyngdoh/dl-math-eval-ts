"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Regular expressions used in the project.
 */
var RegexContainer = /** @class */ (function () {
    function RegexContainer() {
    }
    /**
     * Close parenthesis
     */
    RegexContainer.ClosingParenthesis = /^[)]$/;
    /**
     * Digit regular expression.
     */
    RegexContainer.Digit = /^[0-9]$/;
    /**
     * Valid complete reference name
     */
    RegexContainer.ReferenceName = /^([a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+)*)$/;
    /**
     * Valid characters in a reference name
     */
    RegexContainer.ReferenceNameCharacters = /^[a-zA-Z0-9$_.]$/;
    /**
     * Valid initial or start character of a reference name
     */
    RegexContainer.ReferenceNameInitial = /^[a-zA-Z$]$/;
    /**
     * Operators
     */
    RegexContainer.Operator = /^[-+*/]$/;
    /**
     * Open parenthesis
     */
    RegexContainer.OpeningParenthesis = /^[(]$/;
    return RegexContainer;
}());
exports.RegexContainer = RegexContainer;
