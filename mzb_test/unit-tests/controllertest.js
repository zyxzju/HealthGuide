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
   		beforeEach(function(){
			scope.closeModal = function()
	        {
	        	console.log(123)
	        }
	        scope.flag='update';
		});
   		it('when', function() {
   			expect(scope.save(true));
   			expect(scope.flag).toBe('save');
   		});
	});
});