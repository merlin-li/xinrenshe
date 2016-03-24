'use strict';
angular.module('guozhongbao.services', []).factory('Common', [
    '$ionicPopup',
    '$ionicHistory',
    '$cacheFactory',
    '$ionicLoading',
    '$http',
    '$location',
    '$q',
    '$cookieStore',
    'md5',
    function ($ionicPopup, $ionicHistory, $cacheFactory, $ionicLoading, $http, $location, $q, $cookieStore, md5) {

        var offline = false, location = window.location.search, apiBaseUrl;
        offline = location.indexOf('?offline') >= 0;
        apiBaseUrl = offline ? 'http://xiaoyeshu.billowton.com/v1.0/' : 'http://xiaoyeshu.billowton.com/v1.0/';

        //判断是不是stage环境
        // if (location.indexOf('?stage') >= 0) {
        //     api_base_url = 'http://stage.api.guozhongbao.com';
        // }
        var u = window.navigator.userAgent, loadingTemplate = '';
        if (u.match(/(iPhone|iPod|ios|iPad)/i)) {
            loadingTemplate = '<ion-spinner icon="bubbles" style="fill:#fff"></ion-spinner>';
        } else {
            loadingTemplate = '<img src="img/loan/pic_loading.gif" style="width:30px;height:30px;">';
        }
        Date.prototype.format = function (fmt) {
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
        var _checkLogin = function () {
                var deferred = {}, userInfoObj;

                if ($cookieStore.get('userinfo')) {
                    userInfoObj = $cookieStore.get('userinfo');
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

                return deferred;
            }, _alert = function (t, c) {
                var a = c || t;
                var myAlert = $ionicPopup.alert({
                        title: t,
                        template: a
                    });
                return myAlert;
            }, _checkID = function (id) {
                return /^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3}) (\d|X)?$/.test(id);
            }, _formatTime = function (time) {
                var separator = ' ';
                return time.split(separator)[0];
            }, _loadingShow = function () {
                $ionicLoading.show({ template: loadingTemplate });
            }, _loadingHide = function () {
                $ionicLoading.hide();
            }, _removeCookie = function (name) {
                if (_cookieStore.get(name)) {
                    _cookieStore.remove(name);
                }
            }, _cookieStore = function () {
                var thisTip = '\u63d0\u793a', thisMsg = '\u65e0\u75d5\u6a21\u5f0f\u4e0b\uff0c\u65e0\u6cd5\u4f7f\u7528\u8be5\u529f\u80fd\uff0c\u8bf7\u5173\u95edSafari\u65e0\u75d5\u6a21\u5f0f\u3002';
                return {
                    get: function (key) {
                        try {
                            return JSON.parse(window.localStorage.getItem(key));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    put: function (key, value) {
                        try {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    },
                    remove: function (key) {
                        try {
                            window.localStorage.removeItem(key);
                        } catch (e) {
                            _alert(thisTip, thisMsg);
                        }
                    }
                };
            }(), _getDeviceInfo = function () {
                var deviceType = '', deviceCode = '', ua = navigator.userAgent;
                if (/MicroMessenger/i.test(ua)) {
                    deviceType = 'wechat';
                    deviceCode = 4;
                } else if (/IEMobile/i.test(ua)) {
                    deviceType = 'windowsphone';
                    deviceCode = 3;
                } else if (/iPhone|iPad|iPod/i.test(ua)) {
                    deviceType = 'ios';
                    deviceCode = 1;
                } else if (/Android/i.test(ua)) {
                    deviceType = 'android';
                    deviceCode = 2;
                } else {
                    deviceType = 'unknown';
                    deviceCode = 0;
                }
                return {
                    deviceType: deviceType,
                    deviceCode: deviceCode
                };
            }, _createSign = function (paramObj) {
                var appKey = '6a70eef64db7fc3f16ef19b877fb32db',
                    appSecret = 'c34437ac61651d066a4380d01a5dead4',
                    keys = Object.keys(paramObj).sort(), str = '';

                str += appKey;
                keys.map(function(t){
                    if (t !== 'accessSign')
                        str += (t + paramObj[t]);
                });
                str += appSecret;

                // return md5.createHash(str);
                return str;
            }, _getUserCookie = function () {
                if ($cookieStore.get('userinfo')) {
                    return $cookieStore.get('userinfo');
                } else {
                    return false;
                }
            }, _postData = function(url,params,needLogin,needAccessSign,successCallback){
                if(needLogin!==false){
                  var userCookie = _getUserCookie();
                  if (userCookie) {
                    params.uid = userCookie.uid;
                    params.token = userCookie.token;

                  }else{
                    _alert('提示', '请重新登录');
                    $location.path('/user/login');
                  }
                }
                if(needAccessSign!==false){
                  params.accessSign = md5.createHash(_createSign(params));
                }
                var result = {};
                result = $http({
                              method: 'post',
                              url: url,
                              data: params
                            });
                if(successCallback){
                  result.success(function(data){
                    if (data.status === 402) {
                      $cookieStore.remove('userinfo');
                      _alert('提示',data.msg);
                      $location.path('/user/login');
                    }else{
                      successCallback(data);
                    }
                  }).error(function(){
                    _alert('提示', '网络连接错误,请稍后再试');
                  })
                }else{
                  return result;
                }
            }, _resetToken = function() {
                $cookieStore.remove('userinfo');
                $location.path('/user/login');
            }, _handlePostResult = function(d, cb) {
                if (!d.status) {
                    console.error('no status.');
                    return false;
                }
                if (d.status && d.status === 200) {
                    cb(d);
                }
                if (d.status === 402) {
                    //reset login method
                    $cookieStore.remove('userinfo');
                    $location.path('/user/login');
                }
            };

        return {
            API: {
                home: apiBaseUrl + 'homePage/sendInfo',
                login: apiBaseUrl + 'login/loginAuth',
                signup: apiBaseUrl + 'register/registerAuth',
                regCode: apiBaseUrl + 'register/getVerifyCode',
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
                associatorList: apiBaseUrl + '/jointly/associatorList',
                activityList: apiBaseUrl + '/jointly/activityList',
                activityDetail: apiBaseUrl + '/jointly/activityDetail',
                corporationList: apiBaseUrl + 'jointly/getCorporationList',
                joinExitCorporation: apiBaseUrl + 'jointly/joinExitCorporation',
                associatorApplyList: apiBaseUrl + 'jointlyManage/associatorApplyList',
                associatorVet: apiBaseUrl + 'jointlyManage/associatorVet',
                joinUserList: apiBaseUrl + 'jointly/joinUserList'

            },
            SOURCE: {
                'home': '/home'
            },
            MESSAGE: {
                network_error: 'Network error, please try again later.',
                invalid_phone: '无效的手机号码',
                reg_code_success_tip: '验证码发送成功'
            },
            utility: {
                'checkPhone': function (p) {
                    return /^1[3|4|5|7|8][0-9]\d{8}$/.test(p);
                },
                'checkPassword': function (p) {
                    return p.trim().length >= 6;
                },
                'getCache': function (name) {
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
                'getDeviceInfo': _getDeviceInfo,
                'createSign': _createSign,
                'getUserCookie': _getUserCookie,
                'postData': _postData,
                'resetToken': _resetToken,
                'handlePostResult': _handlePostResult
            },
            tempData: {
                userAddressInfo: ''
            }
        };
    }
]);
