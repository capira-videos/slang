'use strict';
window.Slang = window.Slang || {};
window.Slang.mathslang = {
    compare: function(expectedValue, givenValue, variables) {
        return Slang.logicslang.compare(expectedValue, givenValue, this._compare, variables);
    },
    _compare: function(expectedValue, givenValue) {
        //Inputs could be a Number so we convert them to String:
        givenValue = givenValue + '';
        expectedValue = expectedValue + '';
        var that = this;
        givenValue = givenValue.trim();
        expectedValue = expectedValue.trim();
        if (expectedValue.indexOf('#') === 0) {
            var prefix = expectedValue.substr(1, expectedValue.indexOf(' ') - 1);
            expectedValue = expectedValue.substr(expectedValue.indexOf(' ') + 1);
            switch (prefix) {
                case 'equals':
                    return match(expectedValue, givenValue);

                case 'identic':
                    return matchSyntax(expectedValue, givenValue);

                case 'approx':
                    var values = expectedValue.split('#epsilon');
                    return matchApprox(values[0], givenValue, values[1]);

                case 'lt':
                    return Number.parseFloat(givenValue) < Number.parseFloat(expectedValue);

                case 'leq':
                    return Number.parseFloat(givenValue) <= Number.parseFloat(expectedValue);

                case 'gt':
                    return Number.parseFloat(givenValue) > Number.parseFloat(expectedValue);

                case 'geq':
                    return Number.parseFloat(givenValue) >= Number.parseFloat(expectedValue);

                default:
                    return (expectedValue === givenValue);
            }

        }
    }
};


