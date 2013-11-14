'use strict';

angular
    .module('U2bApp.controllers', [        
        'U2bApp.services.youtube',  
        'U2bApp.directives.tip',
        'U2bApp.services.notifications',
        'U2bApp.directives.yt-player',
        'angularOauth'
    ])
    
    .run(['$window', '$rootScope', function($window, $rootScope){
        $rootScope.windowWidth = $window.outerWidth;
        angular.element($window).on('resize',function(){
            $rootScope.windowWidth = $window.outerWidth;
            $rootScope.$apply('windowWidth');
        });       
    }])
    
    .controller('AppCtrl', ['$rootScope', '$scope', '$timeout', '$log', 'Token', 'YTService', 
    function($rootScope, $scope, $timeout, $log, Token, YTService){
        $log.log('CONTROLLER: App');
        
        $scope.model = {};
        
        $scope.model.authenticate = function() {
            var askApproval = true;
            
            var extraParams =  askApproval ? {
                approval_prompt : 'force'
            } : {};
            
            console.log('current token is %o', Token.get());
            
            Token.getTokenByPopup(extraParams).then(
                function(params) {
                    $scope.model.accessToken = params.access_token;
                    $scope.expiresIn = params.expires_in;
    
                    console.log('setting new token: %o', params);
                    Token.set(params.access_token);
                },
                function() {
                    // Failure getting token from popup.
                    console.error('Failed to get token from popup.');
                }
            );
        };
        
        $rootScope.$on('user.not.authenticated', function(){
            $scope.model.accessToken = null;
        });
        
        $rootScope.$watch('windowWidth',function(newVal, oldVal){
            $log.log('window resized to ', newVal);
            //@todo? $rootScope.$broadcast('masonry.reload');
        });
        
        $scope.$watch(
            function(){
                //console.log('checking changes on Token');    
                return Token.get();
            }, 
            function (newValue, oldValue) {
                console.log('change detected on Token value : %o --> %o', oldValue, newValue);
                if(newValue){
                    $scope.model.accessToken = newValue;

                    YTService.setAccessToken(newValue);                
                    
                    YTService.getUserData().then(function(user){
                        console.log('and the user is....: %o', user); 
                    });            
                    
                    YTService.getUserSubscriptions().then(
                        function(subscriptions){
                            $scope.model.subscriptionsfeed = subscriptions;
                    
                            console.warn('got subscriptions ',$scope.model.subscriptionsfeed);
                        },function(e) {
                            console.error('unable to get subscriptions - %o : %o ', e.name, e.message);
                            localStorage.removeItem('accessToken');
                        }
                    );    
                    
                    YTService.getUserPlaylists().then(
                        function(playlists){
                            $scope.model.playlistsfeed = playlists;
                    
                            console.warn('got playlists ',$scope.model.playlistsfeed);
                        },function(e) {
                            console.error('unable to get playlists - %o : %o ', e.name, e.message);
                        }
                    );
                    
                                       
                    YTService.getUserLikes().then(
                        function(likes){
                            $scope.model.likes = likes;
                    
                            console.warn('got likes ',$scope.model.likes);
                        },function(e) {
                            console.error('unable to get likes - %o : %o ', e.name, e.message);
                        }
                    );
                    
                    var notificationsTimer;
        
                    var showNotifications = function(notifications){
                        $log.info('notifications %o', notifications);
                        
                        $scope.model.notifications = notifications;
                        angular.forEach(notifications, function(notification){
                            $timeout(function(){
                                toastr.info('notification :' + notification.title);        
                            }, 0);
                        });
                            
                        checkForEvents();
                    };
                        
                    var checkForEvents = function(){
                        notificationsTimer = $timeout(function(){
                            YTService
                                .getNotifications().then(
                                    showNotifications,                    
                                    function(e) {
                                        $log.error('unable to get notifications - %o : %o ', e.name, e.message);
                                    }
                                );
                        }, $scope.model.notifications ? (1000 * 60 * 1) : 0); //@todo get value from ConfigServices
                    };

                    checkForEvents();

                }else if(oldValue){
                    $scope.model.accessToken = null;
                    YTService.setAccessToken(null);     
                }
        });
    }])

    .controller('ChanelCtrl', ['$log', function($log){
        $log.log('CONTROLLER: Channel');
    }])
    
    .controller('VideoCtrl', ['$scope','$routeParams', '$log', function($scope, $routeParams, $log){
        $log.log('CONTROLLER: Video');
        
        $scope.model.playingVideoId = $routeParams.videoId;
    }])
    
    .controller('SubscriptionsCtrl', ['$window', '$rootScope', '$scope', '$log', function($window, $rootScope, $scope, $log) {

        $log.log('CONTROLLER: Subscriptions');
        
        $scope.model.highlightVideo = function(video){
            if(!video || !video.id){
                return;
            }
            
            angular.forEach($scope.model.subscriptionsfeed.videos, function(listVideo){
                if(listVideo.id === video.id){
                    listVideo.activeThumbnail = ((listVideo.activeThumbnail || 'mqdefault') === 'mqdefault') ? 'hqdefault' : 'mqdefault';
                }else{
                    listVideo.activeThumbnail = 'mqdefault';    
                }
            });
            
            $scope.model.subscriptionsfeed.videos.push({});
            setTimeout(function(){$scope.model.subscriptionsfeed.videos.pop();},0);
            
            return true;
        };
        
        $scope.model.getVideoThumbnail = function(video){
            if(video){
                var isActive = $scope.model.activeVideo && $scope.model.activeVideo.id == video.id;
                //if(!isActive){
                    return video.thumbnails[(video.activeThumbnail || 'mqdefault')].url;
                //}   
                /*
                if(!video.thumbnailsSeq){
                    video.thumbnailsSeq = ['start', 'middle', 'end'];
                }
                
                var nextThumb = null;
                video.thumbnailsSeq.push(nextThumb = video.thumbnailsSeq.shift());                
                return video.thumbnails[(nextThumb || 'mqdefault')].url;
                */
            }
            
            return '/';
        };
        
        $scope.model.setVideoActive = function(video){
            //x.push(x.shift())
            $scope.model.activeVideo = video;
        };
        
        $scope.model.hideActiveVideo = function(){
            $scope.model.activeVideo = null;
        };
    }]);