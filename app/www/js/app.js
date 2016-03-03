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
        // $ionicConfigProvider.backButton.previousTitleText(false);
        // $ionicConfigProvider.backButton.text('');
        // $ionicConfigProvider.views.forwardCache(true);
        // $ionicConfigProvider.views.transition('none');

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
        }).state('app_register', {
            url: '/user/signup',
            views: {
                'content': {
                    templateUrl: 'templates/user/signup.html',
                    controller: 'SignupCtrl'
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