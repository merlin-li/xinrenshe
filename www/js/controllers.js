'use strict';
angular.module('xinrenshe.controllers', ['ngCordova', 'angular-md5', 'ImageCropper'])
    .config([
        '$sceDelegateProvider',
        '$httpProvider',
        function($sceDelegateProvider, $httpProvider) {
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
    function($scope, $http, common, $location, md5) {
        ! function() {
            //初始化事件
            $http({
                method: 'post',
                url: common.API.home,
                data: {
                    accessSign: md5.createHash(common.utility.createSign({}))
                }
            }).success(function(data) {
                if (data.status === 200) {
                    $scope.dataObj = data.data;
                    $scope.dataObj.host = data.data.host;
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

.controller('UserCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
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
                $location.path('/user/login');
            });
        }();

        $scope.logout = function(){
            common.utility.resetToken();
        };
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
                        $scope.signupModel.msg = {
                            'class': 'assertive',
                            'value': data.msg
                        };
                    }
                });
            }
        };

        //发送验证码
        $scope.sendcode = function() {
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
                    }).success(function(data) {
                        if (data.status === 200) {
                            $scope.signupModel.msg = {
                                'class': 'positive',
                                'value': common.MESSAGE.reg_code_success_tip
                            };
                            var iv = 60,
                                beginTime = $interval(function() {
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
                    }).error(function() {
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
                // console.log(data);
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
            } else if (i.type === 2) {
                //表示市
                common.utility.cookieStore.put('areainfo2', i);
            } else if (i.type === 3) {
                //表示区县
                common.utility.cookieStore.put('areainfo3', i);
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

        $scope.request = function() {            
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
        var userCookie = common.utility.getUserCookie(),
            paramsObj;
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
                    $scope.userObj.create_at = new Date($scope.userObj.create_at * 1000).format('yyyy-MM-dd');
                } else if(data.status === 402) {
                    common.utility.resetToken();
                } else if (data.status === 501) {
                    common.utility.alert('提示', data.msg).then(function(){
                        $location.path('/home');
                    });
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
    '$cordovaCamera',
    function($scope, $http, common, $location, md5, $cordovaCamera) {
        $scope.showTip = true;
        var paramsObj = {
                type: 1,
                uid: '',
                token: ''
            },
            userCookie = common.utility.getUserCookie();

        var _loadPicture = function(imgurl) {
            // 上传寄片照片的操作
            var picParamsObj = {
                order_id: $scope.selectCardIndex,
                uid: userCookie.uid,
                token: userCookie.token
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
            }).error(function() {});

            //替换当前的上传图片缩略图
            $scope.cardModel.orderList.map(function(t){
                // alert(t.id);
                // alert($scope.selectCardIndex);
                if (t.id == $scope.selectCardIndex) {
                    t.picture = imgurl;
                }
            });
            $scope.$apply();
        };

        $scope.statusObj = {
            txt: '已旅行',
            hide: true
        };
        $scope.modelStyle = {
            'display': 'none'
        };
        $scope.selectIndex = 1;

        $scope.readCardList = function(t) {
            $scope.selectIndex = t || 1;
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
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.orderList,
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
                    $scope.cardModel = d.data;
                    $scope.showTip = (d.data.orderList.length > 0);
                });
                common.utility.loadingHide();
            }).error(function() {
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
            }).success(function(data) {
                common.utility.alert('提示', data.msg);
                $scope.readCardList();
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
            $scope.readCardList();
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
        $scope.statusObj = {
            txt: '已旅行',
            hide: false,
            hideBtn: false
        };

        var paramsObj = {
                type: 3,
                uid: '',
                token: ''
            },
            userCookie = common.utility.getUserCookie();

        if (userCookie) {
            paramsObj.uid = userCookie.uid;
            paramsObj.token = userCookie.token;
        } else {
            $location.path('/user/login');
        }
        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

        $scope.readCardList = function(t) {
            $scope.selectIndex = t || 3;
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
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

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
                    });

                    $scope.cardModel = d.data;
                    $scope.showTip = (d.data.orderList.length > 0);
                });
                common.utility.loadingHide();
            }).error(function() {
                common.utility.loadingHide();
            });
        };

        $scope.done = function(c) {
            var confirmObj = {
                    order_id: c.id,
                    uid: userCookie.uid,
                    token: userCookie.token
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
                            $scope.readCardList($scope.selectIndex);
                        } else {
                            common.utility.alert('提示', data.msg);
                        }
                    });
                }
            });
        };

        $scope.readCardList();
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
            if (common.utility.cookieStore.get('areainfo1')) {
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

.controller('ImgCropCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$stateParams',
    function($scope, $http, common, $location, $stateParams) {
        if (!common.tempData.imgData) {
            $location.path('/image/test');
        } else {
            $scope.imgSrc = common.tempData.imgData;

            $scope.save = function() {
                common.tempData.imgData = this.result;
                $scope.imageCropStep = 1;
                delete $scope.imgSrc;
                delete $scope.result;
                delete $scope.resultBlob;
                if (common.tempData.imgDataCallback) {
                    common.tempData.imgDataCallback(this.result, function(){
                       $location.path('/' + $stateParams.from.split('_').join('/')); 
                    });
                } else {
                    $location.path('/' + $stateParams.from.split('_').join('/'));
                }
            };
        }
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
            //common.utility.loadingHide();
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
            if (this.pageModel.buttonStatus === 2) {
                //申请加入
                common.utility.checkLogin().success(function(u) {
                    paramsObj.uid = u.uid;
                    paramsObj.token = u.token;
                    paramsObj.type = 1;
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                    $http({
                        method: 'post',
                        url: common.API.joinExitCorporation,
                        data: paramsObj
                    }).success(function(data) {
                        common.utility.handlePostResult(data, function(d) {
                            common.utility.alert('提示', d.msg);
                            $scope.pageModel.buttonStatus = 1;
                            $scope.pageModel.buttonText = '已申请';
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
                    assoParamsObj = {
                        corporation_id: id
                    };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                assoParamsObj.accessSign = md5.createHash(common.utility.createSign(assoParamsObj));

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
                                $scope.pageModel.hideBtn = true;
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
                    data: paramsObj
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
    function($http, $scope, common, $stateParams, ionicDatePicker, $location, $cordovaCamera) {
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

            cordovaCamera.getPicture(options).then(function(imageData) {
                var s = 'data:image/jpeg;base64,' + imageData;
                $scope.propagandaPic = s;
                _savePropagandaPic(s);
            }, function(err) {});
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
    function($http, $scope, common, $stateParams, md5) {
        var id = $stateParams.id,
            paramsObj = {
                activity_id: id
            };
        $scope.buttonObj = {
            joined: false,
            buttonText: ''
        };
        $scope.joinActivity = function() {
            if (!this.buttonObj.joined) {
                common.utility.checkLogin().success(function(u) {
                    paramsObj.uid = u.uid;
                    paramsObj.token = u.token;
                    paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.joinActivity,
                        data: paramsObj
                    }).success(function(data) {
                        common.utility.loadingHide();
                        common.utility.handlePostResult(data, function(d) {
                            common.utility.alert('提示', d.msg);
                        });
                    });
                }).fail(function() {
                    common.utility.resetToken();
                });
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
                        $scope.buttonObj.joined = d.data.joined;
                        $scope.buttonObj.buttonText = d.data.joined ? '已索片' : '报名索片'
                    });
                });
            }).fail(function() {
                common.utility.resetToken();
            });
        }();
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
                activity_id: id
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
]);