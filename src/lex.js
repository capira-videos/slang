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