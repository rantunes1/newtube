angular.module('U2bApp.services.notifications', [])
    
    .run(['$window', function($window){
        //@todo move to NotificationService
        if (!$window.toastr) {
            throw new Error('missing "toastr.js" required to show notification messages');
        }
    }])
    
    .factory('NotificationsService', ['$log', function ($log) {
        'use strict';
        
        this.notifications = ['TESTE'];
                                    
        return {
            getApiKey: function(){
                return apiKey;
            }
        };
    }]);