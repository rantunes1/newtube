angular
    .module('U2bApp.services.youtube', [
        'U2bApp.services.config', 
        'U2bApp.services.cache',
        'U2bApp.services.oauth',
        'U2bApp.services.yt-parser',
    ])
    
    .config(['$httpProvider',  'YTParserProvider', function ($httpProvider, YTParser) { 
        'use strict';
                
        var responseParser = function(data){
            if(!angular.isObject(data)){
                return data;
            }
            
            if(data.data){
                data = data.data;
            }
            
            var kind = data.kind;
            if(/channelListResponse$/.test(kind)){
                //@todo can a user have more than one channel ?               
                var channel = data.items[0];
                return YTParser.parseChannel(channel);
            }
            if(/playlistItemListResponse$/.test(kind)){
                return YTParser.parsePlaylistItems(data.items);
            }
                       
            var feed = data.feed;
            if(!angular.isObject(feed)){
                var entry = data.entry;
                if(!angular.isObject(entry)){
                    return data;   
                }
                return YTParser.parseUser(entry);
            }
            
            var parsedFeed = {
                title: feed.title.$t,
                updated: new Date(feed.updated.$t),
                links: feed.link,
                search: {
                    numItems: feed.openSearch$itemsPerPage.$t,
                    startIndex: feed.openSearch$startIndex.$t,
                    totalItems: feed.openSearch$totalResults.$t
                }
            };
            
            var category = feed.category[0].term;
            if(/video$/.test(category)){
                var videos = YTParser.parseVideoList(feed.entry);
                return angular.extend({}, parsedFeed, {videos : videos});
            }
            if(/userEvent$/.test(category)){
                var activities = YTParser.parseActivities(feed.entry); 
                return angular.extend({}, parsedFeed, {notifications : activities});
            }
            if(/playlistLink$/.test(category)){
                var playlists = YTParser.parsePlaylists(feed.entry);
                return angular.extend({}, parsedFeed, {playlists : playlists});
            }
            return feed;
            
        };
        $httpProvider.defaults.transformResponse.push(responseParser);
        
        
        var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
            var success = function (response) {
                return response;
            };

            var error = function (response) {
                if (response.status === 401) {
                    var deferred = $q.defer();
                    $rootScope.$broadcast('user.not.authenticated');
                    return deferred.promise;
                } else {
                    $rootScope.error = response.status;
                }

                return $q.reject(response);
            };

            return function (promise) {
                return promise.then(success, error);
            };
        }];

        $httpProvider.responseInterceptors.push(interceptor);
        
    }])

    .factory('YTService', ['$http', '$q', '$log', 'ConfigService', 'CacheService', 'OAuthService', function($http, $q, $log, Config, Cache, OAuth){ 
        'use strict';

        var _getRequestConfig = function(extraParams){            
            return {
                headers: {
                    'Authorization' : 'Bearer ' + OAuth.getAccessToken(),
                    'GData-Version': '2',
                    'X-GData-Key': 'key=' + Config.getApiKey('google', 'youtube')
                },
                params: angular.extend({
                    alt: 'json'
                }, (extraParams || {}))
            };
        };
        
        var getUserData = function(userId){
            var defer = $q.defer();
            
            userId = userId || 'default';
            
            var userData = Cache.get('u-' + userId);
            
            if(userData){
                defer.resolve(userData);
            }else{
                $http(angular.extend({},_getRequestConfig(),{
                    url: 'https://gdata.youtube.com/feeds/api/users/' + userId,
                    method: 'get'
                }))
                .then(
                    function(userResponse){
                        var user = userResponse.data;    
                        $log.warn('received user : ', user);                     
                        defer.resolve(Cache.put('u-' + userId, user));
                    },
                    defer.reject
                );
            }
            
            return defer.promise;
        };
        
        var getUserSubscriptions = function(){
            var defer = $q.defer();
            
            var subscriptions = Cache.get('subscriptions'); 
            
            if(subscriptions){
                defer.resolve(subscriptions);
            }else{
                $http(angular.extend({},_getRequestConfig(),{
                    url: 'https://gdata.youtube.com/feeds/api/users/default/newsubscriptionvideos',
                    method: 'get'
                }))
                .then(
                    function(subscriptionsResponse){
                        var subscriptions = subscriptionsResponse.data;    
                        $log.warn('received subscriptions : ', subscriptions);                     
                        defer.resolve(Cache.put('subscriptions', subscriptions));
                    },
                    defer.reject
                );    
            }
            
            return defer.promise;
        };
        
        var getUserPlaylists = function(){
            var defer = $q.defer();
            
            var playlists = Cache.get('playlists');
            
            if(playlists){
                defer.resolve(playlists);
            }else{
                $http(angular.extend({},_getRequestConfig(
                    {
                        'max-results': 50
                    }),{
                        url: 'https://gdata.youtube.com/feeds/api/users/default/playlists',
                        method: 'get'
                    })
                ).then(
                    function(playlists){
                        $log.warn('received playlists : ', playlists);
                        defer.resolve(Cache.put('playlists', playlists));
                    },
                    defer.reject
                );    
            }
            
            return defer.promise;
        };
        
        var getNotifications = function(){
            var defer = $q.defer();
            
            $http(angular.extend({},_getRequestConfig(
                {
                    'max-results': 50
                }),
                {
                    url: 'https://gdata.youtube.com/feeds/api/users/default/friendsactivity',
                    method: 'get'
                })
            ).then( 
                function(notificationsResponse){
                    var newNotifications = (notificationsResponse.data || {}).notifications;
                    var existingNotifications = Cache.get('notifications');
                    if(newNotifications && newNotifications.length !== 0){
                        if(!existingNotifications){
                            Cache.put('notifications', newNotifications.reverse()); //keep most recent at the end of the array
                            defer.resolve([newNotifications.pop()]);                     
                            return;       
                        }
                        var latest = existingNotifications[existingNotifications.length-1]; //retrieve the latest from the end of the array
                        
                        while(newNotifications.length){
                            var testNotification = newNotifications.pop();
                            if(testNotification.id === latest.id){ //we hit the previosly 'most recent'
                                newNotifications = newNotifications || [];
                                Cache.put('notifications', existingNotifications.concat(newNotifications.reverse()));
                                defer.resolve(newNotifications);
                                return;    
                            } 
                        }
                    }                    
                    defer.resolve([]); //no new notifications
                },
                defer.reject
            );    
            
            return defer.promise;
        };
        
        var getUserChannel = function(){
            var defer = $q.defer();
            
            var channel = Cache.get('channel'); 
            
            if(channel){
                defer.resolve(channel);
            }else{
                $http(angular.extend({},_getRequestConfig(
                    {
                        part: 'snippet,contentDetails,statistics,topicDetails,invideoPromotion',
                        mine: true
                    }),{
                        url: 'https://www.googleapis.com/youtube/v3/channels',
                        method: 'get'
                    })
                ).then(
                    function(channelResponse){
                        var channel = channelResponse.data;    
                        $log.warn('received channel : ', channel);                     
                        defer.resolve(Cache.put('channel', channel));
                    },
                    defer.reject
                );
            }    
            
            return defer.promise;
        };
        
        var getUserLikes = function(){
            var defer = $q.defer();
            
            var likes = Cache.get('likes'); 
            
            if(likes){
                defer.resolve(likes);
            }else{
                var getLikes = function(playlistId){
                    $http(angular.extend({},_getRequestConfig(
                        {
                            part: 'contentDetails',
                            maxResults: 50,
                            playlistId: playlistId
                        }),{
                            url: 'https://www.googleapis.com/youtube/v3/playlistItems',
                            method: 'get'
                        }))
                    .then(
                        function(likes){
                            $log.warn('received likes : ', likes);
                            defer.resolve(Cache.put('likes',likes));
                        },
                        defer.reject
                    );    
                };
                
                getUserChannel().then(function(userChannel){
                    var likesChannelId = userChannel.specialPlaylists.likes;
                    if(likesChannelId){
                        getLikes(likesChannelId);
                    }else{
                        defer.reject('unknown liked videos channel');
                    }    
                });    
            }
            
            return defer.promise;
        };
        
        return {        
            getUserData: getUserData,
            getUserSubscriptions: getUserSubscriptions,
            getUserPlaylists: getUserPlaylists,
            getNotifications: getNotifications,
            getUserLikes: getUserLikes
        };
    }]);