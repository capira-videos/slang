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
				sa = expansion(sa, q.sums[i]);
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
	S.prototype.calc = function( ) {
		var value = this.offset + this.queues.reduce(function(a,q){return a+calcQ(q);},0);
		return this.expont ? Math.pow(value, this.expont.calc( )) : value;
	}
	S.prototype.expand	= function( ) {
		var i = 0;
		while( i < this.queues.length ) {
			// `s0' := expanded part of product-i
			var s0 = this.queues[i].extract( );
			// clear non-summary part of product-i
			_imag( ).clear( this.queues[i].imag );
			this.queues[i].fact = 1;
			// try to through `s0' out of its product
			// conditions:
			// - product as identity element leftover
			// - `s0.expont' == null #noexcept
			if( this.queues[i].ident( ) ) {
				if(s0.expont) throw "`expand': `s0.expont' must be `null'.";
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
				var v = calcQ(q);
				if(!isNaN(v)) {
					dc += v;
					return false;
				} else return true; }
		).map( combineQ ).sort( // tree traversal
			// sort terms by imaginary
			// TODO correct sort algorithm
			function(a, b) {
				return -_imag( ).sortFunc(a.imag, b.imag);
			}
		).forEach(
			// combine imaginary
			// k0*a^2 + k1*a + k2*a
			// -> k0*a^2 + (k1+k2)a
			// conditions:
			// - i0 == i1
			// - QS == []
			function(q1) {
				if(  q0!=undefined	&& _imag( ).equals(q0.imag, q1.imag)
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
					q.sums[i].expont = expansion(q.sums[i].expont, e.clone( ))
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
				s1.queues = s0.queues.map(cloneQ);
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
			&& 0==_imag( ).len(s.queues[0].imag)
			&& 1==s.queues[0].sums.length
			? s.queues[0].sums[0].solidify( )
			: s;
	};
	S.prototype.clone = function( ) {
		var s0 = this;
		var s1 = new S;
		s1.offset = s0.offset;
		s1.queues = s0.queues.map(cloneQ);
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
	function _imag	 ( ){ return Slang._mathslang.imaginary; }
	function _syntax ( ){ return Slang._mathslang.syntax; }
	//=============================================================================
	/**OPERATOR**/
	//=============================================================================
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
			q0.imag = _imag( ).strParse(q.imag);
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
			if(constQ(q0))	rs.offset += q0.fact;
			else			rs.queues.push(q0);
		});
		rs = rs.solidify( );
		return rs;
	}
	// Q -> boolean
	function constQ(q) {
		return 0==_imag( ).len(q.imag)
			&& 0==q.sums.length;
		// summarys also might be constant! problem?
	};
	// Q -> number
	function calcQ(q) {
		if(Object.keys(q.imag).length > 0) return NaN;
		return q.fact * q.sums.reduce(function(a,s){return a*s.calc( );},1);
	};
	function cloneQ(q0) {
		var q1 = new Q;
		q1.fact = q0.fact;
		q1.imag = _imag( ).clone(q0.imag);
		q1.sums = q0.sums.map( function(s){ return s.clone( ); } );
		return q1;
	};
	// S^2 -> S
	// conditions:
	// - SS == null #noexcept
	function expansion(s0, s1) {
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
	function combineQ(q) {
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
				is2del = is2del.concat(combineE(q.sums, is2com));
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
	function combineE(sums, is2com) {
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
	// S -> void
	function free_imag(s0) {
		s0.queues.forEach(function(q){
			q.imag = '';
			q.sums.forEach(function(s){
				s.free_imag( );
			});
		});
		if( s0.expont )
			s0.expont.free_imag( )
		;
	}
	function unit(s0) {
		var result = '';
		for( var i=0; i < s0.queues.length; ++i ) {
			var q = s0.queues[i];
			result = Object.keys(q.imag).reduce(function(a, k){
				var times = q.imag[k];
				return a + ( times==+1 ? k : times==-1 ? '1/'+k : k+'^'+times );
			}, result);
			q.sums.forEach(function(s){
				result += '(' + unit(s) + ')';
			});
			if( i + 1 < s0.queues.length)
				result += ' + '
			;
		};
		if( s0.expont )
			return result + '^' + unit(s0.expont)
		;
		return result;
	}
	return {
		present		: present,
		represent	: represent,
		unit		: unit
	};
})
( );