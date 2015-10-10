/**
	class macro parses pre-processor styles
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.macro = ( function( ) {
	// string, char -> char
	function _free_id( x, c ) {
		while( x.indexOf( c ) != -1 )
			c = String.fromCharCode( c.charCodeAt(0) + 1 );
		;
		return c;
	}
	function _list_complex_id_underscore( x ) {
		var list	= [ ];
		var index	= 0;
		while( ( index = x.indexOf('_') ) != - 1 ) {
		//	list.push( x[index-1] + x[index+1] );
			list.push( x.substring(index - 1, index + 2) );
			x = x.substring( index + 2 );
		}
		return list;
	}
	function _list_complex_id_prime( x ) {
		var list	= [ ];
		var index	= 0;
		while( ( index = x.indexOf('\'') ) != - 1 ) {
			list.push( x.substring(index - 1, index + 1) );
			x = x.substring( index + 1 );
		}
		return list;
	}
	// string ^ 3 -> string
	function _replace_all( x, key, val ) {
		while( x.indexOf(key) != -1 )
			x = x.replace( key, val )
		;
		return x;
	}
	// string ^ 2 -> string[2]
	function replace_id( x, y ) {
		var complex_id = _list_complex_id_underscore(x).concat
					(	 _list_complex_id_underscore(y)	)
		;
		while( complex_id.length ) {
			var k = complex_id.shift( );
			var v = _free_id( x + y, 'A' );
			x = _replace_all( x, k, v );
			y = _replace_all( y, k, v );
			k = k[0] + k[2];
			x = _replace_all( x, k, v );
			y = _replace_all( y, k, v );
		}
		complex_id = _list_complex_id_prime(x).concat
				(	 _list_complex_id_prime(y)	)
		;
		while( complex_id.length ) {
			var k = complex_id.shift( );
			var v = _free_id( x + y, 'A' );
			x = _replace_all( x, k, v );
			y = _replace_all( y, k, v );
		}
		return[ x, y ];
	}
	return {
		replace_id : replace_id
	};
})
( );