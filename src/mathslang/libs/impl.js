'use strict';
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.impl = ( function() {
	function match(a, b, _units) {
		try {
			if(_units) {
				a = Slang._mathslang.lexical.replace_units(a, _units);
				b = Slang._mathslang.lexical.replace_units(b, _units);
			}
// console.log("unitified a : "+a);
// console.log("unitified b : "+b);
			if(Slang._mathslang.lexical.empty(a) || Slang._mathslang.lexical.empty(b))
				return false
			;
		//	a = Slang._mathslang.semantix.present(a);
// console.log('-----------------------');
// console.log('a = '+a);
// console.log('b = '+b);
// console.log('');
// console.log("_syntax.present(a=`"+a+"')");
			a = Slang._mathslang.syntax.present(a);
// console.log('-> '+Slang._mathslang.syntax.string(a));
// console.log('');
// console.log("_syntax.present(b=`"+b+"')");
			b = Slang._mathslang.syntax.present(b);
// console.log('-> '+Slang._mathslang.syntax.string(b));
// console.log('');
			if(Slang._mathslang.syntax.string(a) == Slang._mathslang.syntax.string(b)) {
				console.log('syntactic equality: '+Slang._mathslang.syntax.string(a)+' = '+Slang._mathslang.syntax.string(b));
				return true;
			}
// console.log('Slang._mathslang.semantix a');
			a = Slang._mathslang.semantix.represent(a);
// console.log('_semantix.present(a) -> '+a.string());
// console.log('');
// console.log('Slang._mathslang.semantix b');
			b = Slang._mathslang.semantix.represent(b);
// console.log('_semantix.present(b) -> '+b.string());
// console.log('');
			if(a.string() == b.string()) {
				console.log('semantic equality: '+a.string()+' = '+b.string());
				return true;
			}
		//	b = Slang._mathslang.semantix.present(b);
			if(a.calc() == b.calc()) {
				console.log('calculate equality: '+a.string()+' = '+b.string());
				return true;
			}
// console.log('Slang._mathslang.semantix.simplify a');
			a = a.simplify(3);
// console.log('_semantix.simplify(a, 3) -> '+a.string());
// console.log('');
// console.log('Slang._mathslang.semantix.simplify b');
			b = b.simplify(3);
// console.log('_semantix.simplify(b, 3) -> '+b.string());
// console.log('');
			//console.log(a.string()+"=="+b.string());
			if(a.string() == b.string()) {
				console.log('simplify equality: '+a.string()+' = '+b.string());
				return true;
			} else {
				console.log('no equality: '+a.string()+' = '+b.string());
				return false;
			}
		} catch(e) { return false; }
	};
	function matchSyntax(a, b, _units){
		try {
			if(_units) {
				a = Slang._mathslang.lexical.replace_units(a, _units);
				b = Slang._mathslang.lexical.replace_units(b, _units);
			}
			if(Slang._mathslang.lexical.empty(a) || Slang._mathslang.lexical.empty(b))
				return false
			;
			a = Slang._mathslang.syntax.present(a);
			b = Slang._mathslang.syntax.present(b);
			return Slang._mathslang.syntax.string(a) == Slang._mathslang.syntax.string(b);
		} catch(e) { return false; }

	};
	function matchApprox(a, b, e, _units) {
		try {
			if(typeof a == 'number') a = ''+a;
			if(typeof b == 'number') b = ''+b;
			if(typeof e == 'string') e = parseFloat(e);
			if(_units) {
				a = Slang._mathslang.lexical.replace_units(a, _units);
				b = Slang._mathslang.lexical.replace_units(b, _units);
			}
// console.log('after replacing units a = '+a);
// console.log('after replacing units b = '+b);
			if(Slang._mathslang.lexical.empty(a) || Slang._mathslang.lexical.empty(b))
				return false
			;
			
			a = Slang._mathslang.semantix.present(a);
			b = Slang._mathslang.semantix.present(b);
// console.log('arrived in semantix a = '+a.string( ));
// console.log('arrived in semantix b = '+b.string( ));
			{	var unit_a = Slang._mathslang.semantix.clone(a);
				var unit_b = Slang._mathslang.semantix.clone(b);
				Slang._mathslang.semantix.free_const(unit_a);
				Slang._mathslang.semantix.free_const(unit_b);
				unit_a = unit_a.simplify(3);
				unit_b = unit_b.simplify(3);
// console.log('simplified unit semantix a = '+unit_a.string( ));
// console.log('simplified unit semantix b = '+unit_b.string( ));
				if( unit_a.string( ) != unit_b.string( ) )
					return false
				;
				console.log('units-only equality: '+unit_a.string( )+' = '+unit_b.string( ));
			}
			Slang._mathslang.semantix.free_imag(a);
			Slang._mathslang.semantix.free_imag(b);
			a = a.simplify(2);
			b = b.simplify(2);
// console.log('simplified unit free a = '+a.string( ));
// console.log('simplified unit free b = '+b.string( ));
			a = a.calc();
			b = b.calc();
			if(isNaN(a) ||isNaN(b))
				return false
			;
			if( Math.abs(a-b) <= e ) {
				console.log('approx equality: '+a+' = '+b);
				return true;
			}
			return false;
		} catch(e) { return false; }
	}
	function extractUnit(a, _units) {
// console.log('extractUnit(a='+a+')');
		if( _units )
			a = Slang._mathslang.lexical.replace_units(a, _units)
		;
// console.log('replace_units -> '+a);
		a = Slang._mathslang.semantix.present(a);
 // console.log('semantix.present -> '+a.string( ));
		a = a.simplify(3);
 // console.log('semantix.simplify -> '+a.string( ));
		Slang._mathslang.semantix.free_const(a);
 // console.log('semantix.free_const -> '+a.string( ));
console.log('semantix.string_imag -> '+Slang._mathslang.semantix.string_imag(a));
		return Slang._mathslang.semantix.string_imag(a);
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