angular.module('lngOauthFacebook', [
    //'fb-config', // example config object
    'angular-storage'
]).factory('$facebookOauthService', [
    '$rootScope', 'fbConfig', 'store',
    function $facebookOauthServiceProvider($all, config, storage) {
        console.log('[module.svc.lngOauthFacebook]');
        var credentials,
                oauthScopes = 'email,public_profile',
                //accessToken,
                authCallback,
                errorCallback = function (errorMessage) {
                    console.log('$facebookOauthService ERROR -> ', errorMessage);
                }, __s = {
            init: function (callback) {
                window.fbAsyncInit = function () {
                    FB.init({
                        appId: config.appId,
                        xfbml: true,
                        version: 'v2.6'
                    });
                    console.log('Fb Config ->', config);
                    console.log('Facebook is ready!');
                    // hit init callback
                    if (angular.isFunction(callback))
                        callback();
                };
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "https://connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            },
            setErrorHandler: function (errorHandler) {
                errorCallback = errorHandler;
            },
            setAuthResponseHandler: function (authResponseHandler) {
                authCallback = authResponseHandler;
            },
            getCredentials: function() {
                return credentials;
            },
            getAccessToken: function () {
                if (credentials)
                    return credentials.accessToken;
            },
            checkToken: function() {
                __s.checkStatus(false);
            },
            handleAuthResponse: function(profile) {
                if(profile && profile.hasOwnProperty('picture')) {
                    profile.originalPicture = profile.picture;
                    profile.picture = profile.originalPicture.data.url;
                }
                if(angular.isFunction(authCallback))
                    authCallback.apply(null, arguments);
            },
            handleLoginResponse: function (response, requireLogin) {
                switch (response.status) {
                    case 'connected':
                        // get profile and return
                        console.log('User is connected! ->', response);
                        credentials = response.authResponse;
                        FB.api('/me', 'get', {access_token: credentials.accessToken, fields: 'first_name,last_name,email,id,picture.type(large)'}, __s.handleAuthResponse);
                        break;

                    default:
                        if (requireLogin) {
                            if(config.scopes)
                                oauthScopes = config.scopes;
                            FB.login(__s.handleLoginResponse, { scope: oauthScopes });
                        }
                        else {
                            console.log('Facebook status RESP ->', response);
                            errorCallback(response.status);
                        }
                }
            },
            checkStatus: function (doLoginIfNoStatus) {
                FB.getLoginStatus(function (response) {
                    __s.handleLoginResponse(response, doLoginIfNoStatus);
                });
            },
            login: function (callback) {
                if (angular.isFunction(callback))
                    authCallback = callback;
                // set default authentication callback
                if (!angular.isFunction(authCallback))
                    authCallback = function (response) {
                        console.log('FB login RESP (default) ->', response);
                    };
                __s.checkStatus(true);
            },
            logout: function() {
                FB.logout(function() {
                    console.log('FB logout RESP ->', arguments);
                });
            }
        };

        return __s;
    }
]);