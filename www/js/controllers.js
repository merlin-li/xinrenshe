'use strict';
angular.module('xinrenshe.controllers', ['ngCordova', 'angular-md5'])
    .config([
        '$sceDelegateProvider',
        '$httpProvider',
        function($sceDelegateProvider, $httpProvider) {
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                'http://activity.xinrenclub.com/**',
                'http://www.xinrenclub.com/**'
            ]);
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
    function($scope, $http, common, $location, $ionicSlideBoxDelegate) {
        ! function() {
            common.utility.cookieStore.remove('areainfo1');
            common.utility.cookieStore.remove('areainfo2');
            common.utility.cookieStore.remove('areainfo3');
            common.utility.cookieStore.remove('bannerurl');
            //初始化事件
            $http({
                method: 'post',
                url: common.API.home
            }).success(function(data) {
                if (data.status === 200) {
                    $scope.dataObj = data.data;
                    $scope.dataObj.host = data.data.host;
                    $ionicSlideBoxDelegate.update();
                }
            });
        }();

        $scope.go = function(b) {
            if (b.url !== '') {
                common.utility.cookieStore.put('bannerurl', b);
                $location.path('/banner');
            }
        };
    }
])

.controller('BannerCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        ! function() {
            if (common.utility.cookieStore.get('bannerurl')) {
                var bannerObj = common.utility.cookieStore.get('bannerurl');
                $scope.bannerModel = bannerObj;
            }
        }();
    }
])

.controller('LoginCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$stateParams',
    'md5',
    function($scope, $http, common, $location, $stateParams, md5) {
        $scope.loginModel = {
            phone: '',
            password: ''
        };

        $scope.login = function() {
            var signStr = common.utility.createSign($scope.loginModel);
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.login,
                data: {
                    phone: $scope.loginModel.phone,
                    password: $scope.loginModel.password,
                    accessSign: md5.createHash(signStr)
                }
            }).success(function(data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    //登录成功
                    data.data.userInfo.token = data.data.token;
                    data.data.host = data.data.host;
                    common.utility.cookieStore.put('userinfo', data.data.userInfo);
                    $location.path('/home');
                } else {
                    common.utility.alert(data.msg);
                }
            });
        };

        ! function() {
            common.utility.checkLogin().success(function(u) {
                $location.path('/user');
            });
        }();
    }
])

.controller('ForgetpwdCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$interval',
    function($scope, $http, common, $location, md5, $interval) {
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
        $scope.sendcode = function() {
            var _m = $scope.signupModel;

            if (_m.getCode.class === 'goods-btn') {
                //表示可以发送验证码
                var pnum = _m.phone,
                    checkResult = common.utility.checkPhone(pnum),
                    paramsObj = {
                        phone: pnum
                    };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                if (checkResult) {
                    //发送验证码的请求
                    $http({
                        method: 'POST',
                        url: common.API.loginCode,
                        data: paramsObj
                    }).success(function(data) {
                        if (data.status === 200) {
                            //发送成功
                            common.utility.alert('提示', '验证码已发送！');
                            var iv = 60,
                                beginTime = $interval(function() {
                                    iv--;
                                    if (iv >= 0) {
                                        $scope.signupModel.getCode.class = 'button-tishi';
                                        $scope.signupModel.getCode.value = iv + '秒后重新发送';
                                    } else {
                                        $interval.cancel(beginTime);
                                        $scope.signupModel.getCode = {
                                            'value': '获取验证码',
                                            'class': 'goods-btn'
                                        };
                                    }
                                }, 1000);
                        } else {
                            common.utility.alert('提示', data.msg);
                        }
                    }).error(function() {
                        common.utility.alert('提示', '短信发送失败！');
                    });
                } else {
                    common.utility.alert('提示', '无效的手机号码！');
                }
            } else {
                // common.utility.alert('提示', '不可用');
            }
        };

        $scope.save = function() {
            var signupModel = $scope.signupModel,
                paramsObj;
            if (signupModel.phone === '') {
                common.utility.alert('提示', '请输入手机号码！');
            } else if (signupModel.code === '') {
                common.utility.alert('提示', '验证码不能为空！');
            } else if (signupModel.pwd === '') {
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
                    url: common.API.setNewPasswd,
                    data: paramsObj
                }).success(function(data) {
                    if (data.status === 200) {
                        common.utility.alert('提示', '重置密码成功！').then(function(){
                            // common.utility.cookieStore.put('userinfo', data.data);
                            $location.path('/user/login');
                        });
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                });
            }
        };
    }
])

.controller('UserCtrl', [
    '$scope',
    '$http',
    'Common',
    'md5',
    function($scope, $http, common, md5) {
        ! function() {
            common.utility.checkLogin().success(function(u) {
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

                $http({
                    method: 'post',
                    url: common.API.getUserInfo,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d){
                        $scope.userObj = d.data.userInfo;
                        $scope.userObj.avatar = d.data.host + d.data.userInfo.avatar;
                        $scope.userObj.token = d.data.token;
                        common.utility.cookieStore.remove('userinfo');
                        common.utility.cookieStore.put('userinfo', $scope.userObj);
                    });
                });
            }).fail(function() {
                common.utility.resetToken();
            });
        }();

        $scope.logout = function(){
            common.utility.resetToken();
        };
    }
])

.controller('WriterCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {

        function _init() {
            common.utility.checkLogin().success(function(u){
                common.utility.loadingShow();
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                $scope.uObj = u;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.postCardMasterHome,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        $scope.postObj = d.data;
                    });
                });

                var paramsObj1 = {
                    uid: u.uid,
                    token: u.token,
                    per: 1000
                };
                paramsObj1.accessSign = md5.createHash(common.utility.createSign(paramsObj1));
                $http({
                    method: 'post',
                    url: common.API.postCardMastertaskList,
                    data: paramsObj1
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        if(d.data.taskList.length > 0) {
                            d.data.taskList.map(function(t){
                                if(t.create_at) {
                                    t.create_at = new Date(t.create_at * 1000).format('yyyy-MM-dd hh:mm');
                                }
                            });
                        }
                        $scope.taskObj = d.data;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });            
        }
        _init();

        $scope.write = function(t) {
            var pObj = {
                task_id: t.id,
                uid: $scope.uObj.uid, 
                token: $scope.uObj.token
            };
            pObj.accessSign = md5.createHash(common.utility.createSign(pObj));
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.takeOverTask,
                data: pObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.alert(data.msg);
                if (data.status === 200) {
                    _init();
                }
            });
        };

        $scope.refresh = function() {
            _init();
        };
    }
])

.controller('TipsCtrl', [
    '$scope',
    '$http',
    'Common',
    'md5',
    '$stateParams',
    function($scope, $http, common, md5, $stateParams) {
        common.utility.loadingShow();
        var paramsObj = {type: $stateParams.id};
        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
        $http({
            method: 'post',
            url: common.API.manual,
            data: paramsObj
        }).success(function(data){
            common.utility.loadingHide();
            $scope.questionList = data.data.manualList;
        }).error(function(){
            common.utility.loadingHide();
            alert('api error.');
        });
    }
])

.controller('SignupCtrl', [
    '$scope',
    '$http',
    '$location',
    '$interval',
    'Common',
    'md5',
    function($scope, $http, $location, $interval, common, md5) {
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
        $scope.signup = function() {
            var signupModel = $scope.signupModel,
                paramsObj;
            if (signupModel.phone === '') {
                common.utility.alert('提示', '请输入手机号码！');
            } else if (signupModel.code === '') {
                common.utility.alert('提示', '验证码不能为空！');
            } else if (signupModel.pwd === '') {
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
                }).success(function(data) {
                    if (data.status === 200) {
                        common.utility.alert('提示', '注册成功！').then(function(){
                            common.utility.cookieStore.put('userinfo', data.data);
                            $location.path('/setting/userinfo');
                        });
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                });
            }
        };

        //发送验证码
        $scope.sendcode = function() {
            var _m = $scope.signupModel;

            if (_m.getCode.class === 'goods-btn') {
                //表示可以发送验证码
                var pnum = _m.phone,
                    checkResult = common.utility.checkPhone(pnum),
                    paramsObj = {
                        phone: pnum
                    };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                if (checkResult) {
                    //发送验证码的请求
                    $http({
                        method: 'POST',
                        url: common.API.regCode,
                        data: paramsObj
                    }).success(function(data) {
                        if (data.status === 200) {
                            //发送成功
                            common.utility.alert('提示', '验证码已发送！');
                            var iv = 60,
                                beginTime = $interval(function() {
                                    iv--;
                                    if (iv >= 0) {
                                        $scope.signupModel.getCode.class = 'button-tishi';
                                        $scope.signupModel.getCode.value = iv + '秒后重新发送';
                                    } else {
                                        $interval.cancel(beginTime);
                                        $scope.signupModel.getCode = {
                                            'value': '获取验证码',
                                            'class': 'goods-btn'
                                        };
                                    }
                                }, 1000);
                        } else {
                            common.utility.alert('提示', data.msg);
                        }
                    }).error(function() {
                        common.utility.alert('提示', '短信发送失败！');
                    });
                } else {
                    common.utility.alert('提示', '无效的手机号码！');
                }
            } else {
                // common.utility.alert('提示', '不可用');
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
    '$cordovaCamera',
    function($scope, $http, common, $location, md5, $cordovaCamera) {
        $scope.userModel = {
            nickname: '',
            gender: '男',
            avatar: 'img/tx_1.png'
        };
        if (common.tempData.imgData) {
            $scope.userModel.avatar = common.tempData.imgData;
        }

        //下一步
        $scope.next = function() {
            var paramsObj = {
                    uid: '',
                    token: '',
                    username: $scope.userModel.nickname,
                    sex: $scope.userModel.gender === '男' ? 1 : 0
                },
                userObj;

            if (common.utility.cookieStore.get('userinfo')) {
                userObj = common.utility.cookieStore.get('userinfo');
            }

            paramsObj.uid = userObj.uid;
            paramsObj.token = userObj.token;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            paramsObj.avatar = $scope.userModel.avatar;

            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.setUserInfo,
                data: paramsObj
            }).success(function(data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    $location.path('/setting/address');
                } else {
                    common.utility.alert('提示', data.msg);
                }
            });
        };

        $scope.takePicture = function() {
            common.utility.takePicture($cordovaCamera, function(s){
                $scope.userModel.avatar = s;
            }, function(){})
        };
    }
])

.controller('SetAddressCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        $scope.userModel = {
            consignee_username: '',
            zip_code: '',
            consignee_address: '',
            province: '',
            city: '',
            area: ''
        };


        $scope.save = function() {
            if (this.userModel.consignee_username === '' || this.userModel.zip_code === '' || this.userModel.consignee_address === '' || this.userModel.area === '') {
                common.utility.alert('提示', '信息不能为空！');
            } else {
                //邮编检查
                var reg = /^\d{6}$/;
                if (!reg.test($scope.userModel.zip_code)) {
                    common.utility.alert('提示', '邮编格式不正确！');
                    return false;
                }
                var self = $scope.userModel,
                    paramsObj = {
                        consignee_username: self.consignee_username,
                        zip_code: self.zip_code,
                        consignee_addr: self.consignee_address,
                        province: self.province,
                        city: self.city,
                        area: self.area
                    },
                    userObj;
                if (common.utility.cookieStore.get('userinfo')) {
                    userObj = common.utility.cookieStore.get('userinfo');
                }
                paramsObj.uid = userObj.uid;
                paramsObj.token = userObj.token;

                var signStr = common.utility.createSign(paramsObj);

                var accessSign = md5.createHash(common.utility.createSign(paramsObj));
                paramsObj.accessSign = accessSign;
                // console.log(paramsObj);
                $http({
                    method: 'post',
                    url: common.API.setConsigneeInfo,
                    data: paramsObj
                }).success(function(data) {
                    if (data.status === 200) {
                        $location.path('/home');
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                });
            }
        };

        $scope.goAddress = function() {
            // common.tempData.userAddressInfo = this.userModel;
            common.utility.cookieStore.put('useraddressinfo', this.userModel);
            $location.path('/city/setting/type/');
        };

        ! function() {
            // if (common.tempData.userAddressInfo) {
            //     $scope.userModel = common.tempData.userAddressInfo;
            // }
            if (common.utility.cookieStore.get('useraddressinfo')) {
                $scope.userModel = common.utility.cookieStore.get('useraddressinfo');
            }
            if (common.utility.cookieStore.get('areainfo1') && common.utility.cookieStore.get('areainfo2') && common.utility.cookieStore.get('areainfo3')) {
                var areaObj1 = common.utility.cookieStore.get('areainfo1'),
                    areaObj2 = common.utility.cookieStore.get('areainfo2'),
                    areaObj3 = common.utility.cookieStore.get('areainfo3');

                $scope.userModel.province = areaObj1.name;
                $scope.userModel.city = areaObj2.name;
                $scope.userModel.area = areaObj3.name;
            }
            common.utility.cookieStore.remove('areainfo1'),
            common.utility.cookieStore.remove('areainfo2'),
            common.utility.cookieStore.remove('areainfo3');
            common.utility.cookieStore.remove('useraddressinfo');
        }();
    }
])

.controller('CitySettingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$stateParams',
    function($scope, $http, common, $location, md5, $stateParams) {
        if ($stateParams.type) {
            common.utility.cookieStore.put('citySetType', $stateParams.type);
        }

        function _init(pid) {
            common.utility.loadingShow();
            if ($stateParams.areaId) {
                pid = $stateParams.areaId;
            }
            var paramsObj = {
                pid: pid
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.getRegion,
                data: paramsObj
            }).success(function(data) {
                if (data.status === 200) {
                    $scope.areaData = data.data.regionList;
                } else {
                    //表示选中当前的地区，进行跳转
                    var redirect_type = common.utility.cookieStore.get('citySetType');

                    if (!redirect_type) {
                        $location.path('/setting/address');
                    } else {
                        //按redirect_type 下划线分割 如redirect_type = “setting_address” 则跳转地址为“/setting/address”;
                        var redirectArr = redirect_type.split('_');
                        var redirectUrl = '';
                        for (var i in redirectArr) {
                            redirectUrl += '/' + redirectArr[i];
                        }
                        common.utility.cookieStore.remove('citySetType');
                        $location.path(redirectUrl);
                    }
                }
                common.utility.loadingHide();
            });
        };


        $scope.go = function(i) {
            if (i.type === 1) {
                //表示省份
                common.utility.cookieStore.put('areainfo1', i);
                $location.path('/city/setting/' + i.id);
            } else if (i.type === 2) {
                //表示市
                common.utility.cookieStore.put('areainfo2', i);

                if (common.utility.cookieStore.get('citySetType') === 'corporation') {
                    //如果是创建联名社的选择时候，进行跳转
                    $location.path('/corporation/create');
                } else {
                    $location.path('/city/setting/' + i.id);
                }
            } else if (i.type === 3) {
                //表示区县
                common.utility.cookieStore.put('areainfo3', i);
                $location.path('/city/setting/' + i.id);
            }
        };

        _init(1);
    }
])

.controller('SendtipCtrl', [
    '$scope',
    'Common',
    '$location',
    'md5',
    '$http',
    function($scope, common, $location, md5, $http) {
        $scope.sendModel = {
            agree: true,
            showResult: false
        };

        $scope.request = function() {            
            if (!this.sendModel.agree) {
                common.utility.alert('提示', '请同意阅读提示！');
            } else {
                // $location.path('/card/send');
                common.utility.checkLogin().success(function(u){
                    common.utility.loadingShow();
                    var paramsObj = {
                        uid: u.uid,
                        token: u.token
                    };
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

                    $http({
                        method: 'post',
                        url: common.API.getDestinyUser,
                        data: paramsObj
                    }).success(function(data) {
                        common.utility.loadingHide();
                        if (data.status === 200) {
                            $scope.sendModel.showResult = true;
                            data.data.userInfo.avatar = data.data.host + data.data.userInfo.avatar;
                            data.data.userInfo.create_at = new Date(data.data.userInfo.create_at * 1000).format('yyyy-MM-dd');
                            $scope.userObj = data.data.userInfo;
                        } else if(data.status === 402) {
                            common.utility.resetToken();
                        } else if (data.status === 501) {
                            common.utility.alert('提示', data.msg).then(function(){
                                $location.path('/home');
                            });
                        }
                    });
                }).fail(function(){
                    common.utility.resetToken();
                });
            }
        };
    }
])

.controller('MySendingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$cordovaCamera',
    function($scope, $http, common, $location, md5, $cordovaCamera) {
        var paramsObj = {
                type: 1,
                uid: '',
                token: ''
            },
            userCookie = common.utility.getUserCookie(), _loadPicture;
        _loadPicture = function(imgurl) {
            // 上传寄片照片的操作
            var picParamsObj = {
                order_id: $scope.selectCardIndex,
                uid: userCookie.uid,
                token: userCookie.token,
                type: 3
            };
            picParamsObj.accessSign = md5.createHash(common.utility.createSign(picParamsObj));
            picParamsObj.picture = imgurl;
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.uploadPic,
                data: picParamsObj
            }).success(function(data) {
                common.utility.loadingHide();
            }).error(function() {alert('api error.');});

            //替换当前的上传图片缩略图
            $scope.orderList.map(function(t){
                if (t.id == $scope.selectCardIndex) {
                    t.picture = imgurl;
                }
            });
            $scope.$apply();
        };

        $scope.showTip = true;
        $scope.statusObj = {txt: '已旅行', hide: true};
        $scope.modelStyle = {'display': 'none'};
        $scope.selectIndex = 1;
        $scope.orderList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;

        $scope.readCardList = function(t) {
            if (t && t!== $scope.selectIndex) {
                $scope.orderList = [];
                $scope.currentPage = 1;
                $scope.lastPage = 10;
            }
            $scope.selectIndex = t || $scope.selectIndex;

            if (this.selectIndex === 1) {
                $scope.btnClass1 = 'button-positivehover';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button';
                this.statusObj.hide = true;
            }
            if (this.selectIndex === 4) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button-positivehover';
                $scope.btnClass3 = 'button';
                this.statusObj.hide = false;
                this.statusObj.txt = '已旅行';
            }
            if (this.selectIndex === 5) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button-positivehover';
                this.statusObj.hide = false;
                this.statusObj.txt = '共旅行';
            }
            paramsObj.type = $scope.selectIndex;
            paramsObj.page = $scope.currentPage;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.orderList,
                    data: paramsObj
                }).success(function(data) {
                    //处理card的示例图
                    common.utility.handlePostResult(data, function(d) {
                        if (d.data.orderList.length > 0) {
                            d.data.orderList.map(function(order) {
                                if (order.picture) {
                                    order.picture = d.data.host + order.picture;
                                } else {
                                    order.picture = 'img/xjbj_1.png';
                                }
                            });
                        }
                        $scope.lastPage = d.data.totalPage;
                        $scope.orderList = $scope.orderList.concat(d.data.orderList);
                        $scope.showTip = ($scope.orderList.length > 0);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    alert('api error.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.send = function(i) {
            var sendParamsObj = {
                order_ids: [i.id],
                token: userCookie.token,
                uid: userCookie.uid,
                type: 3
            };
            sendParamsObj.accessSign = md5.createHash(common.utility.createSign(sendParamsObj));

            $http({
                method: 'post',
                url: common.API.send,
                data: sendParamsObj
            }).success(function(data) {
                // alert(JSON.stringify(data));
                common.utility.alert('提示', data.msg);
                if (data.status === 200) {
                    $scope.orderList = [];
                    $scope.currentPage = 1;
                    $scope.readCardList();
                }
            });
        };

        $scope.show = function() {
            $scope.modelStyle = {
                'display': 'block'
            };
        };

        $scope.hide = function() {
            $scope.modelStyle = {
                'display': 'none'
            };
        };

        $scope.takePic = function(c) {
            //保存当前选中的编号
            if ($scope.selectIndex === 1){
                $scope.selectCardIndex = c.id;
                common.utility.takePicture($cordovaCamera, _loadPicture);
            }
        };

        common.utility.checkLogin().success(function(u){
            paramsObj.uid = u.uid;
            paramsObj.token = u.token;
        }).fail(function(){
            common.utility.resetToken();
        });
    }
])

.controller('MemberCardCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$cordovaCamera',
    '$stateParams',
    function($scope, $http, common, $location, md5, $cordovaCamera, $stateParams) {
        $scope.showTip = true;
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.statusObj = {txt: '已旅行', hide: true};
        $scope.modelStyle = {'display': 'none'};
        $scope.selectIndex = 0;
        $scope.orderList = [];
        $scope.memberList = [];

        var paramsObj = {
                type: 1,
                uid: '',
                token: ''
            },
            activityId = $stateParams.id,
            userCookie = common.utility.getUserCookie(), _loadPicture;

        _loadPicture = function(imgurl) {
            // 上传寄片照片的操作
            var picParamsObj = {
                order_id: $scope.selectCardIndex,
                uid: userCookie.uid,
                token: userCookie.token,
                type: 4
            };
            picParamsObj.accessSign = md5.createHash(common.utility.createSign(picParamsObj));
            picParamsObj.picture = imgurl;
            common.utility.loadingShow();

            $http({
                method: 'post',
                url: common.API.uploadPic,
                data: picParamsObj
            }).success(function(data) {
                // alert(JSON.stringify(data));
                common.utility.loadingHide();
            }).error(function() {});

            //替换当前的上传图片缩略图
            $scope.orderList.map(function(t){
                if (t.id == $scope.selectCardIndex) {
                    t.picture = imgurl;
                }
            });
            $scope.$apply();
        };

        $scope.loadMore = function(){
            if ($scope.selectIndex === 0) {
                this.readHandleList();
            } else {
                this.readCardList();
            }
        };

        //获取等待处理的数据
        $scope.readHandleList = function() {
            if ($scope.selectIndex !== 0) {
                $scope.memberList = [];
                $scope.currentPage = 1;
                $scope.lastPage = 10;
            }
            $scope.selectIndex = 0;
            $scope.btnClass0 = 'button-positivehover';
            $scope.btnClass1 = 'button';
            $scope.btnClass2 = 'button';
            $scope.btnClass3 = 'button';

            var pObj = {
                uid: userCookie.uid,
                token: userCookie.token,
                activity_id: activityId,
                page: $scope.currentPage
            };
            pObj.accessSign = md5.createHash(common.utility.createSign(pObj));
            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.cadgeUserList,
                    data: pObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.cadgeList.map(function(t){
                            t.avatar = d.data.host + t.avatar;
                            if (t.status === 0) {
                                t.statusText = '等待处理';
                            }
                            if (t.status === 1) {
                                t.statusText = '符合';
                            }
                            if (t.status === 2) {
                                t.statusText = '不符合';
                            }
                        });
                        $scope.memberList = $scope.memberList.concat(d.data.cadgeList);
                        $scope.showTip = ($scope.memberList.length > 0);
                        $scope.lastPage = d.data.totalPage;
                        $scope.noMoreData = ($scope.lastPage <= 1);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                });
            }
        };

        $scope.readCardList = function(t) {
            if (t && t!== $scope.selectIndex) {
                $scope.orderList = [];
                $scope.currentPage = 1;
                $scope.lastPage = 10;
                // $scope.noMoreData = false;
            }
            $scope.selectIndex = t || $scope.selectIndex;
            if (this.selectIndex === 1) {
                $scope.btnClass0 = 'button';
                $scope.btnClass1 = 'button-positivehover';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button';
                this.statusObj.hide = true;
            }
            if (this.selectIndex === 2) {
                $scope.btnClass0 = 'button';
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button-positivehover';
                $scope.btnClass3 = 'button';
                this.statusObj.hide = false;
                this.statusObj.txt = '已旅行';
            }
            if (this.selectIndex === 3) {
                $scope.btnClass0 = 'button';
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button-positivehover';
                this.statusObj.hide = false;
                this.statusObj.txt = '共旅行';
            }
            paramsObj.type = $scope.selectIndex;
            paramsObj.activity_id = activityId;
            paramsObj.page = $scope.currentPage;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.corpSendOrderList,
                    data: paramsObj
                }).success(function(data) {
                    //处理card的示例图
                    common.utility.handlePostResult(data, function(d){
                        d.data.orderList.map(function(order) {
                            if (order.picture) {
                                order.picture = d.data.host + order.picture;
                            } else {
                                order.picture = 'img/xjbj_1.png';
                            }
                        });
                        $scope.lastPage = d.data.totalPage;
                        $scope.orderList = $scope.orderList.concat(d.data.orderList);
                        $scope.showTip = ($scope.orderList.length > 0);
                        $scope.currentPage++;
                        $scope.noMoreData = ($scope.lastPage <= 1);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    common.utility.loadingHide();
                });
            }
        };

        $scope.send = function(i) {
            var sendParamsObj = {
                order_ids: [i.id],
                token: userCookie.token,
                uid: userCookie.uid,
                type: 4
            };
            sendParamsObj.accessSign = md5.createHash(common.utility.createSign(sendParamsObj));
            // alert(JSON.stringify(sendParamsObj));
            $http({
                method: 'post',
                url: common.API.send,
                data: sendParamsObj
            }).success(function(data) {
                // alert(JSON.stringify(data));
                common.utility.alert('提示', data.msg);
                if (data.status === 200) {
                    $scope.orderList = [];
                    $scope.currentPage = 1;
                    $scope.readCardList();
                }
            });
        };

        $scope.show = function() {
            $scope.modelStyle = {
                'display': 'block'
            };
        };

        $scope.hide = function() {
            $scope.modelStyle = {
                'display': 'none'
            };
        };

        $scope.takePic = function(c) {
            //保存当前选中的编号
            if ($scope.selectIndex === 1){
                $scope.selectCardIndex = c.id;
                common.utility.takePicture($cordovaCamera, _loadPicture);
            }
        };

        $scope.deal = function(i, t){
            var obj = {
                uid: userCookie.uid,
                token: userCookie.token,
                activity_id: activityId,
                type: t,
                cadge_id: i
            };
            obj.accessSign = md5.createHash(common.utility.createSign(obj));
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.cadgeUserDeal,
                data: obj
            }).success(function(data){
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', d.msg);
                    $scope.currentPage = 1;
                    $scope.memberList = [];
                    $scope.lastPage = 10;
                    $scope.readHandleList();
                });
                common.utility.loadingHide();
            });
        };

        common.utility.checkLogin().success(function(u){
            paramsObj.uid = u.uid;
            paramsObj.token = u.token;
            // $scope.readHandleList();
        }).fail(function(){
            common.utility.resetToken();
        });
    }
])

.controller('MyUserInfoCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$cordovaCamera',
    function($scope, $http, common, $location, $cordovaCamera) {
        ! function() {
            common.utility.checkLogin().success(function(u) {
                $scope.userObj = u;
            }).fail(function() {
                common.utility.resetToken();
            });
        }();

        $scope.inputHide = true;
        $scope.usernameHide = false;
        $scope.changeUserName = function() {
            $scope.usernameHide = true;
            $scope.inputHide = false;
        };

        $scope.saveUserInfo = function() {
            var params = {
                'username': $scope.userObj.username
            };
            var url = common.API.modifyUserName;
            var success = function(data) {
                if (data.status === 200) {
                    $scope.inputHide = true;
                    $scope.usernameHide = false;
                    common.utility.cookieStore.put('userinfo', $scope.userObj);
                    $location.path('/user');
                } else {
                    common.utility.alert('提示', data.msg);
                }
            }
            common.utility.postData(url, params, true, true, success);
        }

        $scope.takePicture = function() {
            common.utility.takePicture($cordovaCamera, function(avatar){
                var params = {
                    'avatar': avatar
                };
                var url = common.API.modifyAvatar;
                var success = function(data) {
                    if (data.status === 200) {
                        $scope.userObj.avatar = data.data.avatar;
                        $scope.userObj.host = data.data.host;
                        common.utility.cookieStore.put('userinfo', $scope.userObj);
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                }
                common.utility.postData(url, params, true, true, success);
            });
        };
    }
])

.controller('MyReceivingCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$ionicPopup',
    function($scope, $http, common, $location, md5, $ionicPopup) {
        $scope.showTip = true;
        $scope.selectIndex = 3;
        $scope.orderList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.statusObj = {
            txt: '已旅行',
            hide: false,
            hideBtn: false
        };

        var paramsObj = {
                type: 3,
                uid: '',
                token: ''
            };

        $scope.readCardList = function(t) {
            if (t && t!== $scope.selectIndex) {
                $scope.orderList = [];
                $scope.currentPage = 1;
                $scope.lastPage = 10;
            }
            $scope.selectIndex = t || $scope.selectIndex;
            if (this.selectIndex === 3) {
                $scope.btnClass1 = 'button-positivehover';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button';
                $scope.statusObj.hide = true;
                $scope.statusObj.hideBtn = true;
            }
            if (this.selectIndex === 2) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button-positivehover';
                $scope.btnClass3 = 'button';
                $scope.statusObj.hide = false;
                $scope.statusObj.txt = '已旅行';
                $scope.statusObj.hideBtn = false;
            }
            if (this.selectIndex === 6) {
                $scope.btnClass1 = 'button';
                $scope.btnClass2 = 'button';
                $scope.btnClass3 = 'button-positivehover';
                $scope.statusObj.hide = false;
                $scope.statusObj.txt = '共旅行';
                $scope.statusObj.hideBtn = true;
            }
            paramsObj.type = this.selectIndex;
            paramsObj.page = this.currentPage;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.orderList,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d){
                        d.data.orderList.map(function(order) {
                            if (order.picture) {
                                order.picture = d.data.host + order.picture;
                            } else {
                                order.picture = 'img/xjbj_2.png';
                            }
                            if (order.sender_avatar) {
                                order.sender_avatar = d.data.host + order.sender_avatar;
                            }
                            if (order.corporation_avatar) {
                                order.corporation_avatar = d.data.host + order.corporation_avatar;
                            }
                        });

                        $scope.lastPage = d.data.totalPage;
                        $scope.orderList = $scope.orderList.concat(d.data.orderList);
                        $scope.showTip = ($scope.orderList.length > 0);
                        $scope.noMoreData = (d.data.totalPage <= 1);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    alert('api error.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.done = function(c) {
            var confirmObj = {
                    order_id: c.id,
                    uid: paramsObj.uid,
                    token: paramsObj.token
                },
                confirmPopup = $ionicPopup.confirm({
                    title: '温馨提示',
                    template: '您已经收到该编码的明信片?',
                    cancelText: '取消',
                    okText: '确定'
                });
            confirmPopup.then(function(res) {
                if (res) {
                    //确定收到当前的明信片
                    confirmObj.accessSign = md5.createHash(common.utility.createSign(confirmObj));
                    $http({
                        method: 'post',
                        url: common.API.confirmReceipt,
                        data: confirmObj
                    }).success(function(data) {
                        if (data.status === 200) {
                            $scope.orderList = [];
                            $scope.currentPage = 1;
                            $scope.readCardList($scope.selectIndex);
                        } else {
                            common.utility.alert('提示', data.msg);
                        }
                    }).error(function(){
                        alert('api error.');
                    });
                }
            });
        };

        !function(){
            common.utility.checkLogin().success(function(u){
                paramsObj.uid = u.uid;
                paramsObj.token = u.token;
            }).fail(function(){
                common.utility.resetToken();
            });
        }();
    }
])

.controller('MyAddressCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    function($scope, $http, common, $location) {
        ! function() {
            common.utility.checkLogin().success(function(u) {
                $scope.userModel = u;
            }).fail(function() {
                $location.path('/user/login');
            });
            if (common.utility.cookieStore.get('areainfo1') && common.utility.cookieStore.get('areainfo2') && common.utility.cookieStore.get('areainfo3')) {
                var areaObj1 = common.utility.cookieStore.get('areainfo1'),
                    areaObj2 = common.utility.cookieStore.get('areainfo2'),
                    areaObj3 = common.utility.cookieStore.get('areainfo3');
                $scope.userModel.province = areaObj1.name;
                $scope.userModel.city = areaObj2.name;
                $scope.userModel.area = areaObj3.name;
                common.utility.cookieStore.remove('areainfo1');
                common.utility.cookieStore.remove('areainfo2');
                common.utility.cookieStore.remove('areainfo3');
            }
        }();

        var params = {};
        $scope.save = function() {
            if (this.userModel.consignee_username === '' || this.userModel.zip_code === '' || this.userModel.consignee_addr === '' || this.userModel.area === '') {
                common.utility.alert('提示', '信息不能为空！');
            } else {
                //邮编检查
                var reg = /^\d{6}$/;
                if (!reg.test($scope.userModel.zip_code)) {
                    common.utility.alert('提示', '邮编格式不正确！');
                    return false;
                }
                var self = $scope.userModel,
                    params = {
                        consignee_username: self.consignee_username,
                        zip_code: self.zip_code,
                        consignee_addr: self.consignee_addr,
                        province: self.province,
                        city: self.city,
                        area: self.area
                    };
                var url = common.API.modifyConsigneeInfo;
                var success = function(data) {
                    if (data.status === 200) {
                        common.utility.cookieStore.put('userinfo', $scope.userModel);
                        $location.path('/user');
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                }
                common.utility.postData(url, params, true, true, success);
            }
        };
    }
])

.controller('JointHomeCtrl', [
    '$scope',
    '$http',
    'Common',
    function($scope, $http, common) {
        ! function() {
            $scope.loadType = 'activity';
            $scope.hasMore = true;
            $scope.noData = false;
            $scope.noCurentData = false;
            $scope.activityList = [];
            $scope.corporationList = [];
            $scope.historyActivityList = [];
            $scope.host = "";
            $scope.page = 1;
            $scope.listType = 1;
            $scope.templateUrl = 'templates/joint/activityList.html';
        }();

        $scope.$on('stateChangeSuccess', function() {
            $scope.loadMoreData();
        });

        $scope.changeLoadType = function(loadType) {
            if ($scope.loadType == loadType) {
                return false;
            }

            var listdom = document.getElementsByClassName('scroll');
            angular.element(listdom).css('transform', 'translate3d(0px, 0px, 0px)');
            if (loadType == 'activity') {
                $scope.listType = 1;
                $scope.templateUrl = 'templates/joint/activityList.html';
            } else if (loadType == 'corporation') {
                $scope.templateUrl = 'templates/joint/corporationList.html';
            }
            $scope.noCurentData = false;
            $scope.hasMore = false;
            $scope.noData = false;

            $scope.activityList = [];
            $scope.corporationList = [];
            $scope.historyActivityList = [];

            $scope.page = 1;
            $scope.loadType = loadType;

            //document.documentElement.scrollTop = document.body.scrollTop =0;
            common.utility.loadingShow();
            $scope.loadMoreData();
        }


        $scope.loadMoreData = function() {
            var newParams = {
                page: $scope.page
            };
            if ($scope.loadType == 'activity') { //活动
                newParams.type = $scope.listType;
                var userCookie = common.utility.getUserCookie();
                if (userCookie) {
                    newParams.uid = userCookie.uid;
                    newParams.token = userCookie.token;
                }
            } else { //社团

            }
            _loadList(newParams, $scope.loadType);
        }

        function _loadList(params, loadType) {
            if (loadType == 'activity') {
                var url = common.API.activityList;
            } else {
                var url = common.API.corporationList;
            }

            var success = function(data) {
                common.utility.loadingHide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.status === 200) {
                    $scope.host = data.data.host;
                    $scope.page = $scope.page + 1;
                    if (loadType == 'activity') {
                        if (data.data.activityList.length <= 0) {
                            if ($scope.listType == 1) {
                                $scope.noCurentData = true;
                                $scope.listType = 2;
                                $scope.page = 1;
                            } else {
                                $scope.hasMore = false;
                                $scope.noData = true;
                                return;
                            }
                        }
                    } else {
                        if (data.data.corporationList.length <= 0) {
                            $scope.hasMore = false;
                            $scope.noData = true;
                            return;
                        }
                    }
                    $scope.hasMore = true;

                    if (loadType == 'activity') {
                        if ($scope.listType == 1) {
                            _mergeList(data.data.activityList, $scope.activityList);
                        } else if ($scope.listType == 2) {
                            _mergeList(data.data.activityList, $scope.historyActivityList);
                        }
                    } else {
                        _mergeList(data.data.corporationList, $scope.corporationList);
                    }

                } else {
                    common.utility.alert('提示', data.msg);
                }

            }
            common.utility.postData(url, params, false, true, success);
        }

        function _mergeList(dataActivityList, activityList) {
            angular.forEach(dataActivityList, function(value, key) {
                var dateObj = new Date(value.activity_time * 1000);
                var week = dateObj.getDay();
                var weekStr = '';
                switch (week) {
                    case 1:
                        weekStr = '一';
                        break;
                    case 2:
                        weekStr = '二';
                        break;
                    case 3:
                        weekStr = '三';
                        break;
                    case 4:
                        weekStr = '四';
                        break;
                    case 5:
                        weekStr = '五';
                        break;
                    case 6:
                        weekStr = '六';
                        break;
                    case 7:
                        weekStr = '日';
                        break;
                }
                value.activity_time = (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '周' + weekStr;
                this.push(value);
            }, activityList);
        }
    }
])

.controller('CorporationCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$ionicActionSheet',
    '$location',
    function($http, $scope, common, $stateParams, md5, $ionicActionSheet, $location) {
        var id = $stateParams.id;

        $scope.switchPanel = function() {
            this.pageModel.showActivity = !this.pageModel.showActivity;
        };

        $scope.btnClick = function() {
            var paramsObj = {
                corporation_id: id
            };
            if (this.pageModel.buttonStatus === 0) {
                // 社务管理
                var hideSheet = $ionicActionSheet.show({
                    buttons: [{
                        text: '发布活动'
                    }, {
                        text: '社员管理'
                    }, {
                        text: '发布公告'
                    }, {
                        text: '修改联名社资料'
                    }],
                    cancelText: '取消',
                    cancel: function() {},
                    buttonClicked: function(index) {
                        var url = '/home';
                        switch (index) {
                            case 0:
                                url = '/joint/manage/releaseActivity/' + id;
                                break;
                            case 1:
                                url = '/joint/manage/associator/' + id;
                                break;
                            case 2:
                                //发布公告
                                url = '/joint/manage/notice/' + id
                                break;
                            case 3:
                                //联名社资料编辑
                                common.tempData.corporationInfo = $scope.corpModel;
                                url = '/corporation/profile/edit/' + id;
                                break;
                        }
                        $location.path(url);
                    }
                });
            }
            if (this.pageModel.buttonStatus === 1) {
                //已申请
            }
            if (this.pageModel.buttonStatus === 2 || this.pageModel.buttonStatus === 3) {
                //2表示申请加入
                //3表示退出
                common.utility.checkLogin().success(function(u) {
                    paramsObj.uid = u.uid;
                    paramsObj.token = u.token;
                    paramsObj.type = $scope.pageModel.buttonStatus === 2 ? 1 : 2;
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                    $http({
                        method: 'post',
                        url: common.API.joinExitCorporation,
                        data: paramsObj
                    }).success(function(data) {
                        common.utility.handlePostResult(data, function(d) {
                            common.utility.alert('提示', d.msg);
                            if ($scope.pageModel.buttonStatus === 2) {
                                $scope.pageModel.buttonStatus = 1;
                                $scope.pageModel.buttonText = '已申请';
                            }
                            if ($scope.pageModel.buttonStatus === 3) {
                                $scope.pageModel.buttonStatus = 2;
                                $scope.pageModel.buttonText = '加入';   
                            }
                        });
                    });
                }).fail(function() {
                    common.utility.resetToken();
                });
            }
        };

        ! function() {
            $scope.pageModel = {
                showActivity: false,
                buttonText: '加入',
                buttonStatus: 0,
                hideBtn: false
            };
            common.utility.checkLogin().success(function(u) {
                var paramsObj = {
                        corporation_id: id,
                        uid: u.uid,
                        token: u.token
                    },
                    activityObj = {
                        corporation_id: id,
                        uid: u.uid,
                        token: u.token,
                        per: 100,
                        type: 3
                    },
                    assoParamsObj = {
                        corporation_id: id,
                        per: 300
                    };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                assoParamsObj.accessSign = md5.createHash(common.utility.createSign(assoParamsObj));
                activityObj.accessSign = md5.createHash(common.utility.createSign(activityObj));

                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.corporationDetail,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d) {
                        d.data.avatar = d.data.host + d.data.avatar;
                        $scope.corpModel = d.data;
                        // $scope.corpModel.avatar = d.data.host + d.data.avatar;
                        if (d.data.isPresident) {
                            //如果是社长，显示社务管理
                            $scope.pageModel.buttonText = '社务管理';
                            $scope.pageModel.buttonStatus = 0;
                        } else {
                            if (d.data.joined) {
                                //如果已加入，隐藏按钮
                                $scope.pageModel.hideBtn = false;
                                $scope.pageModel.buttonText = '退出联名社';
                                $scope.pageModel.buttonStatus = 3;
                            } else {
                                //如果没有加入时，判断是否申请，
                                if (d.data.applied) {
                                    //已申请，显示 “已申请”
                                    $scope.pageModel.buttonText = '已申请';
                                    $scope.pageModel.buttonStatus = 1;
                                } else {
                                    //显示“加入”
                                    $scope.pageModel.buttonText = '加入';
                                    $scope.pageModel.buttonStatus = 2;
                                }
                            }
                        }
                        common.utility.loadingHide();
                    });
                });

                //获取社员列表
                $http({
                    method: 'post',
                    url: common.API.associatorList,
                    data: assoParamsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d) {
                        $scope.assoModel = d.data;
                        common.utility.loadingHide();
                    });
                });

                //获取活动列表
                $http({
                    method: 'post',
                    url: common.API.activityList,
                    data: activityObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d) {
                        d.data.activityList.map(function(a){
                            a.activity_time = new Date(a.activity_time * 1000).format('MM/dd hh:mm');;
                        });
                        $scope.activityModel = d.data;
                        common.utility.loadingHide();
                    });
                });
            }).fail(function() {
                common.utility.resetToken();
            });
        }();
    }
])

.controller('JointManageAssociatorCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    function($http, $scope, common, $stateParams) {
        ! function() {
            $scope.hasMore = true;
            $scope.noData = false;
            $scope.associatorApplyList = [];
            $scope.host = "";
            $scope.page = 1;
            $scope.corpid = $stateParams.id; //社团id
        }();

        $scope.$on('stateChangeSuccess', function() {
            $scope.loadMoreData();
        });

        $scope.loadMoreData = function() {
            var newParams = {
                page: $scope.page,
                corporation_id: $scope.corpid
            };
            _loadList(newParams);
        }

        $scope.deal = function(associatorUid, optType) {
            var params = {
                corporation_id: $scope.corpid,
                associator_uid: associatorUid,
                type: optType
            }
            var url = common.API.associatorVet;
            var success = function(data) {
                if (data.status === 200) {
                    for (var i in $scope.associatorApplyList) {
                        if ($scope.associatorApplyList[i]['uid'] == params.associator_uid) {
                            $scope.associatorApplyList.splice(i, 1);
                            break;
                        }
                    }
                } else {

                    common.utility.alert('提示', data.msg);
                }
            }
            common.utility.postData(url, params, true, true, success);
        }

        function _loadList(params) {

            var url = common.API.associatorApplyList;
            var success = function(data) {
                //common.utility.loadingHide();
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.status === 200) {
                    $scope.host = data.data.host;
                    $scope.page = $scope.page + 1;
                    if (data.data.applyList.length <= 0) {
                        $scope.hasMore = false;
                        $scope.noData = true;
                        return;
                    }
                    _mergeList(data.data.applyList, $scope.associatorApplyList);
                } else {
                    $scope.hasMore = false;
                    $scope.noData = true;
                    common.utility.alert('提示', data.msg);
                }

            }
            common.utility.postData(url, params, true, true, success);
        }

        function _mergeList(List1, List2) {
            angular.forEach(List1, function(value) {
                this.push(value);
            }, List2);
        }

    }
])

.controller('JointManagereleaseActivityCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'ionicDatePicker',
    '$location',
    '$cordovaCamera',
    '$ionicActionSheet',
    function($http, $scope, common, $stateParams, ionicDatePicker, $location, $cordovaCamera, $ionicActionSheet) {
        ! function() {
            $scope.corpid = $stateParams.id; //社团id
            $scope.cadge_time_start = '';
            $scope.cadge_time_end = '';
            $scope.activity_time_ymd = '';
            $scope.activity_time_his = '';
            $scope.activity_time = '';
            $scope.propaganda_pic = '';
            $scope.modelInfo = {
                activity_name: '',
                activity_addr: '',
                introduction: '',
                send_count: 10
            }
        }();

        $scope.timeSelect = function(type) {
            var ipObj1 = {
                from: new Date(), //Optional
                to: new Date(2020, 10, 30), //Optional
                inputDate: new Date(), //Optional
                mondayFirst: true, //Optional
                disableWeekdays: [], //Optional
                closeOnSelect: false, //Optional
                templateType: 'popup' //Optional
            };
            if (type == 1) {
                ipObj1.callback = function(val) {
                    var dateObj = new Date(val);
                    $scope.cadge_time_start = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
                    $scope.cadge_time_start_timestamp = dateObj;
                }

            } else if (type == 2) {

                ipObj1.callback = function(val) {
                    var dateObj = new Date(val);
                    $scope.cadge_time_end = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
                }
            } else if (type == 3) {
                ipObj1.callback = function(val) {
                    var dateObj = new Date(val);
                    $scope.activity_time_ymd = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
                    document.getElementById('timeClick').click();
                }
            }
            ionicDatePicker.openDatePicker(ipObj1);
        }

        $scope.openDatePicker = function() {
            ionicDatePicker.openDatePicker(ipObj1);
        };

        $scope.timePickerObject = {
            inputEpochTime: ((new Date()).getHours() * 60 * 60), //Optional
            step: 30, //Optional
            format: 24, //Optional
            titleLabel: '选择时间', //Optional
            setLabel: '确定', //Optional
            closeLabel: '取消', //Optional
            setButtonType: 'button-positive', //Optional
            closeButtonType: 'button-stable', //Optional
            callback: function(val) { //Mandatory
                timePickerCallback(val);
            }
        };

        function timePickerCallback(val) {
            if (typeof(val) === 'undefined') {
                $scope.activity_time = $scope.activity_time_ymd + ' 09:00';
            } else {
                var selectedTime = new Date(val * 1000);
                var h = '00';
                var i = '00';
                if (selectedTime.getUTCHours() < 10) {
                    h = "0" + selectedTime.getUTCHours();
                } else {
                    h = selectedTime.getUTCHours();
                }
                if (selectedTime.getUTCMinutes() < 10) {
                    i = selectedTime.getUTCMinutes() + '0';
                } else {
                    i = selectedTime.getUTCMinutes();
                }
                $scope.activity_time_his = h + ':' + i;
                //console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
                $scope.activity_time = $scope.activity_time_ymd + ' ' + $scope.activity_time_his;
            }
        }

        $scope.releaseActivity = function() {
            var url = common.API.releaseActivity;
            if ($scope.activity_time == '') {
                common.utility.alert('提示', '活动时间不得为空');
                return false;
            }
            if ($scope.cadge_time_start == '') {
                common.utility.alert('提示', '索片开始时间不得为空');
                return false;
            }
            if ($scope.cadge_time_end == '') {
                common.utility.alert('提示', '索片结束时间不得为空');
                return false;
            }
            if ($scope.modelInfo.activity_addr == '') {
                common.utility.alert('提示', '活动地点不得为空');
                return false;
            }
            if ($scope.modelInfo.activity_name == '') {
                common.utility.alert('提示', '活动时间不得为空');
                return false;
            }
            var params = {
                activity_time: $scope.activity_time,
                cadge_time_start: $scope.cadge_time_start,
                cadge_time_end: $scope.cadge_time_end,
                corporation_id: $scope.corpid,
                activity_addr: $scope.modelInfo.activity_addr,
                send_count: $scope.modelInfo.send_count,
                introduction: $scope.modelInfo.introduction,
                propaganda_pic: $scope.propaganda_pic,
                name: $scope.modelInfo.activity_name,
                question: $scope.modelInfo.question
            }

            var success = function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.status === 200) {
                    $location.path('/joint/corporation/' + $scope.corpid);
                } else {
                    common.utility.alert('提示', data.msg);
                }
            }
            common.utility.postData(url, params, true, true, success);
        }

        var _savePropagandaPic = function(pic) {
            var params = {
                'propaganda_pic': pic,
                'corporation_id': $scope.corpid
            };
            var url = common.API.uploadActivityPic;
            var success = function(data) {
                if (data.status === 200) {
                    $scope.propaganda_pic = data.data.propaganda_pic;
                    $scope.showPic = true;
                } else {
                    common.utility.alert('提示', data.msg);
                }
            }
            common.utility.postData(url, params, true, true, success);
        }

        $scope.takePicture = function() {
            var options = {
                quality: 94,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 400,
                targetHeight: 280,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation:true
            };

            var pictureSheet = $ionicActionSheet.show({
                buttons: [{
                    text: '拍照'
                }, {
                    text: '从相册中选取'
                }],
                cancelText: '取消',
                cancel: function() {},
                buttonClicked: function(index) {
                    if (index === 0) {
                        $cordovaCamera.getPicture(options).then(function(imageData) {
                            var s = 'data:image/jpeg;base64,' + imageData;
                            $scope.propagandaPic = s;
                            _savePropagandaPic(s);
                            pictureSheet();
                        }, function(err) {});
                    }
                    if (index === 1) {
                        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                        $cordovaCamera.getPicture(options).then(function(imageData) {
                            var s = 'data:image/jpeg;base64,' + imageData;
                            $scope.propagandaPic = s;
                            _savePropagandaPic(s);
                            pictureSheet();
                        }, function(err) {});
                    }
                }
            });
        };
    }
])

.controller('JointManageCadgeListCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    function($http, $scope, common, $stateParams) {
        ! function() {
            $scope.hasMore = true;
            $scope.noData = false;
            $scope.cadgeList = [];
            $scope.activityName = '';
            $scope.totalCount = '';
            $scope.joinCount = '';
            $scope.host = "";
            $scope.page = 1;
            $scope.activityId = $stateParams.activityId; //社团id
            $scope.corporationId = $stateParams.corporationId; //社团id
        }();

        $scope.$on('stateChangeSuccess', function() {
            $scope.loadMoreData();
        });

        $scope.loadMoreData = function() {
            var newParams = {
                page: $scope.page,
                corporation_id: $scope.corporationId,
                activity_id: $scope.activityId
            };
            _loadList(newParams);
        }


        function _loadList(params) {

            var url = common.API.cadgeListManage;
            var success = function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.status === 200) {
                    //$scope.host = data.data.host;
                    if ($scope.page == 1) {
                        $scope.totalCount = data.data.totalCount;
                        $scope.activityName = data.data.activityName;
                        $scope.joinCount = data.data.joinCount;
                    }

                    $scope.page = $scope.page + 1;
                    if (data.data.joinUserList.length <= 0) {
                        $scope.hasMore = false;
                        $scope.noData = true;
                        return;
                    }
                    _mergeList(data.data.joinUserList, $scope.cadgeList);
                } else {
                    $scope.hasMore = false;
                    $scope.noData = true;
                    common.utility.alert('提示', data.msg);
                }

            }
            common.utility.postData(url, params, true, true, success);
        }

        function _mergeList(List1, List2) {
            angular.forEach(List1, function(value) {
                this.push(value);
            }, List2);
        }

    }
])

.controller('JointActivityCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$location',
    function($http, $scope, common, $stateParams, md5, $location) {
        var id = $stateParams.id,
            paramsObj = {
                activity_id: id
            };
        $scope.buttonObj = {
            buttonText: '',
            block: false,
            status: 0 //0 写片， 1 索片
        };

        $scope.joinActivity = function() {
            if (!$scope.buttonObj.block) {
                common.utility.checkLogin().success(function(u){
                    var postUrl = $scope.buttonObj.status === 1 ? common.API.joinActivity : common.API.joinPostcard, 
                        pObj = {}, 
                        executed = false;

                    pObj.uid = u.uid;
                    pObj.token = u.token;
                    pObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

                    executed = ($scope.buttonObj.status === 0);
                    if ($scope.buttonObj.status === 1) {
                        //报名索片, 如果有问题进行跳转，没有直接提交
                        if ($scope.activityModel.question) {
                            $location.path('/joint/activity/' + id + '/question');
                        } else {
                            executed = true;
                        }
                    }

                    if (executed) {
                        common.utility.loadingShow();
                        $http({
                            method: 'post',
                            url: postUrl,
                            data: paramsObj
                        }).success(function(data) {
                            common.utility.loadingHide();
                            common.utility.handlePostResult(data, function(d) {
                                common.utility.alert('提示', d.msg).then(function(){
                                    $scope.buttonObj.buttonText = $scope.buttonObj.status === 0 ? '已报名写片' : '已报名索片';
                                    $scope.buttonObj.block = true;
                                });
                            });
                        });
                    }

                }).fail(function(){
                    common.utility.resetToken();
                });
            }
        };

        $scope.goMember = function() {
            if  ($scope.activityModel.isPresident || $scope.activityModel.isPostUser) {
                $location.path('/joint/activity/' + $scope.activityModel.id + '/membercard');
            } else {
                $location.path('/joint/activity/' + $scope.activityModel.id + '/member');
            }
        };

        ! function() {
            common.utility.checkLogin().always(function(u) {
                paramsObj.uid = u.uid;
                paramsObj.token = u.token;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.activityDetail,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d) {
                        d.data.activity_time = new Date(d.data.activity_time * 1000).format('yyyy-MM-dd hh:mm:ss');
                        d.data.cadge_time_start = new Date(d.data.cadge_time_start * 1000).format('yyyy-MM-dd');
                        d.data.cadge_time_end = new Date(d.data.cadge_time_end * 1000).format('yyyy-MM-dd');
                        $scope.activityModel = d.data;

                        /*
                        isPresident  是否是社长  *
                        isAssociator 是否是社员
                        isPostUser   是否是写片助手
                        isPostcard   是否已报名写片
                        joined       是否已报名索片
                        */

                        var self = d.data;
                        if (self.isPresident) {
                            //隐藏
                            $scope.buttonObj.hide = true;
                        } else {
                            $scope.buttonObj.hide = false;
                            if (self.isAssociator) {
                                //如果是社员，判断是否是写片者
                                if (self.isPostUser) {
                                    //如果是写片者，隐藏按钮
                                    $scope.buttonObj.hide = true;
                                } else {
                                    //不是写片者，判断，是否已经报名写片
                                    if (self.isPostcard) {
                                        $scope.buttonObj.buttonText = '已报名写片';
                                        $scope.buttonObj.block = true;
                                    } else {
                                        $scope.buttonObj.buttonText = '报名写片';
                                        $scope.buttonObj.block = false;
                                        $scope.buttonObj.status = 0;
                                    }
                                }
                            } else {
                                //不是社员，判断是否已报名索片
                                if (self.joined) {
                                    $scope.buttonObj.buttonText = '已报名索片';
                                    $scope.buttonObj.block = true;
                                } else {
                                    $scope.buttonObj.buttonText = '报名索片';
                                    $scope.buttonObj.block = false;
                                    $scope.buttonObj.status = 1;
                                }
                            }
                        }
                        if (self.isOutDate) {
                            $scope.buttonObj.buttonText = '已过期';
                            $scope.buttonObj.block = true;
                        }
                    });
                });
            });
        }();
    }
])

.controller('JointActivityQuestionCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$location',
    function($http, $scope, common, $stateParams, md5, $location) {
        var id = $stateParams.id,
            paramsObj = {
                activity_id: id
            };
        $scope.modelInfo = {
            question: '',
            answer: ''
        };
        common.utility.checkLogin().success(function(u){
            paramsObj.uid = u.uid;
            paramsObj.token = u.token;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            $http({
                method: 'post',
                url: common.API.activityDetail,
                data: paramsObj
            }).success(function(data){
                common.utility.handlePostResult(data, function(d){
                    $scope.modelInfo.question = d.data.question;
                });
            });
        }).fail(function(){
            common.utility.resetToken();
        });


        $scope.save = function(){
            paramsObj.answer = this.modelInfo.answer;
            $http({
                method: 'post',
                url: common.API.joinActivity,
                data: paramsObj
            }).success(function(data){
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', d.msg).then(function(){
                        //跳转到详情页面
                        $location.path('/joint/activity/' + id);
                    });
                });
            });
        };

    }
])

.controller('ActivityMemberCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    function($http, $scope, common, $stateParams, md5) {
        var id = $stateParams.id;

        ! function() {
            common.utility.loadingShow();
            var paramsObj = {
                activity_id: id,
                per: 10000
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.joinUserList,
                data: paramsObj
            }).success(function(data) {
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d) {
                    $scope.memberList = d.data;
                });
            });
        }();
    }
])

.controller('JoinUserListCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    function($http, $scope, common, $stateParams, md5) {
        var id = $stateParams.id,
            show = $stateParams.show === 'true', uid, token;

        $scope.show = show;

        function _init () {
            common.utility.checkLogin().success(function(u){
                uid = u.uid;
                token = u.token;

                common.utility.loadingShow();
                var paramsObj = {
                    activity_id: id,
                    per: 10000
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.postcardUserList,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d) {
                        d.data.postcardUserList.map(function(t){
                            if (t.status === 0) {
                                t.statusText = '等待处理';
                            }
                            if (t.status === 1) {
                                t.statusText = '同意';
                            }
                            if (t.status === 2) {
                                t.statusText = '拒绝';
                            }
                        });
                        $scope.memberList = d.data;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        };


        $scope.deal = function(i, t){
            var paramsObj = {
                postcard_id: i,
                activity_id: id,
                type: t,
                uid: uid,
                token: token
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'POST',
                url: common.API.dealPostcardUser,
                data: paramsObj
            }).success(function(data){
                common.utility.alert('提示', data.msg);
                _init();
            });
        };

        _init();
    }
])

.controller('myCorporationCtrl', [
    '$http',
    '$scope',
    'Common',
    function($http, $scope, common) {
        ! function() {
            $scope.hasMore = true;
            $scope.noData = false;
            $scope.showTip = false;
            $scope.corporationList = [];
            $scope.host = "";
            $scope.page = 1;
            var newParams = {
                page: $scope.page,
            };
            _loadList(newParams);
        }();


        function _loadList(params) {

            var url = common.API.corporationListManage;
            var success = function(data) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                if (data.status === 200) {
                    $scope.page = $scope.page + 1;
                    $scope.host = data.data.host;
                    if (data.data.corporationList.length <= 0) {
                        $scope.hasMore = false;
                        $scope.noData = true;
                        if ($scope.page == 2) {
                            $scope.showTip = true;
                        }
                        return;
                    }
                    _mergeList(data.data.corporationList, $scope.corporationList);
                } else {
                    $scope.hasMore = false;
                    $scope.noData = true;
                    common.utility.alert('提示', data.msg);
                }

            }
            common.utility.postData(url, params, true, true, success);
        }

        function _mergeList(List1, List2) {
            angular.forEach(List1, function(value) {
                this.push(value);
            }, List2);
        }
    }
])

.controller('CorporationEditCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$location',
    '$cordovaCamera',
    function($http, $scope, common, $stateParams, md5, $location, $cordovaCamera) {
        var id = $stateParams.id,
            paramsObj = {
                corporation_id: id
            };
        common.utility.checkLogin().success(function(u) {
            paramsObj.uid = u.uid;
            paramsObj.token = u.token;
            if (common.tempData.corporationInfo) {
                $scope.corpModel = common.tempData.corporationInfo;
            }
            if (common.tempData.imgData) {
                $scope.corpModel.avatar = common.tempData.imgData;
            }
        }).fail(function() {
            common.utility.resetToken();
        });


        $scope.save = function() {
            paramsObj.name = $scope.corpModel.name;
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            paramsObj.avatar = $scope.corpModel.avatar;
            $http({
                method: 'post',
                url: common.API.saveCorporation,
                data: paramsObj
            }).success(function(data) {
                common.utility.handlePostResult(data, function(d) {
                    common.utility.alert('提示', d.msg).then(function(){
                        $location.path('/joint/corporation/' + id);
                    });
                });
            });
        };

        $scope.takePic = function() {
            common.utility.takePicture($cordovaCamera, function(s){
                $scope.corpModel.avatar = s;
            });
        };
    }
])

.controller('CorporationNoticeCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$location',
    function($http, $scope, common, $stateParams, md5, $location) {
        var id = $stateParams.id;
        $scope.noticeModel = {
            notice: '',
            uid: '',
            token: '',
            corporation_id: id
        };
        common.utility.checkLogin().success(function(u) {
            $scope.noticeModel.uid = u.uid;
            $scope.noticeModel.token = u.token;
        });
        $scope.save = function() {
            this.noticeModel.accessSign = md5.createHash(common.utility.createSign(this.noticeModel));
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.releaseNotice,
                data: $scope.noticeModel
            }).success(function(data) {
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d) {
                    common.utility.alert('提示', d.msg).then(function(){
                        $location.path('/joint/corporation/' + id);
                    });
                });
            });
        };
    }
])

//创建联名社
.controller('CorporationCreateCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    'md5',
    '$location',
    '$cordovaCamera',
    '$ionicActionSheet',
    function($http, $scope, common, $stateParams, md5, $location, $cordovaCamera, $ionicActionSheet) {

        $scope.corModel = {
            name: '',
            addr_province: '',
            addr_city: '',
            uid: '',
            token: ''
        };
        $scope.corAvatar = 'img/icon_touxiang.png';
        $scope.done = false;

        //确认提交
        $scope.save = function(){
            if ($scope.corModel.name === '' || $scope.addr_province === '' || $scope.addr_city === '') {
                common.utility.alert('提示', '社名或地点不能为空！');
            } else {
                var paramsObj = $scope.corModel;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                paramsObj.avatar = $scope.corAvatar;

                $http({
                    method: 'POST',
                    url: common.API.createCorporation,
                    data: paramsObj
                }).success(function(data){
                    common.utility.handlePostResult(data, function(d){
                        common.utility.alert('提示', data.msg).then(function(){
                            $scope.done = true;
                        });
                    });
                });
            }
        };

        $scope.takePicture = function(){
            common.utility.takePicture($cordovaCamera, function(s){
                $scope.corAvatar = s;
            });
        };

        $scope.goAddress = function(){
            $location.path('/city/setting/type/corporation');
        };

        !function(){
            common.utility.checkLogin().success(function(u){
                $scope.corModel.uid = u.uid;
                $scope.corModel.token = u.token;
                common.utility.cookieStore.remove('citySetType');
                if (common.utility.cookieStore.get('areainfo1')) {
                    $scope.corModel.addr_province = common.utility.cookieStore.get('areainfo1').name;
                }
                if (common.utility.cookieStore.get('areainfo2')) {
                    $scope.corModel.addr_city = common.utility.cookieStore.get('areainfo2').name;
                }
            }).fail(function(){
                common.utility.resetToken();
            });
        }();
    }
])

.controller('UserViewCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    '$location',
    function($http, $scope, common, md5, $stateParams, $location){
        $scope.hideEle = true;
        var userId = $stateParams.id,
            userParamsObj = {
                suid: userId
            };
        userParamsObj.accessSign = md5.createHash(common.utility.createSign(userParamsObj));

        if (userId) {
            $http({
                method: 'post',
                url: common.API.searchUserInfo,
                data: userParamsObj
            }).success(function(d){
                d.data.userInfo.create_at = new Date(d.data.userInfo.create_at * 1000).format('yyyy-MM-dd');
                d.data.userInfo.avatar = d.data.host + d.data.userInfo.avatar;
                $scope.userModel = d.data.userInfo;
                $scope.hideEle = true;
            });
        } else {
            $scope.hideEle = false;
            var paramsObj = {};
            common.utility.checkLogin().success(function(u){
                paramsObj.uid = u.uid;
                paramsObj.token = u.token;
                u.create_at = new Date(u.create_at * 1000).format('yyyy-MM-dd');
                $scope.userModel = u;
            }).fail(function(){
                common.utility.resetToken();
            });

            $scope.save = function(){
                paramsObj.introduction = this.userModel.introduction;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.introduction,
                    data: paramsObj
                }).success(function(data){
                    common.utility.handlePostResult(data, function(d){
                        common.utility.alert('提示', d.msg);
                    });
                });
            };

            $scope.go = function(){
                $location.path('/my/userinfo');
            };
        }
    }
])

.controller('MessageCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    function($http, $scope, common, md5){
        !function(){
            common.utility.checkLogin().success(function(u){
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.msgCategoryList,
                    data: paramsObj
                }).success(function(data){
                    // console.log(data);
                    common.utility.handlePostResult(data, function(d){
                        if (d.data.msgCategoryList && d.data.msgCategoryList.length > 0) {
                            d.data.msgCategoryList.map(function(m){
                                if (m.new_msg_time){
                                    m.new_msg_time = new Date(m.new_msg_time * 1000).format('yyyy-MM-dd');
                                }
                            });
                        }
                        $scope.msgList = d.data;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        }();
    }
])

.controller('MessageDetCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    function($http, $scope, common, md5, $stateParams){
        !function(){
            $scope.sourceType = $stateParams.id;
            $scope.pageTitle = '';

            common.utility.checkLogin().success(function(u){
                var paramsObj = {
                    uid: u.uid,
                    token: u.token,
                    category: $stateParams.id,
                    per: 1000
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.msgList,
                    data: paramsObj
                }).success(function(data){
                    common.utility.handlePostResult(data, function(d){
                        if (d.data.msgList && d.data.msgList.length > 0) {
                            d.data.msgList.map(function(m){
                                if (m.create_at){
                                    m.create_at = new Date(m.create_at * 1000).format('yyyy-MM-dd hh:mm:ss');
                                }
                            });
                        }

                        $scope.msgModel = d.data;
                        $scope.pageTitle = d.data.categoryInfo.name;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        }();
    }
])

.controller('SignCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    function($http, $scope, common, md5){

        $scope.uObj = {};

        function _init() {
            common.utility.checkLogin().success(function(u){
                $scope.uObj = u;
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.signHome,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.date = new Date(d.data.date * 1000).format('yyyy年MM月dd日');
                        $scope.signObj = d.data;
                    });
                });

                var paramsObj1 = {
                    uid: u.uid,
                    token: u.token,
                    per: 1000
                };
                paramsObj1.accessSign = md5.createHash(common.utility.createSign(paramsObj1));
                $http({
                    method: 'post',
                    url: common.API.signList,
                    data: paramsObj1
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){

                        d.data.signList.map(function(s){
                            s.avatar = d.data.host + s.avatar;
                            s.create_at = new Date(s.create_at * 1000).format('hh:mm');
                        });

                        if (d.data.userSignInfo) {
                            d.data.userSignInfo.avatar = d.data.host + d.data.userSignInfo.avatar ;
                            d.data.userSignInfo.create_at = new Date(d.data.userSignInfo.create_at * 1000).format('hh:mm');
                        }

                        $scope.signListObj = d.data.signList;
                        $scope.usersignObj = d.data.userSignInfo;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        }

        _init();

        $scope.sign = function(){
            var paramsObj = {
                    uid: $scope.uObj.uid,
                    token: $scope.uObj.token
                };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.doSign,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.alert('提示', data.msg).then(function(){
                    _init();
                });
            });
        };
    }
])


.controller('FeedbackCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    function($http, $scope, common, md5){
        $scope.feedModel = {};
        $scope.submit = function(){
            if ($scope.feedModel.content){
                common.utility.checkLogin().success(function(u){
                    var paramsObj = {
                        uid: u.uid,
                        token: u.token,
                        content: $scope.feedModel.content
                    };
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.feedback,
                        data: paramsObj
                    }).success(function(d){
                        common.utility.loadingHide();
                        common.utility.alert(d.msg);
                    });
                }).fail(function(){
                    common.utility.resetToken();
                });
            }
        };
    }
])


.controller('AboutCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    function($http, $scope, common, md5){
    }
])

.controller('SwitchListCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    function($http, $scope, common, md5, $stateParams){
        console.log($stateParams.id);
        common.utility.loadingShow();

        var paramsObj = {
            theme_id: $stateParams.id
        };
        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
        $http({
            method: 'post',
            url: common.API.exchangeList,
            data: paramsObj
        }).success(function(data){
            common.utility.loadingHide();
            console.log(data);
            $scope.themeList = data.data;
        });
    }
])


.controller('SwitchCardCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    '$location',
    '$ionicPopup',
    function($http, $scope, common, md5, $stateParams, $location, $ionicPopup){
        $scope.userInfo = {};

        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
            _init(u);
        }).fail(function(){
            common.utility.resetToken();
        });

        function _init(u){
            common.utility.loadingShow();

            var paramsObj = {
                uid: u.uid,
                token: u.token,
                publish_id: $stateParams.id
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.exchangeDetail,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                console.log(data);
                if (data.data.status === 0) {
                    data.data.statusText = '正在互换';
                } else if (data.data.status === 1) {
                    data.data.statusText = '互换成功';
                } else if (data.data.status === 2) {
                    data.data.statusText = '互换失败';
                }
                $scope.publishModel = data.data;
            });
        };


        $scope.switchCard = function(){
            $location.path('/switch/photos/' + $scope.publishModel.id);
        };

        $scope.select = function(p){
            var confirmPopup = $ionicPopup.confirm({
                title: '温馨提示',
                template: '你觉得自己满足换片要求吗?',
                cancelText: '取消',
                okText: '确定'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    // console.log('You are not sure');
                    common.utility.loadingShow();
                    var paramsObj = {
                        publish_id: $scope.publishModel.id,
                        apply_id: p.id,
                        uid: $scope.userInfo.uid,
                        token: $scope.userInfo.token
                    };
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                    $http({
                        method: 'post',
                        url: common.API.selectExchange,
                        data: paramsObj
                    }).success(function(data){
                        common.utility.loadingHide();
                        common.utility.handlePostResult(data, function(d){
                            common.utility.alert('提示', d.msg).then(function(){
                                _init($scope.userInfo);
                            });
                        });
                    });
                }
            });
        };
    }
])


.controller('SwitchCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    function($http, $scope, common, md5){
        common.utility.loadingShow();
        var colors = ['#d26e78', '#b0af6f', '#7387a0', '#89a8ad', '#b97f8e'];
        $scope.themeColors = colors;

        $http({
            method: 'post',
            url: common.API.exchangeHome
        }).success(function(data){
            common.utility.loadingHide();
            console.log(data);

            common.utility.handlePostResult(data, function(d){
                d.data.themeList.map(function(t){
                    t.color = {'background-color': colors[t.id % 5]};
                });
                $scope.themeList = d.data.themeList;
                $scope.host = d.data.host;
            });
        });





        var vm = this;
        $scope.carouselOptions = {
            carouselId    : 'carousel-6',
            align         : 'left',
            selectFirst   : false,
            centerOnSelect: false,
            // template      : '<div class="carousel-item demo-3" ng-click="vm.onSelect({item:vm.ngModel})"><div class="img-wrapper"><img ng-src="{{vm.ngModel.src}}" /></div></div>',
            // pullRefresh   : {
            //     active  : true,
            //     callBack: pullRefresh
            // }
        };
        $scope.carouselData = [
            {
                id: 0,
                src: 'img/icon_tp2.png'
            }, 
            {
                id: 1,
                src: 'img/icon_tupian.png'
            },{
                id: 2,
                src: 'img/icon_tupian.png'
            },{
                id: 3,
                src: 'img/icon_tupian.png'
            },{
                id: 4,
                src: 'img/icon_tupian.png'
            }
        ];

        function pullRefresh() {
            console.log('refresh');
        }
    }

])


.controller('SwitchPhotosCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    '$stateParams',
    function($http, $scope, common, md5, $location, $stateParams){
        var publishId = $stateParams.type;

        //load type 1相册  2 互寄列表  3申请列表
        $scope.loadtype = 1;
        $scope.userInfo = {};
        $scope.dataList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.showTip = false;
        $scope.pagetype = $stateParams.type ? 'select' : '';

        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.send = function(p){
            common.utility.cookieStore.put('picurl', p.picture);
            $location.path('/switch/post/' + p.id);
        };

        $scope.initList = function(t) {
            if (t && t !== $scope.loadtype) {
                $scope.dataList = [];
                $scope.currentPage = 1;
                $scope.lastPage = 10;
            }
            $scope.loadtype = t || $scope.loadtype;


            var postUrl = common.API.myPhotoList,
                key = 'photoList',
                paramsObj = {
                    uid: $scope.userInfo.uid,
                    token: $scope.userInfo.token,
                    page: $scope.currentPage
                };

            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            if ($scope.loadtype === 2) {
                postUrl = common.API.myPublishList;
                key = 'publishList';
            }
            if ($scope.loadtype === 3) {
                postUrl = common.API.myApplyList;
                key = 'applyList';
            }

            if ($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: postUrl,
                    data: paramsObj
                }).success(function(data){
                    // $scope.dataModel = data.data;
                    common.utility.handlePostResult(data, function(d){
                        if (d.data[key].length > 0) {
                            d.data[key].map(function(t){
                                t.picture = d.data.host + t.picture;
                            });
                        }
                        $scope.lastPage = d.data.totalPage;
                        $scope.dataList = $scope.dataList.concat(d.data[key]);
                        $scope.showTip = ($scope.dataList.length > 0);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    alert('api error.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.select = function(p){
            var paramsObj = {
                uid: $scope.userInfo.uid,
                token: $scope.userInfo.token,
                photo_id: p.id,
                publish_id: publishId
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.applyExchange,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', data.msg).then(function(){
                        $location.path('/switch');
                    });
                });
            });
        };
    }
])

//上传相册的照片
.controller('SwitchUploadCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$cordovaCamera',
    '$ionicActionSheet',
    function($http, $scope, common, md5, $cordovaCamera, $ionicActionSheet){
        $scope.photos = [];
        $scope.userInfo = {};

        var options = {
            quality: 90,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 50,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        }, _savePicture = function(s){
            $scope.photos.push(s);
        };
        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.add = function() {
            var pictureSheet = $ionicActionSheet.show({
                buttons: [{
                    text: '拍照'
                }, {
                    text: '从相册中选取'
                }],
                cancelText: '取消',
                cancel: function() {},
                buttonClicked: function(index) {
                    if (index === 0) {
                        pictureSheet();
                        $cordovaCamera.getPicture(options).then(function(imageData) {
                            _savePicture('data:image/jpeg;base64,' + imageData);
                        }, function(err) {});
                    }
                    if (index === 1) {
                        pictureSheet();
                        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                        $cordovaCamera.getPicture(options).then(function(imageData) {
                            _savePicture('data:image/jpeg;base64,' + imageData);
                        }, function(err) {
                        });
                    }
                }
            });
        }; 

        $scope.upload = function() {
            var paramsObj = {
                uid: $scope.userInfo.uid,
                token: $scope.userInfo.token,
                pictures: $scope.photos
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.exchangeUploadPic,
                data: paramsObj
            }).success(function(data){
                alert(data);
            });
        };
    }

])


.controller('SwitchPostCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    '$location',
    function($http, $scope, common, md5, $stateParams, $location){
        $scope.postModel = {
            photo_id: $stateParams.id,
            requirement: '',
            theme_id: 0,
            uid: 0,
            token: ''
        };
        $scope.imgUrl = common.utility.cookieStore.get('picurl');

        common.utility.checkLogin().success(function(u){
            $scope.postModel.uid = u.uid;
            $scope.postModel.token = u.token;
            common.utility.loadingShow();
            var paramsObj = {
                uid: u.uid,
                token: u.token
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                data: paramsObj,
                url: common.API.preDoPublish
            }).success(function(data){
                common.utility.loadingHide();
                $scope.cardModel = data.data.themeList;
                $scope.questionModel = data.data.manualList;
                console.log(data);
            });
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.select = function(t){
            $scope.postModel.theme_id = t.id;
            $scope.cardModel.map(function(c){
                c.className = '';
                if (c.id === t.id) {
                    c.className = 'selected';
                }
            });
        };

        $scope.submit = function(){
            var choosed = false;
            this.cardModel.map(function(c){
                if (c.className === 'selected') {
                    choosed = true;
                }
            });
            if (!choosed) {
                common.utility.alert('提示', '请选择一个主题！');
            } else if (this.postModel.requirement === '') {
                common.utility.alert('提示', '换片要求不能为空！');
            } else {
                this.postModel.accessSign = md5.createHash(common.utility.createSign(this.postModel));
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.doPublish,
                    data: this.postModel
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        common.utility.alert('提示', data.msg).then(function(){
                            $location.path('/switch');
                        });
                    });
                })
            }
        };
    }
])



;



