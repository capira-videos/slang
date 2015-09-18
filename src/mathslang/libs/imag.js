'use strict';
/**
	class `Imag' is the imaginary part of terms
	required by term representers:
	- `Syntax'
	- `Seman'
**/
window.Slang = window.Slang || { };
window.Slang._mathslang_imag = ( function() {
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
	// I -> void
	function clear(a) {
		Object.keys(a).forEach(function(k){ delete a[k]; });
	};
	// I x number -> void
	function pow(a, x) {
		Object.keys(a).forEach(function(k) {
			if(!x)	delete a[k];
			else	a[k] *= x;
		});
	};
/*	// I^2 -> bool
	function _akin(i0, i1) {
		return Object.keys(i0).toString() == Object.keys(i1).toString();
	};
*/	// I^2 -> bool
	function equals(i0, i1) {
		/*console.log(JSON.stringify(i0)+" == "+JSON.stringify(i1)+
					" => "+(JSON.stringify(i0)==JSON.stringify(i1)));*/
		return JSON.stringify(i0) == JSON.stringify(i1);
	};
	// I -> bool
	function empty(i0) { return Object.keys(i0).length == 0; };
	// I^2 -> number
	function sortFunc(i0, i1) { /*return Imag.sortValue(a.imag)-Imag.sortValue(b.imag);*/
		var keys0 = Object.keys(i0);
		var keys1 = Object.keys(i1);
		var times = Math.min(keys0.length, keys1.length);
		for(var i = 0; i < times; i++)
			if(keys0[i] < keys1[i]) return -1; else
			if(keys0[i] > keys1[i]) return 1;
		var delta = keys0.length - keys1.length;
		if(delta) return delta;
		for(var i = 0; i < times; i++) {
			delta = i0[keys0[i]] - i1[keys1[i]];
			if(delta) return delta;
		} return 0;
	};
	// string^2 -> number
	function strSortFunc(a, b) {
		var times = Math.min(a.length, b.length);
		for(var i = 0; i < times; i++)
			if(a[i] < b[i]) return -1; else
			if(a[i] > b[i]) return 1;
		return a.length - b.length;
	};
	// string -> string
	function strSort(str) {
		return str.split('').sort(function(a, b) {
			return a.charCodeAt(0) - b.charCodeAt(0); }
		).reduce(function(a, c){ return a + c; }, '');
	};
	// string -> I
	function strParse(str) {
		var ri = { };
		for(var i = 0; i < str.length; i++) {
			var c = str[i];
			if(ri[c])	ri[c]++;
			else		ri[c]=1;
		}
		return ri;
	};
	// string -> number
	function strValue(str) {
		var a = 1;
		for(var i = 0; i < str.length; i++)
			a *= str.charCodeAt(0);
		return a;
	};
	// I -> number
	function len(i) { return Object.keys(i).length; };
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
		clear		: clear,
		pow			: pow,
		equals		: equals,
		empty		: empty,
		sortFunc	: sortFunc,
		strSortFunc	: strSortFunc,
		strSort		: strSort,
		strParse	: strParse,
		strValue	: strValue,
		len			: len,
		clone		: clone,
		string		: string
	};
})();