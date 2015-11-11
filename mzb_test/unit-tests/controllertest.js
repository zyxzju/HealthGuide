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

   // 		describe(" $scope.save() call $scope.closeModal()",function(){
			// beforeEach(function(){
		 //        scope.flag='update';
		 //    	spyOn(scope, 'closeModal');
		 //    	scope.alertcontent = {'index':1};
			// });
	  //  		it('', function() {
	  //  			expect(scope.save(true));
	  //  			expect(scope.flag).toBe('save');
	  //  			expect(scope.closeModal).toHaveBeenCalled();
	  //  		});
   // 		});
	});
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
	describe('\n"TaskInfo"',function(){
		var scope, taskinfo, $httpBackend,rdata,getep;
		beforeEach(angular.mock.inject(function(TaskInfo,$rootScope, $controller, _$httpBackend_){
	        scope = $rootScope.$new();
	        $httpBackend = _$httpBackend_;
	        taskinfo = TaskInfo;
	        gettasklist = {"ParentCode":"T","PlanNo":"","Date":"NOW","PatientId":"PID201506180013"};
			$httpBackend.whenGET("http://121.43.107.106:9000/Api/v1/PlanInfo/Tasks?$filter=InvalidFlag+eq+'1'&Date=NOW&ParentCode=T&PatientId=PID201506180013&PlanNo=")
				.respond([{Code: "TA0000",ControlType: "0",Description: "",GroupHeaderFlag: "0",Instruction: "",InvalidFlag: "1",Name: "体重管理",OptionCategory: "",ParentCode: "T",SortNo: "",Status: "0",Type: "TA",VitalSignValue: ""}]);
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
	    }));
   		it('GetExecutingPlan() method should get executing plan number.', function() {
			var promise = taskinfo.GetTasklist(gettasklist);
			promise.then(function(d) {
				rdata = d[0];
			});
			$httpBackend.flush();
      		expect(rdata.Name).toEqual('体重管理');
   		});
	});
});