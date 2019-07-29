"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dMETokenType_enum_1 = require("./dMETokenType.enum");
/**
 * Performs a check against a transition table through the use of regular expressions.
 * @param currentToken The token which was generated.
 * @param next The next character following the token.
 * @returns Returns true if the transition is valid or false otherwise.
 * @throws <i>Unrecognized TokenType value</i>.
 */
exports.TransitionCheck = function (currentToken, next) {
    var nextRegex = /[0]/;
    switch (currentToken.type) {
        case dMETokenType_enum_1.DMETokenType.Operand:
            nextRegex = /^[-+*/)]$/;
            break;
        case dMETokenType_enum_1.DMETokenType.Operator:
            nextRegex = /^[(0-9a-zA-Z$]$/;
            break;
        case dMETokenType_enum_1.DMETokenType.OpenParenthesis:
            nextRegex = /^[-0-9a-zA-Z]$/;
            break;
        case dMETokenType_enum_1.DMETokenType.CloseParenthesis:
            nextRegex = /^[-+*/]$/;
            break;
        case dMETokenType_enum_1.DMETokenType.Reference:
            nextRegex = /^[-+*/)]$/;
            break;
        default:
            throw new Error('Unrecognized TokenType value.');
    }
    try {
        return nextRegex.test(next);
    }
    catch (ex) {
        throw ex;
    }
};
