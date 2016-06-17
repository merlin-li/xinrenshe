'use strict';
angular.module('xinrenshe.controllers', ['ngCordova', 'angular-md5', 'ionic-ratings'])
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
        $httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded'};
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

.controller('HomeCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$ionicSlideBoxDelegate',
    '$ionicPopup',
    '$ionicLoading',
    function($scope, $http, common, $location, $ionicSlideBoxDelegate, $ionicPopup, $ionicLoading) {
        ! function() {
            document.addEventListener('deviceready', function() {
                window.open = cordova.InAppBrowser.open;
            }, false);

            var platformType = common.utility.deviceInfo,
                os = 0, userObj, paramsObj;
            if (platformType === 'ios') {
                os = 1;
            }
            if (platformType === 'android') {
                os = 2;
            }
            paramsObj = {
                os: os,
                version: common.utility.getVersion
            };
            common.utility.cookieStore.remove('areainfo1');
            common.utility.cookieStore.remove('areainfo2');
            common.utility.cookieStore.remove('areainfo3');
            common.utility.cookieStore.remove('picurl');
            common.utility.checkLogin().success(function(u){
                paramsObj.uid = u.uid;
                paramsObj.token = u.token;
            });
            //初始化事件
            common.utility.loadingShow();
            $http({
                method: 'get',
                url: common.API.home,
                params: paramsObj
            }).success(function(data) {
                //检查是否需要版本更新
                common.utility.loadingHide();
                if (data.status === 200) {
                    common.tempData.homeData = data.data;
                    $scope.dataObj = data.data;
                    $scope.dataObj.host = data.data.host;
                    $ionicSlideBoxDelegate.update();
                    var startUpdate = false;
                    if (common.utility.cookieStore.get('installedDate')) {
                        var installedDate = common.utility.cookieStore.get('installedDate'),
                            now = Date.parse(new Date());
                        if (now > installedDate) {
                            //提示更新
                            startUpdate = true;
                        } else {
                            startUpdate = false;
                        }
                    } else {
                        startUpdate = true;
                    }

                    if (startUpdate && data.data.updateInfo && data.data.updateInfo.need_update) {
                        //有更新，进行提醒
                        var confirmPopup = $ionicPopup.confirm({
                            title: '检查到新版本',
                            template: data.data.updateInfo.update_info,
                            cancelText: '取消',
                            okText: '去更新'
                        });
                        
                        confirmPopup.then(function(res) {
                            if (res) {
                                $ionicLoading.show({
                                    template: '正在下载'
                                });
                                //可以从服务端获取更新APP的路径
                                var uri = encodeURI(data.data.updateInfo.url),
                                    targetPath = "file:///storage/sdcard0/Download/1.apk",
                                    fileTransfer = new FileTransfer(),
                                    cordovaFileOpener2 = cordova.plugins.fileOpener2;

                                fileTransfer.download(uri, targetPath, function (entry) {
                                    var fileurl = entry.toURL();

                                    // 打开下载下来的APP
                                    cordovaFileOpener2.open(fileurl, 
                                        'application/vnd.android.package-archive',
                                        {
                                            error: function (err) {
                                                alert(err);
                                            }, 
                                            success: function () {
                                                alert('成功');
                                            }
                                        }
                                    );
                                    $ionicLoading.hide();
                                }, function (error) {
                                    alert('下载失败');
                                }, false);
                            } else {
                                //保存更新的时间为5天
                                var time = new Date();
                                time = time.setDate(time.getDate() + 5);
                                common.utility.cookieStore.put('installedDate', time);
                            }
                        });
                    }
                }
            }).error(function() {
                alert('网络异常.');
                common.utility.loadingHide();
            });
        }();

        $scope.go = function(b) {
            if (b.url !== '') {
                window.open(b.url, '_blank', 'location=no,toolbarposition=top');
            }
        };

        $scope.open = function(name){
            common.utility.gotoHelp(name);
        };
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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
                            $location.path('/user/login');
                        });
                    } else {
                        common.utility.alert('提示', data.msg);
                    }
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };
    }
])

.controller('UserCtrl', [
    '$scope',
    '$http',
    'Common',
    'md5',
    '$location',
    '$stateParams',
    function($scope, $http, common, md5, $location, $stateParams) {
        ! function() {
            $scope.userObj = {
                hasLogin: false,
                avatar: 'img/tx_1.png'
            };
            common.utility.checkLogin().success(function(u) {
                var paramsObj = {
                    uid: u.uid,
                    token: u.token,
                    version: common.utility.getVersion
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.getUserInfo,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d){
                        $scope.userObj = d.data.userInfo;
                        $scope.userObj.avatar = d.data.userInfo.avatar;
                        $scope.userObj.host = d.data.host;
                        $scope.userObj.token = d.data.token;
                        common.utility.cookieStore.remove('userinfo');
                        common.utility.cookieStore.put('userinfo', $scope.userObj);
                        $scope.userObj.hasLogin = true;
                    });
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });

                $http({
                    method: 'post',
                    url: common.API.myLevel,
                    data: paramsObj
                }).success(function(data){
                    $scope.userLevel = data.data;
                });
            });
        }();

        $scope.pageType = $stateParams.pagetype;

        $scope.logout = function(){
            common.utility.resetToken();
        };

        $scope.goLevel = function(){
            $location.path('/user/level');
        };

        $scope.open = function(name){
            common.utility.gotoHelp(name);
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});

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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
        var type = $stateParams.type, thisUrl, key = 'brandList', pkey = 'brand_id';
        $scope.pageTitle = '';
        $scope.pageType = type;
        if (type === 'baodian') {
            thisUrl = common.API.manual;
            $scope.pageTitle = '信人宝典';
            key = 'manualList';
            pkey = 'type';
        } else {
            thisUrl = common.API.brand;
            $scope.pageTitle = '品牌手册';
            key = 'brandList';
            pkey = 'brand_id';
        }

        common.utility.loadingShow();
        var paramsObj = {};
        paramsObj[pkey] = $stateParams.id;
        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
        $http({
            method: 'post',
            url: thisUrl,
            data: paramsObj
        }).success(function(data){
            common.utility.loadingHide();
            if (data.data.logo) {
                $scope.dataModel = data.data;
            } else {
                $scope.questionList = data.data[key];
            }
        }).error(function(){
            common.utility.loadingHide();
            alert('网络异常.');
        });
    }
])

.controller('TipsListCtrl', [
    '$scope',
    '$http',
    'Common',
    '$stateParams',
    function($scope, $http, common, $stateParams) {
        var type = $stateParams.type, thisUrl, key = 'brandList';
        $scope.pageTitle = '';
        $scope.pageType = type;
        if (type === 'baodian') {
            thisUrl = common.API.manualList;
            $scope.pageTitle = '信人宝典';
            key = 'manualCategoryList';
        } else {
            thisUrl = common.API.brandList;
            $scope.pageTitle = '品牌手册';
            key = 'brandList';
        }

        $http({
            method: 'post',
            url: thisUrl
        }).success(function(data){
            common.utility.handlePostResult(data, function(d){
                $scope.mlist = d.data[key];
            });
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
                    invitation_code: signupModel.invitation_code,
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };

        $scope.goAddress = function() {
            common.utility.cookieStore.put('useraddressinfo', this.userModel);
            $location.path('/city/setting/type/');
        };

        ! function() {
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

.controller('UpdateAddressCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$stateParams',
    function($scope, $http, common, $location, $stateParams) {
        $scope.userModel = {
            consignee_username: '',
            consignee_addr: '',
            zip_code: ''
        };
        $scope.urlType = 'my_address_add_insert';

        //获取省市区数据
        var province = common.utility.cookieStore.get('areainfo1'),
            city = common.utility.cookieStore.get('areainfo2'),
            area = common.utility.cookieStore.get('areainfo3'),
            type = $stateParams.type,
            tempAddressData = common.tempData.addressData;

        if (type === 'update') {
            $scope.userModel = tempAddressData;
            if (province && city && area) {
                $scope.userModel.consignee_province = province.name;
                $scope.userModel.consignee_city = city.name;
                $scope.userModel.consignee_area = area.name;
            }
            $scope.urlType = 'my_address_add_update';
        }
        if (type === 'insert') {
            //表示新增地址
            if (province) {
                $scope.userModel.consignee_province = province.name;
            }
            if (city) {
                $scope.userModel.consignee_city = city.name;
            }
            if (area) {
                $scope.userModel.consignee_area = area.name;
            }
        }

        $scope.save = function() {
            if (this.userModel.consignee_username === '' || this.userModel.zip_code === '' || this.userModel.consignee_addr === '' || this.userModel.consignee_area === '') {
                common.utility.alert('提示', '信息不能为空！');
            } else {
                //邮编检查
                var reg = /^\d{6}$/;
                if (!reg.test($scope.userModel.zip_code)) {
                    common.utility.alert('提示', '邮编格式不正确！');
                    return false;
                }
                var self = $scope.userModel,
                    paramsObj = self,
                    userObj, apiUrl;
                if (common.utility.cookieStore.get('userinfo')) {
                    userObj = common.utility.cookieStore.get('userinfo');
                }
                paramsObj.uid = userObj.uid;
                paramsObj.token = userObj.token;
                //判断时编辑地址，还是新增地址
                if (type === 'insert') {
                    //表示新增地址
                    apiUrl = common.API.addNewConsignee;
                }
                if (type === 'update') {
                    //表示编辑地址
                    apiUrl = common.API.updateConsignee;
                    paramsObj.cid = paramsObj.id;
                }
                $http({
                    method: 'post',
                    url: apiUrl,
                    data: paramsObj
                }).success(function(data) {
                    common.utility.handlePostResult(data, function(d){
                        $location.path('/my/address');
                    });
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };
    }
])

.controller('SendtipCtrl', [
    '$scope',
    'Common',
    '$location',
    'md5',
    '$http',
    '$ionicPopup',
    function($scope, common, $location, md5, $http, $ionicPopup) {
        $scope.dataModel = common.tempData.homeData;
        $scope.send = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: '温馨提示',
                template: '请确认您是否愿意写片给陌生人，尽量满足Ta的要求，并在10天内寄出？',
                cancelText: '不寄了',
                okText: '确定'
            });
            confirmPopup.then(function(res){
                if (res) {
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
                            common.utility.handlePostResult(data, function(d){
                                common.utility.alert('提示', data.msg).then(function(){
                                    $location.path('/home');
                                });
                            });
                        }).error(function() {
                            alert('网络异常.');
                            common.utility.loadingHide();
                        });
                    }).fail(function(){
                        common.utility.resetToken();
                    });
                } else {

                }
            });
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
            }).error(function() {alert('网络异常.');});

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
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.send = function($event, i) {

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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            $event.stopPropagation();
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

        $scope.goDetail = function(c) {
            if (c.order_warning) {
                $location.path('/order/' + c.id + '/sending');
            }
        };

        $scope.takePic = function($event, c) {
            //保存当前选中的编号
            if ($scope.selectIndex === 1 && c.order_type !== 2){
                $scope.selectCardIndex = c.id;
                common.utility.takePicture($cordovaCamera, _loadPicture);
            }
            $event.stopPropagation();
        };

        common.utility.checkLogin().success(function(u){
            paramsObj.uid = u.uid;
            paramsObj.token = u.token;
        }).fail(function(){
            common.utility.resetToken();
        });
    }
])

.controller('OrderDetailCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$stateParams',
    '$ionicPopup',
    function($scope, $http, common, $location, md5, $stateParams, $ionicPopup) {
        var orderId = $stateParams.id,
            orderType = $stateParams.type;

        $scope.userInfo = {};
        $scope.pageTitle = '互寄详情';
        $scope.msgObj = {
            btnTxt1: '',
            btnTxt2: '',
            infoTxt: ''
        };
        if (orderType === 'sending') {
            //寄信追踪
            $scope.pageTitle = '寄信追踪';
        }
        if (orderType === 'receiving') {
            //收信追踪
            $scope.pageTitle = '收信追踪';
        } 
        if (orderType === 'detail') {
            //互寄详情
            $scope.pageTitle = '互寄详情';
        }

        common.utility.checkLogin().success(function(u){
            common.utility.loadingShow();
            $scope.userInfo = u;
            var paramsObj = {
                uid: u.uid,
                token: u.token,
                order_id: orderId
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.orderDetail,
                data: paramsObj
            }).success(function(data){

                common.utility.loadingHide();
                //如果没有照片，进行更改为 相机背景 的图片
                if (data.data.picture) {
                    data.data.picture = data.data.host + data.data.picture;
                } else {
                    data.data.picture = 'img/xjbj_1.png';
                }
                if (data.data.sender_avatar) {
                    data.data.sender_avatar = data.data.host + data.data.sender_avatar;
                } else {
                    data.data.sender_avatar = data.data.host + data.data.corporation_avatar;
                }

                if (orderType === 'sending') {
                    //寄信追踪
                    $scope.msgObj.btnTxt1 = '取消寄出';
                    $scope.msgObj.btnTxt2 = '去寄出';
                    $scope.msgObj.infoTxt = data.data.warning_deadline + '天内不处理，系统将关闭该订单，并扣除相应信用分。'
                }
                if (orderType === 'receiving') {
                    //收信追踪
                    $scope.msgObj.btnTxt1 = '确认收信';
                    $scope.msgObj.btnTxt2 = '没收到';
                    $scope.msgObj.infoTxt = '对方已寄出，如果' + data.data.warning_deadline + '天内仍未处理，系统将关闭该订单。'
                } 
                if (orderType === 'detail') {
                    //互寄详情
                    // $scope.pageTitle = '互寄详情';
                }
                $scope.card = data.data;
            });
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.btnAction1 = function(){
            var c = $scope.card,
                confirmObj = {
                    order_id: c.id,
                    uid: $scope.userInfo.uid,
                    token: $scope.userInfo.token
                },
                cardOrderType = $scope.card.order_type, templateStr, apiStr;
            if (orderType === 'sending') {
                //取消寄出，根据订单类型，提示不同的文案
                if (cardOrderType === 1 || cardOrderType === 3) {
                    //pc，给他寄
                    templateStr = '您确定取消吗？';
                } else {
                    templateStr = '取消寄出信用分 -1，您确定要取消吗?';
                }
            }
            if (orderType === 'receiving') {
                //确认收信
                templateStr = '您已经收到该编码的明信片?';
            }
            
            var confirmPopup = $ionicPopup.confirm({
                title: '温馨提示',
                template: templateStr,
                cancelText: '取消',
                okText: '确定'
            });
            
            confirmPopup.then(function(res) {
                if (res) {
                    if (orderType === 'sending') {
                        //取消寄出
                        confirmObj.module_type = 1;
                        confirmObj.opt_type = 11;
                        confirmObj.accessSign = md5.createHash(common.utility.createSign(confirmObj));
                        apiStr = common.API.warningOrderDeal;
                    }
                    if (orderType === 'receiving') {
                        //确定收到当前的明信片
                        confirmObj.accessSign = md5.createHash(common.utility.createSign(confirmObj));
                        apiStr = common.API.confirmReceipt;
                    }

                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: apiStr,
                        data: confirmObj
                    }).success(function(data) {
                        common.utility.loadingHide();
                        common.utility.alert('提示', data.msg).then(function(){
                            $location.path('/my/' + orderType);
                        });
                    }).error(function(){
                        alert('网络异常.');
                    });
                }
            });
        };

        $scope.btnAction2 = function(){
            if (orderType === 'sending') {
                //去寄出
                $location.path('/my/sending');
            }
            if (orderType === 'receiving') {
                //没收到
                var confirmPopup = $ionicPopup.confirm({
                    title: '温馨提示',
                    template: '没收到片会影响对方的到达率，请确定您真的没有收到？',
                    cancelText: '取消',
                    okText: '确定'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        common.utility.loadingShow();
                        var paramsObj = {
                            uid: $scope.userInfo.uid,
                            token: $scope.userInfo.token,
                            order_id: orderId,
                            module_type: 2,
                            opt_type: 21
                        };
                        paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                        $http({
                            method: 'post',
                            url: common.API.warningOrderDeal,
                            data: paramsObj
                        }).success(function(data){
                            common.utility.loadingHide();
                            common.utility.alert('提示', data.msg).then(function(){
                                $location.path('/my/receiving');
                            });
                        });
                    }
                });
            }
        };
    }
])

.controller('OrderTrashCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    '$stateParams',
    '$ionicPopup',
    function($scope, $http, common, $location, md5, $stateParams, $ionicPopup) {
        !function(){
            var id = $stateParams.id;
            $scope.userInfo = {};
            $scope.trashType = id;
            $scope.pageTitle = '收信垃圾箱';
            if (id == 1) {
                $scope.pageTitle = '寄信垃圾箱';
            }

            common.utility.checkLogin().success(function(u){
                $scope.userInfo = u;
                var paramsObj = {
                    uid: u.uid,
                    token: u.token,
                    type: id,
                    per: 10000
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.warningOrderList,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    
                    data.data.orderList.map(function(o){
                        if (o.picture) {
                            o.picture = data.data.host + o.picture;
                        } else {
                            o.picture = 'img/xjbj_1.png';
                        }
                        if (o.sender_avatar) {
                            o.sender_avatar = data.data.host + o.sender_avatar;
                        }
                    });
                    $scope.orderModel = data.data;
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        }();
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
                var province = common.utility.cookieStore.get('areainfo1'),
                    city = common.utility.cookieStore.get('areainfo2');
                if (province) {
                    $scope.userObj.province = province.name;
                }
                if (city) {
                    $scope.userObj.city = city.name;
                }
            }).fail(function() {
                common.utility.resetToken();
            });
        }();

        $scope.saveUserInfo = function() {
            var params = {
                'username': $scope.userObj.username,
                'province': $scope.userObj.province,
                'city': $scope.userObj.city
            };
            var url = common.API.setBasicInfo;
            var success = function(data) {
                if (data.status === 200) {
                    $scope.inputHide = true;
                    $scope.usernameHide = false;
                    common.utility.cookieStore.put('userinfo', $scope.userObj);
                    $location.path('/user/view/');
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
    function($scope, $http, common, $location, md5) {
        $scope.showTip = true;
        $scope.receiveObj = {};
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
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.done = function($event, c) {
            var confirmObj = {
                order_id: c.id,
                uid: paramsObj.uid,
                token: paramsObj.token
            };
       
            //确定收到当前的明信片
            confirmObj.accessSign = md5.createHash(common.utility.createSign(confirmObj));
            c.postParams = confirmObj;
            common.tempData.orderData = c;
            $location.path('/my/receiving/comment');
            $event.stopPropagation();
        };

        $scope.go = function(c) {
            if (c && c.order_warning) {
                $location.path('/order/' + c.id + '/receiving');
            } else if (c && c.order_type === 2) {
                //如果是互寄
                $location.path('/order/' + c.id + '/detail');
            }
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

.controller('ReceivingCommentCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    'md5',
    function($scope, $http, common, $location, md5) {
        var card = common.tempData.orderData;
        $scope.card = card;
        $scope.cardModel = {content: ''};
        $scope.done = function(){
            var confirmObj = card.postParams;
            confirmObj.reply_content = $scope.cardModel.content;
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.confirmReceipt,
                data: confirmObj
            }).success(function(data) {
                common.utility.loadingHide();
                if (data.status === 200) {
                    $location.path('/my/receiving');
                } else {
                    common.utility.alert('提示', data.msg);
                }
            }).error(function(){
                alert('网络异常.');
            });
        };

        !function(){
            common.utility.loadingShow();
            var paramsObj = {
                order_id: card.id,
                uid: card.postParams.uid,
                token: card.postParams.token
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.orderDetail,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    $scope.card.sender_avatar = d.data.host + d.data.sender_avatar;
                    $scope.card.sender_sex = d.data.sender_sex;
                    $scope.card.sender_username = d.data.sender_username;
                    $scope.card.sender_province = d.data.sender_province;
                    $scope.card.sender_city = d.data.sender_city;
                });
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

.controller('MyAddressListCtrl', [
    '$scope',
    '$http',
    'Common',
    '$location',
    '$ionicPopup',
    function($scope, $http, common, $location, $ionicPopup) {
        common.utility.cookieStore.remove('areainfo1');
        common.utility.cookieStore.remove('areainfo2');
        common.utility.cookieStore.remove('areainfo3');
        $scope.userInfo = {};
        var _initPage = function() {
            common.utility.loadingShow();
            var paramsObj = {
                uid: $scope.userInfo.uid,
                token: $scope.userInfo.token
            };

            $http({
                method: 'post',
                url: common.API.consigneeList,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                $scope.consigneeList = data.data.consigneeList;
            });
        };

        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
            _initPage();
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.delete = function(a){
            var confirmPopup = $ionicPopup.confirm({
                title: '删除',
                template: '确认要删除该地址吗?',
                okText: '删除',
                cancelText: '取消'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    //删除
                    $http({
                        method: 'get',
                        url: common.API.consigneeDelete,
                        params: {
                            consignee_id: a.id,
                            uid: $scope.userInfo.uid,
                            token: $scope.userInfo.token
                        }
                    }).success(function(data){
                        common.utility.handlePostResult(data, function(d){
                            _initPage();
                        });
                    });
                }
            });
        };

        $scope.setDefault = function(a){
            $http({
                method: 'post',
                url: common.API.setDefaultConsignee,
                data: {
                    cid: a.id,
                    uid: $scope.userInfo.uid,
                    token: $scope.userInfo.token
                }
            }).success(function(data){
                common.utility.handlePostResult(data, function(d){
                    _initPage();
                });
            });
        };

        $scope.edit = function(a){
            common.tempData.addressData = a;
            $location.path('/my/address/add/update');
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
            }).error(function() {
                alert('网络异常.');
                common.utility.loadingHide();
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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
            }).error(function() {
                alert('网络异常.');
                common.utility.loadingHide();
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
    '$ionicPopup',
    '$ionicActionSheet',
    function($http, $scope, common, md5, $stateParams, $location, $ionicPopup, $ionicActionSheet){
        $scope.hideEle = true;
        $scope.hideShare = true;
        $scope.userId = 0;
        $scope.showBackButton = false;
        var userId = $stateParams.id,
            userParamsObj = {
                suid: userId
            }, now = new Date();
        userParamsObj.accessSign = md5.createHash(common.utility.createSign(userParamsObj));

        if (userId) {
            $scope.showBackButton = true;
            $scope.userId = userId;
            $http({
                method: 'post',
                url: common.API.searchUserInfo,
                data: userParamsObj
            }).success(function(d){
                d.data.userInfo.create_at = Math.floor((now.getTime() - d.data.userInfo.create_at * 1000) / (24 * 3600000));
                d.data.userInfo.last_login_time = new Date(d.data.userInfo.last_login_time * 1000).format('MM-dd');
                d.data.userInfo.avatar = d.data.host + d.data.userInfo.avatar;
                if (d.data.userInfo.province === d.data.userInfo.city) {
                    d.data.userInfo.city = '';
                }
                $scope.userModel = d.data.userInfo;
                $scope.hideEle = true;
            });

            $scope.report = function() {
                var operationSheet = $ionicActionSheet.show({
                    buttons: [{
                        text: '举报'
                    }],
                    cancelText: '取消',
                    buttonClicked: function(index) {
                        if (index === 0) {
                            //举报
                            $location.path('/report/user/' + userId);
                        }
                    }
                });
            };
        } else {
            $scope.showBackButton = false;
            $scope.hideEle = false;
            var paramsObj = {};
            common.utility.checkLogin().success(function(u){
                $scope.userId = u.uid;
                paramsObj.uid = u.uid;
                paramsObj.token = u.token;
                u.last_login_time = new Date(u.last_login_time * 1000).format('MM-dd');
                u.create_at = Math.floor((now.getTime() - u.create_at * 1000) / (24 * 3600000));
                if (u.province === u.city) {
                    u.city = '';
                }
                $scope.userModel = u;
            }).fail(function(){
                common.utility.resetToken();
            });

            $scope.save = function(){
                paramsObj.introduction = this.userModel.introduction;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.introduction,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        common.utility.alert('提示', d.msg).then(function(){
                            //重置保存在storage的数据
                            var userCookieObj = common.utility.cookieStore.get('userinfo');
                            userCookieObj.introduction = paramsObj.introduction;
                            common.utility.cookieStore.remove('userinfo');
                            common.utility.cookieStore.put('userinfo', userCookieObj);
                            $location.path('/user/view/');
                        });
                    });
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            };

            $scope.go = function(){
                $location.path('/my/userinfo');
            };

            $scope.updateAddress = function(){
                //更新收信地址
                $location.path('/my/address');
            };

            $scope.updateWish = function(){
                //更新wish
                $location.path('/user/wish');
            };
        }

        $scope.backgroundImg = 'img/theme/icon_image' + now.getDay() + '.png';

        $scope.sendto = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                template: '你确定要寄给Ta一张吗?',
                cancelText: '取消',
                okText: '确定'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    var userobj = common.utility.getUserCookie(),
                        pobj = {
                            uid: userobj.uid,
                            token: userobj.token,
                            recipient_uid: userId
                        };
                    pobj.accessSign = md5.createHash(common.utility.createSign(pobj));
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.sendSomeone,
                        data: pobj
                    }).success(function(data){
                        common.utility.loadingHide();
                        common.utility.handlePostResult(data, function(d){
                            common.utility.alert('提示', d.msg);
                        });
                    });
                }
            });
        };

        $scope.share = function(){
            $scope.hideShare = false;
        };

        $scope.cancel = function(){
            $scope.hideShare = true;
        };

        $scope.shareWechat = function(){
            Wechat.isInstalled(function (installed) {
                // alert("Wechat installed: " + (installed ? "Yes" : "No"));
                if (installed) {
                    Wechat.share({
                        message: {
                            title: "来信人社，一起玩转明信片吧！",
                            description: "最受欢迎的明信片爱好者社群，都在这里！",
                            thumb: "http://www.xinrenclub.com/app/img/logo2.png",
                            // mediaTagName: "TEST-TAG-001",
                            messageExt: "",
                            // messageAction: "<action>dotalist</action>",
                            media: {
                                type: Wechat.Type.LINK,
                                webpageUrl: "http://www.xinrenclub.com/wechatshare/?suid=" + $scope.userId
                            }
                        },
                        scene: Wechat.Scene.TIMELINE   // share to Timeline
                    }, function () {
                        // alert("分享成功");
                    }, function (reason) {
                        // alert("失败: " + reason);
                    });
                } else {
                    // alert('微信尚未安装！');
                }
            }, function (reason) {
                alert("Failed: " + reason);
            });
        };

        // href="#/user/message/{{userModel.uid}}
        $scope.sendmsg = function(){
            common.utility.checkLogin().success(function(u){
                common.tempData.userInfo = u;
                $location.path('/user/message/' + $scope.userModel.uid);
            }).fail(function(){
                common.utility.resetToken();
            });
        };
    }
])

.controller('MessageCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        // $scope.userInfo = {};
        !function(){
            common.utility.checkLogin().success(function(u){
                // $scope.userInfo = u;
                common.utility.loadingShow();
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.msgCategoryList,
                    data: paramsObj,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    common.utility.loadingHide();
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
                }).error(function() {
                    alert('网络异常.');common.utility.loadingHide();
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
    '$location',
    function($http, $scope, common, md5, $stateParams, $location){
        $scope.userObj = {};
        !function(){
            $scope.sourceType = $stateParams.id;
            $scope.pageTitle = '';

            common.utility.checkLogin().success(function(u){
                var paramsObj = {
                        uid: u.uid,
                        token: u.token,
                        category: $stateParams.id,
                        per: 10000
                    }, 
                    apiUrl = common.API.msgList;
                if ($scope.sourceType === 'note') {
                    apiUrl = common.API.userNoteMsgList;
                }
                $scope.userObj = u;
                common.tempData.userInfo = u;
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: apiUrl,
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

                        if (d.data.noteUserList && d.data.noteUserList.length > 0) {
                            d.data.noteUserList.map(function(m){
                                if (m.create_at){
                                    m.create_at = new Date(m.create_at * 1000).format('yyyy-MM-dd hh:mm:ss');
                                }
                            });
                        }

                        $scope.msgModel = d.data;
                        if ($scope.sourceType === 'note') {
                            $scope.pageTitle = '留言';
                        } else {
                            $scope.pageTitle = d.data.categoryInfo.name;
                        }
                    });
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }).fail(function(){
                common.utility.resetToken();
            });
        }();

        $scope.comment = function($event, c) {
            //回复跳转到评论的页面
            var paramsObj = {};
            if (c.type === 'forum_hfyhlctx') {
                //表示 回复评论，用户回复了自己的评论，针对当前评论进行回复
                paramsObj = {
                    forum_id: c.msgdata.forum_id,
                    uid: c.msgdata.comment_uid,
                    id: c.msgdata.comment_id,
                    uuid: $scope.userObj.uid,
                    token: $scope.userObj.token,
                    username: c.msgdata.comment_username,
                    from: 'message'
                };
            }

            if (c.type === 'forum_pllztx') {
                //表示 评论主题帖， 用户评论的当前的主题帖，就针对该用户的楼层进行回复
                paramsObj = {
                    id: c.msgdata.forum_id,
                    uid: c.msgdata.comment_uid,
                    uuid: $scope.userObj.uid,
                    token: $scope.userObj.token,
                    floor: 2,
                    username: c.msgdata.comment_username,
                    from: 'message'
                };
            }
            common.tempData.userData = paramsObj;
            $location.path('/square/' + paramsObj.id + '/reply');
            $event.stopPropagation();
        };

        $scope.go = function (f) {
            $location.path('squaretheme/' + f.msgdata.forum_pid + '/message_forum');
        };
    }
])

.controller('SignCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$interval',
    function($http, $scope, common, md5, $interval){
        var _init, theTime, timeStamp;
        $scope.signCount = 0;
        $scope.uObj = {};
        $scope.showTimeCount = false;
        $scope.showHours = '00';
        $scope.showMinutes = '00';
        $scope.showSeconds = '60'

        _init = function() {
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
                        var now = new Date(d.data.date * 1000);
                        d.data.date = new Date(d.data.date * 1000).format('yyyy年MM月dd日');
                        $scope.signObj = d.data;
                        //设置倒计时数据
                        //如果没有签到，而且时间在下午6:00前，显示倒计时，距离可以签到的倒计时
                        //时间在6:00后，显示 “签到”
                        //已经签到，显示 “已签到”
                        if (!$scope.signObj.hasSign) {
                            if (now.getHours() < 20) {
                                theTime = new Date();
                                theTime.setHours(20);
                                theTime.setMinutes(0);
                                theTime.setSeconds(0);
                                $scope.showTimeCount = true;
                                timeStamp = theTime.getTime() - now.getTime();
                                var hours = Math.floor(timeStamp / 3600000),
                                    minutes = Math.floor((timeStamp % 3600000) / 60000),
                                    seconds = Math.round((timeStamp % 60000) / 1000),
                                    intervalHandle;

                                $scope.showHours = hours;
                                $scope.showMinutes = minutes < 10 ? '0' + minutes : minutes;
                                $scope.showSeconds = seconds < 10 ? '0' + seconds : seconds;

                                intervalHandle = $interval(function(){
                                    seconds --;
                                    if (seconds < 0) {
                                        seconds = 59;
                                        minutes --;
                                    }
                                    if (minutes < 0) {
                                        minutes = 59;
                                        hours --;
                                    }
                                    if (hours < 0) {
                                        hours = 0;
                                    }
                                    if (hours === 0 && minutes === 0 && seconds === 0) {
                                        $scope.showTimeCount = false;
                                        $interval.cancel(intervalHandle);
                                    }
                                    $scope.showHours = hours;
                                    $scope.showMinutes = minutes < 10 ? '0' + minutes : minutes;
                                    $scope.showSeconds = seconds < 10 ? '0' + seconds : seconds;
                                }, 1000);
                            } else {
                                $scope.showTimeCount = false;
                            }
                        } else {
                            $scope.showTimeCount = false;
                        }
                    });
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });

                var paramsObj1 = {
                    uid: u.uid,
                    token: u.token,
                    per: 100
                };
                paramsObj1.accessSign = md5.createHash(common.utility.createSign(paramsObj1));
                $http({
                    method: 'post',
                    url: common.API.signList,
                    data: paramsObj1
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        $scope.signCount = d.data.totalCount;
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', d.msg).then(function(){
                        _init();
                    });
                });
            }).error(function() {
                alert('网络异常.');
                common.utility.loadingHide();
            });
        };

        $scope.open = function() {
            common.utility.gotoHelp('signin');
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
                    }).error(function() {alert('网络异常.');common.utility.loadingHide();});
                }).fail(function(){
                    common.utility.resetToken();
                });
            }
        };
    }
])

//互寄列表
.controller('SwitchCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$stateParams',
    function($http, $scope, common, md5, $stateParams){
        $scope.dataList = [];
        $scope.themeTypeList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.themeId = 0;
        //获取主题内容数据
        $scope.initList = function(t) {
            if ($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                var paramsObj = {
                    theme_id: $scope.themeId,
                    per: 20,
                    page: $scope.currentPage
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.exchangeList,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.publishList.map(function(c){
                            c.picture = d.data.host + c.picture;
                        });
                        $scope.lastPage = d.data.totalPage;
                        $scope.dataList = $scope.dataList.concat(d.data.publishList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        }
    }
])

//互寄详情
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
                if (data.data.status === 0) {
                    data.data.statusText = '正在互换';
                } else if (data.data.status === 1) {
                    data.data.statusText = '互换成功';
                } else if (data.data.status === 2) {
                    data.data.statusText = '互换失败';
                }
                $scope.publishModel = data.data;
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
        };


        $scope.switchCard = function(){
            if (!$scope.publishModel.hasApply) {
                var confirmPopup = $ionicPopup.confirm({
                    title: '温馨提示',
                    template: '你觉得自己满足换片要求吗？',
                    cancelText: '取消',
                    okText: '确定'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        $location.path('/switch/photos/' + $scope.publishModel.id);
                    }
                });
            } else {
                common.utility.alert('提示', '不要贪心哦，一个人只能申请一次！');
            }
        };

        $scope.select = function(p){
            var confirmPopup = $ionicPopup.confirm({
                title: '温馨提示',
                template: '小助手会提醒对方发片的，你也要及时寄片哦!',
                cancelText: '取消',
                okText: '确定'
            });

            confirmPopup.then(function(res) {
                if(res) {
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
                    }).error(function() {alert('网络异常.');common.utility.loadingHide();});
                }
            });
        };
    }
])

//互寄相册
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
        $scope.switchModel = {note: ''};

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
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };

        $scope.select = function(p){
            var paramsObj = {
                uid: $scope.userInfo.uid,
                token: $scope.userInfo.token,
                photo_id: p.id,
                publish_id: publishId,
                note: $scope.switchModel.note
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
                        $location.path('/switch/card/' + publishId);
                    });
                });
            }).error(function() {
                alert('网络异常.');common.utility.loadingHide();
            });
        };

        $scope.delete = function(p){
            common.utility.loadingShow();
            var paramsObj = {
                uid: $scope.userInfo.uid,
                token: $scope.userInfo.token,
                photo_id: p.id
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.deleteMyPhoto,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', d.msg).then(function(){
                        $scope.dataList = [];
                        $scope.noMoreData = false;
                        $scope.currentPage = 1;
                        $scope.lastPage = 2;
                        $scope.initList();
                    });
                });
            }).error(function(){
                alert('网络异常.');common.utility.loadingHide();
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
    '$location',
    function($http, $scope, common, md5, $cordovaCamera, $ionicActionSheet, $location){
        $scope.photos = [];
        $scope.userInfo = {};

        var options = {
            quality: 95,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
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
                        options.sourceType = Camera.PictureSourceType.CAMERA;
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
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.exchangeUploadPic,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    common.utility.alert('提示', d.msg).then(function(){
                        $location.path('/switch/photos/');
                    });
                });
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
        };
    }
])

//发布互寄
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
            }).error(function() {alert('网络异常.');common.utility.loadingHide();});
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
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };
    }
])

.controller('SettingSendCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        $scope.dataModel = {
            allowPC: true,
            allowSending: true,
            allowReceiving: true,
            userinfo: {}
        };

        !function(){
            common.utility.loadingShow();
            common.utility.checkLogin().success(function(u){
                $scope.dataModel.userinfo = u;
                var paramsObj = {
                    uid: u.uid,
                    token: u.token
                };
                paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'post',
                    url: common.API.postcardConf,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        // $scope.dataModel.allowSending = d.data.receive_send === 1;
                        $scope.dataModel.allowReceiving = d.data.receive_all === 1;
                        $scope.dataModel.allowPC = d.data.open_destiny === 1;
                    });
                });
            }).fail(function(){
                common.utility.resetToken();
            });
        }();

        $scope.save = function(t, v){
            var paramsObj = {
                conf_type: t,
                conf_value: v,
                uid: $scope.dataModel.userinfo.uid,
                token: $scope.dataModel.userinfo.token
            };
            paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
            $http({
                method: 'post',
                url: common.API.savePostcardConf,
                data: paramsObj
            }).success(function(data){});
        };

        $scope.saveR = function(){
            $scope.save(1, $scope.dataModel.allowReceiving ? 1 : 0);
        };

        $scope.savePC = function(){
            $scope.save(2, $scope.dataModel.allowPC ? 1 : 0);
        };
    }
])

.controller('SearchCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        $scope.dataModel = {
            searchTxt: '',
            userList: [],
            userInfo: {},
            host: ''
        };
        $scope.showTip = false;
        !function(){
            common.utility.checkLogin().success(function(u){
                $scope.dataModel.userInfo = u;
            }).fail(function(){
                common.utility.resetToken();
            });
        }();

        $scope.search = function() {
            if ($scope.dataModel.searchTxt !== '') {
                common.utility.loadingShow();
                var dataObj = {
                    uid: $scope.dataModel.userInfo.uid,
                    token: $scope.dataModel.userInfo.token,
                    username: $scope.dataModel.searchTxt
                };
                dataObj.accessSign = md5.createHash(common.utility.createSign(dataObj));
                $http({
                    method: 'post',
                    url: common.API.searchUser,
                    data: dataObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        $scope.showTip = (d.data.userList.length === 0);
                        $scope.dataModel.userList = d.data.userList;
                        $scope.dataModel.host = d.data.host;
                    });
                });
            }
        };
    }
])

.controller('SignKingCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        var userObj = common.utility.cookieStore.get('userinfo'), paramsObj;
        $scope.hasLogin = true;
        $scope.noNum = false;
        $scope.userObj = userObj;

        if (!userObj) {
            $scope.hasLogin = false;
            console.log('xx');
        } else  {
            paramsObj = {uid: userObj.uid};
        }
        common.utility.loadingShow();
        $http({
            url: common.API.signTop,
            params: paramsObj
        }).success(function (data) {
            common.utility.loadingHide();
            var signData = data.data;
            // 判断有没有排名数据
            if (signData.userNum === 0) {
                //第一名
                $scope.noNum = false;
            } else if (signData.userNum > 0) {
                //显示还有多少距离
            } else {
                //显示暂无排名
                $scope.noNum = true;
            }

            for (var i = 0; i < signData.topList.length; i++) {
                signData.topList[i].index = i;
            }
            $scope.kingData = signData;
        });
    }
])

.controller('ExpandCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        $scope.hideShare = true;
        $scope.userObj = {};

        common.utility.checkLogin().success(function(u){
            $scope.userObj = u;
            common.utility.loadingShow();
            $http({
                method: 'get',
                url: common.API.inviteHome,
                params: {
                    uid: u.uid,
                    token: u.token
                }
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    $scope.dataModel = d.data;
                    // console.log($scope.dataModel.invitation_code);
                });
            }).error(function(){
                alert('网络异常.');
                common.utility.loadingHide();
            });
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.share = function(){
            $scope.hideShare = false;
        };

        $scope.cancel = function (argument) {
            $scope.hideShare = true;
        };

        $scope.shareWechat = function (argument) {
            Wechat.isInstalled(function (installed) {
                if (installed) {
                    Wechat.share({
                        message: {
                            title: "来信人社，一起玩转明信片吧！",
                            description: "最受欢迎的明信片爱好者社群，都在这里！",
                            thumb: "http://www.xinrenclub.com/app/img/logo2.png",
                            // mediaTagName: "TEST-TAG-001",
                            messageExt: "",
                            // messageAction: "<action>dotalist</action>",
                            media: {
                                type: Wechat.Type.LINK,
                                webpageUrl: "http://www.xinrenclub.com/wechatshare/expand.html?uname=" + escape($scope.userObj.username) + '&code=' + $scope.dataModel.invitation_code
                            }
                        },
                        scene: Wechat.Scene.TIMELINE   // share to Timeline
                    }, function () {
                        // alert("分享成功");
                    }, function (reason) {
                        // alert("失败: " + reason);
                    });
                } else {
                    // alert('微信尚未安装！');
                }
            }, function (reason) {
                alert("Failed: " + reason);
            });           
        };

        $scope.help = function(){
            common.utility.gotoHelp('expand');
        };
    }
])

.controller('ExpandKingCtrl', [
    '$http', 
    '$scope', 
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        var userObj = common.utility.cookieStore.get('userinfo'), paramsObj;
        $scope.hasLogin = true;
        $scope.noNum = false;
        $scope.userObj = userObj;

        if (!userObj) {
            $scope.hasLogin = false;
        } else  {
            paramsObj = {uid: userObj.uid, token: userObj.token};
        }
        common.utility.loadingShow();
        $http({
            method: 'post',
            url: common.API.inviteTop,
            data: paramsObj
        }).success(function (data) {
            common.utility.loadingHide();
            var signData = data.data;
            // 判断有没有排名数据
            if (signData.userNum === 0) {
                //第一名
                $scope.noNum = false;
            } else if (signData.userNum > 0) {
                //显示还有多少距离
            } else {
                //显示暂无排名
                $scope.noNum = true;
            }

            for (var i = 0; i < signData.topList.length; i++) {
                signData.topList[i].index = i;
            }
            $scope.kingData = signData;
        });
    }
])

.controller('SquareCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    function($http, $scope, common, md5, $location){
        $scope.dataList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;

        $scope.initList = function() {
            if ($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                var paramsObj = {
                    per: 20,
                    page: $scope.currentPage
                };
                // paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));
                $http({
                    method: 'get',
                    url: common.API.forumHome,
                    params: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.forumList.map(function(c){
                            c.avatar = d.data.host + c.avatar;
                            for (var i = 0; i < c.pictures.length; i++) {
                                c.pictures[i] = d.data.host + c.pictures[i];
                            }

                            var now = new Date(), postTime = new Date(c.update_at * 1000), timeStamp;
                            timeStamp = now - postTime;

                            //设置发帖的时间
                            //刚刚，1分钟前，10分钟前，1小时以前，3小时以前，5小时以前，不在当天的显示日期
                            if (timeStamp < 60000) {
                                c.timeStr = '刚刚';
                            } else if (timeStamp < 600000) {
                                c.timeStr = '1分钟前';
                            } else if (timeStamp < 60 * 60000) {
                                c.timeStr = '10分钟前';
                            } else if (timeStamp < 180 * 60000) {
                                c.timeStr = '1小时前';
                            } else if (timeStamp < 300 * 60000) {
                                c.timeStr = '3小时前';
                            } else if (timeStamp >= 300 * 60000 && timeStamp < 720 * 60000) { 
                                //大于5小时并且小于一天，显示5小时前
                                c.timeStr = '5小时前';
                            } else if (timeStamp >= 720 * 2 * 60000 && now.getDate() - postTime.getDate() === 1) {
                                c.timeStr = '昨天';
                            } else {
                                c.timeStr = postTime.format('MM-dd');
                            }
                        });
                        $scope.lastPage = d.data.totalPage;
                        $scope.dataList = $scope.dataList.concat(d.data.forumList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };
    }
])

.controller('SquarePostCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    '$cordovaCamera',
    '$ionicActionSheet',
    function($http, $scope, common, md5, $location, $cordovaCamera, $ionicActionSheet){
        $scope.postModel = {
            title: '',
            content: '',
            pictures: []
        };
        $scope.photos = [];
        var options = {
            quality: 95,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        }, _savePicture = function(s){
            $scope.photos.push(s);
        };

        $scope.post = function () {
            if ($scope.postModel.title !== '' && $scope.postModel.content !== '') {
                common.utility.checkLogin().success(function (u) {
                    var paramsObj = {
                        title: $scope.postModel.title,
                        content: $scope.postModel.content,
                        uid: u.uid,
                        token: u.token,
                        pictures: $scope.photos
                    };
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.createForum,
                        data: paramsObj
                    }).success(function (data) {
                        common.utility.loadingHide();
                        common.utility.alert('提示', data.msg).then(function (argument) {
                            $location.path('/square');
                        });
                    }).error(function () {
                        common.utility.loadingHide();
                        alert('网络异常');
                    })
                }).fail(function () {
                    common.utility.resetToken();
                });
            } else {
                common.utility.alert('提示', '请输入内容！');
            }
        };

        //上传照片
        $scope.upload = function () {
            if ($scope.photos.length >= 9) {
                common.utility.alert('提示', '图片不能超过9张！');
            } else {
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
                            options.sourceType = Camera.PictureSourceType.CAMERA;
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
            }
        };
    }
])

.controller('SquareThemeCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    '$stateParams',
    '$cordovaCamera',
    '$ionicActionSheet',
    '$ionicPopup',
    function($http, $scope, common, md5, $location, $stateParams, $cordovaCamera, $ionicActionSheet, $ionicPopup){
        var forumId = $stateParams.id,
            options = {
                quality: 95,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 600,
                targetHeight: 600,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            }, 
            _savePicture = function(s){
                $scope.photos.push(s);
            };

        $scope.dataList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.photos = [];
        $scope.showPhotos = false;
        $scope.themeRepModel = {content: ''};
        $scope.replyStyle = {height: ''};
        $scope.userinfo = {};
        $scope.buttons = [
            {
                text: '举报'
            }];

        common.utility.checkLogin().success(function(u){
            $scope.userinfo = u;
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.goBack = function() {
            $location.path($stateParams.from.split('_').join('/'));
        };

        $scope.operation = function() {
            var operationSheet = $ionicActionSheet.show({
                buttons: $scope.buttons,
                cancelText: '取消',
                cancel: function() {},
                buttonClicked: function(index) {
                    if (index === 0) {
                        //举报
                        $location.path('/report/forum/' + forumId);
                    }
                    if (index === 1) {
                        //删除
                        var confirmPopup = $ionicPopup.confirm({
                            title: '温馨提示',
                            template: '您确定要删除吗？',
                            cancelText: '取消',
                            okText: '删除'
                        });
                        confirmPopup.then(function(res){
                            if (res) {
                                common.utility.loadingShow();
                                $http({
                                    method: 'post',
                                    url: common.API.forumDelete,
                                    data: {
                                        forum_id: forumId,
                                        uid: $scope.userinfo.uid,
                                        token: $scope.userinfo.token
                                    }
                                }).success(function(data){
                                    common.utility.loadingHide();
                                    $location.path('/square');
                                });
                            }
                            operationSheet();
                        });
                    }
                }
            });
        };

        window.addEventListener('native.keyboardshow', function(e){
            $scope.replyStyle = {
                'height': (e.keyboardHeight + 60) + 'px'
            };
            $scope.$apply();
        });

        $scope.inputBlur = function () {
            // $scope.showPhotos = true;
            //失去焦点的时候，上传照片总数为0并且上传照片照片不显示的时候，隐藏
            if ($scope.photos.length === 0) {
                if (!$scope.showPhotos) {
                    $scope.replyStyle = {
                        'height': '60px'
                    };
                }
            }
        };

        $scope.replay = function (argument) {
            if ($scope.themeRepModel.content !== '') {
                common.utility.checkLogin().success(function(u){
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.replyLandlord,
                        data: {
                            uid: u.uid,
                            token: u.token,
                            content: $scope.themeRepModel.content,
                            forum_id: forumId,
                            pictures: $scope.photos
                        }
                    }).success(function(data){
                        common.utility.loadingHide();
                        common.utility.handlePostResult(data, function(d){
                            common.utility.alert('提示', d.msg).then(function(){
                                // 回复成功
                                var replyObj = d.data;
                                replyObj.username = u.username;
                                replyObj.timeStr = (new Date(replyObj.create_at * 1000)).format('yyyy-MM-dd');
                                //楼层
                                replyObj.floor = $scope.dataList.length + 1;
                                //是否是楼主
                                replyObj.isLandlord = u.uid === $scope.dataList[0].uid;
                                //头像
                                replyObj.avatar = replyObj.host + replyObj.avatar;
                                for (var i = 0; i < replyObj.pictures.length; i++) {
                                    replyObj.pictures[i] = replyObj.host + replyObj.pictures[i];
                                }
                                $scope.dataList.push(replyObj);
                                $scope.replyStyle = {
                                    'height': '60px'
                                };
                                $scope.themeRepModel.content = '';
                            });
                        });
                    });
                }).fail(function(){
                    common.utility.resetToken();
                });
            }
        };

        $scope.upload = function() {
            $scope.showPhotos = !$scope.showPhotos;
            if (!$scope.showPhotos) {
                $scope.replyStyle = {
                    'height': '60px'
                };
            }
        };

        $scope.uploadPic = function() {
            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            $cordovaCamera.getPicture(options).then(function(imageData) {
                _savePicture('data:image/jpeg;base64,' + imageData);
            }, function(err) {});
        };

        $scope.uploadCamera = function(){
            options.sourceType = Camera.PictureSourceType.CAMERA;
            $cordovaCamera.getPicture(options).then(function(imageData) {
                _savePicture('data:image/jpeg;base64,' + imageData);
            }, function(err) {});
        };

        $scope.initList = function() {
            if ($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                var paramsObj = {
                    per: 20,
                    page: $scope.currentPage,
                    forum_id: forumId
                };
                $http({
                    method: 'get',
                    url: common.API.forumFloor,
                    params: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.forumList.map(function(c){
                            c.avatar = d.data.host + c.avatar;
                            for (var i = 0; i < c.pictures.length; i++) {
                                c.pictures[i] = d.data.host + c.pictures[i];
                            }
                            var postTime = new Date(c.create_at * 1000);

                            c.timeStr = postTime.format('yyyy-MM-dd');
                        });
                        if ($scope.currentPage === 1) {
                            //判断当前用户是否是楼主，如果是楼主，添加删除权限
                            if(d.data.forumList[0].uid === $scope.userinfo.uid) {
                                $scope.buttons.push({text: '删除'});
                            }
                        }
                        $scope.lastPage = d.data.totalPage;
                        $scope.dataList = $scope.dataList.concat(d.data.forumList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };

        $scope.comment = function(f) { 
            f.uuid = $scope.userinfo.uid;
            f.token = $scope.userinfo.token;
            //判断是回复楼层，还是回复用户
            if (f.floor === 1) {
                return;
            } else {
                common.tempData.userData = f;
                $location.path('/square/' + forumId + '/reply'); 
            }
        };

        $scope.report = function(f) {
            console.log(f);
            $location.path('/report/forum/' + f.id);
        };

        $scope.formatDate = function(t) {
            return new Date(t * 1000).format('yyyy-MM-dd');
        };
    }
])

.controller('ReportCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    '$stateParams',
    '$cordovaCamera',
    function($http, $scope, common, md5, $location, $stateParams, $cordovaCamera){
        var from = $stateParams.from, 
            id = $stateParams.id;

        $scope.reportList = [];
        $scope.reportItem = {};
        $scope.userInfo = {};
        $scope.photos = [];
        $scope.reportModel = {
            content: '',
            from: from
        };

        var _savePicture = function(s){
            $scope.photos.push(s);
        };

        $scope.submit = function() {
            if ($scope.reportItem.id) {
                common.utility.loadingShow();
                var reportUrl = common.API.forumReport,
                    reportData = {
                        forum_id: id,
                        option_id: $scope.reportItem.id,
                        uid: $scope.userInfo.uid,
                        token: $scope.userInfo.token
                    };
                if (from === 'user') {
                    //表示举报用户
                    reportUrl = common.API.personReport;
                    reportData = {
                        uid: $scope.userInfo.uid,
                        token: $scope.userInfo.token,
                        picture: $scope.photos,
                        r_uid: id,
                        contents: $scope.reportModel.content
                    };
                }

                $http({
                    method: 'post',
                    url: reportUrl,
                    data: reportData
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        if (from === 'user') {
                            $location.path('/user/view/' + id);
                        } else {
                            $location.path('/square');
                        }
                    });
                });
            }
        };

        $scope.select = function(o) {
            $scope.reportItem = o;
        };

        //上传照片
        $scope.upload = function () {
            if ($scope.photos.length >= 9) {
                common.utility.alert('提示', '图片不能超过9张！');
            } else {
                var options = {
                    quality: 95,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 600,
                    targetHeight: 600,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    _savePicture('data:image/jpeg;base64,' + imageData);
                }, function(err) {
                });
            }
        };

        common.utility.checkLogin().success(function(u){
            // 如果是举报用户，不需要获取举报的选项
            if (from === 'user') {

            } else {
                var paramsObj = {
                    uid: u.uid,
                    token: u.token,
                    report_type: 1
                };
                $scope.userInfo = u;
                $http({
                    method: 'post',
                    url: common.API.reportoptions,
                    data: paramsObj
                }).success(function(data){
                    common.utility.handlePostResult(data, function(d){
                        $scope.reportList = d.data.optionList;
                    });
                });
            }
        }).fail(function(){
            common.utility.resetToken();
        });
    }
])

.controller('SquareReplyCtrl', [
    '$http',
    '$scope',
    'Common',
    'md5',
    '$location',
    '$stateParams',
    function($http, $scope, common, md5, $location, $stateParams){
        $scope.replyModel = {
            content: '回复' + common.tempData.userData.username + '：',
            placeholder: '回复' + common.tempData.userData.username + '：'
        };

        $scope.cancel = function(){
            var fObj = common.tempData.userData;
            if (fObj.from) {
                $location.path('/message/forum');
            } else {
                $location.path('/squaretheme/' + $stateParams.id + '/square');
            }
        };

        $scope.submit = function(){
            if ($scope.replyModel.content !== '') {
                var fObj = common.tempData.userData,
                    paramsObj = {
                        forum_id: fObj.id,
                        content: $scope.replyModel.content,
                        reply_uid: fObj.uid,
                        uid: fObj.uuid,
                        token: fObj.token
                    },
                    apiUrl = common.API.replyFloor;
                if (!fObj.floor) {
                    apiUrl = common.API.replyUser;
                    paramsObj = {
                        forum_id: fObj.forum_id,
                        content: $scope.replyModel.content,
                        reply_uid: fObj.uid,
                        reply_comment_id: fObj.id,
                        uid: fObj.uuid,
                        token: fObj.token
                    };
                }
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: apiUrl,
                    data: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        common.utility.alert('提示', d.msg).then(function(){
                            if (fObj.from) {
                                $location.path('/message/forum');
                            } else {
                                $location.path('/squaretheme/' + $stateParams.id + '/square');
                            }
                        });
                    });
                });
            }
        };
    }
])

.controller('TaskCtrl', [
    '$http',
    '$scope',
    'Common',
    function($http, $scope, common){
        $scope.hasLogin = false;
        $scope.userInfo = {};
        $scope.init = function(p) {
            common.utility.loadingShow();
            $http({
                url: common.API.homeList,
                params: p
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    $scope.taskModel = d.data;
                });
            }).error(function(){
                alert('网络异常');
                common.utility.loadingHide();
            });
        };

        $scope.get = function() {
            if ($scope.hasLogin) {
                if ($scope.taskModel.prizeInfo.is_able) {
                    //登录，领取奖励
                    common.utility.loadingShow();
                    $http({
                        method: 'post',
                        url: common.API.getPrize,
                        data: $scope.userInfo
                    }).success(function(data){
                        common.utility.loadingHide();
                        common.utility.alert('提示', data.msg);
                    }).error(function(){
                        alert('网络异常');
                        common.utility.loadingHide();
                    });    
                } else {
                    common.utility.alert('提示', '您还有任务没有完成哦！');
                }
            } else {
                common.utility.resetToken();
            }
        };

        common.utility.checkLogin().success(function(u){
            $scope.hasLogin = true;
            $scope.userInfo = u;
            $scope.init({uid: u.uid, token: u.token});
        }).fail(function(){
            $scope.hasLogin = false;
            $scope.init();
        });
    }
])

.controller('BeanCtrl', [
    '$http',
    '$scope',
    'Common',
    function($http, $scope, common){
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 5;
        $scope.userInfo = {};
        $scope.brandList = [];
        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.initList = function() {
            var paramsObj = {};
            paramsObj.uid = $scope.userInfo.uid;
            paramsObj.token = $scope.userInfo.token;
            paramsObj.page = $scope.currentPage;

            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: common.API.digBeanList,
                    data: paramsObj
                }).success(function(data) {
                    //处理card的示例图
                    common.utility.handlePostResult(data, function(d) {
                        if (d.data.brandList.length > 0) {
                            d.data.brandList.map(function(b) {
                                if (b.logo) {
                                    b.logo = d.data.host + b.logo;
                                }
                            });
                        }
                        $scope.lastPage = d.data.totalPage;
                        $scope.brandList = $scope.brandList.concat(d.data.brandList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        // $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };
        
        $scope.dig = function(b) {
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.doDig,
                data: {
                    uid: $scope.userInfo.uid,
                    token: $scope.userInfo.token,
                    brand_id: b.id
                }
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.alert('提示', data.msg).then(function(){
                    $scope.brandList = [];
                    $scope.currentPage = 1;
                    $scope.lastPage = 2;
                    $scope.noMoreData = false;
                    $scope.initList();
                });
            }).error(function(){
                common.utility.loadingHide();
                alert('网络异常.');
            });
        };
    }
])

.controller('sendMessageCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    '$cordovaCamera',
    function($http, $scope, common, $stateParams, $cordovaCamera){
        var cuserInfo = common.tempData.userInfo,
            userId = $stateParams.userId,
            options = {
                quality: 95,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 600,
                targetHeight: 600,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            }, 
            _savePicture = function(s){
                $scope.photos.push(s);
                $scope.replay(true);
            };

        $scope.dataModel = {isBlack: false};
        $scope.dataList = [];
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 10;
        $scope.photos = [];
        $scope.showPhotos = false;
        $scope.messageRepModel = {content: ''};
        $scope.replyStyle = {height: ''};
        $scope.userinfo = {};
        $scope.userId = userId;

        window.addEventListener('native.keyboardshow', function(e){
            $scope.replyStyle = {
                'height': (e.keyboardHeight + 60) + 'px'
            };
            $scope.$apply();
        });

        $http({
            method: 'post',
            url: common.API.checkIsBlack,
            data: {
                uid: cuserInfo.uid,
                token: cuserInfo.token,
                r_uid: userId
            }
        }).success(function(data){
            $scope.dataModel.isBlack = data.data.is_black;
        });

        $scope.upload = function() {
            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            $cordovaCamera.getPicture(options).then(function(imageData) {
                _savePicture('data:image/jpeg;base64,' + imageData);
            }, function(err) {});
        };

        $scope.initList = function() {
            if ($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                var paramsObj = {
                    per: 20,
                    page: $scope.currentPage,
                    r_uid: userId,
                    uid: cuserInfo.uid,
                    token: cuserInfo.token
                };
                $http({
                    method: 'get',
                    url: common.API.noteHistory,
                    params: paramsObj
                }).success(function(data){
                    common.utility.loadingHide();
                    common.utility.handlePostResult(data, function(d){
                        d.data.noteList.map(function(c){
                            c.avatar = d.data.host + c.avatar;
                            if (c.picture) {
                                c.picture = d.data.host + c.picture;
                            }
                            c.isMe = (c.uid === cuserInfo.uid);
                        });
                        $scope.lastPage = d.data.totalPage;
                        $scope.dataList = $scope.dataList.concat(d.data.noteList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        // $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                }).error(function() {alert('网络异常.');common.utility.loadingHide();});
            }
        };

        $scope.replay = function(isImg) {
            var paramsObj = {
                uid: cuserInfo.uid,
                token: cuserInfo.token,
                r_uid: userId,
                content: $scope.messageRepModel.content,
            };
            if (isImg) {
                paramsObj.picture = $scope.photos[0];
            }

            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.sendNote,
                data: paramsObj
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.handlePostResult(data, function(d){
                    $scope.messageRepModel.content = '';
                    $scope.photos = [];
                    $scope.replyStyle = {height: '60px'};
                    $scope.currentPage = 1;
                    $scope.lastPage = 2;
                    $scope.noMoreData = false;
                    $scope.dataList = [];
                    $scope.initList();
                });
            }).error(function(){
                alert('网络异常.');
                common.utility.loadingHide();
            });
        };

        $scope.toBlack = function() {
            common.utility.loadingShow();
            $http({
                method: 'post',
                url: common.API.addToBlack,
                data: {
                    r_uid: userId,
                    uid: cuserInfo.uid,
                    token: cuserInfo.token
                }
            }).success(function(data){
                common.utility.loadingHide();
                common.utility.alert('提示', data.msg);
            }).error(function(){
                alert('网络异常.');
                common.utility.loadingHide();
            });
        };
    }
])

.controller('CreditRecordCtrl', [
    '$http',
    '$scope',
    'Common',
    '$stateParams',
    function($http, $scope, common, $stateParams){
        var pageType = $stateParams.pagetype;
        $scope.noMoreData = false;
        $scope.currentPage = 1;
        $scope.lastPage = 5;
        $scope.userInfo = {};
        $scope.recordList = [];

        common.utility.checkLogin().success(function(u){
            $scope.userInfo = u;
        }).fail(function(){
            common.utility.resetToken();
        });

        $scope.initList = function() {
            var paramsObj = {}, 
                apiUrl = common.API.rpRecord;
            paramsObj.uid = $scope.userInfo.uid;
            paramsObj.token = $scope.userInfo.token;
            paramsObj.page = $scope.currentPage;
            // paramsObj.accessSign = md5.createHash(common.utility.createSign(paramsObj));

            if (pageType == 'bean') {
                apiUrl = common.API.beanRecord;
            }
            if($scope.currentPage > $scope.lastPage) {
                $scope.noMoreData = true;
            } else {
                common.utility.loadingShow();
                $http({
                    method: 'post',
                    url: apiUrl,
                    data: paramsObj
                }).success(function(data) {
                    //处理card的示例图
                    common.utility.handlePostResult(data, function(d) {
                        if (d.data.recordList.length > 0) {
                            d.data.recordList.map(function(r){
                                r.create_at = new Date(r.create_at * 1000).format('yyyy-MM-dd');
                            });
                        }
                        $scope.lastPage = d.data.totalPage;
                        $scope.recordList = $scope.recordList.concat(d.data.recordList);
                        $scope.noMoreData = (d.data.totalPage <= 0);
                        $scope.currentPage++;
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                    common.utility.loadingHide();
                }).error(function() {
                    alert('网络异常.');
                    common.utility.loadingHide();
                });
            }
        };

    }
])



;