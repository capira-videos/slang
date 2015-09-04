'use strict';
window.Slang = window.Slang || {};
window.Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn, variables) {
    	if (variables) {
    		expectedValue = this.replaceVariables(expectedValue, variables)
    	}
        var lp = new LogicParser(compareFn);
        return lp.compare(expectedValue, givenValue);
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

'use strict';
var LogicParser = function(compareFn) {

    var tokens = [];
    var givenValue = '';
    var error = 'ERROR: Mismatched parentheses';

    this.compare = function(expectedValue, _givenValue) {
        tokens = getTokens(expectedValue);
        givenValue = _givenValue;
        return expression();
    };

    // Parse string into a set of tokens, where tokens are one of:
    // Left paren (, right paren )
    // #and, #or, or #not
    // values (anything other than the above)

    function getTokens(input) {
        var _tokens = [];
        _tokens = input.split(/(#and|#or|#not|<&|&|<|>)/);
        _tokens = _tokens.map(function(t) {
            return t.trim();
        });
        _tokens = _tokens.filter(function(t) {
            return t.length > 0;
        });
        return _tokens;
    }

    // deal with the logical operators #and, #or, #not
    function expression() {
        if (tokens[0] == '#not') {
            tokens.shift();
            return !terminal();
        } else {
            var t1 = terminal();
            if (tokens[0] === '#and' || tokens[0] === '#or') {
                var operator = tokens.shift();
                var t2 = terminal();

                if (operator === '#and') {
                    return t1 && t2;
                } else {
                    return t1 || t2;
                }
            }
            return t1;
        }
    }

    // handle parens and pass values off for evaluation
    function terminal() {
        var token = tokens.shift();
        var value = '';
        if (token == '<') {
            value = expression();
            var rightParen = tokens.shift(); // remove the following right paren
            if (rightParen != '>') {
                throw error;
            }
            return value;
        } else if (token == '<&') {
            var saved = givenValue;
            givenValue = tokens.shift();
            var amp = tokens.shift();
            if (amp != '&') {
                throw error;
            }
            value = expression();
            var rightParen = tokens.shift();
            if (rightParen != '>') {
                throw error;
            }
            givenValue = saved;
            return value;
        } else if (token == '>') {
            throw error;
        } else {
            return compareFn(token, givenValue);
        }
    }
};
