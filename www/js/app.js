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
        // $ionicConfigProvider.backButton.previousTitleText(false);
        // $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.backButton.icon('ion-ios-arrow-back');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.swipeBackEnabled(false);

        $stateProvider.state('app_home', {
            url: '/home',
            views: {
                'content': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('app_banner', {
            url: '/banner',
            views: {
                'content': {
                    templateUrl: 'templates/banner/index.html',
                    controller: 'BannerCtrl'
                }
            }
        })
        .state('app_message', {
            url: '/messagesx',
            views: {
                'content': {
                    templateUrl: 'templates/message/index.html',
                    controller: 'MessageCtrl'
                }
            }
        })
        .state('app_messagedetail', {
            url: '/message/:id',
            views: {
                'content': {
                    templateUrl: 'templates/message/message.html',
                    controller: 'MessageDetCtrl'
                }
            }
        })
        .state('app_feedback', {
            url: '/feedback',
            views: {
                'content': {
                    templateUrl: 'templates/feedback/index.html',
                    controller: 'FeedbackCtrl'
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
        })
        .state('app_forgetpwd', {
            url: '/user/forgetpwd',
            views: {
                'content': {
                    templateUrl: 'templates/user/forgetpwd.html',
                    controller: 'ForgetpwdCtrl'
                }
            }
        })
        .state('app_user', {
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

        .state('activity_question', {
            url: '/joint/activity/:id/question',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/question.html',
                    controller: 'JointActivityQuestionCtrl'
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
        })

        .state('activity_membercard', {
            url: '/joint/activity/:id/membercard',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/membercard.html',
                    controller: 'MemberCardCtrl'
                }
            }
        })

        .state('activity_join_member', {
            url: '/joint/activity/:id/joinmember/:show',
            views: {
                'content': {
                    templateUrl: 'templates/joint/activity/joinuserlist.html',
                    controller: 'JoinUserListCtrl'
                }
            }
        })

        .state('my_corporation_list', {
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

        .state('corporation_create', {
            url: '/corporation/create',
            views: {
                'content': {
                    templateUrl: 'templates/joint/edit/create.html',
                    controller: 'CorporationCreateCtrl'
                }
            }
        })

        .state('app_me', {
            url: '/user/view/:id',
            views: {
                'content': {
                    templateUrl: 'templates/user/view.html',
                    controller: 'UserViewCtrl'
                }
            }
        })

        .state('app_writer', {
            url: '/writer',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/index.html',
                    controller: 'WriterCtrl'
                }
            }
        })
        .state('app_', {
            url: '/tips/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/list.html',
                    controller: 'TipsListCtrl'
                }
            }
        })
        .state('app_writer_tips', {
            url: '/tipsdetail/:id/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/writer/tips.html',
                    controller: 'TipsCtrl'
                }
            }
        })

        .state('app_sign', {
            url: '/sign',
            views: {
                'content': {
                    templateUrl: 'templates/sign/index.html',
                    controller: 'SignCtrl'
                }
            }
        })
        .state('app_setting', {
            url: '/setting',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/index.html',
                    controller: 'UserCtrl'
                }
            }
        })
        .state('app_about', {
            url: '/setting/about',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/about.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('app_setting_send', {
            url: '/setting/send',
            views: {
                'content': {
                    templateUrl: 'templates/user/setting/send.html',
                    controller: 'SettingSendCtrl'
                }
            }
        })
        .state('switch_photos', {
            url: '/switch/photos/:type',
            views: {
                'content': {
                    templateUrl: 'templates/switch/photos.html',
                    controller: 'SwitchPhotosCtrl'
                }
            }
        })
        .state('switch_upload', {
            url: '/switch/upload',
            views: {
                'content': {
                    templateUrl: 'templates/switch/upload.html',
                    controller: 'SwitchUploadCtrl'
                }
            }
        })
        .state('switch_index', {
            url: '/switch',
            views: {
                'content': {
                    templateUrl: 'templates/switch/index.html',
                    controller: 'SwitchCtrl'
                }
            }
        })
        .state('switch_card', {
            url: '/switch/card/:id',
            views: {
                'content': {
                    templateUrl: 'templates/switch/card.html',
                    controller: 'SwitchCardCtrl'
                }
            }
        })
        .state('switch_card_post', {
            url: '/switch/post/:id',
            views: {
                'content': {
                    templateUrl: 'templates/switch/post.html',
                    controller: 'SwitchPostCtrl'
                }
            }
        })
        .state('app_search', {
            url: '/search',
            views: {
                'content': {
                    templateUrl: 'templates/search/index.html',
                    controller: 'SearchCtrl'
                }
            }
        })
        .state('app_orderdetail', {
            url: '/order/:id/:type',
            views: {
                'content': {
                    templateUrl: 'templates/user/detail.html',
                    controller: 'OrderDetailCtrl'
                }
            }
        })
        .state('app_trash', {
            url: '/trash/:id',
            views: {
                'content': {
                    templateUrl: 'templates/user/trash.html',
                    controller: 'OrderTrashCtrl'
                }
            }
        })

        .state('app_signking', {
            url: '/sign/king/:uid',
            views: {
                'content': {
                    templateUrl: 'templates/sign/king.html',
                    controller: 'SignKingCtrl'
                }
            }
        })

        .state('app_expand', {
            url: '/expand',
            views: {
                'content': {
                    templateUrl: 'templates/expand/index.html',
                    controller: 'ExpandCtrl'
                }
            }
        })

        .state('app_square', {
            url: '/square',
            views: {
                'content': {
                    templateUrl: 'templates/square/index.html',
                    controller: 'SquareCtrl'
                }
            }
        })

        .state('app_squarepost', {
            url: '/squarepost',
            views: {
                'content': {
                    templateUrl: 'templates/square/post.html',
                    controller: 'SquarePostCtrl'
                }
            }
        })

        .state('app_squaredetail', {
            url: '/squaretheme/:id',
            views: {
                'content': {
                    templateUrl: 'templates/square/theme.html',
                    controller: 'SquareThemeCtrl'
                }
            }
        })

        .state('app_reply', {
            url: '/square/:id/reply',
            views: {
                'content': {
                    templateUrl: 'templates/square/reply.html',
                    controller: 'SquareReplyCtrl'
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