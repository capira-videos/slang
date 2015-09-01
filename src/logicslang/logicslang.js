'use strict';
window.Slang = window.Slang || {};
window.Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn) {
        var lp = new LogicParser(compareFn);
        return lp.eval(expectedValue, givenValue);
    }
};
