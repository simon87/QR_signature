var findQrBool = false;
function findQr(){
	findQrBool = true;
}
function checkPinPass(){
	if(document.getElementById('pin').value.length == 4){
		document.getElementById('send_pin_btn').disabled = false;
	} else {
		document.getElementById('send_pin_btn').disabled = true;
	}
}
var docMode = false;
var finalDocImageBase64;
var cryptKey;
var unique_identifier;
//var signatureUrl = 'http://dev-api.acrossopeneyes.com/signatures';
//var signatureUrl = 'http://127.0.0.1/qr_signature_heroku/peaceful-lowlands-44823/web/ajax.php';
function sendDocSignature() {
	//Encrypt
	finalDocImageBase64 = finalDocImageBase64.replace('data:image/png;base64,','');
	var str = unescape(encodeURIComponent(finalDocImageBase64));
	var enc_str = mcrypt.Encrypt(str, '', CryptoJS.MD5(cryptKey+unique_identifier+document.getElementById('pin').value).toString(), 'rijndael-256', 'ecb');
	enc_str = btoa(enc_str);
	//Encrypt - new
	/*
	1. generate the base 64 of the original image
	2. generate md5 of base 64
	3. append  md5 to the base64
	4. encrypt
	5. base64 of encrypted data
	*/
	md5OfBase64 =  CryptoJS.MD5(str);
	appendMd5ToBase64 = str+md5OfBase64;
	encryptAppendedMd5ToBase64 = mcrypt.Encrypt(appendMd5ToBase64);
	enc_str = btoa(encryptAppendedMd5ToBase64);
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			document.getElementById('status').style.color = '#5cb85c';
			document.getElementById('status').innerHTML = 'Signature sended.';
		} else {
			document.getElementById('status').style.color = 'red';
			document.getElementById('status').innerHTML = 'An error occurred while sending the signature.';
		}
	};
	xhr.open('POST', signatureUrl, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	var sendObj = JSON.stringify({"unique_identifier":unique_identifier,"image":enc_str});
	xhr.send(sendObj);
	document.getElementById('pin_container').style.display = 'none';
}
function qrSignature(){
	checkUserMedia();
	/*Global variables*/
	var canvas = document.getElementById('qr-canvas');
	/*var canvWidth = width;
	var canvHeight = height;*/
	var context = canvas.getContext('2d');
	var operationCanvas = document.getElementById('operation-canvas');
	var operationContext = operationCanvas.getContext('2d');
	var originalCanvas = document.getElementById('original-canvas'); //For test only
	var originalContext = originalCanvas.getContext('2d'); //For test only
	var localStream;
	var cameraMode = false;
	var operationContextData;
	var rotationDegree;
	var rotationDir;
	var imgIsReady = false;
	var qrCodeIsReady = false;
	var canvasRatio;

	var QRRatio;
	cryptKey = '';
	
	var docSign = false;
	var docQrReaded = false;

	var photoTaked = false;
	/*Browser detection*/
	function isMobileBrowser() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
	/*Correct width and height*/
	if(window.innerWidth > window.innerHeight) {
		strait = window.innerHeight;
		longer = window.innerWidth;
	} else {
		strait = window.innerWidth;
		longer = window.innerHeight;
	}
	if(Math.abs(window.orientation) !== 90){
		if(isMobileBrowser()) {
			//document.getElementById('turn_phone').style.display = 'block';
			document.getElementById('take_pic_of_qr').style.display = 'block';
			//document.getElementById('turn_phone').style.marginTop = '100px';
			/*document.getElementById('turn_image').width = strait-50;
			document.getElementById('turn_image').height = (strait-50)*0.79;*/
		}
		//document.getElementById('turn_image').removeAttribute('height');
		//alert(document.getElementById('turn_image').height);

	} else {
		document.getElementById('take_picture_container').style.display = 'block';
		document.getElementById('turn_phone').style.display = 'none';
		
		input_btn = document.getElementById("input");
		input_btn.style.height = longer/8+"px";
		input_btn.style.width = longer/8+"px";
		input_btn.style.backgroundSize = "\""+(longer/8)+"px\"";
		
		btn_container = document.getElementById("file_button");
		/*btn_container.style.display = "block";
		btn_container.style.top = ((strait)/2-(longer/8/2))+"px";
		btn_container.style.right = "10px";
		btn_container.style.backgroundSize = (longer/8)+"px";
		btn_container.style.width = longer/8+"px";
		btn_container.style.height = longer/8+"px";*/
		takePicContainer = document.getElementById('take_picture_container');
		takePicContainer.style.width = strait+'px';

		takePicImg = document.getElementById('take_picture');
		takePicImg.height = strait;
		document.getElementById('take_picture_container').style.display = 'block';
	}
		
	// Listen for orientation changes
	window.addEventListener("orientationchange", function() {
		setTimeout(function(){
			
			/*Correct width and height*/
		//var ratio = window.devicePixelRatio || 1;
		var screenWidth = window.screen.width;
		var screenHeight = window.screen.height;
		//alert(screenWidth+'*'+screenHeight);
		if(screenWidth > screenHeight) {
			strait = screenHeight;
			longer = screenWidth;//FF640*287 360*567 chrome:640*279 360*559 (outer - inner) 
		} else {
			strait = screenWidth;
			longer = screenHeight;
		}
		strait = screenWidth;
		longer = screenHeight;
		if(Math.abs(window.orientation) !== 90){
			//document.getElementById('take_doc_picture').height = (window.innerHeight-50)+"px";
			if(!photoTaked) {
				//document.getElementById('turn_phone').style.display = 'block';
				//document.getElementById('turn_phone').style.marginTop = '100px';
				/*document.getElementById('turn_image').height = strait-50;
				document.getElementById('turn_image').width = (strait-50)*1.261;*/
				//document.getElementById('turn_image').removeAttribute('width');
				//alert(document.getElementById('turn_image').width);
				document.getElementById('take_picture_container').style.display = 'none';
				//document.getElementById("file_button").style.display = 'none';
			} else {
				document.getElementById('turn_phone').style.display = 'block';
				//loaderContainer = document.getElementById("sk-folding-cube-container");
				/*loaderContainer.style.width = (window.innerHeight-window.innerHeight/2)+"px";
				loaderContainer.style.height = (window.innerHeight-window.innerHeight/2)+"px";
				loaderContainer.style.top = (window.innerHeight-(window.innerHeight-window.innerHeight/2))/2+"px";
				loaderContainer.style.left = (window.innerWidth-(window.innerHeight-window.innerHeight/2))/2+"px";*/
			}
		} else {
			//document.getElementById('take_doc_picture').height = (window.innerWidth-50)+"px";
			if(!photoTaked) {
				return false;
				document.getElementById('take_picture_container').style.display = 'block';
				document.getElementById('turn_phone').style.display = 'none';
				
				input_btn = document.getElementById("input");
				input_btn.style.height = strait/8+"px";
				input_btn.style.width = strait/8+"px";
				input_btn.style.backgroundSize = "\""+(strait/8)+"px\"";
				
				btn_container = document.getElementById("file_button");
				btn_container.style.display = "block";
				/*btn_container.style.top = (100)+"px";
				btn_container.style.right = "10px";
				btn_container.style.backgroundSize = (strait/8)+"px";
				btn_container.style.width = strait/8+"px";
				btn_container.style.height = strait/8+"px";*/
				takePicContainer = document.getElementById('take_picture_container');
				takePicContainer.style.width = longer+'px';

				takePicImg = document.getElementById('take_picture');
				takePicImg.width = strait;
				document.getElementById('take_picture_container').style.display = 'block';
				
			} else {
				takeDocSignPicture();
				/*loaderContainer = document.getElementById("sk-folding-cube-container");
				loaderContainer.style.width = (window.innerHeight-window.innerHeight/2)+"px";
				loaderContainer.style.height = (window.innerWidth-window.innerWidth/2)+"px";
				loaderContainer.style.top = (window.innerWidth-(window.innerWidth-window.innerWidth/2))/2+"px";
				loaderContainer.style.left = (window.innerHeight-(window.innerHeight-window.innerHeight/2))/2+"px";*/
			}
		}
		},500);
		
	}, false);
	/**
	 * @FIXME create a new class for the image manipulation functions
	 */
	function contrastImage(contextData, contrast) {
		var start = new Date().getTime();
		var imageData = contextData.getImageData(0, 0, canvWidth, canvHeight);
		var data = imageData.data;
		var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
		for(var i=0;i<data.length;i+=4)
		{
			data[i] = factor * (data[i] - 128) + 128;
			data[i+1] = factor * (data[i+1] - 128) + 128;
			data[i+2] = factor * (data[i+2] - 128) + 128;
			/*if(data[i] < 167) {
				data[i] = 0;
				data[i+1] = 0;
				data[i+2] = 0;
			} else {
				data[i] = 255;
				data[i+1] = 255;
				data[i+2] = 255;
			}*/
		}
		contextData.putImageData(imageData, 0, 0);
		var end = new Date().getTime();
		var time = end - start;
		console.log('Contrast time: '+time);
	}
	function brutalBW(contextData) {
		var imageData = contextData.getImageData(0, 0, canvWidth, canvHeight);
		var data = imageData.data;
		for(var i=0;i<data.length;i+=4)
		{
			if(data[i] < 180) {
				data[i] = 0;
				data[i+1] = 0;
				data[i+2] = 0;
			} else {
				data[i] = 255;
				data[i+1] = 255;
				data[i+2] = 255;
			}
		}
		contextData.putImageData(imageData, 0, 0);
	}
	function imageColorCorrection(contextData){
		var start = new Date().getTime();
		var imageData = contextData.getImageData(0, 0, canvWidth, canvHeight);
        var data = imageData.data;

        for(var i = 0; i < data.length; i += 4) {
          var brightness = 0.50 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          data[i] = brightness;
          data[i + 1] = brightness;
          data[i + 2] = brightness;
        }
        contextData.putImageData(imageData, 0, 0);
		var end = new Date().getTime();
		var time = end - start;
		console.log('Color correction time: '+time);
	}
	/*Returned with the distance between two coordinates*/
	function lineDistance( point1, point2){
		var xs = 0;
		var ys = 0;
		xs = point2.x - point1.x;
		xs = xs * xs;
		ys = point2.y - point1.y;
		ys = ys * ys;
		return Math.sqrt( xs + ys );
	}
	/*The imageData is a big 1D array, with the pixels RGBA datas*/
	function getImageDataByCords(imageData,x,y){
		var x = Math.ceil(x);
		var y = Math.ceil(y);
		var color = {};
		var index = (x + y * canvWidth) * 4;

		color.r = imageData[index];
		color.g = imageData[index+1];
		color.b = imageData[index+2];
		return color;
	}
	function removeColor(){
		color = [150,150,150];
		var canvasData = finalContext.getImageData(0, 0, canvWidth, canvHeight),
        pix = canvasData.data;
		for (var i = 0; i<pix.length; i+=4) {
			if(pix[i] > color[0] && pix[i+1] > color[1] && pix[i+2] > color[2]){
				pix[i+3] = 0;   
			} else {
				pix[i] = 0;
			}
		}
		finalContext.putImageData(canvasData, 0, 0);
	}
	function pixelTolarence(leftX,leftY,direction){
		imageData = operationContextData;
		if(direction == 'left') {
			leftX = leftX-1;
			for(var i=1;i>0;i--) {
				if(getImageDataByCords(imageData,leftX-i,leftY).r < 100) {
					return true;
				}
			}
			return false;
		} else if(direction == 'bottom') {
			leftY = leftY+1;
			for(var i=1;i<2;i++) {
				if(getImageDataByCords(imageData,leftX,leftY+i).r < 100) {
					return true;
				}
			}
			return false;
		} else if(direction == 'topBlack') {
			leftY = leftY-1;
			for(var i=1;i<2;i++) {
				if(getImageDataByCords(imageData,leftX,leftY-i).r < 100) {
					return true;
				}
			}
			return false;
		} else if(direction == 'topWhite') {
			leftY = leftY-1;
			for(var i=1;i<2;i++) {
				if(getImageDataByCords(imageData,leftX,leftY-i).r > 100) {
					return true;
				}
			}
			return false;
		}
	}
	/*Doctor Signature*/
	function sendDocSignature(imgData) {
		//Encrypt
		imgData = imgData.replace('data:image/png;base64,','');
		str = unescape(encodeURIComponent(imgData));
		enc_str = mcrypt.Encrypt(str, '', CryptoJS.MD5(cryptKey+unique_identifier+document.getElementById('pin').value).toString(), 'rijndael-256', 'ecb');
		enc_str = btoa(enc_str);
		//Encrypt - new
		/*
		1. generate the base 64 of the original image
		2. generate md5 of base 64
		3. append  md5 to the base64
		4. encrypt
		5. base64 of encrypted data
		*/
		md5OfBase64 =  CryptoJS.MD5(str);
		appendMd5ToBase64 = str+md5OfBase64;
		encryptAppendedMd5ToBase64 = mcrypt.Encrypt(appendMd5ToBase64, '', CryptoJS.MD5(cryptKey+unique_identifier+document.getElementById('pin').value).toString(), 'rijndael-256', 'ecb');
		enc_str = btoa(encryptAppendedMd5ToBase64);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				document.getElementById('status').style.color = '#5cb85c';
				document.getElementById('status').innerHTML = 'Signature sended.';
			} else {
				document.getElementById('status').style.color = 'red';
				document.getElementById('status').innerHTML = 'An error occurred while sending the signature.';
			}
		};
		xhr.open('POST', signatureUrl, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		var sendObj = JSON.stringify({"unique_identifier":unique_identifier,"image":enc_str});
		xhr.send(sendObj);
		document.getElementById('pin_container').style.display = 'none';
	}
	function createDocFinalImage(minX,minY,maxX,maxY){
		/*var sourceX = leftSide.x*5;
        var sourceY = leftSide.y*5;
        var sourceWidth = origiLeftX*5-leftSide.x*5;
        var sourceHeight = leftDownY*5-leftSide.y*5;
        var destWidth = origiLeftX*5-leftSide.x*5;
        var destHeight = leftDownY*5-leftSide.y*5;
        var destX = leftSide.x*5;
        var destY = leftSide.y*5;*/
		
		var sourceX = minX;
        var sourceY = minY;
        var sourceWidth = maxX-minX;
        var sourceHeight = maxY-minY;
		var destX = 0;
        var destY = 0;
        var destWidth = sourceWidth;
        var destHeight = sourceHeight;

        var finalCanvas = document.createElement('canvas');
		var finalRatio = 300/(sourceWidth);
        finalCanvas.id = "final-canvas";
        finalCanvas.width = sourceWidth*finalRatio;
        finalCanvas.height = sourceHeight*finalRatio;
        finalCanvas.style.position = "absolute";
        finalCanvas.style.border = "4px solid #5c87b8";
        finalContext = finalCanvas.getContext('2d');
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(finalCanvas);
		//alert(finalCanvas.width+', '+finalCanvas.height);
        finalContext.drawImage(originalCanvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth*finalRatio, sourceHeight*finalRatio);
       // contrastImage(finalContext,20);
		//imageColorCorrection(finalContext);
		finalDocImageBase64 = finalCanvas.toDataURL("image/png");
		return finalDocImageBase64;
	}
	function takeDocSignPicture() {
		document.getElementById("input").style.display = "block";
		document.getElementById("file_button").style.display = 'block';
		document.getElementById('doc_take_picture_container').style.display = 'block';
		document.getElementById('take_doc_picture').height = window.innerHeight;
		document.getElementById("original-canvas").style.display = 'none';
	}
	function readDocSignature(){
		document.getElementById("sk-folding-cube-container").style.display = 'none';
		imageColorCorrection(originalContext);
		contrastImage(originalContext,100);
		canvasData = originalContext.getImageData(0, 0, canvWidth, canvHeight);
        pix = canvasData.data;
		var minX = canvWidth;
		var minY = canvHeight;
		var maxX = 0;
		var maxY = 0;
		for (var i = 0; i<pix.length; i+=4) {
			if(pix[i] < 10){
				pointX = (i / 4)%canvWidth;
				pointY = Math.floor((i / 4)/canvWidth);
				if(pointX<minX) {
					minX = pointX;
				}
				if(pointY<minY) {
					minY = pointY;
				}
				if(pointX>maxX) {
					maxX = pointX;
				}
				if(pointY>maxY) {
					maxY = pointY;
				}
			}
		}
		minX = minX-5;
		minY = minY-5;
		maxX = maxX+5;
		maxY = maxY+5;
		createDocFinalImage(minX,minY,maxX,maxY);
		document.getElementById('pin_container').style.display = 'block';
		if(window.innerWidth < window.innerHeight) {
		document.getElementById('pin').style.width=(window.innerWidth-50)+'px';
		//document.getElementById('pin').style.height=(200)+'px';
		//document.getElementById('pin').style.fontSize = (100)+'px';
		document.getElementById('enter_your_pin').style.fontSize = (window.innerWidth-300)+'px';
		document.getElementById('send_pin_btn').style.fontSize = (window.innerWidth-300)+'px';
		} else {
			document.getElementById('pin').style.width=(window.innerHeight-50)+'px';
			//document.getElementById('pin').style.width=(200)+'px';
			//document.getElementById('pin').style.fontSize = (100)+'px';
			document.getElementById('enter_your_pin').style.fontSize = (window.innerHeight-300)+'px';
			document.getElementById('send_pin_btn').style.fontSize = (window.innerHeight-300)+'px';
		}
		originalContext.strokeStyle = 'red';
		originalContext.beginPath();
		originalContext.moveTo(minX,minY);
		originalContext.lineTo(minX,maxY);
		originalContext.lineTo(maxX,maxY);
		originalContext.lineTo(maxX,minY);
		originalContext.lineTo(minX,minY);
		originalContext.strokeStyle="red";
		originalContext.stroke();
	}
	function getQRContent(){
		//document.getElementById('qr-content').innerHTML = qrcode.result;
		content = qrcode.result;
		contentArr = content.split('@key:');
		unique_identifier = contentArr[0].replace('@code:','');
		cryptKey = contentArr[1];
		if(content.indexOf("@U:") != -1) {
			docSign = true;
			reg = /@code:(.*)@/i;
			matches = content.match(reg);
			unique_identifier = matches[1];

			reg = /@key:(.*)/i;
			matches = content.match(reg);
			cryptKey = matches[1];
		} else {
			reg = /@code:(.*)@/i;
			matches = content.match(reg);
			unique_identifier = matches[1];

			reg = /@key:(.*)/i;
			matches = content.match(reg);
			cryptKey = matches[1];
		}
		//alert(content);
		/*url = content.split(";")[0];
		key = content.split(";")[1];*/
		//document.getElementById('qr-content').innerHTML = '<b>URL:</b>'+url+'<br /><b>Key:</b>'+key;
	}
	function createFinalImage(leftSide){
		var start = new Date().getTime();
		//alert('final');
		/*var sourceX = leftSide.x*5;
        var sourceY = leftSide.y*5;
        var sourceWidth = origiLeftX*5-leftSide.x*5;
        var sourceHeight = leftDownY*5-leftSide.y*5;
        var destWidth = origiLeftX*5-leftSide.x*5;
        var destHeight = leftDownY*5-leftSide.y*5;
        var destX = leftSide.x*5;
        var destY = leftSide.y*5;*/
		
		/*var sourceX = leftSide.x;
        var sourceY = leftSide.y;
        var sourceWidth = origiLeftX-leftSide.x;
        var sourceHeight = leftDownY-leftSide.y;
        var destWidth = origiLeftX-leftSide.x;
        var destHeight = leftDownY-leftSide.y;
        var destX = leftSide.x;
        var destY = leftSide.y;*/
		
		var sourceX = leftSide.x;
        var sourceY = leftSide.y;
        var sourceWidth = origiLeftX-leftSide.x;
        var sourceHeight = leftDownY-leftSide.y;
        var destWidth = origiLeftX-leftSide.x;
        var destHeight = leftDownY-leftSide.y;
        var destX = leftSide.x;
        var destY = leftSide.y;

        var finalCanvas = document.createElement('canvas');
		//var finalRatio = 300/(sourceWidth);
		var finalRatio = 300/(sourceWidth);
		var saveRatio = ((sourceWidth)*canvasRatio)/1280;
        finalCanvas.id = "final-canvas";
        finalCanvas.width = (sourceWidth)*finalRatio;
        finalCanvas.height = (sourceHeight)*finalRatio;

        finalCanvas.style.position = "absolute";
		finalCanvas.style.top = ((window.innerHeight-finalCanvas.height)/2)+"px";
		finalCanvas.style.left = ((window.innerWidth-finalCanvas.width)/2)+"px";
        finalContext = finalCanvas.getContext('2d');
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(finalCanvas);
		
       // finalContext.drawImage(originalCanvas, sourceX/canvasRatio, sourceY/canvasRatio, (sourceWidth)/canvasRatio, (sourceHeight)/canvasRatio, 0, 0, (sourceWidth)/saveRatio, (sourceHeight)/saveRatio);
	   
        finalContext.drawImage(originalCanvas, sourceX*canvasRatio, sourceY*canvasRatio, (sourceWidth)*canvasRatio, (sourceHeight)*canvasRatio, 0, 0, (sourceWidth)*finalRatio, (sourceHeight)*finalRatio);
        //contrastImage(finalContext,80);
		//imageColorCorrection(finalContext);
		finalCanvas.style.display = 'block';
		finalImageBase64 = finalCanvas.toDataURL("image/png");
		var end = new Date().getTime();
		var time = end - start;
		console.log('Final time: '+time);
		return finalImageBase64;
	}
	function getTheLeftBorder(leftX,leftY) {
		 //4.813 - left 3.306 - bottom
		
		var start = new Date().getTime();

		returnObj = {};
		returnObj.x = leftX-(QRRatio*4.7);
		returnObj.y = leftY;
		
		return returnObj;
		pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
		newColor = pixColor;
		while(newColor < 100 && leftX > 1) {
			leftX = leftX-6; //Teszt, 1-ről
			//Redefine the newColor
			newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			//When the image is distorted check the upper-lower pixels color
			checkBottomColor = operationContext.getImageData(leftX, leftY+1, 1, 1).data[0];
			checkTopColor = operationContext.getImageData(leftX, leftY-1, 1, 1).data[0];
			newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			//The color of the lower-upper pixels
			if(checkBottomColor < 100 && checkBottomColor < newColor){
				leftY = leftY+1;
				newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			} else if (checkTopColor < 100 && checkTopColor < newColor) {
				leftY = leftY-1;
				newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			}
			if(pixelTolarence(leftX,leftY,'left')) {
				newColor = 99;
			}
		}

		leftX += 1;
		returnObj.x = leftX;
		returnObj.y = leftY;
		returnObj.newColor = newColor;
		var end = new Date().getTime();
		var time = end - start;
		console.log('Left time: '+time);
		return returnObj;
		//operationContext.fillRect(leftX,leftY,10,10);
	}
	function getTheTopBorder(leftTopX,leftTopY,maxDifference){
		//alert('top');
		var start = new Date().getTime();
		for(var k=0;k<4;k++){
			pixColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
			newColor = pixColor;
			/*Find white*/
			if(k%2 == 0) {
				while(newColor < 100 && leftTopY > 1) {
					leftTopY = leftTopY-1;
					/*Check the right and left pixels color (if the top black line is damaged, or not well-photographed it's help)*/
					leftPixelColor = operationContext.getImageData(leftTopX-1, leftTopY, 1, 1).data[0];
					rightPixelColor = operationContext.getImageData(leftTopX+1, leftTopY, 1, 1).data[0];
					if(Math.abs(pixColor - leftPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = leftPixelColor;
					} else if(Math.abs(pixColor - rightPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = rightPixelColor;
					} else {
						newColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
					}
					if(pixelTolarence(leftTopX,leftTopY,'topBlack')) {
						newColor = 9;
					}
				}
			} else {
				while(newColor > 100 && leftTopY > 1) {
					leftTopY = leftTopY-1;
					/*Check the right and left pixels color (if the top black line is damaged, or not well-photographed it's help)*/
					leftPixelColor = operationContext.getImageData(leftTopX-1, leftTopY, 1, 1).data[0];
					rightPixelColor = operationContext.getImageData(leftTopX+1, leftTopY, 1, 1).data[0];
					if(Math.abs(pixColor - leftPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = leftPixelColor;
					} else if(Math.abs(pixColor - rightPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = rightPixelColor;
					} else {
						newColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
					}
					if(pixelTolarence(leftTopX,leftTopY,'topWhite')) {
						newColor = 200;
					}
				}
			}
		}
		operationContext.fillStyle = 'yellow';
		operationContext.fillRect(leftTopX,leftTopY,10,10);
		returnObj = {}
		returnObj.x = leftTopX;
		returnObj.y = leftTopY+10;
		returnObj.newColor = newColor;
		var end = new Date().getTime();
		var time = end - start;
		console.log('Top time: '+time);
		return returnObj;
	}
	function getTheRightBorder(leftTopX,leftTopY,maxDifference){
		var start = new Date().getTime();
		for(i=0;i<3;i++){
			pixColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
			newColor = pixColor;
			if(i%2 == 0){
				while(newColor < 50 && leftTopX > 1) {
					leftTopX = leftTopX-1;
					newColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
				}
			} else {
				while(newColor > 50 && leftTopX > 1) {
					leftTopX = leftTopX-1;
					newColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
				}
			}
		}
		returnObj = {};
		returnObj.x = leftTopX;
		returnObj.y = leftTopY;
		returnObj.newColor = newColor;

		var end = new Date().getTime();
		var time = end - start;
		console.log('Right time: '+time);
		return returnObj;
	}
	function getTheBottomBorder(leftSideX,leftDownY,newBottomColor){
		// 4.813 - left 3.306 - bottom
		//alert('bottom');
		returnObj = {};
		/*pixColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
		newBottomColor = pixColor;
		while(newBottomColor < 150 && leftDownY < operationCanvas.height) {
			leftDownY+=1;
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			checkRightColor = operationContext.getImageData(leftSideX+1, leftDownY, 1, 1).data[0];
			checkLeftColor = operationContext.getImageData(leftSideX-1, leftDownY, 1, 1).data[0];
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			if(checkRightColor < newBottomColor && checkRightColor < 150 && leftDownY<operationCanvas.height){
				leftSideX = leftSideX+1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			} else if (checkLeftColor < newBottomColor && checkLeftColor < 150 && leftDownY<operationCanvas.height) {
				leftSideX = leftSideX-1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			}
			if(pixelTolarence(leftSideX,leftDownY,'bottom')) {
				newBottomColor = 99;
			}
		}*/
		leftDownY = QRRatio*3.306;
		leftDownY -= 2;
		returnObj.x = leftSideX;
		returnObj.y = leftDownY;
		operationContext.fillRect(returnObj.x,returnObj.y,10,10);
		return returnObj;
	}
	function sendSignature(imgData) {
		//Encrypt
		imgData = imgData.replace('data:image/png;base64,','');
		str = unescape(encodeURIComponent(imgData));
		enc_str = mcrypt.Encrypt(str, '', CryptoJS.MD5(cryptKey+unique_identifier).toString(), 'rijndael-256', 'ecb');
		enc_str = btoa(enc_str);
		//Encrypt - new
		/*
		1. generate the base 64 of the original image
		2. generate md5 of base 64
		3. append  md5 to the base64
		4. encrypt
		5. base64 of encrypted data
		*/
		md5OfBase64 =  CryptoJS.MD5(str);
		appendMd5ToBase64 = str+md5OfBase64;
		encryptAppendedMd5ToBase64 = mcrypt.Encrypt(appendMd5ToBase64, '', CryptoJS.MD5(cryptKey+unique_identifier).toString(), 'rijndael-256', 'ecb');
		enc_str = btoa(encryptAppendedMd5ToBase64);
		var xhr = new XMLHttpRequest();
		xhr.open('POST', signatureUrl, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		var sendObj = JSON.stringify({"unique_identifier":unique_identifier,"image":enc_str});
		xhr.send(sendObj);
	}
	function cutSignature(leftX,leftY){
		var start = new Date().getTime();
		contrastImage(operationContext,100);
		//brutalBW(operationContext);
		operationContextData = operationContext.getImageData(0,0,operationCanvas.width,operationCanvas.height).data;
		imageColorCorrection(operationContext);
		maxDifference = 120;
		topBorder = getTheTopBorder(leftX,leftY,maxDifference);

		origiLeftY = leftY;
		leftX = topBorder.x;
		leftY = topBorder.y;
		qrTopY = topBorder.y;
		newColor = topBorder.newColor;

		rightBorder = getTheRightBorder(leftX,origiLeftY,maxDifference);
		leftX = rightBorder.x;
		leftY = leftY-1;
		origiLeftX = leftX;

		leftSide = getTheLeftBorder(leftX,leftY);
		leftX = leftSide.x;
		leftY = leftSide.y;
		
		/*topratio = origiLeftY-topBorder.y;
		leftSide = {};
		leftSide.x = leftX-(topratio*28);
		//alert(topratio*28);
		leftSide.y = leftY;
		leftX = leftSide.x;
		leftY = leftSide.y;*/
		
		//bottomPos = getTheBottomBorder(leftSide.x,leftSide.y,leftSide.newColor);
		//Test the new method
		bottomPos = {};
		bottomPos.y = leftSide.y+QRRatio*3.306;
		//bottomPos.y = leftSide.y+((rightBorder.x-leftSide.x)/4);
		bottomPos.x = leftSide.x;
		operationContext.fillRect(bottomPos.x,bottomPos.y,10,10);
		//return false;
		leftX = bottomPos.x;
		leftDownY = bottomPos.y;
		/*operationContext.fillStyle = 'yellow';
		operationContext.fillRect(bottomPos.x,bottomPos.y,10,10);
		return false;*/
		/*if(leftY+150 > leftDownY) {
			qrCodeIsReady = false;
			drawVideo();
			return false;
		}*/
		//operationContext.lineWidth = 1;

		/*Test draw*/
		operationContext.strokeStyle = 'red';
		operationContext.beginPath();
		operationContext.moveTo(origiLeftX,leftY);
		operationContext.lineTo(leftSide.x,leftY);
		operationContext.lineTo(leftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftY);
		operationContext.strokeStyle="red";
		operationContext.stroke();
		var end = new Date().getTime();
		var time = end - start;
		console.log('Full cut time: '+time);
		document.getElementById("sk-folding-cube-container").style.display = 'none';
		imageData = createFinalImage(leftSide);
		document.getElementById("qr-canvas").style.display = "none";
		//document.getElementById("rectangle").style.display = "none";
		document.getElementById("original-canvas").style.display = "none";
		//document.getElementById('status').innerHTML = 'Signature is ready!';
		sendSignature(imageData);
		return false;
		removeColor();
		imageColorCorrection(operationContext);
	}
	/*Rotate to horizontal by the two top markers*/
	function rotateToHorizontal(){
		var start = new Date().getTime();
		
		var pointA = {};
		var pointB = {};
		var lastPatternIndex = qrcode.patternPos.length-1;
		leftX = qrcode.patternPos[lastPatternIndex][1].x;
		leftY = qrcode.patternPos[lastPatternIndex][1].y;

		pointA.x = qrcode.patternPos[lastPatternIndex][2].x;
		pointA.y = qrcode.patternPos[lastPatternIndex][1].y;
		pointB.x = qrcode.patternPos[lastPatternIndex][2].x;
		pointB.y = qrcode.patternPos[lastPatternIndex][2].y;
		sideA = lineDistance(pointA,pointB);
		QRRatio = (qrcode.patternPos[lastPatternIndex][2].x-qrcode.patternPos[lastPatternIndex][1].x);
		pointA.x = qrcode.patternPos[lastPatternIndex][1].x;
		pointA.y = qrcode.patternPos[lastPatternIndex][1].y;
		pointB.x = qrcode.patternPos[lastPatternIndex][2].x;
		pointB.y = qrcode.patternPos[lastPatternIndex][1].y;
		sideB = lineDistance(pointA,pointB);
		/*Good old Pythagorean theorem*/
		sideC = Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));

		if(qrcode.patternPos[lastPatternIndex][2].y > qrcode.patternPos[lastPatternIndex][1].y) {
			//Left
			rotationDir = -1;
		} else {
			//Right
			rotationDir = 1;
		}
		/*Get the alpha angle*/
		rotationDegree = Math.asin(sideA/sideC) * 180/Math.PI;
		//alert(rotationDegree); //0.71
		/*Let's draw the rotated frame*/

		/*Rotate and save the original image for the final operations*/
		originalContext.save();
		originalContext.translate(canvas.width/2,canvas.height/2);
		originalContext.rotate(rotationDir*rotationDegree*Math.PI/180);
		originalContext.drawImage(originalCanvas,-canvas.width/2,-canvas.height/2);
		originalContext.restore();
		
		operationContext.clearRect(0, 0, canvWidth, canvHeight);
		operationContext.save();
		operationContext.translate(canvas.width/2,canvas.height/2);
		operationContext.rotate(rotationDir*rotationDegree*Math.PI/180);
		operationCanvas.width = canvas.width/canvasRatio;
		operationCanvas.height = canvas.height/canvasRatio;
		//operationContext.drawImage(canvas,0,0,-canvas.width/5,-canvas.height/5,0,0,-canvas.width/5,-canvas.height/5); //itt kell kicsinyíteni - próba
		//operationContext.drawImage(canvas,-canvas.width/2,-canvas.height/2); //itt kell kicsinyíteni - próba
		operationContext.drawImage(originalCanvas, 0, 0,canvas.width/canvasRatio,canvas.height/canvasRatio);
		//operationContext.restore();
		
		/*creating the "blue"*/
		
		context.fillStyle = 'blue';
		context.fillRect( qrcode.patternPos[lastPatternIndex][1].x, qrcode.patternPos[lastPatternIndex][1].y, 2, 2);
		//context.save();
		context.translate(canvas.width/2,canvas.height/2);
		context.rotate(rotationDir*rotationDegree*Math.PI/180);
		context.drawImage(canvas,-canvas.width/2,-canvas.height/2);
		//context.restore();
		
		/*QR code ROTATED left-top marker position*/
		pointA.x = canvWidth/2;
		pointA.y = canvHeight/2;
		pointB.x = qrcode.patternPos[0][1].x;
		pointB.y = canvHeight/2;
		sideA = lineDistance(pointA,pointB);
		
		pointA.x = pointB.x;
		pointA.y = pointB.y;
		pointB.y = leftY;
		sideB = lineDistance(pointA,pointB);
		
		sideC = Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2)); //circle radius
		
		newX = canvWidth/2  + Math.round(Math.cos(rotationDegree*Math.PI/180)) * sideC;
		if(rotationDir == 1) {
			newY = canvHeight/2 - Math.round(Math.sin(rotationDegree*Math.PI/180)) * sideC;
		} else {
			newY = canvHeight/2 + Math.round(Math.sin(rotationDegree*Math.PI/180)) * sideC;
		}
		/*Get the new position of the "blue"*/
		canvasData = context.getImageData(0, 0, canvWidth, canvHeight),
        pix = canvasData.data;
		for (var i = 0, n = pix.length; i <n; i += 4) {
			if(pix[i] < 20 && pix[i+1] < 20 && pix[i+2] > 150){
				newleftX = (i / 4) % canvWidth;
				newleftY = Math.floor((i / 4) / canvWidth);
				break;
			}
		}
		contrastImage(context,100);
		var end = new Date().getTime();
		var time = end - start;
		console.log('Rotate time: '+time);
		cutSignature(newleftX/canvasRatio,newleftY/canvasRatio);
	}
	function checkQr(){
		qrcode.callback = function(){
			if(!qrCodeIsReady) {
				getQRContent();
				qrCodeIsReady = true;
				if(!docSign) {
					document.getElementById('status').style.color = '#5cb85c';
					document.getElementById('status').innerHTML = 'Signature has been sent!';
					document.getElementById("rectangle").style.display = 'none';
					imageColorCorrection(context); //Test
					rotateToHorizontal();
				} else {
					//Doktor mód
					document.getElementById("sk-folding-cube-container").style.display = 'none';
					document.getElementById('status').style.color = '#5cb85c';
					
					//document.getElementById('status').innerHTML = 'Please take a picture of your signature.';
					document.getElementById('status').innerHTML = '';
					docQrReaded = true;
					docMode = true;
					takeDocSignPicture();
				}
			}			
		}
		try{
			imageColorCorrection(context);
			contrastImage(context,100);
			var start = new Date().getTime();
			qrcode.decode();
			var end = new Date().getTime();
			var time = end - start;
			console.log('QR read time: '+time);
		} catch(e){
			if(isMobileBrowser()) {
				document.getElementById('status').style.color = 'red';
				document.getElementById('status').innerHTML = 'QR code recognize failed, please try again. Error message:'+e;
				photoTaked = false;
				document.getElementById("file_button").style.display = 'block';
				document.getElementById("input").style.display = 'block';
				document.getElementById("take_picture_container").style.display = 'block';
				document.getElementById("sk-folding-cube-container").style.display = 'none';
				document.getElementById("browser_mode").style.display = 'none';
			} else {
				//Browser mode
				document.getElementById('status').style.color = 'red';
				document.getElementById('status').innerHTML = 'QR code recognize failed, please try again. Error message:'+e;
				photoTaked = false;
				document.getElementById("sk-folding-cube-container").style.display = 'none';
				document.getElementById("browser_mode").style.display = 'block';
			}
		}
	}
	function drawVideo(){
		if(!qrCodeIsReady){
			context.drawImage($this, 0, 0);
			originalContext.drawImage($this, 0, 0);
			if(findQrBool) {
				originalContext.drawImage($this, 0, 0);
				checkQr();
			}
			setTimeout(function(){ drawVideo(); }, 1000/25); //25 fps
		}
	}
	function checkUserMedia() {
		document.getElementById('take_picture_container').style.display = 'none';
		document.getElementById('turn_phone').style.display = 'none';
		//Browser detection
		//if(isMobileBrowser()) {
			noUserMedia();
			return false;
		//}
		cameraMode = true;
		navigator.getUserMedia = (navigator.getUserMedia || 
								 navigator.webkitGetUserMedia || 
								 navigator.mozGetUserMedia || 
								 navigator.msGetUserMedia);
		//navigator.getUserMedia = false;
		if (navigator.getUserMedia) {
			//Request access to video only
			navigator.getUserMedia(
			{
				video:true,
				audio:false
			},        
				function(stream) {
					var url = window.URL || window.webkitURL;
					video.src = url ? url.createObjectURL(stream) : stream;
					video.play();
					localStream = stream;
					document.getElementById('qr-canvas').style.display = 'block';
				},
				function(error) {
					console.log(error);
					alert('Something went wrong. (error code ' + error.code + ')');
				}
			);
		} else {
			//alert('Sorry, the browser you are using doesn\'t support getUserMedia');
			noUserMedia();
		}
		video.addEventListener('playing', function() {
				canvWidth = video.videoWidth;
				canvHeight = video.videoHeight;
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				originalCanvas.width = video.videoWidth;
				originalCanvas.height = video.videoHeight;
				operationCanvas.width = video.videoWidth;
				operationCanvas.height = video.videoHeight;
				if(canvWidth <= 1024) {
					canvasRatio = 1;
				} else {
					canvasRatio = canvWidth/1024;
				}
				originalContext.drawImage(video, 0, 0);
				$("#find_qr_btn").css("display","block");
				/*context.drawImage(video, 0, 0,img.width/5,img.height);
				operationContext.drawImage(img, 0, 0,img.width,img.height);*/
				document.getElementById("input").style.display = "none";
			$this = this;
			$("#rectangle").css({
				'width':(video.videoWidth-50)+"px",
				'height':(video.videoWidth-50)/1.7+"px",
				'margin-left':'25px',
				'margin-top':(video.videoHeight-(video.videoWidth-50)/1.7)/2+'px',
				'display':'block'
			});
			$("#find_qr_btn").css({
				"right":"0px",
				"top":video.videoHeight/2-50
			});
			drawVideo();
		}, 0);
	}
	
	/*imageObj = new Image();
	imageObj.src = 'src/test_images/from_2.jpg';
	imageObj.onload = function(){
		canvas.width = imageObj.width/5;
		canvas.height = imageObj.height/5;
		originalCanvas.width = imageObj.width;
		originalCanvas.height = imageObj.height;
		operationCanvas.width = imageObj.width/5;
		operationCanvas.height = imageObj.height/5;
		originalContext.drawImage(imageObj, 0, 0);
		context.drawImage(imageObj, 0, 0,imageObj.width/5,imageObj.height/5);
		operationContext.drawImage(imageObj, 0, 0,imageObj.width/5,imageObj.height/5);
		checkQr();
	}*/

    // resize the canvas to fill browser window dynamically
    //window.addEventListener('resize', resizeCanvas, false);
	//checkQr();
    function resizeCanvas() {
            /*canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
			originalCanvas.width = window.innerWidth;
            originalCanvas.height = window.innerHeight;
			operationCanvas.width = window.innerWidth;
			operationCanvas.height = window.innerHeight;*/

			$("#rectangle").css({
				'width':(video.videoWidth-50)+"px",
				'height':(video.videoWidth-50)/4.04+"px",
				'margin-left':'25px',
				'margin-top':(video.videoHeight-(video.videoWidth-50)/4.04)/2+'px',
				'display':'block'
			});
			$("#find_qr_btn").css({
				"right":"0px",
				"top":video.videoHeight/2-50
			});
            //drawStuff(); 
    }
    //resizeCanvas();
	//checkUserMedia();
	function noUserMedia(){
		if(isMobileBrowser()) {
			input = document.getElementById("input");
			input.addEventListener("change", handleFile);
			input.style.display = "block";
		} else {
			document.getElementById("browser_mode").style.display = "block";
			input = document.getElementById("input_browser");
			input.addEventListener("change", handleFile);
			input.style.display = "block";
		}
	}
	function handleFile(e) {
		photoTaked = true;
		document.getElementById("file_button").style.display = 'none';
		document.getElementById("browser_mode").style.display = "none";
		document.getElementById("sk-folding-cube-container").style.display = 'block';
		
		setTimeout(function(){loadFile(e); }, 500);
	}
	function drawImageToFile(img) {
		var start = new Date().getTime();
		canvasRatio = img.width/1280;
		canvas.width = img.width/canvasRatio;
		canvas.height = img.height/canvasRatio;
		
		context.drawImage(img, 0, 0,img.width/canvasRatio,img.height/canvasRatio);
		canvasRatio = 1;
		
		document.getElementById('status').innerHTML = 'Image loaded!';
		canvWidth = canvas.width;
		canvHeight = canvas.height;
		
		originalCanvas.width = canvas.width;
		originalCanvas.height = canvas.height;
		operationCanvas.width = canvas.width/canvasRatio;
		operationCanvas.height = canvas.height/canvasRatio;
		originalContext.drawImage(canvas, 0, 0);
		
		operationContext.drawImage(canvas, 0, 0,canvas.width/canvasRatio,canvas.height/canvasRatio);
		document.getElementById("input").style.display = "none";
		var end = new Date().getTime();
		var time = end - start;
		console.log('Draw image time: '+time);
		if(!docQrReaded) {
			var start = new Date().getTime();
			checkQr();
			var end = new Date().getTime();
			var time = end - start;
			console.log('Full time: '+time);
		} else {
			readDocSignature();
		}
	}
	function loadFile(e){
		document.getElementById('status').innerHTML = 'Image loading...';
		var canvas = document.getElementById('qr-canvas');
		var context = canvas.getContext("2d");
		var reader = new FileReader;
		document.getElementById("file_button").style.display = 'none';
		document.getElementById('doc_take_picture_container').style.display = 'none';
		document.getElementById("sk-folding-cube-container").style.display = 'block';
		document.getElementById('take_picture_container').style.display = 'none';
		document.getElementById('turn_phone').style.display = 'none';
		setTimeout(function(){		reader.onload = function(event) {
			var img = new Image();
			img.src = reader.result;
			img.onload = function () {
				/*When the image is rotated*/
				drawImageToFile(img);
				/*if(img.width < img.height) {
					var rotateCanvas = document.createElement('canvas');
					rotateCanvas.id = "rotateCanvas";
					rotateCanvas.width = img.height;
					rotateCanvas.height = img.width;
					rotateCanvas.style.display = "none";
					rotateContext = rotateCanvas.getContext('2d');
					var body = document.getElementsByTagName("body")[0];
					body.appendChild(rotateCanvas);
					
					rotateContext.translate(rotateCanvas.width/2,rotateCanvas.height/2);
					rotateContext.rotate(-Math.PI/2);
					rotateContext.drawImage(img,-img.width/2,-img.height/2);
					rotateContext.restore();
					rotateContext.save();
					rotateImageBase64 = rotateCanvas.toDataURL("image/png");

					imgRotated = new Image();
					imgRotated.width = img.height;
					imgRotated.height = img.width;
					imgRotated.src = rotateImageBase64;
					imgRotated.onload = function(){
						drawImageToFile(imgRotated);
					}
				} else {
					drawImageToFile(img);
				}*/
			}
		}
		reader.readAsDataURL(e.target.files[0]);}, 500);
	}
	/*******TEST*********/
	  function findPos(obj) {
	  var curleft = 0, curtop = 0;
	  if (obj.offsetParent) {
	      do {
	          curleft += obj.offsetLeft;
	          curtop += obj.offsetTop;
	      } while (obj = obj.offsetParent);
	      return { x: curleft, y: curtop };
	  }
	  return undefined;
		}

	function rgbToHex(r, g, b) {
		if (r > 255 || g > 255 || b > 255)
			throw "Invalid color component";
		return ((r << 16) | (g << 8) | b).toString(16);
	}

	$('#qr-canvas').mousemove(function(e) {
		var pos = findPos(this);
		var x = e.pageX - pos.x;
		var y = e.pageY - pos.y;
		var coord = "x=" + x + ", y=" + y;
		var c = this.getContext('2d');
		var p = c.getImageData(x, y, 1, 1).data; 
		var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
		//$('#status').html(coord + "<br>" + hex);
		//document.getElementById('status').innerHTML = coord + "<br>" + hex + "<br />" + p[0]+","+ p[1]+","+ p[2];
	});
	/*TEST END*/
}
