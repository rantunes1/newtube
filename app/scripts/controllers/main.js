angular
    .module('U2bApp.controllers', [
        'U2bApp.plugins.lodash',
        'U2bApp.services.oauth',    
        'U2bApp.services.youtube',  
        'U2bApp.services.notifications',
        'U2bApp.directives.textbox',        
        'U2bApp.directives.yt-player',
        'ui.bootstrap',
        'wu.masonry'
    ])
    
    .run(['$window', '$rootScope', function($window, $rootScope){   
        'use strict';
        
        $rootScope.windowWidth = $window.outerWidth;
        angular.element($window).on('resize',function(){
            $rootScope.windowWidth = $window.outerWidth;
            $rootScope.$apply('windowWidth');
        });       
    }])
    
    .controller('AppCtrl', ['_', '$rootScope', '$scope', '$timeout', '$log', 'OAuthService', 'NotificationsService', 'YTService', 
    function(_, $rootScope, $scope, $timeout, $log, OAuth, Notifications, YTService){ 
        'use strict';
        
        $log.log('CONTROLLER: App');
        
        $scope.model = {};
        
        $scope.model.authenticate = OAuth.authenticate;
        
        //@todo make OauthService be the listener for this event and remove OAuth from parameters list
        $rootScope.$on('user.not.authenticated', function(){
            $scope.model.accessToken = null;
        });
        
        $rootScope.$watch('windowWidth',function(newVal){
            $log.log('window resized to ', newVal);
        });
        
        $scope.$watch( OAuth.isAuthenticated, 
            function (newValue, oldValue) {
                $log.log('change detected on Token value : %o --> %o', oldValue, newValue);
                $scope.model.accessToken = newValue;
                if(!newValue){
                    return;
                }
                
                YTService.getUserData().then(function(user){
                    $log.log('and the user is....: %o', user); 
                });            
                
                YTService.getUserSubscriptions().then(
                    function(subscriptions){
                        $scope.model.subscriptionsfeed = subscriptions;
                
                        $log.warn('got subscriptions ',$scope.model.subscriptionsfeed);
                    },function(e) {
                        $log.error('unable to get subscriptions - %o : %o ', e.name, e.message);
                        localStorage.removeItem('accessToken');
                    }
                );    
                
                YTService.getUserPlaylists().then(
                    function(playlists){
                        $scope.model.playlistsfeed = playlists;
                
                        $log.warn('got playlists ',$scope.model.playlistsfeed);
                    },function(e) {
                        $log.error('unable to get playlists - %o : %o ', e.name, e.message);
                    }
                );
                
                                   
                YTService.getUserLikes().then(
                    function(likes){
                        $scope.model.likes = likes;
                
                        $log.warn('got likes ',$scope.model.likes);
                    },function(e) {
                        $log.error('unable to get likes - %o : %o ', e.name, e.message);
                    }
                );
                
                var notificationsTimer;
    
                var showNotifications = function(notifications){
                    $log.info('notifications %o', notifications);
                    
                    $scope.model.notifications = notifications;
                    _.each(notifications, function(notification){
                        $timeout(function(){
                            $log.log('showing notification ', notification);
                            Notifications.info('notification :' + notification.title);        
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
            }
        );
    }])

    .controller('ChanelCtrl', ['$log', function($log){ 
        'use strict';
        
        $log.log('CONTROLLER: Channel');
    }])
    
    .controller('VideoCtrl', ['$scope','$routeParams', '$log', function($scope, $routeParams, $log){ 
        'use strict';
        
        $log.log('CONTROLLER: Video');
        
        $scope.model.playingVideoId = $routeParams.videoId;
    }])
    
    .controller('SubscriptionsCtrl', ['_', '$scope', '$log', function(_, $scope, $log) { 
        'use strict';
        
        $log.log('CONTROLLER: Subscriptions');
        
        $scope.model.highlightVideo = function(video){
            if(!video || !video.id){
                return;
            }
            
            _.each($scope.model.subscriptionsfeed.videos, function(listVideo){
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
                //var isActive = $scope.model.activeVideo && $scope.model.activeVideo.id === video.id;
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