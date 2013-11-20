angular
    .module('U2bApp.plugins.toastr', [])

    .run(['$window',function($window) { 
        'use strict';
        
        if (!$window.toastr) { throw new Error('missing <toastr.js>'); }
    }])
    
    .factory('toastr', ['$window', function($window) { 
        'use strict';
      
        return $window.toastr; 
    }]);