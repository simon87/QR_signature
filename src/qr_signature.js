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
	function cutSignature(){
		contrastImage(operationContext,80);
		//Y begin
		origiLeftY = leftY;
		for(i=0;i<4;i++){
			pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			newColor = pixColor;
			while(Math.abs(pixColor - newColor) < 120) {
				leftY = leftY-1;
				newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			}
		}
		leftY = leftY+1;
		operationContext.fillStyle = "blue";
		operationContext.fillRect( leftX, leftY, 10, 10);
		return false;
		//X begin
		for(i=0;i<3;i++){
			pixColor = operationContext.getImageData(leftX, origiLeftY, 1, 1).data[0];
			newColor = pixColor;
			while(Math.abs(pixColor - newColor) < 100) {
				leftX = leftX-1;
				newColor = operationContext.getImageData(leftX, origiLeftY, 1, 1).data[0];
			}
		}
		
		origiLeftX = leftX;
		operationContext.fillRect( leftX, leftY, 10, 10);
		return false;
		//Right edge
		pixColor = operationContext.getImageData(leftX, leftY, 5, 5).data[0];
		newColor = pixColor;
		run = 0;
		while(Math.abs(pixColor - newColor) < 150 || run == 100) {
			run++;
			//Hogy nem csak a kép torzít-e
			checkBottomColor = operationContext.getImageData(leftX, leftY+1, 1, 1).data[0];
			checkTopColor = operationContext.getImageData(leftX, leftY-1, 1, 1).data[0];
			newColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
			//Ha a két pixellel lejjebb lévő pixel színe 
			if(checkBottomColor < newColor){
				leftY += 1;
			} else if(checkTopColor < newColor) {
				leftY -= 1;
			} else {
				leftX = leftX-1;
			}
			//Újradefiniálom a newColor-t
			newColor = operationContext.getImageData(leftX, leftY, 5, 5).data[0];
		}
		//Left edge
		
		leftX += 2;
		operationContext.fillRect( leftX, leftY, 10, 10);
		
		//leftY bottom
		pixColor = operationContext.getImageData(leftX, leftY, 1, 1).data[0];
		newColor = pixColor;
		leftDownY = leftY;
		
		while(Math.abs(pixColor - newColor) < 100) {
			leftDownY+=1;
			checkRightColor = operationContext.getImageData(leftX+1, leftDownY, 1, 1).data[0];
			checkLeftColor = operationContext.getImageData(leftX-1, leftDownY, 1, 1).data[0];
			newColor = operationContext.getImageData(leftX, leftDownY, 1, 1).data[0];
			if(checkRightColor < newColor){
				leftX += 1;
			} else if(checkLeftColor < newColor) {
				leftX -= 1;
			}
			newColor = operationContext.getImageData(leftX, leftDownY, 1, 1).data[0];
		}
		
		leftDownY -= 2;
		console.log("Alja:"+leftDownY);
		operationContext.fillRect( leftX, leftDownY, 10, 10);
		operationContext.lineWidth = 1;

		//Körberajzolás
		operationContext.beginPath();
		operationContext.moveTo(origiLeftX,leftY);
		operationContext.lineTo(leftX,leftY);
		operationContext.lineTo(leftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftDownY);
		operationContext.lineTo(origiLeftX,leftY);
		operationContext.strokeStyle="red";
		operationContext.stroke();
		var sourceX = leftX;
        var sourceY = leftY;
        var sourceWidth = origiLeftX-leftX;
        var sourceHeight = leftDownY-leftY;
        var destWidth = origiLeftX-leftX;
        var destHeight = leftDownY-leftY;
        var destX = leftX;
        var destY = leftY;

		console.log("destx:"+destHeight);
		return false;
		//context.clearRect(0, 0, canvas.width, canvas.height);
		operationContext.clearRect(0,0,operationCanvas.width,operationCanvas.height);
		/*context2.save();
		context2.translate(canvas.width/2,canvas.height/2);
		context2.rotate(-1*degree*Math.PI/180);
		context2.drawImage(imageObj,-imageObj.width/2,-imageObj.height/2);
		context2.restore();*/
        //operationContext.drawImage(canvas, sourceX+5, sourceY+5, sourceWidth-10, sourceHeight-15, 0, 0, destWidth-10, destHeight-15);
        operationContext.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
		
		/*var canvas_img = document.createElement('canvas');

		canvas_img.id = "CursorLayer";
		canvas_img.width = 1024;
		canvas_img.height = 480;
		canvas_img.style.zIndex = 8;
		//canvas_img.style.position = "absolute";
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(canvas_img);
		canvas_img = document.getElementById("CursorLayer");
		canvas_img.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
		cursorLayer = document.getElementById("CursorLayer");*/
		//context2.rotate(-1*degree*Math.PI/180);
		removeColor();
		imageColorCorrection(operationContext);
		//removeBorders();
		//document.getElementById("qr-canvas").style.display = "none";
		/*var img    = canvas2.toDataURL("image/png");
		var image = new Image();
		image.src = img;
		document.body.appendChild(image);*/
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
				qrCodeIsReady = true;
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
}