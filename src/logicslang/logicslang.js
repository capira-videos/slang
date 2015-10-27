'use strict';
window.Slang = window.Slang || {};
window.Slang.logicslang = {
    // Handles logical operators #or, #and, and #not
    compare: function(expectedValue, givenValue, compareFn, _units) {
        // Replace any @variableName with the variable in givenValue
        if (typeof givenValue == 'object') {
            for (var key in givenValue) {
                var regexp = new RegExp('@' + key, 'g');
                if (expectedValue.exp) {
                    expectedValue.inputExp = expectedValue.inputExp.replace(regexp, givenValue[key]);
                } else {
                    expectedValue = expectedValue.replace(regexp, givenValue[key]);
                }
            }
            return compareFn(expectedValue, expectedValue.inputExp, _units);
        }
        //var lp = new LogicParser(compareFn);
        return compareFn(expectedValue, givenValue, _units);
    },
};
