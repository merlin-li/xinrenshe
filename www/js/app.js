'use strict';
angular.module('xinrenshe', [
    'ionic',
    'xinrenshe.controllers',
    'xinrenshe.services',
    'ionic-datepicker',
    'ionic-timepicker'
]).config([
    '$stateProvider',
    '$urlRouterProvider',
    '$ionicConfigProvider',
    'ionicDatePickerProvider',
    function($stateProvider, $urlRouterProvider, $ionicConfigProvider, ionicDatePickerProvider) {
        $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $ionicConfigProvider.views.forwardCache(true);

        $stateProvider.state('xrs_home', {
            url: '/home',
            views: {
                'content': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('xrs_banner', {
            url: '/banner',
            views: {
                'content': {
                    templateUrl: 'templates/banner/index.html',
                    controller: 'BannerCtrl'
                }
            }
        })
        .state('xrs_message', {
            url: '/message',
            views: {
                'content': {
                    templateUrl: 'templates/message/index.html',
                    controller: 'MessageCtrl'
                }
            }
        })
        .state('xrs_messagedetail', {
            url: '/message/:id',
            views: {
                'content': {
                    templateUrl: 'templates/message/message.html',
                    controller: 'MessageDetCtrl'
                }
            }
        })
        .state('xrs_feedback', {
            url: '/feedback',
            views: {
                'content': {
                    templateUrl: 'templates/feedback/index.html',
                    controller: 'FeedbackCtrl'
                }
            }
        })
        .state('xrs_login', {
            url: '/user/login',
            views: {
                'content': {
                    templateUrl: 'templates/user/account/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('xrs_userLevel', {
            url: '/user/level',
            views: {
                'content': {
                    templateUrl: 'templates/user/info/level.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('xrs_signup', {
            url: '/user/signup',
            views: {
                'content': {
                    templateUrl: 'templates/user/account/signup.html',
                    controller: 'SignupCtrl'
                }
            }
        })
        .state('xrs_forgetpwd', {
            url: '/user/forgetpwd',
            views: {
                'content': {
                    templateUrl: 'templates/user/account/forgetpwd.html',
                    controller: 'ForgetpwdCtrl'
                }
            }
        })
        .state('xrs_user', {
            url: '/user',
            views: {
                'content': {
                    templateUrl: 'templates/user/index.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('xrs_userView', {
            url: '/user/view/:id',
            views: {
                'content': {
                    templateUrl: 'templates/user/view.html',
                    controller: 'UserViewCtrl'
                }
            }
        })
        .state('xrs_settingUserinfo', {
            url: '/setting/userinfo',
            views: {
                'content': {
                    templateUrl: 'templates/setting/userinfo.html',
                    controller: 'SetUserInfoCtrl'
                }
            }
        })
        .state('xrs_settingAddress', {
            url: '/setting/address',
            views: {
                'content': {
                    templateUrl: 'templates/setting/address.html',
                    controller: 'SetAddressCtrl'
                }
            }
        })
        .state('xrs_updateAddress', {
            url: '/my/address/add/:type',
            views: {
                'content': {
                    templateUrl: 'templates/setting/address.html',
                    controller: 'UpdateAddressCtrl'
                }
            }
        })
        .state('xrs_citySetting', {
            url: '/city/setting/type/:type',
            views: {
                'content': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        })
        .state('xrs_citySettingId', {
            url: '/city/setting/:areaId',
            views: {
                'content': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        })
        .state('xrs_sendtip', {
            url: '/card/sendtip',
            views: {
                'content': {
                    templateUrl: 'templates/card/sendtip.html',
                    controller: 'SendtipCtrl'
                }
            }
        })
        .state('xrs_mySending', {
            url: '/my/sending',
            views: {
                'content': {
                    templateUrl: 'templates/user/card/sending.html',
                    controller: 'MySendingCtrl'
                }
            }
        })
        .state('xrs_myUserinfo', {
            url: '/my/userinfo',
            views: {
                'content': {
                    templateUrl: 'templates/user/userinfo.html',
                    controller: 'MyUserInfoCtrl'
                }
            }
        })
        .state('xrs_myReceiving', {
            url: '/my/receiving',
            views: {
                'content': {
                    templateUrl: 'templates/user/card/receiving.html',
                    controller: 'MyReceivingCtrl'
                }
            }
        })
        .state('xrs_myReceivingComment', {
            url: '/my/receiving/comment',
            views: {
                'content': {
                    templateUrl: 'templates/user/card/comment.html',
                    controller: 'ReceivingCommentCtrl'
                }
            }
        })
        .state('xrs_myAddress', {
            url: '/my/address',
            views: {
                'content': {
                    templateUrl: 'templates/user/info/addresslist.html',
                    controller: 'MyAddressListCtrl'
                }
            }
        })
        .state('xrs_joint', {
            url: '/joint',
            views: {
                'content': {
                    templateUrl: 'templates/joint/index.html',
                    controller: 'JointHomeCtrl'
                }
            }
        })
        .state('xrs_corporation', {
            url: '/joint/corporation/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/corporation.html',
                    controller: 'CorporationCtrl'
                }
            }
        })
        .state('xrs_jointManageAssociator', {
            url: '/joint/manage/associator/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/manage/associator.html',
                    controller: 'JointManageAssociatorCtrl'
                }
            }
        })
        .state('xrs_manageReleaseActivity', {
            url: '/joint/manage/releaseActivity/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/manage/releaseActivity.html',
                    controller: 'JointManagereleaseActivityCtrl'
                }
            }
        })
        .state('xrs_jointManageCadgeList', {
            url: '/joint/manage/cadgeList/:corporationId/:activityId',
            views: {
                'content': {
                    templateUrl: 'templates/joint/manage/cadgeList.html',
                    controller: 'JointManageCadgeListCtrl'
                }
            }
        })
        .state('xrs_activity', {
            url: '/joint/activity/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/index.html',
                    controller: 'JointActivityCtrl'
                }
            }
        })
        .state('xrs_activityQuestion', {
            url: '/joint/activity/:id/question',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/question.html',
                    controller: 'JointActivityQuestionCtrl'
                }
            }
        })
        .state('xrs_activityMember', {
            url: '/joint/activity/:id/member',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/memberlist.html',
                    controller: 'ActivityMemberCtrl'
                }
            }
        })
        .state('xrs_activityMembercard', {
            url: '/joint/activity/:id/membercard',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/membercard.html',
                    controller: 'MemberCardCtrl'
                }
            }
        })
        .state('xrs_activityJoinMember', {
            url: '/joint/activity/:id/joinmember/:show',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/joinuserlist.html',
                    controller: 'JoinUserListCtrl'
                }
            }
        })
        .state('xrs_myCorporationList', {
            url: '/joint/manage/myCorporation',
            views: {
                'content': {
                    templateUrl: 'templates/joint/manage/mycorporationList.html',
                    controller: 'myCorporationCtrl'
                }
            }
        })
        .state('xrs_corporationNotice', {
            url: '/joint/manage/notice/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/manage/notice.html',
                    controller: 'CorporationNoticeCtrl'
                }
            }
        })
        .state('xrs_corporationEdit', {
            url: '/corporation/profile/edit/:id',
            views: {
                'content': {
                    templateUrl: 'templates/joint/edit/profile.html',
                    controller: 'CorporationEditCtrl'
                }
            }
        })
        .state('xrs_corporationCreate', {
            url: '/corporation/create',
            views: {
                'content': {
                    templateUrl: 'templates/joint/edit/create.html',
                    controller: 'CorporationCreateCtrl'
                }
            }
        })
        .state('xrs_writer', {
            url: '/writer',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/index.html',
                    controller: 'WriterCtrl'
                }
            }
        })
        .state('xrs_tips', {
            url: '/tips/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/list.html',
                    controller: 'TipsListCtrl'
                }
            }
        })
        .state('xrs_writerTips', {
            url: '/tipsdetail/:id/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/tips.html',
                    controller: 'TipsCtrl'
                }
            }
        })
        .state('xrs_sign', {
            url: '/sign',
            views: {
                'content': {
                    templateUrl: 'templates/sign/index.html',
                    controller: 'SignCtrl'
                }
            }
        })
        .state('xrs_Setting', {
            url: '/setting',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/index.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('xrs_about', {
            url: '/setting/about',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/about.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('xrs_SettingSend', {
            url: '/setting/send',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/send.html',
                    controller: 'SettingSendCtrl'
                }
            }
        })
        .state('xrs_switchPhotos', {
            url: '/switch/photos/:type',
            views: {
                'content': {
                    templateUrl: 'templates/switch/photos.html',
                    controller: 'SwitchPhotosCtrl'
                }
            }
        })
        .state('xrs_switchUpload', {
            url: '/switch/upload',
            views: {
                'content': {
                    templateUrl: 'templates/switch/upload.html',
                    controller: 'SwitchUploadCtrl'
                }
            }
        })
        .state('xrs_switchIndex', {
            url: '/switch',
            views: {
                'content': {
                    templateUrl: 'templates/switch/index.html',
                    controller: 'SwitchCtrl'
                }
            }
        })
        .state('xrs_switchCard', {
            url: '/switch/card/:id',
            views: {
                'content': {
                    templateUrl: 'templates/switch/card.html',
                    controller: 'SwitchCardCtrl'
                }
            }
        })
        .state('xrs_switchCardPost', {
            url: '/switch/post/:id',
            views: {
                'content': {
                    templateUrl: 'templates/switch/post.html',
                    controller: 'SwitchPostCtrl'
                }
            }
        })
        .state('xrs_search', {
            url: '/search',
            views: {
                'content': {
                    templateUrl: 'templates/search/index.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('xrs_OrderDetail', {
            url: '/order/:id/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/detail.html',
                    controller: 'OrderDetailCtrl'
                }
            }
        })
        .state('xrs_trash', {
            url: '/trash/:id',
            views: {
                'content': {
                    templateUrl: 'templates/user/trash.html',
                    controller: 'OrderTrashCtrl'
                }
            }
        })
        .state('xrs_signking', {
            url: '/sign/king',
            views: {
                'content': {
                    templateUrl: 'templates/sign/king.html',
                    controller: 'SignKingCtrl'
                }
            }
        })
        .state('xrs_expand', {
            url: '/expand',
            views: {
                'content': {
                    templateUrl: 'templates/expand/index.html',
                    controller: 'ExpandCtrl'
                }
            }
        })
        .state('xrs_expandking', {
            url: '/expand/king',
            views: {
                'content': {
                    templateUrl: 'templates/expand/king.html',
                    controller: 'ExpandKingCtrl'
                }
            }
        })
        .state('xrs_square', {
            url: '/square',
            views: {
                'content': {
                    templateUrl: 'templates/square/index.html',
                    controller: 'SquareCtrl'
                }
            }
        })
        .state('xrs_squarepost', {
            url: '/squarepost',
            views: {
                'content': {
                    templateUrl: 'templates/square/post.html',
                    controller: 'SquarePostCtrl'
                }
            }
        })
        .state('xrs_squaredetail', {
            url: '/squaretheme/:id/:from',
            views: {
                'content': {
                    templateUrl: 'templates/square/theme.html',
                    controller: 'SquareThemeCtrl'
                }
            }
        })
        .state('xrs_reply', {
            url: '/square/:id/reply',
            views: {
                'content': {
                    templateUrl: 'templates/square/reply.html',
                    controller: 'SquareReplyCtrl'
                }
            }
        })
        .state('xrs_userWish', {
            url: '/user/wish',
            views: {
                'content': {
                    templateUrl: 'templates/user/info/wish.html',
                    controller: 'UserViewCtrl'
                }
            }
        })
        .state('xrs_report', {
            url: '/report/:from/:id',
            views: {
                'content': {
                    templateUrl: 'templates/square/report.html',
                    controller: 'ReportCtrl'
                }
            }
        })





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
]).run(['$ionicPlatform', '$location', '$ionicHistory', function($ionicPlatform, $location, $ionicHistory) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $ionicPlatform.registerBackButtonAction(function(e){
        e.preventDefault();
        var currentPage = $location().path();  
        alert(currentPage);
        if (currentPage == '/home' || currentPage == '/message' || currentPage == '/joint' || currentPage == '/user') {
            //退出应用程序
             ionic.Platform.exitApp();
        } else {
            if (window.cordova.plugins.Keyboard.isVisible) {
                //隐藏键盘
                window.cordova.plugins.Keyboard.close();
            } else {
                $ionicHistory.goBack();
            }
        }
    });
}]);


// angular.module('xinrenshe.error', []).factory('$exceptionHandler', function() {
//     return function(exception, cause) {
//         exception.message += ' (caused by "' + cause + '")';
//         console.log(exception.message);
//         alert(exception.message);
//     };
// });