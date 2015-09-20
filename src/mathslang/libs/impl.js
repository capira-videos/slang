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
			a = a.calc( );
			b = b.calc( );
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
		a=a_semantix( ).expand();			console.log(a.string());
		a=a.combine();			console.log(a.string());
		a=a.expow();			console.log(a.string());
		console.log("--------------------------------------");
		a=a_semantix( ).expand();			console.log(a.string());
		a=a.combine();			console.log(a.string());
		a=a.expow();			console.log(a.string());
		console.log("--------------------------------------");
		a=a_semantix( ).expand();			console.log(a.string());
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