'use strict';
window.Slang = window.Slang || { };
window.Slang.mathslang = { };
window.Slang.mathslang.compare = function(expectedValue, givenValue) {
	return Slang.logicslang.compare(expectedValue, givenValue, this._compare);
};
window.Slang.mathslang._compare = function(expectedValue, givenValue) {
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
				return Slang._mathslang.match(expectedValue, givenValue);

			case 'identic':
				return Slang._mathslang.matchSyntax(expectedValue, givenValue);

			case 'approx':
				var values = expectedValue.split('#epsilon');
				return Slang._mathslang.matchApprox(values[0], givenValue, values[1]);

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
};


