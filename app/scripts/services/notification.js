angular
    .module('U2bApp.services.notifications', ['U2bApp.plugins.toastr'])

    .factory('NotificationsService', ['$log', 'toastr', function($log, toastr) {
        'use strict';

        $log.log('toastr ',toastr);

        //toastr options:
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
            info : function(message) {
                toastr.info(message);
            }
        };
    }]); 