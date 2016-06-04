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
        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $ionicConfigProvider.views.forwardCache(false);

        $stateProvider
        .state('tab', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html',
            controller: 'TabCtrl'
        })
        .state('tab.home', {
            url: '/home',
            views: {
                'tab-home': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('tab.banner', {
            url: '/banner',
            views: {
                'tab-home': {
                    templateUrl: 'templates/banner/index.html',
                    controller: 'BannerCtrl'
                }
            }
        })
        .state('tab.message', {
            url: '/message',
            views: {
                'tab-message': {
                    templateUrl: 'templates/message/index.html',
                    controller: 'MessageCtrl'
                }
            }
        })
        .state('tab.messagedetail', {
            url: '/message/:id',
            views: {
                'tab-message': {
                    templateUrl: 'templates/message/message.html',
                    controller: 'MessageDetCtrl'
                }
            }
        })
        .state('tab.feedback', {
            url: '/feedback',
            views: {
                'tab-home': {
                    templateUrl: 'templates/feedback/index.html',
                    controller: 'FeedbackCtrl'
                }
            }
        })
        .state('tab.login', {
            url: '/user/login',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/account/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('tab.userLevel', {
            url: '/user/level',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/info/level.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('tab.signup', {
            url: '/user/signup',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/account/signup.html',
                    controller: 'SignupCtrl'
                }
            }
        })
        .state('tab.forgetpwd', {
            url: '/user/forgetpwd',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/account/forgetpwd.html',
                    controller: 'ForgetpwdCtrl'
                }
            }
        })
        .state('tab.user', {
            url: '/user',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/index.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('tab.userView', {
            url: '/user/view/:id',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/view.html',
                    controller: 'UserViewCtrl'
                }
            }
        })
        .state('tab.settingUserinfo', {
            url: '/setting/userinfo',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/setting/userinfo.html',
                    controller: 'SetUserInfoCtrl'
                }
            }
        })
        .state('tab.settingAddress', {
            url: '/setting/address',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/setting/address.html',
                    controller: 'SetAddressCtrl'
                }
            }
        })
        .state('tab.updateAddress', {
            url: '/my/address/add/:type',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/setting/address.html',
                    controller: 'UpdateAddressCtrl'
                }
            }
        })
        .state('tab.citySetting', {
            url: '/city/setting/type/:type',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        })
        .state('tab.citySettingId', {
            url: '/city/setting/:areaId',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/city/setting.html',
                    controller: 'CitySettingCtrl'
                }
            }
        })
        .state('tab.sendtip', {
            url: '/card/sendtip',
            views: {
                'tab-home': {
                    templateUrl: 'templates/card/sendtip.html',
                    controller: 'SendtipCtrl'
                }
            }
        })
        .state('tab.mySending', {
            url: '/my/sending',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/card/sending.html',
                    controller: 'MySendingCtrl'
                }
            }
        })
        .state('tab.myUserinfo', {
            url: '/my/userinfo',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/userinfo.html',
                    controller: 'MyUserInfoCtrl'
                }
            }
        })
        .state('tab.myReceiving', {
            url: '/my/receiving',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/card/receiving.html',
                    controller: 'MyReceivingCtrl'
                }
            }
        })
        .state('tab.myAddress', {
            url: '/my/address',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/info/addresslist.html',
                    controller: 'MyAddressListCtrl'
                }
            }
        })
        .state('tab.joint', {
            url: '/joint',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/index.html',
                    controller: 'JointHomeCtrl'
                }
            }
        })
        .state('tab.corporation', {
            url: '/joint/corporation/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/corporation.html',
                    controller: 'CorporationCtrl'
                }
            }
        })
        .state('tab.jointManageAssociator', {
            url: '/joint/manage/associator/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/manage/associator.html',
                    controller: 'JointManageAssociatorCtrl'
                }
            }
        })
        .state('tab.manageReleaseActivity', {
            url: '/joint/manage/releaseActivity/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/manage/releaseActivity.html',
                    controller: 'JointManagereleaseActivityCtrl'
                }
            }
        })
        .state('tab.jointManageCadgeList', {
            url: '/joint/manage/cadgeList/:corporationId/:activityId',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/manage/cadgeList.html',
                    controller: 'JointManageCadgeListCtrl'
                }
            }
        })
        .state('tab.activity', {
            url: '/joint/activity/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/activity/index.html',
                    controller: 'JointActivityCtrl'
                }
            }
        })
        .state('tab.activityQuestion', {
            url: '/joint/activity/:id/question',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/activity/question.html',
                    controller: 'JointActivityQuestionCtrl'
                }
            }
        })
        .state('tab.activityMember', {
            url: '/joint/activity/:id/member',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/activity/memberlist.html',
                    controller: 'ActivityMemberCtrl'
                }
            }
        })
        .state('tab.activityMembercard', {
            url: '/joint/activity/:id/membercard',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/activity/membercard.html',
                    controller: 'MemberCardCtrl'
                }
            }
        })
        .state('tab.activityJoinMember', {
            url: '/joint/activity/:id/joinmember/:show',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/activity/joinuserlist.html',
                    controller: 'JoinUserListCtrl'
                }
            }
        })
        .state('tab.myCorporationList', {
            url: '/joint/manage/myCorporation',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/manage/mycorporationList.html',
                    controller: 'myCorporationCtrl'
                }
            }
        })
        .state('tab.corporationNotice', {
            url: '/joint/manage/notice/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/manage/notice.html',
                    controller: 'CorporationNoticeCtrl'
                }
            }
        })
        .state('tab.corporationEdit', {
            url: '/corporation/profile/edit/:id',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/edit/profile.html',
                    controller: 'CorporationEditCtrl'
                }
            }
        })
        .state('tab.corporationCreate', {
            url: '/corporation/create',
            views: {
                'tab-home': {
                    templateUrl: 'templates/joint/edit/create.html',
                    controller: 'CorporationCreateCtrl'
                }
            }
        })
        .state('tab.writer', {
            url: '/writer',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/writer/index.html',
                    controller: 'WriterCtrl'
                }
            }
        })
        .state('tab.tips', {
            url: '/tips/:type',
            views: {
                'tab-home': {
                    templateUrl: 'templates/user/writer/list.html',
                    controller: 'TipsListCtrl'
                }
            }
        })
        .state('tab.writerTips', {
            url: '/tipsdetail/:id/:type',
            views: {
                'tab-home': {
                    templateUrl: 'templates/user/writer/tips.html',
                    controller: 'TipsCtrl'
                }
            }
        })
        .state('tab.sign', {
            url: '/sign',
            views: {
                'tab-home': {
                    templateUrl: 'templates/sign/index.html',
                    controller: 'SignCtrl'
                }
            }
        })
        .state('tab.Setting', {
            url: '/setting',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/setting/index.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('tab.about', {
            url: '/setting/about',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/setting/about.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('tab.SettingSend', {
            url: '/setting/send',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/setting/send.html',
                    controller: 'SettingSendCtrl'
                }
            }
        })
        .state('tab.switchPhotos', {
            url: '/switch/photos/:type',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/switch/photos.html',
                    controller: 'SwitchPhotosCtrl'
                }
            }
        })
        .state('tab.switchUpload', {
            url: '/switch/upload',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/switch/upload.html',
                    controller: 'SwitchUploadCtrl'
                }
            }
        })
        .state('tab.switchIndex', {
            url: '/switch',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/switch/index.html',
                    controller: 'SwitchCtrl'
                }
            }
        })
        .state('tab.switchCard', {
            url: '/switch/card/:id',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/switch/card.html',
                    controller: 'SwitchCardCtrl'
                }
            }
        })
        .state('tab.switchCardPost', {
            url: '/switch/post/:id',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/switch/post.html',
                    controller: 'SwitchPostCtrl'
                }
            }
        })
        .state('tab.search', {
            url: '/search',
            views: {
                'tab-home': {
                    templateUrl: 'templates/search/index.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('tab.OrderDetail', {
            url: '/order/:id/:type',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/detail.html',
                    controller: 'OrderDetailCtrl'
                }
            }
        })
        .state('tab.trash', {
            url: '/trash/:id',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/trash.html',
                    controller: 'OrderTrashCtrl'
                }
            }
        })
        .state('tab.signking', {
            url: '/sign/king',
            views: {
                'tab-home': {
                    templateUrl: 'templates/sign/king.html',
                    controller: 'SignKingCtrl'
                }
            }
        })
        .state('tab.expand', {
            url: '/expand',
            views: {
                'tab-home': {
                    templateUrl: 'templates/expand/index.html',
                    controller: 'ExpandCtrl'
                }
            }
        })
        .state('tab.expandking', {
            url: '/expand/king',
            views: {
                'tab-home': {
                    templateUrl: 'templates/expand/king.html',
                    controller: 'ExpandKingCtrl'
                }
            }
        })
        .state('tab.square', {
            url: '/square',
            views: {
                'tab-square': {
                    templateUrl: 'templates/square/index.html',
                    controller: 'SquareCtrl'
                }
            }
        })
        .state('tab.squarepost', {
            url: '/squarepost',
            views: {
                'tab-square': {
                    templateUrl: 'templates/square/post.html',
                    controller: 'SquarePostCtrl'
                }
            }
        })
        .state('tab.squaredetail', {
            url: '/squaretheme/:id/:from',
            views: {
                'tab-square': {
                    templateUrl: 'templates/square/theme.html',
                    controller: 'SquareThemeCtrl'
                }
            }
        })
        .state('tab.reply', {
            url: '/square/:id/reply',
            views: {
                'tab-square': {
                    templateUrl: 'templates/square/reply.html',
                    controller: 'SquareReplyCtrl'
                }
            }
        })
        .state('tab.userWish', {
            url: '/user/wish',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/user/info/wish.html',
                    controller: 'UserViewCtrl'
                }
            }
        })
        .state('tab.report', {
            url: '/report/:from/:id',
            views: {
                'tab-mine': {
                    templateUrl: 'templates/square/report.html',
                    controller: 'ReportCtrl'
                }
            }
        })





        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');

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