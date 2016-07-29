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
		
		/*Test draw of triangle*/
		context.fillStyle = 'yellow';
		context.fillRect( qrcode.patternPos[lastPatternIndex][1].x, qrcode.patternPos[lastPatternIndex][1].y, 10, 10);
		/*Test draw end*/
		/*TestA*/
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = 'yellow';
		context.moveTo(qrcode.patternPos[lastPatternIndex][1].x,qrcode.patternPos[lastPatternIndex][1].y);
		context.lineTo(qrcode.patternPos[lastPatternIndex][2].x,qrcode.patternPos[lastPatternIndex][2].y);
		/*TestAEnd*/
		/*TestB*/
		context.lineTo(qrcode.patternPos[lastPatternIndex][2].x,qrcode.patternPos[lastPatternIndex][1].y);
		/*TestBEnd*/
		/*TestC*/
		context.lineTo(qrcode.patternPos[lastPatternIndex][1].x,qrcode.patternPos[lastPatternIndex][1].y);
		context.stroke();
		/*TestCEnd*/
		
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
		/*Test draw rotated marker*/
		operationContext.beginPath();
		operationContext.strokeStyle = 'red';
		operationContext.lineWidth = 2;
		operationContext.moveTo(canvWidth/2,canvHeight/2);
		operationContext.lineTo(qrcode.patternPos[0][1].x,canvHeight/2);
		operationContext.lineTo(pointB.x,pointB.y);
		operationContext.lineTo(canvWidth/2,canvHeight/2);
		operationContext.stroke();
		operationContext.beginPath();
		operationContext.arc(canvWidth/2,canvHeight/2,sideC,0,2*Math.PI);
		operationContext.stroke();
		operationContext.fillStyle = 'blue';
		operationContext.fillRect( newX, newY, 10, 10);
		/*Test draw rotated marker end*/
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
			contrastImage(context,70);
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