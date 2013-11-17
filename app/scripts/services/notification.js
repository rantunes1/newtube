'use strict';

angular.module('U2bApp.services.notifications', ['U2bApp.services.globals'])

.factory('NotificationsService', ['$log', 'toastr', function($log, toastr) {
    'use strict';

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