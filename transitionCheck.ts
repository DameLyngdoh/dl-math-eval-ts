import { DMETokenType } from "./dMETokenType.enum";
import { DMEToken } from "./dMEToken";

/**
 * Performs a check against a transition table through the use of regular expressions.
 * @param currentToken The token which was generated.
 * @param next The next character following the token.
 * @returns Returns true if the transition is valid or false otherwise.
 * @throws <i>Unrecognized TokenType value</i>.
 */
export let TransitionCheck = function( currentToken : DMEToken, next : string ) : boolean {
    let nextRegex : RegExp = /[0]/;

    switch(currentToken.type) {
        case DMETokenType.Operand:
            nextRegex = /^[-+*/)]$/
            break;
        case DMETokenType.Operator:
            nextRegex = /^[(0-9a-zA-Z$]$/
            break;
        case DMETokenType.OpenParenthesis:
            nextRegex = /^[-0-9a-zA-Z]$/
            break;
        case DMETokenType.CloseParenthesis:
            nextRegex = /^[-+*/]$/
            break;
        case DMETokenType.Reference:
            nextRegex = /^[-+*/)]$/
            break;
        default:
            throw new Error('Unrecognized TokenType value.');
    }
    
    try{
        return nextRegex.test(next);
    }
    catch(ex) {
        throw ex;
    }
}