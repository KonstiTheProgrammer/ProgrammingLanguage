import {
    Expression,
    BinaryExpression,
    Identifier,
    Statement,
    Program,
    NumericLiteral,
    VariableDeclaration,
    AssignmentExpression,
    Property,
    ObjectLiteral,
    CallExpression,
    MemberExpression,
    StringLiteral,
    FunctionDeclaration
} from './ast'
import {TokenType, Token} from './lexer'

export class Parser {
    private tokens: Token[] = [];

    private notEOF(): boolean {
        return this.tokens[0].type !== TokenType.EOF;
    }

    private at(): Token {
        return this.tokens[0] as Token;
    }

    private eat(): Token {
        return this.tokens.shift() as Token;
    }

    private parseStatement(): Statement {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVariableDeclaration();
            case TokenType.Function:
                return this.parseFunctionDeclaration();
            default:
                return this.parseExpression();
        }
    }

    private parseVariableDeclaration(): Statement {
        const isConstant = this.eat().type === TokenType.Const;
        const identifier = this.expect(
            TokenType.Identifier,
            "Expected an identifier after 'let' or 'const'"
        ).value;

        let value: Expression | undefined = undefined;

        if (this.at().type === TokenType.Equals) {
            this.eat();
            value = this.parseExpression();
        }

        return {kind: "VariableDeclaration", isConstant, identifier, value} as VariableDeclaration;
    }

    private parseExpression(): Expression {
        return this.parseAssignmentExpression();
    }

    public produceAst(tokens: Token[]): Program {
        this.tokens = tokens;
        const program: Program = {
            kind: 'Program',
            body: []
        }

        while (this.notEOF()) {
            program.body.push(this.parseStatement());
        }

        this.tokens = tokens;

        return program;
    }

    private parsePrimaryExpression(): Expression {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.eat().value} as Identifier;
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.eat().value)} as NumericLiteral;
            case TokenType.String:
                return {kind: "StringLiteral", value: this.eat().value} as StringLiteral;
            case TokenType.OpenParen: {
                this.eat();
                const expr = this.parseExpression();
                this.expect(TokenType.CloseParen, "Expected a closing parenthesis");
                return expr;
            }
            default:
                throw new Error(`Unexpected token: ${this.at().value}`);
        }
    }

    private parseAdditiveExpression(): Expression {
        let left = this.parseMultiplicativeExpression();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parseMultiplicativeExpression();
            left = {kind: "BinaryExpression", left, right, operator} as BinaryExpression;
        }

        return left;
    }

    private parseAssignmentExpression(): Expression {
        const left = this.parseObjectExpression();

        if (this.at().type === TokenType.Equals) {
            this.eat();
            const right = this.parseAssignmentExpression();
            return {kind: "AssignmentExpression", assignee: left, value: right} as AssignmentExpression;
        }

        return left;
    }


    private parseMultiplicativeExpression(): Expression {
        let left = this.parseCallMemberExpression();

        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parseCallMemberExpression();
            left = {kind: "BinaryExpression", left, right, operator} as BinaryExpression;
        }

        return left;
    }

    private expect(type: TokenType, err: any) {
        const token = this.tokens.shift() as Token;
        if (!token || token.type != type) {
            throw new Error("Parser Error\n" + err + token + " - Expecting: " + type);
        }
        return token;
    }

    private parseObjectExpression(): Expression {
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parseAdditiveExpression();
        }

        this.eat();
        const properties = new Array<Property>()

        while (this.notEOF() && this.at().type !== TokenType.CloseBrace) {
            const key = this.expect(TokenType.Identifier, "Expected an identijfier as a key").value;

            if (this.at().type === TokenType.Comma) {
                this.eat();
                properties.push({key, kind: "Property"} as Property);
                continue;
            }
            if (this.at().type === TokenType.CloseBracket) {
                properties.push({key, kind: "Property"} as Property);
                continue;
            }

            this.expect(TokenType.Colon, "Expected a colon after the key");
            const value = this.parseExpression();

            properties.push({key, value, kind: "Property"} as Property);

            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Expected a closing brace or comma");
            }
        }

        this.expect(TokenType.CloseBrace, "Expected a closing brace");
        return {kind: "ObjectLiteral", properties} as ObjectLiteral;
    }

    private parseCallMemberExpression(): Expression {
        const member = this.parseMemberExpression();

        if (this.at().type == TokenType.OpenParen) {
            return this.parseCallExpression(member);
        }

        return member;
    }

    private parseCallExpression(caller: Expression): Expression {
        let callExpression: CallExpression = {kind: "CallExpression", caller, args: this.parseArguments()};

        if (this.at().type == TokenType.OpenParen) {
            callExpression = this.parseCallExpression(callExpression) as CallExpression;
        }

        return callExpression;
    }

    private parseArguments(): Expression[] {
        this.expect(TokenType.OpenParen, "Expected an opening parenthesis");
        const args = this.at().type == TokenType.CloseParen ? [] : this.parseArgumentsList();
        this.expect(TokenType.CloseParen, "Expected a closing parenthesis");
        return args;
    }

    private parseArgumentsList(): Expression[] {
        const args = [this.parseAssignmentExpression()];

        while (this.notEOF() && this.at().type === TokenType.Comma && this.eat()) {
            args.push(this.parseAssignmentExpression());
        }

        return args;
    }

    private parseMemberExpression(): Expression {
        let obj = this.parsePrimaryExpression();

        while (this.at().type === TokenType.Dot || this.at().type === TokenType.OpenBracket) {
            const operator = this.eat();
            let property: Expression;
            let computed: boolean;

            if (operator.type == TokenType.Dot) {
                computed = false;
                property = this.parsePrimaryExpression();
                if (property.kind !== "Identifier")
                    throw new Error("Expected an identifier");
            } else {
                computed = true;
                property = this.parseExpression();
                this.expect(TokenType.CloseBracket, "Expected a closing bracket");
            }

            obj = {kind: "MemberExpression", object: obj, property, computed} as MemberExpression;
        }

        return obj;
    }

    private parseStatementList(): Expression[] {
        const args = []
        this.expect(TokenType.OpenBrace, "Expected an opening parenthesis");
        while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
            args.push(this.parseStatement());
        }
        this.expect(TokenType.CloseBrace, "Expected a closing parenthesis");
        return args;
    }

    public parseFunctionDeclaration(): Expression {
        this.eat();
        const name = this.expect(TokenType.Identifier, "Expected an identifier").value;
        this.expect(TokenType.OpenParen, "Expected an opening parenthesis");

        const functionArguments = [];

        while (this.at().type !== TokenType.CloseParen) {
            const arg = this.expect(TokenType.Identifier, "Expected an identifier").value;
            functionArguments.push(arg);
            if (this.at().type === TokenType.Comma) this.eat();
        }

        this.expect(TokenType.CloseParen, "Expected a closing parenthesis");

        return {
            kind: "FunctionDeclaration",
            name,
            args: functionArguments,
            body: this.parseStatementList()
        } as FunctionDeclaration;
    }

}

//Order of operations
//Assignment
// Object
// AddativeExpression
// MultiplicativeExpression
// CallMemberExpression
// MemberExpression
// PrimaryExpression