angular
    .module('U2bApp.services.notifications', ['U2bApp.plugins.toastr'])

    .factory('NotificationsService', ['$log', 'toastr', function($log, toastr) {
        'use strict';

        this.notifications = ['TESTE'];
        $log.log('toastr ',toastr);

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
            notify : function(/*message*/) {
                return null;
            }
        };
    }]); 