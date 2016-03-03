'use strict';
angular.module('guozhongbao.services', []).factory('Common', [
    '$ionicPopup',
    '$ionicHistory',
    '$cacheFactory',
    '$ionicLoading',
    '$http',
    '$rootScope',
    '$location',
    function ($ionicPopup, $ionicHistory, $cacheFactory, $ionicLoading, $http, $rootScope, $location) {
        var offline = false, location = window.location.search, apiBaseUrl;
        offline = location.indexOf('?offline') >= 0;
        apiBaseUrl = offline ? 'http://xiaoyeshu.billowton.com/' : 'http://xiaoyeshu.billowton.com/';

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

        var _checkLogin = function () {
                var uinfo = _cookieStore.get('uinfo');
                if (uinfo) {
                    return uinfo;
                } else {
                    return false;
                }
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
            };

        return {
            API: {
                login: apiBaseUrl + '/login/loginAuth',
                signup: apiBaseUrl + '/register/registerAuth',
                regCode: apiBaseUrl + '/register/getVerifyCode'

            },
            SOURCE: {
                'home': '/home',
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
            },
            tempData: {

            }
        };
    }
]);