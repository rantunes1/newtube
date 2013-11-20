angular
    .module('U2bApp.plugins.lodash', [])

    .run(['$window', function($window) { 
        'use strict';
        
        if (!$window._) { throw new Error('missing <lodash.js>'); }
    }])
    
    .factory('_', ['$window', function($window) { 
        'use strict';  
        
        return $window._; 
    }]);