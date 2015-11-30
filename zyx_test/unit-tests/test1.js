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
    var scope, vitalinfo, $httpBackend,rdata,getep;
    beforeEach(angular.mock.inject(function(VitalInfo,$rootScope, $controller, _$httpBackend_){
          scope = $rootScope.$new();
          $httpBackend = _$httpBackend_;
          vitalinfo = VitalInfo;
          temperaturelist = {UserId:"U201511120002"};
      $httpBackend.whenPOST("http://121.43.107.106:9000/Api/v1/VitalInfo/VitalSign")
        .respond([{result: "数据插入成功"}]);
      $httpBackend.whenPOST(/partials\/.*/).respond(200, '');
      }));
      it('PostPatientVitalSigns() method should get temperature list.', function() {
      var promise = vitalinfo.PostPatientVitalSigns(temperaturelist);
      promise.then(function(d) {
        rdata = d[0];
      });
      $httpBackend.flush();
          expect(rdata.ItemType).toEqual('Temperature');
      });
  });
});