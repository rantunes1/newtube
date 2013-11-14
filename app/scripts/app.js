
'use strict';

window.U2bApp = angular
    .module('U2bApp', [
        'U2bApp.controllers',        
        'ui.bootstrap',
        'wu.masonry'
    ])
    
    .config(['$locationProvider', '$httpProvider', '$routeProvider', 'TokenProvider', 
        function ($locationProvider, $httpProvider, $routeProvider, TokenProvider) {

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
              
        TokenProvider.extendConfig({
            clientId: '453427542929.apps.googleusercontent.com',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: 'https://localhost:9009/oauth2callback.html',
            scopes: [
                'https://www.googleapis.com/auth/youtube', 
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtubepartner', 
                'https://www.googleapis.com/auth/userinfo.email'],
            verifyFunc: function(accessToken){
                return accessToken;
            }
        });
        
        $locationProvider.html5Mode(true);
    }])
     
    .factory('$exceptionHandler', ['$log', function($log){
        return function(exception){
            $log.error('exception: %o\n%o', exception.message || exception, exception.stack || '<no stacktrace available>');            
        };
    }]);
