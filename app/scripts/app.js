window.U2bApp = angular
    .module('U2bApp', ['U2bApp.controllers'])
    
    .value('version', '1.0.0')
    
    .config(['$locationProvider', '$httpProvider', '$routeProvider', function ($locationProvider, $httpProvider, $routeProvider) {
        'use strict';
        
        $locationProvider.html5Mode(true);
        
        //enable CORS
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        $routeProvider
            .when('/channel/:id', {
                templateUrl: '../views/channel.html',
                controller: 'ChannelCtrl'
            })
            
            .when('/video/:videoId', {
                templateUrl: '../views/video.html',
                controller: 'VideoCtrl'
            })
            
            .when('/', {
                templateUrl: 'views/subscriptions.html',
                controller: 'SubscriptionsCtrl'
            })
            
            .otherwise({
                redirectTo: '/'
            });
    }])
     
    .factory('$exceptionHandler', ['$log', function($log){
        'use strict';
        
        return function(exception){
            $log.error('exception: %o\n%o', exception.message || exception, exception.stack || '<no stacktrace available>');            
        };
    }]);
