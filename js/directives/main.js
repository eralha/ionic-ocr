var DirectivesModule = angular.module('starter.directives', [])

DirectivesModule.directive('dirFileInput', ['$rootScope', '$injector', 'FileService', function($rootScope, $injector, FileService) {
  return {
  	restrict: 'A',
    compile: function(e, a){
        //console.log($(e).html(), arguments);
        return function(scope, elem, attrs) {

        	$(elem).change(function(){
        		var files = $(this).prop('files');

        		console.log(files);

        		for(var i = 0; i < files.length; i++){
        			//console.log(files[i]);
        			FileService.addFile(files[i]).then(function(file){
        				//scope.$apply();
        				//console.log(file);
        			});
        		}
        	});

        }
    }
  };
}]);
