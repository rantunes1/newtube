angular.module('U2bApp.services.config', [])
    
    .constant('apiKey', 'AIzaSyALsHXjizSWKj04T3FTRUZhHHM1RXvhoZk')
    
    .factory('ConfigService', ['apiKey', '$log', function (apiKey, $log) {
        'use strict';
                            
        return {
            getApiKey: function(){
                return apiKey;
            }
        };
    }]);