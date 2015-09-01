LogicParser = function(evalInput) {
    this.evalInput = evalInput;
}

LogicParser.prototype.eval = function(expectedValue, givenValue) {
    this.tokens = this.getTokens(expectedValue);
    this.givenValue = givenValue;
    return this.expression();
}

// Parse string into a set of tokens, where tokens are one of:
// Left paren (, right paren )
// #and, #or, or #not
// values (anything other than the above)

LogicParser.prototype.getTokens = function(input) {
    var tokens = []
    tokens = input.split(/(#and|#or|#not|<|>)/);
    tokens = tokens.map(function(t) {
        return t.trim();
    });
    tokens = tokens.filter(function(t) {
        return t.length > 0;
    })
    
    return tokens;
}

// deal with the logical operators #and, #or, #not
LogicParser.prototype.expression = function() {
    if(this.tokens[0] == '#not') {
        this.tokens.shift();
        return !this.terminal();
    } else {
        var t1 = this.terminal();
        if(this.tokens[0] == '#and' || this.tokens[0] == '#or') {
            var operator = this.tokens.shift()
            var t2 = this.terminal();
            
            if(operator == '#and') {
                return t1 && t2;
            } else {
                return t1 || t2;
            }
        }
        return t1;
    }
}

// handle parens and pass values off for evaluation
LogicParser.prototype.terminal = function() {
    var token = this.tokens.shift();
    if(token == '<') {
        value = this.expression();
        var rightParen = this.tokens.shift(); // remove the following right paren
        if(rightParen != '>') {
            throw 'ERROR: Mismatched parentheses';
        }
        return value;
    } else if (token == '>') {
        throw 'ERROR: Mismatched parentheses';
    } else {
        return this.evalInput(token, this.givenValue)
    }
}