'use strict';
var Slang = Slang || {};
Slang.hausdorffslang = (function() {

    function compare(X, Y, translateX, translateY, scale) {
        var Z = _normalize(X, Y, translateX, translateY, scale);
        return 1 - Math.max(_maxEuclideanDistance(Z.X, Z.Y), _maxEuclideanDistance(Z.Y, Z.X));
    }

    function _euclideanDistance(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function _minEuclideanDistance(a, B) {
        return B.reduce(function(akku, curr) {
            var d = _euclideanDistance(a, curr);
            return akku > d ? d : akku;
        }, Infinity);
    }

    function _maxEuclideanDistance(A, B) {
        return A.reduce(function(akku, curr) {
            var dmin = _minEuclideanDistance(curr, B);
            return akku < dmin ? dmin : akku;
        }, 0);
    }

    function _calcRelativeOrigin(A) {
        var origin = A.reduce(function(akku, curr) {
            return {
                x0: akku.x0 + curr.x,
                y0: akku.y0 + curr.y
            };
        }, {
            x0: 0,
            y0: 0
        });
        origin.x0 /= A.length;
        origin.y0 /= A.length;
        return origin;
    }

    function _centerSet(A, origin, translateX, translateY) {
        var x0 = translateX ? origin.x0 : 0;
        var y0 = translateY ? origin.y0 : 0;
        return A.map(function(c) {
            return {
                x: c.x - x0,
                y: c.y - y0
            };
        });
    }

    function _calcBoundingBox(A) {
        return A.reduce(function(box, c) {
            return {
                xmax: Math.max(c.x, box.xmax),
                xmin: Math.min(c.x, box.xmin),
                ymax: Math.max(c.y, box.ymax),
                ymin: Math.min(c.y, box.ymin)
            }
        }, {
            xmax: -Infinity,
            ymax: -Infinity,
            xmin: Infinity,
            ymin: Infinity
        });
    }

    function _boundingBoxSet(B, boxA, boxB, origin) {
        var xdistA = Math.abs(boxA.xmax - boxA.xmin);
        var xdistB = Math.abs(boxB.xmax - boxB.xmin);
        var ydistA = Math.abs(boxA.ymax - boxA.ymin);
        var ydistB = Math.abs(boxB.ymax - boxB.ymin);
        var xf = xdistB / xdistA;
        var yf = ydistB / ydistA;
        var scalingFactor = 2 * xf * yf / (xf + yf);
        return B.map(function(c) {
            return {
                x: origin.x0 + (origin.x0 - c.x) / scalingFactor,
                y: origin.y0 + (origin.y0 - c.y) / scalingFactor
            };
        });
    }

    function _normalize(A, B, translateX, translateY, scale) {
        if (translateX || translateY || scale) {

            var originA = _calcRelativeOrigin(A);
            var originB = _calcRelativeOrigin(B);

            if (scale) {
                var boxA = _calcBoundingBox(A);
                var boxB = _calcBoundingBox(B);
                B = _boundingBoxSet(B, boxA, boxB, originB);
            }

            if (translateX || translateY) {
                A = _centerSet(A, originA, translateX, translateY);
                B = _centerSet(B, originB, translateX, translateY);
            }

        }

        return {
            X: A,
            Y: B
        };
    }

    return {
        compare: compare
    };
})();
