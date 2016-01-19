// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires' 
angular.module('zjubme', ['ionic','zjubme.services', 'zjubme.directives', 'zjubme.controllers','ngCordova','ionic-timepicker','monospaced.qrcode'])

.run(function($ionicPlatform, extraInfo, jpushService, $state, Storage, $location, $ionicHistory, $ionicPopup) {
  $ionicPlatform.ready(function() {

    var isSignIN=Storage.get("isSignIN");
    if(isSignIN=='YES'){
      $state.go('tab.tasklist');
    }

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    //双击退出应用
    $ionicPlatform.registerBackButtonAction(function (e) {

        function showConfirm() {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>退出应用?</strong>',
                template: '你确定要退出应用吗?',
                okText: '退出',
                cancelText: '取消'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    ionic.Platform.exitApp();
                } else {
                    // Don't close
                }
            });
        }

        //判断处于哪个页面时双击退出
        if ($location.path() == '/tab/tasklist' ) {
            showConfirm();
        } else if ($ionicHistory.backView() ) {
            $ionicHistory.goBack();
        } else {
            // This is the last page: Show confirmation popup
            showConfirm();
        }
        e.preventDefault();
        return false;
    }, 101);


    //获取移动平台信息
    window.localStorage['DeviceType'] = ionic.Platform.platform(); //获取平台 android/ios
    window.localStorage['TerminalName']=ionic.Platform.device().model; //获取手机型号 iPhone、三星
    window.localStorage['DeviceClientHeight']=document.documentElement.clientHeight;
    // console.log(extraInfo.DeviceParams('DeviceClientHeight'));

    //启动极光推送服务
    document.addEventListener('jpush.openNotification', onOpenNotification, false); //监听打开推送消息事件
    //document.addEventListener('jpush.receiveNotification', onreceiveNotification, false); //监听接受推送消息事件
    window.plugins.jPushPlugin.init();
    window.plugins.jPushPlugin.setDebugMode(true);
  });

  window.onerror = function(msg, url, line) {  
   var idx = url.lastIndexOf("/");  
   if(idx > -1) {  
    url = url.substring(idx+1);  
   }  
   alert("ERROR in " + url + " (line #" + line + "): " + msg);  
   return false;  
  };
  
  function onOpenNotification(){
    var Content;
    var alertContent;
    var title;
    var SenderID;
    if(device.platform == "Android"){
        alertContent = window.plugins.jPushPlugin.openNotification.alert;
        Content=window.plugins.jPushPlugin.openNotification.extras;
        angular.forEach(Content,function(value,key){
          if (key=="cn.jpush.android.EXTRA")
          {
            title = value.type;
            SenderID = value.SenderID;
          }
        }) 
        
    }else{
        alertContent   = event.aps.alert;
        Content = event.aps.extras;
        angular.forEach(Content,function(value,key){
          if (key=="cn.jpush.android.EXTRA")
          {
            title = value.type;
            SenderID = value.SenderID;
          }
        }) 
    }
    if (title.length > 0)//indexOf('来自')
    {
      //Storage.set('HealthCoachID', SenderID);
      //$state.go('tab.chats.contactList');//targetGraph
      window.location.href = "#/tab/chats/contactList";

    }
    // alert("open Notificaiton:"+alertContent);
    //$state.go('coach.i');
  }// function end


})

// --------路由, url模式设置----------------
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  //注册与登录
  $stateProvider
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/login/signin.html',
      controller: 'SignInCtrl'
    })   
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      templateUrl: 'partials/login/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      templateUrl: 'partials/login/setPassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      url:'/userdetail',
      templateUrl:'partials/login/userDetail.html',
      controller:'userdetailCtrl'
    });

  //主界面
  $stateProvider
    .state('tab', {
      abstract: true,
      url: '/tab',
      templateUrl: 'partials/tabs/tabs.html',
      controller:'SlidePageCtrl'
    })
     .state('tab.tasklist', {
      url: '/tasklist',
      views: {
        'tab-tasks': {
          templateUrl: 'partials/tabs/index.task.tasklist.html',
         controller: 'tasklistcontroller'
        }
      }
    })
    .state('tab.task',{
      url:"/task",
      abstract:true,
      views:{
        'tab-tasks':{
          template:'<ion-nav-view/>'
        }
      }
    })
     //任务列表跳转
    .state('tab.task.tl',{
      url:"/:tl",
        templateUrl:function($stateParams)
        {
          console.log("$stateParams.tl is "+$stateParams.tl);
          switch($stateParams.tl)
          {
            //case 'tasklist':return "partials/tabs/index.task.tasklist.html";break;
            //case 'healtheducation':return "partials/tabs/index.task.healtheducation.html";break;
            case 'bpm':return "partials/tabs/index.task.bpm.html";break;
            case 'temperature':return "partials/tabs/index.task.temperature.html";break;
            case 'bloodglucose':return "partials/tabs/index.task.bloodglucose.html";break;
            case 'measureweight':return "partials/tabs/index.task.measureweight.html";break;
            case 'riskinfo':return "partials/tabs/index.task.riskinfo.html";break;
            case 'riskinfodetail':return "partials/tabs/index.task.riskinfodetail.html";break;
            default:return "partials/tabs/index.task.taskdetail.html";break;
          }
        },
        controllerProvider:function($stateParams)
        {
          switch($stateParams.tl)
          {
            case 'tasklist':return 'tasklistcontroller';break;
            //case 'healtheducation':return "healtheducationcontroller";break;
            case 'bpm':return "bpmcontroller";break;
            case 'temperature':return "temperaturecontroller";break;
            case 'bloodglucose':return "bloodglucosecontroller";break;
            case 'measureweight':return "measureweightcontroller";break;
            case 'riskinfo':return "NewRiskCtrl";break;
            case 'riskinfodetail':return "RiskDtlCtrl";break;
            default:return 'taskdetailcontroller';break;
          }
        }
    })  
    .state('tab.targetGraph', {
        url: '/targetGraph',
        views: {
          'tab-target': {
            templateUrl: 'partials/tabs/tab.target.graph.html',
            controller: 'graphcontroller'
          }

        }, onEnter:function(){
         //if(window.localStorage.getItem("ss")=="1"){
          //console.log("a");
          //window.location.reload(true);
         //}
        }
    })
    .state('tab.recordList', {
        url: '/recordList',
        views: {
          'tab-target': {
            templateUrl: 'partials/tabs/tab.target.recordList.html',
            controller: 'recordListcontroller'
          }
        }
    })
    .state('tab.calendar', {
        url: '/calendar',
        views: {
          'tab-target': {
            templateUrl: 'partials/catalog/catalog.calendar.html',
            controller: 'calendarcontroller'
          }
        }
    })
.state('tab.compliance', {
    url: '/compliance',
    views: {
      'tab-target': {
        templateUrl: 'partials/tabs/tab.target.compliance.html',
        controller: 'compliancecontroller'
      }
    }
})
.state('tab.chats', {
      url: '/chats',
      abstract: true,
      views:{
        'tab-chats':{
          template:'<ion-nav-view/>'
        }
      }
})
.state('tab.chats.r', {
    url: '/:tt',
    templateUrl: function ($stateParams){

      if($stateParams.tt=='contactList')
      {
        return 'partials/tabs/contactList.html';
        
      }
      else if(($stateParams.tt=='System') || ($stateParams.tt=='User'))
      {
        return 'partials/tabs/Notification.html';
       
      } 
      else if(($stateParams.tt=='NotificationDetail'))
      {
        return 'partials/tabs/notificationDetail.html';
       
      } 
      else
      {
        return 'partials/tabs/chat-detail.html';
       
      }      
    },
   controllerProvider: function($stateParams) {
      if($stateParams.tt=='contactList')
      {
        return 'contactListCtrl';
      }
      else if(($stateParams.tt=='System') || ($stateParams.tt=='User'))
      {
        return 'NotificationCtrl';
      } 
      else if($stateParams.tt=='NotificationDetail')
      {
        return 'NotificationDetailCtrl';
      } 
      else
      {
        return 'ChatDetailCtrl';
      }
  }
  })
    .state('healthCoach', {
      url: '/healthCoach',
      abstract: true,
      template:'<ion-nav-view/>'
    })
    .state('healthCoach.r', {
        url: '/:tt',   
          templateUrl: function ($stateParams){
            if($stateParams.tt=='healthCoachList') return 'partials/healthCoach/healthCoachList.html';
            else if($stateParams.tt=='commentList') return 'partials/healthCoach/commentList.html';
            else if($stateParams.tt=='setComment') return 'partials/healthCoach/setComment.html';
            else return 'partials/healthCoach/healthCoachInfo.html';   
          },
          controllerProvider: function($stateParams) {
            if($stateParams.tt=='healthCoachList') return 'HealthCoachListCtrl';
            else if($stateParams.tt=='commentList') return 'CommentListCtrl';
            else if($stateParams.tt=='setComment') return 'SetCommentCtrl';
            else return 'HealthCoachInfoCtrl';
          }      
  });

//目录
 $stateProvider
    .state('catalog',{
      abstract:true,
      url:"/catalog",
      template:'<ion-nav-view/>',
      controller:'SlidePageCtrl'
    })
    .state('catalog.ct',{
      url:"/:id",
      templateUrl:function($stateParams)
      {
        //console.log("$stateParams. is "+$stateParams.id);
        // return "partials/index.task.measureweight.html";
        return "partials/catalog/catalog."+$stateParams.id+".html";
      },
      controllerProvider:function($stateParams)
      {
        return $stateParams.id + 'controller';
      }
    });

  $urlRouterProvider.otherwise('/signin');
})
// --------不同平台的相关设置----------------
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(3);
  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
  $ionicConfigProvider.form.checkbox('circle');
});
