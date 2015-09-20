'use strict';
/**
	class `Imag' is the imaginary part of terms
	required by term representers:
	- `Syntax'
	- `Seman'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang = window.Slang._mathslang || { };
window.Slang._mathslang.imaginary = ( function() {
	/**STRUCT**/
	// struct I represents an imaginary
//	function _I() {}
	/**OPERATOR**/
	// I -> I
	function sort(i0) {
		var ia = { };
		Object.keys(i0).sort(
			function(a, b){ return a.charCodeAt(0)-b.charCodeAt(0); }
		).forEach(
			function(k){ ia[k]=i0[k]; }
		);
		return ia;
	};
	// I^2 -> void
	function insert(a, i) {
		Object.keys(i).forEach(function(k) {
			if(!a[k])	a[k] = i[k];
			else		a[k]+= i[k];
			if(!a[k])	delete a[k];
		});
	};
	// I x number -> void
	function pow(a, x) {
		Object.keys(a).forEach(function(k) {
			if(!x)	delete a[k];
			else	a[k] *= x;
		});
	};
	// I -> bool
	function empty(i0) { return Object.keys(i0).length == 0; };
	// I -> I
	function clone(i) {
		return Object.keys(i).reduce(function(a, k) {
			a[k] = i[k];
			return a;
		}, { });
	};
	// I -> string
	function string(i) {
		return Object.keys(i).reduce(function(a, k) {
			var v = i[k];
			return a + (v==1 ? k : k+'^'+v);
		}, '');
	}
	return {
		sort		: sort,
		insert		: insert,
		pow			: pow,
		empty		: empty,
		clone		: clone,
		string		: string
	};
})();