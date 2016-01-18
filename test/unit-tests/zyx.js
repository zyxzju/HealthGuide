describe('\nTests for "services"', function(){
    beforeEach(angular.mock.module('zjubme'));
    var baseurl="http://121.43.107.106:9000/Api/v1"
    //体征列表的加载
describe('\n"1.VitalInfo"',function(){
    var scope, vitalInfo, $httpBackend,rdata,getep,UnitCount,skip;
    beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          vitalInfo = VitalInfo;
          vitalSigns = {UserId:"PID201506180013",StartDate:"20151105",EndDate:"20151106",UnitCount:"10",skip:"10"};
      $httpBackend.whenGET(baseurl+"/VitalInfo/VitalSigns?$skip=10&$top=10&EndDate=20151106&StartDate=20151105&UserId=PID201506180013")
        .respond([{UserId:"",RecordDate:"20151105",RecordTime:"16:06",ItemType:"Height",ItemCode:"Height_1",Value:"175",Unit:"cm",Name:"身高",StartDate:"",EndDate:"",SignType:""}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('体征列表的加载,VitalSigns() method should get executing.', function() {
      var promise = vitalInfo.VitalSigns(vitalSigns.UserId,vitalSigns.StartDate,vitalSigns.EndDate,vitalSigns.UnitCount,vitalSigns.skip);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.length).toEqual(1);
          expect(rdata[0].RecordTime).toEqual("16:06");
      });
  });
//体温数据插入数据库
describe('\n"2.VitalInfo"',function(){
    var scope, vitalinfo, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          vitalinfo = VitalInfo;
      $httpBackend.whenPOST(baseurl+"/VitalInfo/VitalSign")
        .respond({result:'数据插入成功'});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
        }));
      it('体温数据插入数据库,PostPatientVitalSigns() method should get temperature lists.', function() {
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
//获取所有健康专员列表 
describe('\n"3.GetHealthCoaches"',function(){
    var scope, vitalInfo, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenGET(baseurl+"/Users/HealthCoaches")
        .respond([{status:'getsuccess'}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('获取所有健康专员列表 ,Users.GetHealthCoaches()get sucess', function() {
      var promise = users.GetHealthCoaches();
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata[0].status).toEqual("getsuccess");
      });
  });
// 获取某个健康专员的具体信息
describe('\n"4.GetHealthCoachInfo"',function(){
    var scope, $httpBackend,rdata,HealthCoachID;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           HealthCoachID="DOC201506180002";
      $httpBackend.whenGET(baseurl+"/Users/GetHealthCoachInfo?HealthCoachID=DOC201506180002")
        .respond({imageURL:"DOC201506180002.jpg",name:"何疆春",age:"42",sex:"2",module:"高血压模块/糖尿病模块/心力衰竭模块",generalComment:"very good",generalscore:"3.3",commentNum:"29",activityDegree:"0",Description:"专业擅长：心血管疾病早期危险因素的筛查、风险评估及防治，冠心病、高血压病、高血脂症、心衰、冠状动脉慢血流的诊治，血栓防治，心脏病的超声诊断。",UnitName:"海军总医院",Dept:null,JobTitle:"住院医师",Level:"正高"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it(' 获取某个健康专员的具体信息,Users.GetHealthCoachInfo()get success', function() {
      var promise = users.GetHealthCoachInfo(HealthCoachID);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.name).toEqual("何疆春");
      });
  });
//获取某专员（医生）某个模块的评论列表
describe('\n"5.GetCommentList"',function(){
    var scope, $httpBackend,rdata,DoctorId,CategoryCode,num,skip;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           DoctorId="DOC201506180002";
           CategoryCode='HM1';
           num=5;
           skip=0;
      $httpBackend.whenGET(baseurl+"/Users/GetCommentList?$orderby=CommentTime+desc&$skip=0&$top=5&CategoryCode=HM1&DoctorId=DOC201506180002")
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
      it('获取某专员（医生）某个模块的评论列表,Users.GetCommentList()get success', function() {
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
//获取basicInfoDtl中Value字段的值：用于判断患者评价专员的权限
describe('\n"6.getReserveAuthority"',function(){
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
      $httpBackend.whenGET(baseurl+"/Users/BasicDtlValue?CategoryCode=HM3&ItemCode=Doctor&ItemSeq=1&UserId=U201511170004")
        .respond({result:"DOC201506180002"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('获取basicInfoDtl中Value字段的值：用于判断患者评价专员的权限,Users.BasicDtlValue()get success', function() {
      var promise = users.BasicDtlValue(Info.UserId,Info.CategoryCode,Info.ItemCode,1);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.result).toEqual("DOC201506180002");
      });
  });
//预约健康专员
describe('\n"7.ReserveHealthCoach"',function(){
    var scope, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenPOST(baseurl+"/Users/ReserveHealthCoach")
        .respond({result:'数据插入成功'});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('预约健康专员,Users.ReserveHealthCoach()post sucess', function() {
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
//输入患者Id和专员Id，取出对应模块编码和名称
describe('\n"8.HModulesByID"',function(){
    var scope, $httpBackend,rdata,Info,PatientId,DoctorId;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
           PatientId="U201511170002";
           DoctorId="DOC201506180002";
      $httpBackend.whenGET(baseurl+"/Users/HModulesByID?DoctorId=DOC201506180002&PatientId=U201511170002")
        .respond([{CategoryCode:"HM1",Modules:"高血压模块",DoctorId:"DOC201506180002"},
          {CategoryCode:"HM2",Modules:"糖尿病模块",DoctorId:"DOC201506180002"}]);
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('输入患者Id和专员Id，取出对应模块编码和名称,Users.HModulesByID()get success', function() {
      var promise = users.HModulesByID(PatientId,DoctorId);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata[0].CategoryCode).toEqual("HM1");
      });
  });
//某病人解除某一模块的某个健康专员
describe('\n"9.RemoveHealthCoach"',function(){
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
      $httpBackend.whenGET(baseurl+"/Users/RemoveHealthCoach?CategoryCode=HM1&DoctorId=DOC201506180002&PatientId=U201511170002")
        .respond({"result":"有正在执行的计划，无法删除"});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('某病人解除某一模块的某个健康专员,Users.RemoveHealthCoach()get success', function() {
      var promise = users.RemoveHealthCoach(Info.PatientId,Info.DoctorId,Info.CategoryCode);
      promise.then(function(d) {
        rdata = d;
      });
      $httpBackend.flush();
          expect(rdata.result).toEqual("有正在执行的计划，无法删除");
      });
  });
//用户插入对某一专员的评分和评价，并更新该专员总评分 
describe('\n"10.SetComment"',function(){
    var scope, $httpBackend,rdata;
    beforeEach(angular.mock.inject(function(Users,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
           users = Users;
      $httpBackend.whenPOST(baseurl+"/Users/SetComment")
        .respond({result:'数据插入成功'});
      $httpBackend.whenGET(/partials\/.*/).respond(200, '');
      }));
      it('用户插入对某一专员的评分和评价，并更新该专员总评分 ,Users.SetComment()post sucess', function() {
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
//测试Jason 文件能否被加载
describe('\n"11.temperaturecontroller"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          $httpBackend.expectGET('data/Teresult.json').respond({"result":" 您输入的信息有误.请确认后，重新输入。"});
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $controller('temperaturecontroller', {$scope: scope});
      }));
      it('测试Jason 文件能否被加载，it should get Twresult list.', function() {
          $httpBackend.flush();
          expect(scope.result).toEqual({"result":" 您输入的信息有误.请确认后，重新输入。"});
      });
   });
});

/*-------------------------------------------*/
describe('\nTests for "controllers"', function(){

    var scope, ctrl, $httpBackend;
    beforeEach(angular.mock.module('zjubme'));

    var baseurl="http://121.43.107.106:9000/Api/v1";

  describe('\n"temperaturecontroller"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          $controller('temperaturecontroller', {$scope: scope}); 
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenPOST(baseurl+"/VitalInfo/VitalSign")
        .respond({result:'数据插入成功'});
         
          spyOn(scope, 'fever');
          scope.check(true);
      }));
     //当输入体温值不在35和42之间时提示必填
      it('12.when $scope.check(true),$scope.twcheck should be "required"', function() {
          expect(scope.check(true));
          expect(scope.twcheck).toBe("required");
      });
      //当输入体温值在35和42之间时无任何提示
      it('13.when $scope.check(false),$scope.twcheck should be "required"', function() {
          expect(scope.check(false));
          expect(scope.twcheck).toBe("");
      });
      //当提交时，不能满足表单所需的所有条件，不能完成提交
      it('14.when save temperature with param false,$scope.twcheck = "required"', function() {
          expect(scope.showConfirm(false));
          expect(scope.twcheck).toEqual("required");
      });
      //当提交时，满足表单所需的所有条件,将弹出菜单
      it('15.when save temperature with param true,$scope.twcheck = ""', function() {
          //expect(scope.confirmPopup);
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenGET('data/Teresult.json').respond(200, '');//模拟控制器中调用模板页面
          scope.Temp.Temperature='38';
          scope.showConfirm(true);
          $httpBackend.flush();//触发发送
          //expect(scope.rdata).toEqual('数据插入成功');

      });
      //验证初始值
      it('16.test for start value of scope.status ', function() {
          expect(scope.status).toEqual("请输入");
      });
      //测试check函数是否被调用过
      it('17.测试check函数是否被调用过', function() {
           expect(scope.fever).toHaveBeenCalled();
        });
      //测试是否能够通过localStorage获取UserId
      it('18.测试是否能够通过localStorage获取UserId', function() {
           window.localStorage['UID']='U201511170002';
           var UserId =window.localStorage['UID'];
           expect(UserId).toEqual("U201511170002");
        });
  });
describe('\n"HealthCoachListCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;  
          $controller('HealthCoachListCtrl', {$scope: scope});
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenGET("templates/popover-sort.html").respond(200, '');
          $httpBackend.whenGET("templates/popover-select.html").respond(200, '');
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/HealthCoaches?$filter=sex+ge+''+&$skip=0&$top=10")
        .respond([{status:'getsuccess'}]);
          scope.popover1 = {hide:function()
            {console.log("$scope.popover1.hide() has been called")}
          };

      }));
     //调用下拉刷新函数
      it('19.when $scope.refreshHealthCoachList() implement ', function() {
          // expect(scope.refreshHealthCoachList());
          scope.filterCondition = "sex ge '' "; 
          $httpBackend.flush();//触发发送
          scope.refreshHealthCoachList();
          expect(scope.alertText).toEqual('正在努力加载中...');
          expect(scope.list).toEqual("仅供测试用途");

         // expect(scope.moreHealthCoach).toEqual(false);

      });
      //上拉加载更多评论
      it('20.when $scope.loadMoreHealthCoach() implement ', function() {
           $httpBackend.flush();//触发发送
           expect(scope.loadMoreHealthCoach());
           expect(scope.list).toEqual("仅供测试用途");
          expect(scope.moreHealthCoach).toEqual(false);
      });
      //排序
      it('21.when $scope.sideChange(item) implement ', function() {
          var item = { text: "姓名顺序排列", value: "name" };
          expect(scope.sideChange(item));
          expect(scope.orderProp).toEqual(item.value);
      });
      //筛选
      it('22.when $scope.selectFunction() implement ', function() {
          $httpBackend.flush();//触发发送
          scope.selectMenu={selectedSex:'all'};
          //scope.selectFunction.selectedSex=="all";
          expect(scope.selectFunction());
          expect(scope.alertText).toEqual("正在努力加载中...");
          expect(scope.list).toEqual("仅供测试用途");
      });
    });
describe('\n"HealthCoachInfoCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_; 
          $httpBackend.whenGET(/partials\/.*/).respond(200, ''); 
          $controller('HealthCoachInfoCtrl', {$scope: scope});
          $httpBackend.whenPOST(baseurl+"/Users/ReserveHealthCoach")
        .respond({result:'数据插入成功'});
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/GetHealthCoachInfo")
         .respond({imageURL:"DOC201506180002.jpg",name:"何疆春",age:"42",sex:"2",module:"高血压模块/糖尿病模块/心力衰竭模块",generalComment:"very good",generalscore:"3.3",commentNum:"29",activityDegree:"0",Description:"专业擅长：心血管疾病早期危险因素的筛查、风险评估及防治，冠心病、高血压病、高血脂症、心衰、冠状动脉慢血流的诊治，血栓防治，心脏病的超声诊断。",UnitName:"海军总医院",Dept:null,JobTitle:"住院医师",Level:"正高"});
          $httpBackend.whenGET(baseurl+"/Users/BasicDtlValue?CategoryCode=HM3&ItemCode=Doctor&ItemSeq=1&UserId=U201511170004")
        .respond({result:"DOC201506180002"});
        $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/GetCommentList?$orderby=CommentTime+desc&$top=2&CategoryCode=")
        .respond([{CategoryCode:"HM1",PatientId:"U201511170002",imageURL:"U201511170002_1447760482677.jpg",Name:"田雨",Comment:"很好，很nice的医生",Score:"4",CommentTime:"2015-12-10 22:13:53"}
         ]); 
        $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/HModulesByID?PatientId=U201511170002")
        .respond([{CategoryCode:"HM1",Modules:"高血压模块",DoctorId:"DOC201506180002"},
          {CategoryCode:"HM2",Modules:"糖尿病模块",DoctorId:"DOC201506180002"}]);
        $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/BasicDtlValue?CategoryCode=HM1&ItemCode=Doctor&ItemSeq=1&UserId=U201511170002")
        .respond({result:"DOC201506180002"});
        $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/RemoveHealthCoach?CategoryCode=HM1&PatientId=U201511170002")
        .respond({"result":"有正在执行的计划，无法删除"});
        $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/RemoveHealthCoach?CategoryCode=HM2&PatientId=U201511170002")
        .respond({"result":"有正在执行的计划，无法删除"});
          scope.showRemovePop();
      }));
    //获取预约权限
      it('23.when $scope.getReserveAuthority() implement ', function() {
          $httpBackend.flush();//触发发送
          var item= { text: "高血压", value: "HM1" };
          expect(scope.getReserveAuthority(item));
          expect(scope.reserve.selectedModoule).toEqual("");
      });
     //解除关系-弹框
     it('24.when $scope.showRemovePop() implement ', function() {
          $httpBackend.flush();//触发发送
          expect(scope.removeModuleCandicate[0].CategoryCode).toEqual("HM1");
          expect(scope.removeModuleCandicate[1].Modules).toEqual("糖尿病模块");
       });
    //弹出预约框
     it('25.when $scope.showreservePop() implement ', function() {
          expect(scope.showreservePop());
          expect(scope.reserve.Description).toEqual("");
      });
    });
describe('\n"CommentListCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;  
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenGET("templates/popover-sort.html").respond(200, ''); 
          $controller('CommentListCtrl', {$scope: scope});
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/GetCommentList?$orderby=CommentTime+desc&$skip=0&$top=10&CategoryCode=+")
        .respond([{CategoryCode:"HM1",PatientId:"U201511170002",imageURL:"U201511170002_1447760482677.jpg",Name:"田雨",Comment:"很好，很nice的医生",Score:"4",CommentTime:"2015-12-10 22:13:53"},
          {CategoryCode:"HM1",PatientId:"U201507170027",imageURL:null,Name:"T1715",Comment:"hehe",Score:"0",CommentTime:"2015-11-13 15:52:05"},
          {CategoryCode:"HM1",PatientId:"U201511120002",imageURL:null,Name:"童丹阳",Comment:"",Score:"1",CommentTime:"2015-11-25 16:36:21"}
         ]);
          var DoctorId="DOC201506180002";
          var CategoryCode='HM1';
          var num=5;
          var skip=0;
          scope.refreshComment();
          scope.popover = {hide:function()
            {console.log("$scope.popover.hide() has been called")}
          };
      }));
    //滚动时获取滚动长度， 超出某长度则显示“回到顶部按钮”
      // it('when $scope.getScrollPosition() implement ', function() {
      //     scope.moveData=50;
      //     expect(scope.getScrollPosition());
      //     expect(scope.scrollToTop).toEqual(false);
      // });
      //下拉刷新评论
      it('26.when $scope.refreshComment() implement ', function() {
          expect(scope.refreshComment());
          //$httpBackend.flush();//触发发送
          expect(scope.moreComment).toEqual(false);
         
      });
      //上啦加载更多评论
      it('27.when $scope.loadMoreComment() implement ', function() {
          expect(scope.loadMoreComment());
      });
      //模块列表的信息
      it('28.when $scope.modouleList implement ', function() {
          expect(scope.modouleList[2].text).toEqual("糖尿病");
          expect(scope.modouleList[2].value).toEqual("HM2");
      });
      //评论模块的筛选
      it('29.when $scope.filterModoule implement ', function() {
          expect(scope.filterModoule());
      });
  });
describe('\n"SetCommentCtrl"',function(){
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;  
          $controller('SetCommentCtrl', {$scope: scope});
          $httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/Users/BasicDtlValue?CategoryCode=HM1&ItemCode=Doctor&ItemSeq=1&UserId=U201511170002")
          .respond({DoctorId:'DOC201506180002'});
          // $httpBackend.whenPOST(baseurl+"/Users/SetComment")
          //  .respond({result:'数据插入成功'});
          //  scope.comment.selectedModoule=='HM1';
          //  scope.comment.commentContent="111111111111111";
          //  scope.deliverComment();
          //  scope.SetComment();
      }));
      //获取评论权限
       it('30.when $scope.getCommentAuthority implement ', function() {
          var item={ text: "高血压", value: "HM1" };
          scope.getCommentAuthority(item);
          $httpBackend.flush();
          //expect(scope.c.DoctorId).toEqual("DOC201506180002");
          
          
          //expect(scope.comment.selectedModoule).toEqual("HM1" );
      });
       //评论星星初始化
        it('31.when $scope.ratingsObject implement ', function() {
          expect(scope.ratingsObject.rating).toBe(5);
      });
        //评论星星点击改变分数
        it('32.when $scope.ratingsCallback implement ', function() {
          var rating=4;
          expect(scope.ratingsCallback(rating));
          expect(scope.comment.score).toEqual(rating);
      });
        //发表评论
        it('33.when $scope.deliverComment implement ', function() {
          expect(scope.deliverComment());
          //$httpBackend.flush();
      });
  });  
describe('\n"recordListcontroller"',function(){
  var Skip=5;
    beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_; 
          ///$httpBackend.whenGET(/partials\/.*/).respond(200, '');
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/VitalInfo/VitalSigns?$skip=0&$top=10&EndDate=20151230&StartDate=20151229&UserId=U201511170002")
          .respond([
                      {
                      "UserId": null,
                      "RecordDate": "20151229",
                      "RecordTime": "19:13",
                      "ItemType": "Height",
                      "ItemCode": "Height_1",
                      "Value": "178",
                      "Unit": "cm",
                      "Name": "身高",
                      "StartDate": null,
                      "EndDate": null,
                      "SignType": null
                    },
                    {
                      "UserId": null,
                      "RecordDate": "20151229",
                      "RecordTime": "19:13",
                      "ItemType": "Weight",
                      "ItemCode": "Weight_1",
                      "Value": "67",
                      "Unit": "kg",
                      "Name": "体重",
                      "StartDate": null,
                      "EndDate": null,
                      "SignType": null
                    }
           ]);
          $httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/VitalInfo/VitalSigns?$skip=10&$top=10&EndDate=20151230&StartDate=20151229&UserId=U201511170002")
          .respond([]);
          $httpBackend.whenGET(/partials\/.*/).respond(200, ''); 
          $controller('recordListcontroller', {$scope: scope});
      }));
    //点击开始日期时，设置初始值为0
      it('34.when $scope.setStart() implement ', function() {
        scope.setStart();
        expect(scope.setstate).toEqual(0);
      });
     //点击结束日期时，设置初始值为1
      it('35.when $scope.setEnd() implement ', function() {
         scope.setEnd();
         expect(scope.setstate).toEqual(1);
        });
    //点击加载更多按钮，加载数据
       it('36.when $scope.loadMore() implement ', function() {
          scope.loadMore();
          $httpBackend.flush();
          expect(scope.Signs_all.Skip).toEqual(20);
          expect(scope.Signs_all.list[0].Value).toEqual("178");
          expect(scope.Signs_all.list[1].ItemType).toEqual("Weight");
          expect(scope.Signs_all.list.length).toBe(2);
        });
       //点击下拉刷新，将获取相应条数的数据
       it('37.when $scope.doRefresh() implement ', function() {
         scope.doRefresh();
         $httpBackend.flush();
         expect(scope.Signs_all.list[0].Name).toEqual('身高');
         expect(scope.Signs_all.list.length).toEqual(4);
         expect(scope.Signs_all.Skip).toEqual(10);
        });
    });
});

describe('Test for filters', function() {
  beforeEach(angular.mock.module('zjubme'));
describe('\n"sex filter"',function(){
  beforeEach(inject(function(_$filter_){
     $filter = _$filter_;
   }));
  it('38.returns the correct value when given a char ', function() {
    var sex = $filter('sex');
    expect(sex('1')).toEqual('男');
    expect(sex('2')).toEqual('女');
  });
 }); 
});

