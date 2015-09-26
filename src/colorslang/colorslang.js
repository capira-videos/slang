'use strict';
var Slang = Slang || {};
Slang.colorslang = (function() {
    function compare(expected, given) {
        return expected.toLowerCase() === rgbToHex(given).toLowerCase();
    }

    function rgbToHex(c) {
        return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
    }
    /*
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    */
    return {
        compare: compare
    };
})();
