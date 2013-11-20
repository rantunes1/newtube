angular
    .module('U2bApp.services.config', ['U2bApp.plugins.lodash'])
    
    .constant('INVALID_TOKEN','_invalid_')
    
    //@todo - move to GoogleOAuthService that sould be a subclass of AuthSer
    .constant('providers', [{
        // https://developers.google.com/youtube/v3/guides/authentication#client-side-apps
        id: 'google',
        name: 'Google API',
        api:{
            youtube:{
                key: 'AIzaSyALsHXjizSWKj04T3FTRUZhHHM1RXvhoZk'    
            }
        },
        oauth: {
            'client_id': '453427542929.apps.googleusercontent.com',                
            'redirect_uri': 'https://localhost:9009/oauth2callback.html',
            'response_type': 'token',
            url: 'https://accounts.google.com/o/oauth2/auth',
            scope: [
                'https://www.googleapis.com/auth/youtube', 
                'https://www.googleapis.com/auth/youtube.readonly',
                'https://www.googleapis.com/auth/youtubepartner', 
                'https://www.googleapis.com/auth/userinfo.email'
            ].join(' '),
            'approval_prompt': 'auto' || 'force',
            state: null,
            'login_hint': null    
        },
        verification:{
            url: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
            tokenParam: 'access_token',
            checkField: 'client_id'
        }
    }])
        
    //@todo make this a 'module.provider' and receive the constants upon service initialization
    .factory('ConfigService', ['_', 'providers', 'INVALID_TOKEN', function (_, providers, INVALID_TOKEN) {
        'use strict';
        
        var config = {
            providers : {}
        };
        
        _.each(providers,  function(provider){ 
            config.providers[provider.id || INVALID_TOKEN] = provider; 
        });
        if (config.providers[INVALID_TOKEN]){
            throw new Error('CONFIG: provider has no id attribute ');
        }
        
        var getProviderDefinition = function(providerId){
            return providerId ? config.providers[providerId] : null;
        };
        
        var provider = function(providerId, providerAttribute){
            if(!providerId || !providerAttribute){
                return null;
            }
            var providerDefinition = getProviderDefinition(providerId);
            var attr = providerDefinition ? providerDefinition[providerAttribute] : null;
            return {
                get: function(propertyName, required){
                    var value = (attr &&  propertyName) ? attr[propertyName] : null;
                    if(required && !value){
                        throw new Error('CONFIG: missing required parameter  : ' + propertyName);
                    }  
                    return value;    
                },
                getAll: function(){
                    return attr;
                }
            };  
        };
                                    
        return {
            getOAuthConfig: function(providerId){
                return provider(providerId, 'oauth');
            },
            getAuthVerification: function(providerId){
                return provider(providerId, 'verification');
            },
            getApiKey: function(providerId, apiId){
                var providerDefinition = getProviderDefinition(providerId);
                if(!providerDefinition || !apiId){
                    return null;
                }
                var api = providerDefinition.api[apiId];
                return api.key; 
            }
        };
    }]);