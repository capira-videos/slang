'use strict';
window.Capira = window.Capira || {};
window.Capira.Logicslang = {
	// Handles logical operators #or, #and, and #not
	evalLogic: function(expectedValue, givenValue) {
		
		var lp = new LogicParser(this.matchPair);
		return lp.eval(expectedValue, givenValue);
	}
};
