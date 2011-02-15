var HC = {};

HC.extend = function(desctination, source) {
  for (var key in source){
      desctination[key] = source[key];
  }
}

HC.observable = function(that) {
  var observers = {};
    
  that.on = function(name, fn) {
    if (observers[name] === undefined) {
      observers[name] = [];
    }

    var a = observers[name];
    if (typeof fn === 'function') {
      a.push(fn);      
    }
  }

  that.fire = function(name, data) {
    var a = observers[name] || [];
    for (var i in a) {
      a[i](data);
    }
  }
	
	return that;
}

HC.randomUUID = function() {
  var s = [], itoh = '0123456789ABCDEF';

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random()*0x10);

  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-';

  return s.join('');
};

HC.each = function( object, callback, args ) {
	var name, i = 0,
		length = object.length,
		isObj = length === undefined

		if ( isObj ) {
			for ( name in object ) {
				if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
					break;
				}
			}
		} else {
			for ( var value = object[0];
				i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
		}
	

	return object;
}

HC.isEmptyObject = function( obj ) {
	for ( var name in obj ) {
		return false;
	}
	return true;
}

HC.type= function( obj ) {
	return obj == null ?
		String( obj ) :
		class2type[ toString.call(obj) ] || "object";
}

HC.isArray = Array.isArray || function( obj ) {
	return jQuery.type(obj) === "array";
}

HC.param = function( a, traditional ) {
  var s = [],
	  add = function( key, value ) {
			s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		};
		
	for ( var prefix in a ) {
		buildParams( prefix, a[prefix], traditional, add );
	}
		
	// Return the resulting serialization
	return s.join("&").replace(/%20/g, "+");
}

function buildParams( prefix, obj, traditional, add ) {
	var rbracket = /\[\]$/;
	
	if ( HC.isArray(obj) && obj.length ) {
		// Serialize array item.
		HC.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});
			
	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		if ( HC.isEmptyObject( obj ) ) {
			add( prefix, "" );

		// Serialize object item.
		} else {
			HC.each( obj, function( k, v ) {
				buildParams( prefix + "[" + k + "]", v, traditional, add );
			});
		}
					
	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}


