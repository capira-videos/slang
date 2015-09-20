'use strict';
// may rename into `Mantic' or `Mantrix'
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.semantix = ( function() {
	//=============================================================================
	/**STRUCT**/
	//=============================================================================
	// struct Seman.Q represents a product
	function Q(f, i, s) { return {
		fact : f !== undefined ? f : 1.0,
		imag : i !== undefined ? i : { },
		sums : s !== undefined ? s : [ ],
		calc	: function( ){ return calcQ(this); },
		ident	: function( ){ return identQ(this); },
		string	: function( ){ return stringQ(this); },
		pow		: function(v){ return powQ(this, v); }
	}; };
	// struct Seman.S represents an summary
	function S(o, q, e) { return {
		offset : o !== undefined				 ? o : 0.0,  // constant : float
		queues : q !== undefined && q.length > 0 ? q : [ ],  // products : Q[ ]
		expont : e !== undefined				 ? e : null, // exponent : S
		calc	: function( ){ return calc(this); },
		expand	: function( ){ expand(this); return this; },
		combine : function( ){ return combine(this); },
		expow	: function( ){ return expow(this); },
		akinQ	: function( ){ return akinS2Q(this); },
		ident	: function( ){ return identS(this); },
		string	: function( ){ return string(this); },
		simplify: function(n){ return simplify(this, n); }
	}; };
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
			var q0 = representQ(q);
			if(constQ(q0))	rs.offset += q0.fact;
			else			rs.queues.push(q0);
		});
		rs = solidify(rs);
		return rs;
	}
	// Slang._mathslang.syntax.Q -> Q
	function representQ(q) {
		var rq = new Q;
		rq.fact = q.fact ? q.fact.reduce(function(a,b){return a*b;}, 1) : 1;
		rq.imag = _imag( ).strParse(q.imag);
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
			rq.sums.push(s0);
		});
		q.sums.forEach(function(qs){
			var s = represent(qs);
			rq.sums.push(s);
		});
		return rq;
	}
	// Q -> boolean
	function constQ(q) {
		return 0==_imag( ).len(q.imag)
			&& 0==q.sums.length;
		// summarys also might be constant! problem?
	};
	// S -> S
	function solidify(s) {
		// a^2
		var constPow = s.expont ? s.expont.calc() : NaN;
		if(0==s.offset
		&& 1==s.queues.length
		&& 1==s.queues[0].fact
		&& 0==s.queues[0].sums
		&& !isNaN(constPow)) {
			_imag( ).pow(s.queues[0].imag, constPow);
			s.expont = null;
		} else
			s.queues.forEach(function(q0) {
				return q0.sums.map(function(s0){ return solidify(s0); })
			});
		return 0==s.offset
			&& 1==s.queues.length
			&& !s.expont
			&& 1==s.queues[0].fact
			&& 0==_imag( ).len(s.queues[0].imag)
			&& 1==s.queues[0].sums.length
			? solidify(s.queues[0].sums[0])
			: s;
	};
	// Q -> Q
	function solidifyQ(q) {
		return 1==q.fact
			&& 0==_imag( ).len(q.imag)
			&& 1==q.sums.length
			&& 0==q.sums[0].offset
			&& !q.sums[0].expont
			&& 1==q.sums[0].queues.length
			? solidifyQ(q.sums[0].queues[0])
			: q;
	};
	// S -> number
	function calc(s) {
		var value = s.offset + s.queues.reduce(function(a,q){return a+calcQ(q);},0);
		return s.expont ? Math.pow(value, calc(s.expont)) : value;
	};
	// Q -> number
	function calcQ(q) {
		if(Object.keys(q.imag).length > 0) return NaN;
		return q.fact * q.sums.reduce(function(a,s){return a*calc(s);},1);
	};
	// S -> bool
	function akinS2Q(s) {
		if(!s.expont) return false;
		return	s.offset==0 && s.queues.length==1 ? true :
				s.offset!=0 && s.queues.length==0;
	};
	// Q x number -> Q
	function powQ(q, v) {
		return new Q(
			Math.pow(q.fact, v),
			Object.keys(q.imag).reduce(function(a, k) {
				a[k] = q.imag[k] * v; return a;
			}, { })
		);
	};
	// S | Q -> bool
	function identS(s) {
		return s.offset == 0 && s.expont == null && s.queues.length
			? !s.queues.some(calcQ)
			: false;
	};
	function identQ(q) {
		return q.fact * q.sums.reduce(function(a, s) {
			return a * s.calc();
		}, 1) == 1 && _imag( ).empty(q.imag);
	};
	// S | Q -> string
	function string(s) {
		var e = s.expont ? true : false;
		return s.queues.reduce(function(a, q) {
			var strq = q.string();
			return a + (q.fact<0 ? strq : '+'+strq);
		}, (e?'(':'') + s.offset)
		+ (e?')^('+s.expont.string()+')':'');
	};
	function stringQ(q) {
		return q.sums.reduce(function(a, s){
			return a + '(' + s.string() + ')';
		}, ''+q.fact+_imag( ).string(q.imag));
	};
	// S | Q -> S | Q
	function clone(s0) {
		var s1 = new S;
		s1.offset = s0.offset;
		s1.queues = s0.queues.map(cloneQ);
		s1.expont = s0.expont ? clone(s0.expont) : null;
		return s1;
	};
	function cloneQ(q0) {
		var q1 = new Q;
		q1.fact = q0.fact;
		q1.imag = _imag( ).clone(q0.imag);
		q1.sums = q0.sums.map(clone);
		return q1;
	};
	// S x number -> S
	function simplify(s0, times) {
		do {
			s0 = s0.expand();
			s0 = s0.combine();
			s0 = s0.expow();
		} while(--times > 0);
		return s0;
	};
	//=EXPAND======================================================================
	// S -> void
	function expand(s) {
		var i = 0;
		while(i < s.queues.length) {
			// `s0' := expanded part of product-i
			var s0 = extract(s.queues[i]);
			// clear non-summary part of product-i
			_imag( ).clear(s.queues[i].imag);
			s.queues[i].fact = 1;
			// try to through `s0' out of its product
			// conditions:
			// - product as identity element leftover
			// - `s0.expont' == null #noexcept
			if(s.queues[i].ident()) {
				if(s0.expont) throw "`expand': `s0.expont' must be `null'.";
				// delete identity element product-i
				s.queues.splice(i, 1);
				// concat `s0' to base summary
				s.offset += s0.offset;
				s.queues = s0.queues.concat(s.queues);
				// correct iteration index
				i += s0.queues.length;
			} else {
				// otherwise put `s0' back to product-i
				// conditions:
				// - `calc s0' != `const 1'
				if(s0.calc() != 1)
					s.queues[i].sums.push(s0);
				i++;
			}
		};
	};
	// Q -> S
	function extract(q) {
		// initialize summary accumulator
		// sa := (0 + A0)
		var sa = new S(0, [new Q(q.fact, _imag( ).clone(q.imag))]);
		// try to expand every summary `q.sums'
		// - accumulation data `sa'
		// - erasing past summarys in `q.sums'
		var i = 0;
		while(i < q.sums.length) {
			// shit storm recursion
			expand(q.sums[i]);
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
	//=COMBINE=====================================================================
	// S -> S
	function combine(s) {
		var dc = s.offset;	// direct current summary offset
		var qs = [ ];		// product summary accumulator
		var q0 = undefined;	// product of last iteration step
		var ss = s.expont;	// incoming exponent
		// recursion on exponent
		// conditions:
		// - SS != null
		if(ss) ss = combine(s.expont);
		// product-n iteration
		// accumulators: {dc, qs, q0}
		s.queues.filter(
			// extract constant part
			// qs -> [q0, q1, ..]
			function(q) {
				var v = calcQ(q);
				if(!isNaN(v)) {
					dc += v;
					return false;
				} else return true; }
		).map(
			// tree traversal
			function(q){ combineQ(q); return q; }
		).sort(
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
		s = solidify(new S(dc, qs, ss));
		return s;
	};
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
			var k	 = string(s);	s.expont = temp;
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
	//=EXPOW=======================================================================
	// S -> S
	function expow(s0) {
		s0 = powerfy(s0);
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
			q.sums = q.sums.map(expow);
		});
		s0 = solidify(s0);
		return s0;
	};
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
			for(var i = 0; i < q.sums.length; i++) {
				var xx0 = q.sums[i].expont;
				var xx1 = clone(e);
				q.sums[i].expont = expansion(xx0, xx1);
			}
			// i guess expandSS
			// !!! what about exponts with exponts ?!
			var v = e.calc();
			if(isNaN(v)) {
				q.sums.push(new S(q.fact, q.imag, clone(e)));
				q.fact = 1;
				q.imag = { };// new I;
			} else {
				q.fact = Math.pow(q.fact, v);
				_imag( ).pow(q.imag, v);
			}
		}
		return s;
	};
	//=============================================================================
	// S^2 -> S
	// conditions:
	// - SS == null
	function concatS(s0, s1) {
		return new S(s0.offset+s1.offset, s0.queues.concat(s1.queues));
	};
	// S -> void
	function free_imag(s0) {
		s0.queues.forEach(function(q){
			q.imag = '';
			q.sums.forEach(function(s){
				free_imag(s);
			});
		});
		if( s0.expont )
			free_imag( s0.expont )
		;
	}
	// S -> void
	function free_const(s0) {
		s0.offset = 0;
		s0.queues.forEach(function(q){
			q.fact = 1;
			q.sums.forEach(function(s){
				free_const(s);
			});
		});
		if( s0.expont /*&& isNaN(s0.expont.calc( ))*/ )
			free_const( s0.expont )
		;
	}
	function string_imag(s0) {
		var result = '';
		for( var i=0; i < s0.queues.length; ++i ) {
			var q = s0.queues[i];
			result = Object.keys(q.imag).reduce(function(a, k){
				var times = q.imag[k];
				return a + ( times==+1 ? k : times==-1 ? '1/'+k : k+'^'+times );
			}, result);
			q.sums.forEach(function(s){
				result += '(' + string_imag(s) + ')';
			});
			if( i + 1 < s0.queues.length)
				result += ' + '
			;
		};
		if( s0.expont )
			return result + '^' + string_imag(s0.expont)
		;
		return result;
	}
	return {
		present		: present,
		represent	: represent,
		clone		: clone,
		free_imag	: free_imag,
		free_const	: free_const,
		simplify	: simplify,
		string_imag	: string_imag
	};
})
( );