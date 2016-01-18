var baseUrl='http://121.43.107.106:9000/Api/v1/';
// window.localStorage['UID'] = 'U201512150001';
describe('\nTests for "controllers"', function(){

	var scope, $httpBackend, data;
	beforeEach(angular.mock.module('zjubme'));

	describe('\n"personalInfocontroller"', function(){
		var data_InsuranceType, data_BloodType, data_SexType, UserId;
		// window.localStorage['UID'] = 'U201512150001';
		beforeEach(angular.mock.inject(function($rootScope, $controller, _$httpBackend_, Data){
			window.localStorage['UID'] = 'U201512150001';//这东西存不对地方还不行！！
			UserId = window.localStorage['UID'];
			data = Data;
			$httpBackend = _$httpBackend_;
			scope = $rootScope.$new();
			$controller('personalInfocontroller',{$scope: scope});
			data_InsuranceType = [{"Code":"1","Name":"医保","InputCode":"YB","Redundance":""},{"Code":"2","Name":"免费","InputCode":"MF","Redundance":""}];
			data_BloodType = [{"Type":"1","Name":"A型"},{"Type":"2","Name":"B型"}];
			data_SexType = [{"Type":"1","Name":"男性"},{"Type":"2","Name":"女性"}];
			$httpBackend.whenGET(baseUrl + 'Dict/GetInsuranceType').respond(data_InsuranceType);
			$httpBackend.whenGET(baseUrl + 'Dict/Type%2FCategory?Category=AboBloodType').respond(data_BloodType);
			$httpBackend.whenGET(baseUrl + 'Dict/Type%2FCategory?Category=SexType').respond(data_SexType);
			$httpBackend.whenGET(baseUrl + 'Users/'+UserId+'%2FBasicInfo')
				.respond({"UserId":"U201512150001","UserName":"张桠童","Age":"24","Gender":"2","BloodType":"1","InsuranceType":"K","Birthday":"19911222","GenderText":"女性","BloodTypeText":"A型","InsuranceTypeText":"合作医疗","Module":"","DoctorId":"","IDNo":"sample string 5"});
			$httpBackend.whenGET(baseUrl + 'Users/'+UserId+'%2FBasicDtlInfo')
				.respond({"UserId":"U201512150001","PhoneNumber":"13171763855","HomeAddress":"浙江大学","Occupation":"学生","Nationality":"中国","EmergencyContact":"张某某","EmergencyContactPhoneNumber":"18903184288","PhotoAddress":"","Module":"","IDNo":"131125199112220620","Height":"165","Weight":"56"});
			$httpBackend.whenPOST(baseUrl + 'Users/BasicInfo')
				.respond({"result":"数据插入成功"});
			$httpBackend.whenPOST(baseUrl + 'Users/BasicDtlInfo')
				.respond({"result":"数据插入成功"});
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');//模拟路由
			$httpBackend.whenGET("my-popover.html").respond(200, '');
		}));
		it('基本信息栏是否展开', function(){
			expect(scope.isShown1()).toBe(true);
		});	
		it('体征信息栏的打开/关闭控制', function(){
			$httpBackend.flush();
			scope.toggle2();
			expect(scope.isShown2()).toBe(true);
			scope.toggle2();
			expect(scope.isShown2()).toBe(false);
		});
		it('身份信息栏的打开/关闭控制', function(){
			$httpBackend.flush();
			scope.toggle3();
			expect(scope.isShown3()).toBe(true);
			scope.toggle3();
			expect(scope.isShown3()).toBe(false);
		});
		it('联系信息栏的打开/关闭控制', function(){
			$httpBackend.flush();
			scope.toggle4();
			expect(scope.isShown4()).toBe(true);
			scope.toggle4();
			expect(scope.isShown4()).toBe(false);
		});
		it('医保信息/血型信息/性别信息是否读入', function(){
			// expect(scope.InsuranceTypes).toBeNull();
			$httpBackend.flush();
			expect(scope.InsuranceTypes[0].Name).toBe("医保");
			expect(scope.BloodTypes[0].Name).toBe("A型");
			expect(scope.Genders[0].Name).toBe("男性");
		});	
		it('基本信息是否读入', function(){
			$httpBackend.flush();
			expect(scope.BasicInfo.UserName).toEqual("张桠童");
		});
		it('详细信息是否读入', function(){
			$httpBackend.flush();
			expect(scope.BasicDtlInfo.PhoneNumber).toEqual(13171763855);
		});
		it('基本/详细信息是否插入成功', function(){
			$httpBackend.flush();
			scope.SaveInfo(false, false, false);//没有报错说明数据插入的两个伪后台操作成功
		});
		// it('基本信息是否插入成功', function(){
		// 	$httpBackend.flush();
		// 	expect(scope.BasicDtlInfo.PhoneNumber).toEqual("13171763855");
		// });
	});
});

describe('\nTests for "services"', function(){
	
	beforeEach(angular.mock.module('zjubme'));

	describe('\n"Dict" in the "Data"', function(){
		var scope, data, $httpBackend;
		beforeEach(angular.mock.inject(function(Data, $rootScope, _$httpBackend_){
			scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			data = Data;
			$httpBackend.whenGET(baseUrl + 'Dict/GetInsuranceType')
				.respond([{"Code":"1","Name":"医保","InputCode":"YB","Redundance":""},{"Code":"2","Name":"免费","InputCode":"MF","Redundance":""},{"Code":"3","Name":"包干","InputCode":"BG","Redundance":""},{"Code":"4","Name":"军半费","InputCode":"JBF","Redundance":""},{"Code":"5","Name":"基本医保","InputCode":"JBYB","Redundance":""},{"Code":"6","Name":"大病统筹","InputCode":"DBTC","Redundance":""},{"Code":"7","Name":"公费医疗","InputCode":"GFYL","Redundance":""},{"Code":"8","Name":"中青医保","InputCode":"ZQYB","Redundance":""},{"Code":"A","Name":"自费","InputCode":"ZF","Redundance":""},{"Code":"B","Name":"公费","InputCode":"GF","Redundance":""},{"Code":"C","Name":"贵宾","InputCode":"GB","Redundance":""},{"Code":"D","Name":"其他","InputCode":"QT","Redundance":""},{"Code":"E","Name":"老年无业","InputCode":"LNWY","Redundance":""},{"Code":"F","Name":"儿童医保","InputCode":"ETYB","Redundance":""},{"Code":"G","Name":"停用","InputCode":"TY","Redundance":""},{"Code":"H","Name":"离休医保","InputCode":"LXYB","Redundance":""},{"Code":"I","Name":"医疗照顾","InputCode":"YLZG","Redundance":""},{"Code":"J","Name":"外地医保","InputCode":"WDYB","Redundance":""},{"Code":"K","Name":"合作医疗","InputCode":"HZYL","Redundance":""},{"Code":"L","Name":"慈善儿童","InputCode":"CSET","Redundance":""},{"Code":"M","Name":"不孕不育","InputCode":"BYBY","Redundance":""},{"Code":"N","Name":"军休干部","InputCode":"JXGB","Redundance":""},{"Code":"Z","Name":"军队医改","InputCode":"JDYG","Redundance":""}]);
			$httpBackend.whenGET(baseUrl + 'Dict/Type%2FCategory?Category=AboBloodType')
				.respond([{"Type":"1","Name":"A型"},{"Type":"2","Name":"B型"},{"Type":"3","Name":"O型"},{"Type":"4","Name":"AB型"},{"Type":"5","Name":"其他"}]);
			$httpBackend.whenGET(baseUrl + 'Dict/Type%2FCategory?Category=SexType')
				.respond([{"Type":"1","Name":"男性"},{"Type":"2","Name":"女性"},{"Type":"3","Name":"其他"},{"Type":"4","Name":"未知"}]);
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
		}));
		it('GetInsuranceType() method 读入医保类型', function(){
			data.Dict.GetInsuranceType({}, function(receivedata){
				InsuranceTypes = receivedata;
			});
			$httpBackend.flush();
			expect(InsuranceTypes.length).toEqual(23);
			expect(InsuranceTypes[0].Name).toEqual("医保");
		});
		it('GetTypeList(AboBloodType) method 读入血型', function(){
			data.Dict.GetTypeList({Category:"AboBloodType"}, function(receivedata){
				AboBloodTypes = receivedata;
			});
			$httpBackend.flush();
			expect(AboBloodTypes.length).toEqual(5);
			expect(AboBloodTypes[0].Name).toEqual("A型");
		});
		it('GetTypeList(SexType) method 读入性别', function(){
			data.Dict.GetTypeList({Category:"SexType"}, function(receivedata){
				SexTypes = receivedata;
			});
			$httpBackend.flush();
			expect(SexTypes.length).toEqual(4);
			expect(SexTypes[0].Name).toEqual("男性");
		});
	});	
	describe('\n"Users" in the "Data"', function(){
		var scope, data, $httpBackend;
		beforeEach(angular.mock.inject(function(Data, $rootScope, _$httpBackend_){
			UserId = window.localStorage['UID'];
			scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			data = Data;
			$httpBackend.whenGET(baseUrl + 'Users/'+UserId+'%2FBasicInfo')
				.respond({"UserId":"U201512150001","UserName":"张桠童","Age":"24","Gender":"2","BloodType":"1","InsuranceType":"K","Birthday":"19911222","GenderText":"女性","BloodTypeText":"A型","InsuranceTypeText":"合作医疗","Module":"","DoctorId":"","IDNo":"sample string 5"});
			$httpBackend.whenGET(baseUrl + 'Users/'+UserId+'%2FBasicDtlInfo')
				.respond({"UserId":"U201512150001","PhoneNumber":"13171763855","HomeAddress":"浙江大学","Occupation":"学生","Nationality":"中国","EmergencyContact":"张某某","EmergencyContactPhoneNumber":"18903184288","PhotoAddress":"","Module":"","IDNo":"131125199112220620","Height":"165","Weight":"56"});
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
		}));
		it('GetPatBasicInfo() method 读入病人基本信息', function(){
			data.Users.GetPatBasicInfo({route:UserId+'/BasicInfo'}, function(receivedata){
				PatBasicInfos = receivedata;
			});
			$httpBackend.flush();
			expect(PatBasicInfos).not.toBeNull();
			expect(PatBasicInfos.UserId).toEqual("U201512150001");
			expect(PatBasicInfos.UserName).toEqual("张桠童");		
		});
		it('GetPatientDetailInfo() method 读入病人详细信息', function(){
			data.Users.GetPatientDetailInfo({route:UserId+'/BasicDtlInfo'}, function(receivedata){
				PatientDetailInfos = receivedata;
			});
			$httpBackend.flush();
			expect(PatientDetailInfos).not.toBeNull();
			expect(PatientDetailInfos.UserId).toEqual("U201512150001");
			expect(PatientDetailInfos.PhoneNumber).toEqual("13171763855");
		});
	});	
	describe('\n"Users" in the "Data"', function(){
		var scope, data, $httpBackend, temp_SetPatBasicInfo, temp_PostPatBasicInfoDetail;
		beforeEach(angular.mock.inject(function(Data, $rootScope, _$httpBackend_){
			scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			data = Data;
			temp_SetPatBasicInfo = {
									  "UserId": "sample string 1",
									  "UserName": "sample string 2",
									  "Birthday": 3,
									  "Gender": 4,
									  "BloodType": 5,
									  "IDNo": "sample string 6",
									  "DoctorId": "sample string 7",
									  "InsuranceType": "sample string 8",
									  "InvalidFlag": 9,
									  "piUserId": "sample string 10",
									  "piTerminalName": "sample string 11",
									  "piTerminalIP": "sample string 12",
									  "piDeviceType": 13
									};
			temp_PostPatBasicInfoDetail = [{
										    "Patient": "sample string 1",
										    "CategoryCode": "sample string 2",
										    "ItemCode": "sample string 3",
										    "ItemSeq": 4,
										    "Value": "sample string 5",
										    "Description": "sample string 6",
										    "SortNo": 7,
										    "revUserId": "sample string 8",
										    "TerminalName": "sample string 9",
										    "TerminalIP": "sample string 10",
										    "DeviceType": 11
										  },
										  {
										    "Patient": "sample string 1",
										    "CategoryCode": "sample string 2",
										    "ItemCode": "sample string 3",
										    "ItemSeq": 4,
										    "Value": "sample string 5",
										    "Description": "sample string 6",
										    "SortNo": 7,
										    "revUserId": "sample string 8",
										    "TerminalName": "sample string 9",
										    "TerminalIP": "sample string 10",
										    "DeviceType": 11
										  }];
			$httpBackend.whenPOST(baseUrl + 'Users/BasicInfo')
				.respond({"result":"数据插入成功"});
			$httpBackend.whenPOST(baseUrl + 'Users/BasicDtlInfo')
				.respond({"result":"数据插入成功"});
			$httpBackend.whenGET(/partials\/.*/).respond(200, '');
		}));
		it('SetPatBasicInfo() method 插入病人基本信息', function(){
			data.Users.SetPatBasicInfo(temp_SetPatBasicInfo, function(receivedata){
				rdata = receivedata;
			});
			$httpBackend.flush();
			// expect(rdata.result).not.toBeNull();
			expect(rdata.result).toEqual("数据插入成功");
		});
		it('PostPatBasicInfoDetail() method 插入病人详细信息', function(){
			data.Users.PostPatBasicInfoDetail(temp_PostPatBasicInfoDetail, function(receivedata){
				rdata = receivedata;
			});
			$httpBackend.flush();
			expect(rdata.result).toEqual("数据插入成功");
		});
	});	
});