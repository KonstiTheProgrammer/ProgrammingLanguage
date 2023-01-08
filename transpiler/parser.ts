import {
    Expression,
    BinaryExpression,
    Identifier,
    Statement,
    Program,
    NumericLiteral,
    VariableDeclaration, AssignmentExpression, Property, ObjectLiteral
} from './ast.ts'
import {tokenize, TokenType, Token} from './lexer.ts'

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

    private parseStmt(): Statement {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVariableDeclaration();
            default:
                return this.parseExpr();
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
            value = this.parseExpr();
        }

        return {kind: "VariableDeclaration", isConstant, identifier, value} as VariableDeclaration;
    }

    private parseExpr(): Expression {
        return this.parseAssignmentExpression();
    }

    public produceAst(tokens: Token[]): Program {
        this.tokens = tokens;
        const program: Program = {
            kind: 'Program',
            body: []
        }

        while (this.notEOF()) {
            program.body.push(this.parseStmt());
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
            case TokenType.OpenParen: {
                this.eat();
                const expr = this.parseExpr();
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
        const left = this.parsePrimaryExpression();

        if (this.at().type === TokenType.Equals) {
            this.eat();
            const right = this.parseAssignmentExpression();
            return {kind: "AssignmentExpression", assignee: left, value: right} as AssignmentExpression;
        }

        return left;
    }


    private parseMultiplicativeExpression(): Expression {
        let left = this.parsePrimaryExpression();

        while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parsePrimaryExpression();
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
            const value = this.parseExpr();

            properties.push({key, value, kind: "Property"} as Property);

            if (this.at().type === TokenType.CloseBrace) {
                this.expect(TokenType.CloseBrace, "Expected a closing brace");
            }
        }

        this.expect(TokenType.CloseBrace, "Expected a closing brace");
        return {kind: "ObjectExpression", properties} as ObjectLiteral;
    }
}