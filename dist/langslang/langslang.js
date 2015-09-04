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

Slang.langslang._damerauLevenshtein = function(a, b) {
    var matrix = [];

    // check the easy cases first
    if (a == b) {
        return 0;
    }
    if (a.length == 0) {
        return b.length
    }
    if (b.length == 0) {
        return a.length
    }

    for (var i = 0; i < a.length + 1; i++) {
        matrix[i] = [];

        for (var j = 0; j < b.length + 1; j++) {
            if (i == 0 || j == 0) {
                matrix[i][j] = Math.max(i, j);
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // insertion
                    matrix[i][j - 1] + 1, // deletion
                    matrix[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1) // substitution
                );

                // transposition
                if (j > 1 && i > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1]) {
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
                }
            }
        }
    }

    return matrix[a.length][b.length];
};
