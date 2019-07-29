import { DMEToken } from "./dMEToken";
import { ProcessingResult } from "./processingResult";
import { DMETokenType } from "./dMETokenType.enum";
import { DMEReferenceToken } from "./dMEReferenceToken";
import { ReferenceTokenType } from "./reference-token-type.enum";
import { SubTokenizerResult } from "./subTokenizerResult";
import { RegexContainer } from "./regexContainer";
import { TransitionCheck } from "./transitionCheck";
import { Stack } from "dl-stack-ts";

/**
 * Mathematical expression evaluator class.
 */
export class DLMathEval {
    
    /**
     * Evaluates a binomial (of tokens) of the form A operator B, where A is the first operand and B is the second operand.
     * @param A The first operand token of the expression.
     * @param B The second operand token of the expression
     * @param operator The operator between the operands.
     * @returns Returns a numerical result of the expression.
     */
    public static evaluateBinomial( A : DMEToken, B : DMEToken, operator : DMEToken) : number {
        // A must be a number
        if(A==undefined || A==null || A.type!=DMETokenType.Operand) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined A operand. Token value is " + A.value);
        }

        // B must be a number
        if(B==undefined || B==null || B.type!=DMETokenType.Operand) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined B operand. Token value is " + B.value);
        }

        // operator must be a number
        if(operator==undefined || operator==null || operator.type!=DMETokenType.Operator) {
            throw new Error("Cannot evaluate binomial. Invalid or null or undefined operator. Token value is " + operator.value);
        }

        let result : number = 0, a : number, b : number;
        try {
            a = A.value; b = B.value;
            result = this.evaluateNativeBinomial(a, b, operator.value);
        }
        catch(err) {
            throw err;
        }

        return result;
    }

    /**
     * Evaluates a string mathematical expression using a lookup object for references within the expression.
     * @param exp The string expression to be evaluated.
     * @param references The lookup object.
     * @returns Returns the numerical result of the evaluation.
     */
    public static evaluateExpression( exp : string, references : any ) : number {
        if(exp==undefined || exp==null) {
            throw new Error('Null of undefined expression.');
        }
        
        try {
            let tokens : DMEToken[] = DLMathEval.tokenize(exp);
            tokens = DLMathEval.evaluateReferenceTokens(tokens, references);
            tokens = DLMathEval.evaluateUnaryOperations(tokens);
            return DLMathEval.evaluateNativeExpression(tokens);
        }
        catch(ex) {
            throw ex;
        }
    }

    /**
     * Evaluates a binomial (of numbers) of the form A operator B, where A is the first operand and B is the second operand.
     * @param A The first operand of the expression.
     * @param B The second operand of the expression
     * @param operator The operator between the operands.
     * @returns Returns a numerical result of the expression.
     * @throws Divides by zero exception.
     */
    public static evaluateNativeBinomial( A : number, B : number, operator : string ) : number {
        
        // Checking operator
        if(operator==undefined || operator==null) {
            throw new Error("Cannot evaluate native binomial. Operator is undefiend or null.");
        }
        if(!RegexContainer.Operator.test(operator)) {
            throw new Error("Cannot evaluate native binomial. Unrecognized operator "  + operator);
        }

        let result : number = 0;
        switch(operator) {
            case '+':
                result = A + B;
                break;
            case '-':
                    result = A - B;
                    break;
            case '*':
                result = A * B;
                break;
            case '/':
                // Divides by 0 exception
                if(B==0) {
                    throw new Error("Cannot evaluate native binomial. Divides by 0 exception.");
                }
                result = A / B;
                break;
        }
        return result;
    }

    /**
     * Evaluates a native expression or an expression that does not have any unary operations or reference tokens.
     * @param exp The array of tokens of the expression.
     * @returns Returns the evaluated value.
     * @throws <i>Unrecognized native token</i> when a reference token is found.
     * @throws <i>Opening parenthesis not found</i> when a closing parenthesis is encountered but its matching opening parenthesis is not found.
     * @throws <i>Multiple operands left in stack</i> when the expression is invalid and final value is not obtained.
     */
    public static evaluateNativeExpression( exp : DMEToken[] ) : number {
        
        // Validating that each token is in its native form
        for(let t of exp) {
            switch(t.type) {
                case DMETokenType.Operand:
                case DMETokenType.Operator:
                case DMETokenType.OpenParenthesis:
                case DMETokenType.CloseParenthesis:
                    break;
                default:
                    throw new Error("Unrecognized native token.");
            }
        }

        // Initializing stacks
        let operandStack : Stack<DMEToken> = new Stack<DMEToken>();
        let operatorStack : Stack<DMEToken> = new Stack<DMEToken>();

        // Iterating through the expression
        for(let token of exp) {
            switch(token.type) {
                case DMETokenType.Operand:
                    operandStack.push(token);
                    break;
                case DMETokenType.OpenParenthesis:
                    operatorStack.push(token);
                    break;
                case DMETokenType.CloseParenthesis:
                    // No opening parenthesis found
                    if(operatorStack.isEmpty()) {
                        throw new Error("Opening parenthesis not found.");
                    }
                    
                    for(let operator:DMEToken = operatorStack.pop(); operator.type!=DMETokenType.OpenParenthesis; operator = operatorStack.pop()) {
                        this.stackEvaluate(operandStack, operator);

                        // No opening parenthesis found
                        if(operatorStack.isEmpty()) {
                            throw new Error("Opening parenthesis not found.");
                        }
                    }
                    break;
                case DMETokenType.Operator:
                    if(operatorStack.isEmpty()) {
                        operatorStack.push(token);
                        break;
                    }
                    let topPrecedence : number = this.getOperatorPrecedence(operatorStack.top().value);
                    let opPrecedence : number = this.getOperatorPrecedence(token.value);
                    
                    if(opPrecedence >= topPrecedence) {
                        operatorStack.push(token);
                    }
                    else {
                        for(let operator:DMEToken; opPrecedence < topPrecedence ;) {
                            operator = operatorStack.pop();
                            this.stackEvaluate(operandStack, operator);
                            if(operatorStack.isEmpty()) {
                                break;
                            }
                            topPrecedence = this.getOperatorPrecedence(operatorStack.top().value);
                        }
                        operatorStack.push(token);
                    }
                    break;
            }
        }

        // Iterating over remaining operators in operator stack
        while(!operatorStack.isEmpty()) {
            this.stackEvaluate(operandStack, operatorStack.pop());
        }

        // Too many operands in operand stack
        if(operandStack.length!=1) {
            throw new Error("Multiple operands left in stack.");
        }

        return operandStack.top().value;
    }

    /**
     * Evaluates a reference token and returns the numerical result.
     * @param token The ReferenceToken to be evaluated.
     * @param references The lookup object.
     * @returns Returns a number which is the evaluation of the reference.
     * @throws <i>Reference not found</i> exception when the reference is not found in the lookup.
     * @throws <i>Reference does not evaluate to a number</i> exception when the reference does not produce a number.
     * @throws <i>Reference not a function</i> exception when the reference is not specified as a function but is not a function in the lookup object.
     */
    public static evaluateReference( token : DMEReferenceToken, references : any ) : number {
        if(references==null || references==undefined) {
            throw new Error('Null or undefined lookup references.');
        }
        
        let result : number = 0;
        let params : number[] = new Array<number>();
        let isMathLib : boolean = false;

        // Searching for the method/constant in references
        let currentRoot : any = references;
        
        for( let i:number=0; i<token.referenceName.length; i++) {
            currentRoot = currentRoot[token.referenceName[i]];
            if(currentRoot==undefined) {

                // Special case for Math libraray
                if(token.referenceName.length==2 && token.referenceName[0]=='Math') {
                    currentRoot = Math;
                    if(currentRoot[token.referenceName[1]]==undefined) {
                        throw new Error('Reference ' + token.referenceName + ' not found.');        
                    }
                    currentRoot = currentRoot[token.referenceName[1]];
                    isMathLib = true;
                }
                else {
                    throw new Error('Reference ' + token.referenceName + ' not found.');
                }
            }
        }
        
        // If reference is a constant
        if(token.type==ReferenceTokenType.Constant) {
            if(isMathLib) {
                return currentRoot;
            }
            if(typeof currentRoot == 'function') {
                if(typeof currentRoot()!= "number") {
                    throw new Error('Reference:' + token.referenceName + ' does not evaluate to a number.');
                }
                result = currentRoot();
            }
            else if(typeof currentRoot == "number") {
                result = currentRoot;
            }
            else {
                throw new Error('Reference:' + token.referenceName + ' does not evaluate to a number.');
            }
        }
        else if(token.type==ReferenceTokenType.Function){
            
            // Type checking the reference within the object
            if(typeof currentRoot != 'function') {
                throw new Error('Reference:' + token.referenceName + ' is not a function.');
            }

            // Evaluating all reference tokens within the params
            for(let i:number=0; i<token.params.length; i++) {
                for(let j:number=0; j<token.params[i].length; j++) {
                    // Replacing all reference tokens with the evaluated value
                    if(token.params[i][j].type==DMETokenType.Reference) {
                        token.params[i][j] = DMEToken.getInstance(DMETokenType.Operand, DLMathEval.evaluateReference(token.params[i][j].value, references));
                    }
                }
                params.push(DLMathEval.evaluateNativeExpression(token.params[i]));
            }

            if(isMathLib) {
                if(currentRoot.length != params.length) {
                    throw new Error('Incompatible number of arguments for ' + token.referenceName[1] + ' method in Math library.');
                }
                result = currentRoot.length == 2 ? currentRoot(params[0], params[1]) : currentRoot(params[0]);
            }
            else {
                // Calling the function
                result = currentRoot(params);
            }
        }
        
        return result;
    }

    /**
     * Evaluates all reference tokens within the expression and replaces them with a new operand token which is the result.
     * @param exp The tokenized expression, which is the array of tokens.
     * @param references The references to be used (JSON object) for the lookup.
     * @returns Returns a new array of tokens with the replaced reference tokens.
     */
    public static evaluateReferenceTokens( exp : DMEToken[], references : any ) : DMEToken[] {
        let newExp : DMEToken[] = new Array<DMEToken>();

        for(let token of exp) {
            if(token.type==DMETokenType.Reference) {
                try {
                    let newToken : DMEToken = DMEToken.getInstance( DMETokenType.Operand, DLMathEval.evaluateReference(token.value, references));
                    newExp.push(newToken);
                }
                catch(ex) {
                    throw ex;
                }
            }
            else {
                newExp.push(token);
            }
        }
        return newExp;
    }

    /**
     * Evaluates sub-expression of the form (N) or (-N) to N, where N is a number. For (-N), the token result will be -1 * N.value
     * @param exp The ordered array of tokens of the expression.
     * @returns Returns a new expression which does not contain any sub-expression of the form (N) or (-N).
     */
    public static evaluateUnaryOperations( exp : DMEToken[] ) : DMEToken[] {
        let re : DMEToken[] = [];

        for(let i : number = 0; i < exp.length; i++) {
            if(exp[i].type==DMETokenType.OpenParenthesis && i <= exp.length - 4) {
                if(exp[i+1].type==DMETokenType.Operator && exp[i+1].value=='-' && exp[i+2].type==DMETokenType.Operand && exp[i+3].type==DMETokenType.CloseParenthesis) {
                    let temp : DMEToken = new DMEToken();
                    temp.type = DMETokenType.Operand;
                    temp.value = (-1) * exp[i+2].value;
                    re.push(temp);
                    i += 3;
                    continue;
                }
                else{
                    re.push(exp[i]);
                }
            }
            else if(exp[i].type==DMETokenType.OpenParenthesis && i <= exp.length - 3) {
                if(exp[i+1].type==DMETokenType.Operand && exp[i+2].type==DMETokenType.CloseParenthesis) {
                    re.push(exp[i+1]);
                    i += 3;
                    continue;
                }
            }
            else {
                re.push(exp[i]);
            }
        }
        return re;
    }

    /**
     * Gets a numerical value which indicates the precedence of an operator with respect to other operators.
     * @param operator The operator to get the precedence value.
     * @returns Returns the numerical value of the precedence of the operator.
     * @throws <i>Unrecognized operator</i> exception when the character operator is unrecognized..
     */
    public static getOperatorPrecedence( operator : string ) : number {
        switch(operator) {
            case '+':
                return 1;
            case '-':
                return 0;
            case '*':
                return 2;
            case '/':
                return 3;
            case '(':
                return -1;
            case ')':
                return 1000;
            default:
                // Unrecognized operator
                throw new Error('Unrecognized operator.');
        }
    }

    /**
     * Parses contiguous groups of digits within the expression and generates the equivalent float number.
     * @param index The starting index of the sequence of digits.
     * @param chars The array of characters of the expression.
     * @returns Returns a new ProcessingResult object with the index and the resultant number token.
     * @throws <i>Decimal point without succeeding digit(s)</i> exception when a decimal point does not have a digit character following it.
     */
    private static processNumberTokens( index : number, chars : string[]) : ProcessingResult {
        let tempString : string = "";

        // Parsing non-fractional part
        for(; index<chars.length && RegexContainer.Digit.test(chars[index]); index++) {
            tempString += chars[index];
        }
        // Checking if next character is decimal point
        if(index<chars.length-1 && chars[index]==".") {
            tempString += ".";
            index++;
            if(RegexContainer.Digit.test(chars[index])) {
                for(; index<chars.length && RegexContainer.Digit.test(chars[index]); index++) {
                    tempString += chars[index];
                }
            }
            else {
                // No digits found after decimal point 
                throw new Error();    
            }
        }
        else if(index==chars.length-1 && chars[index]==".") {
            // No digits found after decimal point 
            throw new Error('Invalid number token. Decimal point without succeeding digit(s).');
        }

        // Parsing from string to float
        let value : number = 0;
        try {
            value = parseFloat(tempString);
        }
        catch(err) {
            throw err;
        }

        // Token for the number
        let token : DMEToken = new DMEToken();
        token.type = DMETokenType.Operand;
        token.value = value
        let result : ProcessingResult = new ProcessingResult();
        result.index = --index; result.token = token;
        return result;
    }

    /**
     * Extrapolates a ReferenceToken from an expression from the index specified.
     * @param index The index which has the first match for a ReferenceToken within the expression.
     * @param chars The array of characters of the expression.
     * @returns Returns a ProcessingResult object which contains the end index of the reference token as well as the token itself.
     * @throws <i>Index out of range</i> if the index is out of range of the array length.
     * @throws <i>Null or undefined expression</i> if the expression is null of undefined.
     * @throws <i>Invalid reference name</i> if the reference name does not comply with the specified convention.
     * @throws <i>Open parenthesis does not have have closed match</i> if an opening parenthesis does not have a closing parenthesis when end of expression is reached.
     * @throws <i>Mismatching parenthesis found</i> if there exists unequal number of open/close parenthesis.
     * @throws <i>Encountered comma without paramter succeeding it</i> if there no expression is found after a comma is encountered.
     */
    private static processReferenceTokens( index : number, chars : string[] ) : ProcessingResult {
        
        // Index valid check
        if(index < 0 || index > chars.length) {
            throw new Error('Index out of range.');
        }

        // Null check for expression
        if(chars==undefined || chars==null) {
            throw new Error('Null or undefined expression string array.');
        }

        // Obtaining reference name
        let referenceName : string = "";
        let result : ProcessingResult = new ProcessingResult();
        let params : DMEToken[][] = new Array<DMEToken[]>();

        for(; index < chars.length && RegexContainer.ReferenceNameCharacters.test(chars[index]); index++) {
            referenceName += chars[index];
        }

        // Validating reference name
        if(!RegexContainer.ReferenceName.test(referenceName)) {
            throw new Error('Invalid reference name.');
        }

        // validating if next character is open parenthesis
        // if not then it is a constant
        if(chars[index]!='(') {
            result.index = index;
            result.token = DMEToken.getInstance( DMETokenType.Reference, DMEReferenceToken.getInstance(referenceName, [], ReferenceTokenType.Constant));
            return result;
        }
        
        index++;
        // Checking if end of string is reached
        if(index >= chars.length) {
            // End of expression reached without closing parenthesis
            throw new Error('Open parenthesis does not have have closed match at ' + index);
        }

        let pairCount : number = 1;
        let startIndex : number = index;
        for(; index < chars.length && pairCount > 0; index++) {
            if(chars[index]=='(') {
                pairCount++;
            }
            else if(chars[index]==')'){
                pairCount--;
            }
        }
        index--;
        // Mismatching parenthesis found
        if(index >= chars.length && pairCount!=0) {
            throw new Error('Mismatching parenthesis found.');
        }

        // Obtaining the params
        try {
            let isComma : boolean = false;
            for(; startIndex < index; startIndex++) {
                isComma = chars[startIndex]==',';
                if(isComma) {
                    continue;
                }
                let currentParam : SubTokenizerResult = DLMathEval.subTokenizer(startIndex, index, chars, ',');
                params.push(currentParam.tokens);
                startIndex = currentParam.index;

            }
            // Check if last character was comma
            if(isComma) {
                throw new Error('Encountered comma without paramter succeeding it at ' + startIndex);
            }
        }
        catch(ex) {
            throw ex;
        }
        
        result.index = index;
        result.token = DMEToken.getInstance( DMETokenType.Reference, DMEReferenceToken.getInstance(referenceName, params, ReferenceTokenType.Function));
        return result;
    }

    /**
     * Pops two operands from the stack and performs the arithmetic operation as specified by the operator and pushes the result back to the stack.
     * @param operandStack The stack which contains the operand.
     * @param operator The operator token.
     * @throws <i>Not enough operands in operand stack</i>
     */
    private static stackEvaluate( operandStack : Stack<DMEToken>, operator : DMEToken ) : void {
        // Not enough operands
        if(operandStack.length < 2) {
            throw new Error("Not enough operands in operand stack.");
        }
        
        let B : DMEToken = operandStack.pop();
        let A : DMEToken = operandStack.pop();
        let result : DMEToken = new DMEToken();
        result.type = DMETokenType.Operand;
        result.value = this.evaluateBinomial(A, B, operator);
        operandStack.push(result);
    }

    /**
     * Tokenizes a sub-string of the expression from the start index to the end index or till the terminating character is reached, which ever is earlier.
     * @param startIndex The starting index, inclusive, of the expression.
     * @param endIndex The end index, exclusive, of the expression. 
     * @param chars The array of characters of the expression.
     * @param terminatingChar The terminating character to stop tokenization.
     * @returns Returns a SubTokenizerResult.
     * @throws <i>Unrecognized character</i> exception if one of the character does not form part of a valid expression.
     * @throws <i>Transition check failed</i> exception if a sequence of any two characters within the expression renders it invalid.
     */
    private static subTokenizer( startIndex : number, endIndex : number, chars : string[], terminatingChar : string = '' ) : SubTokenizerResult {
        let result : SubTokenizerResult = new SubTokenizerResult();
        let tokens : DMEToken[] = new Array<DMEToken>();

        try {
            while(startIndex < endIndex) {
                
                // Ignoring spaces
                if(chars[startIndex]==' ') {
                    startIndex++;
                    continue;
                }
                let token : DMEToken = new DMEToken();
    
                // If character is a digit
                if(RegexContainer.Digit.test(chars[startIndex])) {
                    let processingResult = DLMathEval.processNumberTokens(startIndex, chars);
                    token = processingResult.token;
                    startIndex = processingResult.index;            
                }
                else if(RegexContainer.ReferenceNameInitial.test(chars[startIndex])) {
                    let processingResult = DLMathEval.processReferenceTokens(startIndex, chars);
                    token = processingResult.token;
                    startIndex = processingResult.index;
                }
                else if(RegexContainer.Operator.test(chars[startIndex])) {
                    token = DMEToken.getInstance(DMETokenType.Operator, chars[startIndex]);
                }
                else if(RegexContainer.ClosingParenthesis.test(chars[startIndex])) {
                    token = DMEToken.getInstance(DMETokenType.CloseParenthesis, chars[startIndex]);
                }
                else if(RegexContainer.OpeningParenthesis.test(chars[startIndex])) {
                    token = DMEToken.getInstance(DMETokenType.OpenParenthesis, chars[startIndex]);
                }
                else {
                    // Unrecognized character
                    throw new Error('Unrecognized character at ' + startIndex);
                }
                
                // Appending generated token to expression array
                tokens.push(token);
                startIndex++;
                if(startIndex < endIndex && chars[startIndex]!=' ') {
                    // Checking for terminating character
                    if(terminatingChar!='' && chars[startIndex]==terminatingChar) {
                        break;
                    }

                    try {
                        // Performing transition check
                        if(!TransitionCheck(token, chars[startIndex])) {
                            throw new Error('Transition check failed at ' + chars[startIndex] + " " + token.type.toString());
                        }   
                    }
                    catch(ex) {
                        throw ex;
                    }
                }
            }
        }
        catch(ex) {
            throw ex;
        }
        
        result.index = --startIndex;
        result.tokens = tokens;
        return result;
    }

    /**
     * Splits (or tokenizes) the string expression into tokens.
     * @param exp The expression to be tokenized
     * @returns Returns an array of tokens.
     * @throws <i>Undefined or null expression string</i>
     */
    public static tokenize( exp : string ) : DMEToken[] {
        
        // If expression string is null or undefined
        if(exp==undefined || exp==null) {
            throw new Error('Undefined or null expression string.');
        }

        try {
            let parsingResult : SubTokenizerResult = DLMathEval.subTokenizer(0, exp.length, exp.split(''), '');
            return parsingResult.tokens;
        }
        catch(err) {
            throw err;
        }
    }
}