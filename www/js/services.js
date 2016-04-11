'use strict';
angular.module('xinrenshe.services', []).factory('Common', [
    '$ionicPopup',
    '$ionicHistory',
    '$cacheFactory',
    '$ionicLoading',
    '$http',
    '$location',
    'md5',
    '$ionicActionSheet',
    function($ionicPopup, $ionicHistory, $cacheFactory, $ionicLoading, $http, $location, md5, $ionicActionSheet) {

        var offline = false,
            location = window.location.search,
            apiBaseUrl;
        offline = location.indexOf('?offline') >= 0;
        apiBaseUrl = offline ? 'http://appdev.xinrenclub.com/v1.0/' : 'http://api.xinrenclub.com/v1.0/';

        //判断是不是stage环境
        // if (location.indexOf('?stage') >= 0) {
        //     api_base_url = 'http://stage.api.guozhongbao.com';
        // }
        var u = window.navigator.userAgent,
            loadingTemplate = '<ion-spinner icon="bubbles" style="fill:#fff"></ion-spinner>';
        // if (u.match(/(iPhone|iPod|ios|iPad)/i)) {
        //     loadingTemplate = '<ion-spinner icon="bubbles" style="fill:#fff"></ion-spinner>';
        // } else {
        //     loadingTemplate = '<ion-spinner icon="bubbles" style="fill:#fff"></ion-spinner>';
            
        //     // loadingTemplate = '<img src="img/pic_loading.gif" style="width:30px;height:30px;">';
        // }
        Date.prototype.format = function(fmt) {
            var o = {
                'M+': this.getMonth() + 1,
                'd+': this.getDate(),
                'h+': this.getHours(),
                'm+': this.getMinutes(),
                's+': this.getSeconds(),
                'q+': Math.floor((this.getMonth() + 3) / 3),
                'S': this.getMilliseconds()
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }
            return fmt;
        };

        //创建用于检查是否登录的公共函数
        var _checkLogin = function() {
                var deferred = {},
                    userInfoObj;

                if (_cookieStore.get('userinfo')) {
                    userInfoObj = _cookieStore.get('userinfo');
                    deferred.login = true;
                    deferred.userInfo = userInfoObj;
                } else {
                    deferred.login = false;
                    deferred.userInfo = {};
                }

                deferred.success = function(cb) {
                    if (this.login) {
                        cb(this.userInfo);
                    }
                    return this;
                };
                deferred.fail = function(cb) {
                    if (!this.login) {
                        cb();
                    }
                    return this;
                };

                deferred.always = function(cb) {
                    cb(this.userInfo);
                    return this;
                };

                return deferred;
            },
            _alert = function(t, c) {
                var a = c || t;
                var myAlert = $ionicPopup.alert({
                    title: t,
                    template: a
                });
                return myAlert;
            },
            _checkID = function(id) {
                return /^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3}) (\d|X)?$/.test(id);
            },
            _formatTime = function(time) {
                var separator = ' ';
                return time.split(separator)[0];
            },
            _loadingShow = function() {
                $ionicLoading.show({
                    template: loadingTemplate
                });
            },
            _loadingHide = function() {
                $ionicLoading.hide();
            },
            _removeCookie = function(name) {
                if (_cookieStore.get(name)) {
                    _cookieStore.remove(name);
                }
            },
            _cookieStore = function() {
                var thisTip = '\u63d0\u793a',
                    thisMsg = '\u65e0\u75d5\u6a21\u5f0f\u4e0b\uff0c\u65e0\u6cd5\u4f7f\u7528\u8be5\u529f\u80fd\uff0c\u8bf7\u5173\u95edSafari\u65e0\u75d5\u6a21\u5f0f\u3002';
                return {
                    get: function(key) {
                        try {
                            return JSON.parse(window.localStorage.getItem(key));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    put: function(key, value) {
                        try {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    remove: function(key) {
                        try {
                            window.localStorage.removeItem(key);
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    }
                };
            }(),
            _createSign = function(paramObj) {
                var appKey = '6a70eef64db7fc3f16ef19b877fb32db',
                    appSecret = 'c34437ac61651d066a4380d01a5dead4',
                    keys = Object.keys(paramObj).sort(),
                    str = '';

                str += appKey;
                keys.map(function(t) {
                    if (t !== 'accessSign')
                        str += (t + paramObj[t]);
                });
                str += appSecret;
                return str;
            },
            _getUserCookie = function() {
                if (_cookieStore.get('userinfo')) {
                    return _cookieStore.get('userinfo');
                } else {
                    return false;
                }
            },
            _postData = function(url, params, needLogin, needAccessSign, successCallback) {
                if (needLogin !== false) {
                    var userCookie = _getUserCookie();
                    if (userCookie) {
                        params.uid = userCookie.uid;
                        params.token = userCookie.token;

                    } else {
                        _alert('提示', '请重新登录');
                        $location.path('/user/login');
                    }
                }
                if (needAccessSign !== false) {
                    params.accessSign = md5.createHash(_createSign(params));
                }
                var result = {};
                result = $http({
                    method: 'post',
                    url: url,
                    data: params
                });
                if (successCallback) {
                    result.success(function(data) {
                        if (data.status === 402) {
                            _cookieStore.remove('userinfo');
                            _alert('提示', data.msg);
                            $location.path('/user/login');
                        } else {
                            successCallback(data);
                        }
                    }).error(function() {
                        _alert('提示', '网络连接错误,请稍后再试');
                    })
                } else {
                    return result;
                }
            },
            _resetToken = function() {
                _cookieStore.remove('userinfo');
                $location.path('/user/login');
            },
            _handlePostResult = function(d, cb) {
                if (!d.status) {
                    console.error('no status.');
                    return false;
                }
                if (d.status && d.status === 200) {
                    cb(d);
                } else if (d.status === 402) {
                    //reset login method
                    _cookieStore.remove('userinfo');
                    $location.path('/user/login');
                } else {
                    _alert('提示', d.msg);
                }
            },
            _takePicture = function(cordovaCamera, successFn, errFn) {
                var options = {
                    quality: 90,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 300,
                    targetHeight: 300,
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
                            pictureSheet();
                            cordovaCamera.getPicture(options).then(function(imageData) {
                                successFn('data:image/jpeg;base64,' + imageData);
                            }, function(err) {
                                if (errFn) {
                                    errFn(err);
                                }
                            });
                        }
                        if (index === 1) {
                            pictureSheet();
                            options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                            cordovaCamera.getPicture(options).then(function(imageData) {
                                successFn('data:image/jpeg;base64,' + imageData);
                            }, function(err) {
                                if (errFn) {
                                    errFn(err);
                                }
                            });
                        }
                    }
                });
            };


        return {
            API: {
                home: apiBaseUrl + 'homePage/homeInfo',
                login: apiBaseUrl + 'login/loginAuth',
                signup: apiBaseUrl + 'register/registerAuth',
                regCode: apiBaseUrl + 'register/getVerifyCode',
                loginCode: apiBaseUrl + 'login/getVerifyCode',
                setNewPasswd: apiBaseUrl + 'login/setNewPasswd',
                setUserInfo: apiBaseUrl + 'register/setUserInfo',
                setConsigneeInfo: apiBaseUrl + 'register/setConsigneeInfo',
                getRegion: apiBaseUrl + 'common/getRegion',
                getDestinyUser: apiBaseUrl + 'createOrders/getDestinyUser',
                orderList: apiBaseUrl + 'postCard/orderList',
                send: apiBaseUrl + 'postCard/send',
                modifyUserName: apiBaseUrl + 'setUserInfo/username',
                uploadPic: apiBaseUrl + 'postCard/uploadPic',
                confirmReceipt: apiBaseUrl + 'postCard/confirmReceipt',
                modifyAvatar: apiBaseUrl + 'setUserInfo/avatar',
                modifyConsigneeInfo: apiBaseUrl + 'setUserInfo/consignee',
                getUserInfo: apiBaseUrl + 'common/getUserInfo',
                corporationDetail: apiBaseUrl + 'jointly/corporationDetail',
                associatorApplyList: apiBaseUrl + 'jointlyManage/associatorApplyList',
                associatorVet: apiBaseUrl + 'jointlyManage/associatorVet',
                uploadActivityPic: apiBaseUrl + 'jointlyManage/uploadActivityPic',
                releaseActivity: apiBaseUrl + 'jointlyManage/releaseActivity',
                cadgeListManage: apiBaseUrl + 'jointlyManage/joinUserList',
                associatorList: apiBaseUrl + 'jointly/associatorList',
                activityList: apiBaseUrl + 'jointly/activityList',
                activityDetail: apiBaseUrl + 'jointly/activityDetail',
                corporationList: apiBaseUrl + 'jointly/getCorporationList',
                joinExitCorporation: apiBaseUrl + 'jointly/joinExitCorporation',
                joinUserList: apiBaseUrl + 'jointly/joinUserList',
                joinActivity: apiBaseUrl + 'jointly/joinActivity',
                corporationListManage: apiBaseUrl + 'jointlyManage/corporationList',
                saveCorporation: apiBaseUrl + 'jointlyManage/saveCorporation',
                releaseNotice: apiBaseUrl + 'jointlyManage/releaseNotice',
                createCorporation: apiBaseUrl + 'jointly/createCorporation',
                joinPostcard: apiBaseUrl + 'jointly/joinPostcard',
                postcardUserList: apiBaseUrl + 'jointly/postcardUserList',
                dealPostcardUser: apiBaseUrl + 'jointlyManage/dealPostcardUser',
                corpSendOrderList: apiBaseUrl + 'jointlyManage/corpSendOrderList',
                cadgeUserList: apiBaseUrl + 'jointlyManage/cadgeUserList',
                cadgeUserDeal: apiBaseUrl + 'jointlyManage/cadgeUserDeal',
                cadgeList: apiBaseUrl + 'createOrders/cadgeList',
                introduction: apiBaseUrl + 'setUserInfo/introduction',
                getBanner: apiBaseUrl + 'homePage/getBannerInfo'
            },
            utility: {
                'checkPhone': function(p) {
                    return /^1[3|4|5|7|8][0-9]\d{8}$/.test(p);
                },
                'checkPassword': function(p) {
                    return p.trim().length >= 6;
                },
                'getCache': function(name) {
                    return $cacheFactory(name);
                },
                'alert': _alert,
                'checkLogin': _checkLogin,
                'formatTime': _formatTime,
                'checkID': _checkID,
                'loadingShow': _loadingShow,
                'loadingHide': _loadingHide,
                'removeCookie': _removeCookie,
                'cookieStore': _cookieStore,
                'createSign': _createSign,
                'getUserCookie': _getUserCookie,
                'postData': _postData,
                'resetToken': _resetToken,
                'handlePostResult': _handlePostResult,
                'takePicture': _takePicture
            },
            tempData: {
                userAddressInfo: '',
                corporationInfo: '',
                imgData: ''
            }
        };
    }
]);