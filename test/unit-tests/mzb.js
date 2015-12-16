describe('\nTests for "controllers"', function(){

    var scope, ctrl, $httpBackend;
    beforeEach(angular.mock.module('zjubme'));

	describe('\n"SlidePageCtrl"',function(){
		beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
			$httpBackend.expectGET('data/catalog.json').respond(
			{
				"catalog":"个人信息",
				"catalogID":"personalInfo",
				"url":"img/icon/personalInfo.png"
			});
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	        $controller('SlidePageCtrl', {$scope: scope});
	    }));
   		it('should get catalog list.', function() {
			$httpBackend.flush();
      		expect(scope.catalog).toEqual(
			{
				"catalog":"个人信息",
				"catalogID":"personalInfo",
				"url":"img/icon/personalInfo.png"
			});
   		});
   		it('when $scope.alerttitlecheck(true),$scope.checkalert should be "required"', function() {
      		expect(scope.alerttitlecheck(true));
      		expect(scope.checkalert).toBe("required");
   		});
   		it('when save a new alert with param false,$scope.checkalert = "required"', function() {
      		expect(scope.save(false));
      		expect(scope.checkalert).toEqual("required");
   		});
   		it('test for a sigle value', function() {
      		expect(scope.tmzb).toEqual("test");
   		});

   		describe(" $scope.save() when true and update",function(){
			beforeEach(function(){
		        scope.flag='update';
		    	spyOn(scope, 'closeModal');
		    	scope.alertcontent = {'index':1};
		    	scope.save(true)
			});
	   		it('', function() {
	   			expect(scope.flag).toBe('save');
	   			expect(scope.closeModal).toHaveBeenCalled();
	   		});
   		});
   		describe(" $scope.save() when true and save new",function(){
			beforeEach(function(){
		    	scope.alertcontent = {'index':0};
		    	spyOn(scope, 'closeModal');
		    	scope.save(true)
			});
	   		it('', function() {
	   			expect(scope.flag).not.toBe('save');
	   		});
   		});
	});
	// describe('\nTest for tasklistcontroller',function(){

	// 	beforeEach(angular.mock.inject(function($rootScope, $controller){
	// 		scope = $rootScope.$new();
	//         $controller('tasklistcontroller', {$scope: scope});
	// 	}));
	// 	describe('\n数据初始化是否正确?',function(){
	// 		beforeEach(function(){
	// 			scope.doRefresh();
	// 		});
	// 		it('\n请求服务器数据的参数',function(){
	// 			expect(getexecutingplan).toHaveBeenCalled();
	// 		});
	// 	});
	// });
	// describe('\nTest for taskdetailcontroller',function(){

	// 	beforeEach(angular.mock.inject(function($rootScope, $controller){
	// 		scope = $rootScope.$new();
	//         $controller('taskdetailcontroller', {$scope: scope});
	// 	}));
	// 	describe('\n刷新任务列表?',function(){
	// 		beforeEach(function(){
	// 			scope.doRefresh();
	// 			spyOn(extraInfo,'PlanNo');
	// 		});
	// 		it('\n请求服务器数据的参数',function(){
	// 			// expect().toHaveBeenCalled();
	// 		});
	// 	});
	// });
});
describe('\nTests for "services"', function(){
    
    beforeEach(angular.mock.module('zjubme'));

	describe('\n"PlanInfo"',function(){
		var scope, planinfo, $httpBackend,rdata,getep;
		beforeEach(angular.mock.inject(function(PlanInfo,$rootScope, $controller, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
	        planinfo = PlanInfo;
	        getep = {
				PatientId:"PID201506180013",
				PlanNo:'NULL',
				Module:'M1',
				Status:'3'
			}
			$httpBackend.whenGET('http://121.43.107.106:9000/Api/v1/PlanInfo/Plan?Module=M1&PatientId=PID201506180013&PlanNo=NULL&Status=3')
				.respond([{"PlanNo":"PLN201511050006","PlanName":"当前计划","PatientId":"PID201506180013","StartDate":"20151105","EndDate":"99991231","Module":"M1","Status":"3","PlanCompliance":"0.05","RemainingDays":"36134","ProgressRate":"0","DoctorId":"DOC201506180002","DoctorName":"何疆春","piUserId":null,"piTerminalName":null,"piTerminalIP":null,"piDeviceType":0}]);
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	    }));
   		it('GetExecutingPlan() method should get executing plan number.', function() {
			var promise = planinfo.GetExecutingPlan(getep);
			promise.then(function(d) {
				rdata = d[0];
			});
			$httpBackend.flush();
      		expect(rdata.PlanNo).toEqual('PLN201511050006');
   		});
	});
	describe('\n"extraInfo"',function(){
		var scope, ExtraInfo, $httpBackend;
		beforeEach(angular.mock.inject(function(extraInfo,$rootScope, $controller, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
	        ExtraInfo = extraInfo;
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	    }));
   		it('extraInfo.PatientId', function() {//测试extraInfo.PatientId()方法的正确性
			ExtraInfo.PatientId('testPatientId');//存入PatientId到localstorage
      		expect(ExtraInfo.PatientId()).toEqual('testPatientId');//从localstorage取出PatientId
   		});
   		it('extraInfo.PlanNo', function() {//测试extraInfo.PlanNo()方法的正确性
			ExtraInfo.PlanNo('testPlanNo');//存入PlanNo到localstorage
      		expect(ExtraInfo.PlanNo()).toEqual('testPlanNo');//从localstorage取出PlanNo
   		});
   		it('extraInfo.TerminalIP', function() {//测试extraInfo.TerminalIP()方法的正确性
			ExtraInfo.TerminalIP('testTerminalIP');//存入TerminalIP到localstorage
      		expect(ExtraInfo.TerminalIP()).toEqual('testTerminalIP');//从localstorage取出TerminalIP
   		});
   		it('extraInfo.TerminalName', function() {//测试extraInfo.TerminalName()方法的正确性
			ExtraInfo.TerminalName('testTerminalName');//存入TerminalName到localstorage
      		expect(ExtraInfo.TerminalName()).toEqual('testTerminalName');//从localstorage取出TerminalName
   		});
   		it('extraInfo.revUserId', function() {//测试extraInfo.revUserId()方法的正确性
			ExtraInfo.revUserId('testrevUserId');//存入revUserId到localstorage
      		expect(ExtraInfo.revUserId()).toEqual('testrevUserId');//从localstorage取出revUserId
   		});
   		it('extraInfo.DateTimeNow', function() {//测试extraInfo.DateTimeNow()方法的正确性
      		console.log(ExtraInfo.DateTimeNow());//此处仅输出dt查看各项是否正确
   		});
   		it('extraInfo.dictionary', function() {//测试extraInfo.dictionary()方法的正确性
      		expect(ExtraInfo.dictionary("TD0000")).toEqual('openHeModal');//匹配字典
      		expect(ExtraInfo.dictionary("TF0001")).toEqual('#/tab/task/bpm');
      		expect(ExtraInfo.dictionary("TF0002")).toEqual('#/tab/task/bpm');
      		expect(ExtraInfo.dictionary("TF0003")).toEqual('#/tab/task/bloodglucose');
      		expect(ExtraInfo.dictionary("TA0001")).toEqual('#/tab/task/measureweight');
      		expect(ExtraInfo.dictionary("TG0001")).toEqual('#/tab/task/riskinfo');
      		expect(ExtraInfo.dictionary("TF0004")).toEqual('#/tab/task/temperature');
      		expect(ExtraInfo.dictionary("other")).toEqual('');//输入为其他任何情况是返回空字符 ''
   		});
   		it('extraInfo.TransformUrl', function() {//测试extraInfo.TransformUrl()方法的正确性
      		expect(ExtraInfo.TransformUrl("/testurl")).toEqual('http://121.43.107.106:8090/testurl');//转换链接
   		});
   		it('extraInfo.TransformBloodglucoseCode', function() {//测试extraInfo.TransformBloodglucoseCode()方法的正确性
      		expect(ExtraInfo.TransformBloodglucoseCode("凌晨")).toEqual('BloodSugar_2');//匹配字典
      		expect(ExtraInfo.TransformBloodglucoseCode("睡前")).toEqual('BloodSugar_3');
      		expect(ExtraInfo.TransformBloodglucoseCode("早餐前")).toEqual('BloodSugar_4');
      		expect(ExtraInfo.TransformBloodglucoseCode("早餐后")).toEqual('BloodSugar_5');
      		expect(ExtraInfo.TransformBloodglucoseCode("午餐前")).toEqual('BloodSugar_6');
      		expect(ExtraInfo.TransformBloodglucoseCode("午餐后")).toEqual('BloodSugar_7');
      		expect(ExtraInfo.TransformBloodglucoseCode("晚餐前")).toEqual('BloodSugar_8');
      		expect(ExtraInfo.TransformBloodglucoseCode("晚餐后")).toEqual('BloodSugar_9');
      		expect(ExtraInfo.TransformBloodglucoseCode("other")).toEqual('');//输入为其他任何情况是返回空字符 ''
   		});
   		it('extraInfo.TransformInstruction', function() {//测试extraInfo.TransformInstruction()方法的正确性
      		expect(ExtraInfo.TransformInstruction(//配置输入情况
      			[{
      				ParentCode:'TB0000',
      				Instruction:''
      			},
      			{
      				ParentCode:'TB0000',
      				Instruction:'50'
      			}]))
      		.toEqual([{
      				ParentCode:'TB0000',
      				Instruction:''//Instruction为空时不改变原有值
      			},
      			{
      				ParentCode:'TB0000',
      				Instruction:'建议摄入量：50克'//Instruction不为空时应该输入Instruction为示例值
      			}]);
   		});
   		it('extraInfo.refreshstatus', function() {//测试extraInfo.refreshstatus()方法的正确性
      		ExtraInfo.refreshstatus("testrefreshstatus");//测试存入localstorage
      		expect(ExtraInfo.refreshstatus()).toEqual('testrefreshstatus');//测试取出localstorage
   		});
	});
	describe('\nBloodPressureMeasure',function(){
		var scope,bloodpressuremeasure;
		beforeEach(angular.mock.inject(function(BloodPressureMeasure,$rootScope, $controller){
	        scope = $rootScope.$new();
	        bloodpressuremeasure = BloodPressureMeasure;
	    }));

	    it('BloodPressureMeasure.BPConclusion', function() {//测试BloodPressureMeasure.BPConclusion()方法的正确性
      		expect(bloodpressuremeasure.BPConclusion(110,75)).toEqual('您的血压属于正常\n范围，请继续保持');//测试不同范围的输入输出结果是否正确
      		expect(bloodpressuremeasure.BPConclusion(135,75)).toEqual('您的血压偏高，请注意降压');
      		expect(bloodpressuremeasure.BPConclusion(110,95)).toEqual('您的血压偏高，请注意降压');
      		expect(bloodpressuremeasure.BPConclusion(135,95)).toEqual('您的血压偏高，请注意降压');
   		});
   		it('BloodPressureMeasure.FindCommand', function() {//测试BloodPressureMeasure.FindCommand()方法的正确性
      		expect(bloodpressuremeasure.FindCommand()[7]).toEqual(178);//测试输出的参数是否经过计算
   		});
   		it('BloodPressureMeasure.StartCommand', function() {//测试BloodPressureMeasure.StartCommand()方法的正确性
      		var StartCommand = new Uint8Array(9);//定义空的传入参数
      		expect(bloodpressuremeasure.StartCommand(StartCommand)[8]).toEqual(253);//测试输出的参数是否经过计算
   		});
   		it('BloodPressureMeasure.BloodPressureChart', function() {//测试BloodPressureMeasure.BloodPressureChart()方法的正确性
      		expect(bloodpressuremeasure.BloodPressureChart().type).toEqual('serial');//测试用于绘图的参数输出是否正确
   		});
	});
	describe('\n"VitalInfo"',function(){
		var scope, vitalInfo, $httpBackend, baseurl;
		beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
	        vitalInfo = VitalInfo;
			baseurl = 'http://121.43.107.106:9000/Api/v1/';

			$httpBackend.whenPOST(baseurl + 'VitalInfo/VitalSign')
				.respond({status:'postsuccess'});
			$httpBackend.whenGET(baseurl+'VitalInfo/VitalSigns?UserId=%7B%22UserId%22:%22testUID%22,%22ItemType%22:%22BloodSugar%22,%22ItemCode%22:%22BloodSugar_10%22%7D')
				.respond([{status:'getsuccess'}]);
			
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	    }));
	    it('VitalInfo.InsertServerData', function() {//测试VitalInfo.InsertServerData()方法的正确性
	    	window.localStorage['UID']='testUID';//存入必要的参数到localstorage
      		console.log(vitalInfo.InsertServerData());//输出结果以查看转换的参数是否为预期值
   		});
   		it('VitalInfo.PostPatientVitalSigns', function() {//测试VitalInfo.PostPatientVitalSigns()方法的正确性
   			var data = {ItemCode: "",//定义请求服务器的参数
						ItemType: "",
						RecordDate: "20151215",
						RecordTime: "151441",
						TerminalIP: "testTerminalIP",
						TerminalName: "testTerminalName",
						Unit: "",
						UserId: "testUID",
						Value: "",
						revUserId: "testUID",
						Unit: 'mmHg',
    					ItemType: 'Bloodpressure',
    					ItemCode: 'Bloodpressure_1'};
			var rd;
			var promise = vitalInfo.PostPatientVitalSigns(data);//调用services方法
			promise.then(function(d) {
				rd = d;//请求成功后保存返回数据
			});
			$httpBackend.flush();
      		expect(rd.status).toEqual('postsuccess');//查看期望值
   		});
   		it('VitalInfo.VitalSigns', function() {//测试VitalInfo.VitalSigns()方法的正确性
   			var param = {//定义访问服务器参数
   				"UserId":window.localStorage['UID'],
   				"ItemType":"BloodSugar",
   				"ItemCode":"BloodSugar_10"
   			};
   			var rd;
			var promise = vitalInfo.VitalSigns(param);
			promise.then(function(d) {
				rd = d;//请求成功后保存返回数据
			});
			$httpBackend.flush();
      		expect(rd[0].status).toEqual('getsuccess');//查看期望值
   		});
	});
	describe('\n"TaskInfo"',function(){
		var scope, taskinfo, $httpBackend,rdata,getep;
		beforeEach(angular.mock.inject(function(TaskInfo,$rootScope, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
	        taskinfo = TaskInfo;

	        gettasklist = {"ParentCode":"T","PlanNo":"","Date":"NOW","PatientId":"PID201506180013"};
			
			$httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/PlanInfo/Tasks?$filter=InvalidFlag+eq+'1'&Date=NOW&ParentCode=T&PatientId=PID201506180013&PlanNo=")
				.respond([{Code: "TA0000",ControlType: "0",Description: "",GroupHeaderFlag: "0",Instruction: "",InvalidFlag: "1",Name: "体重管理",OptionCategory: "",ParentCode: "T",SortNo: "",Status: "0",Type: "TA",VitalSignValue: ""}]);
			
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	    }));
   		it('TaskInfo.GetTasklist', function() {//测试TaskInfo.GetTasklist()方法的准确性
			var promise = taskinfo.GetTasklist(gettasklist);//测试获取任务列表
			promise.then(function(d) {
				rdata = d[0];
			});
			$httpBackend.flush();
      		expect(rdata.Name).toEqual('体重管理');//测试期望是否正确
   		});
   		it('TaskInfo.insertstate', function() {//测试TaskInfo.insertstate()方法的准确性
   			var param = [{//配置必要的参数，分为两种情况
   				ParentCode: 'TD0000',
   				Code: 'TD0001'
   			},{
   				ParentCode: 'TF0000',
   				Code: 'TF0001'
   			}];			
      		expect(taskinfo.insertstate(param)).toEqual(//测试两种不同的输入时输出与期望是否一样
  			[{
  				ParentCode: 'TD0000',
   				Code: 'TD0001',
  				index: 0, 
  				click: 'openHeModal' 
  			},{ 
  				ParentCode: 'TF0000', 
  				Code: 'TF0001',
  				index: 1, 
  				go: '#/tab/task/bpm' }
			]);
   		});
   		it('TaskInfo.done', function() {//测试TaskInfo.done()方法的准确性
   			var arr = {//配置必要的参数
   				Type: 'testtype',
   				Code: 'testcode',
   				Description: 'testDescription',
   				Status: '1'
   			};		
      		expect(taskinfo.done(arr,'testPlanNo')).toEqual(//测试返回结果
  			{ $$state: Object({ status: 0 }) });
   		});
	});
describe('\n"NotificationService"',function(){
		var scope, notificationService;
		beforeEach(angular.mock.inject(function(NotificationService,$rootScope){
	        scope = $rootScope.$new();
	        notificationService = NotificationService;
	    }));

   		it('notificationService.save', function() {//测试NotificationService.save()方法的准确性
      		var  arr = {index:0};
      		var test = window.localStorage['alertlist'];
      		notificationService.save(arr);//调用NotificationService.save()方法
      		expect(window.localStorage['alertlist']).not.toEqual(test);//测试期望是否正确
   		});
   		it('notificationService.get', function() {//测试NotificationService.get()方法的准确性
      		var test = window.localStorage['alertlist'];
      		expect(notificationService.get()).toEqual(angular.fromJson(test));//测试期望是否正确
   		});
   		it('notificationService.remove', function() {//测试NotificationService.remove()方法的准确性
      		var test = window.localStorage['alertlist'];
      		notificationService.remove(0);//调用NotificationService.remove()
      		expect(window.localStorage['alertlist']).not.toEqual(test);//测试期望是否正确
   		});
	});
});