'use strict';
window.Slang = window.Slang || {};
window.Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn, _units) {
    	// Replace any @variableName with the variable in givenValue
    	if (typeof givenValue == "object") {
    		for(var key in givenValue) {
	    		var regexp = new RegExp("@" + key, "g");
	    		expectedValue = expectedValue.replace(regexp, givenValue[key]);
    		}
    	}
        var lp = new LogicParser(compareFn);
        return lp.compare(expectedValue, givenValue, _units);
    },
};
