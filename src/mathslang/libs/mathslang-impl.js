function match(a, b){
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Seman.present(a);
		b = Seman.present(b);
		if(a.calc() == b.calc()) return true;
		a = a.simplify(3);
		b = b.simplify(3);
		console.log(a.string()+"=="+b.string());
		return a.string() == b.string();
	} catch(e) { return false; }
};
function matchSyntax(a, b){
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Syntax.present(a);
		b = Syntax.present(b);
		return Syntax.string(a) == Syntax.string(b);
	} catch(e) { return false; }

};
function matchApprox(a, b, e) {
	if(typeof a == 'number') a = ''+a;
	if(typeof b == 'number') b = ''+b;
	try {
		if(Lex.empty(a) || Lex.empty(b)) return false;
		a = Seman.present(a).calc();
		b = Seman.present(b).calc();
		if(isNaN(a) ||isNaN(b)) return false;
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