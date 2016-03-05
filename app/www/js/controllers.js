'use strict';
angular.module('guozhongbao.controllers',[]).config([
    '$sceDelegateProvider',
    '$httpProvider',
    function ($sceDelegateProvider, $httpProvider) {
        // $sceDelegateProvider.resourceUrlWhitelist([
        //     'self',
        // ]);
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

.controller('HomeCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$ionicSlideBoxDelegate',
    function ($scope, $http, common, $location, $ionicSlideBoxDelegate) {


    }
])

.controller('LoginCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$stateParams',
    function ($scope, $http, common, $location, $stateParams) {
        console.log(common.API.login);

        $scope.loginModel = {phone: '', pwd: ''};

        $scope.login = function(){
            console.log($scope.loginModel.phone);
            console.log($scope.loginModel.pwd);

            $http({
                method: 'post',
                url: common.API.login,
                data: $scope.loginModel
            }).success(function(data){
                console.log(data);
            });
        };
    }
])

.controller('UserCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    function($scope, $http, common, $location) {

    }
])

.controller('SignupCtrl', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    'Common',
    function ($scope, $http, $location, $timeout, common) {
        $scope.signupModel = {
            phone: '',
            code: '',
            pwd: '',
            getCode: {
                'class': 'goods-btn',
                'value': '获取验证码'
            },
            msg: {
                'class': '',
                'value': ''
            }
        };

        //发送验证码
        // $scope.sendcode = function(){

        // };
        //注册 
        // $scope.signup = function(){

        // };

        //注册
        $scope.signup = function () {
            // $scope.signup_model.btn_title = '\u6b63\u5728\u6ce8\u518c...';

            var signupModel = $scope.signupModel;
            $http({
                method: 'POST',
                url: common.API.signup,
                data: {
                    phone: signupModel.phone,
                    verfiyCode: signupModel.code,
                    password: signupModel.pwd
                }
            }).success(function (data) {
                if (data.status === 200) {
                    alert('\u6ce8\u518c\u6210\u529f\uff01');
                    $location.path('/user/login');
                } else {
                    $scope.signupModel.msg = {
                        'class': 'assertive',
                        'value': data.message
                    };
                }
            });
        };

        //send code event
        $scope.sendcode = function () {
            var _m = $scope.signupModel;
            if ($scope.signupModel.getCode.class === 'goods-btn') {
                //表示可以发送验证码
                var pnum = _m.phone, checkResult = common.utility.checkPhone(pnum);
                if (checkResult) {
                    //send code request
                    $http({
                        method: 'POST',
                        url: common.API.regCode,
                        data: {
                            phone: pnum,
                            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
                            // sign: md5.createHash('phone=' + pnum + common.CONSTANT.reg_code_key)
                        }
                    }).success(function (data) {
                        console.log(data);
                        if (data.status === 200) {
                            $scope.signupModel.msg = {
                                'class': 'positive',
                                'value': common.MESSAGE.reg_code_success_tip
                            };
                            var iv = 60, beginTime = $interval(function () {
                                iv--;
                                if (iv >= 0) {
                                    $scope.signupModel.getCode.class = 'button-stable';
                                    $scope.signupModel.getCode.value = iv + '\u79d2\u540e\u91cd\u65b0\u53d1\u9001';
                                } else {
                                    $interval.cancel(beginTime);
                                    $scope.signupModel.getCode = {
                                        'value': '\u83b7\u53d6\u9a8c\u8bc1\u7801',
                                        'class': 'button-positive'
                                    };
                                }
                            }, 1000);
                        } else {
                            $scope.signupModel.msg = {
                                'class': 'assertive',
                                'value': data.message
                            };
                        }
                    }).error(function () {
                        /* Act on the event */
                        $scope.signupModel.msg = {
                            'class': 'assertive',
                            'value': common.MESSAGE.network_error
                        };
                    });
                } else {
                    //输入的手机号不正确
                    $scope.signupModel.msg = {
                        'class': 'assertive',
                        'value': common.MESSAGE.invalid_phone
                    };
                }
            }
        };
    }
]);









