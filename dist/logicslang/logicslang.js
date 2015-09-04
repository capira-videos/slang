'use strict';
window.Slang = window.Slang || {};
window.Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn, variables) {
    	if (variables) {
    		expectedValue = this.replaceVariables(expectedValue, variables)
    	}
        var lp = new LogicParser(compareFn);
        return lp.eval(expectedValue, givenValue);
    },

    // variables is an object of key -> value pairs
    // replaces any @variable_name 
    replaceVariables: function(expectedValue, variables) {
    	for(var key in variables) {
    		var regexp = new RegExp("@" + key, "g");
    		expectedValue = expectedValue.replace(regexp, variables[key]);
    	}
    	return expectedValue;
    }
};

window.LogicParser = function(compareFn) {
    this.compareFn = compareFn;


    this.eval = function(expectedValue, givenValue) {
        this.tokens = this.getTokens(expectedValue);
        this.givenValue = givenValue;
        return this.expression();
    };

    // Parse string into a set of tokens, where tokens are one of:
    // Left paren (, right paren )
    // #and, #or, or #not
    // values (anything other than the above)

    this.getTokens = function(input) {
        var tokens = []
        tokens = input.split(/(#and|#or|#not|#var|<&|&|<|>)/);
        tokens = tokens.map(function(t) {
            return t.trim();
        });
        tokens = tokens.filter(function(t) {
            return t.length > 0;
        })

        return tokens;
    };

    // deal with the logical operators #and, #or, #not
    this.expression = function() {
        if (this.tokens[0] == '#not') {
            this.tokens.shift();
            return !this.terminal();
        } else {
            var t1 = this.terminal();
            if (this.tokens[0] == '#and' || this.tokens[0] == '#or') {
                var operator = this.tokens.shift()
                var t2 = this.terminal();

                if (operator == '#and') {
                    return t1 && t2;
                } else {
                    return t1 || t2;
                }
            }
            return t1;
        }
    };

    // handle parens and pass values off for evaluation
    this.terminal = function() {
        var token = this.tokens.shift();
        if (token == '<') {
            value = this.expression();
            var rightParen = this.tokens.shift(); // remove the following right paren
            if (rightParen != '>') {
                throw 'ERROR: Mismatched parentheses';
            }
            return value;
        } else if (token == '<&') {
            var saved = this.givenValue;
            this.givenValue = this.tokens.shift();
            var amp = this.tokens.shift();
            if (amp != '&') {
                throw 'ERROR: Mismatched &';
            }
            value = this.expression();
            var rightParen = this.tokens.shift();
            if (rightParen != '>') {
                throw 'ERROR: Mismatched parentheses';
            }
            this.givenValue = saved;
            return value;
        } else if (token == '>') {
            throw 'ERROR: Mismatched parentheses';
        } else {
            return this.compareFn(token, this.givenValue)
        }
    };
};
