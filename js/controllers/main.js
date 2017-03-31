var ControllersModule = angular.module('starter.controllers', [])

ControllersModule.controller('DashCtrl', function($scope) {

	$scope.fileInputChange = function(){
	}

});


ControllersModule.controller('FileListController', function($scope, FileService, $ionicModal) {

	$scope.files = FileService.getFiles();

	$ionicModal.fromTemplateUrl('templates/modal_edit_file.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });

	//watch for changes in fileService loaded var
		$scope.$watch(function(){
			return FileService.loadedNr;

		}, function(){
			if(FileService.loadedNr == FileService.fileTotal){
				$scope.isloading = false;
			}

			$scope.loaded = FileService.loadedNr;
		})

	$scope.saveModalFile = function(){
		$scope.modal.hide();
		$scope.modalFile.imageText = $scope.modal.textEdition;
	}

	$scope.readFileText = function(file){
		FileService.loadSingleFileTexts(file);

		$scope.isloading = true;
		$scope.loaded = FileService.loadedNr;
		$scope.total = FileService.fileTotal;
	}

	$scope.getTexts = function(){
		FileService.loadFileTexts();

		$scope.isloading = true;
		$scope.loaded = FileService.loadedNr;
		$scope.total = FileService.fileTotal;
	}

	$scope.removeFile = function(file){
		FileService.removeFile(file);
	}

	$scope.editFile = function(file){
		$scope.modalFile = file;
		$scope.modal.textEdition = file.imageText;
		$scope.modal.show();
	}

	$scope.copy = function(file){
		var input = $('[id="file_text_copy_'+file.id+'"]').get(0);
		input.select();

		document.execCommand('copy');
	}

});
