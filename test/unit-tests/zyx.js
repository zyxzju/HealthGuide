describe('\nTests for "services"', function(){
    beforeEach(angular.mock.module('zjubme'));
describe('\n"VitalInfo"',function(){
    var scope, vitalInfo, $httpBackend,rdata,getep,UnitCount,skip;
    beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          vitalInfo = VitalInfo;
          vitalSigns = {UserId:"PID201506180013",StartDate:"20151105",EndDate:"20151106",UnitCount:"10",skip:"10"};
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/VitalInfo/VitalSigns?$skip=10&$top=10&EndDate=20151106&StartDate=20151105&UserId=PID201506180013")
        .respond([{UserId:"",RecordDate:"20151105",RecordTime:"16:06",ItemType:"Height",ItemCode:"Height_1",Value:"175",Unit:"cm",Name:"身高",StartDate:"",EndDate:"",SignType:""}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('VitalSigns() method should get executing.', function() {
      var promise = vitalInfo.VitalSigns(vitalSigns.UserId,vitalSigns.StartDate,vitalSigns.EndDate,vitalSigns.UnitCount,vitalSigns.skip);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.length).toEqual(1);
          expect(rdata[0].RecordTime).toEqual("16:06");
      });
  });
describe('\n"VitalInfo"',function(){
    var scope, vitalinfo, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          vitalinfo = VitalInfo;
      $httpBackend.whenPOST("http://121.43.107.106:9000/Api/v1/VitalInfo/VitalSign")
        .respond({result:'数据插入成功'});
         $httpBackend.whenGET(/partials\/.*/).respond(200, '');
        }));
      it('PostPatientVitalSigns() method should get temperature lists.', function() {
           var temperaturelist={"UserId": "U201511170004",
                               "RecordDate": '20151013',
                               "RecordTime": "152200",
                               "ItemType": "Temperature",
                               "ItemCode": 'Temperature_1',
                               "Value": "39",
                               "Unit": "℃",
                               "revUserId":'U201511170004',
                               "TerminalName": "sample string 9",
                               "TerminalIP": "sample string 10",
                                "DeviceType": 11};
          var promise = vitalinfo.PostPatientVitalSigns(temperaturelist);
          promise.then(function(d) {
            rdata = d;
          });
          $httpBackend.flush();
          expect(rdata.result).toEqual('数据插入成功');
      });
  });
describe('\n"GetHealthCoaches"',function(){
    var scope, vitalInfo, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/HealthCoaches")
        .respond([{status:'getsuccess'}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.GetHealthCoaches()get sucess', function() {
      var promise = users.GetHealthCoaches();
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata[0].status).toEqual("getsuccess");
      });
  });
describe('\n"GetHealthCoachInfo"',function(){
    var scope, $httpBackend,rdata,HealthCoachID;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           HealthCoachID="DOC201506180002";
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/GetHealthCoachInfo?HealthCoachID=DOC201506180002")
        .respond({imageURL:"DOC201506180002.jpg",name:"何疆春",age:"42",sex:"2",module:"高血压模块/糖尿病模块/心力衰竭模块",generalComment:"very good",generalscore:"3.3",commentNum:"29",activityDegree:"0",Description:"专业擅长：心血管疾病早期危险因素的筛查、风险评估及防治，冠心病、高血压病、高血脂症、心衰、冠状动脉慢血流的诊治，血栓防治，心脏病的超声诊断。",UnitName:"海军总医院",Dept:null,JobTitle:"住院医师",Level:"正高"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.GetHealthCoachInfo()get success', function() {
      var promise = users.GetHealthCoachInfo(HealthCoachID);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.name).toEqual("何疆春");
      });
  });
describe('\n"GetCommentList"',function(){
    var scope, $httpBackend,rdata,DoctorId,CategoryCode,num,skip;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           DoctorId="DOC201506180002";
           CategoryCode='HM1';
           num=5;
           skip=0;
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/GetCommentList?$orderby=CommentTime+desc&$skip=0&$top=5&CategoryCode=HM1&DoctorId=DOC201506180002")
        .respond([{CategoryCode:"HM1",PatientId:"U201511170002",imageURL:"U201511170002_1447760482677.jpg",Name:"田雨",Comment:"很好，很nice的医生",Score:"4",CommentTime:"2015-12-10 22:13:53"},
          {CategoryCode:"HM1",PatientId:"U201507170027",imageURL:null,Name:"T1715",Comment:"hehe",Score:"0",CommentTime:"2015-11-13 15:52:05"},
          {CategoryCode:"HM1",PatientId:"U201507170024",imageURL:"U201507170024.jpg",Name:"张晓娟",Comment:"",Score:"1",CommentTime:"2015-07-17 18:00:29"},
          {CategoryCode:"HM1",PatientId:"U201507170031",imageURL:null,Name:"T1720",Comment:"madan",Score:"1",CommentTime:"2015-11-13 16:05:28"},
          {CategoryCode:"HM1",PatientId:"U201507170033",imageURL:null,Name:"程翼",Comment:"",Score:"1",CommentTime:"2015-07-17 19:04:47"},
          {CategoryCode:"HM1",PatientId:"U201507170035",imageURL:null,Name:"刘铁刚",Comment:"",Score:"1",CommentTime:"2015-07-17 19:07:36"},
          {CategoryCode:"HM1",PatientId:"U201507170036",imageURL:null,Name:"刘铁刚",Comment:"",Score:"1",CommentTime:"2015-07-17 20:06:58"},
          {CategoryCode:"HM1",PatientId:"U201507170037",imageURL:null,Name:"张蓉",Comment:"",Score:"1",CommentTime:"2015-07-17 20:14:33"},
          {CategoryCode:"HM1",PatientId:"U201507170038",imageURL:null,Name:"宫锡来",Comment:"",Score:"1",CommentTime:"2015-07-17 20:15:03"},
          {CategoryCode:"HM1",PatientId:"U201507170039",imageURL:null,Name:"张蓉",Comment:"madan",Score:"1",CommentTime:"2015-11-13 16:06:20"},
          {CategoryCode:"HM1",PatientId:"U201509170009",imageURL:null,Name:"",Comment:"",Score:"1",CommentTime:"2015-09-17 11:52:21"},
          {CategoryCode:"HM1",PatientId:"U201511120007",imageURL:null,Name:"李润泽",Comment:"null",Score:"1",CommentTime:"2015-11-12 18:40:59"},
          {CategoryCode:"HM1",PatientId:"U201511120009",imageURL:null,Name:"ff",Comment:"",Score:"1",CommentTime:"2015-11-12 20:38:22"},
          {CategoryCode:"HM1",PatientId:"U201511120002",imageURL:null,Name:"童丹阳",Comment:"",Score:"1",CommentTime:"2015-11-25 16:36:21"}
          //{CategoryCode:"HM2",PatientId:"U201511120002",imageURL:null,Name:"童丹阳",Comment:"null",Score:"1",CommentTime:"2015-11-30 10:58:02"},
         // {CategoryCode:"HM3",PatientId:"U201511120002",imageURL:null,Name:"童丹阳",Comment:"null",Score:"1",CommentTime:"2015-11-30 10:58:11"}
         ]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.GetCommentList()get success', function() {
      var promise = users.GetCommentList(DoctorId ,CategoryCode,num,skip);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata[2].Name).toEqual("张晓娟");
          expect(rdata[0].Name).toEqual("田雨");
          expect(rdata[7].Name).toEqual("张蓉");
      });
  });
describe('\n"getReserveAuthority"',function(){
    var scope, $httpBackend,rdata,Info;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           Info={
            "UserId":"U201511170004",
            "CategoryCode":"HM3",
            "ItemCode":'Doctor',
            "ItemSeq":1
           };
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/BasicDtlValue?CategoryCode=HM3&ItemCode=Doctor&ItemSeq=1&UserId=U201511170004")
        .respond({result:"DOC201506180002"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.BasicDtlValue()get success', function() {
      var promise = users.BasicDtlValue(Info.UserId,Info.CategoryCode,Info.ItemCode,1);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.result).toEqual("DOC201506180002");
      });
  });
describe('\n"ReserveHealthCoach"',function(){
    var scope, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenPOST("http://121.43.107.106:9000/Api/v1/Users/ReserveHealthCoach")
        .respond({result:'数据插入成功'});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.ReserveHealthCoach()post sucess', function() {
      var senddata={
                "DoctorId": "DOC201506180002",
                "PatientId": "U201511170004",
                "Module": "HM1",
                "Description": "初次预约，请多指教",
                "Status": 0,
                "ApplicationTime": "2015/10/26  15:30:35",
                "AppointmentTime": "2015-10-26  15:30:35",
                "AppointmentAdd": "",
                "Redundancy": "",
                "revUserId": "1",
                "TerminalName": "1",
                "TerminalIP": "1",
                "DeviceType": 1
}
      var promise = users.ReserveHealthCoach(senddata);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.result).toEqual("数据插入成功");
      });
  });
describe('\n"HModulesByID"',function(){
    var scope, $httpBackend,rdata,Info,PatientId,DoctorId;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           PatientId="U201511170002";
           DoctorId="DOC201506180002";
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/HModulesByID?DoctorId=DOC201506180002&PatientId=U201511170002")
        .respond([{CategoryCode:"HM1",Modules:"高血压模块",DoctorId:"DOC201506180002"},
          {CategoryCode:"HM2",Modules:"糖尿病模块",DoctorId:"DOC201506180002"}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.HModulesByID()get success', function() {
      var promise = users.HModulesByID(PatientId,DoctorId);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata[0].CategoryCode).toEqual("HM1");
      });
  });
describe('\n"RemoveHealthCoach"',function(){
    var scope, $httpBackend,rdata,Info;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           Info={
             "PatientId":"U201511170002",
             "DoctorId":"DOC201506180002",
             "CategoryCode":"HM1",
            } ;
      $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/RemoveHealthCoach?CategoryCode=HM1&DoctorId=DOC201506180002&PatientId=U201511170002")
        .respond({"result":"有正在执行的计划，无法删除"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.RemoveHealthCoach()get success', function() {
      var promise = users.RemoveHealthCoach(Info.PatientId,Info.DoctorId,Info.CategoryCode);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.result).toEqual("有正在执行的计划，无法删除");
      });
  });
describe('\n"SetComment"',function(){
    var scope, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenPOST("http://121.43.107.106:9000/Api/v1/Users/SetComment")
        .respond({result:'数据插入成功'});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('Users.SetComment()post sucess', function() {
      var senddata={
                "DoctorId": "DOC201506180002",
                "CategoryCode": "HM1",
                "Value": "U201511170002",
                "Description":"nihj",
                "SortNo": 5,
                "piUserId": "sample string 6",
                "piTerminalName": "sample string 7",
                "piTerminalIP": "sample string 8",
                "piDeviceType": 9
     }
      var promise = users.SetComment(senddata);
      promise.then(function(d) {
        rdata = d;
      });
         $httpBackend.flush();
          expect(rdata.result).toEqual("数据插入成功");
      });
  });
});
describe('\nTests for "controllers"', function(){

    var scope, ctrl, $httpBackend;
    beforeEach(angular.mock.module('zjubme'));

  describe('\n"temperaturecontroller"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
     
     // $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $controller('temperaturecontroller', {$scope: scope});
      }));
     
      it('when $scope.check(true),$scope.twcheck should be "required"', function() {
          expect(scope.check(true));
          expect(scope.twcheck).toBe("required");
      });
      it('when save temperature with param false,$scope.twcheck = "required"', function() {
          expect(scope.showConfirm(false));
          expect(scope.twcheck).toEqual("required");
      });
      // it('when save temperature with param true,$scope.twcheck = ""', function() {
      //     expect(scope.showConfirm(true));
      //     //expect(scope.status).toEqual('');
      // });
      it('test for start value of scope.status ', function() {
          expect(scope.status).toEqual("请输入");
      });

       describe(" scope.showConfirm when true",function(){
         beforeEach(function(){
              spyOn(scope, 'confirm');
              scope.showConfirm(true)
          });
            it('', function() {
              expect(scope.Temp.Temperature).toHaveBeenCalled();
            });
          })
  });
describe('\n"CommentListCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;  
     // $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $controller('CommentListCtrl', {$scope: scope});
           spyOn(scope, 'loadMoreComment');
      }));

      it('when $scope.refreshComment() implement ', function() {
          expect(scope.refreshComment());
          expect(scope.moreComment).toEqual(false);
      });
      it('when $scope.loadMoreComment() implement ', function() {
          expect(scope.loadMoreComment());
         // expect(scope.loadMoreComment).toHaveBeenCalled();
         // expect(scope.loadMoreComment).toEqual(false);
      });
      it('when $scope.modouleList implement ', function() {
          expect(scope.modouleList[2].text).toEqual("糖尿病");
      });
  });
describe('\n"SetCommentCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;  
          $controller('SetCommentCtrl', {$scope: scope});
          var rating=4;
      }));

      it('when $scope.modouleList implement ', function() {
          expect(scope.modouleList[1].text).toEqual("糖尿病");
      });
       it('when $scope.getCommentAuthority implement ', function() {
          expect(scope.comment.selectedModoule).toEqual("" );
      });
        it('when $scope.ratingsObject implement ', function() {
          expect(scope.ratingsObject.rating).toBe(5);
      });
        it('when $scope.ratingsCallback implement ', function() {
          var rating=4;
          expect(scope.ratingsCallback(rating));
          expect(scope.comment.score).toEqual(rating);
      });
  });
});
