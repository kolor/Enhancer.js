function IMG(file) {
	if (!file.type.match(/image.*/)) {
		setInfo('This is not an image file');
		return true;
	}
	
	var data = {url: {}, original: {}, current: {}, previous: {}, before: {}, preview: {}};
	var transforms = {rotate: 0, scale: 0, translate: 0, radius: 0};
	
	var w = 0, h = 0;
	var MAX_HEIGHT = 500, MAX_WIDTH = 500;
	var loaded = false;
	var _image = new Image();
	var canvas = $('canvas')[0];
	var cnt = canto(canvas);
	cnt.angleUnit = 'degrees';
	var ctx = canvas.getContext('2d');
	var _self = this;
	var lastAction = null;
	
	
	function cpid(src, dest) {
		for(var i in src.data)
			dest.data[i] = src.data[i];
	}
	
	_image.onload = function() {
		if (_image.width > MAX_WIDTH || _image.height > MAX_HEIGHT) {
			if (_image.width > _image.height) {
				w = MAX_WIDTH;
				h = (_image.height/_image.width)*MAX_WIDTH;
			} else {
				h = MAX_HEIGHT;
				w = (_image.width/_image.height)*MAX_HEIGHT;
			}
		} else {
			w = _image.width;
			h = _image.height;
		}
		$(canvas).unbind();
		canvas.width = w+1;
		canvas.height = h+1;
		$('.file-loader').hide();
		$('#main #image').addClass('loaded');
		$(canvas).show();
		
		cnt.drawImage(_image,0,0,w,h);
		data.original = cnt.getImageData(0,0,w,h);
		data.current = data.original;
		data.previous = cnt.createImageData(w,h);
		loaded = true;
		tools = new Tools();
		setInfo('Select operations in the menu on the left');
		$('#side .menu').show();
		$(document).unbind('keyup').keyup(onKeyUp);
	}
		
	var reader = new FileReader();
	reader.onload = function(e) {
		data.original.url = e.target.result;
		_image.src = data.original.url;
	}
	reader.readAsDataURL(file);
	
		
	var getData = function(type) {
		return this.data[type];	
	}
	
	var resetCanvas = function() {
		cnt.clearRect(0,0,canvas.width,canvas.height);
		cnt.putImageData(data.current,0,0);	
	}
	
	var saveCanvas = function() {
		cpid(data.current, data.previous);
		data.current = cnt.getImageData(0,0,w,h);	
	}
	
	var getCanvasPos = function(e, canvas) {
		var pos = {};
		pos.x = e.pageX - $(canvas).offset().left;
		pos.y = e.pageY - $(canvas).offset().top;
		return pos;	
	}
	
	var undoAction = function() {
		cpid(data.previous, data.current);
		resetCanvas();
	}
	
	var createImage = function() {
		lastAction = null;
		$(canvas).unbind();
		$(document).unbind('keyup').keyup(onKeyUp);
		w = 500;
		h = 500;
		canvas.width = w+1;
		canvas.height = h+1;
		$('.file-loader').hide();
		$(canvas).show();
		cnt.b().rect(0, 0, w+1, h+1, 0, 0).fill({fillStyle:getColor()}).z();
		data.original = cnt.getImageData(0,0,w,h);
		data.current = data.original;
		loaded = true;
		tools = new Tools();
		setInfo('Select operations in the menu on the left');
		$('#side .menu').show();
	}
	
	var revertOriginal = function() {
		cpid(data.original, data.current);
		resetCanvas();	
	}
	
	var getColor = function() {
		var color = $('.props .colorwheel').attr('data-color') || 'ffffff';	 
		return '#'+ color;
	}
	
	var getColor2 = function() {
		return '#'+$('.props .colorwheel2').attr('data-color');
	}
	
	var onKeyUp = function(e) {
		if (e.altKey == true) {
			if (e.which == vk.Z) undoAction();
			if (e.which == vk.N) createImage();
			if (e.which == vk.R) revertOriginal();
			return false;
		}
	}
	
	var dec = function(val) {
		val--;
		if (val < 0) val = 0;
		return val;	
	}
		
		
	/*
	 * text drawing
	 *
	 */
	this.text = function() {
		saveCanvas();
		$(canvas).unbind().css('cursor','text').hover(function(){
			var style = '';
			$('.text .left span.active').each(function(){
				style += $(this).attr('rel') || '';
				style += ' ';
			});
			cnt.font = $.trim(style)+' '+getVal('fontsize')+'px '+getVal('fontfamily');
			cnt.textBaseline = 'bottom';
			var text = getVal('textstr');
			
			$(this).mousemove(function(e){
				resetCanvas();
				var pos = getCanvasPos(e, this);
				cnt.b().fillText(text, pos.x, pos.y, {fillStyle: getColor()}).z();
			});
			$(this).click(function(e){
				data.current = cnt.getImageData(0,0,w,h);			
			});
		}, function(){
			$(this).unbind('mousemove');
			resetCanvas();		
		});	
	}

	
	/*
	 * Draw function
	 * drawBrush
	 * drawLine
	 * drawRect
	 * drawCircle
	 *
	 */
	this.draw = function() {
		saveCanvas();
		var	modifier = false;
		
		var drawBrush = function(from, to) {
			cnt.b().M(from.x, from.y).L(to.x, to.y).stroke({lineCap:'round'}).z();
		}

		var drawLine = function(from, to) {
			cnt.b().M(from.x, from.y).L(to.x, to.y).stroke().z();
		}
		
		var drawRect = function(from, to) {
			cnt.b().rect(from.x, from.y, to.x - from.x, to.y - from.y, transforms.radius, transforms.rotate)[getRel('fill')]().z();
		}
		
		var adjustRectangle = function(key, startPos, curPos) {
			switch(key) {
				case vk.LEFT: transforms.rotate--; break; 
				case vk.RIGHT: transforms.rotate++; break; 
				case vk.UP: transforms.radius++; break; 
				case vk.DOWN: transforms.radius--; break; 		
			}
			if (transforms.radius < 0) transforms.radius = 0;
			resetCanvas();
			drawRect(startPos, curPos);
		}
		
		var drawCircle = function(from, to) {
			var cx = Math.max(from.x, to.x) - Math.abs(from.x - to.x)/2;
			var cy = Math.max(from.y, to.y) - Math.abs(from.y - to.y)/2;
			var d = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
			cnt.b().arc(cx, cy, d/2)[getRel('fill')]().z();
		}
		
		var drawEllipse = function(from, to) {
			if (modifier) drawCircle(from, to);
			else {
				var cx = Math.max(from.x, to.x) - Math.abs(from.x - to.x)/2;
				var cy = Math.max(from.y, to.y) - Math.abs(from.y - to.y)/2;
				var d = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
				var rx = Math.abs(to.x - from.x) || 1;
				var ry = Math.abs(to.y - from.y) || 1;
				cnt.b().ellipse(cx, cy, rx, ry, transforms.rotate)[getRel('fill')]().z();
			}
		}
		
		var adjustEllipse = function(key, startPos, curPos) {
			switch(key) {
				case vk.LEFT: transforms.rotate--; break;
				case vk.RIGHT: transforms.rotate++; break;
				case vk.UP: transforms.radius++; break;
				case vk.DOWN: transforms.radius--; break;							
			}
			resetCanvas();
			if (key == vk.C) modifier = !modifier;
			drawEllipse(startPos, curPos);
		}
		
		var drawSpirograph = function(from, to) {
			cnt.save().translate(to.x, to.y);
			_spirograph(transforms.R,transforms.r,transforms.O);		
			cnt.revert();
		}
		
		var adjustSpirograph = function(key, startPos, curPos) {
			switch(key) {
				case vk.LEFT: transforms.r--; break;	
				case vk.RIGHT: transforms.r++; break;
				case vk.UP: transforms.R++; break;
				case vk.DOWN: transforms.R--; break;
				case vk.Z: transforms.O--; break;
				case vk.A: transforms.O++; break; 
				case vk.R: transforms.r = rand(80); transforms.R = rand(40); transforms.O = rand(20); break;
			}
			transforms.r = transforms.r || 1;
			transforms.R = transforms.R || 1;
			if (transforms.R % transforms.r == 0 && transforms.r != 1 && transforms.R != 1) adjustSpirograph(key, startPos, curPos);
			resetCanvas();
			drawSpirograph(startPos, curPos);	
		}
		
		var _spirograph = function(R,r,O) {
			var x1 = R-O;
			var y1 = 0;
			var i  = 1;
			cnt.b().M(x1,y1);
			do {
				if (i>10000) break;
				var x2 = (R+r)*Math.cos(i*Math.PI/72) - (r+O)*Math.cos(((R+r)/r)*(i*Math.PI/72))
				var y2 = (R+r)*Math.sin(i*Math.PI/72) - (r+O)*Math.sin(((R+r)/r)*(i*Math.PI/72))
				cnt.L(x2,y2);
				x1 = x2;
				y1 = y2;
				i++;
			} while (x2 != R-O && y2 != 0 );
			cnt.stroke({strokeStyle: getColor()});
		}
				
		$(canvas).unbind().css('cursor','crosshair').mousedown(function(e){
			
			var startPos = 0, curPos = 0;	
			var action = getRel('tool');
			cnt.lineWidth = getRel('linewidth');
			cnt.lineCap = 'butt';
			cnt._fill = this._$canto[getRel('fill')];
			cnt.strokeStyle = getColor();
			cnt.fillStyle = getColor2();
			startPos = getCanvasPos(e, this);

			// pre-drawing init
			switch(action) {
				case 'rectangle':	transforms = {rotate: 0, radius: 0}; break;
				case 'ellipse': transforms = {rotate: 0}; break;
				case 'spirograph': transforms = {R:16, r:10, O:10}; break;		
			}
			
			$(this).mousemove(function(e) {
				curPos = getCanvasPos(e, this);
				lastAction = action;
				switch(action) {
					case 'brush':
						drawBrush(startPos, curPos);
						startPos = curPos;
					break;
					case 'line':
						resetCanvas();
						drawLine(startPos, curPos);
					break;
					case 'rectangle':
						resetCanvas();
						drawRect(startPos, curPos);
					break;
					case 'circle':
						resetCanvas();
						drawCircle(startPos, curPos);
					break;				
					case 'ellipse':
						resetCanvas();
						drawEllipse(startPos, curPos);
					break;
					case 'spirograph':
						resetCanvas();
						drawSpirograph(startPos, curPos);
					break;
					
				}			
			});	// end of mousemove bind
			
			var onAdjust = function(e) {
				if (lastAction != null) {
					var key = e.which || e.keyCode;
					switch(lastAction) {	
						case 'rectangle': adjustRectangle(key, startPos, curPos);	break;
						case 'ellipse': adjustEllipse(key, startPos, curPos); break;
						case 'spirograph': adjustSpirograph(key, startPos, curPos); break;
					}
					if (in_array(key, vka))	return false;
				}
			}
			
			$(document).keydown(onAdjust);
			
			
			
		}).mouseup(function(){
			$(document).unbind('keypress');
			$(this).unbind('mousemove');
			saveCanvas();
		});
	}
	
	
	/*****************************************************
	 * colors
	 *
	 *****************************************************/
		this.colors = function(setup, action) {
			$(canvas).unbind();
			$('#preview').empty();
			saveCanvas();
			lastAction = action;
			if (w > h) {
				var pw = 150, ph = (h/w)*150;
			} else if (w < h) {
				var ph = 140, pw = (w/h)*140;
			} else {
				var ph = pw = 140;
			}
			
			var process = function(fx, params) {
				$('#loader').html('<div class="info">Processing Image</div>').show();
				var worker = new Worker("assets/worker.js");
				params.color = getColor();
				params.data = data.current.data;
				worker.onmessage = function (e) {
					cpid(e, data.current);
					resetCanvas();
					$('#loader').hide();
				};
				worker.postMessage({fn:fx, params:params});				
			}
			
			var processPreview = function(fx, params) {
				var worker = new Worker("assets/worker.js");
				var imgd = cntp.createImageData(pw,ph);
				params.color = getColor();
				params.data = data.preview.data;
				worker.onmessage = function (e) {
					cpid(e, imgd);
					cntp.clearRect(0,0,pw,ph);
					cntp.putImageData(imgd,0,0);	
				};
				worker.postMessage({fn:fx, params:params});						
			}
									
			var setupPreview = function() {				
				var preview = document.createElement("canvas");
				$('#preview')[0].appendChild(preview);
				preview.width = pw+1;
				preview.height = ph+1;
				var cnt = canto(preview);			
				cnt.drawImage(canvas,0,0,pw,ph);
				data.preview = cnt.getImageData(0,0,pw,ph);
				return cnt;				
			}
									
			if (setup == 'apply') {
				var cntp = setupPreview();
				
				$('.slider').slider({value:0, min: -100, max: 100, step: 5, 
					slide: function(e, ui) {				
						$(this).next().text(ui.value);
						$(this).attr('data-value',ui.value);
					},
					stop: function(e, ui) {
						processPreview(lastAction, getParams(), cntp);
					}
				});
				$('.slider2').slider({value:0, min: 0, max: 100, step: 5, 
					slide: function(e, ui) {				
						$(this).next().text(ui.value);
						$(this).attr('data-value',ui.value);
					},
					stop: function(e, ui) {
						processPreview(lastAction, getParams(), cntp);
					}
				});
				$('.props .right .apply').click(function(){
					process(lastAction, getParams());
				});
				$('.props .right .undo').click(undoAction);
			}
			
			if (setup == 'buttons') {
				process(lastAction, {});
			}
		}
		
		
		
		/*
		 * effects
		 *
		 */
		
		this.effects = function(setup, action, params) {
			$(canvas).unbind();
			$('#preview').empty();
			saveCanvas();
			lastAction = action;
			var preview = null;
			
			if (w > h) {
				var pw = 150, ph = (h/w)*150;
			} else if (w < h) {
				var ph = 140, pw = (w/h)*140;
			} else {
				var ph = pw = 140;
			}
			
			var process = function(fx, params) {
				$('#loader').html('<div class="info">Processing Image</div>').show();
				var worker = new Worker("assets/worker.js");
				params.width = w;
				params.height = h;
				params.color = getColor();
				params.canvas = canvas;
				params.cnt = cnt;
				params.data = data.current.data;
				params = func[fx](params);	// params.worker must be true to process worker	
				params.canvas = params.cnt = null;
		
				worker.onmessage = function (e) {
					cpid(e, data.current);
					resetCanvas();
					$('#loader').hide();
				};
				if (params.worker)
					worker.postMessage({fn:fx, params:params});		
				else
					$('#loader').hide();
			}
			
			var processPreview = function(fx, params) {
				var worker = new Worker("assets/worker.js");
				cntp.putImageData(data.preview,0,0);
				var imgd = cntp.createImageData(pw-1,ph-1);
				params.width = parseInt(pw);
				params.height = parseInt(ph);
				params.color = getColor();
				params.canvas = preview;
				params.cnt = cntp;
				params.data = data.preview.data;
				params = func[fx](params);
				params.canvas = params.cnt = null;
				
				worker.onmessage = function (e) {
					cpid(e, imgd);
					cntp.clearRect(0,0,pw,ph);
					cntp.putImageData(imgd,0,0);	
				};
				if (params.worker)
					worker.postMessage({fn:fx, params:params});						
			}
									
			var setupPreview = function() {				
				preview = document.createElement("canvas");
				$('#preview')[0].appendChild(preview);
				preview.width = pw+1;
				preview.height = ph+1;
				var cntp = canto(preview);			
				cntp.drawImage(canvas,0,0,pw,ph);
				data.preview = cntp.getImageData(0,0,pw-1,ph-1);
				return cntp;				
			}
			
			var glow = function(params) {
				params.amount = (parseFloat(params.amount/100)||0);
				params.radius = parseFloat(params.radius/100)||0;
				
				var blurCanvas = document.createElement("canvas");
				blurCanvas.width = params.width+1;
				blurCanvas.height = params.height+1;
				var blurCtx = blurCanvas.getContext("2d");
				blurCtx.drawImage(canvas,0,0);
				
				var scale = 2;
				var smallWidth = Math.round(params.width / scale);
				var smallHeight = Math.round(params.height / scale);

				var copy = document.createElement("canvas");
				copy.width = smallWidth;
				copy.height = smallHeight;
				var copyCtx = copy.getContext("2d");
				
				var clear = true;
				var steps = Math.round(params.radius * 20);
				
				for (var i=0;i<steps;i++) {
					var scaledWidth = Math.max(1,Math.round(smallWidth - i));
					var scaledHeight = Math.max(1,Math.round(smallHeight - i));
		
					copyCtx.clearRect(0,0,smallWidth,smallHeight);
					copyCtx.drawImage(blurCanvas,0,0,params.width,params.height,0,0,scaledWidth,scaledHeight);
					blurCtx.clearRect(0,0,params.width,params.height);
					blurCtx.drawImage(copy,	0,0,scaledWidth,scaledHeight,0,0,params.width,params.height);
				}	
				
				params.blur = blurCtx.getImageData(0,0,params.width,params.height).data;
				params.worker = true;
				return params;
			}
			
			var pointilize = function(params) {
				var radius = Math.max(1,parseInt(params.radius/5,10));
				var density = Math.min(5,Math.max(0,parseFloat(params.density/30)||0));
				var noise = Math.max(0,parseFloat(params.noise/50)||0);
				var transparent = !!(params.transparent && params.transparent != "false");

				var w4 = params.width*4;
				var y = params.height;

				var canvasWidth = params.width;
				var canvasHeight = params.height;

				var pixel = document.createElement("canvas");
				pixel.width = pixel.height = 1;
				var pixelCtx = pixel.getContext("2d");

				var copy = document.createElement("canvas");
				copy.width = canvasWidth+1;
				copy.height = canvasHeight+1;
				var copyCtx = copy.getContext("2d");
				copyCtx.drawImage(params.canvas,0,0,canvasWidth,canvasHeight,0,0,canvasWidth,canvasHeight);

				var diameter = radius * 2;
				//if (transparent)	ctx.clearRect(0,0,w,h);
				var noiseRadius = radius * noise;
				var dist = 1 / density;

				for (var y=0;y<h+radius;y+=diameter*dist) {
					for (var x=0;x<w+radius;x+=diameter*dist) {
						rndX = noise ? (x+((Math.random()*2-1) * noiseRadius))>>0 : x;
						rndY = noise ? (y+((Math.random()*2-1) * noiseRadius))>>0 : y;
						var pixX = rndX - radius;
						var pixY = rndY - radius;
						if (pixX < 0) pixX = 0;
						if (pixY < 0) pixY = 0;

						var cx = rndX;
						var cy = rndY;
						if (cx < 0) cx = 0;
						if (cx > canvasWidth) cx = canvasWidth;
						if (cy < 0) cy = 0;
						if (cy > canvasHeight) cy = canvasHeight;

						var diameterX = diameter;
						var diameterY = diameter;
						if (diameterX + pixX > canvasWidth)
							diameterX = canvasWidth - pixX;
						if (diameterY + pixY > canvasHeight)
							diameterY = canvasHeight - pixY;
						if (diameterX < 1) diameterX = 1;
						if (diameterY < 1) diameterY = 1;
						
						try {
							pixelCtx.drawImage(copy, pixX, pixY, diameterX, diameterY, 0, 0, 1, 1);
							var data = pixelCtx.getImageData(0,0,1,1).data;
							var fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
							params.cnt.b().arc(cx,cy,radius).fill({fillStyle:fillStyle}).z();
						} catch (err) {
							console.log(err);
						}
					}
				}
				params.useData = false;
				params.worker = false;
				return params;
			}
			
			var posterize = function(params) {
				var numLevels = 256;
				if (typeof params.levels != "undefined")
					numLevels = parseInt((100-params.levels)/10,10)||1;
				numLevels = Math.max(2,Math.min(256,numLevels));
				params.numAreas = 256 / numLevels;
				params.numValues = 256 / (numLevels-1);
				params.worker = true;
				return params;
			}
			
			var noise = function(params) {
				params.amount = Math.max(0,Math.min(1,params.amount/100));
				params.strength = Math.max(0,Math.min(1,params.strength/100));
				params.noise = 128 * params.strength;
				params.noise2 = params.noise / 2;
				params.worker = true;
				return params;			
			}
			
			var blur = function(params) {
				params.amount = parseFloat(params.amount/2.5)||0;
				//params.cnt.save().b().rect(0,0,params.width,params.height).clip();
				var scale = 2;
				var smallWidth = Math.round(params.width / scale);
				var smallHeight = Math.round(params.height / scale);
				
				var copy = document.createElement("canvas");
				copy.width = smallWidth;
				copy.height = smallHeight;

				var clear = false;
				var steps = Math.round(params.amount);

				var copyCtx = copy.getContext("2d");
				for (var i=0;i<steps;i++) {
					var scaledWidth = Math.max(1,Math.round(smallWidth - i));
					var scaledHeight = Math.max(1,Math.round(smallHeight - i));
					copyCtx.clearRect(0,0,smallWidth,smallHeight);
					copyCtx.drawImage(params.canvas,0,0,params.width,params.height,0,0,scaledWidth,scaledHeight);
					//if (clear)	ctx.clearRect(rect.left,rect.top,rect.width,rect.height);
					params.cnt.drawImage(copy,0,0,scaledWidth,scaledHeight,0,0,params.width,params.height);
				}		
				params.worker = false;
				return params;
			}
			
			
			var emboss = function(params) {
				var strength = parseFloat(params.strength/10)||1;
				var greyLevel = 180;
				var direction = params.direction||"topleft";
				var dirY = 0;
				var dirX = 0;
				switch (direction) {
					case "topleft":	dirY = -1; dirX = -1; break;
					case "top": dirY = -1; dirX = 0; break;
					case "topright": dirY = -1; dirX = 1; break;
					case "right":	dirY = 0; dirX = 1; break;
					case "bottomright":	dirY = 1; dirX = 1; break;
					case "bottom": dirY = 1; dirX = 0; break;
					case "bottomleft": dirY = 1; dirX = -1; break;
					case "left": dirY = 0; dirX = -1; break;
				}
				
				var pix = {data:[]};
				cpid(params, pix);
				var dataCopy = params.data;
				var w = parseInt(params.width);
				var h = parseInt(params.height);

				var w4 = w*4;
				var y = h;
				do {
					var offsetY = (y-1)*w4;
					var otherY = dirY;
					if (y + otherY < 1) otherY = 0;
					if (y + otherY > h) otherY = 0;
					var offsetYOther = (y-1+otherY)*w*4;

					var x = w;
					do {
							var offset = offsetY + (x-1)*4;
							var otherX = dirX;
							if (x + otherX < 1) otherX = 0;
							if (x + otherX > w) otherX = 0;
							var offsetOther = offsetYOther + (x-1+otherX)*4;

							var dR = dataCopy[offset] - dataCopy[offsetOther];
							var dG = dataCopy[offset+1] - dataCopy[offsetOther+1];
							var dB = dataCopy[offset+2] - dataCopy[offsetOther+2];

							var dif = dR;
							var absDif = dif > 0 ? dif : -dif;

							var absG = dG > 0 ? dG : -dG;
							var absB = dB > 0 ? dB : -dB;

							if (absG > absDif)	dif = dG;
							if (absB > absDif)	dif = dB;

							dif *= strength;
							var r = pix.data[offset] + dif;
							var g = pix.data[offset+1] + dif;
							var b = pix.data[offset+2] + dif;

							pix.data[offset] = (r > 255) ? 255 : (r < 0 ? 0 : r);
							pix.data[offset+1] = (g > 255) ? 255 : (g < 0 ? 0 : g);
							pix.data[offset+2] = (b > 255) ? 255 : (b < 0 ? 0 : b);

					} while (--x);
				} while (--y);		
				
				var imgd = params.cnt.createImageData(params.width-1,params.height-1);
				cpid(pix, imgd);
				params.cnt.putImageData(imgd,0,0);
				
				params.worker = false;
				return params;			
			}
			
			var mosaic = function(params) {
				var blockSize = Math.max(1,parseInt(params.blocksize/2,10));
				var pixel = document.createElement("canvas");
				pixel.width = pixel.height = 1;
				var pixelCtx = pixel.getContext("2d");
	
				var copy = document.createElement("canvas");
				copy.width = params.width+1;
				copy.height = params.height+1;
				var copyCtx = copy.getContext("2d");
				copyCtx.drawImage(params.canvas,0,0,params.width,params.height, 0,0,params.width,params.height);
	
				for (var y=0;y<params.height;y+=blockSize) {
					for (var x=0;x<params.width;x+=blockSize) {
						var blockSizeX = blockSize;
						var blockSizeY = blockSize;
			
						if (blockSizeX + x > params.width)
							blockSizeX = params.width - x;
						if (blockSizeY + y > params.height)
							blockSizeY = params.height - y;
	
						pixelCtx.drawImage(copy, x, y, blockSizeX, blockSizeY, 0, 0, 1, 1);
						var data = pixelCtx.getImageData(0,0,1,1).data;
						params.cnt.fillStyle = "rgb(" + data[0] + "," + data[1] + "," + data[2] + ")";
						params.cnt.fillRect(x,y, blockSize, blockSize);
					}
				}
				
				params.worker = false;
				return params;
			}
			
			var func = {glow:glow, pointilize:pointilize, posterize:posterize, noise:noise, blur:blur, emboss:emboss, mosaic:mosaic}
						
			if (setup == 'apply') {
				var cntp = setupPreview();
				
				$('.slider').slider({value:0, min: 0, max: 100, step: 5, 
					slide: function(e, ui) {				
						$(this).next().text(ui.value);
						$(this).attr('data-value',ui.value);
					}, stop: function(e, ui) {
						processPreview(lastAction, getParams());
					}
				});
				$('.props .right .apply').click(function(){
					var params = {};
					$('.props .right [rel]').each(function(){
						params[$(this).attr('rel')] = $(this).attr('data-value');
					});
					process(lastAction, params);
				});
				$('.props .right .undo').click(undoAction);
			}
		
		
		}
		
}