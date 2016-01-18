angular.module('zjubme.services', ['ionic','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://121.43.107.106:9000/Api/v1/',
  wsServerIP : "ws://" + "121.43.107.106" + ":4141",
  role: "Patient",
  //revUserId: "",
  //TerminalName: "",
  //TerminalIP: "",
  DeviceType: '1',
  ImageAddressIP: "http://121.43.107.106:8088",
  ImageAddressFile : "/PersonalPhoto",
  // ImageAddress = ImageAddressIP + ImageAddressFile + "/" + DoctorId + ".jpg";
  consReceiptUploadPath: 'cons/receiptUpload',
  userResUploadPath: 'user/resUpload',

  cameraOptions: {  // 用new的方式创建对象? 可以避免引用同一个内存地址, 可以修改新的对象而不会影响这里的值: 用angular.copy
    quality: 75,
    destinationType: 0,  // Camera.DestinationType = {DATA_URL: 0, FILE_URI: 1, NATIVE_URI: 2};
    sourceType: 0,  // Camera.PictureSourceType = {PHOTOLIBRARY: 0, CAMERA: 1, SAVEDPHOTOALBUM: 2};
    allowEdit: true,  // 会导致照片被正方形框crop, 变成正方形的照片
    encodingType: 0,  // Camera.EncodingType = {JPEG: 0, PNG: 1};
    targetWidth: 100,  // 单位是pix/px, 必须和下面的属性一起出现, 不会改变原图比例?
    targetHeight: 100,
    // mediaType: 0,  // 可选媒体类型: Camera.MediaType = {PICTURE: 0, VIDEO: 1, ALLMEDIA: 2};
    // correctOrientation: true,
    saveToPhotoAlbum: false,
    popoverOptions: { 
      x: 0,
      y:  32,
      width : 320,
      height : 480,
      arrowDir : 15  // Camera.PopoverArrowDirection = {ARROW_UP: 1, ARROW_DOWN: 2, ARROW_LEFT: 4, ARROW_RIGHT: 8, ARROW_ANY: 15};
    },
    cameraDirection: 0  // 默认为前/后摄像头: Camera.Direction = {BACK : 0, FRONT : 1};
  },

  uploadOptions: {
    // fileKey: '',  // The name of the form element. Defaults to file. (DOMString)
    // fileName: '.jpg',  // 后缀名, 在具体controller中会加上文件名; 这里不能用fileName, 否则将CONFIG.uploadOptions赋值给任何变量(引用赋值)后, 如果对该变量的同名属性fileName的修改都会修改CONFIG.uploadOptions.fileName
    fileExt: '.jpg',  // 后缀名, 在具体controller中会加上文件名
    httpMethod: 'POST',  // 'PUT'
    mimeType: 'image/jpg',  // 'image/png'
    //params: {_id: $stateParams.consId},
    // chunkedMode: true,
    //headers: {Authorization: 'Bearer ' + Storage.get('token')}
  }
  })

// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function(key, value) {
      $window.localStorage.setItem(key, value);
    },
    get: function(key) {
      return $window.localStorage.getItem(key);
    },
    rm: function(key) {
      $window.localStorage.removeItem(key);
    },
    clear: function() {
      $window.localStorage.clear();
    }
  };
}])

//极光推送服务 TDY 20151026
.factory('jpushService',['$http','$window',function($http,$window){ //TDY
  var jpushServiceFactory={};

  //ar jpushapi=$window.plugins.jPushPlugin;

  //启动极光推送
  var _init=function(){
    $window.plugins.jPushPlugin.init();
    $window.plugins.jPushPlugin.setDebugMode(true);
  }

  //停止极光推送
  var _stopPush=function(){
    $window.plugins.jPushPlugin.stopPush();
  }

  //重启极光推送
  var _resumePush=function(){
    $window.plugins.jPushPlugin.resumePush();
  }

  //设置标签和别名
  var _setTagsWithAlias=function(tags,alias){
    $window.plugins.jPushPlugin.setTagsWithAlias(tags,alias);
  }

  //设置标签
  var _setTags=function(tags){
    $window.plugins.jPushPlugin.setTags(tags);
  }

  //设置别名
  var _setAlias=function(alias){
    $window.plugins.jPushPlugin.setAlias(alias);
  }


  jpushServiceFactory.init=_init;
  jpushServiceFactory.stopPush=_stopPush;
  jpushServiceFactory.resumePush=_resumePush;

  jpushServiceFactory.setTagsWithAlias=_setTagsWithAlias;
  jpushServiceFactory.setTags=_setTags;
  jpushServiceFactory.setAlias=_setAlias;

  return jpushServiceFactory;
}])


// 数据模型函数, 具有取消(cancel/abort)HTTP请求(HTTP request)的功能
.factory('Data',['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){
   var serve={};
   var abort = $q.defer();
   var getToken=function(){
     return Storage.get('TOKEN') ;
   }

   var Users = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'Users',},{
        LogOn:{method:'POST',headers:{token:getToken()}, params:{route: 'LogOn'}, timeout: 10000},
        Register:{method:'POST', params:{route: 'Register'}, timeout: 10000},
        ChangePassword:{method:'POST',params:{route:'ChangePassword'},timeout: 10000},
        Verification:{method:'POST',params:{route:'Verification'},timeout:10000},
        UID:{method:'GET',params:{route:'UID',Type:'@Type',Name:'@Name'},timeout:10000},
        Activition:{method:'POST',params:{route:'Activition'},timeout:10000},
        Roles:{method:'GET',params:{route:'Roles',UserId:'@UserId'},timeout:10000,isArray:true},
        HealthCoaches: {method:'Get', isArray: true, params:{route: 'HealthCoaches'},timeout: 10000},
        GetPatBasicInfo: {method:'GET', params:{route:'@UserId'}, timeout:10000},
        GetPatientDetailInfo: {method:'GET', params:{route:'@UserId'}, timeout:10000},
        SetPatBasicInfo: {method:'POST', params:{route:'BasicInfo'}, timeout:10000},
        PostPatBasicInfoDetail: {method:'POST', params:{route:'BasicDtlInfo'}, timeout:10000},
        GetHealthCoaches: {method:'GET',isArray: true,params:{route: 'HealthCoaches'}, timeout:100000},
        GetHealthCoachInfo: {method:'GET',params:{route: 'GetHealthCoachInfo', HealthCoachID:'@HealthCoachID'}, timeout:1000},
        GetCommentList: {method:'GET',isArray: true,params:{route: 'GetCommentList'}, timeout:100000},
        SetComment: {method:'POST', params:{route:'SetComment'}, timeout:10000},
        ReserveHealthCoach: {method:'POST', params:{route:'ReserveHealthCoach'}, timeout:10000},
        BasicDtlValue: {method:'GET', params:{route:'BasicDtlValue'}, timeout:10000},
        RemoveHealthCoach: {method:'GET', params:{route:'RemoveHealthCoach'}, timeout:10000},
        HModulesByID: {method:'GET', params:{route:'HModulesByID'}, isArray:true, timeout:10000}
      });
    };
    var Service = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{
        path:'Service',
      },{
              sendSMS:{method:'POST',headers:{token:getToken()}, params:{route: 'sendSMS',mobile:'@mobile',smsType:'@smsType',content:'{content}'}, timeout: 10000},
              checkverification:{method:'POST',headers:{token:getToken()}, params:{route: 'checkverification', mobile:'@mobile',smsType: '@smsType', verification:'@verification'},timeout: 10000},
              BindMeasureDevice:{method:'GET',params:{route:'GetPatientInfo',PatientId:'@PatientId'},timeout:10000},
              PushNotification: {method:'GET', params:{route:'PushNotification'}, timeout:10000}
      })
    };
    var VitalInfo = function () {
      return $resource(CONFIG.baseUrl + ':path/:route', {path:'VitalInfo'},
          {
            GetLatestPatientVitalSigns: {method:'GET', params:{route: 'VitalSign'}, timeout: 10000},
            GetSignsDetailByPeriod: {method:'GET', params:{route: 'VitalSign'}, timeout: 10000},
            PostPatientVitalSigns:{method:'POST',params:{route: 'VitalSign'},timeout: 10000},
            // 获取某日期之前，一定条数血压（收缩压/舒张压）和脉率的数据详细时刻列表,用于phone，支持继续加载
            VitalSigns:{method:'GET',isArray: true,params:{route: 'VitalSigns',UserId:'@UserId',StartDate:'@StartDate',EndDate:'@EndDate'},timeout: 10000}//,$orderby:"RecordDate,RecordTime"
      });
    };

    var MessageInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'MessageInfo'},
              {
                PostNotification: {method:'POST', params:{route: 'PostNotification'},timeout: 10000},
                ChangeStatus: {method:'POST', params:{route: 'ChangeStatus'},timeout: 10000},
                GetDataByStatus: {method:'GET', params:{route: 'GetDataByStatus'},timeout: 10000, isArray:true},
                submitSMS: {method:'POST', params:{route: 'message'},timeout: 10000},
                GetSMSDialogue:{method:'GET', isArray:true, params:{route: 'messages'},timeout: 10000},
                GetSMSCount:{method:'GET', params:{route: 'messageNum'},timeout: 10000},
                SetSMSRead:{method:'PUT', params:{route: 'message'},timeout: 10000}
        
        });
    };

    var PlanInfo = function () {
        return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo'},
          {
              Plan: {method:'GET', params:{route: 'Plan'},timeout: 10000, isArray:true},
              PlanInfoChart: {method:'GET', params:{route: 'PlanInfoChart'},timeout: 10000, isArray:true},                
              Target: {method:'GET', params:{route: 'Target'},timeout: 10000},
              PlanInfoChartDtl: {method:'GET', params:{route: 'PlanInfoChartDtl'},timeout: 10000, isArray:true},
              GetExecutingPlan: {method:'GET', isArray:true ,params:{route: 'Plan'},timeout: 10000},
              GetComplianceListInC:{method:'GET', isArray:true ,params:{route: 'GetComplianceListInC'},timeout: 10000},
              getDTaskByPlanNo: {method:'GET',isArray:true, params:{route:'GetDTaskByPlanNo'},timeout: 10000}
        });
    };

    var TaskInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PlanInfo'},
      {
        GetTasklist: {method:'GET',isArray:true,params:{route: 'Tasks', $filter:"InvalidFlag eq '1'"}, timeout: 10000},
        Done:{method:'POST',params:{route: 'ComplianceDetail'}, timeout: 10000}
       });
    };
    var RiskInfo = function(){
        return $resource(CONFIG.baseUrl + ':path/:route',{
          path:'RiskInfo',
        },{
          
          // POST Api/v1/RiskInfo/RiskResult //这个不要了
          postEvalutionResult:{method:'POST',params:{route: 'RiskResult'}, timeout: 20000},
          // GET Api/v1/RiskInfo/RiskInput?UserId={UserId}
          getEvalutionInput:{method:'GET',params:{route:'RiskInput',UserId:'@UserId'},timeout:10000},
          // GET Api/v1/RiskInfo/RiskResults?UserId={UserId}
          getEvalutionResults:{method:'GET',params:{route:'RiskResults',UserId:'@UserId'},isArray : true,timeout:10000},
          // GET Api/v1/RiskInfo/RiskResult?UserId={UserId}&AssessmentType={AssessmentType}
          getNewResult:{method:'GET',params:{route:'RiskResults',UserId:'@UserId',AssessmentType:'@AssessmentType'},timeout:10000},
          // GET Api/v1/RiskInfo/GetDescription?SBP={SBP}
          getSBPDescription:{method:'GET',params:{route:'GetDescription',SBP:'@SBP'},timeout:20000},
          // GET Api/v1/RiskInfo/Parameters?Indicators={Indicators}
          getIndicators:{method:'GET',params:{route:'Parameters',Indicators:'@Indicators'},timeout:10000},
          // POST Api/v1/RiskInfo/TreatmentIndicators
          postTreatmentIndicators:{method:'POST',params:{route:'TreatmentIndicators'},timeout:20000},
          // POST Api/v1/RiskInfo/PsParameters
          postPsParameters:{method:'POST',params:{route:'PsParameters'},timeout:10000}, 
          // GET Api/v1/RiskInfo/GetMaxSortNo?UserId={UserId}
          getMaxSortNo:{method:'GET',params:{route:'GetMaxSortNo',UserId:'@UserId'},timeout:10000} 
      })
    };
    var Dict = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'Dict'},
      {
        GetInsuranceType: {method:'GET', isArray:true, params:{route: 'GetInsuranceType'}, timeout: 10000},
        GetTypeList:{method:'GET', isArray:true, params:{route: 'Type/Category'}, timeout: 10000}
       });
    };
    
    serve.abort = function ($scope) {
    abort.resolve();
    $interval(function () {
      abort = $q.defer();
      serve.Users = Users(); 
      serve.Service = Service();
      serve.VitalInfo = VitalInfo(); 
      serve.MessageInfo = MessageInfo(); 
      serve.TaskInfo = TaskInfo();
      serve.PlanInfo = PlanInfo();
      serve.RiskInfo = RiskInfo();
      serve.Dict = Dict();
      }, 0, 1);
    };
    serve.Users = Users();
    serve.Service = Service();
    serve.VitalInfo = VitalInfo(); 
    serve.MessageInfo = MessageInfo();
    serve.TaskInfo = TaskInfo();
    serve.PlanInfo = PlanInfo();
    serve.RiskInfo = RiskInfo();
    serve.Dict = Dict();
    return serve;
}])


// 用户操作函数

.factory('Service', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;
  self.PushNotification = function (platform, Alias, notification, title, id) {
    var deferred = $q.defer();
    Data.Service.PushNotification({platform:platform, Alias:Alias, notification:notification, title:title, id:id}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

.factory('Users', ['$q', '$http', 'Data',function ( $q,$http, Data) {
  var self = this;

  self.HModulesByID = function (PatientId, DoctorId) {
      var deferred = $q.defer();
      Data.Users.HModulesByID({PatientId:PatientId, DoctorId:DoctorId}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.RemoveHealthCoach = function (PatientId, DoctorId, CategoryCode) {
      var deferred = $q.defer();
      Data.Users.RemoveHealthCoach({PatientId:PatientId, DoctorId:DoctorId, CategoryCode:CategoryCode}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.BasicDtlValue = function (UserId, CategoryCode, ItemCode, ItemSeq) {//U201511120002 HM1 Doctor 1
      var deferred = $q.defer();
      Data.Users.BasicDtlValue({UserId:UserId, CategoryCode:CategoryCode, ItemCode:ItemCode, ItemSeq:ItemSeq}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.GetHealthCoachListByPatient = function (PatientId, CategoryCode) {
      var deferred = $q.defer();
      Data.Users.HealthCoaches({PatientId:PatientId}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

self.GetHealthCoaches = function (top, skip, filter) {
      var deferred = $q.defer();
      Data.Users.GetHealthCoaches({$top:top, $skip:skip, $filter:filter},function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };
 
  self.GetHealthCoachInfo = function (HealthCoachID) {
      var deferred = $q.defer();
      Data.Users.GetHealthCoachInfo({HealthCoachID:HealthCoachID}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

   self.GetCommentList = function (DoctorId ,CategoryCode, num, skip) {
      var deferred = $q.defer();
      Data.Users.GetCommentList({DoctorId:DoctorId,CategoryCode:CategoryCode, $orderby:"CommentTime desc", $top:num, $skip:skip}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

   self.SetComment = function (sendData) {
      var deferred = $q.defer();
      Data.Users.SetComment(sendData, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.ReserveHealthCoach = function (sendData) {
      var deferred = $q.defer();
      Data.Users.ReserveHealthCoach(sendData, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
  };

  self.myTrial = function (DoctorInfo) {
    var deferred = $q.defer();
    Data.Users.myTrialPost(DoctorInfo, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  self.myTrial2 = function (userid) {
    // Storage.set(13131313,userid);
    //由于API中要求有userID变量 DATA 中只能写死 所以动态生成一个方法
    var temp = $resource(CONFIG.baseUrl + ':path/:uid/:route', {
      path:'Users',  
    }, {
      myTrialGET: {method:'GET', params:{uid: userid,route:'DoctorInfo'}, timeout: 10000}
    });


    var deferred = $q.defer();
    temp.myTrialGET({}, function (data, headers) {
      console.log("获得了数据"+data)
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  self.getquestionnaire = function(UserId,CategoryCode) {
    var deferred = $q.defer();
    Data.ModuleInfo.getModuleInfo({UserId: _UserId, CategoryCode: _CategoryCode},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
  };

   return self;
}])


// --------登录注册-熊佳臻----------------
.factory('userservice',['$http','$q' , 'Storage','Data', function($http,$q,Storage,Data){  //XJZ
  var serve = {};
    var phoneReg=/^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    
    serve.Roles = function (_UserId){
      var deferred = $q.defer();
      Data.Users.Roles({UserId:_UserId},
        function(data){
          deferred.resolve(data);
        },function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    }

    serve.userLogOn = function(_PwType,_username,_password,_role){
        if(!phoneReg.test(_username)){
          return 7; 
        }
    var deferred = $q.defer();   
        Data.Users.LogOn({PwType:_PwType, username:_username, password:_password, role: _role},
      function(data,hearders,status){ 
        deferred.resolve(data);
      },
      function(err){
        deferred.reject(err);
        console.log(err.data);
        });
        return deferred.promise;
    }

    serve.UID = function(_Type,_Name){
      if(!phoneReg.test(_Name)){
          return 7; 
        }

      var deferred = $q.defer();
        Data.Users.UID({Type: _Type, Name: _Name},
          function(data,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          });
        return deferred.promise;
    }

    serve.sendSMS = function( _phoneNo,_smsType){
        if(!phoneReg.test(_phoneNo)){
          return 7; 
        }
        
        var deferred = $q.defer();
        Data.Service.sendSMS({mobile: _phoneNo, smsType:_smsType},
        function(data,status){
          deferred.resolve(data,status);
        },
        function(err){
          deferred.reject(err);   
        });
        return deferred.promise;
    }
    serve.checkverification = function(_mobile,_smsType,_verification){
      var deferred = $q.defer();
      Data.Service.checkverification({mobile:_mobile,smsType:_smsType,verification:_verification},
        function(data,status){
          deferred.resolve(data);
        },
        function(err){
          deferred.reject(err);
        })
      return deferred.promise;
    }

    serve.changePassword = function(_OldPassword,_NewPassword,_UserId){
      var deferred = $q.defer();
        Data.Users.ChangePassword({OldPassword:_OldPassword, NewPassword: _NewPassword, UserId:_UserId,  "revUserId": "sample string 4","TerminalName": "sample string 5", "TerminalIP": "sample string 6","DeviceType": 1},
          function(data,headers,status){
            deferred.resolve(data);
          },
          function(err){
            deferred.reject(err);
          })
        return deferred.promise;
    }

    serve.userRegister = function(_PwType, _userId, _UserName, _Password,_role){
      var deferred = $q.defer();
      Data.Users.Register({"PwType":_PwType,"userId":_userId,"Username":_UserName,"Password":_Password,role:_role,"revUserId": "sample string 6","TerminalName": "sample string 7","TerminalIP": "sample string 8","DeviceType": 1},
        function(data,headers,status){
              deferred.resolve(data);
        },
        function(err){
                deferred.reject(err);;
        })
      return deferred.promise;
    }

    serve.BindMeasureDevice = function(uid){
      var deferred = $q.defer();
      Data.Service.BindMeasureDevice({"PatientId":uid},
        function(s){
          deferred.resolve(s);
        },function(e){
          deferred.reject(e);
        })
      return deferred.promise;
    }

    //var passReg1=/([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)/;
    //var passReg2=/^.[A-Za-z0-9]+$/;
  // var isPassValid = function(pass){
    // if(pass.length >18  ||  pass.length<6){
      // return 4;
    // }else if(!passReg1.test(pass)){
      // return 5;
    // }else if(!passReg2.test(pass)){
            // return 6;
    // }else{
      // return 0;
    // }
  // }
  // serve.isTokenValid = function(){
    // var isToken=Storage.get('token');
    // if(isToken==null){
      // return 0;
    // }else{
      // $http({
        // method:'GET',
        // url:'',
        // headers:{token:isToken},
      // })
      // .success(function(data,status,headers,config){

      // })
      // .error(function(data,status,headers,config){

      // });
    // }
  // }

  return serve;
}])

.factory('loading',['$interval','$ionicLoading', function($interval,$ionicLoading){
  var serve={};
  var timerStart,timerFinish;
  var repeat;
  serve.loadingBarStart=function($scope){
    repeat=0;
    timerStart = $interval(function(){
      if(repeat==65){
        $scope.barwidth="width:"+repeat+"%";
        $interval.cancel(timerStart);
        timerStart=undefined;        
      }else{
        $scope.barwidth="width:"+repeat+"%";
        repeat++;
      }
    },4);
  }
  serve.loadingBarFinish=function($scope){
    $interval.cancel(timerStart);
    timerStart=undefined; 
    timerFinish = $interval(function(){
      if(repeat==100){
        $scope.barwidth="width:0%";
        $interval.cancel(timerFinish);
        timerFinish=undefined;        
      }else{
      $scope.barwidth="width:"+repeat+"%";
      repeat++;
      }
    },1);    
  }

  return serve;
}])

// --------交流-苟玲----------------
.factory('MessageInfo', ['$q', '$http', 'Data',function ( $q,$http, Data) {
    var self = this;

    self.ChangeStatus = function (AccepterID, NotificationType, SortNo, Status, revUserId, TerminalName, TerminalIP, DeviceType) {
      var deferred = $q.defer();
      Data.MessageInfo.ChangeStatus({AccepterID:AccepterID, NotificationType:NotificationType, SortNo:SortNo, Status:Status, revUserId:revUserId, TerminalName:TerminalName, TerminalIP:TerminalIP, DeviceType:DeviceType}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
    };

    self.GetDataByStatus = function (AccepterID, NotificationType, Status, top, skip) {
      var deferred = $q.defer();
      Data.MessageInfo.GetDataByStatus({AccepterID:AccepterID, NotificationType:NotificationType, Status:Status, $orderby:"SendTime desc", $top:top, $skip:skip}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
    };

    self.submitSMS = function (SendBy,Content,Receiver,piUserId,piTerminalName,piTerminalIP,piDeviceType) {
      var deferred = $q.defer();
      Data.MessageInfo.submitSMS({SendBy:SendBy,Content:Content,Receiver:Receiver,piUserId:piUserId,piTerminalName:piTerminalName,piTerminalIP:piTerminalIP,piDeviceType:piDeviceType}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
      return deferred.promise;
    };

    self.GetSMSDialogue = function (Reciever,SendBy,top,skip) {
      var deferred = $q.defer();
      Data.MessageInfo.GetSMSDialogue({Reciever:Reciever,SendBy:SendBy, $orderby:"SendDateTime desc", $top:top,$skip:skip}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    self.GetSMSCount = function (Reciever,SendBy) {
      var deferred = $q.defer();
      Data.MessageInfo.GetSMSCount({Reciever:Reciever,SendBy:SendBy}, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };

    self.SetSMSRead = function (data) {
      var deferred = $q.defer();
      Data.MessageInfo.SetSMSRead(data, function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    
    return self;
}])


// --------任务、插件-马志彬----------------

.factory('extraInfo',function(CONFIG){
  return{
    PatientId:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['PatientId']);
      }else {
        window.localStorage['PatientId'] = angular.toJson(data);
      }},
    PlanNo:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['PlanNo']);
      }else {
        window.localStorage['PlanNo'] = angular.toJson(data);
      }},
    TerminalIP:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['TerminalIP']);
      }else {
        window.localStorage['TerminalIP'] = angular.toJson(data);
      }},
    TerminalName:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['TerminalName']);
      }else {
        window.localStorage['TerminalName'] = angular.toJson(data);
      }},
    DeviceParams:function(key){
      switch(key)
      {
        case 'DeviceType':return window.localStorage['DeviceType'];break;
        case 'DeviceClientHeight':return window.localStorage['DeviceClientHeight'];break;
      }
    },
    revUserId:function(data){
      if(data==null)
      {
        return angular.fromJson(window.localStorage['ID']);
      }else {
        window.localStorage['ID'] = angular.toJson(data);
      }},
    DateTimeNow:function(){
      var date = new Date();
      var dt={};
      dt.year=date.getFullYear().toString();
      dt.year.length==1?dt.year='0'+dt.year:dt.year=dt.year;
      dt.month=(date.getMonth()+1).toString();
      dt.month.length==1?dt.month='0'+dt.month:dt.month=dt.month;
      dt.day=date.getDate().toString();
      dt.day.length==1?dt.day='0'+dt.day:dt.day=dt.day;
      dt.hour=date.getHours().toString();
      dt.hour.length==1?dt.hour='0'+dt.hour:dt.hour=dt.hour;
      dt.minute=date.getMinutes().toString();
      dt.minute.length==1?dt.minute='0'+dt.minute:dt.minute=dt.minute;
      dt.second=date.getSeconds().toString();
      dt.second.length==1?dt.second='0'+dt.second:dt.second=dt.second;
      dt.fulldate=dt.year+dt.month+dt.day;
      //dt.fulltime=dt.hour+dt.minute+dt.second;
      dt.fulltime=dt.hour+dt.minute;
      dt.full=dt.year+dt.month+dt.day+dt.hour+dt.minute+dt.second;
      dt.zyxTime=dt.year+'-'+dt.month+'-'+dt.day+' '+dt.hour+':'+dt.minute+':'+dt.second;
      // console.log(dt);
      return dt;
    },
    dictionary:function(d){
      var dictionary={
        "TD0000":"openHeModal",
        "TF0001":"#/tab/task/bpm",
        "TF0002":"#/tab/task/bpm",
        "TF0003":"#/tab/task/bloodglucose",
        "TA0001":"#/tab/task/measureweight",
        "TG0001":"#/tab/task/riskinfo",
        "TF0004":"#/tab/task/temperature"
      }
      var r='';
      angular.forEach(dictionary,function(value,key){
        if(key==d){r=value;}
      })
      return r;
    },
    TransformUrl:function(url){
      return ("http://121.43.107.106:8090" + url);//http://121.43.107.106:8090/HealthEducation/M1_2015-05-18%2022_56_35.html
    },
    TransformBloodglucoseCode:function(n){
      var dictionary={
        "凌晨":"BloodSugar_2",
        "睡前":"BloodSugar_3",
        "早餐前":"BloodSugar_4",
        "早餐后":"BloodSugar_5",
        "午餐前":"BloodSugar_6",
        "午餐后":"BloodSugar_7",
        "晚餐前":"BloodSugar_8",
        "晚餐后":"BloodSugar_9"
      }
      var r = '';
      angular.forEach(dictionary,function(value,key){
        if(key==n)r=value;
      })
      return r;
    },
    TransformInstruction:function(arr)
    {
      var l=arr.length;
      for (var i=0;i<l;i++)
      {
        if(arr[i].ParentCode=='TB0000')
        {
          arr[i].Instruction!=''?arr[i].Instruction="建议摄入量："+arr[i].Instruction+'克':arr[i].Instruction;
        }
      }
      return arr;
    },
    refreshstatus:function(status){
       if(status==null)
      {
        return angular.fromJson(window.localStorage['refreshstatus']);
      }else {
        window.localStorage['refreshstatus'] = angular.toJson(status);
      }
    },
    TransformChangeMarks:function(data){
      var marklength = data.length;
      var statistics = {};
      var classification=[];
      classification[0] =new Array();//新增
      classification[1] =new Array();//删除
      classification[2] =new Array();//修改
      for(var i=0;i<marklength;i++)
      {
        if(data[i].Code!=null)
        {
          if(data[i].Code.charAt(5)!='0')//排除诸如 TA0000 TB0000这类外层数据
          {
            if(statistics[data[i].Code]!=null)//判断该类型数据是否已经在结果中出现
            {//出现两次的数据进行排序
              if(statistics[data[i].Code][0].Edition<data[i].Edition)//以Edition排序，Edition大的为修改后的数据
              {
                statistics[data[i].Code][1]=statistics[data[i].Code][0];//修改后的数据放在前边
                statistics[data[i].Code][0]=data[i];
              }else
              {
                statistics[data[i].Code][1]=data[i];//修改前的数据放在后边
              }
            }else
            {
              statistics[data[i].Code]=new Array();//单词出现的数据
              statistics[data[i].Code][0]=data[i];
            }
          }
        }
      }
      // console.log(statistics);
      angular.forEach(statistics,function(value,key){
        if(value.length==1)//新增或删除的项目
        {
          if(value[0].Edition==1)
          {
            classification[1].push(value[0]);//删除
          }else
          {
            classification[0].push(value[0]);//新增
          }
        }else if(value.length==2)//修改的项目
        {
          classification[2].push(value[0]);
        }
      });
      // console.log(classification);
      return classification;
    },
    InsertChangeMarks2tasklist:function(arr,markstatistics)//根据获得的任务变更情况，在相应的任务中添加标志位，用来在显示时进行提示
    {
      var ms = markstatistics[0];
      for(var i=0;i<markstatistics[2].length;i++)
      {
        ms.push(markstatistics[2][i]);
      }
      // console.log(ms);
      if(arr[0].Code.charAt(5)=="0")
      {
        var Typestatistics = {};//第一层任务列表
        for(var i=0;i<ms.length;i++)
        {
          if(Typestatistics[ms[i].Type]==null)
          {
            Typestatistics[ms[i].Type]='1';
          }
        }
        // console.log(Typestatistics);
        for (var i=0;i<arr.length;i++)
        {
          if(Typestatistics[arr[i].Type]=='1')
          {
            // console.log(Typestatistics[arr[i].Type]);
            arr[i].markstatistics = '1';
          }
        }
      }else{
        var Typestatistics = {};//第二层任务列表
        for(var i=0;i<ms.length;i++)
        {
          if(Typestatistics[ms[i].Code]==null)
          {
            Typestatistics[ms[i].Code]='1';
          }
        }
        // console.log(Typestatistics);
        for (var i=0;i<arr.length;i++)
        {
          if(Typestatistics[arr[i].Code]=='1')
          {
            // console.log(Typestatistics[arr[i].Code]);
            arr[i].markstatistics = '1';
          }
        }
      }
      return arr;
    },
    TransformCode2Name:function(code)
    {
      var codelist = {
        TA0000:'体重管理',
        TB0000:'合理饮食',
        TC0000:'锻炼',
        TD0000:'健康教育',
        TE0000:'药物治疗',
        TF0000:'体征测量',
        TG0000:'风险评估'
      }
      if(codelist[code]!=null)
      {
        return codelist[code];
      }else
      {
        return '详细';
      }
    }
  }
})

.factory('BloodPressureMeasure', function(){
  return {
    BPConclusion:function(h,l){
      if(parseInt(h)<130&&parseInt(l)<85)
      {
        if(parseInt(h)==0)
          return '设备异常，请重新测量';
        else
          return '您的血压属于正常\n范围，请继续保持';
      }else {
        return '您的血压不正常，请注意控制！';
      }
    },
    FindCommand: function() {
      var bttestdata=new Uint8Array(8);
          bttestdata[0]=0x4F;
          bttestdata[1]=0xFF;
          bttestdata[2]=0xFF;
          bttestdata[3]=0xFF;
          bttestdata[4]=0x02;
          bttestdata[5]=0xFF;
          bttestdata[6]=0xFF;
          bttestdata[7]=bttestdata[0]^bttestdata[1]^bttestdata[2]^bttestdata[3]^bttestdata[4]^bttestdata[5]^bttestdata[6];
      return bttestdata;
    },
    StartCommand:function(arr){
      var StartCommand = new Uint8Array(arr);
          StartCommand[4]=0x03;
          StartCommand[7]=0xFE;
          StartCommand[8]=StartCommand[0]^StartCommand[1]^StartCommand[2]^StartCommand[3]^StartCommand[4]^StartCommand[5]^StartCommand[6]^StartCommand[7];
          console.log(StartCommand);
      return StartCommand;
    },
    BloodPressureChart:function(){
      var bpc={
          "type": "serial",
          "theme": "chalk",
          "dataProvider": [{
              "name": "收缩压",
              "points": 13,
              "Unit":"/mmHg",
              "color": "#DB4C3C",
              "bullet": "img/icon/00.gif"
          }, {
              "name": "舒张压",
              "points": 13,
              "Unit":"/mmHg",
              "color": "#7F8DA9",
              "bullet": "img/icon/00.gif"
          }, {
              "name": "心率",
              "points": 13,
              "Unit":"次/分",
              "color": "#FEC514",
              "bullet": "img/icon/00.gif"
          }],
          "valueAxes": [{
              "maximum": 200,
              "minimum": 0,
              "axisAlpha": 0,
              "dashLength": 4,
              "position": "left",
              "stackType": "regular"
          }],
          "startDuration": 1,
          "graphs": [{
              "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
              "bulletOffset": 16,
              "bulletSize": 34,
              "colorField": "color",
              "cornerRadiusTop": 8,
              "customBulletField": "bullet",
              "fillAlphas": 0.8,
              "lineAlpha": 0,
              "type": "column",
              "valueField": "points",
              "labelText": "",
              "color": "#000000"
          }],
          "marginTop": 0,
          "marginRight": 0,
          "marginLeft": 0,
          "marginBottom": 0,
          "autoMargins": false,
          "categoryField": "name",
          "categoryAxis": {
              "axisAlpha": 0,
              "gridAlpha": 0,
              "inside": true,
              "tickLength": 0
          },
          "allLabels": [
            {
              "text": "",
              "bold": true,
              "align":"center",
              "color":"white"
            }
          ],
          "export": {
            "enabled": true
          },
          "panEventsEnabled":false
      }
      console.log(bpc);
      return bpc;
    }
  }
})

.factory('VitalInfo', ['$q', 'Data', 'extraInfo',function($q, Data, extraInfo){
  var self = this;
  self.InsertServerData = function()
  {
    var insertserverdata={};
    insertserverdata.UserId=window.localStorage['UID'];
    insertserverdata.RecordDate=extraInfo.DateTimeNow().year+extraInfo.DateTimeNow().month+extraInfo.DateTimeNow().day;
    insertserverdata.RecordTime=extraInfo.DateTimeNow().hour+extraInfo.DateTimeNow().minute+extraInfo.DateTimeNow().second;
    insertserverdata.ItemType='';
    insertserverdata.ItemCode='';
    insertserverdata.Value='';
    insertserverdata.Unit='';
    insertserverdata.revUserId=window.localStorage['UID'];
    insertserverdata.TerminalName=extraInfo.TerminalName();
    insertserverdata.TerminalIP=extraInfo.TerminalIP();
    // insertserverdata.DeviceType=parseInt(extraInfo.DeviceType());
    return insertserverdata;
  };

  self.PostPatientVitalSigns = function(data){
    var deferred = $q.defer();
    Data.VitalInfo.PostPatientVitalSigns(data,
      function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
      });
    return deferred.promise;
  };

  self.VitalSigns = function (UserId,StartDate,EndDate,top,skip) {
    var deferred = $q.defer();
    Data.VitalInfo.VitalSigns({UserId:UserId,StartDate:StartDate,EndDate:EndDate,$top:top,$skip:skip}, function (data, headers) {
      deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.GetLatestPatientVitalSigns = function (data) {
    var deferred = $q.defer();
    Data.VitalInfo.GetLatestPatientVitalSigns(data, function (data, headers) {
      deferred.resolve(data);
      }, function (err) {
      deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])

.factory('TaskInfo', ['$q', 'Data','extraInfo',function($q,Data,extraInfo){
  var self = this;
  self.GetTasklist = function(data){
    var deferred = $q.defer();
    Data.TaskInfo.GetTasklist(data,function(s){
      deferred.resolve(s);
    },function(e){
      deferred.reject(e);
    });
    return deferred.promise;
  }
  self.insertstate = function(arr)
  {
    for(var i=0;i<arr.length;i++)
    {
      arr[i].index=i;
      switch(arr[i].ParentCode)
      {
        case "TD0000":arr[i].click=extraInfo.dictionary("TD0000");break;
        default :arr[i].go=extraInfo.dictionary(arr[i].Code);break;
      }
      // console.log(arr[i].ParentCode);
    }
    return arr;
  }
  self.done = function(arr,PLN)
  {
    var data={
      "PlanNo":PLN,
      "Date": extraInfo.DateTimeNow().fulldate,
      "CategoryCode": arr.Type,
      "Code": arr.Code,
      "Status": "1",
      "Description": arr.Description,
      "SortNo":'1'
    };
    console.log(arr.Status);
    var deferred = $q.defer();
      Data.TaskInfo.Done(data,function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
    });
    return deferred.promise;
  }
  self.GetDTaskByPlanNo = function(planno){
    var deferred = $q.defer();
      Data.PlanInfo.getDTaskByPlanNo({PlanNo:planno},function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
    });
    return deferred.promise;
  }
  return self;
}])

.factory('NotificationService',['$cordovaLocalNotification','extraInfo',function($cordovaLocalNotification,extraInfo){
  return{
    save:function(arr){
      var a=[];
      a[0]=arr;
      var t= angular.fromJson(window.localStorage['alertlist']);
      if(t)
      {
        for(var i=0;i<t.length;i++)
        {
          a[i+1]=t[i];
          a[i+1].index=i+1;
        }
      }
      window.localStorage['alertlist'] = angular.toJson(a);
      var n={
        id: arr.ID,
        title: arr.title,
        text: arr.detail,
        firstAt: arr.time,
        every: "day",
        sound: "file://sources/Nokia.mp3",
        icon: "file://img/ionic.png"
      };
      if(extraInfo.DeviceParams('DeviceType')!='win32')
        {
          $cordovaLocalNotification.schedule(n);
          // console.log("call cordovaLocalNotification")
        }
    },
    get:function(){
      var alert = window.localStorage['alertlist'];
      return angular.fromJson(alert);
    },
    remove:function(index){
      var t= angular.fromJson(window.localStorage['alertlist']);
      if(extraInfo.DeviceParams('DeviceType')!='win32')$cordovaLocalNotification.cancel(t[index].ID);
      t.splice(index,1);
      if(t)
      {
        for(var i=index;i<t.length;i++)
        {
          t[i].index--;
        }
      }
      window.localStorage['alertlist'] = angular.toJson(t);
    },
    update:function(arr){
      var t= angular.fromJson(window.localStorage['alertlist']);
      t[arr.index]=arr;
      window.localStorage['alertlist'] = angular.toJson(t);
    }
  }
}])

// --------李山----------------
.factory('PlanInfo', ['$q', '$http', 'Data', function ( $q,$http, Data) {
  var self = this;
  self.PlanInfoChart = function (UserId,PlanNo,StartDate,EndDate,ItemType,ItemCode) {
    var deferred = $q.defer();
    Data.PlanInfo.PlanInfoChart({UserId:UserId,PlanNo:PlanNo,StartDate:StartDate, EndDate:EndDate, ItemType:ItemType, ItemCode:ItemCode, $orderby:"Date desc", $top:7}, function (data, headers) {
      deferred.resolve(data.reverse());
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.Plan = function (PatientId,PlanNo,Module,Status) {
    var deferred = $q.defer();
    Data.PlanInfo.Plan({PatientId:PatientId,PlanNo:PlanNo,Module:Module,Status:Status}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.Target = function (PlanNo,Type,Code) {
    var deferred = $q.defer();
    Data.PlanInfo.Target({PlanNo:PlanNo,Type:Type,Code:Code}, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.PlanInfoChartDtl = function (option) {
    var deferred = $q.defer();
    Data.PlanInfo.PlanInfoChartDtl(option, function (data, headers) {
      deferred.resolve(data);
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.GetExecutingPlan = function(data)
  {
    var deferred = $q.defer();
    Data.PlanInfo.GetExecutingPlan(data,function(s){
      deferred.resolve(s);
    },function(e){
      deferred.reject(e);
    })
    return deferred.promise;
  }
  self.GetComplianceListInC = function(data)
  {
    var deferred = $q.defer();
    Data.PlanInfo.GetComplianceListInC(data,function(s){
      deferred.resolve(s);
    },function(e){
      deferred.reject(e);
    })
    return deferred.promise;
  }
  
    return self;
}])

.factory('Patients',['Data','$q','$resource','CONFIG',function(Data,$q,$resource,CONFIG){ //LRZ
  //get patients
  //remove certain patients
  //add  patients
  //blablabla used by two controllers

  return {
    all: function() {
      return patients_array;
    },
    remove: function(patient) {
      patients_array.splice(patients_array.indexOf(chat), 1);
    },
    get: function(patientid) {
      for (var i = 0; i < patients_array.length; i++) {
        if (patients_array[i].id === parseInt(patientid)) {
          return patients_array[i];
        }
      }
      return null;
    },
    getEvalutionResults: function(userid){

      var deferred = $q.defer();
      Data.RiskInfo.getEvalutionResults({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getEvalutionInput: function(userid){
      //获取填表所需输入 
      var deferred = $q.defer();
      Data.RiskInfo.getEvalutionInput({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getSBPDescription: function(sbp){
      //获取填表所需输入 
      var deferred = $q.defer();
      Data.RiskInfo.getSBPDescription({"SBP":sbp}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;        
    },
    getNewResult: function(userid){
      var deferred = $q.defer();
      Data.RiskInfo.getSBPDescription({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    postEvalutionResult:function(result){
      console.log("uploading")
      var deferred = $q.defer();
        Data.RiskInfo.postEvalutionResult(result, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
        console.log(err);
      });
      return deferred.promise; 

    },
    postTreatmentIndicators: function(result){
      var deferred = $q.defer();
        Data.RiskInfo.postTreatmentIndicators(result, function (data, headers) {
        console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise; 
    },
    getMaxSortNo:function(userid){
      var deferred = $q.defer();
        Data.RiskInfo.getMaxSortNo({"UserId":userid}, function (data, headers) {
        // console.log(data);
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
      return deferred.promise;       
    }

  }
}])

// --------上传头像----------------
.factory('Camera', ['$q','$cordovaCamera','CONFIG', '$cordovaFileTransfer','Storage',function($q,$cordovaCamera,CONFIG,$cordovaFileTransfer,Storage) { //LRZ
  return {
    getPicture: function() {

      var options = { 
          quality : 75, 
          destinationType : 0, 
          sourceType : 1, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CONFIG.popoverOptions,
          saveToPhotoAlbum: false
      };

     var q = $q.defer();

      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = "data:image/jpeg;base64," + imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise
    },

    getPictureFromPhotos: function(){
      var options = { 
          quality : 75, 
          destinationType : 0, 
          sourceType : 0, 
          allowEdit : true,
          encodingType: 0,
          targetWidth: 300,
          targetHeight: 300
      };
        //从相册获得的照片不能被裁减 调研~
     var q = $q.defer();
      $cordovaCamera.getPicture(options).then(function(imageData) {
          imgURI = "data:image/jpeg;base64," + imageData;
          // console.log("succeed" + imageData);
          q.resolve(imgURI);
      }, function(err) {
          // console.log("sth wrong");
          imgURI = undefined;
          q.resolve(err);
      });      
      return q.promise; //return a promise      
    },

    uploadPicture : function(imgURI, temp_photoaddress){
        // document.addEventListener('deviceready', onReadyFunction,false);
        // function onReadyFunction(){
          var uri = encodeURI(CONFIG.ImageAddressIP + "/upload.php");
          var photoname = Storage.get("UID"); // 取出病人的UID作为照片的名字
          var options = {
            fileKey : "file",
            fileName : temp_photoaddress,
            chunkedMode : true,
            mimeType : "image/jpeg"
          };
          var q = $q.defer();
          // console.log("jinlaile");
          $cordovaFileTransfer.upload(uri,imgURI,options)
            .then( function(r){
              console.log("Code = " + r.responseCode);
              console.log("Response = " + r.response);
              console.log("Sent = " + r.bytesSent);
              var result = "上传成功";
              q.resolve(result);        
            }, function(err){
              alert("An error has occurred: Code = " + error.code);
              console.log("upload error source " + error.source);
              console.log("upload error target " + error.target);
              q.resolve(error);          
            }, function (progress) {
              console.log(progress);
            })

            ;
          return q.promise;  
        // }


        // var ft = new FileTransfer();
        // $cordovaFileTransfer.upload(imgURI, uri, win, fail, options);
      
    },

  uploadPicture2: function(imgURI){
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
   // as soon as this function is called FileTransfer "should" be defined
      console.log(FileTransfer);
      console.log(File);
    }
  }
  }
}])


;
