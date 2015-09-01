/**
	class Syntax is a syntactical representation
	important to include it's helper-class `Lex'
**/
function Syntax() {};
/**STRUCT**/
// struct Syntax.Q represents a product
Syntax.Q = function(/*f, i, e, s*/) {
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
Syntax.E = function(/*r, p*/) {
	this.radix = []; // base by sum	: []Syntax.Q
	this.power = []; // pow by sum	: []Syntax.Q
	/*if(r !=== undefined) this.radix = r;
	if(p !=== undefined) this.power = p;*/
};
/**OPERATOR**/
// string -> Q[]
Syntax.present = function(s) {
	if(typeof s != "string") throw "`Syntax.present(string)' got `"+typeof s+"' instead of `string'";
	var t = Lex.iter(s);
	var sum = [];
	do {
		var minus = false;
		while(t.length > 0 && t[0].flag == Lex.F.O)
			if(t.shift().inv) minus = !minus;
		var q = this.pluckQ(t);
		if(q) {
			if(minus) q.fact.unshift(-1);
			sum.push(q);
		}
	} while(t.length > 0);
	this.sort(sum);
	return sum;
};
// T[] -> Q
Syntax.pluckQ = function(t) {
	var q = new this.Q();
	while(t.length > 0) switch(t[0].flag) {
		case Lex.F.N: { // case `number'
			var x = parseFloat(t[0].code);
			if(t.shift().inv) { // sub-case `x^-1'
				if(x == 0) throw "`pluckQ' divided by 0.";
				x = 1 / x;
			} q.fact.push(x); break;
		} case Lex.F.X: { // case `identifier'
			var k = t[0].code
			if(t.shift().inv) {
				var e = new this.E;
				e.radix.push(this.X2Q(k));
				e.power.push(this.N2Q(-1));
				q.exps.push(e);
			} else
				q.imag += k;
			break;
		} case Lex.F.E: { // case `expont'
			var e = new this.E();
			if(t[0].inv) throw "`pluckQ' Token `"+t[0]+"' is not allowed to be `inv'";
			e.radix = this.present(t.shift().code);
			e.power = this.pluckT(t);
			q.exps.push(e); break;
		} case Lex.F.L:
			var qs = this.present(t[0].code);
			if(t.shift().inv) {
				var e = new this.E;
				e.radix = qs;
				e.power.push(this.N2Q(-1));
				q.exps.push(e);
			} else q.sums.push(qs);
			break;
		case Lex.F.O:
		default:
			return this.emptyQ(q) ? null : q;
	}
	return this.emptyQ(q) ? null : q;
};
// T[] -> Q[]
Syntax.pluckT = function(t) {
	if(t.length > 0) switch(t[0].flag) {
		case Lex.F.N: return [this.N2Q(t.shift().code)];
		case Lex.F.X: return [this.X2Q(t.shift().code)];
		case Lex.F.E:
		{
			var e = new this.E();
			if(t[0].inv) throw "`pluckT' Token `"+t[0]+"' is not allowed to be `inv'";
			e.radix = this.present(t.shift().code);
			e.power = this.pluckT(t);
			return [this.E2Q(e)];
		}
		case Lex.F.L: return this.present(t.shift().code);
		case Lex.F.O:	throw "`pluckT' invalid `flag=O'.";
		default:		throw "`pluckT' invalid `flag=?'.";
	} else throw "`pluckT' without any token.";
};
// Q[] | Q -> void
// not up to date anymore
// method `clean' should become erased
Syntax.clean = function(qs) { qs.forEach(Syntax.cleanQ); };
Syntax.cleanQ = function(q) {
	// tree recursion
	q.sums.forEach(Syntax.clean);
	q.exps.forEach(function(e) {
		Syntax.clean(e.radix);
		Syntax.clean(e.power);
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
			/*Imag.pow(e.radix[0].imag, e.power[0].fact[0]);
			Imag.insert(q.imag, e.radix[0].imag);*/
			q.exps.splice(i, 1);
		} else i++;
	}
}
Syntax.N2Q = function(e) { var q = new this.Q(); q.fact.push(e); return q; };
Syntax.X2Q = function(e) { var q = new this.Q(); q.imag = e; return q; };
Syntax.E2Q = function(e) { var q = new this.Q(); q.exps.push(e); return q; };
// Q[] | Q -> void
Syntax.sort = function(qs) {
	qs.forEach(function(q){ Syntax.sortQ(q); });
	qs.sort(function(a,b){ return Imag.strSortFunc(a.imag, b.imag); });
};
Syntax.sortQ = function(q) {
	q.sums.forEach(function(qs){ Syntax.sort(qs); });
	q.fact.sort(function(a, b){ return a - b; });
	q.imag = Imag.strSort(q.imag);
	q.exps.sort(function(a, b){ return Syntax.valueE(a) - Syntax.valueE(b); });
	q.sums.sort(function(a, b){ return Syntax.value(a) - Syntax.value(b); });
};
// Q[] | E | Q -> number
Syntax.value = function(qs) { return qs.reduce(function(a, b){return a + Syntax.valueQ(b);}, 0); };
Syntax.valueE = function(e) { return Math.pow(16536421.3572347 + this.value(e.radix), this.value(e.power)); };
Syntax.valueQ = function(q) {
	return	q.fact.reduce(function(a, b){return a * b;}, 1) *
			Imag.strValue(q.imag) *
			q.exps.reduce(function(a,b){return a*Syntax.valueE(b);},1) *
			q.sums.reduce(function(a,b){return a*Syntax.value(b);},1);
};
// Q -> bool
Syntax.emptyQ = function(e) {
	return e.fact.length == 0
		&& e.imag.length == 0
		&& e.exps.length == 0
		&& e.sums.length == 0;
};
// Q[] | Q | E -> string
Syntax.string = function(qs) {
	var str = ''
	if(qs.length) {
		str += this.stringQ(qs[0]);
		for(var i = 1; i < qs.length; i++) {
			var fact = qs[i].fact.reduce(function(a,e){return a*e;},1);
			var strq = this.stringQ(qs[i]);
			str += fact<0 ? strq : '+'+strq; 
		}
	}
	return str;
};
Syntax.stringQ = function(q) {
	var str = ''
	if(q.fact.length) {
		str += q.fact[0];
		for(var i = 1; i < q.fact.length; i++)
			str += '*' + q.fact[i];
	}
	str += q.imag;
	str += q.exps.reduce(function(a, e){return a+Syntax.stringE(e);},'');
	str += q.sums.reduce(function(a, s){return a+'('+Syntax.string(s)+')';},'');
	return str;
};
Syntax.stringE = function(e) {
	return '(' + Syntax.string(e.radix) + ')^(' + Syntax.string(e.power) + ')';
};