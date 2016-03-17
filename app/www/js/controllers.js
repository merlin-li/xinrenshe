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
                    data.data.userInfo.token = data.data.token;
                    $cookieStore.put('userinfo', data.data.userInfo);
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
                console.log(u);
                $scope.userObj = u;
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

            // console.log(common.utility.createSign(paramsObj));
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            paramsObj.avatar = $scope.userModel.avatar;

            $http({
                method: 'post',
                url: common.API.setUserInfo,
                data: paramsObj
            }).success(function(data){
                if (data.status === 200) {
                    $location.path('/setting/address');
                } else {
                    common.utility.alert('提示', data.msg);
                }
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
    '$cookieStore',
    'md5',
    function($scope, $http, common, $location, $cookieStore, md5) {
        $scope.userModel = {
            consignee_username: '',
            zip_code: '',
            consignee_address: '',
            province: '',
            city: '',
            area: ''
        };

        $scope.save = function(){
            if (this.userModel.consignee_username === '' 
                || this.userModel.zip_code === ''
                || this.userModel.consignee_address === ''
                || this.userModel.area === '') {
                common.utility.alert('提示', '信息不能为空！');
            } else {
                var self = $scope.userModel,
                    paramsObj = {
                        consignee_username: self.consignee_username,
                        zip_code: self.zip_code,
                        consignee_addr: self.consignee_address,
                        province: self.province,
                        city: self.city,
                        area: self.area
                    }, userObj;
                if ($cookieStore.get('userinfo')) {
                    userObj = $cookieStore.get('userinfo');
                }
                paramsObj.uid = userObj.uid;
                paramsObj.token = userObj.token;

                var signStr = common.utility.createSign(paramsObj);

                // console.log(paramsObj);
                // console.log(signStr);
                // console.log(md5.createHash(signStr));
                // console.log(md5.createHash('111'));
                // console.log(md5.createHash('李蒙'));

                var accessSign = md5.createHash(common.utility.createSign(paramsObj));
                paramsObj.accessSign = accessSign;
                // console.log(paramsObj);
                $http({
                    method: 'post',
                    url: common.API.setConsigneeInfo,
                    data: paramsObj
                }).success(function(data){
                    if (data.status === 200) {
                        $location.path('/home');
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                });
            }
        };

        if ($cookieStore.get('areainfo1')) {
            // $scope.userModel.area = $cookieStore.get('areainfo').name;

            var areaObj1 = $cookieStore.get('areainfo1'),
                areaObj2 = $cookieStore.get('areainfo2'),
                areaObj3 = $cookieStore.get('areainfo3');

            $scope.userModel.province = areaObj1.name;
            $scope.userModel.city = areaObj2.name;
            $scope.userModel.area = areaObj3.name;
        }
    }
])

.controller('CitySettingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$stateParams',
    '$cookieStore',
    function($scope, $http, common, $location, md5, $stateParams, $cookieStore) {
        function _init (pid){
            // console.log($cookieStore.get('areainfo'));
            common.utility.loadingShow();
            if ($stateParams.areaId) {
                pid = $stateParams.areaId;
            }
            var paramsObj = {pid: pid};
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.getRegion,
                data: paramsObj
            }).success(function(data){
                // console.log(data);
                if (data.status === 200) {
                    $scope.areaData = data.data.regionList;
                } else {
                    //表示选中当前的地区，进行跳转
                    $location.path('/setting/address');
                }
                common.utility.loadingHide();
            });
        };


        $scope.go = function(i){
            if (i.type === 1) {
                //表示省份
                $cookieStore.put('areainfo1', i);
            } else if (i.type === 2) {
                //表示市
                $cookieStore.put('areainfo2', i);
            } else if (i.type === 3) {
                //表示区县
                $cookieStore.put('areainfo3', i);
            }
            $location.path('/city/setting/' + i.id);
        };

        _init(1);
    }
])

.controller('SendtipCtrl', [
    '$scope',
    'Common',
    '$location',
    function($scope, common, $location) {
        $scope.sendModel = {
            agree: false
        };

        $scope.request = function(){
            if (!this.sendModel.agree) {
                common.utility.alert('提示', '请同意阅读提示！');
            } else {
                $location.path('/card/send');
            }
        };
    }
])

.controller('SendCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        var userCookie = common.utility.getUserCookie(), paramsObj;
        if (userCookie) {
            paramsObj = {
                uid: userCookie.uid,
                token: userCookie.token
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            $http({
                method: 'post',
                url: common.API.getDestinyUser,
                data: paramsObj
            }).success(function(data) {
                if (data.status === 200) {
                    $scope.userObj = data.data.userInfo;
                    $scope.userObj.avatar = data.data.host + $scope.userObj.avatar;
                    var dateObj = new Date(data.data.userInfo.create_at * 1000);
                    $scope.userObj.create_at = dateObj.getFullYear() + '年' + dateObj.getMonth() + '月' + dateObj.getDate() + '日';
                } else {
                    common.utility.alert('提示', data.msg);
                }
            });
        } else {
            $location.path('/user/login');
        }
    }
])

.controller('MySendingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        var paramsObj = {
            type: 1,
            uid: '',
            token: ''
        }, userCookie = common.utility.getUserCookie();

        if (userCookie) {
            paramsObj.uid = userCookie.uid;
            paramsObj.token = userCookie.token;
        } else {
            $location.path('/user/login');
        }

        $scope.readCardList = function(t) {
            if (t === 1) {
                $scope.btnClass1 = 'button-positivehover';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button';
            } 
            if (t === 4) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button-positivehover';
                $scope.btnClass3 = 'button';
            }
            if (t === 5) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button-positivehover';
            }
            paramsObj.type = t;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.orderList,
                data: paramsObj
            }).success(function(data){
                //处理card的示例图
                data.data.orderList.map(function(order){
                    if (order.picture) {
                        order.picture = data.data.host + order.picture;
                    } else {
                        order.picture = 'img/xjbj_1.png';
                    }
                });
                $scope.cardModel = data.data;
                common.utility.loadingHide();
            }).error(function(){
                common.utility.loadingHide();
            });
        };

        $scope.send = function(i) {
            var sendParamsObj = {
                order_ids: [i.id],
                token: userCookie.token,
                uid: userCookie.uid
            };
            sendParamsObj.accessSign = md5.createHash(common.utility.createSign(sendParamsObj));

            $http({
                method: 'post',
                url: common.API.send, 
                data: sendParamsObj
            }).success(function(data){
                common.utility.alert('提示', data.msg);
            });
        };

        $scope.show = function() {
            $scope.modelStyle = {'display': 'block'};
        };

        $scope.hide = function() {
            $scope.modelStyle = {'display': 'none'};
        };

        $scope.modelStyle = {'display': 'none'};
        $scope.readCardList(1);


        var takeCardPicture = document.getElementById('takecardpicture');
        takeCardPicture.onchange = function (event){
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

                $scope.cardModel.orderList.map(function(card){
                    if (card.id === $scope.selectCardIndex) {
                        card.picture = imgurl;
                    }
                });
                // 上传寄片照片的操作
                var picParamsObj = {
                    order_id: $scope.selectCardIndex,
                    uid: userCookie.uid,
                    token: userCookie.token
                };
                picParamsObj.accessSign = md5.createHash(common.utility.createSign(picParamsObj));
                picParamsObj.picture = imgurl;
                $http({
                    method: 'post',
                    url: common.API.uploadPic,
                    data: picParamsObj
                }).success(function(data){
                    // console.log(data);
                }).error(function(){});
                $scope.$digest();
            };
        };

        $scope.takePic = function(c) {
            //保存当前选中的编号
            $scope.selectCardIndex = c.id;
            takeCardPicture.click();
        };
    }
])

.controller('MyReceivingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        $scope.showTip = true;
        var paramsObj = {
            type: 3,
            uid: '',
            token: ''
        }, userCookie = common.utility.getUserCookie();

        if (userCookie) {
            paramsObj.uid = userCookie.uid;
            paramsObj.token = userCookie.token;
        } else {
            $location.path('/user/login');
        }
        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

        $scope.readCardList = function(t) {
            if (t === 3) {
                $scope.btnClass1 = 'button-positivehover';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button';
            } 
            if (t === 2) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button-positivehover';
                $scope.btnClass3 = 'button';
            }
            if (t === 6) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button-positivehover';
            }
            paramsObj.type = t;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.orderList,
                data: paramsObj
            }).success(function(data){
                data.data.orderList.map(function(order){
                    if (order.picture) {
                        order.picture = data.data.host + order.picture;
                    } else {
                        order.picture = 'img/xjbj_1.png';
                    }
                });

                $scope.cardModel = data.data;
                common.utility.loadingHide();
                $scope.showTip = (data.data.orderList.length > 0);
            }).error(function(){
                common.utility.loadingHide();
            });
        };

        $scope.readCardList(3);
    }
])
;









