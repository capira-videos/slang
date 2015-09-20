'use strict';
/**
	class Syntax is a syntactical representation
	important to include it's helper-class `Lex'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.syntax = ( function( ) {
	/**STRUCT**/
// struct Syntax.Q represents a product
	function Q( ) {
		this.fact = [];	// constants	: []number
		this.imag = '';	// imaginary	: string
		this.exps = [];	// exponentials	: []Syntax.E
		this.sums = [];	// summarys		: [][]Syntax.Q
	};
	Q.prototype.string = function( ) {
		var q = this;
		var str = ''
		if(q.fact.length) {
			str += q.fact[0];
			for(var i = 1; i < q.fact.length; i++)
				str += '*' + q.fact[i];
		}
		str += q.imag;
		str += q.exps.reduce(function(a, e){return a+e.string( );},'');
		str += q.sums.reduce(function(a, s){return a+'('+string(s)+')';},'');
		return str;
	};
// struct Syntax.E represents an exponential
	function E( ) {
		this.radix = [ ]; // base by sum	: []Syntax.Q
		this.power = [ ]; // pow by sum	: []Syntax.Q
	};
	E.prototype.string = function( ) {
		return '(' + string(this.radix) + ')^(' + string(this.power) + ')';
	};
// public
	// string -> Q[]
	function present(s) {
		// console.log("present "+s);
		if(typeof s != "string")
			throw "syntax.present(typeof s = "+typeof s+")"
		;
		var t = _lex( ).iter(s);
		var sum = [];
		do {
			var minus = false;
			while( t.length > 0 && t[0].flag == _lex( ).FLAG.O )
			   if( t.shift().inv )
					minus = ! minus
			;
			var q = _pluckQ(t);
			if( q ) {
				if(minus)
					q.fact.unshift(-1)
				;
				sum.push(q);
			}
		} while( t.length > 0 );
		_sort( sum );		
		return sum;
	};
	// Q[] | Q | E -> string
	function string(qs) {
		var str = ''
		if(qs.length) {
			str += qs[0].string( );
			for(var i = 1; i < qs.length; i++) {
				var fact = qs[i].fact.reduce(function(a,e){return a*e;},1);
				var strq = qs[i].string( );
				str += fact<0 ? strq : '+'+strq; 
			}
		}
		return str;
	};
// private
	function _lex( ){ return Slang._mathslang.lexical; }
	function _log(e){ }//{ console.log(e); }
	// lexical.Token[ ] -> Q
	function _pluckQ(t) {
		var q = new Q;
		while( t.length > 0 )switch( t[0].flag ) {
			case _lex( ).FLAG.N: { // case `number'
				var x = parseFloat(t[0].code);
				if( t.shift().inv ) { // sub-case `x^-1'
					if( x == 0 )
						throw "`pluckQ' divided by 0."
					;
					x = 1 / x;
				}
				q.fact.push(x);
				break;
			} case _lex( ).FLAG.X: { // case `identifier'
				var k = t[0].code; // imaginary
				if( t.shift().inv ) { // sub-case `x^-1'
					var e = new E;
					e.radix.push( _X2Q(k) );
					e.power.push( _N2Q(-1) );
					q.exps.push(e);
				} else
					q.imag += k
				;
				break;
			} case _lex( ).FLAG.E: { // case `expont'
				var e = new E;
				// var switchPowerFact = false;
				if(t[0].inv) {
					//throw "`pluckQ' Token `"+t[0].code+"' is not allowed to be `inv'";
					// switchPowerFact = true;
				}
				e.radix = present( t.shift( ).code );
				e.power = _pluckT(t);
			/*	if( switchPowerFact )
					//e.power.forEach(function(q){q.fact*=-1;console.log('-> '+q.fact);})
					e.power.forEach(function(q){q.fact.push(-1);});
					console.log(stringE(e));
				;*/
				q.exps.push(e);
				break;
			} case _lex( ).FLAG.L: // case `need-to-become-lexed'
				var qs = present(t[0].code);
				if( t.shift().inv ) { // sub-case `x^-1'
					var e = new E;
					e.radix = qs;
					e.power.push( _N2Q(-1) );
					q.exps.push(e);
				} else
					q.sums.push(qs)
				;
				break;
			case _lex( ).FLAG.O:
			default:
				return _emptyQ(q) ? null : q;
		}
		return _emptyQ(q) ? null : q;
	};
	// Token[] -> Q[]
	function _pluckT(t) {
		if( t.length > 0 )switch( t[0].flag ) {
			case _lex( ).FLAG.N:
				return [ _N2Q(t.shift( ).code) ]
			;
			case _lex( ).FLAG.X:
				return [ _X2Q(t.shift( ).code) ];
			;
			case _lex( ).FLAG.E:
				var e = new E;
				if(t[0].inv)
					throw "`pluckT(" + t[0].code + "..)' illegal `inv'"
				;
				e.radix = present(t.shift().code);
				e.power = _pluckT(t, true);
				return [ _E2Q(e) ]
			;
			case _lex( ).FLAG.L:
				return present(t.shift( ).code);
			;
			case _lex( ).FLAG.O:
				t.shift( );
				var result = _pluckT(t);
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
	function _clean(qs) {
		qs.forEach(
			function(q) {
				// tree recursion
				q.sums.forEach(_clean);
				q.exps.forEach(function(e) {
					_clean(e.radix);
					_clean(e.power);
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
		);
	};
	// number -> Q
	function _N2Q(e) {
		var q = new Q;
		q.fact.push(e);
		return q;
	};
	function _X2Q(e) {
		var q = new Q;
		if( typeof e != 'string' ) {
			_log("not a string");
			return q;
		}
		q.imag = e;
		return q;
	};
	function _E2Q(e) {
		var q = new Q;
		if( typeof e != 'E' ) {
			_log("not a E");
			return q;
		}
		q.exps.push(e);
		return q;
	};
	// Q[] | Q -> void
	function _sort(qs) {
		qs.forEach(function(q){
			q.sums.forEach(function(qs){ _sort(qs); });
			q.fact.sort(function(a, b){ return a - b; });
			q.imag = ( function strSort(str) {
				return str.split('').sort(function(a, b) {
					return a.charCodeAt(0) - b.charCodeAt(0); }
				).reduce(function(a, c){ return a + c; }, '');
			} )
			( q.imag );
			q.exps.sort(function(a, b){ return _valueE(a) - _valueE(b); });
			q.sums.sort(function(a, b){ return _value0(a) - _value0(b); });
		});
		qs.sort(function(a,b){
			return (function(a, b) {
				var times = Math.min(a.length, b.length);
				for(var i = 0; i < times; i++)
					if(a[i] < b[i]) return -1; else
					if(a[i] > b[i]) return  1;
				return a.length - b.length;
			})(a.imag, b.imag);
		});
	};
	// Q[] | E | Q -> number
	function _value0(qs) { return qs.reduce(function(a, b){return a + _valueQ(b);}, 0); };
	function _valueE(e) { return Math.pow(16536421.3572347 + _value0(e.radix), _value0(e.power)); };
	function _valueQ(q) {
		return	q.fact.reduce(function(a, b){return a * b;}, 1) *
					(function(str) {
						var a = 1;
						for(var i = 0; i < str.length; i++)
							a *= str.charCodeAt(0);
						return a;
					})(q.imag) *
				q.exps.reduce(function(a,b){return a*_valueE(b);},1) *
				q.sums.reduce(function(a,b){return a*_value0(b);},1);
	};
	// Q -> bool
	function _emptyQ(e) {
		return e.fact.length == 0
			&& e.imag.length == 0
			&& e.exps.length == 0
			&& e.sums.length == 0;
	};
	return {
		present	: present,
		string	: string
	};
})
( );