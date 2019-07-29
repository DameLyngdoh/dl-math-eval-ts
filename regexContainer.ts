/**
 * Regular expressions used in the project.
 */
export class RegexContainer {

    /**
     * Close parenthesis
     */
    public static readonly ClosingParenthesis : RegExp = /^[)]$/;
    
    /**
     * Digit regular expression.
     */
    public static readonly Digit : RegExp = /^[0-9]$/;
    
    /**
     * Valid complete reference name
     */
    public static readonly ReferenceName : RegExp = /^([a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+)*)$/;
    
    /**
     * Valid characters in a reference name
     */
    public static readonly ReferenceNameCharacters : RegExp = /^[a-zA-Z0-9$_.]$/;
    
    /**
     * Valid initial or start character of a reference name
     */
    public static readonly ReferenceNameInitial : RegExp = /^[a-zA-Z$]$/;
    
    /**
     * Operators
     */
    public static readonly Operator : RegExp = /^[-+*/]$/;
    
    /**
     * Open parenthesis
     */
    public static readonly OpeningParenthesis : RegExp = /^[(]$/;
}