'use strict';
window.Slang._mathslang = window.Slang._mathslang || {};
Slang._mathslang.vec = (function() {

    function compare(expected, given) {
        expected = JSON.parse(expected);
        given = JSON.parse(given);
        return JSON.stringify(normalize(expected)) === JSON.stringify(normalize(given));
    }

    function normalize(vec) {
        var length = Math.sqrt(vec.reduce(function(a, e) {
            return a + e * e;
        }, 0));
        return vec.map(function(e) {
            return e / length;
        });
    }
    return {
        compare: compare
    }
})();
