'use strict';
window.Slang = window.Slang || { };
window.Slang._mathslang = ( function() {
	function match(a, b){
		try {
			if(Slang._mathslang_lex.empty(a) || Slang._mathslang_lex.empty(b))
				return false
			;
		//	a = Slang._mathslang_semantix.present(a);
/*console.log('-----------------------');
console.log('a = '+a);
console.log('b = '+b);*/
			a = Slang._mathslang_syntax.present(a);
//console.log('_syntax.present(a) -> '+Slang._mathslang_syntax.string(a));
			b = Slang._mathslang_syntax.present(b);
/*console.log('_syntax.present(b) -> '+Slang._mathslang_syntax.string(b));
console.log('');*/
			if(Slang._mathslang_syntax.string(a) == Slang._mathslang_syntax.string(b)) {
				console.log('syntactic equality: '+Slang._mathslang_syntax.string(a)+' = '+Slang._mathslang_syntax.string(b));
				return true;
			}
//console.log('Slang._mathslang_semantix a');
			a = Slang._mathslang_semantix.represent(a);
/*console.log('_semantix.present(a) -> '+a.string());
console.log('');
console.log('Slang._mathslang_semantix b');*/
			b = Slang._mathslang_semantix.represent(b);
/*console.log('_semantix.present(b) -> '+b.string());
console.log('');*/
			if(a.string() == b.string()) {
				console.log('semantic equality: '+a.string()+' = '+b.string());
				return true;
			}
		//	b = Slang._mathslang_semantix.present(b);
			if(a.calc() == b.calc()) {
				console.log('calculate equality: '+a.string()+' = '+b.string());
				return true;
			}
//console.log('Slang._mathslang_semantix.simplify a');
			a = a.simplify(3);
/*console.log('_semantix.simplify(a, 3) -> '+a.string());
console.log('');
console.log('Slang._mathslang_semantix.simplify b');*/
			b = b.simplify(3);
/*console.log('_semantix.simplify(b, 3) -> '+b.string());
console.log('');*/
			//console.log(a.string()+"=="+b.string());
			if(a.string() == b.string()) {
				console.log('simplify equality: '+a.string()+' = '+b.string());
				return true;
			} else {
				console.log('no equality: '+a.string()+' != '+b.string());
				return false;
			}
		} catch(e) { return false; }
	};
	function matchSyntax(a, b){
		try {
			if(Slang._mathslang_lex.empty(a) || Slang._mathslang_lex.empty(b))
				return false
			;
			a = Slang._mathslang_syntax.present(a);
			b = Slang._mathslang_syntax.present(b);
			return Slang._mathslang_syntax.string(a) == Slang._mathslang_syntax.string(b);
		} catch(e) { return false; }

	};
	function matchApprox(a, b, e) {
		if(typeof a == 'number') a = ''+a;
		if(typeof b == 'number') b = ''+b;
		try {
			if(Slang._mathslang_lex.empty(a) || Slang._mathslang_lex.empty(b))
				return false
			;
			a = Slang._mathslang_semantix.present(a).calc();
			b = Slang._mathslang_semantix.present(b).calc();
			if(isNaN(a) ||isNaN(b))
				return false
			;
			return Math.abs(a-b) <= e;
		} catch(e) { return false; }
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
		match : match,
		matchSyntax : matchSyntax,
		matchApprox : matchApprox
	};
})
( );