import { DMEToken } from "./dMEToken";

/**
 * Class that represents the result of the parsing a numerical or reference token. The ending index of the number or the reference alongwith the token that was parsed from the expression are contained as fields.
 */
export class ProcessingResult {
    
    /**
     * The end index of the last character of the token in the expression.
     */
    private _index : number;
    
    /**
     * The token object of the number or the reference.
     */
    private _token : DMEToken;

    constructor() {
        this._index = -1;
        this._token = new DMEToken();
    }

    get index() : number {
        return this._index;
    }
    get token() : DMEToken {
        return this._token;
    }

    set index( index : number ) {
        // Validating index
        if( index < 0 ) {
            throw new Error();
        }
        this._index = index;
    }
    set token( token : DMEToken ) {
        this._token = token;
    }
}