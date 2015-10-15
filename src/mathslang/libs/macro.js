/**
	class macro parses pre-processor styles
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.macro = ( function( ) {
	var _free_id_pattern = "azAZαωΓΩ";
	// string -> char
	function _free_id( x ) {
		var c = _free_id_pattern[ 0 ];
		var k = _free_id_pattern.substring( 1 );
		while( x.indexOf( c ) != -1 ) {
			var cc = c.charCodeAt(0);
			if( k.length && k.charCodeAt(0) == cc ) {
				k = k.substring( 1 );
				if( ! k.length )
					return ''
				;
				c = k[ 0 ];
				k = k.substring( 1 );
			} else {
				c = String.fromCharCode( cc + 1 );
			}
		}
		return c;
	}
	function _list_complex_id_underscore( x ) {
		var list	= [ ];
		var index	= 0;
		while( ( index = x.indexOf('_') ) != - 1 ) {
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
			var v = _free_id( x + y );
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
			var v = _free_id( x + y );
			x = _replace_all( x, k, v );
			y = _replace_all( y, k, v );
		}
		// (provisorisch)
		// begin `strong-binding-power-in-denominator'
		x = _replace_strong_binding_power_in_denominator( x );
		y = _replace_strong_binding_power_in_denominator( y );
		// end   `strong-binding-power-in-denominator'
		return[ x, y ];
	}
	function _replace_strong_binding_power_in_denominator( x ) {
		var offset = 0;
		var substr = x;
		for( var i=substr.indexOf('/')+1; i&&offset<x.length; i=substr.indexOf('/')+1 ) {
		//	var bracket	= false;
			var substr = x.substr( i );
			offset += i;
			var j = 0;
			var c = substr[j];
			while(	/^\s$/.test(c)			||
					/^[0-9]|\,|\.$/.test(c)	||
					/^[a-zA-Zα-ωΓ-Ω]$/.test(c)	)
			{
				c = substr[++j];
			}
			if( c != '^' ) {
				substr = substr.substr(j);
				offset += j;
				continue;
			}
			c = substr[++j];
			while(	/^\s$/.test(c)			||
					/^[0-9]|\,|\.$/.test(c)	||
					/^[a-zA-Zα-ωΓ-Ω]$/.test(c)	)
			{
				c = substr[++j];
			}
			x = x.substr(0,offset)+'('+x.substr(offset,offset+j)+')'+x.substr(offset+j);
			j += 2;
			offset += j;
			substr = substr.substr(2+j);
		}
		return x;
	}
	return {
		replace_id : replace_id
	};
})
( );