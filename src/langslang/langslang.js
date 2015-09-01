'use strict';
window.Slang = window.Slang || {};
window.Slang.langslang = {
    compare:function(expectedValue,givenValue){
        return Slang.logicslang.compare(expectedValue,givenValue,this._compare);
    },
    _compare: function(expectedValue, givenValue) {

        expectedValue = expectedValue.trim();
        givenValue = givenValue.trim();

        if (expectedValue.indexOf('#') == 0) {
            var prefix = expectedValue.substr(1, expectedValue.indexOf(' ') - 1);
            expectedValue = expectedValue.substr(expectedValue.indexOf(' ') + 1);

            if (prefix == 'typo') {
                return this._isTypo(expectedValue.toLowerCase(), givenValue.toLowerCase());
            } else if (prefix == 'nocase') {
                return expectedValue.toLowerCase() == givenValue.toLowerCase();
            } else if (prefix == 'regex') {
                expectedValue = new RegExp(expectedValue);
                return expectedValue.test(givenValue);
            }
        } else {
            return (expectedValue == givenValue);
        }
    },

    _isTypo: function(a, b) {
        var dist = damerauLevenshtein(a, b);
        // somewhat arbitrary metric
        if (dist < Math.ceil(Math.sqrt(a.length) - 1)) {
            return true;
        }
        return false;
    }

};
