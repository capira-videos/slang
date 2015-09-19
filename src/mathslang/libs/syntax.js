'use strict';
/**
	class Syntax is a syntactical representation
	important to include it's helper-class `Lex'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.syntax = ( function() {
	/**STRUCT**/
	// struct Syntax.Q represents a product
	function Q(/*f, i, e, s*/) {
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
	function E(/*r, p*/) {
		this.radix = []; // base by sum	: []Syntax.Q
		this.power = []; // pow by sum	: []Syntax.Q
		/*if(r !=== undefined) this.radix = r;
		if(p !=== undefined) this.power = p;*/
	};
	/**OPERATOR**/
var present_count = 0; // only for printing mechanics
var present_space = '';
	// string -> Q[]
	function present(s) {
		// console.log("present "+s);
		if(typeof s != "string") throw "`Syntax.present(string)' got `"+typeof s+"' instead of `string'";
		
		present_count += 1;
		
		var t = Slang._mathslang.lexical.iter(s);
		var sum = [];
		do {
			var minus = false;
			while(t.length > 0 && t[0].flag == Slang._mathslang.lexical.FLAG.O)
				if(t.shift().inv) minus = !minus;
			var q = pluckQ(t);
			if(q) {
				if(minus) q.fact.unshift(-1);
				sum.push(q);
			}
		} while(t.length > 0);
		sort(sum);
		
		present_space = '';
		for(var i=0;i<present_count;++i)
			present_space += '\t';
		;
		// console.log(present_space+stringQS(sum));
		present_count -= 1;
		
		return sum;
	};
	// T[] -> Q
	function pluckQ(t) {
		var q = new Q();
		while(t.length > 0) switch(t[0].flag) {
			case Slang._mathslang.lexical.FLAG.N: { // case `number'
				var x = parseFloat(t[0].code);
				if(t.shift().inv) { // sub-case `x^-1'
					if(x == 0) throw "`pluckQ' divided by 0.";
					x = 1 / x;
				}
				q.fact.push(x);
				break;
			} case Slang._mathslang.lexical.FLAG.X: { // case `identifier'
				var k = t[0].code; // imaginary
				if(t.shift().inv) { // sub-case `x^-1'
					var e = new E;
					e.radix.push(X2Q(k));
					e.power.push(N2Q(-1));
					q.exps.push(e);
				} else
					q.imag += k
				;
				break;
			} case Slang._mathslang.lexical.FLAG.E: { // case `expont'
				var e = new E;
				if(t[0].inv) throw "`pluckQ' Token `"+t[0]+"' is not allowed to be `inv'";
				e.radix = present(t.shift().code);
				e.power = pluckT(t);
				q.exps.push(e);
				break;
			} case Slang._mathslang.lexical.FLAG.L: // case `need-to-become-lexed'
				var qs = present(t[0].code);
				if(t.shift().inv) { // sub-case `x^-1'
					var e = new E;
					e.radix = qs;
					e.power.push(N2Q(-1));
					q.exps.push(e);
				} else
					q.sums.push(qs)
				;
				break;
			case Slang._mathslang.lexical.FLAG.O:
			default:
				return emptyQ(q) ? null : q;
		}
		return emptyQ(q) ? null : q;
	};
	// Token[] -> Q[]
	function pluckT(t) {
		if(t.length > 0) switch(t[0].flag) {
			case Slang._mathslang.lexical.FLAG.N:
				return [ N2Q(t.shift().code) ]
			;
			case Slang._mathslang.lexical.FLAG.X:
				return [ X2Q(t.shift( ).code) ];
			;
			case Slang._mathslang.lexical.FLAG.E:
				var e = new E;
				if(t[0].inv)
					throw "`pluckT(" + t[0].code + "..)' illegal `inv'"
				;
				e.radix = present(t.shift().code);
				e.power = pluckT(t, true);
				return [E2Q(e)]
			;
			case Slang._mathslang.lexical.FLAG.L:
				return present(t.shift( ).code);
			;
			case Slang._mathslang.lexical.FLAG.O:
				t.shift( );
				var result = pluckT(t);
				result.forEach(function(q) {
					q.fact.push(-1);
				});			
				return result
			;
			default:
				throw "`pluckT' invalid `flag=?'."
			;
		} else
			throw "`pluckT' without any token."
		;
	};
	// Q[] | Q -> void
	// not up to date anymore
	// method `clean' should become erased
	function clean(qs) { qs.forEach(cleanQ); };
	function cleanQ(q) {
		// tree recursion
		q.sums.forEach(clean);
		q.exps.forEach(function(e) {
			clean(e.radix);
			clean(e.power);
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
				/*Slang._mathslang.imaginary.pow(e.radix[0].imag, e.power[0].fact[0]);
				Slang._mathslang.imaginary.insert(q.imag, e.radix[0].imag);*/
				q.exps.splice(i, 1);
			} else i++;
		}
	}
	// number -> Q
	function N2Q(e) {
		var q = new Q;
		q.fact.push(e);
		return q;
	};
	function X2Q(e) {
		var q = new Q;
		if( typeof e != 'string' ) {
			console.log("not a string");
			return q;
		}
		q.imag = e;
		return q;
	};
	function E2Q(e) {
		var q = new Q;
		if( typeof e != 'E' ) {
			console.log("not a E");
			return q;
		}
		q.exps.push(e);
		return q;
	};
	// Q[] | Q -> void
	function sort(qs) {
		qs.forEach(function(q){
			sortQ(q);
		});
		qs.sort(function(a,b){
			return Slang._mathslang.imaginary.strSortFunc(a.imag, b.imag);
		});
	};
	function sortQ(q) {
		q.sums.forEach(function(qs){ sort(qs); });
		q.fact.sort(function(a, b){ return a - b; });
		q.imag = Slang._mathslang.imaginary.strSort(q.imag);
		q.exps.sort(function(a, b){ return valueE(a) - valueE(b); });
		q.sums.sort(function(a, b){ return value0(a) - value0(b); });
	};
	// Q[] | E | Q -> number
	function value0(qs) { return qs.reduce(function(a, b){return a + valueQ(b);}, 0); };
	function valueE(e) { return Math.pow(16536421.3572347 + value0(e.radix), value0(e.power)); };
	function valueQ(q) {
		return	q.fact.reduce(function(a, b){return a * b;}, 1) *
				Slang._mathslang.imaginary.strValue(q.imag) *
				q.exps.reduce(function(a,b){return a*valueE(b);},1) *
				q.sums.reduce(function(a,b){return a*value0(b);},1);
	};
	// Q -> bool
	function emptyQ(e) {
		return e.fact.length == 0
			&& e.imag.length == 0
			&& e.exps.length == 0
			&& e.sums.length == 0;
	};
	// Q[] | Q | E -> string
	function stringQS(qs) {
		var str = ''
		if(qs.length) {
			str += stringQ(qs[0]);
			for(var i = 1; i < qs.length; i++) {
				var fact = qs[i].fact.reduce(function(a,e){return a*e;},1);
				var strq = stringQ(qs[i]);
				str += fact<0 ? strq : '+'+strq; 
			}
		}
		return str;
	};
	function stringQ(q) {
		var str = ''
		if(q.fact.length) {
			str += q.fact[0];
			for(var i = 1; i < q.fact.length; i++)
				str += '*' + q.fact[i];
		}
		str += q.imag;
		str += q.exps.reduce(function(a, e){return a+stringE(e);},'');
		str += q.sums.reduce(function(a, s){return a+'('+stringQS(s)+')';},'');
		return str;
	};
	// WAUJOKOLLPLOKJHGHJIKOLK
	function stringE(e) {
		return '(' + stringQS(e.radix) + ')^(' + stringQS(e.power) + ')';
	};
	return {
		Q		: Q,
		E		: E,
		present	: present,
		pluckQ	: pluckQ,
		N2Q		: N2Q,
		X2Q		: X2Q,
		sort	: sort,
		emptyQ	: emptyQ,
		string	: stringQS,
		stringQ	: stringQ
	};
})
( );