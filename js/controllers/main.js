var ControllersModule = angular.module('starter.controllers', [])

ControllersModule.controller('DashCtrl', function($scope) {

	$scope.fileInputChange = function(){
	}

});


ControllersModule.controller('FileListController', function($scope, FileService) {

	$scope.files = FileService.getFiles();

	//watch for changes in fileService loaded var
		$scope.$watch(function(){
			return FileService.loadedNr;

		}, function(){
			if(FileService.loadedNr == FileService.fileTotal){
				$scope.isloading = false;
			}

			$scope.loaded = FileService.loadedNr;
		})

	$scope.getTexts = function(){
		FileService.loadFileTexts();

		$scope.isloading = true;
		$scope.loaded = FileService.loadedNr;
		$scope.total = FileService.fileTotal;
	}

	$scope.removeFile = function(file){
		FileService.removeFile(file);
	}

	$scope.copy = function(file){
		var input = $('[id="file_text_copy_'+file.id+'"]').get(0);
		input.select();

		document.execCommand('copy');
	}

});
