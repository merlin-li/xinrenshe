'use strict';
angular.module('guozhongbao.controllers',['ngCookies', 'angular-md5'])
.config([
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
    'md5',
    function ($scope, $http, common, $location, md5) {

        !function(){
            //初始化事件
            $http({
                method: 'post',
                url: common.API.home,
                data: {
                    accessSign: md5.createHash(common.utility.createSign({}))
                }
            }).success(function(data){
                if (data.status === 200){
                    $scope.dataObj = data.data;
                    $scope.dataObj.host = 'http://xiaoyeshu.billowton.com/';
                }
            });
        }();
    }
])

.controller('LoginCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$stateParams',
    '$cookieStore',
    'md5',
    function ($scope, $http, common, $location, $stateParams, $cookieStore, md5) {
        $scope.loginModel = {phone: '', password: ''};

        $scope.login = function(){
            var signStr = common.utility.createSign($scope.loginModel);

            $http({
                method: 'post',
                url: common.API.login,
                data: {
                    phone: $scope.loginModel.phone,
                    password: $scope.loginModel.password,
                    accessSign: md5.createHash(signStr)
                }
            }).success(function(data){
                if (data.status === 200) {
                    //登录成功
                    $cookieStore.put('userinfo', JSON.stringify({
                        token: data.data.token,
                        uobj: data.data.userInfo
                    }));
                    $location.path('/home');
                } else {
                    common.utility.alert(data.msg);
                }
            });
        };

        !function(){
            common.utility.checkLogin().success(function(u){
                $location.path('/user');
            });
        }();
    }
])

.controller('UserCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    function($scope, $http, common, $location) {
        !function(){
            common.utility.checkLogin().success(function(u){
                $scope.userObj = u.uobj;
            }).fail(function(){
                $location.path('/user/login');
            });
        }();
    }
])

.controller('SignupCtrl', [
    '$scope',
    '$http',
    '$location',
    '$interval',
    'Common',
    'md5',
    '$cookieStore',
    function ($scope, $http, $location, $interval, common, md5, $cookieStore) {
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

        //注册
        $scope.signup = function () {
            var signupModel = $scope.signupModel, paramsObj;
            if (signupModel.phone === '') {
                common.utility.alert('提示', '请输入手机号码！');
            } else if (signupModel.code === '') {
                common.utility.alert('提示', '验证码不能为空！');
            } else if (signupModel.pwd === ''){
                common.utility.alert('提示', '密码不能为空！');
            } else {
                paramsObj = {
                    phone: signupModel.phone,
                    verfiyCode: signupModel.code,
                    password: signupModel.pwd
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'POST',
                    url: common.API.signup,
                    data: paramsObj
                }).success(function (data) {
                    if (data.status === 200) {
                        alert('\u6ce8\u518c\u6210\u529f\uff01');
                        $cookieStore.put('userinfo', data.data);
                        $location.path('/setting/userinfo');
                    } else {
                        $scope.signupModel.msg = {
                            'class': 'assertive',
                            'value': data.msg
                        };
                    }
                });
            }
        };

        //发送验证码
        $scope.sendcode = function () {
            var _m = $scope.signupModel;

            if ($scope.signupModel.getCode.class === 'goods-btn') {
                //表示可以发送验证码
                var pnum = _m.phone, 
                    checkResult = common.utility.checkPhone(pnum), 
                    paramsObj = {
                        phone: pnum
                    };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                if (checkResult) {
                    //send code request
                    $http({
                        method: 'POST',
                        url: common.API.regCode,
                        data: paramsObj
                    }).success(function (data) {
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
                                'value': data.msg
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
])

.controller('SetUserInfoCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$cookieStore',
    function($scope, $http, common, $location, md5, $cookieStore) {
        var takePicture = document.getElementById('takepicture');

        takePicture.onchange = function (event){
            var files = event.target.files, file;
            if (files && files.length > 0) {
                file = files[0];
                try {
                    var URL = window.URL || window.webkitURL;
                    var blob = URL.createObjectURL(file);
                    _compressPicture(blob);
                } catch (e) {
                    try {
                        var fileReader = new FileReader();
                        fileReader.onload = function (event) {
                            _compressPicture(event.target.result);
                        };
                        fileReader.readAsDataURL(file);
                    } catch (e) {
                        common.utility.alert('error');
                    }
                }
            }
        };


        /**
         * 压缩照片
         * @param blob 照片的url
        */
        var _compressPicture = function (blob) {
            var quality = 0.5, image = new Image();
            image.src = blob;
            image.onload = function () {
                var that = this;
                // 生成比例
                var width = that.width, height = that.height;
                width = width / 4;
                height = height / 4;
                // 生成canvas画板
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(that, 0, 0, width, height);
                // 生成base64,兼容修复移动设备需要引入mobileBUGFix.js
                var imgurl = canvas.toDataURL('image/jpeg', quality);
                // 修复IOS兼容问题
                if (navigator.userAgent.match(/iphone/i)) {
                    var mpImg = new MegaPixImage(image);
                    mpImg.render(canvas, {
                        maxWidth: width,
                        maxHeight: height,
                        quality: quality
                    });
                    imgurl = canvas.toDataURL('image/jpeg', quality);
                }
                $scope.userModel.avatar = imgurl;
                $scope.$digest();
            };
        };

        $scope.userModel = {
            nickname: '',
            gender: '',
            avatar: ''
        };
        //下一步
        $scope.next = function(){
            var paramsObj = {
                uid: '',
                token: '',
                username: $scope.userModel.nickname,
                sex: $scope.userModel.gender === '男' ? 1 : 0
            }, userObj;

            if ($cookieStore.get('userinfo')) {
                userObj = $cookieStore.get('userinfo');
            }
            paramsObj.uid = userObj.uid;
            paramsObj.token = userObj.token;

            console.log(common.utility.createSign(paramsObj));
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            paramsObj.avatar = $scope.userModel.avatar;

            console.log(paramsObj);
            $http({
                method: 'post',
                url: common.API.setUserInfo,
                data: paramsObj
            }).success(function(data){
                console.log(data);
            });
        };
        //src="img/tx_1.png"
        $scope.takePicture = function(){
            takePicture.click();
        };
    }
])

.controller('SetAddressCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    function($scope, $http, common, $location) {

    }
])
;









