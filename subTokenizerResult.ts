import { DMEToken } from "./dMEToken";

/**
 * An class representing the result of sub-tokenizing operation.
 */
export class SubTokenizerResult {
    
    /**
     * Ending index of the sub-string of the expression which has been tokenized.
     */
    private _index : number;
    
    /**
     * Array of tokens of the sub-string.
     */
    private _tokens : DMEToken[];

    constructor() {
        this._index = -1;
        this._tokens = [];
    }

    get tokens() : DMEToken[] {
        return this._tokens;
    }
    get index() : number {
        return this._index;
    }

    set tokens( tokens : DMEToken[] ) {
        this._tokens = tokens;
    }
    set index( index : number ) {
        this._index = index;
    }

    /**
     * Gets an instance of the SubTokenizerResult object.
     * @param tokens The array of tokens generated.
     * @param index The ending index of the sub-string.
     * @returns Returns a SubTokenizerResult object.
     */
    public static getInstance( tokens : DMEToken[], index : any ) : SubTokenizerResult {
        let token : SubTokenizerResult = new SubTokenizerResult();
        token.tokens = tokens; token.index = index;
        return token;
    }
}