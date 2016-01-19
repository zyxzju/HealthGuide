
angular.module('zjubme.controllers', ['ionic','ngResource','zjubme.services', 'zjubme.directives','zjubme.filters', 'ja.qr','ionic-datepicker', ])//,'ngRoute'

// 初装或升级App的介绍页面控制器  /暂时不用
.controller('intro', ['$scope', 'Storage', function ($scope, Storage) {
  // Storage.set('initState', 'simple.homepage');
  Storage.set('myAppVersion', myAppVersion);
}])

// --------登录注册、设置修改密码-熊佳臻----------------
//登录
.controller('SignInCtrl', ['$scope','$state','$http', '$timeout','$window', 'userservice','Storage','loading','$ionicHistory', 'jpushService',function($scope, $state,$http, $timeout ,$window, userservice, Storage,loading,$ionicHistory,jpushService) {
  $scope.barwidth="width:0%";
  if(Storage.get('USERNAME')!=null){
    $scope.logOn={username:Storage.get('USERNAME'),password:""};
  }else{
    $scope.logOn={username:"",password:""};
  }
  $scope.signIn = function(logOn) {  
    $scope.logStatus='';
    if((logOn.username!="") && (logOn.password!="")){ 
      var cont=0;
      var saveUID = function(){
        var UIDpromise=userservice.UID('PhoneNo',logOn.username);
        UIDpromise.then(function(data){
          loading.loadingBarFinish($scope);
          if(data.result!=null){
            Storage.set('USERNAME', logOn.username);
            // Storage.set('PASSWORD', logOn.password);
            Storage.set('isSignIN','YES');
            $scope.logStatus="登录成功";
            Storage.set('UID', data.result);
            $timeout(function(){$state.go('tab.tasklist');} , 500);
            //启动极光推送服务
            //window.plugins.jPushPlugin.init();
            //window.plugins.jPushPlugin.setDebugMode(true);
            window.plugins.jPushPlugin.setAlias(data.result);
          }
        },function(data){
          if(cont++<5){
            saveUID();
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus="网络错误"
          }          
        });
      }
      
      var UIDpromise_connection=userservice.UID('PhoneNo',logOn.username);
      UIDpromise_connection.then(function(){

        var promise=userservice.userLogOn('PhoneNo' ,logOn.username,logOn.password,'Patient');
        if(promise==7){
          $scope.logStatus='手机号验证失败！';
          return;
        }
        loading.loadingBarStart($scope);
        promise.then(function(data){
          if(data.result.substr(0,4)=="登陆成功"){
            $scope.logStatus=data.result.substr(0,4);
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();

            // loading.loadingBarFinish($scope);
            Storage.set('TOKEN', data.result.substr(12));
            // Storage.set('USERNAME', logOn.username);
            saveUID();
            // $timeout(function(){$state.go('tab.tasklist');} , 1000);
          }
        },function(data){
          loading.loadingBarFinish($scope);
          if(data.data==null && data.status==0){
            $scope.logStatus='网络错误！';
            return;          
          }  
          if(data.status==404){
            $scope.logStatus='连接服务器失败！';
            return;          
          }        
          if(data.data.result=='暂未激活'){
            // loading.loadingBarFinish($scope);
            //Storage.set('TOKEN', data.result.substr(12));
            // Storage.set('USERNAME', logOn.username);
            saveUID();
            // $timeout(function(){$state.go('tab.tasklist');} , 1000);  
            // $scope.logStatus='登陆成功';  
            return;  
          }      
          $scope.logStatus=data.data.result;
        });
      });
    }else{
      $scope.logStatus="请输入完整信息！";
    }
  }

  $scope.toRegister = function(){
    $state.go('phonevalid');   
    Storage.set('setPasswordState','register');
  }
  $scope.toReset = function(){
    $state.go('phonevalid');
    Storage.set('setPasswordState','reset');
  } 
}])

//注册 
.controller('userdetailCtrl',['$scope','$state','$cordovaDatePicker','$rootScope','$timeout' ,'userservice','Storage','loading','Users','Data' ,function($scope,$state,$cordovaDatePicker,$rootScope,$timeout,userservice,Storage,loading,Users,Data){
  $scope.barwidth="width:0%";
  $scope.userName='';
  $scope.birthday="点击设置";
  var upload={
    "UserId": "",
    "UserName": "",
    "Birthday": "",
    "Gender": "",
    "IDNo": "sample string 5",
    "DoctorId":"",
    "InsuranceType":"",
    "InvalidFlag": 0,
    "piUserId": "sample string 7",
    "piTerminalName": "sample string 8",
    "piTerminalIP": "sample string 9",
    "piDeviceType": 2
  }
  var datePickerCallback = function (val) {
    if (typeof(val) === 'undefined') {
      console.log('No date selected');
    } else {
      $scope.datepickerObject.inputDate=val;
      var dd=val.getDate();
      var mm=val.getMonth()+1;
      var yyyy=val.getFullYear();
      var d=dd<10?('0'+String(dd)):String(dd);
      var m=mm<10?('0'+String(mm)):String(mm);
      upload.Birthday=parseInt(yyyy+m+d);
      var birthday=yyyy+'/'+m+'/'+d;
      $scope.birthday=birthday;
    }
  };
  var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  var weekDaysList=["日","一","二","三","四","五","六"];
  $scope.datepickerObject = {
    titleLabel: '出生日期',  //Optional
    todayLabel: '今天',  //Optional
    closeLabel: '取消',  //Optional
    setLabel: '设置',  //Optional
    setButtonType : 'button-assertive',  //Optional
    todayButtonType : 'button-assertive',  //Optional
    closeButtonType : 'button-assertive',  //Optional
    inputDate: new Date(),    //Optional
    mondayFirst: false,    //Optional
    //disabledDates: disabledDates, //Optional
    weekDaysList: weekDaysList,   //Optional
    monthList: monthList, //Optional
    templateType: 'popup', //Optional
    showTodayButton: 'false', //Optional
    modalHeaderColor: 'bar-positive', //Optional
    modalFooterColor: 'bar-positive', //Optional
    from: new Date(1900, 1, 1),   //Optional
    to: new Date(),    //Optional
    callback: function (val) {    //Mandatory
      datePickerCallback(val);
    }
  };  
  $scope.infoSetup = function(userName,userGender){
    $scope.logStatus='';
    if(userName!='' && userGender!='' && $scope.birthday!='' && $scope.birthday!='点击设置'){
      upload.UserName=userName;
      upload.Gender=userGender == '男'?1:2;
      var saveUID = function(){
        UIDpromise=userservice.UID('PhoneNo',$rootScope.userId)
        .then(function(data){
          if(data.result!=null){
            Storage.set('UID', data.result);
            Storage.set('USERNAME', $rootScope.userId);
            upload.UserId=Storage.get('UID');

            // Users.myTrial(upload).then(function(data){
            //   $scope.logStatus=data.result;
            //   if(data.result=="数据插入成功"){
            //     $scope.logStatus='注册成功！';
            //     $timeout(function(){$state.go('upload');} , 500);
            //   }
            // });  
            
            Data.Users.SetPatBasicInfo( upload, function (success, headers) {
              loading.loadingBarFinish($scope);
              $scope.logStatus=success.result;
              if(success.result=="数据插入成功"){
                $scope.logStatus='注册成功！';
                $timeout(function(){$state.go('tab.tasklist');} , 500);
              }
            },function(){
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误！';              
            });
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='系统错误！';
          }
        },function(data){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误！';
        });
      }
      // $rootScope.NAME=userName;
      // $rootScope.GENDER=userGender;
      // $rootScope.BIRTHDAY=$scope.birthday;
      loading.loadingBarStart($scope);
      userservice.userRegister("PhoneNo",$rootScope.userId, userName, $rootScope.password,"Patient")
      .then(function(data){
        // loading.loadingBarFinish($scope);
        console.log($rootScope.userId,$rootScope.password);
        userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'Patient').then(function(data){
          if(data.result.substr(0,4)=="登陆成功"){
            Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }
        },function(data){
          if(data.data.result=='暂未激活'){            
            //Storage.set('TOKEN', data.result.substr(12));
            saveUID();
          }else{
            loading.loadingBarFinish($scope);
            $scope.logStatus='网络错误！';
          }          
        });
      },function(data){
        if(data.data.result=='同一用户名的同一角色已经存在'){
          userservice.userLogOn('PhoneNo' ,$rootScope.userId,$rootScope.password,'Patient')
          .then(function(data){
            if(data.result.substr(0,4)=="登陆成功"){
              Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }
          },function(data){
            if(data.data.result=='暂未激活'){
              //Storage.set('TOKEN', data.result.substr(12));
              saveUID();
            }else{
              loading.loadingBarFinish($scope);
              $scope.logStatus='网络错误！';
            }
          });
        }else if(data.data==null && data.status==0){
          loading.loadingBarFinish($scope);
          $scope.logStatus='网络错误！';          
        }else{
          loading.loadingBarFinish($scope);
          $scope.logStatus=data.data.result;          
        }        
        // loading.loadingBarFinish($scope);
        // if(data.data==null && data.status==0){
        //   $scope.logStatus='连接超时！';
        //   return;          
        // }     
        // $scope.logStatus=data.data.result;
      });
    }else{
      $scope.logStatus='请输入完整信息！';
    }
  }
}])

//设置密码   153-$state.go('tab.tasks')
.controller('setPasswordCtrl', ['$scope','$state','$rootScope' ,'$timeout' , 'userservice','Storage','loading' ,function($scope,$state,$rootScope,$timeout,userservice,Storage,loading) {
  $scope.barwidth="width:0%";
  var setPassState=Storage.get('setPasswordState');
  if(setPassState=='reset'){
    $scope.headerText="重置密码";
    $scope.buttonText="确认修改";
  }else{
    $scope.headerText="设置密码";
    $scope.buttonText="下一步";
  }
  $scope.setPassword={newPass:"" , confirm:""};
  $scope.resetPassword=function(setPassword){
    $scope.logStatus='';
    if((setPassword.newPass!="") && (setPassword.confirm!="")){
      if(setPassword.newPass == setPassword.confirm){
        if(setPassState=='register'){
          $rootScope.password=setPassword.newPass;
          $state.go('userdetail');
        }else{
          var userId=Storage.get('UID');
          loading.loadingBarStart($scope);
          var promise=userservice.changePassword('#*bme319*#',setPassword.newPass,userId);
          promise.then(function(data,status){
            loading.loadingBarFinish($scope);
            $scope.logStatus=data.result;
            if(data.result=='修改密码成功'){
              $timeout(function(){$state.go('signin');} , 500);
            }
          },function(data){
            loading.loadingBarFinish($scope);
            if(data.data==null && data.status==0){
              $scope.logStatus='连接超时！';
              return;          
            }
            $scope.logStatus=data.data.result;
          });
        }
      }else{
        $scope.logStatus="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus="请输入两遍新密码"
    }
  }
}])

//修改密码  192-$state.go('tab.tasks');  $scope.nvGoback李山加的，不明
.controller('changepasswordcontroller',['$scope','$state','$timeout', '$ionicHistory', 'userservice','Storage','loading' , function($scope , $state,$timeout, $ionicHistory, userservice,Storage,loading){
  $scope.barwidth="width:0%";
  $scope.ishide=true;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    $scope.logStatus1='';
    loading.loadingBarStart($scope);
    var promiseold=userservice.userLogOn('PhoneNo',Storage.get('USERNAME'),change.oldPassword,'Patient');
    promiseold.then(function(data){
      loading.loadingBarFinish($scope);
      $scope.logStatus1='验证成功';
      //$scope.ishide=false;
      $timeout(function(){$scope.ishide=false;} , 500);
    },function(data){
      loading.loadingBarFinish($scope);
      if(data.data==null && data.status==0){
        $scope.logStatus='连接超时！';
        return;          
      }      
      if(data.data.result=="暂未激活")
      {
        $scope.logStatus1='验证成功';
        $timeout(function(){$scope.ishide=false;} , 500);
        return;
       } 
      $scope.logStatus1='密码错误';
    });
  }

  $scope.gotoChange = function(change){
    $scope.logStatus2='';
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        loading.loadingBarStart($scope);
        userservice.changePassword(change.oldPassword,change.newPassword,Storage.get('UID'))
        .then(function(data){
          loading.loadingBarFinish($scope);
          $scope.logStatus2='修改成功';
          $timeout(function(){$scope.change={originalPassword:"",newPassword:"",confirmPassword:""};
          $state.go('tab.tasklist');
          $scope.ishide=true;
          } , 500);
        },function(data){
          loading.loadingBarFinish($scope);
          if(data.data==null && data.status==0){
            $scope.logStatus='连接超时！';
            return;          
          }
          $scope.logStatus2=data.data.result;
        })
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }
}])

.controller('phonevalidCtrl', ['$scope','$state','$interval','$rootScope', 'Storage', 'userservice','loading' , function($scope, $state,$interval,$rootScope,Storage,userservice,loading) {
  $scope.barwidth="width:0%";
  var setPassState=Storage.get('setPasswordState');
  $scope.veriusername="" 
  $scope.verifyCode="";
  $scope.veritext="获取验证码";
  $scope.isable=false;
  $scope.gotoReset = function(veriusername,verifyCode){
    $scope.logStatus='';
    if(veriusername!=0 && verifyCode!=0 && veriusername!='' && verifyCode!=''){
      loading.loadingBarStart($scope);
      $rootScope.userId=veriusername;
      userservice.checkverification(veriusername,'verification',verifyCode)
      .then(function(data){
        loading.loadingBarFinish($scope);
        if(data.result==1){
          $scope.logStatus='验证成功！';
          $state.go('setpassword');
        }else{
          $scope.logStatus='验证码错误！';
        }        
      },function(data){
        loading.loadingBarFinish($scope);
        if(data.data==null && data.status==0){
          $scope.logStatus='连接超时！';
          return;          
        }
        $scope.logStatus='验证失败！';
    });
    }else{
      $scope.logStatus="请输入完整信息！"
    }
  }
   
  $scope.getcode=function(veriusername){
    $scope.logStatus='';
    var operation=Storage.get('setPasswordState');
    var sendSMS = function(){  
      userservice.sendSMS(veriusername,'verification')
      .then(function(data){
        loading.loadingBarFinish($scope);
        unablebutton();        
        if(data[0]=='您'){
          $scope.logStatus="您的验证码已发送，重新获取请稍后";
        }else{
          $scope.logStatus='验证码发送成功！';
        }
      },function(data){
        loading.loadingBarFinish($scope);
        if(data.data==null && data.status==0){
          $scope.logStatus='连接超时！';
          return;          
        }
        $scope.logStatus='验证码发送失败！';
      }) 
    }; 
    var unablebutton = function(){      
     //验证码BUTTON效果
      $scope.isable=true;
      $scope.veritext="180S再次发送"; 
      var time = 179;
      var timer;
      timer = $interval(function(){
        if(time==0){
          $interval.cancel(timer);
          timer=undefined;        
          $scope.veritext="获取验证码";       
          $scope.isable=false;
        }else{
          $scope.veritext=time+"S再次发送";
          time--;
        }
      },1000);
    }
    var promise=userservice.UID('PhoneNo',veriusername);
    if(promise==7){
      $scope.logStatus='手机号验证失败！';
      return;
    }
    loading.loadingBarStart($scope);
    promise.then(function(data){
      if(data.result!=null){
        if(operation=='reset'){
          Storage.set('UID',data.result);
          sendSMS();//发送验证码
        }else{
          userservice.Roles(data.result).then(function(data){
            loading.loadingBarFinish($scope);
            var flag=0;
            for(var i in data){
              if(data[i]=='Patient'){
                $scope.logStatus='该账户已进行过注册！';
                flag=1;
                break;
              }
            }
            if(flag==0){
              sendSMS();
            }
          },function(){
            loading.loadingBarFinish($scope);
            $scope.logStatus='网络出错了，请再次发送';
          })
          // loading.loadingBarFinish($scope);
          // $scope.logStatus='该账户已进行过注册！';
        }
      }else{
        if(operation=='reset'){
          loading.loadingBarFinish($scope);
          Storage.set('UID','');
          $scope.logStatus="用户不存在";
        }else{
          sendSMS();
        }
      }
    },function(data){
      loading.loadingBarFinish($scope);
      if(data.data==null && data.status==0){
          $scope.logStatus='连接超时！';
          return;          
      }
      $scope.logStatus='网络出错了，请再次发送';
    })
  }
}])
// --------任务列表-马志彬----------------
//侧边提醒
.controller('SlidePageCtrl', ['$scope', '$ionicHistory', '$timeout', '$ionicModal', '$ionicSideMenuDelegate', '$http','NotificationService','$ionicListDelegate','PlanInfo','extraInfo','$ionicPopup', '$state', 'Storage','Data', 
   function($scope, $ionicHistory, $timeout, $ionicModal, $ionicSideMenuDelegate, $http,NotificationService,$ionicListDelegate,PlanInfo,extraInfo, $ionicPopup,$state,Storage, Data) {
      
      //我的专员未读消息
       // $scope.unreadMessageSum='';
      
       // $scope.$on('transfer.unreadMessageSum', function(event, data) {  
       //    $scope.unreadMessageSum = data;  
       //  });  

      //获取一些普遍的基本信息，公用
      Storage.set('PatientName','暂无姓名');
      var urltemp1 = Storage.get("UID") + '/BasicInfo';
      Data.Users.GetPatBasicInfo({route:urltemp1}, function (success, headers) {
          Storage.set('PatientName',success.UserName);
          $scope.qr_GenderText= success.GenderText;
           }, function (err) {

      });

      ////获取任务列表数据
      // $http.get('testdata/tasklist.json').success(function(data){
      //  $scope.tasklist = data;
      // })
      $scope.tmzb = 'test';
      ///获取菜单栏列表数据
      $http.get('data/catalog.json').success(function(data){
        $scope.catalog = data;
      })
      $scope.toggleProjects = function() {
        $ionicSideMenuDelegate.toggleLeft();
      };
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      }
      $scope.lastviewtitle = $ionicHistory.backTitle();
      ////////////设置提醒/////////////
      $scope.checkalert = '';
      $scope.alerttitlecheck = function(c)
      {
         // console.log('title change');
         if(c) $scope.checkalert='required';
         else  $scope.checkalert='';
         // console.log($scope.checkalert);
      }
      $ionicModal.fromTemplateUrl('partials/other/addalert.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function(i) {
        console.log(i);
        $ionicListDelegate.closeOptionButtons();
        $scope.modal.show(); 
        $scope.alertcontent=
        {
          title:'',
          detail:'',
          time:new Date(),
          hour:(new Date()).getHours(),
          minute:(new Date()).getMinutes(),
          index:0,
          ID:parseInt(Math.random()*1000+1)
        };
        if(i!=undefined)
        {
          $scope.alertcontent=i;
          $scope.flag='update';
        }
        $scope.timePickerObject.inputEpochTime=((new Date()).getHours() * 60 * 60+(new Date()).getMinutes()*60);
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      $scope.alertlist = NotificationService.get();
      $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60+(new Date()).getMinutes()*60),  //Optional
        step: 1,  //Optional
        format: 24,  //Optional
        titleLabel: '选择时间',  //Optional
        setLabel: '确认',  //Optional
        closeLabel: '取消',  //Optional
        setButtonType: 'button-positive',  //Optional
        closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
          timePickerCallback(val);
        }
      };
      function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
        } else {
          var SelectedTime = new Date(val * 1000);
          $scope.alertcontent.time.setHours(SelectedTime.getUTCHours());
          $scope.alertcontent.time.setMinutes(SelectedTime.getUTCMinutes());
          $scope.alertcontent.time.setSeconds(0);
          $scope.alertcontent.hour = SelectedTime.getUTCHours();
          $scope.alertcontent.minute = SelectedTime.getUTCMinutes();
          console.log('Selected epoch is : ', val, 'and the time is ', SelectedTime.getUTCHours(), ':', SelectedTime.getUTCMinutes(), 'in UTC');
        }
      };
      $scope.save = function(c)
      {
        if(c)
        {
          // console.log($scope.flag);
          if($scope.flag=='update')
          {
            $scope.flag='save';
            NotificationService.update($scope.alertcontent);
            $scope.alertlist = NotificationService.get();
            $scope.closeModal();
          }else{
            // console.log('save');
            // console.log($scope.alertcontent);
            NotificationService.save($scope.alertcontent);
            $scope.alertlist = NotificationService.get();
            // console.log($scope.alertlist);
            $scope.closeModal();
          }
        }else $scope.checkalert = 'required';
      }
      $scope.remove = function(index)
      {
        console.log(index);
        NotificationService.remove(index);
        $scope.alertlist = NotificationService.get();
      }
       /////////////////////////
      //退出账号

       $scope.signoutConfirm = function(a){
        $scope.toggleProjects();
        if(a=="logout"){
          var myPopup = $ionicPopup.show({
            template: '<center>确定要退出登录吗?</center>',
            title: '退出',
            //subTitle: '2',
            scope: $scope,
            buttons: [
              { text: '取消',
                type: 'button-small',
                onTap: function(e) {
                  
                }
              },
              {
                text: '<b>确定</b>',
                type: 'button-small button-positive ',
                onTap: function(e) {
                    $state.go('signin');
                    Storage.rm('TOKEN');
                    var USERNAME=Storage.get("USERNAME");
                    Storage.clear();
                     Storage.set("USERNAME",USERNAME);
                     $timeout(function () {
                     $ionicHistory.clearCache();
                     $ionicHistory.clearHistory();
                    }, 30);
                    //$ionicPopup.hide();
                }
              }
            ]
          });
        }
        }
}])

//任务列表
.controller('tasklistcontroller',['$scope','$ionicModal','$timeout','$http', 'TaskInfo','extraInfo','Storage','$ionicLoading','PlanInfo',
  function($scope,$ionicModal,$timeout,$http,TaskInfo,extraInfo,Storage,$ionicLoading,PlanInfo) {
  //extraInfo.PlanNo().PlanNo'PLAN20151029'
  //$scope.getexecutingplan();
  var data={"ParentCode":"T","PlanNo":"","Date":"NOW","PatientId":Storage.get("UID")};
  var getep = {
    PatientId:Storage.get("UID"),
    PlanNo:'NULL',
    Module:'M1',
    Status:'3'
  }
  var getexecutingplan = function()
  {
    PlanInfo.GetExecutingPlan(getep).then(function(s){
      // console.log(s[0]);
      if((s!=null)&&(s!=""))
      {
        $scope.unTaskList=false;
        extraInfo.PlanNo(s[0]);
        data.PlanNo=s[0].PlanNo;
        gettasklist();
      }
      else
      {
        console.log("getexecutingplan err");
        $scope.unTaskList=true;
        $scope.$broadcast('scroll.refreshComplete');
        showrefreshresult('刷新成功');
      }
    },function(e){
      console.log(e);
      $scope.unTaskList=true;
      $scope.$broadcast('scroll.refreshComplete');
      showrefreshresult('刷新失败');

    })
  }
  var gettasklist = function()
  {
    TaskInfo.GetTasklist(data).then(function(s){
      // console.log(s);
      $scope.$broadcast('scroll.refreshComplete');
      $scope.tasklist = s;
      showrefreshresult('刷新成功');
      // console.log(data.PlanNo);
      TaskInfo.GetDTaskByPlanNo(data.PlanNo).then(function(s){
        // console.log(s);
        $scope.detaillist = extraInfo.TransformChangeMarks(s);
        window.localStorage['taskchangedetaillist']=angular.toJson($scope.detaillist);
        // console.log($scope.detaillist);
        console.log($scope.tasklist);
        extraInfo.InsertChangeMarks2tasklist($scope.tasklist,$scope.detaillist);
        console.log($scope.tasklist);
      },function(e){
        console.log(e);
        $scope.detaillist = [];
        $scope.detaillist[0] =new Array();//新增
        $scope.detaillist[1] =new Array();//删除
        $scope.detaillist[2] =new Array();//修改
      });
    },function(e){
      console.log(e);
      $scope.$broadcast('scroll.refreshComplete');
      showrefreshresult('刷新失败');
    });
  }
  var showrefreshresult = function(refreshstatus)
  {
    $ionicLoading.show({
      template: refreshstatus,
      noBackdrop: true,
      duration: 700
    });
  }
  getexecutingplan();
  $scope.doRefresh = function() {
    getexecutingplan();
  }
    // $http.get('testdata/tasklist.json').success(function(data){
    //  $scope.tasklist = TaskInfo.insertstate(data);
    // })
  $ionicModal.fromTemplateUrl('partials/other/taskchangedetail.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.showtaskchangedetail = function()
  {
    $scope.modal.show();
  }
  $scope.closetaskchangedetail = function()
  {
    $scope.modal.hide();
  }
  $scope.testlist = [{t:'100圈到200全'},{t:'100圈到300全'},{t:'100圈到400全'},{t:'100圈到500全'}];
}])

//任务详细
.controller('taskdetailcontroller',['$scope','$ionicModal','$stateParams','$state','extraInfo', '$cordovaInAppBrowser', 'TaskInfo','$ionicListDelegate','Storage','$ionicLoading', '$ionicPopup',
function($scope,$ionicModal,$stateParams,$state,extraInfo,$cordovaInAppBrowser,TaskInfo,$ionicListDelegate,Storage,$ionicLoading, $ionicPopup) {
  var data={"ParentCode":$stateParams.tl,"PlanNo":extraInfo.PlanNo().PlanNo,"Date":"NOW","PatientId":Storage.get("UID")};//
  var detail={"ParentCode":'',"PlanNo":extraInfo.PlanNo().PlanNo,"Date":"NOW","PatientId":Storage.get("UID")};//extraInfo.PlanNo().PlanNo
  $scope.pagetitle = extraInfo.TransformCode2Name($stateParams.tl);
  ////////////////////////////////////
  $ionicModal.fromTemplateUrl('helist.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openHeModal = function(code) {//healtheducation modal
    detail.ParentCode=code;
    // console.log(code);
    TaskInfo.GetTasklist(detail).then(function(s){
      console.log(s);
      $scope.helist=s;
    },function(e){
      console.log(e);
    });
    $scope.modal.show();
  };
  $scope.closeHeModal = function() {
    $scope.modal.hide();
  };
  $scope.openUrl = function(url)
  {
    var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
    };
    $cordovaInAppBrowser.open(extraInfo.TransformUrl(url), '_blank', options);
  }
  ////////////////////////////////
  ionic.DomUtil.ready(function(){
    getlist();
  })
  $scope.doRefresh = function() {
    data={"ParentCode":$stateParams.tl,"PlanNo":extraInfo.PlanNo().PlanNo,"Date":"NOW","PatientId":Storage.get("UID")};
    detail={"ParentCode":'',"PlanNo":extraInfo.PlanNo().PlanNo,"Date":"NOW","PatientId":Storage.get("UID")};
    getlist();
    var refreshstatus='刷新失败'
    extraInfo.refreshstatus()=='刷新成功'?refreshstatus='刷新成功':refreshstatus;
    $ionicLoading.show({
      template: refreshstatus,
      noBackdrop: true,
      duration: 700
    });
  }
  var getlist = function()
  {
    TaskInfo.GetTasklist(data).then(function(s){
      // console.log(s);
      $scope.$broadcast('scroll.refreshComplete');
      $scope.taskdetaillist = extraInfo.TransformInstruction(TaskInfo.insertstate(s));
      console.log($scope.taskdetaillist);
      $scope.detaillist=angular.fromJson(window.localStorage['taskchangedetaillist']);
      $scope.taskdetaillist=extraInfo.InsertChangeMarks2tasklist($scope.taskdetaillist,$scope.detaillist);
      console.log($scope.taskdetaillist);
      var i=0;
      if(s.length)getdetail(i);
      extraInfo.refreshstatus('刷新成功');
    },function(e){
      console.log(e);
      $scope.$broadcast('scroll.refreshComplete');
      extraInfo.refreshstatus('刷新失败');
    });
  }
  var getdetail = function(index)
  {
    detail.ParentCode = $scope.taskdetaillist[index].Code;
    TaskInfo.GetTasklist(detail).then(function(s){
      // console.log(detail.ParentCode);
      if(s.length&&($scope.taskdetaillist[index].ParentCode=='TB0000'||$scope.taskdetaillist[index].ParentCode=='TC0000'))
        $scope.taskdetaillist[index].js=s[0].Name;
      index++;
      if(index==$scope.taskdetaillist.length)return;
      getdetail(index);
    },function(e){
      console.log(e);
    });
  }
  $scope.done = function(index)
  {
    console.log(index);
    $ionicListDelegate.closeOptionButtons();
    console.log( $scope.taskdetaillist[index]);
    TaskInfo.done($scope.taskdetaillist[index],data.PlanNo).then(function(s){
      console.log(s);
      $scope.taskdetaillist[index].Status='1';
    })
  }
  $scope.showmore = function(s)
  {
    // alert(s);
    $ionicPopup.alert({
      title: '详细',
      template: s,
      okText:'关闭'
    }).then(
      function(res) {
        //
    });
  }
  $scope.openaddalertmodal = function(a)
  {
    var content = {
      title:'任务提醒：'+a.Name,
      detail:'记得完成相应任务!',
      time:new Date(),
      hour:(new Date()).getHours(),
      minute:(new Date()).getMinutes(),
      index:0,
      ID:parseInt(Math.random()*1000+1)
    };
    // console.log(a);
    if(a.Instruction!='')
      content.detail=a.Instruction
    $scope.openModal(content);
  }
}])

//血压
.controller('bpmcontroller',['$scope',  '$timeout', '$cordovaBluetoothSerial', '$ionicLoading', '$cordovaBLE', 'BloodPressureMeasure', '$ionicModal', 'VitalInfo','extraInfo','$rootScope',
  function($scope,  $timeout, $cordovaBluetoothSerial, $ionicLoading, $cordovaBLE, BloodPressureMeasure, $ionicModal, VitalInfo,extraInfo,$rootScope){
    console.log('bpmcontroller');
    var total = document.documentElement.clientHeight;
    console.log(total);
    var bpm_chartdiv = 3*total/5;
    document.getElementById("bpm_chartdiv").style.height=bpm_chartdiv+"px";
    document.getElementById("inputdiv").style.height=1*total/5+"px";
    var bpc=BloodPressureMeasure.BloodPressureChart();
    var chart = AmCharts.makeChart("bpm_chartdiv",bpc,500);
    $scope.device_a='';
    $scope.device_c='';
    $scope.showscanicon=false;
    $scope.btstatus='正在准备设备，请稍等。。。';
    var highbp=VitalInfo.InsertServerData();
      highbp.Unit='mmHg';
      highbp.ItemType='Bloodpressure';
      highbp.ItemCode='Bloodpressure_1';
    var lowbp=VitalInfo.InsertServerData();
      lowbp.Unit='mmHg';
      lowbp.ItemType='Bloodpressure';
      lowbp.ItemCode='Bloodpressure_2';
    var jn=VitalInfo.InsertServerData();
      jn.Unit='次/分';
      jn.ItemType='Pulserate';
      jn.ItemCode='Pulserate_1';
      ///////////////////////////////////////////
    var handhighbp=VitalInfo.InsertServerData();
      handhighbp.Unit='mmHg';
      handhighbp.ItemType='Bloodpressure';
      handhighbp.ItemCode='Bloodpressure_1';
    var handlowbp=VitalInfo.InsertServerData();
      handlowbp.Unit='mmHg';
      handlowbp.ItemType='Bloodpressure';
      handlowbp.ItemCode='Bloodpressure_2';
    var handjn=VitalInfo.InsertServerData();
      handjn.Unit='次/分';
      handjn.ItemType='Pulserate';
      handjn.ItemCode='Pulserate_1';
      ////////////////////////////////////
    // var handhighbp,lowbp,jn;
    var btstart=new Uint8Array(9);
    var BPdata=new Uint8Array(30);
    ///////////////////////////////////////////////
    var deviceinputcolor = 'black';
    $scope.handinputbpm={B1:'',B2:'',M:''};
    var buttoniconchange='';
    $scope.handinputbpmchanged = function()
    {
      console.log($scope.handinputbpm);
      validatechart($scope.handinputbpm.B1,$scope.handinputbpm.B2,$scope.handinputbpm.M);
    }
    $scope.bpmslideHasChanged = function(index)
    {
      switch(index)
      {
        case 0:
        {
          console.log('index0');
          clearInterval(buttoniconchange);
        break;}
        case 1:
        {
          console.log('index1');
          // validatechart(13,13,13);
          initbpm();
          buttoniconchange = setInterval(function(){
            // console.log(deviceinputcolor);
            deviceinputcolor=='black'?deviceinputcolor='red':deviceinputcolor='black';
            document.getElementById('startbutton').style.color=deviceinputcolor;
          },1000);
        break;}
      }
    }
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams)
    {
      // console.log(fromState);
      // console.log(fromParams);
      if(fromParams.tl=='bpm')
      {
        clearInterval(buttoniconchange);
      }
    });
    ////////////////////////////////////////////////
    var initbpm = function()
    {
      setInterval(function()
      {
        $cordovaBluetoothSerial.available().then(//有多少位数据
          function(numBytes){
            if(numBytes==8)
            {
              for(var i=0;i<numBytes;i++)
              {
                readbloothbuffer(i,1);
              }
              clearInterval(buttoniconchange);
              document.getElementById('startbutton').style.color='red';
              $scope.btstatus='已准备好设备，请点击"测量"按钮开始测量';
            }else if(numBytes==30)
            {
              getbpmdata();
              $timeout(function(){
                $scope.btstatus='测量完毕';
                $scope.DisConnect();
                $ionicLoading.hide();
              },500)
            }
          },
          function(){$scope.btstatus='设备故障，请点击手动设置';}
        );
      },1000);
      ConnectedList();
      $cordovaBluetoothSerial.isConnected().then(
        function(){},
        function(){
          $cordovaBluetoothSerial.connect('8C:DE:52:99:26:23').then(
            function(){
              $timeout(function(){
                StartMeasure();
              },1000)
            },
            function(error){
              $scope.btstatus='设备连接失败，请确保设备正常，点此手动设置';
            }
          );
        }
      );
    };
    $scope.isBleEnable = function()
    {
      //document.addEventListener('deviceready', function () {
      $cordovaBluetoothSerial.isEnabled().then(
        function(success){
          alert('bluetooth is available');
        },
        function(error){
          alert('err! bluetooth is not available')
        }
      );
     // }, false);
    }
    $scope.EnableBle = function()
    {
      $cordovaBluetoothSerial.enable().then(
        function(success){
          alert('enable bluetooth');
        },
        function(error){
          alert('err! enable bluetooth failure')
        }
      );
    }
    $scope.ScanDevices = function()
    {
      $scope.showscanicon=true;
      $cordovaBluetoothSerial.discoverUnpaired().then(
        function(success){
          $scope.device_a=success;
          $scope.showscanicon=false;
        },
        function(error){
          alert('err! Can not Scan Devices')
        }
      );
    }
    $scope.ConnectDevice = function(address)
    {
      alert('click connect button'+address);
      $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br/>正在连接蓝牙设备，请稍等。。。',
        noBackdrop: false,
        duration: 10000,
        hideOnStateChange: true
      });
      $cordovaBluetoothSerial.connect(address).then(
        function(){
          $ionicLoading.hide();
          $scope.ConnectedList();
        },
        function(error){
          $ionicLoading.hide();
          alert('connect failure');
        }
      );
    }
    var ConnectedList = function()
    {
      $cordovaBluetoothSerial.list().then(
        function(devices) {
            $scope.device_c=devices;
        },
        function(){
            alert("Err");
      });
    }
    $scope.DisConnect = function()
    {
      $cordovaBluetoothSerial.disconnect(
        function(){
          alert("disconnect");
        },
        function(err){
          alert(err);
        }
      );
    }
    $scope.IsConnected = function()
    {
      alert("click IsConnected");
      $cordovaBluetoothSerial.isConnected().then(
        function(){
          alert("IsConnected");
        },
        function(){
          alert("Connectting...");
        }
      );
    }
    $scope.ReadBTbuffer = function()
    {
      $cordovaBluetoothSerial.available().then(
        function(numBytes){
          alert("There are " + numBytes + " available to read.");
          for(var i=0;i<numBytes;i++)
          {
            readbloothbuffer(i);
          }
        },
        function(){}
      );
    }
    var readbloothbuffer = function(i,flag)
    {
      if(flag==1)
      {
        $cordovaBluetoothSerial.read().then(
          function(data){
            (data==null)?btstart[i]=0x00:btstart[i]=data.charCodeAt(0);
            console.log(data);
          },
          function(){}
        );
      }else if(flag==2)
      {
        $cordovaBluetoothSerial.read().then(
          function(data){
            (data==null)?BPdata[i]=0x00:BPdata[i]=data.charCodeAt(0);
            console.log(data);
          },
          function(){}
        );
      }
    }
    var StartMeasure = function()
    {
      $cordovaBluetoothSerial.isConnected().then(//首先判断是否连接了蓝牙设备
        function(){
          $cordovaBluetoothSerial.clear().then(//如果连接了设备，先清除蓝牙缓存，随后发送探查指令，等待设备返回序列号等信息
            function(){
              $cordovaBluetoothSerial.write(BloodPressureMeasure.FindCommand()).then(//发送探查指令
                function()
                {},
                function(){
                  $scope.btstatus='设备故障，请点击手动设置';
                  alert('write data error');
                }
              );
            },function(){$scope.btstatus='设备故障，请点击手动设置';}
          );
        },
        function(){
          $scope.btstatus='设备故障，请点击手动设置';
        }
      );
    }
    $scope.realstart = function()
    {
      if($scope.btstatus == '正在准备设备，请稍等。。。')
      {
        alert('正在准备设备，请稍等。。。')
      }else if($scope.btstatus == '正在测量，请稍等。。。')
      {
        alert('正在测量，请稍等。。。');
      }else{
        $scope.btstatus='正在测量，请稍等。。。';
        $ionicLoading.show({
          template: '<ion-spinner icon="lines" class="spinner-calm"></ion-spinner><br/>正在测量，请稍等。。。',
          noBackdrop: false,
          duration: 100000,
          hideOnStateChange: true
        });
        var errcheck=setInterval(function()
        {
          $cordovaBluetoothSerial.isConnected().then(
            function(){
            },
            function(){
              $ionicLoading.hide();
              if($scope.btstatus=='正在测量，请稍等。。。')
              {
                alert('设备异常');
                $scope.btstatus='设备异常';
                clearInterval(errcheck);
              }else{
                //alert('clearInterval');
                clearInterval(errcheck);
              }
            }
          );
        },1000);
        $cordovaBluetoothSerial.write(BloodPressureMeasure.StartCommand(btstart)).then(//发送开始测量指令
          function(){
            //正在测量
          },
          function(){}
        );
      }
    }
    var getbpmdata = function()
    {
      $cordovaBluetoothSerial.available().then(//有多少位数据
        function(numBytes){
          for(var i=0;i<numBytes;i++)
          {
            readbloothbuffer(i,2);
          }
        },
        function(){}
      );
      $timeout(function() {
        escape(BPdata[16])!=0?highbp.Value=escape(BPdata[16]):highbp='';
        escape(BPdata[17])!=0?lowbp.Value=escape(BPdata[17]):lowbp='';
        escape(BPdata[19])!=0?jn.Value=escape(BPdata[19]):jn='';
        if(highbp.Value>=200)highbp.Value=0;
        validatechart(highbp.Value,lowbp.Value,jn.Value);
      }, 500);
    }
    var validatechart=function(hbp,lbp,jn)
    {
      console.log(chart.dataProvider[0].points);
      if(hbp>50)chart.dataProvider[0].points=hbp;
      if(lbp>50)chart.dataProvider[1].points=lbp;
      if(jn>20)chart.dataProvider[2].points=jn;
      if(hbp>50&&lbp>50&&jn>20)chart.graphs[0].labelText="[[points]][[Unit]]";
      chart.allLabels[0].text=BloodPressureMeasure.BPConclusion(highbp.Value,lowbp.Value);
      chart.validateData();
    };    
    $scope.save = function(){
      if($scope.btstatus=='测量完毕')
      {
         VitalInfo.PostPatientVitalSigns(highbp).then(function(r){
            VitalInfo.PostPatientVitalSigns(lowbp).then(function(r){
              VitalInfo.PostPatientVitalSigns(jn).then(function(r){
                $ionicLoading.show({
                  template: '保存成功',
                  noBackdrop: true,
                  duration: 700
                });
                // alert('savesuccess');
                // extraInfo.refreshflag('set','graphRefresh');
                // extraInfo.refreshflag('set','recordlistrefresh');
                // refreshflag
              },function(e){alert('e.result');});
            },function(e){alert('e.result');});
         },function(e){alert('e.result');}); 
      }
    };
    $scope.savehandinput = function(){
      handhighbp.Value = $scope.handinputbpm.B1;
      handlowbp.Value = $scope.handinputbpm.B2;
      handjn.Value = $scope.handinputbpm.M;
      console.log(handhighbp);
      VitalInfo.PostPatientVitalSigns(handhighbp).then(function(r){
        VitalInfo.PostPatientVitalSigns(handlowbp).then(function(r){
          VitalInfo.PostPatientVitalSigns(handjn).then(function(r){
            $ionicLoading.show({
              template: '保存成功',
              noBackdrop: true,
              duration: 700
            });
            // alert('savesuccess');
            // extraInfo.refreshflag('set','graphRefresh');
            // extraInfo.refreshflag('set','recordlistrefresh');
            // refreshflag
          },function(e){alert('e1.result');});
        },function(e){alert('e2.result');});
      },function(e){alert('e3.result');});
    };
    $ionicModal.fromTemplateUrl('setbt.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      if($scope.btstatus == '正在测量，请稍等。。。')
      {
        alert('正在测量，请稍等。。。');
      }else{
        $scope.modal.show();
      }      
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
}])
//温度
.controller('temperaturecontroller',['$scope',  '$http','Storage','VitalInfo','$rootScope','extraInfo','$ionicLoading','$ionicPopup',
  function($scope,  $http, Storage, VitalInfo, $rootScope,extraInfo,$ionicLoading,$ionicPopup){
  
   console.log('temperaturecontroller');
   var UserId =Storage.get("UID");
   var result={};
   $scope.label="必填";
   $scope.status="请输入";
   $scope.Temp={Temperature:"",result:""};
   $http.get('data/Teresult.json').success(function(data){
        $scope.result = data;
        console.log(result);
      });
  $scope.check = function(c)
  {
    chart.dataProvider[0].bullet=$scope.Temp.Temperature;
    chart.validateData();
    $scope.fever();
    if(!c)$scope.twcheck='';
    else $scope.twcheck='required';
  }

   //画体温计
    var chart = AmCharts.makeChart("temperaturechartdiv", {
    "type": "serial",
    "theme": "light",
    "autoMargins": false,
    "marginTop": 30,
    "marginLeft": 80,
    "marginBottom": 30,
    "marginRight": 50,
    "dataProvider": [{
        "category": "体温测量",
        "limit": 39,
        "full": 100,
        "bullet": 37,
        "minimum":35
    }],
    "valueAxes": [{
        "maximum": 42,
        "minimum":35,
        "stackType": "regular",
        "gridAlpha": 0.5,
        "axisAlpha":1 
    }],
    "startDuration": 1,
    "graphs": [{
        "columnWidth": 0.8,
        "lineColor": "#FF0000",
        "lineThickness": 3,
        "noStepRisers": true,
        "stackable": false,
        "type": "step",
        "valueField": "limit"
        },{
        "valueField": "full",
        "showBalloon": false,
        "type": "column",
        "lineAlpha": 0,
        "fillAlphas": 0.7,
        "fillColors": ["#19d228", "#f6d32b","#FFFF00" ,"#fb2316"],
        "gradientOrientation": "vertical",
    }, {
        "clustered": false,
        "columnWidth": 0.3,
        "fillAlphas": 1,
        "lineColor": "#0000FF",
        "stackable": false,
        "type": "column",
        "valueField": "bullet"
    }],
    "rotate": false,
    "columnWidth": 1,
    "categoryField": "category",
    "categoryAxis": {
        "gridAlpha": 0,
        "axisAlpha": 0.5,
        "position": "left"
    }
});

  
  //保存体温值
// var saveTemp = function()
//   {
    // chart.dataProvider[0].bullet=$scope.Temp.Temperature;
    // chart.validateData();
    // fever();
    //console.log(c);
    
      // var save = [{
      //   "UserId": UserId,
      //   "RecordDate": extraInfo.DateTimeNow().fulldate,
      //   "RecordTime": extraInfo.DateTimeNow().fulltime,
      //   "ItemType": "Temperature",
      //   "ItemCode": 'Temperature_1',
      //   "Value": ""+$scope.Temp.Temperature+"",
      //   "Unit": "℃",
      //   "revUserId": "UserId",
      //   "TerminalName": "sample string 9",
      //   "TerminalIP": "sample string 10",
      //   "DeviceType": 11
      // }]
      // VitalInfo.PostPatientVitalSigns(save[0]).then(function(data){
      //   console.log(data);
      //   $ionicLoading.show({
      //       template: '保存成功',
      //       noBackdrop: true,
      //       duration: 700
      //     });
      //   $scope.Temp.Temperature="";
      //   $scope.status="";
      // })
    // else
    // {
    //   $ionicLoading.show({
    //         template: '保存失败',
    //         noBackdrop: true,
    //         duration: 700
    //       });
    //   $scope.Temp.Temperature="";
    //   $scope.status="请重新输入";
    // }
  // }
  //  confirm 对话框
           $scope.showConfirm = function(c) {
             if(c)
             {
               $scope.confirmPopup = $ionicPopup.confirm({
               title: '确认提交?',
               template: '您测的体温是  '+$scope.Temp.Temperature+"℃",
               scope: $scope,
               buttons: [
                  {text: '提交',
                 　onTap: function(e) {
    
                   $scope.save = [{
                      "UserId": UserId,
                      "RecordDate": extraInfo.DateTimeNow().fulldate,
                      "RecordTime": extraInfo.DateTimeNow().fulltime,
                      "ItemType": "Temperature",
                      "ItemCode": 'Temperature_1',
                      "Value": "" +$scope.Temp.Temperature+ "",
                      "Unit": "℃",
                      "revUserId": UserId,
                      "TerminalName": "sample string 9",
                      "TerminalIP": "sample string 10",
                      "DeviceType": 11
                    }]
                    console.log(UserId);
                  VitalInfo.PostPatientVitalSigns($scope.save[0]).then(function(data){
                    $scope.rdata='数据插入成功';
                    console.log(data);
                    $ionicLoading.show({
                        template: '保存成功',
                        noBackdrop: true,
                        duration: 700
                      });
                    $scope.Temp.Temperature="";
                    $scope.status="";
                    $scope.Temp.result="";
                  })
                }
              },
                 {
                   text: '<b>取消</b>',
                   type: 'button-positive',
               }]
             });
           }else 
           {

            $scope.twcheck = 'required';
            $scope.label="必填";
           }
         };
 //根据体温值，给出相应的提示信息
  $scope.fever = function()
  {   
      if($scope.Temp.Temperature>=35 && $scope.Temp.Temperature<=36.2)
        {
          $scope.Temp.result = $scope.result.result4;
        }
      else if($scope.Temp.Temperature>36.2 && $scope.Temp.Temperature<=37.2)
        {
          $scope.Temp.result = $scope.result.result5;
        }
      else if($scope.Temp.Temperature>37.2 && $scope.Temp.Temperature<38.2)
        {
          $scope.Temp.result = $scope.result.result1;
        }
      else if($scope.Temp.Temperature>=38.2 && $scope.Temp.Temperature<39.2)
        {
          $scope.Temp.result =  $scope.result.result2;
        }
      else if( $scope.Temp.Temperature<=42 && $scope.Temp.Temperature>=39.2)
        {
          $scope.Temp.result = $scope.result.result3;
        } 
      else 
      {
        $scope.Temp.result=$scope.result.result6;
      }
  };

}])

.controller('healtheducationcontroller',['$scope', '$cordovaInAppBrowser', '$cordovaMedia', '$http', '$ionicModal',function($scope, $cordovaInAppBrowser, $cordovaMedia, $http, $ionicModal){
  $http.get('testdata/HElist.json').success(function(data){
    // $scope.helist = data;
    // console.log($scope.helist);
  });
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  var options = {
    location: 'no',
    clearcache: 'yes',
    toolbar: 'no'};
  $scope.forunittest=false;
  $scope.play = function(r)
  {
    if(r.Type=='mp3'||r.Type=='mp4')
    {
      console.log('openUrl');
      $scope.modal.show();
      $scope.mediatitle=r.name;
      $scope.mediadescribe=r.describe;
      if($scope.forunittest==false)
      {
        document.getElementById("myVideo").src=r.Url;
        document.getElementById("myVideo").poster=r.poster;
      }
      //$cordovaInAppBrowser.open(url, '_blank', options);
    }else if(r.Type=='jpg')
    {
      console.log('openUrl');
      $cordovaInAppBrowser.open(r.Url, '_blank', options);
    }
     
  }
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
}])

.controller('measureweightcontroller',['$scope','Data','Storage','VitalInfo', 'extraInfo','$ionicLoading','BloodPressureMeasure','$ionicSlideBoxDelegate','$rootScope', '$http',
  function($scope,Data,Storage,VitalInfo,extraInfo,$ionicLoading,BloodPressureMeasure,$ionicSlideBoxDelegate,$rootScope, $http){
  /////////////////////
  var result='';
  $http.get('data/whresult.json').success(function(data){
        result = data;
        console.log(result);
      });
  /////////////////////
  $scope.BMI={weight:0,height:0,BMI:0,result:''};
  $scope.hcheck='';
  $scope.wcheck='';
  $scope.check_h = function(c1,c2)
  {
    $scope.BMI.BMI='';
    if(!c1&&!c2)
    {
      $scope.hcheck='';
      mathbmi();
      setchartValue();
      setchartband();
    }
    else $scope.hcheck='required';
    // console.log($scope.BMI.BMI);
  }
  $scope.check_w = function(c1,c2)
  {
    $scope.BMI.BMI='';
    if(!c1&&!c2)
    {
      $scope.wcheck='';
      mathbmi();
      setchartValue();
    }
    else $scope.wcheck='required';
  }
  // $scope.$on('$viewContentLoading', 
  //   function(event){
  //     console.log('viewContentLoading');
  //     VitalInfo.GetLatestPatientVitalSigns(get[0]).then(function(s){
  //       console.log(s);
  //       $scope.BMI.weight = parseInt(s.result);
  //       VitalInfo.GetLatestPatientVitalSigns(get[1]).then(function(s){
  //         $scope.BMI.height = parseInt(s.result);
  //         console.log(s);
  //       });
  //   });
  // });
  $scope.BMI={};
  var UserId =Storage.get("UID");//'PID201506180013'
  var get = [{
    UserId:UserId,
    ItemType:"Weight",
    ItemCode:"Weight_1"
  },
  {
    UserId:UserId,
    ItemType:"Height",
    ItemCode:"Height_1"
  }]
  VitalInfo.GetLatestPatientVitalSigns(get[0]).then(function(s){
    console.log(s);
    $scope.BMI.weight = parseInt(s.Value);
    VitalInfo.GetLatestPatientVitalSigns(get[1]).then(function(s){
      $scope.BMI.height = parseInt(s.Value);
      setTimeout(function() {mathbmi();setchartband();setchartValue();}, 1000);
      console.log(s);
    });
  });
  var mathbmi = function()
  {
      $scope.BMI.BMI=($scope.BMI.weight/($scope.BMI.height * $scope.BMI.height));
      if($scope.BMI.BMI<0.00185)
        {
          $scope.BMI.result = result.result1;
          document.getElementById('submitwh').style.backgroundColor='gray';
          gaugeChart.arrows[0].color='gray';
        }
      else if($scope.BMI.BMI>=0.00185&&$scope.BMI.BMI<0.002499)
        {
          setTimeout(function() {$scope.BMI.result =  result.result2;console.log($scope.BMI.result);}, 1000);
          
          document.getElementById('submitwh').style.backgroundColor='green';
          gaugeChart.arrows[0].color='green';
        }
      else if($scope.BMI.BMI>=0.0025&&$scope.BMI.BMI<0.0028)
        {
          $scope.BMI.result =  result.result3;
          document.getElementById('submitwh').style.backgroundColor='#E8D502';
          gaugeChart.arrows[0].color='#E8D502';
        }
      else if($scope.BMI.BMI>=0.0028&&$scope.BMI.BMI<0.0032)
        {
          $scope.BMI.result =  result.result4;
          document.getElementById('submitwh').style.backgroundColor='#FF944D';
          gaugeChart.arrows[0].color='#FF944D';
        }
      else if($scope.BMI.BMI>=0.0032)
        {
          $scope.BMI.result =  result.result5;
          document.getElementById('submitwh').style.backgroundColor='red';
          gaugeChart.arrows[0].color='red';
        }
      // console.log($scope.BMI.BMI);
  };
  $scope.saveWH = function(c)
  {
    if(c)
    {
      var save = [{
        "UserId": UserId,
        "RecordDate": extraInfo.DateTimeNow().fulldate,
        "RecordTime": extraInfo.DateTimeNow().fulltime,
        "ItemType": "Weight",
        "ItemCode": 'Weight_1',
        "Value": $scope.BMI.weight,
        "Unit": "kg",
        "revUserId": "UserId",
        "TerminalName": "sample string 9",
        "TerminalIP": "sample string 10",
        "DeviceType": 11
      },
      {
        "UserId": UserId,
        "RecordDate": extraInfo.DateTimeNow().fulldate,
        "RecordTime": extraInfo.DateTimeNow().fulltime,
        "ItemType": "Height",
        "ItemCode": 'Height_1',
        "Value": $scope.BMI.height,
        "Unit": "cm",
        "revUserId": "UserId",
        "TerminalName": "sample string 9",
        "TerminalIP": "sample string 10",
        "DeviceType": 11
      }]
      VitalInfo.PostPatientVitalSigns(save[0]).then(function(s){
        console.log(s);
        VitalInfo.PostPatientVitalSigns(save[1]).then(function(s){
          console.log(s);
          $ionicLoading.show({
            template: '保存成功',
            noBackdrop: true,
            duration: 700
          });
          // alert("保存成功");
        })
      })
    }
  }
  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  }
  $scope.previousSlide = function() {
    $ionicSlideBoxDelegate.previous();
  }
  var mwchartdata = {
    "type": "gauge",
    "theme": "light",
    "axes": [ {
      "axisThickness": 1,
      "axisAlpha": 0.2,
      "tickAlpha": 0.2,
      "valueInterval": 10,
      "bands": [ {
        "color": "gray",
        "endValue": 150,
        "startValue": 0
      }, {
        "color": "green",
        "endValue": 0,
        "startValue": 0
      }, {
        "color": "#E8D502",
        "endValue": 0,
        "innerRadius": "95%",
        "startValue": 0
      }, {
        "color": "#FF944D",
        "endValue": 0,
        "innerRadius": "95%",
        "startValue": 0
      }, {
        "color": "red",
        "endValue": 0,
        "innerRadius": "95%",
        "startValue": 0
      } ],
      "bottomText": "0 km/h",
      "bottomTextYOffset": -20,
      "endValue": 150
    } ],
    "arrows": [ {
        "color":"gray",
        "nailAlpha":1,
        "nailRadius":15
      } ],
    "export": {
      "enabled": true
    },
    "panEventsEnabled":false,
    "autoDisplay":true,
    "marginBottom":0
  }
  var storagemwchartdata = mwchartdata;
  var gaugeChart = AmCharts.makeChart( "mwchart",mwchartdata,500);
  //////////////////////////
  var buttoniconflag = true;
  var buttoniconchange = setInterval( function(){setbuttoniconcolor()}, 1000 );
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams)
  {
    // console.log(fromState);
    // console.log(fromParams);
    if(fromParams.tl=='measureweight')
    {
      clearInterval(buttoniconchange);
    }
  });
  var setbuttoniconcolor = function(){
    if(buttoniconflag)
    {
      document.getElementById("buttonicon").style.color="red";
      buttoniconflag = !buttoniconflag;
    }else
    {
      document.getElementById("buttonicon").style.color="black";
      buttoniconflag = !buttoniconflag;
    }
  }
  $scope.startwhmeasure = function()
  {
    clearInterval(buttoniconchange);
    document.getElementById("buttonicon").style.color="red";
  }
  //////////////////////
  var setchartValue = function() {
    if($scope.BMI.height!=undefined&&$scope.BMI.weight!=undefined)
    {
      if ( gaugeChart ) {
        if ( gaugeChart.arrows ) {
          if ( gaugeChart.arrows[ 0 ] ) {
            if ( gaugeChart.arrows[ 0 ].setValue ) {
              gaugeChart.arrows[ 0 ].setValue( $scope.BMI.weight );
              gaugeChart.axes[ 0 ].setBottomText("BMI:"+($scope.BMI.BMI*10000).toFixed(2)+'\n'+$scope.BMI.height + "cm  "+$scope.BMI.weight + "Kg");
              // console.log(($scope.BMI.BMI*10000).toFixed(2));
            }
          }
        }
      }
    }
  }
  var setchartband = function()
  {
    var band1 = $scope.BMI.height*$scope.BMI.height*0.00185;
    gaugeChart.axes[ 0 ].bands[0].endValue=band1;
    gaugeChart.axes[ 0 ].bands[1].startValue=band1;
    var band2 = $scope.BMI.height*$scope.BMI.height*0.0025;
    gaugeChart.axes[ 0 ].bands[1].endValue=band2;
    gaugeChart.axes[ 0 ].bands[2].startValue=band2;
    var band3 = $scope.BMI.height*$scope.BMI.height*0.0028;
    gaugeChart.axes[ 0 ].bands[2].endValue=band3;
    gaugeChart.axes[ 0 ].bands[3].startValue=band3;
    var band4 = $scope.BMI.height*$scope.BMI.height*0.0032;
    gaugeChart.axes[ 0 ].bands[3].endValue=band4;
    gaugeChart.axes[ 0 ].bands[4].startValue=band4;
    gaugeChart.axes[ 0 ].bands[4].endValue=150;
    gaugeChart.validateNow(true,false);
  }
  var storageBMI = {};
  $scope.slideHasChanged = function(index)
  {
    // console.log(index);
    switch (index)
    {
      case 0:
        $scope.BMI.weight=storageBMI.weight;
        $scope.BMI.height=storageBMI.height;
        $scope.BMI.BMI=storageBMI.BMI;
        $scope.BMI.result=storageBMI.result;
        console.log(storageBMI);
        // mwchartdata=storagemwchartdata;
        mathbmi();
        setchartValue();
        setchartband();
        break;
      case 1:
        document.getElementById('submit2').style.backgroundColor='gray';
        storageBMI.weight=$scope.BMI.weight;
        storageBMI.height=$scope.BMI.height;
        storageBMI.BMI=$scope.BMI.BMI;
        storageBMI.result=$scope.BMI.result;
        console.log(storageBMI);
        $scope.BMI.weight=0;
        $scope.BMI.height=0;
        $scope.BMI.BMI=0;
        $scope.BMI.result='';
        mathbmi();
        setchartValue();
        setchartband();
        mwchartdata.axes[ 0 ].bands[0].endValue=150;
        mwchartdata.axes[ 0 ].bands[1].startValue=0;
        mwchartdata.axes[ 0 ].bands[1].endValue=0;
        mwchartdata.axes[ 0 ].bands[2].startValue=0;
        mwchartdata.axes[ 0 ].bands[2].endValue=0;
        mwchartdata.axes[ 0 ].bands[3].startValue=0;
        mwchartdata.axes[ 0 ].bands[3].endValue=0;
        mwchartdata.axes[ 0 ].bands[4].startValue=0;
        mwchartdata.axes[ 0 ].bands[4].endValue=0;
        mwchartdata.arrows[0].color='gray';
        gaugeChart.validateNow(true,false);
        break;
    }
  }
}])

.controller('bloodglucosecontroller',['$scope','Data','Storage', 'VitalInfo','extraInfo', '$ionicLoading','$rootScope', '$ionicSlideBoxDelegate', '$http','VitalInfo','userservice',
  function($scope,Data,Storage,VitalInfo,extraInfo,$ionicLoading,$rootScope,$ionicSlideBoxDelegate, $http, VitalInfo,userservice){
  console.log('bloodglucosecontroller');
  $scope.bloodglucose={"select":'早餐前',"mvalue":"","tvalue":""};
  $scope.bgcheck='';
  var result={};
  $http.get('data/bgresult.json').success(function(data){
    result = data;
    console.log(result);
  });
  $scope.result = '';
  $scope.check = function(c)
  {
    // console.log('change');
    setchartValue();
    setarrowcolor();
    if(!c)$scope.bgcheck='';
    else $scope.bgcheck='required';
  }
  var value1,value2;
  $scope.getlatestbgvalue = function()
  {
    var param1 = {UserId:window.localStorage['UID'],ItemType:'BloodSugar',ItemCode:'BloodSugar_10'};
    var param2 = {UserId:window.localStorage['UID'],ItemType:'BloodSugar',ItemCode:'BloodSugar_11'};
    VitalInfo.GetLatestPatientVitalSigns(param1).then(function(s){
      console.log(s);
      value1 = s.result;
      VitalInfo.GetLatestPatientVitalSigns(param2).then(function(s){
        console.log(s);
        value2 = s.result;
        // if(value1!=null&&value2 != null)
        // {
          
        // }
        // if(value2 == null)
        //   {
        //     $scope.bloodglucose.mvalue = value2;
        //   }
        // else if(va
        $scope.bloodglucose.mvalue = parseInt(value2);
        setchartValue();
        setarrowcolor();
        clearInterval(buttoniconchange);
        document.getElementById("buttonicon").style.color="red";
      },function(e){
        console.log(e);
      });
    },function(e){
      console.log(e);
    });
  }
  $scope.binddevice = function()
  {
    userservice.BindMeasureDevice(window.localStorage['UID']).then(
      function(s){
        console.log(s);
      },function(e){
        console.log(e);
      })
  }
  $scope.savebloodglucose = function(check)
  {
    if(check)
    {
      var save = {
        "UserId":Storage.get("UID"),
        "RecordDate": extraInfo.DateTimeNow().fulldate,
        "RecordTime": extraInfo.DateTimeNow().fulltime,
        "ItemType": "BloodSugar",
        "ItemCode": extraInfo.TransformBloodglucoseCode($scope.bloodglucose.select),
        "Value": $scope.bloodglucose.mvalue,
        "Unit": "mmol/L",
        "revUserId": Storage.get("UID"),
        "TerminalName": "sample string 9",
        "TerminalIP": "sample string 10",
        "DeviceType": 11
      }
      console.log(save);
      VitalInfo.PostPatientVitalSigns(save).then(function(s){
        console.log(s);
        $ionicLoading.show({
          template: '保存成功',
          noBackdrop: true,
          duration: 700
        });

      },function(e){
        $ionicLoading.show({
          template: '保存失败',
          noBackdrop: true,
          duration: 700
        });
      });
    }else $scope.bgcheck='required';
  }
   var setchartValue = function() 
   {
    var v = $scope.bloodglucose.mvalue; 
    if(v == undefined || v == '')v=0;
    if ( bloodglucosecharts ) {
      if ( bloodglucosecharts.arrows ) {
        if ( bloodglucosecharts.arrows[ 0 ] ) {
          if ( bloodglucosecharts.arrows[ 0 ].setValue ) {
            bloodglucosecharts.arrows[ 0 ].setValue(v);
            bloodglucosecharts.axes[ 0 ].setBottomText(v+" mmol/L");
          }
        }
      }
    }
    
  }
  setchartValue();
  //////////////////////////
  var storagembg = {"select":'早餐前',"mvalue":"","tvalue":""};
  $scope.mbgslideHasChanged = function(index)
  {
    // console.log(storagembg.mvalue);
    switch(index)
    {
      case 0:
          $scope.bloodglucose.mvalue = storagembg.mvalue;
          setchartValue();
          setarrowcolor();
        break;
      case 1:
          storagembg.mvalue = $scope.bloodglucose.mvalue;
          // $scope.bloodglucose.mvalue = 0;
          setchartValue();
          setarrowcolor();
          $scope.getlatestbgvalue();
        break;
    }
  }
  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  }
  $scope.previousSlide = function() {
    $ionicSlideBoxDelegate.previous();
  }
  var buttoniconflag = true;
  var buttoniconchange = setInterval( function(){setbuttoniconcolor()}, 1000 );
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams)
  {
    // console.log(fromState);
    // console.log(fromParams);
    if(fromParams.tl=='bloodglucose')
    {
      clearInterval(buttoniconchange);
    }
  });
  var setbuttoniconcolor = function(){
    if(buttoniconflag)
    {
      document.getElementById("buttonicon").style.color="red";
      buttoniconflag = !buttoniconflag;
    }else
    {
      document.getElementById("buttonicon").style.color="black";
      buttoniconflag = !buttoniconflag;
    }
  }
  $scope.startwhmeasure = function()
  {
    // clearInterval(buttoniconchange);
    document.getElementById("buttonicon").style.color="black";
  }
  //////////////////////
  var lastid = 's1';
  var hournow = new Date().getHours();
  if(hournow>=1&&hournow<8)$scope.selecttimeline
  /////////////////////////////////
  $scope.selecttimeline = function(tl,cid)
  {
    console.log(cid);
    document.getElementById(lastid).style.color="black";
    lastid = cid;
    document.getElementById(cid).style.color="red";
    switch(tl)
    {      
      case '早餐前':
        setchartband(4,8);
        $scope.bloodglucose.select='早餐前';
        break;
      case '早餐后':
        setchartband(6,10);
        $scope.bloodglucose.select='早餐后';
        break;
      case '午餐前':
        setchartband(4,9);
        $scope.bloodglucose.select='午餐前';
        break;
      case '午餐后':
        setchartband(9,13);
        $scope.bloodglucose.select='午餐后';
        break;
      case '晚餐前':
        setchartband(7,10);
        $scope.bloodglucose.select='晚餐前';
        break;
      case '晚餐后':
        setchartband(10,13);
        $scope.bloodglucose.select='晚餐后';
        break;
      case '凌晨':
        setchartband(5,7);
        $scope.bloodglucose.select='凌晨';
        break;
      case '睡前':
        setchartband(6,9);
        $scope.bloodglucose.select='睡前';
        break;
    }
    setarrowcolor();
  }
  //////////////////////
  setTimeout(function(){
    var hournow = new Date().getHours();
    if(hournow>=1&&hournow<8)$scope.selecttimeline('早餐前','s1');
    else if(hournow>=8&&hournow<9)$scope.selecttimeline('早餐后','s2');
    else if(hournow>=9&&hournow<12)$scope.selecttimeline('午餐前','s3');
    else if(hournow>=12&&hournow<15)$scope.selecttimeline('午餐后','s4');
    else if(hournow>=15&&hournow<19)$scope.selecttimeline('晚餐前','s5');
    else if(hournow>=19&&hournow<21)$scope.selecttimeline('晚餐后','s6');
    else if(hournow>=21&&hournow<23)$scope.selecttimeline('睡前','s8');
    else if(hournow>=23||hournow<1)$scope.selecttimeline('凌晨','s7');
  },500);
  
  /////////////////////////////////
  var setchartband = function(n1,n2)
  {
    bloodglucosecharts.axes[ 0 ].bands[0].startValue=0;
    bloodglucosecharts.axes[ 0 ].bands[0].endValue=n1;
    bloodglucosecharts.axes[ 0 ].bands[1].startValue=n1;
    bloodglucosecharts.axes[ 0 ].bands[1].endValue=n2;
    bloodglucosecharts.axes[ 0 ].bands[2].startValue=n2;
    bloodglucosecharts.axes[ 0 ].bands[2].endValue=15;
    bloodglucosecharts.validateNow(true,false);
  }
  var setarrowcolor = function()
  {
    var v = $scope.bloodglucose.mvalue;
    if(v==undefined)v=0;
      if(v < bloodglucosecharts.axes[ 0 ].bands[0].endValue)
        {
          document.getElementById('submitbg').style.backgroundColor='gray';
          bloodglucosecharts.arrows[0].color='gray';
          $scope.result = result.result1;
        }
      else if(v>=bloodglucosecharts.axes[ 0 ].bands[0].endValue && v<bloodglucosecharts.axes[ 0 ].bands[1].endValue)
        {
          document.getElementById('submitbg').style.backgroundColor='green';
          bloodglucosecharts.arrows[0].color='green';
          $scope.result = result.result2;
        }
      else if(v>=bloodglucosecharts.axes[ 0 ].bands[1].endValue && v<=15)
        {
          document.getElementById('submitbg').style.backgroundColor='red';
          bloodglucosecharts.arrows[0].color='red';
          $scope.result = result.result3;
        }
      // console.log($scope.BMI.BMI);
  };
  ///////////////////////////////
  var bloodglucosecharts = AmCharts.makeChart("bloodglucosechartsdiv", {
    "type": "gauge",
    "theme": "light",
    "axes": [ {
      "axisThickness": 1,
      "axisAlpha": 0.2,
      "tickAlpha": 0.2,
      "valueInterval": 1,
      "bands": [ {
        "color": "gray",
        "endValue": 15,
        "startValue": 0
      }, {
        "color": "green",
        "endValue": 0,
        "startValue": 0
      },{
        "color": "red",
        "endValue": 0,
        "innerRadius": "95%",
        "startValue": 0
      } ],
      "bottomText": "0 mmol/L",
      "bottomTextYOffset": -20,
      "endValue": 15
    } ],
    "arrows": [ {
        "color":"gray",
        "nailAlpha":1,
        "nailRadius":15
      } ],
    "export": {
      "enabled": true
    },
    "panEventsEnabled":false,
    "autoDisplay":true,
    "marginBottom":0
  },500);
  ////////////////////////////////
}])

.controller('alertcontroller',['$scope', '$timeout', '$ionicModal', '$ionicHistory', '$cordovaDatePicker','$cordovaLocalNotification','NotificationService',
function($scope, $timeout, $ionicModal,$ionicHistory, $cordovaDatePicker,$cordovaLocalNotification, NotificationService) {
  // $scope.nvGoback = function() {
  //   $ionicHistory.goBack();
  // }
  // $scope.lastviewtitle = $ionicHistory.backTitle();
   // $cordovaCalendar.createCalendar({
   //  calendarName: 'Cordova Calendar',
   //  calendarColor: '#FF0000'
   //  }).then(function (result) {
   //    // success
   //  }, function (err) {
   //    // error
   //  });
}])

.controller('calendarcontroller',['$scope', '$cordovaCalendar','PlanInfo','extraInfo',
function($scope, $cordovaCalendar,PlanInfo,extraInfo) {

    $scope.showiniticon = true;
    $scope.notaskicon = false;
    var data = {
      PatientId:window.localStorage['UID'],
      StartDate:'',
      EndDate:'',
      Module:'M1'
    };
    

    var doneflag = [];
    var doneflag_a = [];

    // var nextmonth = new Date();
    // nextmonth.setDate(1);
    // nextmonth.setMonth(nextmonth.getMonth()+1);
    // nextmonth.setDate(nextmonth.getDate()-1);
    

    // console.log(data);
    $("#myCalendar-1").ionCalendar({
        lang: "ch",                     // language
        sundayFirst: false,             // first week day
        years: "80",                    // years diapason
        format: "YYYY.MM.DD",           // date format
        onClick: function(date){        // click on day returns date
            getselecteddaytask(date);
        }
    },PlanInfo,[],data);
      // PlanInfo.GetComplianceListInC(data).then(function(s){
      //   console.log(s);
      //   doneflag_a = s;
      //   if(doneflag_a.length == 0)
      //   {
      //       doneflag = [];
      //   }else{
      //      for(var i=0;i<doneflag_a.length;i++)
      //       {
      //           doneflag[doneflag_a[i].Date%100] = doneflag_a[i];
      //       }
      //       // console.log(doneflag);
      //       $("#myCalendar-1").ionCalendar({
      //           lang: "ch",                     // language
      //           sundayFirst: false,             // first week day
      //           years: "80",                    // years diapason
      //           format: "YYYY.MM.DD",           // date format
      //           onClick: function(date){        // click on day returns date
      //               getselecteddaytask(date);
      //           }
      //       },PlanInfo,doneflag);
      //   }
      // },function(e){
      //   console.log(e);
      //   $("#myCalendar-1").ionCalendar({
      //           lang: "ch",                     // language
      //           sundayFirst: false,             // first week day
      //           years: "80",                    // years diapason
      //           format: "YYYY.MM.DD",           // date format
      //           onClick: function(date){        // click on day returns date
      //               getselecteddaytask(date);
      //           }
      //       },PlanInfo,[]);
      // });
    var getselecteddaytask = function(date)
    {
      console.log(date);
      $scope.showiniticon=false;
      $scope.showtasklist=new Array();
      $scope.$apply();
      if(date.optiondata != null)
      {
        var option = {PlanNo:date.optiondata.PlanNo,ParentCode:'T',Date:date.optiondata.Date};
        //console.log(option);
        PlanInfo.PlanInfoChartDtl(option).then(function(s){
          $scope.notaskicon=false;
          //console.log(s);
          for(var i=0;i<s.length;i++)
          {
            s[i].index = i;
            s[i].showdetail = false;
          }
          $scope.showtasklist = s;
          $scope.notaskicon=false;
        },function(e){
          console.log(e);
        });
      }else{
        $scope.notaskicon=true;
        $scope.$apply();
      }
      // console.log($scope.showtasklist);
    }
    var lastindex = null;
    $scope.showdetail = function(index)
    {
      if(lastindex!=null && lastindex!=index)
      {
        $scope.showtasklist[lastindex].showdetail = false;
      }
      $scope.showtasklist[index].showdetail = !$scope.showtasklist[index].showdetail;
      lastindex = index;
    }
}])
// --------依从率图-李山----------------
//目标公共界面
.controller('TargetCtrl', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$ionicPopup',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $ionicPopup) {

       $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       }; 
  }])

//目标-图表
.controller('graphcontroller', ['$scope', '$http','$ionicSideMenuDelegate','$timeout','$state','$window','$ionicPopover', 'PlanInfo','$ionicLoading', 'Storage',
    function($scope, $http, $ionicSideMenuDelegate,$timeout, $state, $window, $ionicPopover, PlanInfo, $ionicLoading, Storage) {

      // --------------button修改 张桠童-----------------------//
      $ionicPopover.fromTemplateUrl('popover-select-button.html', {
        scope: $scope,
      }).then(function(popover_others) {
        $scope.popover_others = popover_others;
      });

      $scope.selectPop = function(){
        $scope.popover_others.hide();
      };
      // --------------button修改 张桠童-----------------------//

      //固定变量guide 也可读自json文件
       var  UserId= Storage.get('UID');
       var SBPGuide='';
       var DBPGuide='';
       var PulseGuide='';
       var BloodSugarGuide='';
       var ChartData=""; //图形数据
       var chart_graph="";  //图形对象 全局变量target-phone

       var PlanNo='';
       var StartDate =''; 
       var EndDate='';
       
      var template = '<ion-popover-view style="opacity:1"></ion-popover-view>'; //弹框初始化
      var popover=$ionicPopover.fromTemplate(template);
     
      $http.get('data/guide-sbp.json').success(function(data) {
         SBPGuide=data;  //json文件前两项分别为 初始线 和目标线
       });

      $scope.RemainingDays='0';
      $scope.ProgressRate='0';
      $scope.PlanCompliance='0';
      $scope.orignalValue='';
      $scope.targetValue='';
      init_view();

      //获取是否有正在执行的计划，如果没有则不显示
      function init_view(){
        $scope.showGraph=false;  //控制图或者“没有计划”的显示
        $scope.graphText="正在加载中，请等待...";

       PlanInfo.Plan(UserId,"NULL" ,"M1","3").then(function(data) {  
           if((data!=null) && (data!=''))
           {
              //console.log(data[0].PlanNo);
              $scope.showGraph=true;
              $scope.RemainingDays=data[0].RemainingDays;
              $scope.ProgressRate=data[0].ProgressRate;
              $scope.PlanCompliance=data[0].PlanCompliance;
              $scope.vitalInfo =$scope.options[0];//体征下拉框 默认收缩压   
              PlanNo=data[0].PlanNo;
              StartDate =data[0].StartDate; 
              EndDate=data[0].EndDate;

              init_graph(UserId, data[0].PlanNo, data[0].StartDate, data[0].EndDate, "Bloodpressure", "Bloodpressure_1", SBPGuide,60,200,"收缩压 （单位：mmHg）");
              
           }
           else
           {
              $scope.showGraph=false;
              $scope.graphText="没有正在执行的计划";
           }
         }, function(data) { 

         }     
       );
     }

       $http.get('data/guide-dbp.json').success(function(data) {
         DBPGuide=data;
       });

      $http.get('data/guide-pulse.json').success(function(data) {
         PulseGuide=data;
       });

      $http.get('data/guide-bloodGlucose.json').success(function(data) {
         BloodSugarGuide=data;
       });

      $http.get('data/guide-temperature.json').success(function(data) {
         TemperatureGuide=data;
       });
       
       $scope.options = [{"SignName":"收缩压", "ItemType":"Bloodpressure", "ItemCode":"Bloodpressure_1"},
                         {"SignName":"舒张压", "ItemType":"Bloodpressure","ItemCode":"Bloodpressure_2"},
                         {"SignName":"脉率", "ItemType":"Pulserate", "ItemCode":"Pulserate_1"},
                         {"SignName":"体温","ItemType":"Temperature","ItemCode":"Temperature_1"},
                         {"SignName":"凌晨血糖", "ItemType":"BloodSugar","ItemCode":"BloodSugar_2"}, 
                         {"SignName":"睡前血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_3"},
                         {"SignName":"早餐前血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_4"},
                         {"SignName":"早餐后血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_5"},
                         {"SignName":"午餐前血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_6"},
                         {"SignName":"午餐后血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_7"},
                         {"SignName":"晚餐前血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_8"},
                         {"SignName":"晚餐后血糖","ItemType":"BloodSugar","ItemCode":"BloodSugar_9"}];


      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
      };
      
     // 监视进入页面
      // $scope.$on('$ionicView.enter', function() {   //$viewContentLoaded
      //     console.log("enter graphView") ;
      //     if(Storage.get('graphRefresh')=='1') //任务完成或插入体征则刷新
      //     {
      //       init_view();
      //       Storage.set('graphRefresh','0');
      //     }
          
      // });
      $scope.$on('$ionicView.afterEnter', function() {   //$viewContentLoaded  
          console.log("enter graphView") ;
          $scope.graphData&&AmCharts.makeChart("chartdiv_graph", $scope.graphData);
      });

      //提升切换  切换上图Y轴、标题、分级guide
     $scope.changeVitalInfo = function(option) {

         changeDataset(option.ItemType, option.ItemCode);
         //setTimeout(function(){$ionicLoading.hide();},500);
     };

     

      //初始化函数
    function init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, Guide, minimum, maximum, title)
    {
        $ionicLoading.show({
          template: '<ion-spinner style="height:2em;width:2em"></ion-spinner>'
         });

        //从restful或者jon文件获取数据
        PlanInfo.PlanInfoChart(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode).then(function(data) {  
          $ionicLoading.hide();
          if((data!=null) && (data!=''))
              {
                createStockChart(data); //画图
                setTimeout(function(){
                  chart_graph.panels[1].addListener("clickGraphItem",showDetailInfo); 
                 // $ionicLoading.hide();
                  chart_graph.panels[0].valueAxes[0].guides=Guide; //添加分级guide
                  chart_graph.panels[0].title= title;
                  chart_graph.panels[0].valueAxes[0].minimum=minimum;
                  chart_graph.panels[0].valueAxes[0].maximum=maximum;
                  chart_graph.validateNow();
                },200); //添加点击事件

              //获取该计划下的某体征的初始值和目标值
                $scope.orignalValue='';
                $scope.targetValue='';
                PlanInfo.Target(PlanNo, ItemType, ItemCode).then(function(data) { 
                  //console.log(data);
                    if((data.Origin!=null)&&(data.Value!=null)){
                       //$scope.orignalValue='初始值：'+data.Origin+data.Unit;
                       $scope.targetValue='目标值：'+data.Value+data.Unit;
                     }
                     else
                     {
                        $scope.orignalValue='';
                        $scope.targetValue='';
                     }

                  }, function(data) {}     
               ); //PlanInfo.Target end

           }
           else
           {
              $scope.orignalValue='';
              $scope.targetValue='';
              $scope.showGraph=false;
              $scope.graphText="暂时没有数据，快上传您的数据吧";
           }
              }, function(data) {
                $ionicLoading.hide();
              }     
          );

        //setTimeout(function(){$ionicLoading.hide();},200);
    }

     //体征切换函数
    var changeDataset = function(ItemType, ItemCode) {
       //切换上图Y值数据源，目前不需连restful
       //同时修改初始值和目标值，有显示，无则隐藏  未做
       if(ItemCode=="Bloodpressure_1")
        {
          init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, SBPGuide,60,200,"收缩压 （单位：mmHg）");
          //chart_graph.panels[0].title="收缩压 （单位：mmHg）";
          //chart_graph.panels[0].valueAxes[0].minimum=80;
          //chart_graph.panels[0].valueAxes[0].maximum=200;
          //chart_graph.panels[0].valueAxes[0].guides=SBPGuide; 

        }
        else if(ItemCode=="Bloodpressure_2")
        {
          init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, DBPGuide,60,130,"舒张压 （单位：mmHg）");

        }
        else if(ItemCode=="Pulserate_1")
        {
          init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, PulseGuide,0,150,"脉率 （单位：次/分）");
        }
        else if(ItemCode=="Temperature_1")
        {
          init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, TemperatureGuide,34,42,"体温 （单位：℃）");
        }
        else
        {
          init_graph(UserId, PlanNo, StartDate, EndDate, ItemType, ItemCode, BloodSugarGuide,0,18,"血糖 （单位：mmol/L）");
        }

        //chart_graph.validateNow(); 

     }//function end 

 
     //画图函数-血压、脉率
     function createStockChart(ChartData) {
        
        chart_graph="";
        $scope.graphData={
          type: "stock",
          pathToImages: "img/amcharts/",
          dataDateFormat:"YYYYMMDD",
          categoryAxesSettings: {
            //minPeriod: "mm"
            parseDates: true,
            minPeriod:"DD",
            dateFormats:[{
              period: 'DD',
              format: 'MM/DD'
            }, {
              period: 'WW',
              format: 'MM DD'
            }, {
              period: 'MM',
              format: 'MM/DD'
            }, {
              period: 'YYYY',
              format: 'YYYY'
            }]
          },
          dataSets: [{  
            fieldMappings: [  
              {fromField: "Value",toField: "Value"},
              {fromField: "BulletValue",toField: "BulletValue"}
              ],
            //color: "#fac314",
            dataProvider: ChartData, //数据集   
            //title: "体征和任务依从情况",
            categoryField: "Date"
          }],
          valueAxesSettings:{
            inside:true,
            reversed:false
          //labelsEnabled:true        
          },  
          PanelsSettings:{   
           //marginTop:90,
           //marginRight:90,
           //panelSpacing:400,
           // plotAreaBorderAlpha:1,
           // plotAreaBorderColor:"#000000"
           //usePrefixes: true,
          autoMargins:false
        },
        //autoMargins:false,
        panels: [{
          title: "",
          showCategoryAxis: false,
          percentHeight: 65,
          autoMargins:false,
            //marginTop:300,
            //marginLeft:90,
            //marginRight:90,
            valueAxes: [{
              id:"v1",
              //strictMinMax:true,
              //logarithmic : true,
              //baseValue:115,     //起始值，Y线
              //dashLength: 5,   //虚线
              //title:"血压",
              //axisThickness:4,
              showFirstLabel:true,
              showLastLabel:true,
              //inside:false,
              gridAlpha : 0,
              //labelOffset:0,
              labelsEnabled : false,
              //minimum: 80,  
              //maximum: 200,  
              guides:''   //区域划分ChartData.GraphGuide.GuideList
              
            }
            //,{id:"v2",minimum:10}
            ],
            categoryAxis: {
              //dashLength: 5 
            },
            stockGraphs: [{   
              //type: "line",
              id: "graph1",
              valueField: "Value",
              labelText:"[[Value]]",
              lineColor: "#EA7500",
              //lineColorField:"SignColor",
              lineThickness : 3,
              lineAlpha:1,
              //connect:false,
              bullet: "round",
              //bulletField:"SignShape",
              bulletSize:12,
              //bulletSizeField:"bulletSize",
              //customBulletField : "customBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 1,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "[[Value]]",
              ValueAxis:{
                id:"v1",
                //strictMinMax:true,
                //maximum: 190,  
                //minimum: 65,
                }
              }],
              stockLegend: {     //有这个才能显示title
                valueTextRegular: " ",
                markerType: "none"
                //autoMargins:false
              }
            },
            {
              title: "任务依从情况",
              showCategoryAxis: true,
              //backgroundColor:"#CC0000",
              percentHeight: 35,
              valueAxes: [{
              id:"v2",
              gridAlpha : 0,
              axisAlpha : 0,
              labelsEnabled : false
              //minimum: 10,
            }],
            categoryAxis: {   
              //dashLength: 5
            },
            stockGraphs: [{
              //type: "line",
              id: "graph2",
              valueField:"BulletValue",
              //lineColor: "#DADADA",
              lineColorField:"BulletColor",
              lineThickness : 0,
              lineAlpha:0,
              bullet: "round",
              bulletSize:20,
              //bulletSizeField:"bulletSize",
              customBulletField : "CustomBullet", //客制化
              bulletBorderColor : "#FFFFFF",
              bulletBorderThickness : 2,
              bulletBorderAlpha : 1,    
              showBalloon: true,    
              balloonText: "依从率：[[Compliance]]",
              //labelText:"[[drugDescription]]"
              }],
              stockLegend: {     //有这个才能显示title
                valueTextRegular: " ",
                markerType: "none",       
              }}
          ],
          balloon:{
             fadeOutDuration:3,   //3秒之后自动消失
             animationDuration:0.1,
             maxWidth:500,  //必须有，不然自排版是乱的
             textAlign:"left",
             horizontalPadding:12,
             verticalPadding:4,
             fillAlpha:0.8
          },
          chartCursorSettings:{
            usePeriod: "7DD",
            zoomable:false,
            pan:false,
            //pan:false,
              //zoomable:true,
            //leaveCursor:"false",
            //cursorPosition:"middle",
            categoryBalloonEnabled:false,
            categoryBalloonAlpha:1,
            categoryBalloonColor:"#ffff",
            categoryBalloonDateFormats:[{period:"YYYY", format:"YYYY"}, {period:"MM", format:"YYYY/MM"}, {period:"WW", format:"YYYY/MM/DD"}, {period:"DD", format:"YYYY/MM/DD"}],
            valueLineEnabled:false,  //水平线
            valueLineBalloonEnabled:false,
            valueBalloonsEnabled: true,  //上下值同时显现
            //graphBulletSize: 1,
          },
          chartScrollbarSettings: {  //时间缩放面板
            zoomable:false,
            pan:true,           
            enabled:false,
            position: "top",
            autoGridCount: true, //默认
            graph: "graph1",
            graphType:"line",
            graphLineAlpha:1,
            graphFillAlpha:0,
            height:30,
            dragIconHeight:28,
            dragIconWidth:30,
           //usePeriod: "10mm",     
          },
          responsive: {   //手机屏幕自适应
            enabled: true
          }
        };

        chart_graph=AmCharts.makeChart("chartdiv_graph", $scope.graphData);
      
      } //function end 
     


      //图上点击事件函数
      var showDetailInfo=function(event)
      {
        //获取被点击的bullet的时间值和格式，处理成string"20150618"格式传到webservice
        var dateSelected=event.item.category;
        var theyear=dateSelected.getFullYear();
        var themonth=dateSelected.getMonth()+1;  
        if(themonth<10)
        {
          var themonth="0"+themonth.toString();
        }
        var theday=dateSelected.getDate();
        if(theday<10)
        {
          var theday="0"+theday.toString();
        }
        var theDate=theyear.toString()+themonth.toString()+theday.toString();
 
        //console.log(PlanNo);
        var option = {PlanNo:PlanNo, ParentCode:'T', Date:theDate};
        PlanInfo.PlanInfoChartDtl(option).then(function(data) { 
                if((data!=null)&&(data!='')){
                  template = '<ion-popover-view style="opacity:1"><ion-header-bar class="bar-calm"> <h1 class="title">'+theDate+'</h1></ion-header-bar><ion-content><br><div class="list padding">'; 
                   for(var i=0;i<data.length;i++)
                  {
                      template +=' <div class="item item-divider" style="background:#5151A2; color:#FFF">'+data[i].Name +'</div>';
                      for(var j=0;j<data[i].SubTasks.length;j++)
                     {
                         if(data[i].SubTasks[j].Status=="1")
                         template +='<div class="item">'+"✔ "+data[i].SubTasks[j].Name+'</div>';
                        else if(data[i].SubTasks[j].Status=="0")
                        template +='<div class="item">'+"✘ "+data[i].SubTasks[j].Name+'</div>';
                     } 
                  }
                   template +='</div></ion-content></ion-popover-view>';
                   popover.remove();
                   popover=$ionicPopover.fromTemplate(template);
                   popover.show();
                }
                 
              }, function(data) {}     
            );
        
        // $http.get('data/target-date.json').success(function(data) {

        //    template = '<ion-popover-view style="opacity:1"><ion-header-bar> <h1 class="title">2015-09-13 星期日</h1> </ion-header-bar> <ion-content>'; 
        //    template +=' <div class="list"><button onclick="aa()">aa</button><div class="item item-divider">体征测量</div><div class="item">✔血压：160/87mmHg</div><div class="item">✔脉率：67 次/分</div><div class="item item-divider">生活方式</div><div class="item">✘饮食</div><div class="item">✔运动</div></div>';
        //    template +='</ion-content></ion-popover-view>';

        //    popover.remove();
        //    popover=$ionicPopover.fromTemplate(template);
        //    popover.show();
        // });

      } //function end 

      $scope.refrsh_graph = function() {
        init_view();
         $scope.$broadcast('scroll.refreshComplete');
      }

  }])
//目标-依从率统计 张桠童
.controller('compliancecontroller', ['$scope', 'Storage', 'PlanInfo', 
  function($scope, Storage, PlanInfo){
    var UserId= Storage.get('UID');
    var PlanNo='';
    $scope.StartDate =''; 
    $scope.EndDate='';
    $scope.Compliances = {};

    //获取是否有正在执行的计划，如果没有则不显示(函数不能用$scope来定义)
    var init_view = function(){
      $scope.showGraph=false;  //控制图或者“没有计划”的显示
      $scope.graphText="正在加载中，请等待...";
      //判断计划是否存在
      PlanInfo.Plan(UserId, "NULL", "M1", "3").then(function(data){
        if((data!=null) && (data!=''))
        {
          // console.log(1);
          $scope.showGraph = true;
          PlanNo = data[0].PlanNo;
          $scope.StartDate = data[0].StartDate;
          $scope.EndDate = data[0].EndDate;
          //先决条件确定完毕后，读入依从率统计情况
          PlanInfo.TaskCompliances(PlanNo).then(function(data){
            console.log(2);
            // $scope.Compliances = data;
            // console.log(data); 
            // console.log(data.length);
            // console.log(data[0].Code.substring(2));
            /////////////////处理筛选数据，计算百分比//////////////////////
            var j = 0;
            for (var i = 0; i < data.length; i++) {
              if (data[i].Code.substring(2)!="0000") {
                $scope.Compliances[j] = data[i];
                var a = $scope.Compliances[j].DoDays;
                var b = $scope.Compliances[j].AllDays;
                // $scope.Compliances[j].percents = $scope.Compliances[j].DoDays/$scope.Compliances[j].AllDays*100 ;
                $scope.Compliances[j].percents_cplt = Math.round(a/b*100*100)/100 ; //计算完成率
                $scope.Compliances[j].percents_uncplt = Math.round((100 - $scope.Compliances[j].percents_cplt)*100)/100; //未完成率
                console.log($scope.Compliances[j].percents_uncplt);
                j++;
              };   
            };
            console.log($scope.Compliances);
            ////////////////////////////////////////////           
                // // //画图开始
                // console.log($scope.Compliances[0].UndoDays);
                // var chart = AmCharts.makeChart( "chartdiv", {
                //   "type": "pie",
                //   "theme": "light",
                //   "dataProvider": [ {
                //     "title": "未完成天数",
                //     "value": 5
                //   }, {
                //     "title": "完成天数",
                //     "value": 0
                //   } ],
                //   "titleField": "title",
                //   "valueField": "value",
                //   "labelRadius": 5,
                //   "labelText": "[[title]]: [[percents]]%",
                //   "colors": ["#FF0000","#00FF00"],
                //   "radius": "10%",
                //   "innerRadius": "0%",
                //   "legend":{
                //     "position":"right",
                //     "marginRight":20,
                //     "markerSize":10,
                //     "autoMargins":false
                //   },
                //   "export": {
                //     "enabled": true
                //   }
                // } );
                // //画图结束
            ////////////////////////////////////////////           
            
          }, function(error){
            //读取数据失败
          });
        }else{
          $scope.showGraph=false;
          $scope.graphText="没有正在执行的计划";
        }
      }, function(error){
        //读取数据失败
      });//判断完毕
    };//初始化完毕
    init_view();

}])


//目标-列表 赵艳霞
.controller('recordListcontroller', ['$scope', '$cordovaDatePicker','$http','VitalInfo','$ionicLoading','Storage',
    function($scope, $cordovaDatePicker,$http, VitalInfo,$ionicLoading, Storage) {
     $scope.status="加载更多";
     $scope.others="此时间段没有数据"
     $scope.show_button = true;
     $scope.show_recordList = false;
     var UserId=Storage.get("UID");
     var myDate = new Date();
     var dd=myDate.getDate();
     if(dd<=9)dd="0"+dd;
     var db=myDate.getDate()-1;
     if(db<=9)db="0"+db;
     var mm=myDate.getMonth()+1;
     if(mm<=9)mm="0"+mm;
     var yyyy=myDate.getFullYear();
     var EndDate=yyyy.toString()+mm.toString()+dd.toString();
     var StartDate =yyyy.toString()+mm.toString()+db.toString();
     $scope.StartDate=yyyy+'-'+mm+'-'+db;
     $scope.EndDate=yyyy+'-'+mm+'-'+dd;
         Storage.set("StartDate",StartDate );
         StartDate =Storage.get("StartDate");
         Storage.set("EndDate",EndDate );
         EndDate =Storage.get("EndDate");
         $scope.$watch('$viewContentLoaded', function() {  
         VitalSigns(0);
        
    }); 
         // 设置日期
        // 日历
        $scope.setStart = function(){
          $scope.setstate=0;
        } 
        $scope.setEnd = function(){
          $scope.setstate=1;
        } 
        var datePickerCallback = function (val) {
          if (typeof(val) === 'undefined') {
            console.log('No date selected');
          } else {
            $scope.datepickerObject.inputDate=val;
            dd=val.getDate();
            if(dd<=9)dd="0"+dd;
            db=val.getDate();
            if(db<=9)db="0"+db;
            mm=val.getMonth()+1;
            if(mm<=9)mm="0"+mm;
            yyyy=val.getFullYear();
            var date=yyyy.toString()+'-'+mm.toString()+'-'+dd.toString();
            var dateuser=parseInt(yyyy.toString()+mm.toString()+dd.toString());
           if($scope.setstate==0)
           {
            $scope.StartDate=date;
             Storage.set("StartDate",dateuser )
             StartDate =Storage.get("StartDate")
           }else if($scope.setstate==1)
           {
              Storage.set("EndDate",dateuser )
              EndDate =Storage.get("EndDate")
              if(EndDate>=StartDate)
              {
                $scope.EndDate=date;
              }
              else{
                $scope.EndDate=date;
                $ionicLoading.show({
                 template: '结束日期不能小于开始日期',
                 duration:1000
                });
              }
             }
          }
        };
        var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
        var weekDaysList=["日","一","二","三","四","五","六"];
        $scope.datepickerObject = {
          titleLabel: '日期',  //Optional
          todayLabel: '今天',  //Optional
          closeLabel: '取消',  //Optional
          setLabel: '设置',  //Optional
          setButtonType : 'button-assertive',  //Optional
          todayButtonType : 'button-assertive',  //Optional
          closeButtonType : 'button-assertive',  //Optional
          inputDate: new Date(),    //Optional
          mondayFirst: false,    //Optional
          //disabledDates: disabledDates, //Optional
          weekDaysList: weekDaysList,   //Optional
          monthList: monthList, //Optional
          templateType: 'popup', //Optional
          showTodayButton: 'false', //Optional
          modalHeaderColor: 'bar-positive', //Optional
          modalFooterColor: 'bar-positive', //Optional
          from: new Date(1900, 1, 1),   //Optional
          to: new Date(),    //Optional
          callback: function (val) {    //Mandatory
            datePickerCallback(val);
          }
        };  
      $scope.Signs_all = {};
     $scope.Signs_all.list=[];
     $scope.Signs_all.UnitCount = 10;//每次点击加载的条数
     $scope.Signs_all.Skip = $scope.Signs_all.UnitCount;//跳过的条数
     // console.log($scope.Signs_all.Skip);
      $scope.loadMore = function(){
          $scope.show_button = true;
          $scope.show_recordList = false;
          
          $scope.status="加载更多";
          VitalSigns($scope.Signs_all.Skip);
          $scope.Signs_all.Skip = $scope.Signs_all.Skip + $scope.Signs_all.UnitCount;
      }
        var VitalSigns=function(skip)
       {
        console.log(skip);
        console.log($scope.Signs_all.list.length);
         var promise = VitalInfo.VitalSigns(UserId,StartDate,EndDate,$scope.Signs_all.UnitCount,skip); 
         promise.then(function(data)
        {   
            if(data.length > 0)
            {
                var NewData=data;//data.reverse(); //倒序
                if($scope.Signs_all.list)
                {
                    $scope.Signs_all.list = NewData.concat($scope.Signs_all.list);
                }
                else
                {
                    $scope.Signs_all.list = NewData;
                }
            }else{
              // $scope.show_button = false;
              $scope.show_recordList = true;
              $scope.show_button = false;
              $scope.status="已加载完毕";
              $scope.others="已加载完毕，没有更多数据了";
              $ionicLoading.show({
                template: '没有更多了',
                duration:700
              });
              
            }
           $scope.$broadcast('scroll.refreshComplete');
          },function(data) {   
        });      
            }
    
       $scope.doRefresh = function() {
         $scope.show_recordList = false;
         $scope.show_button = true;
         $scope.status="加载更多";  //这句话可删除
         $scope.others="已加载完毕，没有更多数据了"; 
          getlist();
          $scope.Signs_all.Skip = $scope.Signs_all.UnitCount;//跳过的条数
        }
         var getlist = function()
        { 
           $scope.Signs_all.list = "";
           VitalSigns(0);
        }
    
  }])

// --------我的专员-苟玲----------------
//我的专员消息列表
.controller('contactListCtrl',function($scope, $http, $state, $stateParams, Users, Storage,CONFIG, MessageInfo, $timeout){
    //console.log($stateParams.tt);
    $scope.chatImgUrl=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/';
    $scope.contactList = {};
    $scope.contactList.list = new Array();

    $scope.$on('$ionicView.enter', function() { 

         $timeout(function(){$scope.GetHealthCoachListByPatient();}, 100);

        //获取系统通知和预约提醒  未读条数和最新一条内容
        $scope.GetLatestNotification('System', 0);//SystemNotification
        $scope.GetLatestNotification('User', 1);//Appointment

    });

   $scope.latestNotification =[{NotificationType:'System', unreadShow:false, unreadCount:'', latestTime:'', latestTitle:'', latestContent:''}, 
                               {NotificationType:'User',unreadShow:false, unreadCount:'', latestTime:'', latestTitle:'', latestContent:''}];
   $scope.GetLatestNotification = function(NotificationType, i)
   {
       var promise = MessageInfo.GetDataByStatus(Storage.get("UID"), NotificationType, 0, 10, 0);  
        promise.then(function(data) { 
          if((data==null)||(data=='')||(data.length==0)){
            $scope.latestNotification[i].unreadCount='';
            $scope.latestNotification[i].unreadShow=false;
            var promise1 = MessageInfo.GetDataByStatus(Storage.get("UID"), NotificationType, '1', 1, 0);  
            promise1.then(function(data1) { 
              if((data1!=null)&&(data1!='')&&(data1.length!=0)){
                $scope.latestNotification[i].latestTime=data1[0].SendTime;
                $scope.latestNotification[i].latestTitle=data1[0].Title;
                $scope.latestNotification[i].latestContent=data1[0].Description;
              }
            });
          }
          else
          {
            $scope.latestNotification[i].unreadShow=true;
            $scope.latestNotification[i].latestTime=data[0].SendTime;
            $scope.latestNotification[i].latestTitle=data[0].Title;
            $scope.latestNotification[i].latestContent=data[0].Description;
            console.log(data.length);
            if(data.length==10) {$scope.latestNotification[i].unreadCount='10+';}
            else {$scope.latestNotification[i].unreadCount=data.length}
          }
        });
    }

    $scope.GetHealthCoachListByPatient = function()
    {
        var PatientId = Storage.get("UID");
        var promise = Users.GetHealthCoachListByPatient(PatientId);  
        promise.then(function(data) { 
            if (data.length > 0)
            {
                for (var i = 0; i < data.length - 1; i++)
                {
                    data[i].module = data[i].module.substr(0, data[i].module.length - 2)
                    var indexList = new Array();
                    for (var j = i + 1; j < data.length; j++)
                    {
                        if (data[i].HealthCoachID == data[j].HealthCoachID)
                        {
                            data[i].module += "/" + data[j].module.substr(0, data[j].module.length - 2);
                            indexList.push(j - 1);
                        }
                    }
                    data[i].module = "模块：" + data[i].module;
                    if (indexList.length > 0)
                    {
                        indexList[0] += 1;
                        for (var k = 0; k < indexList.length; k++)
                        {
                            data.splice(indexList[k], 1);
                        }
                    } 
                }
                $scope.contactList.list = data;
                console.log($scope.contactList.list); 
                for(var i=0;i<$scope.contactList.list.length;i++)
                {
                    if(($scope.contactList.list[i].imageURL=="")||($scope.contactList.list[i].imageURL==null))
                    {
                        $scope.contactList.list[i].imageURL="img/DefaultAvatar.jpg";
                    }
                    else
                    { 
                        $scope.contactList.list[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.contactList.list[i].imageURL;
                    }
                }
            } 
            
            $scope.$broadcast('scroll.refreshComplete');
            GetSMSCountForAll();
        }, function(data) {  
        });      
    }

   $scope.transImageURL_doc = function(ImageURL_doc)
   {
      Storage.set("ImageURL_doc", ImageURL_doc)
   }

   //下拉刷新
   $scope.refresh = function()
   {
      location.reload(); 
   }
   
   //获取未读消息总数
    function GetSMSCountForAll ()
    {
        var promise = MessageInfo.GetSMSCount(Storage.get("UID"),"NULL");  
        promise.then(function(data) { 
            //$scope.$emit('transfer.unreadMessageSum', data.result);                  
        }, function(data) {  
        });  
    }

    //获取一对一未读消息数
    function GetSMSCountForOne (i, SendBy)
    {
        var promise = MessageInfo.GetSMSCount(Storage.get("UID"),SendBy);  
        promise.then(function(data) { 
            $scope.contactList.list[i].Count = data.result;
            GetSMSCountForAll();
        }, function(data) {  
        });  
    }


    var WsUserId = Storage.get("UID");
    var WsUserName = Storage.get("UID"); //最好是患者姓名
    var wsServerIP = CONFIG.wsServerIP; 
    SocketInit();
     //socket初始化
    function SocketInit()
    {
        $scope.socket = io.connect(wsServerIP);
          
        //告诉服务器由用户登陆
        $scope.socket.emit('login', {userid:WsUserId, username:WsUserName});                
          
        //监听消息
        $scope.socket.on('message', function(obj){
            var DataArry = obj.content.split("||");
            if(DataArry[0] == 'Appointment'){
                  if(DataArry[1] == WsUserId){
                      $scope.GetLatestNotification('Appointment', 1);
                  }
            }
            else if(DataArry[0] == 'SystemNotification'){
                      $scope.GetLatestNotification('SystemNotification', 0);
            }
            else
            {
                if (DataArry[0] == WsUserId)
                {
                    for (var i=0; i<$scope.contactList.list.length; i++)
                    {
                        if (DataArry[1] == $scope.contactList.list[i].HealthCoachID)
                        {
                            playBeep();
                            $scope.contactList.list[i].Content = DataArry[3];
                            $scope.contactList.list[i].SendDateTime = DataArry[4];
                            GetSMSCountForOne(i, DataArry[1]);
                        }
                    }                         
                } //if end 
            }  
        });
    } // funtion end

    // 蜂鸣1次，震动2秒
    function playBeep() {
        //navigator.notification.beep(1); 
        //navigator.notification.vibrate(2000);
    } 
})

//我的某专员详细消息列表
.controller('ChatDetailCtrl' ,function($scope, $http, $stateParams, $resource, MessageInfo, $ionicScrollDelegate, CONFIG, Storage, Data) 
{

    $scope.setCurrent = function(healthCoachID){
      Storage.set("HealthCoachID",healthCoachID );
    }

    //console.log($stateParams.tt);
    $scope.Dialog = {};
    var paraArry = $stateParams.tt.split('&');
    $scope.DoctorId = paraArry[0];
    $scope.DoctorName =  paraArry[1];
    $scope.imageURL = Storage.get('ImageURL_doc');

    $scope.PatientId = Storage.get('UID');

    $scope.Dialog.SMScontent = "";
    var WsUserId = $scope.PatientId;
    var WsUserName = $scope.PatientId; //最好是患者姓名
    var wsServerIP = CONFIG.wsServerIP; 
    var piUserId = "1";
    var piTerminalName = "1";
    var piTerminalIP = "1";
    var piDeviceType = 19;
    SetSMSRead();
    $scope.$on('$ionicView.leave', function(){
        SetSMSRead();
    })

    $scope.myImage = "img/DefaultAvatar.jpg";

    var urltemp2 = Storage.get('UID') + '/BasicDtlInfo';
    Data.Users.GetPatientDetailInfo({route:urltemp2}, 
       function (success, headers) {
        console.log(success);
          if( (success.PhotoAddress=="") || (success.PhotoAddress==null))
          {
            $scope.myImage = "img/DefaultAvatar.jpg";
          }
          else 
          {
            $scope.myImage = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile + "/" + success.PhotoAddress;
          } 

       }, 
      function (err) {
        // 目前好像不存在userid不对的情况，都会返回一个结果
      });  

    $scope.Dialog.DisplayOnes=new Array(); //显示的消息
    $scope.Dialog.UnitCount = 6;//每次点击加载的条数
    $scope.Dialog.Skip = $scope.Dialog.UnitCount;//跳过的条数
    //加载更多
    $scope.DisplayMore = function ()
    { 
        GetSMSDialogue($scope.Dialog.Skip);
        $scope.Dialog.Skip = $scope.Dialog.Skip + $scope.Dialog.UnitCount;
    }

    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    //socket初始化
    $scope.SocketInit = function ()
    {
        $scope.socket = io.connect(wsServerIP);
          
        //告诉服务器由用户登陆
        $scope.socket.emit('login', {userid:WsUserId, username:WsUserName});                
          
        //监听消息
        $scope.socket.on('message', function(obj){
            var DataArry = obj.content.split("||");
            if (DataArry[0] == WsUserId)
            {
              if(DataArry[1] == $scope.DoctorId)
              {
                  $scope.Dialog.DisplayOnes.push({"IDFlag": "Receive","SendDateTime": DataArry[2],"Content":DataArry[3]});
                  //console.log($scope.Dialog);
                  $scope.$apply();
                  $ionicScrollDelegate.scrollBottom(true);
                  
                  //SetSMSRead(ThisUserId, TheOtherId);//改写阅读状态
                  playBeep();
              }              
            }   
        });
    } 
    //socket发送消息到服务器   
    $scope.SocketSubmit = function(WsContent)
    {      
        var obj = {
          userid: WsUserId,
          username: WsUserName,
          content: WsContent
        };
        $scope.socket.emit('message', obj);
      return false;
    },

    //获取消息对话
    GetSMSDialogue = function(skip)
    {
        var promise = MessageInfo.GetSMSDialogue($scope.PatientId, $scope.DoctorId,$scope.Dialog.UnitCount,skip);
        promise.then(function(data) 
        { 
            if(data.length > 0)
            {
                var NewData = data.reverse(); //倒序
                if($scope.Dialog.DisplayOnes)
                {
                    $scope.Dialog.DisplayOnes = NewData.concat($scope.Dialog.DisplayOnes);                                       
                }
                else
                {
                    $scope.Dialog.DisplayOnes = NewData;                   
                } 
                if (skip == 0)
                {
                    $ionicScrollDelegate.scrollBottom(true); 
                }              
            } 
            $scope.$broadcast('scroll.refreshComplete');           
            //$ionicScrollDelegate.scrollBottom(true);
        }, 
        function(data) {   
        });      
    }

    $scope.$watch('$viewContentLoaded', function() {  
        GetSMSDialogue(0);
        $scope.SocketInit();
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
    }); 
 
  
    //发送消息
    $scope.submitSMS = function() {
        var SendBy = $scope.PatientId;
        var Receiver = $scope.DoctorId;
        if($scope.Dialog.SMScontent != "")
        {
            var promise = MessageInfo.submitSMS(SendBy,$scope.Dialog.SMScontent,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType);  
            promise.then(function(data) {    
                if (data.Flag == "1")
                {
                    if (data.Time == null)
                    {
                        data.Time = "";
                    }
                    $scope.Dialog.DisplayOnes.push({"IDFlag": "Send","Time": data.Time,"Content":$scope.Dialog.SMScontent});
                    $ionicScrollDelegate.scrollBottom(true);
                    $scope.SocketSubmit(Receiver +  "||" + SendBy + "||" + data.Time + "||" + $scope.Dialog.SMScontent + "||" + data.SendDateTime);
                    $scope.Dialog.SMScontent = "";
                }              
            }, function(data) {   
            });      
        }
    }

    $scope.Dialog.SMSbottom = "44px";
    $scope.$on('taResize', function(e, ta) {
        //console.log('taResize');
        if (!ta) return;
        
        var taHeight = ta[0].offsetHeight;
        //console.log('taHeight: ' + taHeight);
        
        if (!footerBar) return;
        
        var newFooterHeight = taHeight + 10;
        
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;        
        footerBar.style.height = newFooterHeight + 'px';
        scroller.style.bottom = newFooterHeight + 'px'; 
        $scope.Dialog.SMSbottom = newFooterHeight + 'px';
    });

     // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
        //console.log('keepKeyboardOpen');
        txtInput.one('blur', function() {
            console.log('textarea blur, focus back on it');
            txtInput[0].focus();
        });
    } 

    //将消息设为已读
    function SetSMSRead ()
    {
        var data = {
                      "MessageNo": "sample string 1",
                      "MessageType": 2,
                      "SendStatus": 3,
                      "ReadStatus": 4,
                      "SendBy": $scope.DoctorId,
                      "SendByName": "sample string 6",
                      "SendDateTime": "sample string 7",
                      "Title": "sample string 8",
                      "Content": "sample string 9",
                      "Receiver": $scope.PatientId,
                      "ReceiverName": "sample string 11",
                      "SMSFlag": 12,
                      "IDFlag": "sample string 13",
                      "Flag": "sample string 14",
                      "Count": "sample string 15",
                      "Time": "sample string 16",
                      "piUserId": piUserId,
                      "piTerminalName": piTerminalName,
                      "piTerminalIP": piTerminalIP,
                      "piDeviceType": piDeviceType
                    }
        //var promise = MessageInfo.SetSMSRead($scope.PatientId, $scope.DoctorId, piUserId, piTerminalName, piTerminalIP, piDeviceType);
        var promise = MessageInfo.SetSMSRead(data);
        promise.then(function(data) {}, 
        function(data) {   
        });      
    }

    // 蜂鸣1次，震动2秒
    function playBeep() { 
        //navigator.notification.beep(1); 
        //navigator.notification.vibrate(2000);
    } 
})

//系统通知、预约信息
.controller('NotificationCtrl',['$scope', '$stateParams', '$ionicScrollDelegate', '$ionicLoading', 'MessageInfo', 'Storage', function($scope, $stateParams, $ionicScrollDelegate, $ionicLoading, MessageInfo, Storage){

    $scope.scrollToTop=false; //“回到顶部按钮”初始隐藏
    $scope.NotificationList = new Array();
    $scope.notificationSetting={moreNotification:false, alertText:'正在努力加载中...', imageURL:'img/systemNotification.jpg'}; 

    $scope.$watch('$viewContentLoaded', function() {  
        $scope.GetNotificationList($stateParams.tt, 10, 0);
        if($scope.NotificationList.length==0){
          $scope.notificationSetting.alertText='暂时没有通知'
        }
    });

    //推送消息点击查看详细，若未读则则置位为已读
    $scope.NotificationClick = function(item) {
      Storage.set('NotificationDetail', JSON.stringify(item));
      if(item.Status == '0')
      {
        var promise = MessageInfo.ChangeStatus(item.AccepterID, item.NotificationType, item.SortNo,'1' , '', '', '', 1);  
        promise.then(function(data) {
          if(data=='状态修改成功'){
            // for (var i = 0; i < $scope.NotificationList.length; i++) {
            //   if ($scope.NotificationList[i] == item) {
            //       $scope.NotificationList[i].Status='1';
            //   }
            // }
          }
        });
      }
    };

    //回到顶部函数
    $scope.scrollTop = function() {
      $ionicScrollDelegate.scrollTop();
    };

    //滚动时获取滚动长度，超出某长度则显示“回到顶部按钮”
     $scope.getScrollPosition = function() {
        $scope.moveData = $ionicScrollDelegate.getScrollPosition().top;
       
        if($scope.moveData>=100){
            $scope.scrollToTop=true;
         }else if($scope.moveData<100){
           $scope.scrollToTop=false;
         }
      };

    $scope.GetNotificationList = function(NotificationType, top, skip)
   {
       var promise = MessageInfo.GetDataByStatus(Storage.get("UID"), NotificationType, '{Status}', 10, 0);  
        promise.then(function(data) { 
        if((data!=null)&&(data!='')&&(data.length!=0)){
          for(var i=0;i<data.length;i++){
            $scope.NotificationList.push(data[i]);
          }
          $scope.notificationSetting.alertText='';
          //本次获取的数量少于num，则说明没有更多数据了
          if(data.length < top){
              $scope.notificationSetting.moreNotification=false;
              //$scope.notificationSetting.alertText='';
              
              // $ionicLoading.show({
              //   template: '没有更多数据',
              //   noBackdrop: false,
              //   duration: 1000,
              //   hideOnStateChange: true
              // });
          }
          else
          {
             $scope.notificationSetting.moreNotification=true;
          }
        }
        },function(err) {   
        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }); 
    }

    //下拉刷新
    $scope.refreshNotificationList = function() {
       $scope.NotificationList=new Array();
       //$scope.alertText='正在努力加载中...';
       $scope.notificationSetting.moreNotification=false;
       $scope.GetNotificationList($stateParams.tt, 10, 0);
       if($scope.NotificationList.length==0){
          $scope.notificationSetting.alertText='暂时没有通知'
        }
     }

    //上啦加载更多
     $scope.loadMoreNotification = function () {
         $scope.GetNotificationList($stateParams.tt, 5, $scope.NotificationList.length);    
      }

}])

//系统通知、预约详细信息
.controller('NotificationDetailCtrl',['$scope', '$stateParams', '$ionicScrollDelegate', '$ionicLoading', 'MessageInfo', 'Storage', function($scope, $stateParams, $ionicScrollDelegate, $ionicLoading, MessageInfo, Storage){

   $scope.notificationDetail = JSON.parse(Storage.get('NotificationDetail'));

}])

// --------专员选择-赵艳霞----------------
//所有专员列表（排序、筛选）
.controller('HealthCoachListCtrl', ['$scope', '$state','$ionicPopup','$ionicSideMenuDelegate','$http', '$ionicModal','$ionicPopover','$ionicHistory','Users','Storage','CONFIG','$filter','$ionicScrollDelegate','$ionicLoading',
    function($scope, $state, $ionicPopup,$ionicSideMenuDelegate,$http, $ionicModal, $ionicPopover,$ionicHistory,Users,Storage,CONFIG,$filter, $ionicScrollDelegate, $ionicLoading ) { 
      
      $scope.healthCoachList = new Array();
      $scope.moreHealthCoach=false;  //上拉加载更多，没有更多数据标志
      $scope.filterCondition = "sex ge '' "; //筛选初始值
      $scope.alertText='正在努力加载中...';
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      } 

     $scope.$watch('$viewContentLoaded', function() {$scope.GetHealthCoaches(10, 0, $scope.filterCondition); });      //num、skip、filter

     //获取所有专员列表
     $scope.GetHealthCoaches = function(num, skip, filter)  
     {
         var promise = Users.GetHealthCoaches(num, skip, filter); 
         promise.then(function(data){ 
            $scope.list="仅供测试用途";
            for(var i=0;i<data.length;i++){
               if((data[i].imageURL=="")||(data[i].imageURL==null)){
                data[i].imageURL="img/DefaultAvatar.jpg";
              }
              else{ data[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+data[i].imageURL;
              }
              $scope.healthCoachList.push(data[i]);
            }//for end

            //本次获取的数量少于num，则说明没有更多数据了
            if(data.length < num){
                $scope.moreHealthCoach=false;
                $scope.alertText='没有更多数据';
                // $ionicLoading.show({
                //   template: '没有更多数据',
                //   noBackdrop: false,
                //   duration: 1000,
                //   hideOnStateChange: true
                // });
            }
            else
            {
               $scope.moreHealthCoach=true;
            }

          },function(err) {

        }).finally(function () {
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });     
    }

    $scope.setCurrent = function(healthCoach){
      Storage.set("HealthCoachID",healthCoach.healthCoachID );

     }

    //下拉刷新列表
     $scope.refreshHealthCoachList = function() {
        $scope.healthCoachList = new Array();
        $scope.alertText='正在努力加载中...';
        $scope.moreHealthCoach=false;
        $scope.GetHealthCoaches(10, 0, $scope.filterCondition); 
     };

    //上拉加载更多评论
     $scope.loadMoreHealthCoach = function () { 
        //console.log(333);
        $scope.GetHealthCoaches(5, $scope.healthCoachList.length, $scope.filterCondition);
      }

       //排序
       $ionicPopover.fromTemplateUrl('templates/popover-sort.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
      });

      $scope.sideList = [
        { text: "姓名顺序排列", value: "name" },
        { text: "姓名逆序排列", value: "-name" },
        { text: "评分最高", value: "-score" },
        { text: "评分最低", value: "score" },
        { text: "年龄最高", value: "-age" },
        { text: "年龄最低", value: "age" }];

      $scope.orderProp = 'name';
      
      $scope.sideChange = function(item) {
          $scope.orderProp= item.value;
      }; 

      //筛选
     $ionicPopover.fromTemplateUrl('templates/popover-select.html', {
        scope: $scope,
      }).then(function(popover1) {
        $scope.popover1 = popover1;
      });

      //筛选-性别
      $scope.sexList = [
        { text: "全部", value: 'all' },
        { text: "男", value: '1' },
        { text: "女", value: '2' }
        ];
      $scope.selectMenu={selectedSex:'all'};

       //筛选函数
       $scope.selectFunction = function(){
           if($scope.selectFunction.selectedSex=="all")
           {
             $scope.filterCondition = "sex ge '1' ";
           }
           else
           {
              $scope.filterCondition = "sex eq  '"+$scope.selectMenu.selectedSex+"'";
           } 
           $scope.healthCoachList = new Array();
           $scope.alertText='正在努力加载中...';
           $scope.GetHealthCoaches(10, 0, $scope.filterCondition);
           $scope.popover1.hide();
        }
  }])

//专员简介（预约）
.controller('HealthCoachInfoCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate','$stateParams','$rootScope','Data','Users','Service','Storage','CONFIG','$ionicPopup','$timeout','extraInfo','$ionicLoading',
  function($scope,$ionicHistory,$ionicSideMenuDelegate,$stateParams,$rootScope,Data, Users, Service , Storage,CONFIG,$ionicPopup,$timeout,extraInfo,$ionicLoading) {
      
      //console.log($stateParams.tt);
      $scope.CommentList=new Array();

      $scope.nvGoback = function() {
        $ionicHistory.goBack();
      } 

      //一进页面则加载
      $scope.$watch('$viewContentLoaded', function() {   
        GetHealthCoachInfo( Storage.get("HealthCoachID") ); //获取专员个人信息
        GetCommentList(Storage.get("HealthCoachID") ,''); //获取专员的2条评论(所有模块)
      }); 

      //restful获取专员个人信息
      var GetHealthCoachInfo= function(HealthCoachID)
       {
         var promise =  Users.GetHealthCoachInfo(HealthCoachID); 
         promise.then(function(data)
         { 
           $scope.HealthCoachInfo = data;
           if(($scope.HealthCoachInfo.imageURL=="")||($scope.HealthCoachInfo.imageURL==null)){
                $scope.HealthCoachInfo.imageURL="img/DefaultAvatar.jpg";
              }
            else{ $scope.HealthCoachInfo.imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.HealthCoachInfo.imageURL;
              }
            $scope.$broadcast('scroll.refreshComplete'); 
          },function(err) {   
        });      
      }

      //restful获取专员评论列表
      var GetCommentList= function(DoctorId ,CategoryCode)
       {
         var promise =  Users.GetCommentList(DoctorId, CategoryCode, 2); 
         promise.then(function(data)
        { 
          $scope.CommentList=data;
          for(i=0;i<$scope.CommentList.length;i++){
           if(($scope.CommentList[i].imageURL=="")||($scope.CommentList[i].imageURL==null)){
                  $scope.CommentList[i].imageURL="img/DefaultAvatar.jpg";
                }
            else{ 
                  $scope.CommentList[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+$scope.CommentList[i].imageURL;
                }
           }
         },function(err) {   
        });      
      }

      //预约的模块选项
      $scope.reserve={Description:"",selectedModoule: ''};
      $scope.modouleList = [
      { text: "高血压", value: "HM1" },
      { text: "糖尿病", value: "HM2" },
      { text: "心衰", value: "HM3" }];

      //获取预约权限
      $scope.getReserveAuthority=function (item)
      {
         $scope.reserve.selectedModoule = '';
         var UserId=Storage.get("UID");
         var promise =  Users.BasicDtlValue(UserId, item.value, 'Doctor', 1); //获取患者评价专员的权限
         promise.then(function(data)
         { 
            if((data.result==null) ||(data.result=='')) {  //没有专员负责的模块
              $scope.reserve.selectedModoule = item.value;
            }
            else if(data.result==Storage.get("HealthCoachID")){ //本专员负责该模块
              $scope.reserve.selectedModoule = item.value;

            }
            else{  //本专员不负责该模块（已有他人负责）
              $scope.reserve.selectedModoule = '';
              $ionicLoading.show({
                template: '对不起，您没有预约'+item.text+'模块的权限',//item.text
                noBackdrop: false,
                duration: 1000,
                hideOnStateChange: true
              });
            }
          },function(err) { 
           $scope.reserve.selectedModoule = '';
          });

      }
 
     //预约有效性验证、restful预约
      var ReserveHealthCoach = function()
      {
        if($scope.reserve.selectedModoule == '')
        {
          $ionicLoading.show({
          template: '对不起，预约的模块不能为空',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
          });
        }
        else if($scope.reserve.Description == '')
        {
          $ionicLoading.show({
          template: '对不起，预约的描述不能为空',
          noBackdrop: false,
          duration: 1000,
          hideOnStateChange: true
          });
        }
        else{
            sendData={
            "DoctorId": Storage.get("HealthCoachID"),
            "PatientId": Storage.get("UID"),
            "Module": $scope.reserve.selectedModoule,
            //"Module": "M1",
            // "Description": "初次预约，请多指教",
            "Description": $scope.reserve.Description,
            // "Description": $scope.sendData.Description,
            "Status": 1,
            "ApplicationTime": extraInfo.DateTimeNow().zyxTime,
            "AppointmentTime": extraInfo.DateTimeNow().zyxTime,
            "AppointmentAdd": "",
            "Redundancy": "",
            "revUserId": "1",
            "TerminalName": "1",
            "TerminalIP": "1",
            "DeviceType": 1
          }

          var promise =  Users.ReserveHealthCoach(sendData);
          promise.then(function(data){ 
            
            if(data.result=="数据插入成功"){
              $ionicLoading.show({
                template: "预约请求已发送！",
                noBackdrop: false,
                duration: 1000,
                hideOnStateChange: true
              });

              //推送通知
              var promise1 =  Service.PushNotification('android', Storage.get("HealthCoachID"), $scope.reserve.Description, '来自'+Storage.get("PatientName")+'的预约', Storage.get("UID")); //获取患者评价专员的权限
              promise1.then(function(data){ 
                console.log("通知医生成功");
              },function(err) { 
                 console.log("通知医生失败");
              });
            }
           },function(err) {  
             $ionicLoading.show({
               template: err.data.result,
               noBackdrop: false,
               duration: 1000,
               hideOnStateChange: true
             }); 
         }); 

        } //else end
      } //function end


     //解除关系
     $scope.removeModuleCandicate=[];
     $scope.remove={selectedModoule: ''};

     //解除关系-弹框
     $scope.showRemovePop = function() {
        //restful获取可解除的模块
       
        var promise =  Users.HModulesByID(Storage.get("UID"), Storage.get("HealthCoachID")); 
         promise.then(function(data)
         { 
           if((data != "") && (data != null)){
                //console.log('有关联模块');
                $scope.removeModuleCandicate=data;
                var RemovePop = $ionicPopup.show({
                  template:"<div class='list'><div class='item item-divider item-calm'> 选择模块</div><ion-radio ng-repeat='item in removeModuleCandicate' ng-value='item.CategoryCode' ng-model='remove.selectedModoule'> {{ item.Modules }}</ion-radio></div>", 
                  title: '解除专员', 
                  scope: $scope,
                  buttons: [{text: '确定解除',
                             type: 'button-assertive',
                             onTap: function(e) {
                              //console.log($scope.remove.selectedModoule);
                              RemoveHealthCoach();
                            } //onTap end
                         },{
                         text: '取消',
                         type: 'button-positive'}]
                }); //$ionicPopup.show end

                $timeout(function() {
                  RemovePop.close(); // 30秒后自动关闭弹窗
                }, 30000);

              }
            else{ 
                //console.log('无');
                $ionicLoading.show({
                   template: '没有可解除的模块！',
                   noBackdrop: false,
                   duration: 1000,
                   hideOnStateChange: true
                });
                
              }
          },function(err) {  
           console.log(err);
        }); 
  
     }

     //解除关系-RESTFUL
     var RemoveHealthCoach = function(){
        if($scope.remove.selectedModoule!='')
        {
           var promiseRemove =  Users.RemoveHealthCoach(Storage.get("UID"), Storage.get("HealthCoachID"), $scope.remove.selectedModoule);
            promiseRemove.then(function(data)
            { 
                $ionicLoading.show({
                   template: data.result,
                   noBackdrop: false,
                   duration: 1000,
                   hideOnStateChange: true
                });

              },function(err) {  
                //console.log(err.data.result);
                $ionicLoading.show({
                   template: err.data.result,
                   noBackdrop: false,
                   duration: 1000,
                   hideOnStateChange: true
                });
               
            }).finally(function () {

            }); //promiseRemove end
        }
        else
        {
          $ionicLoading.show({
             template: '请选择要解除的模块！',
             noBackdrop: false,
             duration: 1000,
             hideOnStateChange: true
          });
        }
     }

      //弹出预约框
      $scope.showreservePop = function() {
           $scope.reserve={Description:"",selectedModoule: ''};
            var myPopup = $ionicPopup.show({
               templateUrl:'partials/healthCoach/reservehealthcoach.html',
               title: '预约详情',
               //subTitle: '预约详情',
               scope: $scope,
               buttons: [
                  {text: '提交预约',
                   type: 'button-assertive',
                 　onTap: function(e) {
                      if($scope.reserve.Description.length >100)
                      {
                       $ionicLoading.show({
                       template: '输入字数不能超过100字',
                       noBackdrop: false,
                       duration: 1000,
                       hideOnStateChange: true
                       });
                     }
                     else
                     {
                       ReserveHealthCoach();
                     }
        　　　　    }
                   },
                 {
                   text: '取消预约',
                   type: 'button-positive',
               }]
           });

           myPopup.then(function(res) {
             
           });

           $timeout(function() {
              myPopup.close(); // 30秒后自动关闭弹窗
           }, 30000);
      }
}])

//专员的评价列表
.controller('CommentListCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate','Users','Storage', 'CONFIG', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopover',
   function($scope, $ionicHistory, $ionicSideMenuDelegate, Users, Storage, CONFIG, $ionicScrollDelegate, $ionicLoading, $ionicPopover) {
    
      $scope.setting={selectedModoule:" "}; //默认加载全部模块
      $scope.scrollToTop=false; //“回到顶部按钮”初始隐藏
      $scope.CommentList = new Array();
      $scope.moreComment=false;  //上拉加载更多，没有更多数据标志
      $scope.alertText='正在努力加载中...';

      //回到顶部函数
      $scope.scrollTop = function() {
        $ionicScrollDelegate.scrollTop();
      };

    //滚动时获取滚动长度， 超出某长度则显示“回到顶部按钮”
     $scope.getScrollPosition = function() {
        $scope.moveData = $ionicScrollDelegate.getScrollPosition().top;
       
        if($scope.moveData>=100){
            $scope.scrollToTop=true;
         }else if($scope.moveData<100){
           $scope.scrollToTop=false;
         }
      };

      //后退
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }

      //下拉刷新评论
      $scope.refreshComment = function() {
         $scope.CommentList=new Array();
         //$scope.alertText='正在努力加载中...';
         $scope.moreComment=false;
         GetCommentList(Storage.get("HealthCoachID"),  $scope.setting.selectedModoule, 10, 0);
       }

      //上啦加载更多评论
       $scope.loadMoreComment = function () {
           //console.log(333);
           GetCommentList(Storage.get("HealthCoachID"),  $scope.setting.selectedModoule, 5, $scope.CommentList.length);    
        }

      //restful获取评论列表
      var GetCommentList= function(DoctorId ,CategoryCode,num, skip)
       {
           $scope.alertText='正在努力加载中...';
           var promise =  Users.GetCommentList(DoctorId ,CategoryCode, num, skip); 
           promise.then(function(data)
          { 
            $scope.a=data;
            for(var i=0;i<data.length;i++){
              if((data[i].imageURL=="")||(data[i].imageURL==null)){
                    data[i].imageURL="img/DefaultAvatar.jpg";
                  }
              else
              { 
                  data[i].imageURL=CONFIG.ImageAddressIP + CONFIG.ImageAddressFile+'/'+data[i].imageURL;
              }
              $scope.CommentList.push(data[i]);
            }

            //本次获取的数量少于num，则说明没有更多数据了
            if(data.length < num){
                $scope.moreComment=false;
                      $scope.alertText='没有更多数据...';
                $ionicLoading.show({
                  template: '没有更多数据',
                  noBackdrop: false,
                  duration: 1000,
                  hideOnStateChange: true
                });
            }
            else
            {
               $scope.moreComment=true;
            }

            },function(err) {   
          }).finally(function () {
              $scope.$broadcast('scroll.refreshComplete');
              $scope.$broadcast('scroll.infiniteScrollComplete');
          });     
       }

      //初始化
      GetCommentList(Storage.get("HealthCoachID"), '', 10, 0);
      
      //筛选
      $ionicPopover.fromTemplateUrl('templates/popover-sort.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
      });
       
      $scope.modouleList = [
        { text: "全部", value: " " },
        { text: "高血压", value: "HM1" },
        { text: "糖尿病", value: "HM2"},
        { text: "心衰", value: "HM3" },
      ];

      $scope.filterModoule= function(){
        $scope.CommentList=new Array();
        //$scope.alertText='正在努力加载中...';
        GetCommentList(Storage.get("HealthCoachID"), $scope.setting.selectedModoule, 10, 0); 
        $scope.popover.hide();
      };
}])

//写评论
.controller('SetCommentCtrl',['$scope', '$ionicHistory', '$ionicLoading','Users','Storage','$state',
   function($scope, $ionicHistory,$ionicLoading,Users,Storage,$state) {

      //初始化
      $scope.comment={score:5, commentContent:"",selectedModoule: ''};
      $scope.modouleList = [
        { text: "高血压", value: "HM1" },
        { text: "糖尿病", value: "HM2" },
        { text: "心衰", value: "HM3" }];
      
      //获取评论权限
      $scope.getCommentAuthority=function (item)
      {
         $scope.comment.selectedModoule = '';
         var promise =  Users.BasicDtlValue(Storage.get("UID"), item.value, 'Doctor', 1); //获取患者评价专员的权限
         promise.then(function(data)
         {
          $scope.b="2";
          $scope.c=data;
          if(data.result==Storage.get("HealthCoachID")){
           $scope.comment.selectedModoule = item.value;
         }
         else{
           $scope.comment.selectedModoule = '';
           $ionicLoading.show({
              template: '对不起，您没有评价'+item.text+'模块的权限',//item.text
              noBackdrop: false,
              duration: 1000,
              hideOnStateChange: true
            });
         }
          },function(err) { 
           $scope.comment.selectedModoule = '';
         });
      }


      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
       
       //评论星星初始化
      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: '#FFD700',//rgb(200, 200, 100)
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 5, 
        minRating: 1,
        readOnly:false,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
      };

      //评论星星点击改变分数
      $scope.ratingsCallback = function(rating) {
        $scope.comment.score = rating;
      };

      //上传评论-有效性验证
      $scope.deliverComment = function() {
        if($scope.comment.selectedModoule=='')
        {
          $ionicLoading.show({
              template: '请选择评价的模块',
              noBackdrop: false,
              duration: 1000,
              hideOnStateChange: true
            });
        }
        else if($scope.comment.commentContent.length <10)
        {
            $ionicLoading.show({
              template: '输入字数不足10字',
              noBackdrop: false,
              duration: 1000,
              hideOnStateChange: true
            });
        }
        
        else
        {
          SetComment();
        }
      };

      //上传评论-restful调用
     var SetComment= function()
     {

        var sendData={
          "DoctorId": Storage.get("HealthCoachID"),
          "CategoryCode": $scope.comment.selectedModoule,
          "Value": Storage.get("UID"),
          "Description": $scope.comment.commentContent,
          "SortNo": $scope.comment.score ,
          "piUserId": "sample string 6",
          "piTerminalName": "sample string 7",
          "piTerminalIP": "sample string 8",
          "piDeviceType": 9
        }
       var promise =  Users.SetComment(sendData); 
       promise.then(function(data){ 
          if(data.result=="数据插入成功"){
            $ionicLoading.show({
              template: "评论成功！",
              noBackdrop: false,
              duration: 500,
              hideOnStateChange: true
            });
            setTimeout(function(){
              $ionicHistory.goBack();
            },600);
          }
         },function(err) {   
       }); 
     } 
      
}])

// --------其他----------------
.controller('OthersCtrl',['$scope', '$ionicHistory', '$ionicSideMenuDelegate','$http',
   function($scope, $ionicHistory,$ionicSideMenuDelegate,$http) {

      $scope.toggleLeftMenu = function() {
          $ionicSideMenuDelegate.toggleLeft();
       };

     var chartBloodSugar='';
     var chartDataBloodSugar= [];

     $http.get('data/BloodSugar.json').success(function(data) {
         chartDataBloodSugar=data;  //json文件前两项分别为 初始线 和目标线
         createBloodSugarChart();
       });

       //画图函数-血糖
      function createBloodSugarChart()
      {
        
        //chartDataBloodSugar = generateChartData();
        console.log(chartDataBloodSugar);
        
        chartBloodSugar = AmCharts.makeChart("chartdivBloodSugar", {
    "type": "serial",
    "pathToImages": "img/amcharts/",
    "dataDateFormat": "YYYYMMDD-JJ:NN",
    "legend": {
        "useGraphSettings": true
    },
    "dataProvider": chartDataBloodSugar,
    "valueAxes": [{
        "id":"v1",
        "axisColor": "#FF6600",
        "axisThickness": 2,
        "gridAlpha": 0,
        "axisAlpha": 1,
        "position": "left"
    }],
    "graphs": [{
        "valueAxis": "v1",
        "lineColor": "#FF6600",
        "bullet": "round",
        "bulletBorderThickness": 1,
        "title": "早餐前血糖",
        "valueField": "Value",
       "fillAlphas": 0,
       "hidden": true
    }, {
        "valueAxis": "v2",
        "lineColor": "#FCD202",
        "bullet": "square",
        "bulletBorderThickness": 1,
        "title": "早餐后血糖",
        "valueField": "Value1",
        "fillAlphas": 0,
        "hidden": false
    }],
    "chartScrollbar": {},
    "chartCursor": {
        "cursorPosition": "mouse",
        "pan":true,
        "zoomable":false

    },
    "categoryField": "Time",
    "categoryAxis": {
        "parseDates": true,
        "axisColor": "#DADADA",
        "minorGridEnabled": true,
         "minPeriod": "mm",  //最小单位 分
         "dateFormats":[{period:'mm',format:'JJ:NN'},{period:'hh',format:'JJ:NN'},{period:'DD',format:'MM/DD'},{period:'WW',format:'MM/DD'},{period:'MM',format:'MM'},{period:'YYYY',format:'YYYY'}]
    }
    });
   }

}])

//LRZ 20151101
.controller('RiskCtrl',['$state','$scope','Patients','$state','$ionicSlideBoxDelegate','$ionicHistory','Storage',
  function($state,$scope,Patients,$state,$ionicSlideBoxDelegate,$ionicHistory,Storage){
    console.log('n');
    $scope.storage = function(n)
    {
      //console.log("$scope.newRisks");
       Storage.set('whichone', n);

    } 
    $scope.whichone =  Storage.get('whichone');

    $scope.userid =  Storage.get('UID');//"PID201506170002"
    Patients.getEvalutionResults($scope.userid).then(function(data){
      $scope.risks = data;
      // $scope.maxsortno = 243;
      // $scope.whichone = $state.params.num;
      for (var i = $scope.risks.length - 1; i >= 0; i--) {
        // var temp = 

        switch ($scope.risks[i].AssessmentType){
          case 'M1' : $scope.risks[i].AssessmentName = "高血压模块";       
                      var temp = $scope.risks[i].Result.split("||",8);
                      //分割字符串 获得血压数据 SBP||DBP||5 factors
                      $scope.risks[i].Result = temp[0];
                      $scope.risks[i].SBP = temp[1];
                      $scope.risks[i].DBP = temp[2];
                      $scope.risks[i].f1 = temp[3];
                      $scope.risks[i].f2 = temp[4];
                      $scope.risks[i].f3 = temp[5];
                      $scope.risks[i].f4 = temp[6];
                      $scope.risks[i].f5 = temp[7];
                      break;
          case 'M2' : $scope.risks[i].AssessmentName = "糖尿病模块";
                      //分割字符串 获得血糖数据 我也不知道有什么数据 8个
                      var temp = $scope.risks[i].Result.split("||",3);
                      $scope.risks[i].Result = temp[0];
                      $scope.risks[i].Period = temp[1];
                      $scope.risks[i].Glucose = temp[2];                    
        } 
      };

      //整合对象
      $scope.newRisks = [];
      for (var i = 0; i <= $scope.risks.length - 1; i++) {
          if(i == 0) {
            switch($scope.risks[i].AssessmentType){
                case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i],M2:undefined};break;
                case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i],M3:undefined};
            }
            $scope.newRisks.push(temp);
          }
          else{
            if($scope.risks[i].SortNo == $scope.newRisks[$scope.newRisks.length-1].num){
                switch($scope.risks[i].AssessmentType){
                  case 'M1' : $scope.newRisks[$scope.newRisks.length-1].M1 = $scope.risks[i];break;
                  case 'M2' : $scope.newRisks[$scope.newRisks.length-1].M2 = $scope.risks[i];
                }
            }
            else{
                switch($scope.risks[i].AssessmentType){
                  case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i]};break;
                  case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i]};
                }
                $scope.newRisks.push(temp);            
            }
          }        
      };
      console.log($scope.whichone);
      for (var i = $scope.newRisks.length - 1; i >= 0; i--) {
        if($scope.newRisks[i].num == $scope.whichone) {
          $scope.index = i;
          console.log($scope.newRisks[$scope.index]);
          break;
        }
      };
     
      //console.log($scope.newRisks[$scope.index]);  
      // //console.log("又画图了");
      $scope.data1 =  {
        "type": "serial",
        "theme": "light",
          "dataProvider": [{
              "type": "收缩压",
              "state1": 40+80,
              "state2": 20,
              "state3": 20,
              "state4": 20,
              "state5": 20,
              "now": (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
              "target": 120               //params

          }, {
              "type": "舒张压",
              "state1": 20+80,
              "state2": 20,
              "state3": 20,
              "state4": 20,
              "state5": 20,
              "now":  (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
              "target": 100             //params
          }],
          "valueAxes": [{
              "stackType": "regular",
              "axisAlpha": 0.3,
              "gridAlpha": 0,
               "minimum" :80
          }],
          "startDuration": 0.1,
          "graphs": [{
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><120 mmHg</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "很安全",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state1"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>120-140mmHg</b></span>",
              "fillAlphas": 0.8,
             // "labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "正常",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state2"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>140-160mmHg</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "良好",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state3"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>160-180mmHg</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "很危险",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state4"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>180mmHg</b></span>",
              "fillAlphas": 0.8,
              //"labelText": "[[value]]",
              "lineAlpha": 0.3,
              "title": "极度危险",
              "type": "column",
              "color": "#000000",
              "columnWidth": 0.618,
              "valueField": "state5"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
              "fillAlphas": 0,
              "columnWidth": 0.5,
              "lineThickness": 5,
              "labelText": "[[value]]"+" 目前",
              "clustered": false,
              "lineAlpha": 0.3,
              "stackable": false,
              "columnWidth": 0.618,
              "noStepRisers": true,
              "title": "目前",
              "type": "step",
              "color": "#cc4488",
              "valueField": "now"      
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
              "fillAlphas": 0,
              "columnWidth": 0.5,
              "lineThickness": 0,
              "columnWidth": 0.618,
              // "labelText": "[[value]]"+"目标",
              "clustered": false,
              "lineAlpha": 0.3,
              "stackable": false,
              "noStepRisers": true,
              "title": "目标",
              "type": "step",
              "color": "#00FFCC",
              "valueField": "target"      
          }],
          "categoryField": "type",
          "categoryAxis": {
              "gridPosition": "start",
              "axisAlpha": 80,
              "gridAlpha": 0,
              "position": "left"
          },
          "export": {
            "enabled": true
           }
      };
      $scope.data2 = {
          "type": "serial",
          "theme": "light",
          
          "autoMargins": true,
          "marginTop": 30,
          "marginLeft": 80,
          "marginBottom": 30,
          "marginRight": 50,
          "dataProvider": [{
              "category": "血糖浓度  (mmol/L)",
              "excelent": 4.6,
              "good": 6.1-4.6,
              "average": 7.2-6.1,
              "poor": 8.8-7.2,
              "bad": 1,
              "bullet": (typeof($scope.newRisks[$scope.index].M2) === 'undefined' ? 3:$scope.newRisks[$scope.index].M2.Glucose)
          }],
          "valueAxes": [{
              "maximum": 10,
              "stackType": "regular",
              "gridAlpha": 0,
              "offset":10,
              "minimum" :3

          }],
          "startDuration": 0.13,
          "graphs": [ {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><4.6 mmol/L</b></span>",
              "fillAlphas": 0.8,
              "lineColor": "#19d228",
              "showBalloon": true,
              "type": "column",
              "valueField": "excelent"
          }, {
            "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>4.6 -6.1 mmol/L</b></span>",
              "fillAlphas": 0.8,
              "lineColor": "#b4dd1e",
              "showBalloon": true,
              "type": "column",
              "valueField": "good"
          }, {
            "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>6.1-7.2 mmol/L</b></span>",
              "fillAlphas": 0.8,
              "lineColor": "#f4fb16",
              "showBalloon": true,
              "type": "column",
              "valueField": "average"
          }, {
            "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>7.2-8.8 mmol/L</b></span>",
              "fillAlphas": 0.8,
              "lineColor": "#f6d32b",
              "showBalloon": true,
              "type": "column",
              "valueField": "poor"
          }, {
            "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>8.8-9 mmol/L</b></span>",
              "fillAlphas": 0.8,
              "lineColor": "#fb7116",
              "showBalloon": true,
              "type": "column",
              "valueField": "bad"
          }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>9 mmol/L</b></span>",
              "clustered": false,
              "columnWidth": 0.5,
              "noStepRisers": true,
              "lineThickness": 3,
              "fillAlphas": 0,
              "labelText": "[[value]]"+" 目前",
              "lineColor": "#0080FF", 
              "stackable": false,
              "showBalloon": true,
              "type": "step",
              "valueField": "bullet"
          }],
          "rotate": false,
          "columnWidth": 1,
          "categoryField": "category",
          "categoryAxis": {
              "gridAlpha": 0,
              "position": "left",
             
          }
      };
      AmCharts.makeChart("riskinfo_chartdiv",$scope.data1);
      // AmCharts.makeChart("riskinfo_chartdiv",$scope.data2);
      
      // //console.log("又画图了");

      $scope.data = { showDelete: false, showReorder: false };
      $scope.config = $scope.config || {dbtshow: false};
    });
 

  $scope.doRefresh = function(){
    //console.log("doing refreshing");
    // $scope.userid = Storage.get('UID');
  // $scope.userid = "PID201506170002";
    $scope.userid = Storage.get('UID');
    Patients.getEvalutionResults($scope.userid).then(function(data){
    $scope.risks = data;
    $scope.maxsortno = 243;
    for (var i = $scope.risks.length - 1; i >= 0; i--) {
      // var temp = 

      switch ($scope.risks[i].AssessmentType){
        case 'M1' : $scope.risks[i].AssessmentName = "高血压模块";       
                    var temp = $scope.risks[i].Result.split("||",8);
                    //分割字符串 获得血压数据 SBP||DBP||5 factors
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].SBP = temp[1];
                    $scope.risks[i].DBP = temp[2];
                    $scope.risks[i].f1 = temp[3];
                    $scope.risks[i].f2 = temp[4];
                    $scope.risks[i].f3 = temp[5];
                    $scope.risks[i].f4 = temp[6];
                    $scope.risks[i].f5 = temp[7];
        case 'M2' : $scope.risks[i].AssessmentName = "糖尿病模块";
                    var temp = $scope.risks[i].Result.split("||",3);
                    $scope.risks[i].Result = temp[0];
                    $scope.risks[i].Period = temp[1];
                    $scope.risks[i].Glucose = temp[2];
                    //分割字符串 获得血糖数据 我也不知道有什么数据 8个
      } 
    };

    //整合对象
    $scope.newRisks = [];
    for (var i = 0; i <= $scope.risks.length - 1; i++) {
        if(i == 0) {
          switch($scope.risks[i].AssessmentType){
              case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i],M2:undefined};break;
              case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i],M3:undefined};
          }
          $scope.newRisks.push(temp);
        }
        else{
          if($scope.risks[i].SortNo == $scope.newRisks[$scope.newRisks.length-1].num){
              switch($scope.risks[i].AssessmentType){
                case 'M1' : $scope.newRisks[$scope.newRisks.length-1].M1 = $scope.risks[i];break;
                case 'M2' : $scope.newRisks[$scope.newRisks.length-1].M2 = $scope.risks[i];
              }
          }
          else{
              switch($scope.risks[i].AssessmentType){
                case 'M1' : var temp = {num: $scope.risks[i].SortNo, M1:$scope.risks[i]};break;
                case 'M2' : var temp = {num: $scope.risks[i].SortNo, M2:$scope.risks[i]};
              }
              $scope.newRisks.push(temp);            
          }
        }        
    };
    //console.log($scope.newRisks);
    });
    // //console.log("in controller");
    // //console.log($scope.risks);
        $scope.data1 =  {
          "type": "serial",
          "theme": "light",
            "dataProvider": [{
                "type": "收缩压",
                "state1": 40+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now": (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.SBP), //params
                "target": 120               //params

            }, {
                "type": "舒张压",
                "state1": 20+80,
                "state2": 20,
                "state3": 20,
                "state4": 20,
                "state5": 20,
                "now":  (typeof($scope.newRisks[$scope.index].M1) === 'undefined' ? 0:$scope.newRisks[$scope.index].M1.DBP),         //params
                "target": 100             //params
            }],
            "valueAxes": [{
                "stackType": "regular",
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                 "minimum" :80
            }],
            "startDuration": 0.1,
            "graphs": [{
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><120 mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很安全",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state1"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>120-140mmHg</b></span>",
                "fillAlphas": 0.8,
               // "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "正常",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state2"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>140-160mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "良好",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state3"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>160-180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "很危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state4"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>180mmHg</b></span>",
                "fillAlphas": 0.8,
                //"labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "极度危险",
                "type": "column",
                "color": "#000000",
                "columnWidth": 0.618,
                "valueField": "state5"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 5,
                "labelText": "[[value]]"+" 目前",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "columnWidth": 0.618,
                "noStepRisers": true,
                "title": "目前",
                "type": "step",
                "color": "#cc4488",
                "valueField": "now"      
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0,
                "columnWidth": 0.5,
                "lineThickness": 0,
                "columnWidth": 0.618,
                // "labelText": "[[value]]"+"目标",
                "clustered": false,
                "lineAlpha": 0.3,
                "stackable": false,
                "noStepRisers": true,
                "title": "目标",
                "type": "step",
                "color": "#00FFCC",
                "valueField": "target"      
            }],
            "categoryField": "type",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 80,
                "gridAlpha": 0,
                "position": "left"
            },
            "export": {
              "enabled": true
             }
        };
        $scope.data2 = {
            "type": "serial",
            "theme": "light",
            
            "autoMargins": true,
            "marginTop": 30,
            "marginLeft": 80,
            "marginBottom": 30,
            "marginRight": 50,
            "dataProvider": [{
                "category": "血糖浓度  (mmol/L)",
                "excelent": 4.6,
                "good": 6.1-4.6,
                "average": 7.2-6.1,
                "poor": 8.8-7.2,
                "bad": 1,
                "bullet": (typeof($scope.newRisks[$scope.index].M2) === 'undefined' ? 3:$scope.newRisks[$scope.index].M2.Glucose)
            }],
            "valueAxes": [{
                "maximum": 10,
                "stackType": "regular",
                "gridAlpha": 0,
                "offset":10,
                "minimum" :3

            }],
            "startDuration": 0.13,
            "graphs": [ {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b><4.6 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#19d228",
                "showBalloon": true,
                "type": "column",
                "valueField": "excelent"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>4.6 -6.1 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#b4dd1e",
                "showBalloon": true,
                "type": "column",
                "valueField": "good"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>6.1-7.2 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f4fb16",
                "showBalloon": true,
                "type": "column",
                "valueField": "average"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>7.2-8.8 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#f6d32b",
                "showBalloon": true,
                "type": "column",
                "valueField": "poor"
            }, {
              "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>8.8-9 mmol/L</b></span>",
                "fillAlphas": 0.8,
                "lineColor": "#fb7116",
                "showBalloon": true,
                "type": "column",
                "valueField": "bad"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>>9 mmol/L</b></span>",
                "clustered": false,
                "columnWidth": 0.5,
                "noStepRisers": true,
                "lineThickness": 3,
                "fillAlphas": 0,
                "labelText": "[[value]]"+" 目前",
                "lineColor": "#0080FF", 
                "stackable": false,
                "showBalloon": true,
                "type": "step",
                "valueField": "bullet"
            }],
            "rotate": false,
            "columnWidth": 1,
            "categoryField": "category",
            "categoryAxis": {
                "gridAlpha": 0,
                "position": "left",
               
            }
        };
        $scope.chart = AmCharts.makeChart("chartdiv",$scope.data1);
        $scope.chart2 = AmCharts.makeChart("chartdiv2",$scope.data2);
    $scope.data = { showDelete: false, showReorder: false };
    $scope.dbtshow = false;
    $scope.$broadcast('scroll.refreshComplete'); 
  }

  
  $scope.onClickEvaluation = function(){
      //open a new page to collect patient info  
      $state.go('addpatient.riskquestion');
      // get another result
  }

  $scope.onClickEvaluation1 = function(){
    $state.go('Independent.riskquestion');
  }
  $scope.slideHasChanged = function (_index){
    // //console.log(_index);
    // $ionicSlideBoxDelegate.currentIndex();
    if(_index == 1) {
      // $scope.$apply(function () {
        AmCharts.makeChart("riskinfo_chartdiv",$scope.data2);
      // });
    }
    else {
      // $scope.$apply(function () {
        AmCharts.makeChart("riskinfo_chartdiv",$scope.data1);
      // });
    }
    console.log($scope.config);
  }

  $scope.onClickBackward = function(){
      // $state.go("risk");
      $state.go('addpatient.risk');
  }

  $scope.onClickBackward1 = function(){
      // $state.go("risk");
      $state.go('Independent.risk');
  }

  $scope.NextPage = function(){
    window.location.href="/#/addpatient/create";
  };
  $scope.BacktoManage = function(){
    window.location.href="/#/manage/plan";
  };
  $scope.toggleStar = function(item) {
    item.star = !item.star;
  }

  $scope.onChangeChartData = function(sbp,dbp){
      $scope.marker = sbp;
      if(sbp === undefined || dbp === undefined || $scope.chart === undefined) return;
      //console.log(sbp);
      var temp1 = {
          "type": "收缩压",
          "state1": 40+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(sbp), //params
          "target": 120               //params

      };
      var temp2 = {
          "type": "舒张压",
          "state1": 20+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(dbp), //params
          "target": 100               //params

      };
      //console.log("push");
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.push(temp1);
      $scope.chart.dataProvider.push(temp2);
      // $scope.chart.dataProvider["now"] = sbp;
      $scope.chart.validateData();
      $scope.chart.validateNow();
      // $scope.chart2.validateData();
      //console.log($scope.chart);
  }

   // //console.log("controller初始化的函数跑了一遍结束"); 
 
}])


//LRZ 20151117 新的风险评估页面列表controller
.controller('NewRiskCtrl',['$state','$scope','Patients','$state','$ionicSlideBoxDelegate','$ionicHistory','Storage','RiskService','$ionicLoading','$timeout',
  function($state,$scope,Patients,$state,$ionicSlideBoxDelegate,$ionicHistory,Storage,RiskService,$ionicLoading,$timeout){
  
    $scope.setItemNum=function(num){
      Storage.set("risk_num", num)
    }

    console.log("doing refreshing");
    RiskService.initial();

    $ionicLoading.show({
      template: "载入中"
    });

    $timeout(function(){
      $ionicLoading.hide();
    },6000);


      // $scope.chart = AmCharts.makeChart("chartdiv",$scope.data1);
      // $scope.chart2 = AmCharts.makeChart("chartdiv2",$scope.data2);
    
    $scope.data = { showDelete: false, showReorder: false };
    

  $scope.doRefresh = function(){
    RiskService.initial();
  }

  
  $scope.onClickEvaluation = function(){
      //open a new page to collect patient info  
      //$state.go('addpatient.riskquestion');
  }
  $scope.onClickEvaluation1 = function(){
    //$state.go('Independent.riskquestion');
  }

  $scope.slideHasChanged = function (_index){
    // console.log(_index);
    // $ionicSlideBoxDelegate.currentIndex();
    if(_index == 1) $scope.dbtshow = true;
    else $scope.dbtshow = false;
    // console.log($scope.description);
  }

  $scope.toggleStar = function(item) {
    item.star = !item.star;
  }

  $scope.onChangeChartData = function(sbp,dbp){
      $scope.marker = sbp;
      if(sbp === undefined || dbp === undefined || $scope.chart === undefined) return;
      console.log(sbp);
      var temp1 = {
          "type": "收缩压",
          "state1": 40+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(sbp), //params
          "target": 120               //params

      };
      var temp2 = {
          "type": "舒张压",
          "state1": 20+80,
          "state2": 20,
          "state3": 20,
          "state4": 20,
          "state5": 20,
          "now": parseInt(dbp), //params
          "target": 100               //params

      };
      console.log("push");
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.pop();
      $scope.chart.dataProvider.push(temp1);
      $scope.chart.dataProvider.push(temp2);
      // $scope.chart.dataProvider["now"] = sbp;
      $scope.chart.validateData();
      $scope.chart.validateNow();
      // $scope.chart2.validateData();
      console.log($scope.chart);
  }

   // console.log("controller初始化的函数跑了一遍结束"); 
  $scope.$on('NewEvaluationSubmit', function () {
    console.log("检测到有新的提交，刷新");
    RiskService.initial();

  })

  $scope.$on('RisksGet',function(){
    console.log("Controller knows RisksGet");
    $scope.$broadcast('scroll.refreshComplete');
    $scope.newRisks = RiskService.getRiskList();
    // console.log($scope.newRisks);
    $ionicLoading.hide();
  })

  $scope.$on('RisksGetFail',function(){
   $ionicLoading.hide();
  })
}])

//LRZ 20151117 新的风险评估页面细节controller
.controller('RiskDtlCtrl',['$state','$scope','RiskService','$ionicSlideBoxDelegate','Storage','$timeout',function($state,$scope,RiskService,$ionicSlideBoxDelegate,Storage,$timeout){
  // $scope.chartDone = false;
  //$scope.whichone = $state.params.num;
  $scope.whichone = Storage.get("risk_num");

  console.log($scope.whichone);
  $scope.chart = null;
  $scope.isHiding = false;
  if(RiskService.getRiskList() == [])  {
    RiskService.initial();
  }
  
  $scope.Mlist = [];

  var sortMlist = function(){
     if($scope.item.M1show) {
      $scope.item.M1.flist = [{name:'高血压发病率',f:$scope.item.M1.f1},
      {name:'高血压五年死亡率',f:$scope.item.M1.f2},
      {name:'心血管疾病',f:$scope.item.M1.f3},
      {name:'中风十年发生率',f:$scope.item.M1.f4},
      {name:'心衰率',f:$scope.item.M1.f5}];
      $scope.Mlist.push($scope.item.M1);
     }
     if($scope.item.M2show) $scope.Mlist.push($scope.item.M2);
     if($scope.item.M3show) {
      $scope.item.M3.flist = [{name:'一年死亡率',f:$scope.item.M3.f1},
      {name:'三年死亡率',f:$scope.item.M3.f2}];
      $scope.Mlist.push($scope.item.M3);
     }
     console.log($scope.Mlist);
  }
  // console.log($scope.myslide);
  // console.log($scope.riskSingle);



    //根据state传入的SortNo 从Service 预载入的列表中取出数据
  $scope.index = RiskService.getIndexBySortNo($scope.whichone);
  $scope.item = RiskService.getSingleRisk($scope.index);
  if(typeof($scope.item) != 'undefined') sortMlist();

  // 得到画图数据
  // if($scope.item.M1show != false)
  //   $scope.chartData = RiskService.getGraphData('M1',$scope.index);
  // else if ($scope.item.M2show != false){
  //   // $scope.myslide.slide(1,500);
  //   $scope.chartData = RiskService.getGraphData('M2',$scope.index);    
  // }
  // else{
  //   // $scope.myslide.slide(2,500);
  //   $scope.chartData = RiskService.getGraphData('M3',$scope.index);  
  // }
  
  console.log($scope.item);

  // AmCharts.makeChart('riskchart', $scope.chartData);
  // $scope.chartDone = true;
  // console.log($scope.chart);
  
  $scope.myslide = $ionicSlideBoxDelegate.$getByHandle('riskhandle');
  // $scope.$apply();

  // chart.validateData();
  // chart.validateNow();
  // chart.write('chartdiv222');
  // $scope.chartDone = true;
  // chart.handleResize();
  // 画图
  // 判断 有几个图显示几个图
  // var p_chart = AmCharts.makeChart("riskchart",chart,500);
  // $scope.chartDone = true;
  
  //slidebox控制
  $scope.$on('$ionicView.afterEnter',function(){
    
    $scope.slideHasChanged(0);
    // console.log($scope.myslide);
    // $timeout(5000);
    // if($scope.item.M1show == true){
    //   null;      
    // }
    // // $scope.chartData = RiskService.getGraphData('M1',$scope.index);
    // else if ($scope.item.M2show == true){
    //   // console.log('no hyper'); 
    //   $scope.myslide.slide(1,50);
    // // $scope.chartData = RiskService.getGraphData('M2',$scope.index);    
    // }
    // else{
    //   $scope.myslide.slide(2,50);
    //   // $scope.chartData = RiskService.getGraphData('M3',$scope.index);  
    // }
  })

$scope.$on('RisksGet',function(){
  $scope.index = RiskService.getIndexBySortNo($scope.whichone);
  $scope.item = RiskService.getSingleRisk($scope.index);
   if(typeof($scope.item) != 'undefined') sortMlist();
})

  $scope.slideHasChanged = function($index){
    var ii = $index;
    console.log(ii);
    // console.log($scope.item.M1show);
    // var status = 0;
    // if(M1show && M2Show && M3show) 
    // switch(ii){
    //   case 0: if($scope.item.M1show == false){
    //             if($scope.item.M2show == false){
    //               $scope.myslide.slide(2,500);
    //             }
    //             else $scope.myslide.slide(1,500);                 
    //           }
    //           else break;
    //   case 1: if($scope.item.M2show == false){                
    //           }
    //           else break;
    //   case 2:if($scope.item.M3show == false){
    //             if($scope.item.M2show == false){
    //               $scope.myslide.slide(1,500);break;
    //             }
    //             else $scope.myslide.slide(0,500); break;                
    //           }
    //           else break;
    //   }

    // switch(ii){
    //   case 0: if($scope.item.M1show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData    = RiskService.getGraphData('M1',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData); break;        
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    //   case 1: if($scope.item.M2show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData    = RiskService.getGraphData('M2',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData);break;        
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.dataProvider  = $scope.chartData.dataProvider;
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    //   case 2: if($scope.item.M3show == true){
    //             $scope.isHiding = false;
    //             $scope.chartData     = RiskService.getGraphData('M3',$scope.index);
    //             AmCharts.makeChart('riskchart', $scope.chartData); 
    //           }
    //           else {
    //               $scope.isHiding = true; break;
    //           }
    //           // $scope.chart.validateData();
    //           // $scope.chart.validateNow(true,false);
    // }

    switch($scope.Mlist[ii].AssessmentType){
      case 'M1' : $scope.chartData     = RiskService.getGraphData('M1',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
      case 'M2' : $scope.chartData     = RiskService.getGraphData('M2',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
      case 'M3' : $scope.chartData     = RiskService.getGraphData('M3',$scope.index);
                        AmCharts.makeChart('riskchart', $scope.chartData); break;
    }
  }

}])

//----------------侧边栏----------------
//个人信息
.controller('personalInfocontroller',['$scope','$ionicHistory','$state','$ionicPopup','$resource','Storage','Data','CONFIG','$ionicLoading','$ionicPopover','Camera',
   function($scope, $ionicHistory, $state, $ionicPopup, $resource, Storage, Data,CONFIG, $ionicLoading, $ionicPopover, Camera) {             
      // 返回键
      $scope.nvGoback = function() {
        $ionicHistory.goBack();
       }
      // 收缩框
      var show1 = true;
      $scope.isShown1 = function() {
        return show1;
      };
      var show2 = false;
      $scope.toggle2 = function() {
        show2 = !show2;
      };
      $scope.isShown2 = function() {
        return show2;
      };
      var show3 = false;
      $scope.toggle3 = function() {
        show3 = !show3;
      };
      $scope.isShown3 = function() {
        return show3;
      };
      var show4 = false;
      $scope.toggle4 = function() {
        show4 = !show4;
      };
      $scope.isShown4 = function() {
        return show4;
      };   
      // 获取医保类型
      $scope.InsuranceTypes = {}; // 初始化
      Data.Dict.GetInsuranceType({}, 
            function (success) {
              $scope.InsuranceTypes = success;  
              // console.log(success[1].Name); 
      }); 
      // 获取血型类型
      $scope.BloodTypes = {}; // 初始化
      Data.Dict.GetTypeList({Category:"AboBloodType"}, 
            function (success) {
              $scope.BloodTypes = success;  
              // console.log($scope.BloodTypes); 
      }); 
      // 获取性别类型
      $scope.Genders = {}; // 初始化
      Data.Dict.GetTypeList({Category:"SexType"}, 
            function (success) {
              $scope.Genders = success;  
              // console.log($scope.Genders); 
      }); 
      // 首先定义基本/详细信息数组    
      $scope.BasicInfo ={};
      $scope.BasicDtlInfo ={};
      // 后台服务器地址
      var UserId = Storage.get("UID");
      var urltemp1 = UserId + '/BasicInfo';
      var urltemp2 = UserId + '/BasicDtlInfo';
      // 读取数据库患者基本/详细信息  
      var init_personalInfo = function(){
        $ionicLoading.show({
          template: '<ion-spinner style="height:2em;width:2em"></ion-spinner>'
         });
          Data.Users.GetPatBasicInfo({route:urltemp1}, 
                        function (success, headers) {
                          $scope.BasicInfo = success;
                          Data.Users.GetPatientDetailInfo({route:urltemp2}, 
                            function (success, headers) {
                              $scope.BasicDtlInfo = success;
                              // console.log(success.Birthday);
                              // 将string转化成number(Int型数据)
                              $scope.BasicDtlInfo.Height = parseInt(success.Height);
                              $scope.BasicDtlInfo.Weight = parseInt(success.Weight);
                              $scope.BasicDtlInfo.IDNo = parseInt(success.IDNo);
                              $scope.BasicDtlInfo.PhoneNumber = parseInt(success.PhoneNumber);
                              $scope.BasicDtlInfo.EmergencyContactPhoneNumber = parseInt(success.EmergencyContactPhoneNumber);
                              // 读入头像
                              if( ($scope.BasicDtlInfo.PhotoAddress=="") || ($scope.BasicDtlInfo.PhotoAddress==null)){
                                $scope.imgurl = "img/DefaultAvatar.jpg";
                              } 
                              else{
                                $scope.imgurl = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile + "/" + $scope.BasicDtlInfo.PhotoAddress;
                              };
                              // 防止生日在注册时服务器挂掉？？？这次怎么不管用了？？
                              // if ((success.Birthday == null) || (success.Birthday == "")) {
                              //   $scope.BasicInfo.Birthday = "请输入您的出生日期";
                              // };
                          }); // 详细信息读入完成 
          }); // 基本信息读入完成
       setTimeout(function(){$ionicLoading.hide();},400);
      };  
      init_personalInfo();
      // 设置日期
      // 日历 
      // $scope.birthday="请填写您的出生日期";
      var datePickerCallback = function (val) {
        if (typeof(val) === 'undefined') {
          console.log('No date selected');
        } else {
          $scope.datepickerObject.inputDate=val;
          var dd=val.getDate();
          var mm=val.getMonth()+1;
          var yyyy=val.getFullYear();
          var d=dd<10?("0"+String(dd)):String(dd);
          var m=mm<10?("0"+String(mm)):String(mm);
          var birthday=yyyy.toString()+m+d;
          // var birthday=yyyy+'/'+mm+'/'+dd;
          $scope.BasicInfo.Birthday=birthday;
        }
      };
      var  monthList=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
      var weekDaysList=["日","一","二","三","四","五","六"];
      $scope.datepickerObject = {
        titleLabel: '出生日期',  //Optional
        todayLabel: '今天',  //Optional
        closeLabel: '取消',  //Optional
        setLabel: '设置',  //Optional
        setButtonType : 'button-assertive',  //Optional
        todayButtonType : 'button-assertive',  //Optional
        closeButtonType : 'button-assertive',  //Optional
        inputDate: new Date(),    //Optional
        mondayFirst: false,    //Optional
        //disabledDates: disabledDates, //Optional
        weekDaysList: weekDaysList,   //Optional
        monthList: monthList, //Optional
        templateType: 'popup', //Optional
        showTodayButton: 'false', //Optional
        modalHeaderColor: 'bar-positive', //Optional
        modalFooterColor: 'bar-positive', //Optional
        from: new Date(1900, 1, 1),   //Optional
        to: new Date(),    //Optional
        callback: function (val) {    //Mandatory
          datePickerCallback(val);
        }
      };  
       //////////////////////////////////////////////////////////////////////////
      $scope.change = function(d)
      {
        console.log(d);
      }
      //////////////////////////////////////////////////////////////////////////
      // 修改信息后的保存
      $scope.SaveInfo = function(a,b,c){
        // console.log(a);
        if (a == true){
          $ionicLoading.show({
           template: '保存失败,请输入正确的身份证号',
           duration:1000
          });
        }
        else if(b == true){
          $ionicLoading.show({
           template: '保存失败,请输入正确的联系电话',
           duration:1000
          });
        }
        else if(c == true){
          $ionicLoading.show({
           template: '保存失败,请输入正确的紧急联系人电话',
           duration:1000
          });
        }
        else{
          // 考虑到时序的问题，中间值必须在SaveInfo内赋值
          var temp_SetPatBasicInfo = {UserId:$scope.BasicInfo.UserId,
                                      UserName:$scope.BasicInfo.UserName,
                                      Birthday:$scope.BasicInfo.Birthday,
                                      Gender:$scope.BasicInfo.Gender,
                                      BloodType:$scope.BasicInfo.BloodType,
                                      IDNo:$scope.BasicInfo.IDNo,
                                      DoctorId:$scope.BasicInfo.DoctorId,
                                      InsuranceType:$scope.BasicInfo.InsuranceType,
                                      InvalidFlag:"9",
                                      piUserId:extraInfo.postInformation().revUserId,
                                      piTerminalName:extraInfo.postInformation().TerminalName,
                                      piTerminalIP:extraInfo.postInformation().TerminalIP,
                                      piDeviceType:extraInfo.postInformation().DeviceType};
          var temp_PostPatBasicInfoDetail = [{Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "BodySigns",
                                            ItemCode: "Height",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.Height,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "BodySigns",
                                            ItemCode: "Weight",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.Weight,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient:  $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact001_1",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.IDNo,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient:  $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact001_3",
                                            ItemSeq: "1",
                                            Value:$scope.BasicDtlInfo.Nationality,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient:  $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact001_2",
                                            ItemSeq: "1",
                                            Value:$scope.BasicDtlInfo.Occupation,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact002_1",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.PhoneNumber,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact002_2",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.HomeAddress,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact002_3",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.EmergencyContact,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          },
                                          { Patient: $scope.BasicDtlInfo.UserId,
                                            CategoryCode: "Contact",
                                            ItemCode: "Contact002_4",
                                            ItemSeq: "1",
                                            Value: $scope.BasicDtlInfo.EmergencyContactPhoneNumber,
                                            Description: "",
                                            SortNo:"1",
                                            revUserId: extraInfo.postInformation().revUserId,
                                            TerminalName: extraInfo.postInformation().TerminalName,
                                            TerminalIP: extraInfo.postInformation().TerminalIP,
                                            DeviceType: extraInfo.postInformation().DeviceType
                                          }];
          // 基本信息的修改
          Data.Users.SetPatBasicInfo(temp_SetPatBasicInfo, 
              function (success, headers) {
                if (success.result="数据插入成功") {
                    // 详细信息的修改
                    Data.Users.PostPatBasicInfoDetail(temp_PostPatBasicInfoDetail,
                                                    function (success, headers) {
                                                      if (success.result="数据插入成功") {
                                                        console.log("数据插入成功");
                                                        // state.go和再次调用函数都可以
                                                        // $state.go('sideMenu.personalInfo');
                                                        init_personalInfo();
                                                        // location.reload(); 这种刷新方法会使返回键失效
                                                        $ionicLoading.show({
                                                           template: '保存成功',
                                                           duration:1000
                                                          });
                                                      };
                                                    });
                }// if语句结束，即详细信息的修改结束
              },// 数据插入成功的function结束
              function (err) {
                    console.log(err);
              }// 数据插入失败的function结束
          );// 基本信息的修改结束
        };// if语句结束
      };// 点击事件的定义结束

      //-----------------------上传头像---------------------
      // ionicPopover functions 弹出框的预定义
        //--------------------------------------------
        // .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(popover) {
        $scope.popover = popover;
      });
      $scope.openPopover = function($event) {
        $scope.popover.show($event);
      };
      $scope.closePopover = function() {
        $scope.popover.hide();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.popover.remove();
      });
      // Execute action on hide popover
      $scope.$on('popover.hidden', function() {
        // Execute action
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
        // Execute action
      });
      // 上传头像的点击事件----------------------------
      $scope.onClickCamera = function($event){
        $scope.openPopover($event);
      };
      // 弹出框中取消键的点击事件------------------------
      $scope.onClickCameraCancel = function(){
        $scope.closePopover();
      };
      // 上传照片并将照片读入页面-------------------------
      var photo_upload_display = function(imgURI){
        // 给照片的名字加上时间戳
        var temp_photoaddress = UserId + "_" + new Date().getTime() + ".jpg";
        // 存入服务器
        Camera.uploadPicture(imgURI, temp_photoaddress).then(function(r){
            // 将图片的名字（UserId）插入详细信息中的PhotoAddress
            Data.Users.PostPatBasicInfoDetail([{Patient: UserId,
                                                CategoryCode: "Contact",
                                                ItemCode: "Contact001_4",
                                                ItemSeq: "1",
                                                Value: temp_photoaddress,
                                                Description: "",
                                                SortNo:"1",
                                                revUserId: extraInfo.postInformation().revUserId,
                                                TerminalName: extraInfo.postInformation().TerminalName,
                                                TerminalIP: extraInfo.postInformation().TerminalIP,
                                                DeviceType: extraInfo.postInformation().DeviceType
                                              }],
                                              function (success, headers) {
                                                if (success.result="数据插入成功") { 
                                                  // Camera.downloadPicture();
                                                  init_personalInfo();
                                                };
                                              });// 重新读入照片结束
        }) // 上传照片结束
      };

      // 相册键的点击事件---------------------------------
      $scope.onClickCameraPhotos = function(){        
       // console.log("选个照片"); 
       $scope.choosePhotos();
       $scope.closePopover();
      };      
      $scope.choosePhotos = function() {
       Camera.getPictureFromPhotos().then(function(data) {
          // data里存的是图像的地址
          // console.log(data);
          var imgURI = data; 
          photo_upload_display(imgURI);
        }, function(err) {
          // console.err(err);
          var imgURI = undefined;
        });// 从相册获取照片结束
      }; // function结束
      // 照相机的点击事件----------------------------------
      $scope.getPhoto = function() {
        // console.log("要拍照了！");
        $scope.takePicture();
        $scope.closePopover();
      };
      $scope.takePicture = function() {
       Camera.getPicture().then(function(data) {
          // data里存的是图像的地址
          // console.log(data);
          var imgURI = data;
          photo_upload_display(imgURI);
        }, function(err) {
            // console.err(err);
            var imgURI = undefined;
        })// 照相结束
      }; // function结束

}])
//我的二维码
.controller('myQrcodecontroller', function ($scope, $ionicHistory,Storage,Data,CONFIG) {

    $scope.nvGoback = function() {
       $ionicHistory.goBack();
      }

    $scope.bar = Storage.get("UID");
    $scope.qr_Image = "img/DefaultAvatar.jpg";
    $scope.qr_UserName ="无";
    $scope.qr_GenderText ="无";

    var urltemp1 = Storage.get("UID") + '/BasicInfo';
    Data.Users.GetPatBasicInfo({route:urltemp1}, function (success, headers) {
        $scope.qr_UserName = success.UserName;
        $scope.qr_GenderText= success.GenderText;
         }, function (err) {

    });

    var urltemp2 = Storage.get('UID') + '/BasicDtlInfo';
    Data.Users.GetPatientDetailInfo({route:urltemp2}, 
       function (success, headers) {
        //console.log(success);
          if( (success.PhotoAddress=="") || (success.PhotoAddress==null))
          {
            $scope.qr_Image = "img/DefaultAvatar.jpg";
          }
          else 
          {
            $scope.qr_Image = CONFIG.ImageAddressIP + CONFIG.ImageAddressFile + "/" + success.PhotoAddress;
          } 

       }, 
      function (err) {
        // 目前好像不存在userid不对的情况，都会返回一个结果
      });
})
;


