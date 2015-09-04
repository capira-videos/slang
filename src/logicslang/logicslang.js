'use strict';
var Slang = Slang || {};
Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn) {
        var lp = new LogicParser(compareFn);
        return lp.compare(expectedValue, givenValue);
    }
};
