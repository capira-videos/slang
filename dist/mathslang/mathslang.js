'use strict';
window.Slang = window.Slang || { };
window.Slang.mathslang = ( function( ) {
	function compare(expectedValue, givenValue, _units) {
		return Slang.logicslang.compare(expectedValue, givenValue, this._compare, _units);
	}
	function _compare(expectedValue, givenValue, _units) {
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
					return match(expectedValue, givenValue, _units);

				case 'identic':
					return matchSyntax(expectedValue, givenValue); // _units

				case 'approx':
					var values = expectedValue.split('#epsilon');
					return matchApprox(values[0], givenValue, values[1], _units);

				case 'lt':
					return parseFloat(givenValue) < parseFloat(expectedValue);

				case 'leq':
					return parseFloat(givenValue) <= parseFloat(expectedValue);

				case 'gt':
					return parseFloat(givenValue) > parseFloat(expectedValue);

				case 'geq':
					return parseFloat(givenValue) >= parseFloat(expectedValue);
				case 'vecEquals':
					return Slang._mathslang.vec.compare(expectedValue,givenValue);
				default:
					return expectedValue === givenValue;
			}

		}
	}
	function extractUnit(s) {
		var u = '';
		if( [/Km/, /km/, /dm/, /cm/, /mm/].some( function(e){ return e.test(s); }) ) {
			u += 'distance ';
		}
		if( [/Kg/, /kg/, /g/, /mg/].some( function(e){ return e.test(s); }) ) {
			u += 'weight ';
		}
		if( [/h/, /min/, /s/, /ms/].some( function(e){ return e.test(s); }) ) {
			u += 'time ';
		}
		var index;
		var q = s.split('m');
		if( u.indexOf('distance')==-1 && q.length>1 && q.some(function(e){
			var x = 'gs'.split('').every(function(c){ return !e.length||c!=e[0]; });
			var y = 'Kkdc'.split('').every(function(c){ return !e.length||c!=e[e.length-1]; });
			return x && y;
		})  )
			u = 'distance '+u;
		;
		console.log(u.trim( ));
		return u.trim( );
		/*if( (index=u.indexOf('distance')) != -1 )
				case 'weight':
					s = s.replace(/ton/g, '(�1000000g)');
					if( t_is_ton )
						s = s.replace(/t/g, '(�1000000g)');
					;
					s = s.replace(/Kg/g, '(�1000g)');
					s = s.replace(/kg/g, '(�1000g)');
					s = s.replace(/mg/g, '(�0.001g)');
					break;
				case 'distance':
					s = s.replace( /Km/g,  '(� 1000m)');
					s = s.replace( /km/g,  '(� 1000m)');
					s = s.replace( /dm/g, '(� 0.100m)');
					s = s.replace( /cm/g, '(� 0.010m)');
					s = s.replace( /mm/g, '(� 0.001m)');
					s = s.replace(/min/g,    '(� 60s)');
					s = s.replace(  /m/g,      '(� m)');
					m_is_min = false;
					break;
				case 'time':
					s = s.replace(/min/g, '(� 60s)');
					if( m_is_min )
						s = s.replace(/m/g, '(� 60s)')
					;
					s = s.replace(/h/g, '(� 3600s)');
					s = s.replace(/s/g, '(� s)');
					t_is_ton = false;
					break;
				default:
					throw "mathslang does not support unit `"+u+"'";*/
	}
	function stringUnit(a, _units) {
		if( _units )
			a = _lex( ).replace_units(a, _units)
		;
		a = _semantix( ).present(a);
		a = a.simplify(3);
		a.free_const( );
		a = a.unit( );
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
// private
	function _log(e)		{ }//{ console.log(e); }
	function _lex( )		{ return Slang._mathslang.lexical; }
	function _syntax( )		{ return Slang._mathslang.syntax; }
	function _semantix( )	{ return Slang._mathslang.semantix; }
	function match(a, b, _units) {
		try {
		// unit preprocessor
			if(_units) {
				a = _lex( ).replace_units(a, _units);
				b = _lex( ).replace_units(b, _units);
			}
		// case `empty string'
			if( _lex( ).empty(a) || _lex( ).empty(b) )
				return false
			;
		// parse into `syntax'
			a = _syntax( ).present(a);
			b = _syntax( ).present(b);
		// syntactical equality ?
			if( _syntax( ).string(a) == _syntax( ).string(b) ) {
				_log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
		// parse into `semantix'
			a = _semantix( ).represent(a);
			b = _semantix( ).represent(b);
		// syntactical equality ?
			if( a.string( ) == b.string( ) ) {
				_log('semantix equality: '+a.string()+' = '+b.string());
				return true;
			}
		// non-imaginary computable ?
			if( a.calc( ) == b.calc( ) ) {
				_log('constant equality: '+a.string( )+' = '+b.string( ));
				return true;
			}
		// normalize expression
			a = a.simplify(3);
			b = b.simplify(3);
		// semantical equality ?
			if( a.string( ) == b.string( ) ) {
				_log('simplify equality: '+a.string( )+' = '+b.string( ));
				return true;
			} else {
				_log('no semantix equality: '+a.string( )+' = '+b.string( ));
				return false;
			}
		} catch(e) { return false; }
	};
	function matchSyntax(a, b, _units){
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
				_log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
			_log('no syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
			return false;
		} catch(e) { return false; }

	};
	function matchApprox(a, b, e, _units) {
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
			{	var unit_a = a.clone( );
				var unit_b = b.clone( );
				unit_a.free_const( );
				unit_b.free_const( );
				unit_a = unit_a.simplify(3);
				unit_b = unit_b.simplify(3);
				if( unit_a.string( ) != unit_b.string( ) )
					return false
				;
			}
			a.free_imag( );
			b.free_imag( );
			a = a.simplify(2);
			b = b.simplify(2);
			a = a.calc( );
			b = b.calc( );
			if( isNaN(a) || isNaN(b) )
				return false
			;
			if( Math.abs(a-b) <= e+0.000000000000000231 ) {
				_log('approx equality: '+a+' = '+b+' (epsilon = '+e+')');
				return true;
			}
			return false;
		} catch(e) { return false; }
	}
// public function as JSON
	return {
		compare		: compare,
		_compare	: _compare,
		extractUnit	: extractUnit,
		stringUnit	: stringUnit
	};
})
( );
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
	// I x number -> void
	function pow(a, x) {
		Object.keys(a).forEach(function(k) {
			if(!x)	delete a[k];
			else	a[k] *= x;
		});
	};
	// I -> bool
	function empty(i0) { return Object.keys(i0).length == 0; };
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
		pow			: pow,
		empty		: empty,
		clone		: clone,
		string		: string
	};
})();
'use strict';
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.impl = ( function() {
	function _log(e)		{ }//{ console.log(e); }
	function _lex( )		{ return Slang._mathslang.lexical; }
	function _syntax( )		{ return Slang._mathslang.syntax; }
	function _semantix( )	{ return Slang._mathslang.semantix; }
	function match(a, b, _units) {
		try {
		// unit preprocessor
			if(_units) {
				a = _lex( ).replace_units(a, _units);
				b = _lex( ).replace_units(b, _units);
			}
		// case `empty string'
			if( _lex( ).empty(a) || _lex( ).empty(b) )
				return false
			;
		// parse into `syntax'
			a = _syntax( ).present(a);
			b = _syntax( ).present(b);
		// syntactical equality ?
			if( _syntax( ).string(a) == _syntax( ).string(b) ) {
				_log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
		// parse into `semantix'
			a = _semantix( ).represent(a);
			b = _semantix( ).represent(b);
		// syntactical equality ?
			if( a.string( ) == b.string( ) ) {
				_log('semantix equality: '+a.string()+' = '+b.string());
				return true;
			}
		// non-imaginary computable ?
			if( a.calc( ) == b.calc( ) ) {
				_log('constant equality: '+a.string( )+' = '+b.string( ));
				return true;
			}
		// normalize expression
			a = a.simplify(3);
			b = b.simplify(3);
		// semantical equality ?
			if( a.string( ) == b.string( ) ) {
				_log('simplify equality: '+a.string( )+' = '+b.string( ));
				return true;
			} else {
				_log('no semantix equality: '+a.string( )+' = '+b.string( ));
				return false;
			}
		} catch(e) { return false; }
	};
	function matchSyntax(a, b, _units){
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
				_log('syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
				return true;
			}
			_log('no syntax equality: '+_syntax( ).string(a)+' = '+_syntax( ).string(b));
			return false;
		} catch(e) { return false; }

	};
	function matchApprox(a, b, e, _units) {
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
			{	var unit_a = a.clone( );
				var unit_b = b.clone( );
				unit_a.free_const( );
				unit_b.free_const( );
				unit_a = unit_a.simplify(3);
				unit_b = unit_b.simplify(3);
				if( unit_a.string( ) != unit_b.string( ) )
					return false
				;
			}
			a.free_imag( );
			b.free_imag( );
			a = a.simplify(2);
			b = b.simplify(2);
			a = a.calc( );
			b = b.calc( );
			if( isNaN(a) || isNaN(b) )
				return false
			;
			if( Math.abs(a-b) <= e+0.000000000000000231 ) {
				_log('approx equality: '+a+' = '+b+' (epsilon = '+e+')');
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
		a.free_const( );
		a = _semantix( ).unit(a);
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
					s = s.replace(/kg/g, '(°1000g)');
					s = s.replace(/mg/g, '(°0.001g)');
					break;
				case 'distance':
					s = s.replace( /Km/g,  '(° 1000m)');
					s = s.replace( /km/g,  '(° 1000m)');
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
		function assign(s, i, c) {
			return s.substr( 0, i ) + c + s.substr( i + c.length );
		}
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
		new Gram(false, /^[a-zA-Zα-ωΓ-Ω]$/),
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
		this.fact = f !== undefined ? f : 1.0;	// constant		: number
		this.imag = i !== undefined ? i : { };	// imaginary	: string
		this.sums = s !== undefined ? s : [ ];	// summarys		: [][]Q
	}
	Q.prototype.ident = function( ) {
		return this.fact * this.sums.reduce(function(a, s) {
			return a * s.calc();
		}, 1) == 1 && _imag( ).empty(this.imag);
	};
	Q.prototype.string = function( ) {
		return this.sums.reduce(function(a, s){
			return a + '(' + s.string() + ')';
		}, ''+this.fact+_imag( ).string(this.imag));
	};
	Q.prototype.pow = function(v) { return new Q
	(	Math.pow(this.fact, v),
		Object.keys(this.imag).reduce(function(a, k) {
			a[k] = this.imag[k] * v;
			return a;
		}, { })
	); };
	Q.prototype.extract = function( ) {
		var q = this;
		// initialize summary accumulator
		// sa := (0 + A0)
		var sa = new S(0, [new Q(q.fact, _imag( ).clone(q.imag))]);
		// try to expand every summary `q.sums'
		// - accumulation data `sa'
		// - erasing past summarys in `q.sums'
		var i = 0;
		while(i < q.sums.length) {
			// shit storm recursion
			q.sums[i].expand( );
			// accumulate summary-i
			// conditions:
			// - SQSS == null
			if(q.sums[i].expont == null) {
				// sa -> (A0 + B0) := (A0 + B0) * (Ai + Bi)
				sa = _expansion(sa, q.sums[i]);
				q.sums.splice(i, 1);
			} else i++;
			// otherwise summary-i remain the same
			// q -> (A0 + (.. * Si)) (?)
		}
		return sa;
	};
	// struct Seman.S represents an summary
	function S(o, q, e) {
		this.offset = o !== undefined ? o : 0.0;			 // constant : float
		this.queues = q !== undefined && q.length ? q : [ ]; // products : []Q
		this.expont = e !== undefined ? e : null;			 // exponent : S
	};
	S.prototype.unit = function( ) {
		var s0 = this;
		var result = '';
		for( var i=0; i < s0.queues.length; ++i ) {
			var q = s0.queues[i];
			result = Object.keys(q.imag).reduce(function(a, k){
				var times = q.imag[k];
				return a + ( times==+1 ? k : times==-1 ? '1/'+k : k+'^'+times );
			}, result);
			q.sums.forEach(function(s){
				result += '(' + s.unit( ) + ')';
			});
			if( i + 1 < s0.queues.length)
				result += ' + '
			;
		};
		if( s0.expont )
			return result + '^' + s0.expont.unit( )
		;
		return result;
	};
	S.prototype.calc = function( ) {
		var value = this.offset + this.queues.reduce(function(a,q){return a+_calcQ(q);},0);
		return this.expont ? Math.pow(value, this.expont.calc( )) : value;
	}
	S.prototype.expand	= function( ) {
		var i = 0;
		while( i < this.queues.length ) {
			// `s0' := expanded part of product-i
			var s0 = this.queues[i].extract( );
			// clear non-summary part of product-i
			{	var a = this.queues[i].imag;
				Object.keys(a).forEach(function(k){ delete a[k]; });
			}
			this.queues[i].fact = 1;
			// try to through `s0' out of its product
			// conditions:
			// - product as identity element leftover
			// - `s0.expont' == null #noexcept
			if( this.queues[i].ident( ) ) {
				if( s0.expont )
					throw "`expand': `s0.expont' must be `null'."
				;
				// delete identity element product-i
				this.queues.splice(i, 1);
				// concat `s0' to base summary
				this.offset += s0.offset;
				this.queues = s0.queues.concat( this.queues );
				// correct iteration index
				i += s0.queues.length;
			} else {
				// otherwise put `s0' back to product-i
				// conditions:
				// - `calc s0' != `const 1'
				if( s0.calc( ) != 1 )
					this.queues[i].sums.push(s0)
				;
				++ i;
			}
		};
		return this;
	};
	S.prototype.combine	= function( ){
		var dc = this.offset;	// direct current summary offset
		var qs = [ ];		// product summary accumulator
		var q0 = undefined;	// product of last iteration step
		var ss = this.expont;	// incoming exponent
		// recursion on exponent
		// conditions:
		// - SS != null
		if(ss) ss = this.expont.combine( );
		// product-n iteration
		// accumulators: {dc, qs, q0}
		this.queues.filter(
			// extract constant part
			// qs -> [q0, q1, ..]
			function(q) {
				var v = _calcQ(q);
				if(!isNaN(v)) {
					dc += v;
					return false;
				} else return true; }
		).map( _combineQ ).sort( // tree traversal
			// sort terms by imaginary
			// TODO correct sort algorithm
			function(a, b) {
				return - (	// I^2 -> number
					function(i0, i1) { /*return Imag.sortValue(a.imag)-Imag.sortValue(b.imag);*/
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
					})
				( a.imag, b.imag );
			}
		).forEach(
			// combine imaginary
			// k0*a^2 + k1*a + k2*a
			// -> k0*a^2 + (k1+k2)a
			// conditions:
			// - i0 == i1
			// - QS == []
			function(q1) {
				if(  q0!=undefined	&& JSON.stringify(q0.imag) == JSON.stringify(q1.imag)
									&& q0.sums.length==0 && q1.sums.length==0 ){
					qs[0].fact += q1.fact;}
				else { qs.unshift(q1); q0 = q1; } }
		);
		qs = qs.filter(function(q){ return q.fact != 0; });
		return ( new S(dc, qs, ss) ).solidify( );
	};
	S.prototype.string = function( ){
		var e = this.expont ? true : false;
		return this.queues.reduce(function(a, q) {
			var strq = q.string( );
			return a + (q.fact<0 ? strq : '+'+strq);
		}, (e?'(':'') + this.offset)
		+ (e?')^('+this.expont.string( )+')':'');
	};
	S.prototype.simplify = function(times) {
		var s0 = this;
		do {
			s0 = s0.expand( );
			s0 = s0.combine( );
			s0 = s0.expow( );
		} while( -- times > 0 );
		return s0;
	};
	S.prototype.expow = function( ) {
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
				for(var i = 0; i < q.sums.length; i++)
					q.sums[i].expont = _expansion(q.sums[i].expont, e.clone( ))
				;
				// i guess expandSS
				// !!! what about exponts with exponts ?!
				var v = e.calc();
				if(isNaN(v)) {
					q.sums.push( new S(q.fact, q.imag, e.clone( )) );
					q.fact = 1;
					q.imag = { };// new I;
				} else {
					q.fact = Math.pow(q.fact, v);
					_imag( ).pow(q.imag, v);
				}
			}
			return s;
		};
		var s0 = powerfy(this);
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
				s1.queues = s0.queues.map( _cloneQ );
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
			q.sums = q.sums.map(function(s){ return s.expow( ); });
		});
		s0 = s0.solidify( );
		return s0;
	};
	S.prototype.solidify = function( ) {
		var s = this;
		// a^2
		var constPow = s.expont ? s.expont.calc( ) : NaN;
		if(0==s.offset
		&& 1==s.queues.length
		&& 1==s.queues[0].fact
		&& 0==s.queues[0].sums
		&& !isNaN(constPow)) {
			_imag( ).pow(s.queues[0].imag, constPow);
			s.expont = null;
		} else
			s.queues.forEach(function(q0) {
				return q0.sums.map(function(s0){ return s0.solidify( ); })
			});
		return 0==s.offset
			&& 1==s.queues.length
			&& !s.expont
			&& 1==s.queues[0].fact
			&& 0==Object.keys( s.queues[0].imag ).length
			&& 1==s.queues[0].sums.length
			? s.queues[0].sums[0].solidify( )
			: s;
	};
	S.prototype.clone = function( ) {
		var s0 = this;
		var s1 = new S;
		s1.offset = s0.offset;
		s1.queues = s0.queues.map( _cloneQ );
		s1.expont = s0.expont ? s0.expont.clone( ) : null;
		return s1;
	};
	S.prototype.free_const = function( ) {
		var s0 = this;
		s0.offset = 0;
		s0.queues.forEach(function(q){
			q.fact = 1;
			q.sums.forEach(function(s){
				s.free_const(  );
			});
		});
		if( s0.expont /*&& isNaN(s0.expont.calc( ))*/ )
			s0.expont.free_const( )
		;
	};
	S.prototype.free_imag = function( ) {
		this.queues.forEach(function(q){
			q.imag = '';
			q.sums.forEach(function(s){
				s.free_imag( );
			});
		});
		if( this.expont )
			this.expont.free_imag( )
		;
	};
// public
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
			var q0 = new Q;
			// compute `representQ'
			q0.fact = q.fact ? q.fact.reduce(function(a,b){return a*b;}, 1) : 1;
			q0.imag = (function(str) {
				var ri = { };
				for(var i = 0; i < str.length; i++) {
					var c = str[i];
					if(ri[c])	ri[c]++;
					else		ri[c]=1;
				}
				return ri;
			})
				(q.imag)
			;
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
				q0.sums.push(s0);
			});
			q.sums.forEach(function(qs){
				var s = represent(qs);
				q0.sums.push(s);
			});
			// using `representQ'
			if(_constQ(q0))	rs.offset += q0.fact;
			else			rs.queues.push(q0);
		});
		rs = rs.solidify( );
		return rs;
	}

// private
	function _imag	 ( ){ return Slang._mathslang.imaginary; }
	function _syntax ( ){ return Slang._mathslang.syntax; }
	// Q -> boolean
	function _constQ(q) {
		return 0==Object.keys( q.imag ).length
			&& 0==q.sums.length;
		// summarys also might be constant! problem?
	};
	// Q -> number
	function _calcQ(q) {
		if(Object.keys(q.imag).length > 0) return NaN;
		return q.fact * q.sums.reduce(function(a,s){return a*s.calc( );},1);
	};
	function _cloneQ(q0) {
		var q1 = new Q;
		q1.fact = q0.fact;
		q1.imag = _imag( ).clone(q0.imag);
		q1.sums = q0.sums.map( function(s){ return s.clone( ); } );
		return q1;
	};
	// S^2 -> S
	// conditions:
	// - SS == null #noexcept
	function _expansion(s0, s1) {
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
	// Q -> void
	// combine summarys by totalizing `expont's
	function _combineQ(q) {
		var h2is;		// hash from radix to summary indices
		var h2ks;		// radix-keys of `h2is'
		var is2com;		// summary indices to combine
		var is2del = [];// summary indices to delete
		// build up hash out of summary indicies
		h2is = q.sums.reduce(function(a, s, i) {
			// shit storm recursion
			s = s.combine(s);
			var temp = s.expont;	s.expont = null;
			var k	 = s.string( );	s.expont = temp;
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
				is2del = is2del.concat( _combineE(q.sums, is2com) );
		}
		// deleting past summarys in `q.sums'
		is2del.sort(function(a,b){ return b-a; }).forEach(
			function(i){ q.sums.splice(i, 1); }
		);
		return q;
	};
	// S[] x number[] -> number[]
	// combines equal summarys by totalizing exponts
	// - `sums'		: array of summarys
	// - `is2com'	: equal summary indices
	// returns summary indices need to delete
	// conditions:
	// - minimum 2 indicies #noexcept
	function _combineE(sums, is2com) {
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
	return {
		present		: present,
		represent	: represent
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
