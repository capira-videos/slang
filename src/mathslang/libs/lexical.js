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
		// x_0 -> Z
	//	x = _replace_varts(x);
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
			else if( r.length && q[0] == '_' )
			{	q.shift()////////////////////////////
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
	function _directional_varts(s, index, sign) {
		var c;
		do {
			c = s[ index += sign ];
			console.log(c + ' ' + _GRAMMAR[FLAG.X].test(c) + ' ' + _GRAMMAR[FLAG.N].test(c) ); 
		} while
		(	_GRAMMAR[FLAG.X].test(c) ||
			_GRAMMAR[FLAG.N].test(c)
		);
		return index;
	}
	// String -> String
/*	function _replace_varts(s) {
		var i;
		while( ( i = s.indexOf('_') ) != - 1 ) {
			var start = _directional_varts(s, i, -1)+1;
			var end   = _directional_varts(s, i, +1);
			var token = s.substring(start, end);
			var x = 'A';
			while( s.indexOf(x) != -1 ) {
				x = String.fromCharCode( x.charCodeAt(0) + 1 );
			}
			while( ( i = s.indexOf(token) ) != -1 ) {
				s = s.substring(0, i) + x + s.substring(i+token.length);
			}
		}
		console.log(s);
		return s;
	}*/
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