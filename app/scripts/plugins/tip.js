angular
    .module('U2bApp.plugins.tip', [])

    .run([function(){ 
        'use strict';
        
        if (!angular.element().qtip) {
            throw new Error('missing <jquery.qtip.js>');
        }
    }])
    
    .factory('tip', [function() { 
        'use strict';
      
        return function(element, value){
            return element.qtip(value);
        }; 
    }]);