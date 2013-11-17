'use strict';

angular.module('U2bApp.services.notifications', [])

.run(['$window',
function($window) {
    //@todo move to NotificationService
    if (!$window.toastr) {
        throw new Error('missing "toastr.js" required to show notification messages');
    }
}])

.factory('NotificationsService', ['$log',
function($log) {'use strict';

    this.notifications = ['TESTE'];

    //toastr option:
    /*
     {
     "closeButton": true,
     "debug": false,
     "positionClass": "toast-top-right",
     "onclick": null,
     "showDuration": "300",
     "hideDuration": "1000",
     "timeOut": "5000",
     "extendedTimeOut": "1000",
     "showEasing": "swing",
     "hideEasing": "linear",
     "showMethod": "fadeIn",
     "hideMethod": "fadeOut"
     */

    return {
        getApiKey : function() {
            return apiKey;
        }
    };
}]); 