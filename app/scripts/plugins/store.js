angular
    .module('U2bApp.plugins.store', [])

    .run(['$window', function($window) { 
        'use strict';
        
        if (!$window.store) { throw new Error('missing "store.js" required to run CacheService'); }
    }])
    
    .factory('store', ['$window', function($window) { 
        'use strict';  
        
        return $window.store; 
    }]);