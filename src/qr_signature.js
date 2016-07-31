function qrSignature(){
	/*Global variables*/
	var canvas = document.getElementById('qr-canvas');
	var canvWidth = 640;
	var canvHeight = 480;
	var context = canvas.getContext('2d');
	var operationCanvas = document.getElementById('operation-canvas');
	var operationContext = operationCanvas.getContext('2d');
	var originalCanvas = document.getElementById('original-canvas'); //For test only
	var originalContext = originalCanvas.getContext('2d'); //For test only
	var localStream;

	var rotationDegree;
	var rotationDir;
	var imgIsReady = false;
	var qrCodeIsReady = false;
	/**
	 * @FIXME create a new class for the image manipulation functions
	 */
	function contrastImage(contextData, contrast) {
		var imageData = contextData.getImageData(0, 0, canvWidth, canvHeight);
		var data = imageData.data;
		var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
		for(var i=0;i<data.length;i+=4)
		{
			data[i] = factor * (data[i] - 128) + 128;
			data[i+1] = factor * (data[i+1] - 128) + 128;
			data[i+2] = factor * (data[i+2] - 128) + 128;
		}
		contextData.putImageData(imageData, 0, 0);
	}
	function imageColorCorrection(contextData){
		var imageData = contextData.getImageData(0, 0, canvWidth, canvHeight);
        var data = imageData.data;

        for(var i = 0; i < data.length; i += 4) {
          var brightness = 0.50 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          data[i] = brightness;
          data[i + 1] = brightness;
          data[i + 2] = brightness;
        }
        contextData.putImageData(imageData, 0, 0);
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
		color.g = imageData[color.r+1];
		color.b = imageData[color.r+2];
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
	function getQRContent(){
		document.getElementById('qr-content').innerHTML = qrcode.result;
		content = qrcode.result;
		url = content.split(";")[0];
		key = content.split(";")[1];
		document.getElementById('qr-content').innerHTML = '<b>URL:</b>'+url+'<br /><b>Key:</b>'+key;
	}
	function createFinalImage(){
		var sourceX = leftX;
        var sourceY = leftY;
        var sourceWidth = origiLeftX-leftX;
        var sourceHeight = leftDownY-leftY;
        var destWidth = origiLeftX-leftX;
        var destHeight = leftDownY-leftY;
        var destX = leftX;
        var destY = leftY;
        
        var finalCanvas = document.createElement('canvas');
        finalCanvas.id = "final-canvas";
        finalCanvas.width = sourceWidth-8;
        finalCanvas.height = sourceHeight-8;
        finalCanvas.style.position = "absolute";
        finalContext = finalCanvas.getContext('2d');
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(finalCanvas);

        finalContext.drawImage(originalCanvas, sourceX, sourceY, sourceWidth-8, sourceHeight-8, -4, -4, sourceWidth-8, sourceHeight-8);
        contrastImage(finalContext,100);
		imageColorCorrection(finalContext);
	}
	function getTheLeftBorder() {
		pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
		newColor = pixColor;
		while(newColor < 5 && leftX > 1) {
			leftX = leftX-1;
			//Redefine the newColor
			newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			//When the image is distorted check the upper-lower pixels color
			checkBottomColor = operationContext.getImageData(leftX, leftY+1, 1, 1).data[0];
			checkTopColor = operationContext.getImageData(leftX, leftY-1, 1, 1).data[0];
			newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			//The color of the lower-upper pixels
			if(checkBottomColor < 5 && checkBottomColor < newColor){
				leftY = leftY+1;
				newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			} else if (checkTopColor < 5 && checkTopColor < newColor) {
				leftY = leftY-1;
				newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			}
		}
		leftX += 1;
	}
	function getTheBottomBorder(leftSideX,leftDownY,newBottomColor){
		returnObj = {};
		pixColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
		newBottomColor = pixColor;
		while(newBottomColor < 5 && leftDownY < canvHeight) {
			leftDownY+=1;
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			checkRightColor = operationContext.getImageData(leftSideX+1, leftDownY, 1, 1).data[0];
			checkLeftColor = operationContext.getImageData(leftSideX-1, leftDownY, 1, 1).data[0];
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			if(checkRightColor < newBottomColor && checkRightColor < 5 && leftDownY<canvHeight){
				leftSideX = leftSideX+1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			} else if (checkLeftColor < newBottomColor && checkLeftColor < 5 && leftDownY<canvHeight) {
				leftSideX = leftSideX-1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			}
		}
		leftDownY -= 2;
		returnObj.x = leftSideX;
		returnObj.y = leftDownY;
		return returnObj;
	}
	function cutSignature(){
		contrastImage(operationContext,100);
		imageColorCorrection(operationContext);
		maxDifference = 120;
		//Y begin
		origiLeftY = leftY;
		
		for(i=0;i<4;i++){
			pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			newColor = pixColor;
			/*Find white*/
			if(i%2 == 0) {
				while(newColor < 10 && leftY > 1) {
					leftY = leftY-1;
					/*Check the right and left pixels color (if the top black line is damaged, or not well-photographed it's help)*/
					leftPixelColor = operationContext.getImageData(leftX-1, leftY, 1, 1).data[0];
					rightPixelColor = operationContext.getImageData(leftX+1, leftY, 1, 1).data[0];
					if(Math.abs(pixColor - leftPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = leftPixelColor;
					} else if(Math.abs(pixColor - rightPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = rightPixelColor;
					} else {
						newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
					}
				}
			} else {
				while(newColor > 10 && leftY > 1) {
					leftY = leftY-1;
					/*Check the right and left pixels color (if the top black line is damaged, or not well-photographed it's help)*/
					leftPixelColor = operationContext.getImageData(leftX-1, leftY, 1, 1).data[0];
					rightPixelColor = operationContext.getImageData(leftX+1, leftY, 1, 1).data[0];
					if(Math.abs(pixColor - leftPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = leftPixelColor;
					} else if(Math.abs(pixColor - rightPixelColor) < maxDifference && Math.abs(pixColor - newColor) > maxDifference) {
						newColor = rightPixelColor;
					} else {
						newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
					}
				}
			}
		}
		console.log(leftX+', '+leftY);
		//X begin
		for(i=0;i<3;i++){
			pixColor = operationContext.getImageData(leftX, origiLeftY, 1, 1).data[0];
			newColor = pixColor;
			if(i%2 == 0){
				while(newColor < 50) {
					leftX = leftX-1;
					newColor = operationContext.getImageData(leftX, origiLeftY, 1, 1).data[0];
				}
			} else {
				while(newColor > 50) {
					leftX = leftX-1;
					newColor = operationContext.getImageData(leftX, origiLeftY, 1, 1).data[0];
				}
			}
		}
		leftY = leftY-1;
		origiLeftX = leftX;

		getTheLeftBorder();
		leftSide = leftX;
		
		bottomPos = getTheBottomBorder(leftSide,leftY,newColor);
		leftX = bottomPos.x;
		leftDownY = bottomPos.y;

		/*if(leftY+50 > leftDownY) {
			qrCodeIsReady = false;
			drawVideo();
			return false;
		}*/
		operationContext.lineWidth = 1;

		/*Test draw*/
		operationContext.beginPath();
		operationContext.moveTo(origiLeftX,leftY);
		operationContext.lineTo(leftSide,leftY);
		operationContext.lineTo(leftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftY);
		operationContext.strokeStyle="red";
		operationContext.stroke();
		
		createFinalImage();
        return false;
		removeColor();
		imageColorCorrection(operationContext);
	}
	/*Rotate to horizontal by the two top markers*/
	function rotateToHorizontal(){
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
		/*Let's draw the rotated frame*/
		operationContext.clearRect(0, 0, canvWidth, canvHeight);
		operationContext.save();
		operationContext.translate(canvas.width/2,canvas.height/2);
		operationContext.rotate(rotationDir*rotationDegree*Math.PI/180);
		operationContext.drawImage(canvas,-canvas.width/2,-canvas.height/2);
		operationContext.restore();
		/*Rotate and save the original image for the final operations*/
		originalContext.save();
		originalContext.translate(canvas.width/2,canvas.height/2);
		originalContext.rotate(rotationDir*rotationDegree*Math.PI/180);
		originalContext.drawImage(originalCanvas,-canvas.width/2,-canvas.height/2);
		originalContext.restore();
		
		/*creating the "blue"*/
		context.fillStyle = 'blue';
		context.fillRect( qrcode.patternPos[lastPatternIndex][1].x, qrcode.patternPos[lastPatternIndex][1].y, 2, 2);
		
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
			if(pix[i] < 50 && pix[i+1] < 50 && pix[i+2] > 200){
				leftX = (i / 4) % canvWidth;
				LeftY = Math.floor((i / 4) / canvWidth);
			}
		}
		cutSignature();
	}
	function checkQr(){
		qrcode.callback = function(){
			if(!qrCodeIsReady) {
				getQRContent();
				qrCodeIsReady = true;
				imageColorCorrection(context); //TEszt
				document.getElementById('original-canvas').style.display = 'none';
				rotateToHorizontal();	
			}			
		}
		try{
			imageColorCorrection(context);
			contrastImage(context,50);
			qrcode.decode();
		} catch(e){
			console.log(e)
		}
	}
	function drawVideo(){
		if(!qrCodeIsReady){
			originalContext.drawImage($this, 0, 0);
			context.drawImage($this, 0, 0);
			checkQr();
			setTimeout(function(){ drawVideo(); }, 1000/25); //25 fps
		}
	}
	function videoIsActive() {
		while(context.getImageData(1, 1, 1, 1).data[0] == 0 && context.getImageData(1, 1, 1, 1).data[1] == 0 && context.getImageData(1, 1, 1, 1).data[2] == 0 && context.getImageData(1, 1, 1, 1).data[3] == 0){
			return true;
		}
	}
	function checkUserMedia() {
		navigator.getUserMedia = (navigator.getUserMedia || 
								 navigator.webkitGetUserMedia || 
								 navigator.mozGetUserMedia || 
								 navigator.msGetUserMedia);
		if (navigator.getUserMedia) {
			// Request access to video only
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
				},
				function(error) {
					alert('Something went wrong. (error code ' + error.code + ')');
				}
			);
		} else {
			alert('Sorry, the browser you are using doesn\'t support getUserMedia');
		}
		video.addEventListener('play', function() {
			$this = this;
			if(videoIsActive()) {
				drawVideo();
			}
		}, 0);
	}
	checkUserMedia();
	/*******TESZT*********/
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

	$('#operation-canvas').mousemove(function(e) {
		var pos = findPos(this);
		var x = e.pageX - pos.x;
		var y = e.pageY - pos.y;
		var coord = "x=" + x + ", y=" + y;
		var c = this.getContext('2d');
		var p = c.getImageData(x, y, 1, 1).data; 
		var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
		//$('#status').html(coord + "<br>" + hex);
		document.getElementById('status').innerHTML = coord + "<br>" + hex + "<br />" + p[0]+","+ p[1]+","+ p[2];
	});
	/*TESZT END*/
}