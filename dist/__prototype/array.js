
'use strict';

Array.prototype.toObject = function() {
	var arr = this,
		res = { } ;
	for (var i = 0 ; i < arr.length ; i++) {
		res[ arr[i] ] = arr[i]
	}
	return res
}

