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
