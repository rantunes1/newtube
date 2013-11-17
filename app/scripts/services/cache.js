'use strict';

angular.module('U2bApp.services.cache', ['U2bApp.services.globals'])

.factory('CacheService', ['$window', '$cacheFactory', '$log', 'store',
    function($window, $cacheFactory, $log, store) {
        'use strict';
    
        var _cache = $cacheFactory('CACHE_SERVICE', {
            capacity : 5
        });
    
        //the database
        var _storage = {};
    
        //@todo? should this be in globals ?
        angular.element($window).on('unload', function() {
            store.setAll(_storage);
            //persist cache to local database on application exit
        });
    
        var get = function(key) {
            var value = null;
            var fromStore = false;
            if (key) {
                key = key.toString();
                value = _cache.get(key);
                if (!value) {
                    //value is not in cache. try to retrieve it from the store
                    value = store.get(key);
                    fromStore = true;
                    if (value) {
                        _cache.put(key, value);
                    }
                }
            }
            $log.log(( fromStore ? 'STORE' : 'CACHE') + ' : read [%o] : %o', key, value);
            return value;
        };
    
        var put = function(key, value, options) {
            options = angular.extend({}, {
                keepExisting: false, //update value on database
                transient: false, //value will be persisted permanently
                getKey: function(key, value){ //retrieves the object key.
                    //no key supplied. will use value as its own key.
                    //defaults to the string representation of the object.                    
                    return (key || value || '').toString();                        
                }
            }, options);
            if (value) {
                var key = options.getKey(key, value);
                if (options.keepExisting === true) {
                    var current = get(key);
                    if (current) {
                        //we found an existing value and the caller explicitly asked
                        // to keep it.
                        //will return it instead of supplied object parameter
                        //@todo should this throw an exception?
                        $log.log('CACHE: abort [%o] : %o', key, current);
                        return current;
                    }
                }
                _cache.put(key, value);
                if(options.transient !== true){
                    _storage[key] = value;    
                }
                
                $log.log('CACHE: write [%o] : %o', key, value);
            } else {
                if (key) {
                    key = key.toString();
                    delete _storage[key];
                    _cache.remove(key.toString());
                    if (store.has(key)) {
                        store.remove(key);
                        $log.log('STORE: removed [%o] : %o', key);
                    } else {
                        $log.log('CACHE: removed [%o] : %o', key);
                    }
                }
            }
            return value;
        };
    
        return {
            put : put,
            get : get
        };
    }]
); 