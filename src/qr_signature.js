var findQrBool = false;
function findQr(){
	findQrBool = true;
}
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
	function pixelTolarence(coord,direction,tolarence){
		if(direction == 'left') {
			
		}
	}
	function getQRContent(){
		document.getElementById('qr-content').innerHTML = qrcode.result;
		content = qrcode.result;
		url = content.split(";")[0];
		key = content.split(";")[1];
		document.getElementById('qr-content').innerHTML = '<b>URL:</b>'+url+'<br /><b>Key:</b>'+key;
	}
	function createFinalImage(leftSide){
		var sourceX = leftSide.x;
        var sourceY = leftSide.y;
        var sourceWidth = origiLeftX-leftSide.x;
        var sourceHeight = leftDownY-leftSide.y;
        var destWidth = origiLeftX-leftSide.x;
        var destHeight = leftDownY-leftSide.y;
        var destX = leftSide.x;
        var destY = leftSide.y;

        var finalCanvas = document.createElement('canvas');
        finalCanvas.id = "final-canvas";
        finalCanvas.width = sourceWidth-8;
        finalCanvas.height = sourceHeight-8;
        finalCanvas.style.position = "absolute";
        finalContext = finalCanvas.getContext('2d');
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(finalCanvas);

        finalContext.drawImage(originalCanvas, sourceX, sourceY, sourceWidth-8, sourceHeight-8, -4, -4, sourceWidth-8, sourceHeight-8);
       // contrastImage(finalContext,20);
		//imageColorCorrection(finalContext);
		finalImageBase64 = finalCanvas.toDataURL("image/png");
	}
	function getTheLeftBorder(leftX,leftY) {
		returnObj = {};
		pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
		newColor = pixColor;
		while(newColor < 100 && leftX > 1) {
			leftX = leftX-1;
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
		}
		console.log(leftX);
		leftX += 1;
		returnObj.x = leftX;
		returnObj.y = leftY;
		returnObj.newColor = newColor;
		return returnObj;
		//operationContext.fillRect(leftX,leftY,10,10);
	}
	function getTheTopBorder(leftTopX,leftTopY,maxDifference){
		for(i=0;i<4;i++){
			pixColor = operationContext.getImageData(leftTopX, leftTopY, 1, 1).data[0];
			newColor = pixColor;
			/*Find white*/
			if(i%2 == 0) {
				while(newColor < 10 && leftTopY > 1) {
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
				}
			} else {
				while(newColor > 10 && leftTopY > 1) {
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
				}
			}
		}
		returnObj = {}
		returnObj.x = leftTopX;
		returnObj.y = leftTopY;
		returnObj.newColor = newColor;
		return returnObj;
	}
	function getTheRightBorder(leftTopX,leftTopY,maxDifference){
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
		return returnObj;
	}
	function getTheBottomBorder(leftSideX,leftDownY,newBottomColor){
		returnObj = {};
		pixColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
		newBottomColor = pixColor;
		while(newBottomColor < 100 && leftDownY < canvHeight) {
			leftDownY+=1;
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			checkRightColor = operationContext.getImageData(leftSideX+1, leftDownY, 1, 1).data[0];
			checkLeftColor = operationContext.getImageData(leftSideX-1, leftDownY, 1, 1).data[0];
			newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			if(checkRightColor < newBottomColor && checkRightColor < 100 && leftDownY<canvHeight){
				leftSideX = leftSideX+1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			} else if (checkLeftColor < newBottomColor && checkLeftColor < 100 && leftDownY<canvHeight) {
				leftSideX = leftSideX-1;
				newBottomColor = operationContext.getImageData(leftSideX, leftDownY, 1, 1).data[0];
			}
		}
		leftDownY -= 2;
		returnObj.x = leftSideX;
		returnObj.y = leftDownY;
		return returnObj;
	}
	function cutSignature(leftX,leftY){
		
		contrastImage(operationContext,100);
		imageColorCorrection(operationContext);
		maxDifference = 120;
		topBorder = getTheTopBorder(leftX,leftY,maxDifference);

		origiLeftY = leftY;
		leftX = topBorder.x;
		leftY = topBorder.y;
		newColor = topBorder.newColor;

		rightBorder = getTheRightBorder(leftX,origiLeftY,maxDifference);
		leftX = rightBorder.x;
		leftY = leftY-1;
		origiLeftX = leftX;

		leftSide = getTheLeftBorder(leftX,leftY);
		leftX = leftSide.x;
		leftY = leftSide.y;

		bottomPos = getTheBottomBorder(leftSide.x,leftSide.y,leftSide.newColor);
		operationContext.fillRect(bottomPos.x,bottomPos.y,10,10);
		//return false;
		leftX = bottomPos.x;
		leftDownY = bottomPos.y;
		/*if(leftY+150 > leftDownY) {
			qrCodeIsReady = false;
			drawVideo();
			return false;
		}*/
		operationContext.lineWidth = 1;

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
		
		createFinalImage(leftSide);
		document.getElementById("qr-canvas").style.display = "none";
		document.getElementById("rectangle").style.display = "none";
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
		
		context.save();
		context.translate(canvas.width/2,canvas.height/2);
		context.rotate(rotationDir*rotationDegree*Math.PI/180);
		context.drawImage(canvas,-canvas.width/2,-canvas.height/2);
		context.restore();
		
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
		operationContext.fillStyle = 'yellow';
		//operationContext.fillRect(newleftX,newleftY,10,10);
		operationContext.fillStyle = 'blue';
		contrastImage(context,100);
		
		cutSignature(newleftX,newleftY);
	}
	function checkQr(){
		qrcode.callback = function(){
			if(!qrCodeIsReady) {
				getQRContent();
				qrCodeIsReady = true;
				imageColorCorrection(context); //Test
				//document.getElementById('original-canvas').style.display = 'none';
				rotateToHorizontal();	
			}			
		}
		try{
			//imageColorCorrection(context);
			contrastImage(context,50);
			qrcode.decode();
		} catch(e){
			console.log(e)
		}
	}
	function drawVideo(){
		if(!qrCodeIsReady){
			context.drawImage($this, 0, 0);
			if(findQrBool) {
				originalContext.drawImage($this, 0, 0);
				checkQr();
			}
			setTimeout(function(){ drawVideo(); }, 1000/25); //25 fps
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
		video.addEventListener('playing', function() {
			$this = this;
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
			drawVideo();
		}, 0);
	}
	
	/*imageObj = new Image();
	imageObj.src = 'src/test_images/from.jpg';
	imageObj.onload = function(){
		originalContext.drawImage(imageObj, 0, 0);
		context.drawImage(imageObj, 0, 0);
		checkQr();
	}*/

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

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
	checkUserMedia();
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