var ServicesModule = angular.module('starter.services', [])

ServicesModule.factory('FileService', function($q, OCRService, $ionicPopup, $filter) {
  // Might use a resource here that returns a JSON array

  var fileStorage = new Array();
  var sup = this;
  var workerProcessQueue = new Array();
  var workerWaitQueue = new Array();
  this.loadedNr;
  this.fileTotal;

  function readFromFileTrasnform(file){
  	var defer = $q.defer();

    if(!file){
      defer.reject();
      return defer.promise;
    }

    //Se tiverem mais de 5 ficheiros a ser processados colocamos novos ficheiros em lista
    if(workerProcessQueue.length > 5){

      file.defer = defer;
      workerWaitQueue.push(file);

      return defer.promise;
    }

    var worker = new Worker("worker/jimp.js");
    worker.onmessage = function (e) {
        file.data = e.data;
        file.id = Math.random()*10000;

        fileStorage.unshift(file);

        if(file.defer){
          file.defer.resolve(file);
        }else{
          defer.resolve(file);
        }

        //remove este ficheiro da lista de processamento
        var index = workerProcessQueue.indexOf(file);
            workerProcessQueue.splice(index, 1);

          //dá inicio ao processo de um ficheiro em espera
          readFromFileTrasnform(workerWaitQueue[workerWaitQueue.length - 1]);

          //remove da waitqueue este ficheiros
          workerWaitQueue.pop();
        
        console.log(workerProcessQueue.length, workerWaitQueue.length);
        worker.terminate();
    };

    workerProcessQueue.push(file);
    worker.postMessage(file.path);

  	return defer.promise;
  }

  function readFromFileAPI(_file){
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

	reader.readAsDataURL(_file);

	return defer.promise;
  }

  this.addFile = function(file){
  	var defer = $q.defer();

  	if(file.size > 1000000){
        console.log('file is bigger than 1MB', file.size);

        readFromFileTrasnform(file).then(function(file){
      		defer.resolve(file);
      	});
    }else{
    	readFromFileAPI(file).then(function(file){
    		defer.resolve(file);
    	});
    }

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