var DirectivesModule = angular.module('starter.directives', []);

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


DirectivesModule.directive('dirImageZoom', ['$rootScope', '$injector', 'FileService', function($rootScope, $injector, FileService) {
  return {
    restrict: 'A',
    compile: function(e, a){
        //console.log($(e).html(), arguments);
        return function(scope, elem, attrs) {

            var img = $(elem).find('img');

            $(elem).mousemove(function(e){
                var ew = $(elem).width();
                var eh = $(elem).height();
                var iw = $(img).width();
                var ih = $(img).height();
                var ofx = e.offsetX;
                var ofy = e.offsetY;

                var x = (ofx * iw) / ew;
                var y = (ofy * ih) / eh;

                var limitX = iw - ew;
                var limitY = ih - eh;

                x = (x > limitX) ? limitX : x;
                y = (y > limitY) ? limitY : y;

                $(img).css('left', (0 - x)+'px');
                $(img).css('top', (0 - y)+'px');
            });

        }
    }
  };
}]);