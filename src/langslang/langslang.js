'use strict';
var Slang = Slang || {};
Slang.langslang = (function() {
    function compare(expectedValue, givenValue) {
        return Slang.logicslang.compare(expectedValue, givenValue, _compare);
    }

    function _compare(expectedValue, givenValue) {

        expectedValue = expectedValue.trim();
        givenValue = givenValue.trim();

        if (expectedValue.indexOf('#') === 0) {
            var prefix = expectedValue.substr(1, expectedValue.indexOf(' ') - 1);
            expectedValue = expectedValue.substr(expectedValue.indexOf(' ') + 1);

            if (prefix === 'typo') {
                return isTypo(toLowerCase(expectedValue), toLowerCase(givenValue));
            } else if (prefix === 'nocase') {
                return toLowerCase(expectedValue) === toLowerCase(givenValue);
            } else if (prefix === 'regex') {
                expectedValue = new RegExp(expectedValue);
                return expectedValue.test(givenValue);
            }
        } else {
            return (expectedValue === givenValue);
        }
    }

    function isTypo(a, b) {
        var dist = Slang.langslang._damerauLevenshtein(a, b);
        // somewhat arbitrary metric
        return (dist < Math.ceil(Math.sqrt(a.length) - 1));
    }

    //this function wrapps String.toLowerCase for minification purposes
    function toLowerCase(a){
        return a.toLowerCase();
    }

    return {
        compare: compare
    };

})();
