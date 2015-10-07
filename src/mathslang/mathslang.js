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
//		console.log(u.trim( ));
		return u.trim( );
		/*if( (index=u.indexOf('distance')) != -1 )
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
	function _macro( )		{ return Slang._mathslang.macro; }
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
		// parse complex identifiers
			{	var temp = _macro( ).replace_id( a, b );
				a = temp[0];
				b = temp[1];
			}
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
		// parse complex identifiers
			{	var temp = _macro( ).replace_id( a, b );
				a = temp[0];
				b = temp[1];
			}
		// parse into `syntax'
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
		// parse complex identifiers
			{	var temp = _macro( ).replace_id( a, b );
				a = temp[0];
				b = temp[1];
			}
		// parse into `semantix'
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