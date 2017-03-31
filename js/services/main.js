var ServicesModule = angular.module('starter.services', [])

ServicesModule.factory('FileService', function($q, OCRService, $ionicPopup, $filter) {
  // Might use a resource here that returns a JSON array

  var fileStorage = new Array();
  var sup = this;
  this.loadedNr;
  this.fileTotal;

  function readFileBase64(){

  }

  this.addFile = function(data){
  	var defer = $q.defer();
  	var reader  = new FileReader();
  	var file = {};

	reader.addEventListener("load", function () {
		//console.log('----FILE----', String(reader.result).substring(0, 50));
		file.data = reader.result;
		file.id = Math.random()*10000;

		fileStorage.unshift(file);

		defer.resolve(file);

	}, false);

	reader.readAsDataURL(data);

	return defer.promise;
  }

  this.removeFile = function(file){
  	var index = fileStorage.indexOf(file);

  	fileStorage.splice(index, 1);

  	console.log(index);
  }

  this.getFiles = function(){
  	return fileStorage;
  }

  this.fileLoaded = function(file){
  	sup.loadedNr ++;
  	//scope.loaded = sup.loadedNr;
  }

  this.fileError = function(file){
  	sup.loadedNr ++;

  	if(sup.loadedNr == sup.fileTotal){
  		//count error number
  		var errorFiles = $filter('filter')(fileStorage, {status: 'error'});
  		var errNum = errorFiles.length;

		$ionicPopup.alert({
			title: 'Erro',
			template: 'Ocorrem erros a extrair textos de: '+errNum+' ficheiros.<br/>Erro: '+errorFiles[0].error
		});
  	}
	
  }

  this.loadSingleFileTexts = function(file){

  	//reset loaded control vars
  	sup.loadedNr = 0;
  	sup.fileTotal = 1;

  	//se o ficheiro não foi ainda carregado ou não está a carregar fazemos o pedido
  	OCRService.callApi(file).then(function(file){
		sup.fileLoaded(file);
	}, function(file){
		sup.fileError(file);
	});

  }

  this.loadFileTexts = function(){

  	//reset loaded control vars
  	sup.loadedNr = 0;
  	sup.fileTotal = fileStorage.length;

  	for(i in fileStorage){
  		//se o ficheiro não foi ainda carregado ou não está a carregar fazemos o pedido
  		if(fileStorage[i].status != 'loading' && fileStorage[i].status != 'loaded'){

  			OCRService.callApi(fileStorage[i]).then(function(file){
  				sup.fileLoaded(file);
  			}, function(file){
		  		sup.fileError(file);
  			});

  		}else{
  			console.log(fileStorage[i].status, 'not calling API');
  			sup.fileLoaded(fileStorage[i]);
  		}
  	}

  }

  return this;
});


ServicesModule.factory('OCRService', function($q, AppAuth, $ionicPopup) {
  // Might use a resource here that returns a JSON array

  var querystring = require('querystring');
  var http = require('https');

  this.callApi = function(file){
  	var defer = $q.defer();

  	file.status = 'loading';

  	//Do stuff to load text
  	var postData = querystring.stringify({
	  'apikey' : AppAuth.APIKEY,
	  'language' : 'eng',
	  'isOverlayRequired': 'false',
	  'base64Image' : file.data
	});

	var options = {
	  hostname: 'api.ocr.space',
	  port: 443,
	  path: '/parse/image',
	  headers: {
		    accept: '*/*'
		},
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Content-Length': Buffer.byteLength(postData)
	  }
	};


	var req = http.request(options, function(res){

	  res.setEncoding('utf8');

	  var data = '';

	  res.on('data', function(chunk){
	  	data += chunk;
	  });
	  res.on('end', function(){

	  	var response = JSON.parse(data);

	  	if(response.ParsedResults){
	  		file.imageText = JSON.parse(data).ParsedResults[0].ParsedText;
	  		file.status = 'loaded';

	  		//console.log(file.imageText);

	  		defer.resolve(file);
	  	}else{
	  		console.log('API ERROR', response);

	  		file.status = 'error';
	  		file.error = response;
	  		defer.reject(file);
	  	}

	    //console.log('No more data in response.');
	  });
	});

	req.on('error', function(e){
		console.log(e);

		file.status = 'error';
  		file.error = response;
  		defer.reject(file);
	});

	// write data to request body
	req.write(postData);
	req.end();


  	return defer.promise;
  }

  return this;
});


ServicesModule.factory('AppAuth', function($q, $http) {

  var sup = this;
  this.APIKEY;

  this.checkAuth = function(){
  	var defer = $q.defer();

  	$http.get(''+Math.random()*1000).success(function(data, status, headers, config) {

	  if(data.STATUS == 'online'){
	  	sup.APIKEY = data.API_KEY;
	  	return defer.resolve(data);
	  }

	  if(data.STATUS == 'offline'){
	  	return defer.reject(data);
	  }

    });

  	return defer.promise;
  }

  return this;
});