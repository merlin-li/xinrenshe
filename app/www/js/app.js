'use strict';
angular.module('guozhongbao', [
    'ionic',
    'guozhongbao.controllers',
    'guozhongbao.services'
    // 'guozhongbao.error'
]).config([
    '$stateProvider',
    '$urlRouterProvider',
    '$ionicConfigProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        // $httpProvider.defaults.useXDomain = true;
        // delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.backButton.text('');
        // $ionicConfigProvider.views.forwardCache(false);
        // $ionicConfigProvider.views.transition('none');

        $ionicConfigProvider.views.maxCache(0);

        $stateProvider.state('app_home', {
            url: '/home',
            views: {
                'content': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        }).state('app_login', {
            url: '/user/login',
            views: {
                'content': {
                    templateUrl: 'templates/user/login.html',
                    controller: 'LoginCtrl'
                }
            }
        }).state('app_signup', {
            url: '/user/signup',
            views: {
                'content': {
                    templateUrl: 'templates/user/signup.html',
                    controller: 'SignupCtrl'
                }
            }
        }).state('app_user', {
            url: '/user',
            views: {
                'content': {
                    templateUrl: 'templates/user/index.html',
                    controller: 'UserCtrl'
                }
            }
        }).state('app_setting_userinfo', {
            url: '/setting/userinfo',
            views: {
                'content': {
                    templateUrl: 'templates/setting/userinfo.html',
                    controller: 'SetUserInfoCtrl'
                }
            }
        }).state('app_setting_address', {
            url: '/setting/address',
            views: {
                'content': {
                    templateUrl: 'templates/setting/address.html',
                    controller: 'SetAddressCtrl'
                }
            }
        }).state('app_city_setting', {
            url: '/city/setting',
            views: {
                'content': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        }).state('app_city_setting_id', {
            url: '/city/setting/:areaId',
            views: {
                'content': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        }).state('app_sendtip', {
            url: '/card/sendtip',
            views: {
                'content': {
                    templateUrl: 'templates/card/sendtip.html',
                    controller: 'SendtipCtrl'
                }
            }
        }).state('app_send', {
            url: '/card/send',
            views: {
                'content': {
                    templateUrl: 'templates/card/send.html',
                    controller: 'SendCtrl'
                }
            }
        }).state('app_mysending', {
            url: '/my/sending',
            views: {
                'content': {
                    templateUrl: 'templates/user/sending.html',
                    controller: 'MySendingCtrl'
                }
            }
        })




        // .state('app_regist_agreement', {
        //     url: '/agreement/register',
        //     views: { 'content': { templateUrl: 'templates/agreement/register.html' } }
        // }).state('app_loan_agreement', {
        //     url: '/agreement/loan',
        //     views: { 'content': { templateUrl: 'templates/agreement/loan.html' } }
        // })
        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home');
    }
]);


// angular.module('guozhongbao.error', []).factory('$exceptionHandler', function () {
//     return function (exception, cause) {
//         exception.message += ' (caused by "' + cause + '")';
//         var userInfo = JSON.parse(window.localStorage.getItem('uinfo')), userId = userInfo ? userInfo.uid : 0;
//     };
// });