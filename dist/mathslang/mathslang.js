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