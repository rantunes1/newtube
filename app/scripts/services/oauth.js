angular
    .module('U2bApp.services.oauth', ['U2bApp.services.config', 'U2bApp.services.cache'])

    //implementation of this service was based on [angular-oauth] [https://github.com/enginous/angular-oauth]
    
    .factory('OAuthService', ['$window', '$http', '$q', '$rootScope', '$log', 'ConfigService', 'CacheService', function ($window, $http, $q, $rootScope, $log, Config, Cache) {
        'use strict';
        
        var INVALID_TOKEN = '#invalid#';
        var AUTH_PROVIDER = 'google';
        
        var toQueryString = function(object){
            var str = [];
            angular.forEach(object, function(value, key) {
                str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });
            return str.join('&');
        };

        var setToken = function(tokenDefinition, oauthConfig){
            $log.log('saving oauth token ', tokenDefinition);
            
            if(!tokenDefinition){
                return;
            }
            
            var tokenVerification = Config.getAuthVerification(AUTH_PROVIDER);
            var url = tokenVerification ? tokenVerification.get('url') : null;
            var tokenParam = tokenVerification ? tokenVerification.get('tokenParam') : null;
            var token = tokenDefinition[tokenParam];
            
            if(url){
                var verificationParams = {
                    method: 'get',
                    url: url
                };
                if(tokenParam){
                    verificationParams.params = {};
                    verificationParams.params[tokenParam] = token;
                }
                
                $rootScope.$apply(function() {
                    $http(verificationParams).then(
                        function(verificationResponse){
                            var verification = verificationResponse.data;
                            $log.log('verification response : ',verification);
                            
                            var checkFieldParam = tokenVerification ? tokenVerification.get('checkField') : null;
                            //var checkField = checkFieldParam ? oauthConfig.get(checkFieldParam) : null; 
                                                        
                            if(oauthConfig.get(checkFieldParam) === verification.audience){
                                delete verification.audience;
                                Cache.put('ua', { 
                                    token: token,
                                    //@todo is it safe to store other attributes?
                                    verification: verification
                                });
                            }
                        },
                        function(error){
                            $log.error('OAUTH: error : ', error);    
                        }
                    );
                });
            }else{
                Cache.put('ua', {
                    token: token ? token : (tokenParam ? tokenVerification.get(tokenParam) : tokenDefinition) 
                });    
            }
        };
               
        var getAccessToken = function(){
            var auth = Cache.get('ua'); //user authentication
            if(!auth || !auth.token || auth === INVALID_TOKEN){
                return null;
            }
            return auth.token;
        };
        
        var authenticate = function(){
            Cache.put('ua',INVALID_TOKEN);
            
            //start login process                
            var oauthConfig = Config.getOAuthConfig(AUTH_PROVIDER);
            if(!oauthConfig){
                $log.warn('OAUTH: no oauth configuration.');
                return null;
            }
                       
            var url = oauthConfig.get('url');
            var params = angular.extend({}, oauthConfig.getAll());
            delete params.url;
            url += '?' + toQueryString(params);
                        
            var popup = $window.open(url, 'authentication', 'width=650,height=300,resizable=yes,scrollbars=yes,status=yes');
            angular.element($window).on('message', function(event) {
                event = event.originalEvent || event;
                if (event.source === popup && event.origin === window.location.origin) {
                    setToken(event.data, oauthConfig);
                }
            });
                       
            return null;                
        };
        
        return {
            isAuthenticated: function(){
                return angular.isString(getAccessToken());
            },
            getAccessToken: getAccessToken,
            authenticate: authenticate,
            logout: function(){
                setToken(null);
            }
        };
    }])
    
    .controller('CallbackCtrl', function($scope, $location) {
        'use strict';
        
        /**
         * Parses an escaped url query string into key-value pairs.
         *
         * (Copied from Angular.js in the AngularJS project.)
         *
         * @returns Object.<(string|boolean)>
         */
        var parseKeyValue = function (/**string*/keyValue) {
            var obj = {}, keyValuePair, key;
            angular.forEach((keyValue || '').split('&'), function(keyValue){
                if (keyValue) {
                    keyValuePair = keyValue.split('=');
                    key = decodeURIComponent(keyValuePair[0]);
                    obj[key] = angular.isDefined(keyValuePair[1]) ? decodeURIComponent(keyValuePair[1]) : true;
                }
            });
            return obj;
        };
    
        var queryString = $location.path().substring(1);  // preceding slash omitted
        var params = parseKeyValue(queryString);
    
        // TODO: The target origin should be set to an explicit origin.  Otherwise, a malicious site that can receive
        //       the token if it manages to change the location of the parent. (See:
        //       https://developer.mozilla.org/en/docs/DOM/window.postMessage#Security_concerns)
    
        window.opener.postMessage(params, '*');
        window.close();
    });