"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Enum for the all possible type of tokens.
 */
var DMETokenType;
(function (DMETokenType) {
    DMETokenType[DMETokenType["Operator"] = 0] = "Operator";
    DMETokenType[DMETokenType["Operand"] = 1] = "Operand";
    DMETokenType[DMETokenType["OpenParenthesis"] = 2] = "OpenParenthesis";
    DMETokenType[DMETokenType["CloseParenthesis"] = 3] = "CloseParenthesis";
    DMETokenType[DMETokenType["Reference"] = 4] = "Reference";
})(DMETokenType = exports.DMETokenType || (exports.DMETokenType = {}));
