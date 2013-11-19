angular
    .module('U2bApp.plugins.tubeplayer', [])

    .run([function(){ 
        'use strict';
        
        if (!angular.element().qtip) {
            throw new Error('missing <jQuery.tubeplayer.js>');
        }
    }])
    
    .factory('tubeplayer', [function() { 
        'use strict';
        
        return function(element, value){
            return element.tubeplayer(value);
        }; 
    }]);