'use strict';
window.Slang = window.Slang || { };
window.Slang.mathslang = { };
window.Slang.mathslang.compare = function(expectedValue, givenValue, _units) {
	return Slang.logicslang.compare(expectedValue, givenValue, this._compare, _units);
};
window.Slang.mathslang._compare = function(expectedValue, givenValue, _units) {
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
				return Slang._mathslang.impl.match(expectedValue, givenValue, _units);

			case 'identic':
				return Slang._mathslang.impl.matchSyntax(expectedValue, givenValue); // _units

			case 'approx':
				var values = expectedValue.split('#epsilon');
				return Slang._mathslang.impl.matchApprox(values[0], givenValue, values[1], _units);

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
};



'use strict';
/**
	class `Imag' is the imaginary part of terms
	required by term representers:
	- `Syntax'
	- `Seman'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.imaginary = ( function() {
	/**STRUCT**/
	// struct I represents an imaginary
//	function _I() {}
	/**OPERATOR**/
	// I -> I
	function sort(i0) {
		var ia = { };
		Object.keys(i0).sort(
			function(a, b){ return a.charCodeAt(0)-b.charCodeAt(0); }
		).forEach(
			function(k){ ia[k]=i0[k]; }
		);
		return ia;
	};
	// I^2 -> void
	function insert(a, i) {
		Object.keys(i).forEach(function(k) {
			if(!a[k])	a[k] = i[k];
			else		a[k]+= i[k];
			if(!a[k])	delete a[k];
		});
	};
	// I -> void
	function clear(a) {
		Object.keys(a).forEach(function(k){ delete a[k]; });
	};
	// I x number -> void
	function pow(a, x) {
		Object.keys(a).forEach(function(k) {
			if(!x)	delete a[k];
			else	a[k] *= x;
		});
	};
/*	// I^2 -> bool
	function _akin(i0, i1) {
		return Object.keys(i0).toString() == Object.keys(i1).toString();
	};
*/	// I^2 -> bool
	function equals(i0, i1) {
		/*console.log(JSON.stringify(i0)+" == "+JSON.stringify(i1)+
					" => "+(JSON.stringify(i0)==JSON.stringify(i1)));*/
		return JSON.stringify(i0) == JSON.stringify(i1);
	};
	// I -> bool
	function empty(i0) { return Object.keys(i0).length == 0; };
	// I^2 -> number
	function sortFunc(i0, i1) { /*return Imag.sortValue(a.imag)-Imag.sortValue(b.imag);*/
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
	function strSortFunc(a, b) {
		var times = Math.min(a.length, b.length);
		for(var i = 0; i < times; i++)
			if(a[i] < b[i]) return -1; else
			if(a[i] > b[i]) return 1;
		return a.length - b.length;
	};
	// string -> string
	function strSort(str) {
		return str.split('').sort(function(a, b) {
			return a.charCodeAt(0) - b.charCodeAt(0); }
		).reduce(function(a, c){ return a + c; }, '');
	};
	// string -> I
	function strParse(str) {
		var ri = { };
		for(var i = 0; i < str.length; i++) {
			var c = str[i];
			if(ri[c])	ri[c]++;
			else		ri[c]=1;
		}
		return ri;
	};
	// string -> number
	function strValue(str) {
		var a = 1;
		for(var i = 0; i < str.length; i++)
			a *= str.charCodeAt(0);
		return a;
	};
	// I -> number
	function len(i) { return Object.keys(i).length; };
	// I -> I
	function clone(i) {
		return Object.keys(i).reduce(function(a, k) {
			a[k] = i[k];
			return a;
		}, { });
	};
	// I -> string
	function string(i) {
		return Object.keys(i).reduce(function(a, k) {
			var v = i[k];
			return a + (v==1 ? k : k+'^'+v);
		}, '');
	}
	return {
		sort		: sort,
		insert		: insert,
		clear		: clear,
		pow			: pow,
		equals		: equals,
		empty		: empty,
		sortFunc	: sortFunc,
		strSortFunc	: strSortFunc,
		strSort		: strSort,
		strParse	: strParse,
		strValue	: strValue,
		len			: len,
		clone		: clone,
		string		: string
	};
})();
'use strict';
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.impl = ( function() {
	function _lex( ){ return Slang._mathslang.lexical; }
	function _syntax( ){ return Slang._mathslang.syntax; }
	function _semantix( ){ return Slang._mathslang.semantix; }
	function match(a, b, _units) {
		// console.log('');
		// console.log("match(a=`"+a+"', b=`"+b+"')");
		try {
		// unit preprocessor
			if(_units) {
				a = _lex( ).replace_units(a, _units);
				b = _lex( ).replace_units(b, _units);
			}
		// case `empty string'
			if(_lex( ).empty(a) || _lex( ).empty(b))
				return false
			;
		// parse into `syntax'
			a = _syntax( ).present(a);
			b = _syntax( ).present(b);
		// syntactical equality ?
			if( _syntax( ).string(a) == _syntax( ).string(b) ) {
				console.log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
		// parse into `semantix'
			a = _semantix( ).represent(a);
			b = _semantix( ).represent(b);
		// syntactical equality ?
			if(a.string() == b.string()) {
				console.log('semantix equality: '+a.string()+' = '+b.string());
				return true;
			}
		// non-imaginary computable ?
			if( a.calc( ) == b.calc( ) ) {
				console.log('constant equality: '+a.string()+' = '+b.string());
				return true;
			}
		// normalize expression
			a = a.simplify(3);
			b = b.simplify(3);
		// semantical equality ?
			if( a.string() == b.string() ) {
				console.log('simplify equality: '+a.string()+' = '+b.string());
				return true;
			} else {
				console.log('no semantix equality: '+a.string()+' = '+b.string());
				return false;
			}
		} catch(e) { return false; }
	};
	function matchSyntax(a, b, _units){
		// console.log('');
		// console.log("matchSyntax(a=`"+a+"', b=`"+b+"')");
		try {
			if(_units) {
				a = _lex( ).replace_units(a, _units);
				b = _lex( ).replace_units(b, _units);
			}
			if( _lex( ).empty(a) || _lex( ).empty(b) )
				return false
			;
			a = _syntax( ).present(a);
			b = _syntax( ).present(b);
			if( _syntax( ).string(a) == _syntax( ).string(b) ) {
				console.log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
			console.log('no syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
			return false;
		} catch(e) { return false; }

	};
	function matchApprox(a, b, e, _units) {
		// console.log('');
		// console.log("matchApprox(a=`"+a+"', b=`"+b+"', e=`"+e+"')");
		try {
			if(typeof a == 'number') a = ''+a;
			if(typeof b == 'number') b = ''+b;
			if(typeof e == 'string') e = parseFloat(e);
			if(_units) {
				a = _lex( ).replace_units(a, _units);
				b = _lex( ).replace_units(b, _units);
			}
			if(_lex( ).empty(a) || _lex( ).empty(b))
				return false
			;
			a = _semantix( ).present(a);
			b = _semantix( ).present(b);
			{	var unit_a = _semantix( ).clone(a);
				var unit_b = _semantix( ).clone(b);
				_semantix( ).free_const(unit_a);
				_semantix( ).free_const(unit_b);
				unit_a = unit_a.simplify(3);
				unit_b = unit_b.simplify(3);
				if( unit_a.string( ) != unit_b.string( ) )
					return false
				;
				// console.log('units-only equality: '+unit_a.string( )+' = '+unit_b.string( ));
			}
			_semantix( ).free_imag(a);
			_semantix( ).free_imag(b);
			a = a.simplify(2);
			b = b.simplify(2);
			a = a.calc();
			b = b.calc();
			if(isNaN(a) ||isNaN(b))
				return false
			;
			if( Math.abs(a-b) <= e+0.000000000000000231 ) {
				console.log('approx equality: '+a+' = '+b+' (epsilon = '+e+')');
				return true;
			}
			return false;
		} catch(e) { return false; }
	}
	function extractUnit(a, _units) {
		if( _units )
			a = _lex( ).replace_units(a, _units)
		;
		a = _semantix( ).present(a);
		a = a.simplify(3);
		_semantix( ).free_const(a);
		a = _semantix( ).string_imag(a);
		function assign(s, i, c) {
			return s.substr( 0, i ) + c + s.substr( i + c.length );
		}
		for( var i=0; i < a.length; ++i )
		if( i>0 && a[i-1]=='^' && a[i]=='-' ) {
			var j=0;
			while( a[i-2-j]==' ' ) ++ j;
			if( a[i-2-j]==')' ) {
				var k=1;
				var level=1;
				while( level > 0 && i-2-j-k >= 0 ) {
					var c = a[i-2-j-k];
					level += c=='(' ? -1 : c==')' ? +1 : 0;
					++ k;
				}
				while( k >= 0 ) {
					// fuck to implement
					-- k;
				}
			} else {
				a = assign(a, i-0, '^');
				a = assign(a, i-1, a[i-2]);
				a = assign(a, i-2, '/');
			}
		}
		a = a.replace(/1/g, '');
		return a;
	}
	/*
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
	};*/
	return {
		match		: match,
		matchSyntax	: matchSyntax,
		matchApprox	: matchApprox,
		extractUnit	: extractUnit
	};
})
( );
'use strict';
/**
	class Lex parses string into tokens
	included by `Synta'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.lexical = ( function( ) {
	// flags of token
	var FLAG = {
		O : 0,	// OPERATOR - IN THE END ONLY +/-
		E : 1,	// OPERATOR - POW `^'
		X : 2,	// IDENTIFIER
		N : 3,	// NUMBER
		//K : 6,	// KEYWORD
		L : 7	// POTENTIAL TERM - NEED TO BECOME LEXED
	};
	// single token
	function Token(f, c) {
		this.flag = f;
		this.code = c;
		this.inv = false; // O(+) => O(-) | X/N(_) => _^-1
	};
	// String -> Lex.T[]
	function iter(x) {
		// `sqrt(*)' -> (*)^-0.5`
		x = _replaceFun(x);
		// ~~~~~>
		var r = [];
		var q = _prep(x).split('');
		while(q.length > 0)
		{
			var flag = 0;
			var code = '';
			if(_SPACE.test(q[0]))
				do q.shift(); while(_SPACE.test(q[0]));
			else if(_BRACKET[0].test(q[0]))
			{
				q.shift();
				code = '';
				flag = FLAG.L;
				var lvl = 1;
				var chr = '';
				while(lvl > 0)
				{
					code += chr;
					if(q.length == 0)
						throw ')';
						
					chr = q.shift();
					lvl +=	_BRACKET[0].test(chr) ? 1 :
							_BRACKET[1].test(chr) ?-1 : 0;
				}
				r.push(new Token(flag, code));
			}
			else
			{
				while(flag < _GRAMMAR.length)
				{
					var g = _GRAMMAR[flag];
					if(g.test(q[0])) do
						code = code.concat(q.shift());
					while(g.plu && g.test(q[0]));
						
					if(code.length > 0)
					{
						r.push(new Token(flag, code));
						flag = _GRAMMAR.length
					}
					else
						flag++;
				}
				if(code.length == 0)
					throw q.shift();
			}
		}
		return _oper(r);
	};
	// String -> bool
	function empty(s) {
		for(var i = 0; i < s.length; i++) if(!_SPACE.test(s[i]))
			return false;
		return true;
	};
	// String -> String
	function replace_units(s, u) {
		var m_is_min = true;
		var t_is_ton = true;
		// ! potential left-side operand !
		// replacing non-elementary units &
		// place marker `°' for potential operand
		u.split(' ').forEach(function(u) {
			switch(u) {
				case 'weight':
					s = s.replace(/ton/g, '(°1000000g)');
					if( t_is_ton )
						s = s.replace(/t/g, '(°1000000g)');
					;
					s = s.replace(/Kg/g, '(°1000g)');
					s = s.replace(/mg/g, '(°0.001g)');
					break;
				case 'distance':
					s = s.replace( /Km/g,  '(° 1000m)');
					s = s.replace( /dm/g, '(° 0.100m)');
					s = s.replace( /cm/g, '(° 0.010m)');
					s = s.replace( /mm/g, '(° 0.001m)');
					s = s.replace(/min/g,    '(° 60s)');
					s = s.replace(  /m/g,      '(° m)');
					m_is_min = false;
					break;
				case 'time':
					s = s.replace(/min/g, '(° 60s)');
					if( m_is_min )
						s = s.replace(/m/g, '(° 60s)')
					;
					s = s.replace(/h/g, '(° 3600s)');
					s = s.replace(/s/g, '(° s)');
					t_is_ton = false;
					break;
				default:
					throw "mathslang does not support unit `"+u+"'";
			}
		});
		// replace marker `°' into potential cut left-side operand
		for( var i=0; i < s.length; ++i ) if( s[i] == '°' ) {
			// watch out .. `i' could be 0
			if( i && s[i-1] != '(' )
				throw s[i-1] + '° instead of (°'
			;
			var offset=2;
			do {
				while( s[i-offset] == ' ' ) ++ offset;
				if( i >= offset && s[i-offset] == ')' ) {
					var level = 1;
					while( level > 0 && i > offset ) {
						var c = s[i - ++ offset];
						level += c==')' ? +1 : c=='(' ? -1 : 0;
					}
					++ offset;
				}
				while( s[i-offset] == ' ' ) ++ offset;
				while(	i >= offset &&
						/^[0-9a-zA-Z]$/.test( s[i-offset] ) )
					++ offset
				;
				while( s[i-offset] == ' ' ) ++ offset;
			} while( i >= offset && s[i-offset] == ')' );
			function assign(s, i, c) {
				return s.substr( 0, i ) + c + s.substr( i + c.length );
			}
			if( s[i-offset] == '/' ) {
				for( var k=0; k+2 < offset; ++k )
					s = assign( s, i-k, s[i-k-2] );
				;
				s = assign( s, i-offset+1, ' ' );
				s = assign( s, i-offset+2, '(' );
			}
		}
		// replace unsigned maker `°' into space
		return s.replace(/\°/g, '');
	}
// private
// grammar
	function Gram(plu, exp) {
		this.exp = exp;
		this.plu = plu;
		this.test = function(c){ return this.exp.test(c); }
	};
// space gramar
	var _SPACE = new Gram(true, /^\s$/);
// bracket grammar
	var _BRACKET =
	[
		new Gram(false, /^\(|\[|\{$/),
		new Gram(false, /^\)|\]|\}$/),
	];
// token grammar
	var _GRAMMAR =
	[
		new Gram(false, /^\+|\-|\*|\/$/),
		new Gram(false, /^\^$/),
		new Gram(false, /^[a-zA-Z]$/),
		new Gram(true, /^[0-9]|\,|\.$/),

	];
// String -> String
	function _prep(x) {
		x = x.replace(/²/g, "^2");
		x = x.replace(/³/g, "^3");
		x = x.replace(/\u00B2/g, "^2");
		x = x.replace(/\u00B3/g, "^3");
		x = x.replace(/,/g, ".");
		return x;
	};
// lex.Token[] -> lex.Token[]
	function _oper(x) {
		var r = [];
		var inv = false;
		for(var i in x) {
			if( x[i].flag == FLAG.O )switch( x[i].code ) {
				case "-":
					x[i].inv = ! x[i].inv;
				case "+":
					break;
				case "/":
					inv = true;
				case "*":
					continue;
				default:
					throw "operator `" + x[i].code + "' has not been implemented.";
			} else if( x[i].flag == FLAG.E ) {
				if(r.length == 0)
					throw "radix ahead `" + x[i].code + "' is undefined.";
				var t = r.pop();
				if(t.flag == FLAG.O)
					throw "radix is not allowed to be an `" + t.code + "' operator.";
				x[i].code	= t.code;
				x[i].inv	= t.inv;
			} else if( inv ) {
				x[i].inv = ! ( inv = false );
			}
			r.push( x[i] );
		}
		return r;
	};
	function _replaceFun(x) {
		var fun = {
		// every key is including a argument maker `°'
			'Sqrt(°)'	: '°^.5',
			'sqrt(°)'	: '°^.5',
			'root(°)'	: '°^.5',
			'wurzel(°)'	: '°^.5',
			'Wurzel(°)'	: '°^.5',
			'R007(°)'	: '°^.5'
		}
		function assign(s, i, c) {
			return s.substr( 0, i ) + c + s.substr( i + c.length );
		}
		var key_array = Object.keys( fun );
		// detect 1st key
		for( var offset=0; offset < x.length; ++offset ) {
			for( var key_i=0; key_i < key_array.length; ++key_i ) {
				var i=0;
				while( key_array[key_i][i] == x[offset+i] ) {
					++ i;
					if( key_array[key_i][i] == '°' ) {
						var argument = '';
					// save argument
						var j = 0;
						var c = '';
						while( (c=x[ offset+i+j ]) != key_array[key_i][i+1] ) {
							argument += c;
							++ j;
						}
					// replace key into value
						x =	x.substr(0, offset)		+ '(' +
							fun[ key_array[key_i] ]	+
							x.substr(offset+i+j, x.length)
						;
					// insert argument at 1st maker
						x = x.replace( '°', '(' + argument + ')' );
					}
				}
			}
		} return x;
	}
	return {
		FLAG : FLAG,
		T : Token,
		iter : iter,
		empty : empty,
		replace_units : replace_units
	};
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
'use strict';
// may rename into `Mantic' or `Mantrix'
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.semantix = ( function() {
	//=============================================================================
	/**STRUCT**/
	//=============================================================================
	// struct Seman.Q represents a product
	function Q(f, i, s) {
		this.fact = 1.0;	// constant		: number
		this.imag = { };	// imaginary	: string
		this.sums = [ ];	// summarys		: [][]Q
		if(f !== undefined) this.fact *= f;
		if(i !== undefined) this.imag = i; // assign?
		if(s !== undefined) this.sums = s; // assign?
		this.calc	= function( ){ return calcQ(this); }
		this.ident	= function( ){ return identQ(this); };
		this.string	= function( ){ return stringQ(this); };
		this.pow	= function(v){ return powQ(this, v); };
	};
	// struct Seman.S represents an summary
	function S(o, q, e) {
		this.offset = 0.0;	// constant	: float
		this.queues = [];	// products	: []Q
		this.expont = null;	// exponent	: S
		if(o !== undefined) this.offset += o;
		if(q !== undefined && q.length > 0) this.queues = q;
		if(e !== undefined) this.expont = e;
		this.calc	= function( ){ return calc(this); }
		this.expand	= function( ){ expand(this); return this; };
		this.combine= function( ){ return combine(this); }
		this.expow	= function( ){ return expow(this); };
		this.akinQ	= function( ){ return akinS2Q(this); };
		this.ident	= function( ){ return identS(this); };
		this.string	= function( ){ return string(this); };
		this.simplify=function(n){ return simplify(this, n); }
	};
	function _imag	 ( ){ return Slang._mathslang.imaginary; }
	function _syntax ( ){ return Slang._mathslang.syntax; }
	//=============================================================================
	/**OPERATOR**/
	//=============================================================================
	// string -> S
	function present(s) {
		if(typeof s != "string") throw "`Seman.present(string)' got `"+typeof s+"' instead of `string'";
		var syntax = _syntax( ).present(s);// Slang._mathslang.syntax.clean(syntax);
		return represent(syntax);
	}
	// syntax.Q[ ] -> S
	function represent(qs) {
		var rs = new S();
		qs.forEach(function(q) {
			var q0 = representQ(q);
			if(constQ(q0))	rs.offset += q0.fact;
			else			rs.queues.push(q0);
		});
		rs = solidify(rs);
		return rs;
	}
	// Slang._mathslang.syntax.Q -> Q
	function representQ(q) {
		var rq = new Q;
		rq.fact = q.fact ? q.fact.reduce(function(a,b){return a*b;}, 1) : 1;
		rq.imag = _imag( ).strParse(q.imag);
		q.exps.forEach(function(e) {
			var s0 = represent(e.radix);
			var e0 = represent(e.power);
			var e1 = s0.expont;
			s0.expont = e0;
			if(e1) {
				var s1 = new S;
				s0.expont = e1;
				s1.expont = e0;
				s1.queues.push(new Q(1, { }, [s0]));
				s0 = s1;
			}
			rq.sums.push(s0);
		});
		q.sums.forEach(function(qs){
			var s = represent(qs);
			rq.sums.push(s);
		});
		return rq;
	}
	// Q -> boolean
	function constQ(q) {
		return 0==_imag( ).len(q.imag)
			&& 0==q.sums.length;
		// summarys also might be constant! problem?
	};
	// S -> S
	function solidify(s) {
		// a^2
		var constPow = s.expont ? s.expont.calc() : NaN;
		if(0==s.offset
		&& 1==s.queues.length
		&& 1==s.queues[0].fact
		&& 0==s.queues[0].sums
		&& !isNaN(constPow)) {
			_imag( ).pow(s.queues[0].imag, constPow);
			s.expont = null;
		} else
			s.queues.forEach(function(q0) {
				return q0.sums.map(function(s0){ return solidify(s0); })
			});
		return 0==s.offset
			&& 1==s.queues.length
			&& !s.expont
			&& 1==s.queues[0].fact
			&& 0==_imag( ).len(s.queues[0].imag)
			&& 1==s.queues[0].sums.length
			? solidify(s.queues[0].sums[0])
			: s;
	};
	// Q -> Q
	function solidifyQ(q) {
		return 1==q.fact
			&& 0==_imag( ).len(q.imag)
			&& 1==q.sums.length
			&& 0==q.sums[0].offset
			&& !q.sums[0].expont
			&& 1==q.sums[0].queues.length
			? solidifyQ(q.sums[0].queues[0])
			: q;
	};
	// S -> number
	function calc(s) {
		var value = s.offset + s.queues.reduce(function(a,q){return a+calcQ(q);},0);
		return s.expont ? Math.pow(value, calc(s.expont)) : value;
	};
	// Q -> number
	function calcQ(q) {
		if(Object.keys(q.imag).length > 0) return NaN;
		return q.fact * q.sums.reduce(function(a,s){return a*calc(s);},1);
	};
	// S -> bool
	function akinS2Q(s) {
		if(!s.expont) return false;
		return	s.offset==0 && s.queues.length==1 ? true :
				s.offset!=0 && s.queues.length==0;
	};
	// Q x number -> Q
	function powQ(q, v) {
		return new Q(
			Math.pow(q.fact, v),
			Object.keys(q.imag).reduce(function(a, k) {
				a[k] = q.imag[k] * v; return a;
			}, { })
		);
	};
	// S | Q -> bool
	function identS(s) {
		return s.offset == 0 && s.expont == null && s.queues.length
			? !s.queues.some(calcQ)
			: false;
	};
	function identQ(q) {
		return q.fact * q.sums.reduce(function(a, s) {
			return a * s.calc();
		}, 1) == 1 && _imag( ).empty(q.imag);
	};
	// S | Q -> string
	function string(s) {
		var e = s.expont ? true : false;
		return s.queues.reduce(function(a, q) {
			var strq = q.string();
			return a + (q.fact<0 ? strq : '+'+strq);
		}, (e?'(':'') + s.offset)
		+ (e?')^('+s.expont.string()+')':'');
	};
	function stringQ(q) {
		return q.sums.reduce(function(a, s){
			return a + '(' + s.string() + ')';
		}, ''+q.fact+_imag( ).string(q.imag));
	};
	// S | Q -> S | Q
	function clone(s0) {
		var s1 = new S;
		s1.offset = s0.offset;
		s1.queues = s0.queues.map(cloneQ);
		s1.expont = s0.expont ? clone(s0.expont) : null;
		return s1;
	};
	function cloneQ(q0) {
		var q1 = new Q;
		q1.fact = q0.fact;
		q1.imag = _imag( ).clone(q0.imag);
		q1.sums = q0.sums.map(clone);
		return q1;
	};
	// S x number -> S
	function simplify(s0, times) {
		do {
			s0 = s0.expand();
			s0 = s0.combine();
			s0 = s0.expow();
		} while(--times > 0);
		return s0;
	};
	//=EXPAND======================================================================
	// S -> void
	function expand(s) {
		var i = 0;
		while(i < s.queues.length) {
			// `s0' := expanded part of product-i
			var s0 = extract(s.queues[i]);
			// clear non-summary part of product-i
			_imag( ).clear(s.queues[i].imag);
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
	function extract(q) {
		// initialize summary accumulator
		// sa := (0 + A0)
		var sa = new S(0, [new Q(q.fact, _imag( ).clone(q.imag))]);
		// try to expand every summary `q.sums'
		// - accumulation data `sa'
		// - erasing past summarys in `q.sums'
		var i = 0;
		while(i < q.sums.length) {
			// shit storm recursion
			expand(q.sums[i]);
			// accumulate summary-i
			// conditions:
			// - SQSS == null
			if(q.sums[i].expont == null) {
				// sa -> (A0 + B0) := (A0 + B0) * (Ai + Bi)
				sa = expansion(sa, q.sums[i]);
				q.sums.splice(i, 1);
			} else i++;
			// otherwise summary-i remain the same
			// q -> (A0 + (.. * Si)) (?)
		}
		return sa;
	};
	// S^2 -> S
	// conditions:
	// - SS == null #noexcept
	function expansion(s0, s1) {
		if(s0.expont != null) throw "`expansion': `s0.expont != null'";
		if(s1.expont != null) throw "`expansion': `s1.expont != null'";
		var dc = s0.offset * s1.offset; // k0 * k1
		// + k1 * (a0 + b0) + k0 * (a1 + b1)
		var qs = s0.queues.map(function(q) { // assert?
			return new Q(s1.offset * q.fact, _imag( ).clone(q.imag), q.sums);
		}).concat(s1.queues.map(function(q) { // assert?
			return new Q(s0.offset * q.fact, _imag( ).clone(q.imag), q.sums);
		}));
		// + (a0 + b0) * (a1 + b1)
		s0.queues.forEach(function(q0) {
			s1.queues.forEach(function(q1) {
				var imag = { };
				_imag( ).insert(imag, q0.imag);
				_imag( ).insert(imag, q1.imag);
				qs.push(new Q(q0.fact * q1.fact, _imag( ).sort(imag),
									q0.sums.concat(q1.sums) // assign?
				));
			});
		});
		s0 = new S(dc, qs.filter(function(q){ return q.fact!=0; }));
		return s0;
	}
	//=COMBINE=====================================================================
	// S -> S
	function combine(s) {
		var dc = s.offset;	// direct current summary offset
		var qs = [ ];		// product summary accumulator
		var q0 = undefined;	// product of last iteration step
		var ss = s.expont;	// incoming exponent
		// recursion on exponent
		// conditions:
		// - SS != null
		if(ss) ss = combine(s.expont);
		// product-n iteration
		// accumulators: {dc, qs, q0}
		s.queues.filter(
			// extract constant part
			// qs -> [q0, q1, ..]
			function(q) {
				var v = calcQ(q);
				if(!isNaN(v)) {
					dc += v;
					return false;
				} else return true; }
		).map(
			// tree traversal
			function(q){ combineQ(q); return q; }
		).sort(
			// sort terms by imaginary
			// TODO correct sort algorithm
			function(a, b) {
				return -_imag( ).sortFunc(a.imag, b.imag);
			}
		).forEach(
			// combine imaginary
			// k0*a^2 + k1*a + k2*a
			// -> k0*a^2 + (k1+k2)a
			// conditions:
			// - i0 == i1
			// - QS == []
			function(q1) {
				if(  q0!=undefined	&& _imag( ).equals(q0.imag, q1.imag)
									&& q0.sums.length==0 && q1.sums.length==0 ){
					qs[0].fact += q1.fact;}
				else { qs.unshift(q1); q0 = q1; } }
		);
		qs = qs.filter(function(q){ return q.fact != 0; });
		s = solidify(new S(dc, qs, ss));
		return s;
	};
	// Q -> void
	// combine summarys by totalizing `expont's
	function combineQ(q) {
		var h2is;		// hash from radix to summary indices
		var h2ks;		// radix-keys of `h2is'
		var is2com;		// summary indices to combine
		var is2del = [];// summary indices to delete
		// build up hash out of summary indicies
		h2is = q.sums.reduce(function(a, s, i) {
			// shit storm recursion
			s = s.combine(s);
			var temp = s.expont;	s.expont = null;
			var k	 = string(s);	s.expont = temp;
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
				is2del = is2del.concat(combineE(q.sums, is2com));
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
	function combineE(sums, is2com) {
		if(is2com.length<2) throw "`combineE': "+is2com.length+"/2 indices";
		var is2del = []			// indices to delete
		var eA = new S;	// exponent accumulator
		var s0 = new S;	// radix
		s0.offset = sums[is2com[0]].offset;
		s0.queues = sums[is2com[0]].queues;
		while(is2com.length) {
			var e0 = sums[is2com[0]].expont;
			if(!e0)
				eA.offset++;
			else if(e0.expont)
				eA.queues.push(new Q(1, { },[e0]));
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
	function expow(s0) {
		s0 = powerfy(s0);
		// no recursion on `s0.expont'
		var v = s0.expont ? s0.expont.calc() : NaN;
		// (3+a)^1.7 := 0+(3+a)(3+a)^0.7
		// conditions:
		// - exponent const 
		// - exponent > 1
		if(!isNaN(v)) {
			var rs = [];
			while(v > 1) {
				var s1 = new S;
				s1.offset = s0.offset;
				s1.queues = s0.queues.map(cloneQ);
				rs.push(s1);
				v--;
			} s0.expont = v==1 ? null : new S(v);
			if(rs.length) {
				rs.unshift(s0);
				s0 = new S;
				s0.queues.push(new Q(1, { }, rs));
			}
		} else if(s0.expont && s0.expont.expont) {
			// try to multiply s0^(e0^e1)
			// conditions:
			// - const `e1'
			// TODO - ALSO CHECK IF SENSFUL
		}
		// shit storm recursion
		s0.queues.forEach(function(q) {
			q.sums = q.sums.map(expow);
		});
		s0 = solidify(s0);
		return s0;
	};
	// S -> S
	// behinderter Name
	// das `expow' fuer coole Leute !
	function powerfy(s) {
		if(0==s.offset
		&& 1==s.queues.length
		&& s.expont) {
			var e = s.expont;			// input
			var q = s.queues[0];		// output
			var s = new S(0, [q]);	// output
			for(var i = 0; i < q.sums.length; i++) {
				var xx0 = q.sums[i].expont;
				var xx1 = clone(e);
				q.sums[i].expont = expansion(xx0, xx1);
			}
			// i guess expandSS
			// !!! what about exponts with exponts ?!
			var v = e.calc();
			if(isNaN(v)) {
				q.sums.push(new S(q.fact, q.imag, clone(e)));
				q.fact = 1;
				q.imag = { };// new I;
			} else {
				q.fact = Math.pow(q.fact, v);
				_imag( ).pow(q.imag, v);
			}
		}
		return s;
	};
	//=============================================================================
	// S^2 -> S
	// conditions:
	// - SS == null
	function concatS(s0, s1) {
		return new S(s0.offset+s1.offset, s0.queues.concat(s1.queues));
	};
	// S -> void
	function free_imag(s0) {
		s0.queues.forEach(function(q){
			q.imag = '';
			q.sums.forEach(function(s){
				free_imag(s);
			});
		});
		if( s0.expont )
			free_imag( s0.expont )
		;
	}
	// S -> void
	function free_const(s0) {
		s0.offset = 0;
		s0.queues.forEach(function(q){
			q.fact = 1;
			q.sums.forEach(function(s){
				free_const(s);
			});
		});
		if( s0.expont /*&& isNaN(s0.expont.calc( ))*/ )
			free_const( s0.expont )
		;
	}
	function string_imag(s0) {
		var result = '';
		for( var i=0; i < s0.queues.length; ++i ) {
			var q = s0.queues[i];
			result = Object.keys(q.imag).reduce(function(a, k){
				var times = q.imag[k];
				return a + ( times==+1 ? k : times==-1 ? '1/'+k : k+'^'+times );
			}, result);
			q.sums.forEach(function(s){
				result += '(' + string_imag(s) + ')';
			});
			if( i + 1 < s0.queues.length)
				result += ' + '
			;
		};
		if( s0.expont )
			return result + '^' + string_imag(s0.expont)
		;
		return result;
	}
	return {
		present		: present,
		represent	: represent,
		clone		: clone,
		free_imag	: free_imag,
		free_const	: free_const,
		simplify	: simplify,
		string_imag	: string_imag
	};
})
( );
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
	function _lex( ){ return Slang._mathslang.lexical; }
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
			var q = pluckQ(t);
			if( q ) {
				if(minus)
					q.fact.unshift(-1)
				;
				sum.push(q);
			}
		} while( t.length > 0 );
		sort( sum );		
		return sum;
	};
	// _lex( ).Token[ ] -> Q
	function pluckQ(t) {
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
				if(t.shift().inv) { // sub-case `x^-1'
					var e = new E;
					e.radix.push( X2Q(k) );
					e.power.push( N2Q(-1) );
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
				e.radix = present(t.shift().code);
				e.power = pluckT(t);
			/*	if( switchPowerFact )
					//e.power.forEach(function(q){q.fact*=-1;console.log('-> '+q.fact);})
					e.power.forEach(function(q){q.fact.push(-1);});
					console.log(stringE(e));
				;*/
				q.exps.push(e);
				break;
			} case _lex( ).FLAG.L: // case `need-to-become-lexed'
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
			case _lex( ).FLAG.O:
			default:
				return emptyQ(q) ? null : q;
		}
		return emptyQ(q) ? null : q;
	};
	// Token[] -> Q[]
	function pluckT(t) {
		if(t.length > 0) switch(t[0].flag) {
			case _lex( ).FLAG.N:
				return [ N2Q(t.shift().code) ]
			;
			case _lex( ).FLAG.X:
				return [ X2Q(t.shift( ).code) ];
			;
			case _lex( ).FLAG.E:
				var e = new E;
				if(t[0].inv)
					throw "`pluckT(" + t[0].code + "..)' illegal `inv'"
				;
				e.radix = present(t.shift().code);
				e.power = pluckT(t, true);
				return [E2Q(e)]
			;
			case _lex( ).FLAG.L:
				return present(t.shift( ).code);
			;
			case _lex( ).FLAG.O:
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