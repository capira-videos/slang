
'use strict';
window.Capira = window.Capira || {};
window.Capira.ColorLogic = {
    matchColors: function(expected, given) {
        console.log(this.rgbToHex(given));
        return expected === this.rgbToHex(given);
    },
    _hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    rgbToHex: function(c) {
        return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1);
    }
};


"use strict";window.Capira=window.Capira||{},window.Capira.ColorLogic={matchColors:function(r,o){return console.log(this.rgbToHex(o)),r===this.rgbToHex(o)},_hexToRgb:function(r){var o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(r);return o?{r:parseInt(o[1],16),g:parseInt(o[2],16),b:parseInt(o[3],16)}:null},rgbToHex:function(r){return"#"+((1<<24)+(r[0]<<16)+(r[1]<<8)+r[2]).toString(16).slice(1)}};
'use strict';
window.Capira = window.Capira || {};
window.Capira.Hausdorff = {


    evalInput: function(X, Y, translateX, translateY, scale) {
        var Z = this._normalize(X, Y, translateX, translateY, scale);
        return 1 - Math.max(this._maxeuclideanDistance(Z.X, Z.Y), this._maxeuclideanDistance(Z.Y, Z.X));
    },

    _euclideanDistance: function(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    _minEuclideanDistance: function(a, B) {
        var that = this;
        return B.reduce(function(akku, curr) {
            var d = that._euclideanDistance(a, curr);
            return akku > d ? d : akku;
        }, Infinity);
    },

    _maxeuclideanDistance: function(A, B) {
        var that = this;
        return A.reduce(function(akku, curr) {
            var dmin = that._minEuclideanDistance(curr, B);
            return akku < dmin ? dmin : akku;
        }, 0);
    },


    _calcRelativeOrigin: function(A) {
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
    },

    _centerSet: function(A, origin, translateX, translateY) {
        var x0 = translateX ? origin.x0 : 0;
        var y0 = translateY ? origin.y0 : 0;
        return A.map(function(c) {
            return {
                x: c.x - x0,
                y: c.y - y0
            }
        });
    },

    _calcBoundingBox: function(A) {
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
        })
    },

    _boundingBoxSet: function(B, boxA, boxB, origin) {
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
            }
        })
    },

    _normalize: function(A, B, translateX, translateY, scale) {
        if (translateX || translateY || scale) {

            var originA = this._calcRelativeOrigin(A);
            var originB = this._calcRelativeOrigin(B);

            if (scale) {
                var boxA = this._calcBoundingBox(A);
                var boxB = this._calcBoundingBox(B);
                B = this._boundingBoxSet(B, boxA, boxB, originB);
            }

            if (translateX || translateY) {
                A = this._centerSet(A, originA, translateX, translateY);
                B = this._centerSet(B, originB, translateX, translateY);
            }

        }

        return {
            X: A,
            Y: B
        };
    }
};

"use strict";window.Capira=window.Capira||{},window.Capira.Hausdorff={evalInput:function(n,i,a,t,e){var r=this._normalize(n,i,a,t,e);return 1-Math.max(this._maxeuclideanDistance(r.X,r.Y),this._maxeuclideanDistance(r.Y,r.X))},_euclideanDistance:function(n,i){var a=n.x-i.x,t=n.y-i.y;return Math.sqrt(a*a+t*t)},_minEuclideanDistance:function(n,i){var a=this;return i.reduce(function(i,t){var e=a._euclideanDistance(n,t);return i>e?e:i},1/0)},_maxeuclideanDistance:function(n,i){var a=this;return n.reduce(function(n,t){var e=a._minEuclideanDistance(t,i);return e>n?e:n},0)},_calcRelativeOrigin:function(n){var i=n.reduce(function(n,i){return{x0:n.x0+i.x,y0:n.y0+i.y}},{x0:0,y0:0});return i.x0/=n.length,i.y0/=n.length,i},_centerSet:function(n,i,a,t){var e=a?i.x0:0,r=t?i.y0:0;return n.map(function(n){return{x:n.x-e,y:n.y-r}})},_calcBoundingBox:function(n){return n.reduce(function(n,i){return{xmax:Math.max(i.x,n.xmax),xmin:Math.min(i.x,n.xmin),ymax:Math.max(i.y,n.ymax),ymin:Math.min(i.y,n.ymin)}},{xmax:-(1/0),ymax:-(1/0),xmin:1/0,ymin:1/0})},_boundingBoxSet:function(n,i,a,t){var e=Math.abs(i.xmax-i.xmin),r=Math.abs(a.xmax-a.xmin),c=Math.abs(i.ymax-i.ymin),u=Math.abs(a.ymax-a.ymin),x=r/e,m=u/c,o=2*x*m/(x+m);return n.map(function(n){return{x:t.x0+(t.x0-n.x)/o,y:t.y0+(t.y0-n.y)/o}})},_normalize:function(n,i,a,t,e){if(a||t||e){var r=this._calcRelativeOrigin(n),c=this._calcRelativeOrigin(i);if(e){var u=this._calcBoundingBox(n),x=this._calcBoundingBox(i);i=this._boundingBoxSet(i,u,x,c)}(a||t)&&(n=this._centerSet(n,r,a,t),i=this._centerSet(i,c,a,t))}return{X:n,Y:i}}};
'use strict';
window.Capira = window.Capira || {};
window.Capira.Langslang = {
    matchPair: function(expectedValue, givenValue) {

        expectedValue = expectedValue.trim();
        givenValue = givenValue.trim();

        if (expectedValue.indexOf("#") == 0) {
            var prefix = expectedValue.substr(1, expectedValue.indexOf(' ') - 1);
            expectedValue = expectedValue.substr(expectedValue.indexOf(' ') + 1);

            if (prefix == "typo") {
                return isTypo(expectedValue.toLowerCase(), givenValue.toLowerCase());
            } else if (prefix == "nocase") {
                return expectedValue.toLowerCase() == givenValue.toLowerCase();
            } else if (prefix == "regex") {
                expectedValue = new RegExp(expectedValue);
                return expectedValue.test(givenValue);
            }
        } else {
            return (expectedValue == givenValue);
        }
    },

    isTypo: function(a, b) {
        var dist = damerauLevenshtein(a, b);
        // somewhat arbitrary metric
        if (dist < Math.ceil(Math.sqrt(a.length) - 1)) {
            return true;
        }
        return false;
    }

};

function damerauLevenshtein(a, b) {
    var matrix = []
    
    // check the easy cases first
    if(a == b) {
        return 0;
    }
    if(a.length == 0) {
        return b.length
    }
    if(b.length == 0) {
        return a.length
    }
    
    for(var i = 0; i < a.length + 1; i++) {
        matrix[i] = [];
        
        for(var j = 0; j < b.length + 1; j++) {
            if(i == 0 || j == 0) {
                matrix[i][j] = Math.max(i, j);
            } else {            
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1, // insertion
                    matrix[i][j-1] + 1, // deletion
                    matrix[i-1][j-1] + (a[i-1] == b[j-1]? 0 : 1) // substitution
                );
            
                // transposition
                if(j > 1 && i > 1 && a[i-1] == b[j-2] && a[i-2] == b[j-1]) {
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i-2][j-2] + 1);
                }
            }
        }
    }
    
    return matrix[a.length][b.length];
}

"use strict";function damerauLevenshtein(e,t){var n=[];if(e==t)return 0;if(0==e.length)return t.length;if(0==t.length)return e.length;for(var r=0;r<e.length+1;r++){n[r]=[];for(var a=0;a<t.length+1;a++)0==r||0==a?n[r][a]=Math.max(r,a):(n[r][a]=Math.min(n[r-1][a]+1,n[r][a-1]+1,n[r-1][a-1]+(e[r-1]==t[a-1]?0:1)),a>1&&r>1&&e[r-1]==t[a-2]&&e[r-2]==t[a-1]&&(n[r][a]=Math.min(n[r][a],n[r-2][a-2]+1)))}return n[e.length][t.length]}window.Capira=window.Capira||{},window.Capira.Langslang={matchPair:function(e,t){if(e=e.trim(),t=t.trim(),0!=e.indexOf("#"))return e==t;var n=e.substr(1,e.indexOf(" ")-1);return e=e.substr(e.indexOf(" ")+1),"typo"==n?isTypo(e.toLowerCase(),t.toLowerCase()):"nocase"==n?e.toLowerCase()==t.toLowerCase():"regex"==n?(e=new RegExp(e),e.test(t)):void 0},isTypo:function(e,t){var n=damerauLevenshtein(e,t);return n<Math.ceil(Math.sqrt(e.length)-1)?!0:!1}};
'use strict';
window.Capira = window.Capira || {};
window.Capira.Logicslang = {
	// Handles logical operators #or, #and, and #not
	evalLogic: function(expectedValue, givenValue) {
		
		var lp = new LogicParser(this.matchPair);
		return lp.eval(expectedValue, givenValue);
	}
};

LogicParser = function(evalInput) {
    this.evalInput = evalInput;
}

LogicParser.prototype.eval = function(expectedValue, givenValue) {
    this.tokens = this.getTokens(expectedValue);
    this.givenValue = givenValue;
    return this.expression();
}

// Parse string into a set of tokens, where tokens are one of:
// Left paren (, right paren )
// #and, #or, or #not
// values (anything other than the above)

LogicParser.prototype.getTokens = function(input) {
    var tokens = []
    tokens = input.split(/(#and|#or|#not|<|>)/);
    tokens = tokens.map(function(t) {
        return t.trim();
    });
    tokens = tokens.filter(function(t) {
        return t.length > 0;
    })
    
    return tokens;
}

// deal with the logical operators #and, #or, #not
LogicParser.prototype.expression = function() {
    if(this.tokens[0] == '#not') {
        this.tokens.shift();
        return !this.terminal();
    } else {
        var t1 = this.terminal();
        if(this.tokens[0] == '#and' || this.tokens[0] == '#or') {
            var operator = this.tokens.shift()
            var t2 = this.terminal();
            
            if(operator == '#and') {
                return t1 && t2;
            } else {
                return t1 || t2;
            }
        }
        return t1;
    }
}

// handle parens and pass values off for evaluation
LogicParser.prototype.terminal = function() {
    var token = this.tokens.shift();
    if(token == '<') {
        value = this.expression();
        var rightParen = this.tokens.shift(); // remove the following right paren
        if(rightParen != '>') {
            throw 'ERROR: Mismatched parentheses';
        }
        return value;
    } else if (token == '>') {
        throw 'ERROR: Mismatched parentheses';
    } else {
        return this.evalInput(token, this.givenValue)
    }
}
"use strict";window.Capira=window.Capira||{},window.Capira.Logicslang={evalLogic:function(t,i){var e=new LogicParser(this.matchPair);return e.eval(t,i)}},LogicParser=function(t){this.evalInput=t},LogicParser.prototype.eval=function(t,i){return this.tokens=this.getTokens(t),this.givenValue=i,this.expression()},LogicParser.prototype.getTokens=function(t){var i=[];return i=t.split(/(#and|#or|#not|<|>)/),i=i.map(function(t){return t.trim()}),i=i.filter(function(t){return t.length>0})},LogicParser.prototype.expression=function(){if("#not"==this.tokens[0])return this.tokens.shift(),!this.terminal();var t=this.terminal();if("#and"==this.tokens[0]||"#or"==this.tokens[0]){var i=this.tokens.shift(),e=this.terminal();return"#and"==i?t&&e:t||e}return t},LogicParser.prototype.terminal=function(){var t=this.tokens.shift();if("<"==t){value=this.expression();var i=this.tokens.shift();if(">"!=i)throw"ERROR: Mismatched parentheses";return value}if(">"==t)throw"ERROR: Mismatched parentheses";return this.evalInput(t,this.givenValue)};
'use strict';
window.Capira = window.Capira || {};
window.Capira.Mathslang = {
    matchPair: function(expectedValue, givenValue) {
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

/**
	class `Imag' is the imaginary part of terms
	required by term representers:
	- `Syntax'
	- `Seman'
**/
function Imag() {};
/**STRUCT**/
// struct I represents an imaginary
function I() {}
/**OPERATOR**/
// I -> I
Imag.sort = function(i0) {
	var ia = new I();
	Object.keys(i0).sort(
		function(a, b){ return a.charCodeAt(0)-b.charCodeAt(0); }
	).forEach(
		function(k){ ia[k]=i0[k]; }
	);
	return ia;
};
// I^2 -> void
Imag.insert = function(a, i) {
	Object.keys(i).forEach(function(k) {
		if(!a[k])	a[k] = i[k];
		else		a[k]+= i[k];
		if(!a[k])	delete a[k];
	});
};
// I -> void
Imag.clear = function(a) {
	Object.keys(a).forEach(function(k){ delete a[k]; });
};
// I x number -> void
Imag.pow = function(a, x) {
	Object.keys(a).forEach(function(k) {
		if(!x)	delete a[k];
		else	a[k] *= x;
	});
};
// I^2 -> bool
Imag.akin = function(i0, i1) {
	return Object.keys(i0).toString() == Object.keys(i1).toString();
};
// I^2 -> bool
Imag.equals = function(i0, i1) {
	/*console.log(JSON.stringify(i0)+" == "+JSON.stringify(i1)+
				" => "+(JSON.stringify(i0)==JSON.stringify(i1)));*/
	return JSON.stringify(i0) == JSON.stringify(i1);
};
// I -> bool
Imag.empty = function(i0) { return Object.keys(i0).length == 0; };
// I^2 -> number
Imag.sortFunc = function(i0, i1) { /*return Imag.sortValue(a.imag)-Imag.sortValue(b.imag);*/
	var keys0 = Object.keys(i0);
	var keys1 = Object.keys(i1);
	var times = Math.min(keys0.length, keys1.length);
	for(var i = 0; i < times; i++)
		if(keys0[i] < keys1[i]) return -1; else
		if(keys0[i] > keys1[i]) return 1;
	var delta = keys0.length - keys1.length;
	if(delta) return delta;
	for(var i = 0; i < times; i++) {
		delta = i0[keys0[i]] - i1[keys1[i]];
		if(delta) return delta;
	} return 0;
};
// string^2 -> number
Imag.strSortFunc = function(a, b) {
	var times = Math.min(a.length, b.length);
	for(var i = 0; i < times; i++)
		if(a[i] < b[i]) return -1; else
		if(a[i] > b[i]) return 1;
	return a.length - b.length;
};
// string -> string
Imag.strSort = function(str) {
	return str.split('').sort(function(a, b) {
		return a.charCodeAt(0) - b.charCodeAt(0); }
	).reduce(function(a, c){ return a + c; }, '');
};
// string -> I
Imag.strParse = function(str) {
	var ri = new I;
	for(var i = 0; i < str.length; i++) {
		var c = str[i];
		if(ri[c])	ri[c]++;
		else		ri[c]=1;
	}
	return ri;
};
// string -> number
Imag.strValue = function(str) {
	var a = 1;
	for(var i = 0; i < str.length; i++)
		a *= str.charCodeAt(0);
	return a;
};
// I -> number
Imag.len = function(i) { return Object.keys(i).length; };
// I -> I
Imag.clone = function(i) {
	return Object.keys(i).reduce(function(a, k) {
		a[k] = i[k];
		return a;
	}, new I);
};
// I -> string
Imag.string = function(i) {
	return Object.keys(i).reduce(function(a, k) {
		var v = i[k];
		return a + (v==1 ? k : k+'^'+v);
	}, '');
}
/**
	class Lex parses string into tokens
	included by `Synta'
**/
function Lex() {};
// flags of token
Lex.F =
{
	O : 0,	// OPERATOR - IN THE END ONLY +/-
	E : 1,	// OPERATOR - POW `^'
	X : 2,	// IDENTIFIER
	N : 3,	// NUMBER
	
	//K : 6,	// KEYWORD
	L : 7	// POTENTIAL TERM - NEED TO BECOME LEXED
};
// single token
Lex.T = function(f, c)
{
	this.flag = f;
	this.code = c;
	this.inv = false; // O(+) => O(-) | X/N(_) => _^-1
};
// grammar
Lex.G = function(plu, exp)
{
	this.exp = exp;
	this.plu = plu;
	this.test = function(c){ return this.exp.test(c); }
};
// space gramar
Lex.SPAC = new Lex.G(true, /^\s$/);
// bracket grammar
Lex.BRAC =
[
	new Lex.G(false, /^\(|\[|\{$/),
	new Lex.G(false, /^\)|\]|\}$/),
];
// token grammar
Lex.GRAM =
[
	new Lex.G(false, /^\+|\-|\*|\/$/),
	new Lex.G(false, /^\^$/),
	new Lex.G(false, /^[a-zA-Z]$/),
	new Lex.G(true, /^[0-9]|\,|\.$/),

];
Lex.prep = function(x) // String -> String
{
	x = x.replace(/²/g, "^2");
	x = x.replace(/³/g, "^3");
	x = x.replace(/\u00B2/g, "^2");
	x = x.replace(/\u00B3/g, "^3");
	x = x.replace(/,/g, ".");
	return x;
};
Lex.iter = function(x) // String -> Lex.T[]
{
	var r = [];
	var q = this.prep(x).split('');
	while(q.length > 0)
	{
		var flag = 0;
		var code = '';
		if(this.SPAC.test(q[0]))
			do q.shift(); while(this.SPAC.test(q[0]));
		else if(this.BRAC[0].test(q[0]))
		{
			q.shift();
			code = '';
			flag = this.F.L;
			var lvl = 1;
			var chr = '';
			while(lvl > 0)
			{
				code += chr;
				if(q.length == 0)
					throw ')';
					
				chr = q.shift();
				lvl +=	this.BRAC[0].test(chr) ? 1 :
						this.BRAC[1].test(chr) ?-1 : 0;
			}
			r.push(new this.T(flag, code));
		}
		else
		{
			while(flag < this.GRAM.length)
			{
				var g = this.GRAM[flag];
				if(g.test(q[0])) do
					code = code.concat(q.shift());
				while(g.plu && g.test(q[0]));
					
				if(code.length > 0)
				{
					r.push(new this.T(flag, code));
					flag = this.GRAM.length
				}
				else
					flag++;
			}
			if(code.length == 0)
				throw q.shift();
		}
	}
	return this.oper(r);
};
Lex.oper = function(x) // Lex.T[] -> Lex.T[]
{
	var r = [];
	var inv = false;
	for(var i in x) {
		if(x[i].flag == this.F.O) switch(x[i].code) {
			case "-":
				x[i].inv = !x[i].inv;
			case "+":
				break;
			case "/":
				inv = true;
			case "*":
				continue;
			default:
				throw "in `Lex.oper': Operator `" + x[i].code + "' has not been implemented.";
		} else if(x[i].flag == this.F.E) {
			if(r.length == 0)
				throw "in `Lex.oper': Radix ahead `" + x[i].code + "' is undefined.";
			var t = r.pop();
			if(t.flag == this.F.O)
				throw "in `Lex.oper': Radix is not allowed to be an `" + t.code + "' operator.";
			x[i].code	= t.code;
			x[i].inv	= t.inv;
		} else if(inv) {
			x[i].inv = !(inv=false);
		}
		r.push(x[i]);
	}
	return r;
};
Lex.empty = function(s) // String -> bool
{
	for(var i = 0; i < s.length; i++) if(!this.SPAC.test(s[i]))
		return false;
	return true;
};
/*
Lex.FYPE =
{
	EXP : 1,
	LOG : 2,
	SIN : 3,
	COS : 4,
	TAN : 5
};
*/
function match(a, b){
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Seman.present(a);
		b = Seman.present(b);
		if(a.calc() == b.calc()) return true;
		a = a.simplify(3);
		b = b.simplify(3);
		console.log(a.string()+"=="+b.string());
		return a.string() == b.string();
	} catch(e) { return false; }
};
function matchSyntax(a, b){
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Syntax.present(a);
		b = Syntax.present(b);
		return Syntax.string(a) == Syntax.string(b);
	} catch(e) { return false; }

};
function matchApprox(a, b, e) {
	if(typeof a == 'number') a = ''+a;
	if(typeof b == 'number') b = ''+b;
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Seman.present(a).calc();
		b = Seman.present(b).calc();
		if(isNaN(a) ||isNaN(b)) return false;
		return Math.abs(a-b) <= e;
	} catch(e) { return false; }
}
function matchDebug(a){
	console.log("======================================");
	a=Syntax.present(a);	console.log(Syntax.string(a));
	//Syntax.clean(a);		console.log(Syntax.string(a));
	a=Seman.represent(a);	console.log(a.string());
	console.log("======================================");
	a=a.expand();			console.log(a.string());
	a=a.combine();			console.log(a.string());
	a=a.expow();			console.log(a.string());
	console.log("--------------------------------------");
	a=a.expand();			console.log(a.string());
	a=a.combine();			console.log(a.string());
	a=a.expow();			console.log(a.string());
	console.log("--------------------------------------");
	a=a.expand();			console.log(a.string());
	a=a.combine();			console.log(a.string());
	a=a.expow();			console.log(a.string());
	console.log("======================================");
};
// may rename into `Mantic' or `Mantrix'
function Seman() {};
//=============================================================================
/**STRUCT**/
//=============================================================================
// struct Seman.Q represents a product
Seman.Q = function(f, i, s) {
	this.fact = 1.0;			// constant		: number
	this.imag = new Object();	// imaginary	: string
	this.sums = [];				// summarys		: [][]Q
	if(f !== undefined) this.fact *= f;
	if(i !== undefined) this.imag = i; // assign?
	if(s !== undefined) this.sums = s; // assign?
	this.calc	= function(){ return Seman.calcQ(this); }
	this.ident	= function(){ return Seman.identQ(this); };
	this.string	= function(){ return Seman.stringQ(this); };
	this.pow	= function(v){ return Seman.powQ(this, v); };
};
// struct Seman.S represents an summary
Seman.S = function(o, q, e) {
	this.offset = 0.0;	// constant	: float
	this.queues = [];	// products	: []Q
	this.expont = null;	// exponent	: S
	if(o !== undefined) this.offset += o;
	if(q !== undefined && q.length > 0) this.queues = q;
	if(e !== undefined) this.expont = e;
	this.calc	= function(){ return Seman.calc(this); }
	this.expand	= function(){ Seman.expand(this); return this; };
	this.combine= function(){ return Seman.combine(this); }
	this.expow	= function(){ return Seman.expow(this); };
	this.akinQ	= function(){ return Seman.akinS2Q(this); };
	this.ident	= function(){ return Seman.identS(this); };
	this.string	= function(){ return Seman.string(this); };
	this.simplify=function(n){ return Seman.simplify(this, n); }
};
//=============================================================================
/**OPERATOR**/
//=============================================================================
// string -> S
Seman.present = function(s) {
	if(typeof s != "string") throw "`Seman.present(string)' got `"+typeof s+"' instead of `string'";
	var syntax = Syntax.present(s);// Syntax.clean(syntax);
	return this.represent(syntax);
}
// []Syntax.Q -> S
Seman.represent = function(qs) {
	var rs = new this.S();
	qs.forEach(function(q) {
		var q0 = Seman.representQ(q);
		if(Seman.constQ(q0))	rs.offset += q0.fact;
		else					rs.queues.push(q0);
	});
	return this.solidify(rs);
}
// Syntax.Q -> Q
Seman.representQ = function(q) {
	var rq = new this.Q();
	rq.fact = q.fact.reduce(function(a,b){return a*b;}, 1);
	rq.imag = Imag.strParse(q.imag);
	q.exps.forEach(function(e) {
		var s0 = Seman.represent(e.radix);
		var e0 = Seman.represent(e.power);
		var e1 = s0.expont;
		s0.expont = e0;
		if(e1) {
			var s1 = new Seman.S();
			s0.expont = e1;
			s1.expont = e0;
			s1.queues.push(new Seman.Q(1, new I, [s0]));
			s0 = s1;
		}
		rq.sums.push(s0);
		console.log(s0.string());
	});
	q.sums.forEach(function(qs){
		var s = Seman.represent(qs);
		rq.sums.push(s);
	});
	return rq;
}
// Q -> boolean
Seman.constQ = function(q) {
	return 0==Imag.len(q.imag)
		&& 0==q.sums.length;
	// summarys also might be constant! problem?
};
// S -> S
Seman.solidify = function(s) {
	// a^2
	var constPow = s.expont ? s.expont.calc() : NaN;
	if(0==s.offset
	&& 1==s.queues.length
	&& 1==s.queues[0].fact
	&& 0==s.queues[0].sums
	&& !isNaN(constPow)) {
		Imag.pow(s.queues[0].imag, constPow);
		s.expont = null;
	} else
		s.queues.forEach(function(q0) {
			return q0.sums.map(function(s0){ return Seman.solidify(s0); })
		});
	return 0==s.offset
		&& 1==s.queues.length
		&& !s.expont
		&& 1==s.queues[0].fact
		&& 0==Imag.len(s.queues[0].imag)
		&& 1==s.queues[0].sums.length
		? this.solidify(s.queues[0].sums[0])
		: s;
};
// Q -> Q
Seman.solidifyQ = function(q) {
	return 1==q.fact
		&& 0==Imag.len(q.imag)
		&& 1==q.sums.length
		&& 0==q.sums[0].offset
		&& !q.sums[0].expont
		&& 1==q.sums[0].queues.length
		? this.solidifyQ(q.sums[0].queues[0])
		: q;
};
// S -> number
Seman.calc = function(s) {
	var value = s.offset + s.queues.reduce(function(a,q){return a+Seman.calcQ(q);},0);
	return s.expont ? Math.pow(value, this.calc(s.expont)) : value;
};
// Q -> number
Seman.calcQ = function(q) {
	if(Object.keys(q.imag).length > 0) return NaN;
	return q.fact * q.sums.reduce(function(a,s){return a*Seman.calc(s);},1);
};
// S -> bool
Seman.akinS2Q = function(s) {
	if(!s.expont) return false;
	return	s.offset==0 && s.queues.length==1 ? true :
			s.offset!=0 && s.queues.length==0;
};
// Q x number -> Q
Seman.powQ = function(q, v) {
	return new this.Q(
		Math.pow(q.fact, v),
		Object.keys(q.imag).reduce(function(a, k) {
			a[k] = q.imag[k] * v; return a;
		}, new I)
	);
};
// S | Q -> bool
Seman.identS = function(s) {
	return s.offset == 0 && s.expont == null && s.queues.length
		? !s.queues.some(this.calcQ)
		: false;
};
Seman.identQ = function(q) {
	return q.fact * q.sums.reduce(function(a, s) {
		return a * s.calc();
	}, 1) == 1 && Imag.empty(q.imag);
};
// S | Q -> string
Seman.string = function(s) {
	var e = s.expont ? true : false;
	return s.queues.reduce(function(a, q) {
		var strq = q.string();
		return a + (q.fact<0 ? strq : '+'+strq);
	}, (e?'(':'') + s.offset)
	+ (e?')^('+s.expont.string()+')':'');
};
Seman.stringQ = function(q) {
	return q.sums.reduce(function(a, s){
		return a + '(' + s.string() + ')';
	}, ''+q.fact+Imag.string(q.imag));
};
// S | Q -> S | Q
Seman.clone = function(s0) {
	var s1 = new Seman.S;
	s1.offset = s0.offset;
	s1.queues = s0.queues.map(Seman.cloneQ);
	s1.expont = s0.expont ? Seman.clone(s0.expont) : null;
	return s1;
};
Seman.cloneQ = function(q0) {
	var q1 = new Seman.Q;
	q1.fact = q0.fact;
	q1.imag = Imag.clone(q0.imag);
	q1.sums = q0.sums.map(Seman.clone);
	return q1;
};
// S x number -> S
Seman.simplify = function(s0, times) {
	do {
		s0 = s0.expand();
		s0 = s0.combine();
		s0 = s0.expow();
	} while(--times > 0);
	return s0;
};
//=EXPAND======================================================================
// S -> void
Seman.expand = function(s) {
	var i = 0;
	while(i < s.queues.length) {
		// `s0' := expanded part of product-i
		var s0 = Seman.extract(s.queues[i]);
		// clear non-summary part of product-i
		Imag.clear(s.queues[i].imag);
		s.queues[i].fact = 1;
		// try to through `s0' out of its product
		// conditions:
		// - product as identity element leftover
		// - `s0.expont' == null #noexcept
		if(s.queues[i].ident()) {
			if(s0.expont) throw "`expand': `s0.expont' must be `null'.";
			// delete identity element product-i
			s.queues.splice(i, 1);
			// concat `s0' to base summary
			s.offset += s0.offset;
			s.queues = s0.queues.concat(s.queues);
			// correct iteration index
			i += s0.queues.length;
		} else {
			// otherwise put `s0' back to product-i
			// conditions:
			// - `calc s0' != `const 1'
			if(s0.calc() != 1)
				s.queues[i].sums.push(s0);
			i++;
		}
	};
};
// Q -> S
Seman.extract = function(q) {
	// initialize summary accumulator
	// sa := (0 + A0)
	var sa = new this.S(0, [new this.Q(q.fact, Imag.clone(q.imag))]);
	// try to expand every summary `q.sums'
	// - accumulation data `sa'
	// - erasing past summarys in `q.sums'
	var i = 0;
	while(i < q.sums.length) {
		// shit storm recursion
		this.expand(q.sums[i]);
		// accumulate summary-i
		// conditions:
		// - SQSS == null
		if(q.sums[i].expont == null) {
			// sa -> (A0 + B0) := (A0 + B0) * (Ai + Bi)
			sa = this.expansion(sa, q.sums[i]);
			q.sums.splice(i, 1);
		} else i++;
		// otherwise summary-i remain the same
		// q -> (A0 + (.. * Si)) (?)
	} return sa;
};
// S^2 -> S
// conditions:
// - SS == null #noexcept
Seman.expansion = function(s0, s1) {
	if(s0.expont != null) throw "`expansion': `s0.expont != null'";
	if(s1.expont != null) throw "`expansion': `s1.expont != null'";
	var dc = s0.offset * s1.offset; // k0 * k1
	// + k1 * (a0 + b0) + k0 * (a1 + b1)
	var qs = s0.queues.map(function(q) { // assert?
		return new Seman.Q(s1.offset * q.fact, Imag.clone(q.imag), q.sums);
	}).concat(s1.queues.map(function(q) { // assert?
		return new Seman.Q(s0.offset * q.fact, Imag.clone(q.imag), q.sums);
	}));
	// + (a0 + b0) * (a1 + b1)
	s0.queues.forEach(function(q0) {
		s1.queues.forEach(function(q1) {
			var imag = new I();
			Imag.insert(imag, q0.imag);
			Imag.insert(imag, q1.imag);
			qs.push(new Seman.Q(q0.fact * q1.fact, Imag.sort(imag),
								q0.sums.concat(q1.sums) // assign?
			));
		});
	});
	return new this.S(dc, qs.filter(function(q){ return q.fact!=0; }));
}
//=COMBINE=====================================================================
// S -> S
Seman.combine = function(s) {
	var dc = s.offset;	// direct current summary offset
	var qs = [];		// product summary accumulator
	var q0 = undefined;	// product of last iteration step
	var ss = s.expont;	// incoming exponent
	// recursion on exponent
	// conditions:
	// - SS != null
	if(ss) ss = this.combine(s.expont);
	// product-n iteration
	// accumulators: {dc, qs, q0}
	s.queues.filter(
		// extract constant part
		// qs -> [q0, q1, ..]
		function(q) {
			var v = Seman.calcQ(q);
			if(!isNaN(v)) {
				dc += v;
				return false;
			} else return true; }
	).map(
		// tree traversal
		function(q){ Seman.combineQ(q); return q; }
	).sort(
		// sort terms by imaginary
		// TODO correct sort algorithm
		function(a, b) {
			return -Imag.sortFunc(a.imag, b.imag);
		}
	).forEach(
		// combine imaginary
		// k0*a^2 + k1*a + k2*a
		// -> k0*a^2 + (k1+k2)a
		// conditions:
		// - i0 == i1
		// - QS == []
		function(q1) {
			if(  q0!=undefined	&& Imag.equals(q0.imag, q1.imag)
								&& q0.sums.length==0 && q1.sums.length==0 ){
				qs[0].fact += q1.fact;}
			else { qs.unshift(q1); q0 = q1; } }
	);
	qs = qs.filter(function(q){ return q.fact != 0; });
	return Seman.solidify(new this.S(dc, qs, ss));
};
// Q -> void
// combine summarys by totalizing `expont's
Seman.combineQ = function(q) {
	var h2is;		// hash from radix to summary indices
	var h2ks;		// radix-keys of `h2is'
	var is2com;		// summary indices to combine
	var is2del = [];// summary indices to delete
	// build up hash out of summary indicies
	h2is = q.sums.reduce(function(a, s, i) {
		// shit storm recursion
		s = s.combine(s);
		var temp = s.expont;		s.expont = null;
		var k = Seman.string(s);	s.expont = temp;
		// accumulation step: `insert index'
		if(a[k])	a[k].push(i);
		else		a[k] = [i];		return a;
	}, new Object);
	h2ks = Object.keys(h2is);
	// try to combine every mapping summary indices
	for(var i = 0; i < h2ks.length; i++) {
		// combine exponents by using indicies
		// conditions:
		// - indicies > 1
		is2com = h2is[h2ks[i]];
		if(is2com.length > 1)
			is2del = is2del.concat(this.combineE(q.sums, is2com));
	}
	// deleting past summarys in `q.sums'
	is2del.sort(function(a,b){ return b-a; }).forEach(
		function(i){ q.sums.splice(i, 1); }
	);
};
// S[] x number[] -> number[]
// combines equal summarys by totalizing exponts
// - `sums'		: array of summarys
// - `is2com'	: equal summary indices
// returns summary indices need to delete
// conditions:
// - minimum 2 indicies #noexcept
Seman.combineE = function(sums, is2com) {
	if(is2com.length<2) throw "`combineE': "+is2com.length+"/2 indices";
	var is2del = []			// indices to delete
	var eA = new this.S;	// exponent accumulator
	var s0 = new this.S;	// radix
	s0.offset = sums[is2com[0]].offset;
	s0.queues = sums[is2com[0]].queues;
	while(is2com.length) {
		var e0 = sums[is2com[0]].expont;
		if(!e0)
			eA.offset++;
		else if(e0.expont)
			eA.queues.push(new this.Q(1, new I,[e0]));
		else {
			eA.offset += e0.offset;
			eA.queues = eA.queues.concat(e0.queues);
		}
		is2del.push(is2com[0]);
		is2com.splice(0, 1);
	}
	s0.expont = eA;
	sums.push(s0);
	return is2del;
};
//=EXPOW=======================================================================
// S -> S
Seman.expow = function(s0) {
	s0 = Seman.powerfy(s0);
	// no recursion on `s0.expont'
	var v = s0.expont ? s0.expont.calc() : NaN;
	// (3+a)^1.7 := 0+(3+a)(3+a)^0.7
	// conditions:
	// - exponent const 
	// - exponent > 1
	if(!isNaN(v)) {
		var rs = [];
		while(v > 1) {
			var s1 = new Seman.S;
			s1.offset = s0.offset;
			s1.queues = s0.queues.map(Seman.cloneQ);
			rs.push(s1);
			v--;
		} s0.expont = v==1 ? null : new Seman.S(v);
		if(rs.length) {
			rs.unshift(s0);
			s0 = new Seman.S;
			s0.queues.push(new Seman.Q(1, new I, rs));
		}
	} else if(s0.expont && s0.expont.expont) {
		// try to multiply s0^(e0^e1)
		// conditions:
		// - const `e1'
		// TODO - ALSO CHECK IF SENSFUL
	}
	// shit storm recursion
	s0.queues.forEach(function(q) {
		q.sums = q.sums.map(Seman.expow);
	}); return Seman.solidify(s0);
};
// S -> S
// behinderter Name
// das `expow' fuer coole Leute !
Seman.powerfy = function(s) {
	if(0==s.offset
	&& 1==s.queues.length
	&& s.expont) {
		var e = s.expont;			// input
		var q = s.queues[0];		// output
		var s = new this.S(0, [q]);	// output
		for(var i = 0; i < q.sums.length; i++)
			q.sums[i].expont = Seman.expansion(q.sums[i].expont, Seman.clone(e));
		// i guess expandSS
		// !!! what about exponts with exponts ?!
		var v = e.calc();
		if(isNaN(v)) {
			q.sums.push(new this.S(q.fact, q.imag, Seman.clone(e)));
			q.fact = 1;
			q.imag = new I;
		} else {
			q.fact = Math.pow(q.fact, v);
			Imag.pow(q.imag, v);
		}
	} return s;
};
//=============================================================================
// S^2 -> S
// conditions:
// - SS == null
Seman.concatS = function(s0, s1) {
	return new this.S(	s0.offset + s1.offset,
						s0.queues.concat(s1.queues)	); // assign?
};
/**
	class Syntax is a syntactical representation
	important to include it's helper-class `Lex'
**/
function Syntax() {};
/**STRUCT**/
// struct Syntax.Q represents a product
Syntax.Q = function(/*f, i, e, s*/) {
	this.fact = [];	// constants	: []number
	this.imag = '';	// imaginary	: string
	this.exps = [];	// exponentials	: []Syntax.E
	this.sums = [];	// summarys		: [][]Syntax.Q
	/*if(f !=== undefined) this.fact = f;
	if(i !=== undefined) this.imag = i;
	if(e !=== undefined) this.exps = e;
	if(s !=== undefined) this.sums = s;*/
};
// struct Syntax.E represents an exponential
Syntax.E = function(/*r, p*/) {
	this.radix = []; // base by sum	: []Syntax.Q
	this.power = []; // pow by sum	: []Syntax.Q
	/*if(r !=== undefined) this.radix = r;
	if(p !=== undefined) this.power = p;*/
};
/**OPERATOR**/
// string -> Q[]
Syntax.present = function(s) {
	if(typeof s != "string") throw "`Syntax.present(string)' got `"+typeof s+"' instead of `string'";
	var t = Lex.iter(s);
	var sum = [];
	do {
		var minus = false;
		while(t.length > 0 && t[0].flag == Lex.F.O)
			if(t.shift().inv) minus = !minus;
		var q = this.pluckQ(t);
		if(q) {
			if(minus) q.fact.unshift(-1);
			sum.push(q);
		}
	} while(t.length > 0);
	this.sort(sum);
	return sum;
};
// T[] -> Q
Syntax.pluckQ = function(t) {
	var q = new this.Q();
	while(t.length > 0) switch(t[0].flag) {
		case Lex.F.N: { // case `number'
			var x = parseFloat(t[0].code);
			if(t.shift().inv) { // sub-case `x^-1'
				if(x == 0) throw "`pluckQ' divided by 0.";
				x = 1 / x;
			} q.fact.push(x); break;
		} case Lex.F.X: { // case `identifier'
			var k = t[0].code
			if(t.shift().inv) {
				var e = new this.E;
				e.radix.push(this.X2Q(k));
				e.power.push(this.N2Q(-1));
				q.exps.push(e);
			} else
				q.imag += k;
			break;
		} case Lex.F.E: { // case `expont'
			var e = new this.E();
			if(t[0].inv) throw "`pluckQ' Token `"+t[0]+"' is not allowed to be `inv'";
			e.radix = this.present(t.shift().code);
			e.power = this.pluckT(t);
			q.exps.push(e); break;
		} case Lex.F.L:
			var qs = this.present(t[0].code);
			if(t.shift().inv) {
				var e = new this.E;
				e.radix = qs;
				e.power.push(this.N2Q(-1));
				q.exps.push(e);
			} else q.sums.push(qs);
			break;
		case Lex.F.O:
		default:
			return this.emptyQ(q) ? null : q;
	}
	return this.emptyQ(q) ? null : q;
};
// T[] -> Q[]
Syntax.pluckT = function(t) {
	if(t.length > 0) switch(t[0].flag) {
		case Lex.F.N: return [this.N2Q(t.shift().code)];
		case Lex.F.X: return [this.X2Q(t.shift().code)];
		case Lex.F.E:
		{
			var e = new this.E();
			if(t[0].inv) throw "`pluckT' Token `"+t[0]+"' is not allowed to be `inv'";
			e.radix = this.present(t.shift().code);
			e.power = this.pluckT(t);
			return [this.E2Q(e)];
		}
		case Lex.F.L: return this.present(t.shift().code);
		case Lex.F.O:	throw "`pluckT' invalid `flag=O'.";
		default:		throw "`pluckT' invalid `flag=?'.";
	} else throw "`pluckT' without any token.";
};
// Q[] | Q -> void
// not up to date anymore
// method `clean' should become erased
Syntax.clean = function(qs) { qs.forEach(Syntax.cleanQ); };
Syntax.cleanQ = function(q) {
	// tree recursion
	q.sums.forEach(Syntax.clean);
	q.exps.forEach(function(e) {
		Syntax.clean(e.radix);
		Syntax.clean(e.power);
	});
	// cleanup exponential interleaving
	// looking for layout `a0 ^ k0' : E
	var i = 0;
	while(i < q.exps.length) {
		var e = q.exps[i];
		// conditions:
		if(1 == e.radix.length
		&& 1 == e.power.length
		&& 0 == e.radix[0].fact.length
		&& e.radix[0].imag.length
		&& 0 == e.radix[0].exps.length
		&& 0 == e.radix[0].sums.length
		&& 1 == e.power.length
		&& 1 == e.power[0].fact.length
		&& !e.power[0].imag.length
		&& 0 == e.power[0].exps.length
		&& 0 == e.power[0].sums.length) {
			// evaluate exponential interleaving cleanup
			/*Imag.pow(e.radix[0].imag, e.power[0].fact[0]);
			Imag.insert(q.imag, e.radix[0].imag);*/
			q.exps.splice(i, 1);
		} else i++;
	}
}
Syntax.N2Q = function(e) { var q = new this.Q(); q.fact.push(e); return q; };
Syntax.X2Q = function(e) { var q = new this.Q(); q.imag = e; return q; };
Syntax.E2Q = function(e) { var q = new this.Q(); q.exps.push(e); return q; };
// Q[] | Q -> void
Syntax.sort = function(qs) {
	qs.forEach(function(q){ Syntax.sortQ(q); });
	qs.sort(function(a,b){ return Imag.strSortFunc(a.imag, b.imag); });
};
Syntax.sortQ = function(q) {
	q.sums.forEach(function(qs){ Syntax.sort(qs); });
	q.fact.sort(function(a, b){ return a - b; });
	q.imag = Imag.strSort(q.imag);
	q.exps.sort(function(a, b){ return Syntax.valueE(a) - Syntax.valueE(b); });
	q.sums.sort(function(a, b){ return Syntax.value(a) - Syntax.value(b); });
};
// Q[] | E | Q -> number
Syntax.value = function(qs) { return qs.reduce(function(a, b){return a + Syntax.valueQ(b);}, 0); };
Syntax.valueE = function(e) { return Math.pow(16536421.3572347 + this.value(e.radix), this.value(e.power)); };
Syntax.valueQ = function(q) {
	return	q.fact.reduce(function(a, b){return a * b;}, 1) *
			Imag.strValue(q.imag) *
			q.exps.reduce(function(a,b){return a*Syntax.valueE(b);},1) *
			q.sums.reduce(function(a,b){return a*Syntax.value(b);},1);
};
// Q -> bool
Syntax.emptyQ = function(e) {
	return e.fact.length == 0
		&& e.imag.length == 0
		&& e.exps.length == 0
		&& e.sums.length == 0;
};
// Q[] | Q | E -> string
Syntax.string = function(qs) {
	var str = ''
	if(qs.length) {
		str += this.stringQ(qs[0]);
		for(var i = 1; i < qs.length; i++) {
			var fact = qs[i].fact.reduce(function(a,e){return a*e;},1);
			var strq = this.stringQ(qs[i]);
			str += fact<0 ? strq : '+'+strq; 
		}
	}
	return str;
};
Syntax.stringQ = function(q) {
	var str = ''
	if(q.fact.length) {
		str += q.fact[0];
		for(var i = 1; i < q.fact.length; i++)
			str += '*' + q.fact[i];
	}
	str += q.imag;
	str += q.exps.reduce(function(a, e){return a+Syntax.stringE(e);},'');
	str += q.sums.reduce(function(a, s){return a+'('+Syntax.string(s)+')';},'');
	return str;
};
Syntax.stringE = function(e) {
	return '(' + Syntax.string(e.radix) + ')^(' + Syntax.string(e.power) + ')';
};
"use strict";function Imag(){}function I(){}function Lex(){}function match(e,n){try{return Lex.empty(e)||Lex.empty(n)?!1:(e=Seman.present(e),n=Seman.present(n),e.calc()==n.calc()?!0:(e=e.simplify(3),n=n.simplify(3),console.log(e.string()+"=="+n.string()),e.string()==n.string()))}catch(t){return!1}}function matchSyntax(e,n){try{return Lex.empty(e)||Lex.empty(n)?!1:(e=Syntax.present(e),n=Syntax.present(n),Syntax.string(e)==Syntax.string(n))}catch(t){return!1}}function matchApprox(e,n,t){"number"==typeof e&&(e=""+e),"number"==typeof n&&(n=""+n);try{return Lex.empty(e)||Lex.empty(n)?!1:(e=Seman.present(e).calc(),n=Seman.present(n).calc(),isNaN(e)||isNaN(n)?!1:Math.abs(e-n)<=t)}catch(t){return!1}}function matchDebug(e){console.log("======================================"),e=Syntax.present(e),console.log(Syntax.string(e)),e=Seman.represent(e),console.log(e.string()),console.log("======================================"),e=e.expand(),console.log(e.string()),e=e.combine(),console.log(e.string()),e=e.expow(),console.log(e.string()),console.log("--------------------------------------"),e=e.expand(),console.log(e.string()),e=e.combine(),console.log(e.string()),e=e.expow(),console.log(e.string()),console.log("--------------------------------------"),e=e.expand(),console.log(e.string()),e=e.combine(),console.log(e.string()),e=e.expow(),console.log(e.string()),console.log("======================================")}function Seman(){}function Syntax(){}window.Capira=window.Capira||{},window.Capira.Mathslang={matchPair:function(e,n){n+="",e+="";if(n=n.trim(),e=e.trim(),0===e.indexOf("#")){var t=e.substr(1,e.indexOf(" ")-1);switch(e=e.substr(e.indexOf(" ")+1),t){case"equals":return match(e,n);case"identic":return matchSyntax(e,n);case"approx":var r=e.split("#epsilon");return matchApprox(r[0],n,r[1]);case"lt":return Number.parseFloat(n)<Number.parseFloat(e);case"leq":return Number.parseFloat(n)<=Number.parseFloat(e);case"gt":return Number.parseFloat(n)>Number.parseFloat(e);case"geq":return Number.parseFloat(n)>=Number.parseFloat(e);default:return e===n}}}},Imag.sort=function(e){var n=new I;return Object.keys(e).sort(function(e,n){return e.charCodeAt(0)-n.charCodeAt(0)}).forEach(function(t){n[t]=e[t]}),n},Imag.insert=function(e,n){Object.keys(n).forEach(function(t){e[t]?e[t]+=n[t]:e[t]=n[t],e[t]||delete e[t]})},Imag.clear=function(e){Object.keys(e).forEach(function(n){delete e[n]})},Imag.pow=function(e,n){Object.keys(e).forEach(function(t){n?e[t]*=n:delete e[t]})},Imag.akin=function(e,n){return Object.keys(e).toString()==Object.keys(n).toString()},Imag.equals=function(e,n){return JSON.stringify(e)==JSON.stringify(n)},Imag.empty=function(e){return 0==Object.keys(e).length},Imag.sortFunc=function(e,n){for(var t=Object.keys(e),r=Object.keys(n),s=Math.min(t.length,r.length),i=0;s>i;i++){if(t[i]<r[i])return-1;if(t[i]>r[i])return 1}var a=t.length-r.length;if(a)return a;for(var i=0;s>i;i++)if(a=e[t[i]]-n[r[i]])return a;return 0},Imag.strSortFunc=function(e,n){for(var t=Math.min(e.length,n.length),r=0;t>r;r++){if(e[r]<n[r])return-1;if(e[r]>n[r])return 1}return e.length-n.length},Imag.strSort=function(e){return e.split("").sort(function(e,n){return e.charCodeAt(0)-n.charCodeAt(0)}).reduce(function(e,n){return e+n},"")},Imag.strParse=function(e){for(var n=new I,t=0;t<e.length;t++){var r=e[t];n[r]?n[r]++:n[r]=1}return n},Imag.strValue=function(e){for(var n=1,t=0;t<e.length;t++)n*=e.charCodeAt(0);return n},Imag.len=function(e){return Object.keys(e).length},Imag.clone=function(e){return Object.keys(e).reduce(function(n,t){return n[t]=e[t],n},new I)},Imag.string=function(e){return Object.keys(e).reduce(function(n,t){var r=e[t];return n+(1==r?t:t+"^"+r)},"")},Lex.F={O:0,E:1,X:2,N:3,L:7},Lex.T=function(e,n){this.flag=e,this.code=n,this.inv=!1},Lex.G=function(e,n){this.exp=n,this.plu=e,this.test=function(e){return this.exp.test(e)}},Lex.SPAC=new Lex.G(!0,/^\s$/),Lex.BRAC=[new Lex.G(!1,/^\(|\[|\{$/),new Lex.G(!1,/^\)|\]|\}$/)],Lex.GRAM=[new Lex.G(!1,/^\+|\-|\*|\/$/),new Lex.G(!1,/^\^$/),new Lex.G(!1,/^[a-zA-Z]$/),new Lex.G(!0,/^[0-9]|\,|\.$/)],Lex.prep=function(e){return e=e.replace(/ï¿½/g,"^2"),e=e.replace(/ï¿½/g,"^3"),e=e.replace(/\u00B2/g,"^2"),e=e.replace(/\u00B3/g,"^3"),e=e.replace(/,/g,".")},Lex.iter=function(e){for(var n=[],t=this.prep(e).split("");t.length>0;){var r=0,s="";if(this.SPAC.test(t[0])){do t.shift();while(this.SPAC.test(t[0]))}else if(this.BRAC[0].test(t[0])){t.shift(),s="",r=this.F.L;for(var i=1,a="";i>0;){if(s+=a,0==t.length)throw")";a=t.shift(),i+=this.BRAC[0].test(a)?1:this.BRAC[1].test(a)?-1:0}n.push(new this.T(r,s))}else{for(;r<this.GRAM.length;){var u=this.GRAM[r];if(u.test(t[0]))do s=s.concat(t.shift());while(u.plu&&u.test(t[0]));s.length>0?(n.push(new this.T(r,s)),r=this.GRAM.length):r++}if(0==s.length)throw t.shift()}}return this.oper(n)},Lex.oper=function(e){var n=[],t=!1;for(var r in e){if(e[r].flag==this.F.O)switch(e[r].code){case"-":e[r].inv=!e[r].inv;case"+":break;case"/":t=!0;case"*":continue;default:throw"in `Lex.oper': Operator `"+e[r].code+"' has not been implemented."}else if(e[r].flag==this.F.E){if(0==n.length)throw"in `Lex.oper': Radix ahead `"+e[r].code+"' is undefined.";var s=n.pop();if(s.flag==this.F.O)throw"in `Lex.oper': Radix is not allowed to be an `"+s.code+"' operator.";e[r].code=s.code,e[r].inv=s.inv}else t&&(e[r].inv=!(t=!1));n.push(e[r])}return n},Lex.empty=function(e){for(var n=0;n<e.length;n++)if(!this.SPAC.test(e[n]))return!1;return!0},Seman.Q=function(e,n,t){this.fact=1,this.imag=new Object,this.sums=[],void 0!==e&&(this.fact*=e),void 0!==n&&(this.imag=n),void 0!==t&&(this.sums=t),this.calc=function(){return Seman.calcQ(this)},this.ident=function(){return Seman.identQ(this)},this.string=function(){return Seman.stringQ(this)},this.pow=function(e){return Seman.powQ(this,e)}},Seman.S=function(e,n,t){this.offset=0,this.queues=[],this.expont=null,void 0!==e&&(this.offset+=e),void 0!==n&&n.length>0&&(this.queues=n),void 0!==t&&(this.expont=t),this.calc=function(){return Seman.calc(this)},this.expand=function(){return Seman.expand(this),this},this.combine=function(){return Seman.combine(this)},this.expow=function(){return Seman.expow(this)},this.akinQ=function(){return Seman.akinS2Q(this)},this.ident=function(){return Seman.identS(this)},this.string=function(){return Seman.string(this)},this.simplify=function(e){return Seman.simplify(this,e)}},Seman.present=function(e){if("string"!=typeof e)throw"`Seman.present(string)' got `"+typeof e+"' instead of `string'";var n=Syntax.present(e);return this.represent(n)},Seman.represent=function(e){var n=new this.S;return e.forEach(function(e){var t=Seman.representQ(e);Seman.constQ(t)?n.offset+=t.fact:n.queues.push(t)}),this.solidify(n)},Seman.representQ=function(e){var n=new this.Q;return n.fact=e.fact.reduce(function(e,n){return e*n},1),n.imag=Imag.strParse(e.imag),e.exps.forEach(function(e){var t=Seman.represent(e.radix),r=Seman.represent(e.power),s=t.expont;if(t.expont=r,s){var i=new Seman.S;t.expont=s,i.expont=r,i.queues.push(new Seman.Q(1,new I,[t])),t=i}n.sums.push(t),console.log(t.string())}),e.sums.forEach(function(e){var t=Seman.represent(e);n.sums.push(t)}),n},Seman.constQ=function(e){return 0==Imag.len(e.imag)&&0==e.sums.length},Seman.solidify=function(e){var n=e.expont?e.expont.calc():NaN;return 0!=e.offset||1!=e.queues.length||1!=e.queues[0].fact||0!=e.queues[0].sums||isNaN(n)?e.queues.forEach(function(e){return e.sums.map(function(e){return Seman.solidify(e)})}):(Imag.pow(e.queues[0].imag,n),e.expont=null),0!=e.offset||1!=e.queues.length||e.expont||1!=e.queues[0].fact||0!=Imag.len(e.queues[0].imag)||1!=e.queues[0].sums.length?e:this.solidify(e.queues[0].sums[0])},Seman.solidifyQ=function(e){return 1!=e.fact||0!=Imag.len(e.imag)||1!=e.sums.length||0!=e.sums[0].offset||e.sums[0].expont||1!=e.sums[0].queues.length?e:this.solidifyQ(e.sums[0].queues[0])},Seman.calc=function(e){var n=e.offset+e.queues.reduce(function(e,n){return e+Seman.calcQ(n)},0);return e.expont?Math.pow(n,this.calc(e.expont)):n},Seman.calcQ=function(e){return Object.keys(e.imag).length>0?NaN:e.fact*e.sums.reduce(function(e,n){return e*Seman.calc(n)},1)},Seman.akinS2Q=function(e){return e.expont?0==e.offset&&1==e.queues.length?!0:0!=e.offset&&0==e.queues.length:!1},Seman.powQ=function(e,n){return new this.Q(Math.pow(e.fact,n),Object.keys(e.imag).reduce(function(t,r){return t[r]=e.imag[r]*n,t},new I))},Seman.identS=function(e){return 0==e.offset&&null==e.expont&&e.queues.length?!e.queues.some(this.calcQ):!1},Seman.identQ=function(e){return e.fact*e.sums.reduce(function(e,n){return e*n.calc()},1)==1&&Imag.empty(e.imag)},Seman.string=function(e){var n=e.expont?!0:!1;return e.queues.reduce(function(e,n){var t=n.string();return e+(n.fact<0?t:"+"+t)},(n?"(":"")+e.offset)+(n?")^("+e.expont.string()+")":"")},Seman.stringQ=function(e){return e.sums.reduce(function(e,n){return e+"("+n.string()+")"},""+e.fact+Imag.string(e.imag))},Seman.clone=function(e){var n=new Seman.S;return n.offset=e.offset,n.queues=e.queues.map(Seman.cloneQ),n.expont=e.expont?Seman.clone(e.expont):null,n},Seman.cloneQ=function(e){var n=new Seman.Q;return n.fact=e.fact,n.imag=Imag.clone(e.imag),n.sums=e.sums.map(Seman.clone),n},Seman.simplify=function(e,n){do e=e.expand(),e=e.combine(),e=e.expow();while(--n>0);return e},Seman.expand=function(e){for(var n=0;n<e.queues.length;){var t=Seman.extract(e.queues[n]);if(Imag.clear(e.queues[n].imag),e.queues[n].fact=1,e.queues[n].ident()){if(t.expont)throw"`expand': `s0.expont' must be `null'.";e.queues.splice(n,1),e.offset+=t.offset,e.queues=t.queues.concat(e.queues),n+=t.queues.length}else 1!=t.calc()&&e.queues[n].sums.push(t),n++}},Seman.extract=function(e){for(var n=new this.S(0,[new this.Q(e.fact,Imag.clone(e.imag))]),t=0;t<e.sums.length;)this.expand(e.sums[t]),null==e.sums[t].expont?(n=this.expansion(n,e.sums[t]),e.sums.splice(t,1)):t++;return n},Seman.expansion=function(e,n){if(null!=e.expont)throw"`expansion': `s0.expont != null'";if(null!=n.expont)throw"`expansion': `s1.expont != null'";var t=e.offset*n.offset,r=e.queues.map(function(e){return new Seman.Q(n.offset*e.fact,Imag.clone(e.imag),e.sums)}).concat(n.queues.map(function(n){return new Seman.Q(e.offset*n.fact,Imag.clone(n.imag),n.sums)}));return e.queues.forEach(function(e){n.queues.forEach(function(n){var t=new I;Imag.insert(t,e.imag),Imag.insert(t,n.imag),r.push(new Seman.Q(e.fact*n.fact,Imag.sort(t),e.sums.concat(n.sums)))})}),new this.S(t,r.filter(function(e){return 0!=e.fact}))},Seman.combine=function(e){var n=e.offset,t=[],r=void 0,s=e.expont;return s&&(s=this.combine(e.expont)),e.queues.filter(function(e){var t=Seman.calcQ(e);return isNaN(t)?!0:(n+=t,!1)}).map(function(e){return Seman.combineQ(e),e}).sort(function(e,n){return-Imag.sortFunc(e.imag,n.imag)}).forEach(function(e){void 0!=r&&Imag.equals(r.imag,e.imag)&&0==r.sums.length&&0==e.sums.length?t[0].fact+=e.fact:(t.unshift(e),r=e)}),t=t.filter(function(e){return 0!=e.fact}),Seman.solidify(new this.S(n,t,s))},Seman.combineQ=function(e){var n,t,r,s=[];n=e.sums.reduce(function(e,n,t){n=n.combine(n);var r=n.expont;n.expont=null;var s=Seman.string(n);return n.expont=r,e[s]?e[s].push(t):e[s]=[t],e},new Object),t=Object.keys(n);for(var i=0;i<t.length;i++)r=n[t[i]],r.length>1&&(s=s.concat(this.combineE(e.sums,r)));s.sort(function(e,n){return n-e}).forEach(function(n){e.sums.splice(n,1)})},Seman.combineE=function(e,n){if(n.length<2)throw"`combineE': "+n.length+"/2 indices";var t=[],r=new this.S,s=new this.S;for(s.offset=e[n[0]].offset,s.queues=e[n[0]].queues;n.length;){var i=e[n[0]].expont;i?i.expont?r.queues.push(new this.Q(1,new I,[i])):(r.offset+=i.offset,r.queues=r.queues.concat(i.queues)):r.offset++,t.push(n[0]),n.splice(0,1)}return s.expont=r,e.push(s),t},Seman.expow=function(e){e=Seman.powerfy(e);var n=e.expont?e.expont.calc():NaN;if(isNaN(n))e.expont&&e.expont.expont;else{for(var t=[];n>1;){var r=new Seman.S;r.offset=e.offset,r.queues=e.queues.map(Seman.cloneQ),t.push(r),n--}e.expont=1==n?null:new Seman.S(n),t.length&&(t.unshift(e),e=new Seman.S,e.queues.push(new Seman.Q(1,new I,t)))}return e.queues.forEach(function(e){e.sums=e.sums.map(Seman.expow)}),Seman.solidify(e)},Seman.powerfy=function(e){if(0==e.offset&&1==e.queues.length&&e.expont){for(var n=e.expont,t=e.queues[0],e=new this.S(0,[t]),r=0;r<t.sums.length;r++)t.sums[r].expont=Seman.expansion(t.sums[r].expont,Seman.clone(n));var s=n.calc();isNaN(s)?(t.sums.push(new this.S(t.fact,t.imag,Seman.clone(n))),t.fact=1,t.imag=new I):(t.fact=Math.pow(t.fact,s),Imag.pow(t.imag,s))}return e},Seman.concatS=function(e,n){return new this.S(e.offset+n.offset,e.queues.concat(n.queues))},Syntax.Q=function(){this.fact=[],this.imag="",this.exps=[],this.sums=[]},Syntax.E=function(){this.radix=[],this.power=[]},Syntax.present=function(e){if("string"!=typeof e)throw"`Syntax.present(string)' got `"+typeof e+"' instead of `string'";var n=Lex.iter(e),t=[];do{for(var r=!1;n.length>0&&n[0].flag==Lex.F.O;)n.shift().inv&&(r=!r);var s=this.pluckQ(n);s&&(r&&s.fact.unshift(-1),t.push(s))}while(n.length>0);return this.sort(t),t},Syntax.pluckQ=function(e){for(var n=new this.Q;e.length>0;)switch(e[0].flag){case Lex.F.N:var t=parseFloat(e[0].code);if(e.shift().inv){if(0==t)throw"`pluckQ' divided by 0.";t=1/t}n.fact.push(t);break;case Lex.F.X:var r=e[0].code;if(e.shift().inv){var s=new this.E;s.radix.push(this.X2Q(r)),s.power.push(this.N2Q(-1)),n.exps.push(s)}else n.imag+=r;break;case Lex.F.E:var s=new this.E;if(e[0].inv)throw"`pluckQ' Token `"+e[0]+"' is not allowed to be `inv'";s.radix=this.present(e.shift().code),s.power=this.pluckT(e),n.exps.push(s);break;case Lex.F.L:var i=this.present(e[0].code);if(e.shift().inv){var s=new this.E;s.radix=i,s.power.push(this.N2Q(-1)),n.exps.push(s)}else n.sums.push(i);break;case Lex.F.O:default:return this.emptyQ(n)?null:n}return this.emptyQ(n)?null:n},Syntax.pluckT=function(e){if(!(e.length>0))throw"`pluckT' without any token.";switch(e[0].flag){case Lex.F.N:return[this.N2Q(e.shift().code)];case Lex.F.X:return[this.X2Q(e.shift().code)];case Lex.F.E:var n=new this.E;if(e[0].inv)throw"`pluckT' Token `"+e[0]+"' is not allowed to be `inv'";return n.radix=this.present(e.shift().code),n.power=this.pluckT(e),[this.E2Q(n)];case Lex.F.L:return this.present(e.shift().code);case Lex.F.O:throw"`pluckT' invalid `flag=O'.";default:throw"`pluckT' invalid `flag=?'."}},Syntax.clean=function(e){e.forEach(Syntax.cleanQ)},Syntax.cleanQ=function(e){e.sums.forEach(Syntax.clean),e.exps.forEach(function(e){Syntax.clean(e.radix),Syntax.clean(e.power)});for(var n=0;n<e.exps.length;){var t=e.exps[n];1==t.radix.length&&1==t.power.length&&0==t.radix[0].fact.length&&t.radix[0].imag.length&&0==t.radix[0].exps.length&&0==t.radix[0].sums.length&&1==t.power.length&&1==t.power[0].fact.length&&!t.power[0].imag.length&&0==t.power[0].exps.length&&0==t.power[0].sums.length?e.exps.splice(n,1):n++}},Syntax.N2Q=function(e){var n=new this.Q;return n.fact.push(e),n},Syntax.X2Q=function(e){var n=new this.Q;return n.imag=e,n},Syntax.E2Q=function(e){var n=new this.Q;return n.exps.push(e),n},Syntax.sort=function(e){e.forEach(function(e){Syntax.sortQ(e)}),e.sort(function(e,n){return Imag.strSortFunc(e.imag,n.imag)})},Syntax.sortQ=function(e){e.sums.forEach(function(e){Syntax.sort(e)}),e.fact.sort(function(e,n){return e-n}),e.imag=Imag.strSort(e.imag),e.exps.sort(function(e,n){return Syntax.valueE(e)-Syntax.valueE(n)}),e.sums.sort(function(e,n){return Syntax.value(e)-Syntax.value(n)})},Syntax.value=function(e){return e.reduce(function(e,n){return e+Syntax.valueQ(n)},0)},Syntax.valueE=function(e){return Math.pow(16536421.3572347+this.value(e.radix),this.value(e.power))},Syntax.valueQ=function(e){return e.fact.reduce(function(e,n){return e*n},1)*Imag.strValue(e.imag)*e.exps.reduce(function(e,n){return e*Syntax.valueE(n)},1)*e.sums.reduce(function(e,n){return e*Syntax.value(n)},1)},Syntax.emptyQ=function(e){return 0==e.fact.length&&0==e.imag.length&&0==e.exps.length&&0==e.sums.length},Syntax.string=function(e){var n="";if(e.length){n+=this.stringQ(e[0]);for(var t=1;t<e.length;t++){var r=e[t].fact.reduce(function(e,n){return e*n},1),s=this.stringQ(e[t]);n+=0>r?s:"+"+s}}return n},Syntax.stringQ=function(e){var n="";if(e.fact.length){n+=e.fact[0];for(var t=1;t<e.fact.length;t++)n+="*"+e.fact[t]}return n+=e.imag,n+=e.exps.reduce(function(e,n){return e+Syntax.stringE(n)},""),n+=e.sums.reduce(function(e,n){return e+"("+Syntax.string(n)+")"},"")},Syntax.stringE=function(e){return"("+Syntax.string(e.radix)+")^("+Syntax.string(e.power)+")"};