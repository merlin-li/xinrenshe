'use strict';
angular.module('xinrenshe', [
    'ionic',
    'xinrenshe.controllers',
    'xinrenshe.services',
    'ionic-datepicker',
    'ionic-timepicker',
    'xinrenshe.error'
]).config([
    '$stateProvider',
    '$urlRouterProvider',
    '$ionicConfigProvider',
    'ionicDatePickerProvider',
    function($stateProvider, $urlRouterProvider, $ionicConfigProvider, ionicDatePickerProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.views.forwardCache(true);
        // $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.views.maxCache(0);

        $stateProvider.state('app_home', {
                url: '/home',
                views: {
                    'content': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            .state('img_crop', {
                url: '/image/crop',
                views: {
                    'content': {
                        templateUrl: 'templates/image/crop.html',
                        controller: 'ImgCropCtrl'
                    }
                }
            })
            .state('app_login', {
                url: '/user/login',
                views: {
                    'content': {
                        templateUrl: 'templates/user/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            }).state('app_signup', {
                url: '/user/signup',
                views: {
                    'content': {
                        templateUrl: 'templates/user/signup.html',
                        controller: 'SignupCtrl'
                    }
                }
            }).state('app_user', {
                url: '/user',
                views: {
                    'content': {
                        templateUrl: 'templates/user/index.html',
                        controller: 'UserCtrl'
                    }
                }
            }).state('app_setting_userinfo', {
                url: '/setting/userinfo',
                views: {
                    'content': {
                        templateUrl: 'templates/setting/userinfo.html',
                        controller: 'SetUserInfoCtrl'
                    }
                }
            }).state('app_setting_address', {
                url: '/setting/address',
                views: {
                    'content': {
                        templateUrl: 'templates/setting/address.html',
                        controller: 'SetAddressCtrl'
                    }
                }
            }).state('app_city_setting', {
                url: '/city/setting/type/:type',
                views: {
                    'content': {
                        templateUrl: 'templates/city/setting.html',
                        controller: 'CitySettingCtrl'
                    }
                }
            }).state('app_city_setting_id', {
                url: '/city/setting/:areaId',
                views: {
                    'content': {
                        templateUrl: 'templates/city/setting.html',
                        controller: 'CitySettingCtrl'
                    }
                }
            }).state('app_sendtip', {
                url: '/card/sendtip',
                views: {
                    'content': {
                        templateUrl: 'templates/card/sendtip.html',
                        controller: 'SendtipCtrl'
                    }
                }
            }).state('app_send', {
                url: '/card/send',
                views: {
                    'content': {
                        templateUrl: 'templates/card/send.html',
                        controller: 'SendCtrl'
                    }
                }
            }).state('app_mysending', {
                url: '/my/sending',
                views: {
                    'content': {
                        templateUrl: 'templates/user/sending.html',
                        controller: 'MySendingCtrl'
                    }
                }

            }).state('app_my_userinfo', {
                url: '/my/userinfo',
                views: {
                    'content': {
                        templateUrl: 'templates/user/userinfo.html',
                        controller: 'MyUserInfoCtrl'
                    }
                }
            }).state('app_myreceiving', {
                url: '/my/receiving',
                views: {
                    'content': {
                        templateUrl: 'templates/user/receiving.html',
                        controller: 'MyReceivingCtrl'
                    }
                }
            }).state('app_my_address', {
                url: '/my/address',
                views: {
                    'content': {
                        templateUrl: 'templates/user/useraddress.html',
                        controller: 'MyAddressCtrl'
                    }
                }
            }).state('app_joint', {
                url: '/joint',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/index.html',
                        controller: 'JointHomeCtrl'
                    }
                }
            }).state('corporation', {
                url: '/joint/corporation/:id',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/corporation.html',
                        controller: 'CorporationCtrl'
                    }
                }
            }).state('joint_manage_associator', {
                url: '/joint/manage/associator/:id',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/manage/associator.html',
                        controller: 'JointManageAssociatorCtrl'
                    }
                }
            }).state('joint_manage_release_activity', {
                url: '/joint/manage/releaseActivity/:id',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/manage/releaseActivity.html',
                        controller: 'JointManagereleaseActivityCtrl'
                    }
                }
            }).state('joint_manage_cadgeList', {
                url: '/joint/manage/cadgeList/:corporationId/:activityId',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/manage/cadgeList.html',
                        controller: 'JointManageCadgeListCtrl'
                    }
                }
            })

        .state('activity', {
            url: '/joint/activity/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/index.html',
                    controller: 'JointActivityCtrl'
                }
            }
        })

        .state('activity_member', {
                url: '/joint/activity/:id/member',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/activity/memberlist.html',
                        controller: 'ActivityMemberCtrl'
                    }
                }
            }).state('my_corporation_list', {
                url: '/joint/manage/myCorporation',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/manage/mycorporationList.html',
                        controller: 'myCorporationCtrl'
                    }
                }
            })
            .state('corporation_notice', {
                url: '/joint/manage/notice/:id',
                views: {
                    'content': {
                        templateUrl: 'templates/joint/manage/notice.html',
                        controller: 'CorporationNoticeCtrl'
                    }
                }
            })

        .state('corporation_edit', {
            url: '/corporation/profile/edit/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/edit/profile.html',
                    controller: 'CorporationEditCtrl'
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

        var datePickerObj = {
            inputDate: new Date(),
            setLabel: '设置',
            todayLabel: '今天',
            closeLabel: '取消',
            mondayFirst: false,
            weeksList: ["日", "一", "二", "三", "四", "五", "六"],
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            from: new Date(2012, 8, 1),
            to: new Date(2018, 8, 1),
            showTodayButton: true,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: false,
            disableWeekdays: []
        };
        ionicDatePickerProvider.configDatePicker(datePickerObj);
    }
]);


angular.module('xinrenshe.error', []).factory('$exceptionHandler', function() {
    return function(exception, cause) {
        exception.message += ' (caused by "' + cause + '")';
        console.log(exception.message);
        alert(exception.message);
    };
});