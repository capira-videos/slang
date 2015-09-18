'use strict';
/**
	class Lex parses string into tokens
	included by `Synta'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang_lex = ( function() {
	// flags of token
	var F =	{
		O : 0,	// OPERATOR - IN THE END ONLY +/-
		E : 1,	// OPERATOR - POW `^'
		X : 2,	// IDENTIFIER
		N : 3,	// NUMBER
		//K : 6,	// KEYWORD
		L : 7	// POTENTIAL TERM - NEED TO BECOME LEXED
	};
	// single token
	function T(f, c) {
		this.flag = f;
		this.code = c;
		this.inv = false; // O(+) => O(-) | X/N(_) => _^-1
	};
	// grammar
	function G(plu, exp) {
		this.exp = exp;
		this.plu = plu;
		this.test = function(c){ return this.exp.test(c); }
	};
	// space gramar
	var SPAC = new G(true, /^\s$/);
	// bracket grammar
	var BRAC =
	[
		new G(false, /^\(|\[|\{$/),
		new G(false, /^\)|\]|\}$/),
	];
	// token grammar
	var GRAM =
	[
		new G(false, /^\+|\-|\*|\/$/),
		new G(false, /^\^$/),
		new G(false, /^[a-zA-Z]$/),
		new G(true, /^[0-9]|\,|\.$/),

	];
	// String -> String
	function prep(x) {
		x = x.replace(/²/g, "^2");
		x = x.replace(/³/g, "^3");
		x = x.replace(/\u00B2/g, "^2");
		x = x.replace(/\u00B3/g, "^3");
		x = x.replace(/,/g, ".");
		return x;
	};
	// String -> Lex.T[]
	function iter(x) {
		var r = [];
		var q = prep(x).split('');
		while(q.length > 0)
		{
			var flag = 0;
			var code = '';
			if(SPAC.test(q[0]))
				do q.shift(); while(SPAC.test(q[0]));
			else if(BRAC[0].test(q[0]))
			{
				q.shift();
				code = '';
				flag = F.L;
				var lvl = 1;
				var chr = '';
				while(lvl > 0)
				{
					code += chr;
					if(q.length == 0)
						throw ')';
						
					chr = q.shift();
					lvl +=	BRAC[0].test(chr) ? 1 :
							BRAC[1].test(chr) ?-1 : 0;
				}
				r.push(new T(flag, code));
			}
			else
			{
				while(flag < GRAM.length)
				{
					var g = GRAM[flag];
					if(g.test(q[0])) do
						code = code.concat(q.shift());
					while(g.plu && g.test(q[0]));
						
					if(code.length > 0)
					{
						r.push(new T(flag, code));
						flag = GRAM.length
					}
					else
						flag++;
				}
				if(code.length == 0)
					throw q.shift();
			}
		}
		return oper(r);
	};
	// Lex.T[] -> Lex.T[]
	function oper(x) {
		var r = [];
		var inv = false;
		for(var i in x) {
			if(x[i].flag == F.O) switch(x[i].code) {
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
			} else if(x[i].flag == F.E) {
				if(r.length == 0)
					throw "in `Lex.oper': Radix ahead `" + x[i].code + "' is undefined.";
				var t = r.pop();
				if(t.flag == F.O)
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
	// String -> bool
	function empty(s) {
		for(var i = 0; i < s.length; i++) if(!SPAC.test(s[i]))
			return false;
		return true;
	};
	return { F : F, iter : iter, empty : empty };
})
( );
/*	Lex.FYPE =
	{
		EXP : 1,
		LOG : 2,
		SIN : 3,
		COS : 4,
		TAN : 5
	};
*/