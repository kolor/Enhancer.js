function Tools() {

	var setupColorPicker = function() {
		$('.colorwheel').ColorPicker({
			color: '#000000',
			onShow: function (colpkr) {
				$(colpkr).fadeIn(500);
				return false;
			},
			onHide: function (colpkr) {
				$(colpkr).fadeOut(500);
				return false;
			},
			onChange: function (hsb, hex, rgb) {
				$('.colorwheel').css('backgroundColor', '#' + hex).attr('data-color',hex);
			}
		});
		$('.colorwheel2').ColorPicker({
			color: '#ffffff',
			onShow: function (colpkr) {
				$(colpkr).fadeIn(500);
				return false;
			},
			onHide: function (colpkr) {
				$(colpkr).fadeOut(500);
				return false;
			},
			onChange: function (hsb, hex, rgb) {
				$('.colorwheel2').css('backgroundColor', '#' + hex).attr('data-color',hex);
			}
		});
	}
	
	/*** text menu ****/

	var showText = function() {
		
		var getFontFamily = function() {
			var fonts = ['serif','sans-serif','cursive','fantasy','monospace'];
			var ret = '<select class="fontfamily">';
			for (var i in fonts) {
				ret += '<option>'+fonts[i]+'</option>';		
			}
			ret += '</select>';
			return ret;	
		}
		
		var getFontSize = function() {
			var sizes = ['12','15','18','21','24','27','30'];
			var ret = '<select class="fontsize">';
			for (var i in sizes) {
				ret += '<option>'+sizes[i]+'</option>';		
			}
			ret += '</select>';
			return ret;	
		
		}
		
		var getFontStyle = function() {
			var styles = ['normal','italic','bold'];
			var ret = '<select class="fontstyle">';
			for (var i in styles) {
				ret += '<option>'+styles[i]+'</option>';
			}
			ret += '</select>';
			return ret;
		}
		
		$('#side .menu > div').removeClass('active').filter('.text').addClass('active');
		$('.props').empty().append('<div class="text">\
			<div class="left">'+getFontFamily()+'<br>'+getFontSize()+'<span rel="bold">B</span><span rel="italic">I</span><span reln="underline">U</span></div>\
			<div class="center"><div class="colorwheel" data-color="000000"></div><em>Color</em></div>\
			<div class="right"><input type="text" class="textstr" value="enhancer rulez"></div>\
		</div>');
		$('.text .left span').click(function(){
			$(this).toggleClass('active');
		});
		setupColorPicker();
		img.text();
	}	
	
	
	/*** brushes menu ****/
	
	var showBrush = function() {
	
		var getDrawTools = function() {
			var tools = {brush:'Drawing', line:'Lines', rectangle:'Rectangles',ellipse:'Ellipses',spirograph:'Spirograph'};
			var ret = '';
			for (var i in tools) {
				ret += '<div class="tool" rel="'+i+'" title="'+tools[i]+'"></div>';
			}
			return ret;
		}
		
		//todo
		var getDrawFill = function() {
			var fill = ['stroke','fill','paint'];
			var ret = '';
			for (var i in fill) {
				ret += '<div class="fill" rel="'+fill[i]+'"></div>';
			}
			return ret;
		}
			
		var getDrawWidth = function() {
			var width = ['1','3','5','7','9'];
			var ret = '';
			for (var i in width) {
				ret += '<div class="linewidth" rel="'+width[i]+'"></div>';
			}
			return ret;
		}
			
		$('#side .menu > div').removeClass('active').filter('.brush').addClass('active');
		$('.props').empty().append('<div class="draw">\
			<div class="left">'+getDrawTools()+'</div>\
 			<div class="center"><div class="colorwheel" data-color="000000"></div><div class="colorwheel2" data-color="ffffff"></div><div><em class="em1">Color 1</em><em class="em2">Color 2</em></div></div>\
			<div class="center2">'+getDrawWidth()+'</div>\
			<div class="right">'+getDrawFill()+'</div>\
		</div>');
		$('.draw .tool[rel="brush"], .draw .linewidth[rel="1"], .draw .fill[rel="stroke"]').addClass('active');
		$('.draw .tool').click(function(){
			$('.draw .tool').removeClass('active');
			$(this).toggleClass('active');
		});
		$('.draw .linewidth').click(function(){
			$('.draw .linewidth').removeClass('active');
			$(this).toggleClass('active');
		});
		$('.draw .fill').click(function(){
			$('.draw .fill').removeClass('active');
			$(this).toggleClass('active');
		});
		
		setupColorPicker();
		img.draw();
	}
		
	/*** colors menu ****/
	
	var showColors = function() {
		
		var getColorTools = function() {
			var tools = {bcg:'Brightness & Contrast', rgb:'Color adjust', hsl:'Hue & Saturation',colorize:'Colorize',solarize:'Solarize',invert:'Invert colors',desaturate:'Desaturation',sepia:'Sepia effect'};
			var ret = '';
			for(var i in tools) {
				ret += '<div class="tool" rel="'+i+'" title="'+tools[i]+'"></div>';
			}
			return ret;	
		}
		
		var getColorSettings = function(tool) {
			switch(tool) {
				case 'bcg':			
					$('.props .colors .right').html('<table>\
						<tr><td class="caption">Brightness</td><td><div type="text" rel="brightness" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Contrast</td><td><div type="text" rel="contrast" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Gamma</td><td><div type="text" rel="gamma" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td colspan="2"><button rel="bcg" class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.colors('apply', tool);
				break;
				case 'rgb':
					$('.props .colors .right').html('<table>\
						<tr><td class="caption">Red</td><td><div type="text" rel="red" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Green</td><td><div type="text" rel="green" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Blue</td><td><div type="text" rel="blue" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td colspan="2"><button rel="rgb" class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.colors('apply', tool);	
				break;
				case 'hsl':
					$('.props .colors .right').html('<table>\
						<tr><td class="caption">Hue</td><td><div type="text" rel="hue" class="slider2" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Saturation</td><td><div type="text" rel="saturation" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Lightness</td><td><div type="text" rel="lightness" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td colspan="2"><button rel="hsl" class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.colors('apply', tool);			
				break;
				case 'colorize':
					$('.props .colors .right').html('<table>\
						<tr><td class="caption">Level</td><td><div type="text" rel="colorize" class="slider2" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Color</td><td><div class="colorwheel" data-color="0000aa"></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table></div>');			
					setupColorPicker();
					img.colors('apply', tool);
				break;	
				case 'desaturate':
				case 'sepia':
				case 'solarize':
				case 'invert':
					$('.props .colors .right').empty();
					img.colors('buttons', tool);
				break;
			}
		
		
		}
		
		$('#side .menu > div').removeClass('active').filter('.colors').addClass('active');
		$('.props').empty().append('<div class="colors">\
			<div class="left">'+getColorTools()+'</div>\
			<div class="right"><div class="info">Select the color adjustment</div></div>\
			<div id="preview"></div>\
		</div>');
		$('.colors .tool').click(function(){
			$('.colors .tool').removeClass('active');
			$(this).addClass('active');
			getColorSettings($(this).attr('rel'));		
		});
		
	}
	
	
	var showEffects = function() {
		
		var getEffects = function() {
			var tools = {mosaic:'Mosaic',pointilize:'Pointilize',posterize:'Posterize',noise:'Noise',blur:'Blur',emboss:'Emboss',glow:'Glow'};
			var ret = '';
			for(var i in tools) {
				ret += '<div class="tool" rel="'+i+'" title="'+tools[i]+'"></div>';
			}
			return ret;	
		
		}
		
		var getDirections = function() {
			var dirs = {top:'Top',topright:'Top-right',right:'Right',bottomright:'Bottom-right',bottom:'Bottom',bottomleft:'Bottom-left',left:'Left',topleft:'Top-left'}
			var ret = '<select rel="direction">';
			for(var i in dirs) {
				ret += '<option value="'+i+'">'+dirs[i]+'</option>';
			}
			ret += '</select>';
			return ret;		
		}
		
		var getFxSettings = function(fx) {
			switch(fx) {
				case 'glow':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Amount</td><td><div type="text" rel="amount" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Radius</td><td><div type="text" rel="radius" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);
				break;		
				case 'pointilize':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Radius</td><td><div type="text" rel="radius" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Density</td><td><div type="text" rel="density" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Noise</td><td><div type="text" rel="noise" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);				
				break;
				case 'posterize':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Levels</td><td><div type="text" rel="levels" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);	
				break;
				case 'noise':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Amount</td><td><div type="text" rel="amount" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Strength</td><td><div type="text" rel="strength" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);	
				break;
				case 'blur':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Amount</td><td><div type="text" rel="amount" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);					
				break;
				case 'emboss':
					$('.props .effects .right').html('<table>\
						<tr><td class="caption">Strength</td><td><div type="text" rel="strength" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td class="caption">Direction</td><td>'+getDirections()+'</td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);					
				break;
			case 'mosaic':
				$('.props .effects .right').html('<table>\
						<tr><td class="caption">Block size</td><td><div type="text" rel="blocksize" class="slider" data-value="0"></div><span class="value">0</span></td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td>&nbsp;</td></tr>\
						<tr><td colspan="2"><button class="apply rt">Apply</button> <button class="undo rt">Reset</button></td></tr>\
					</table>');
					img.effects('apply', fx);		
			break;
			}
						
		}
		
		$('#side .menu > div').removeClass('active').filter('.effects').addClass('active');
		$('.props').empty().append('<div class="effects">\
			<div class="left">'+getEffects()+'</div>\
			<div class="right"><div class="info">Select the filter to apply</div></div>\
			<div id="preview"></div>\
		</div>');
		$('.effects .tool').click(function(){
			$('.effects .tool').removeClass('active');
			$(this).addClass('active');
			getFxSettings($(this).attr('rel'));		
		});	
	
	}
	

	/*** advanced menu ***/
	
	var showAdvanced = function() {
		$('#side .menu > div').removeClass('active').filter('.advanced').addClass('active');
	
	}
	
	var showSave = function() {
		$('#side .menu > div').removeClass('active').filter('.save').addClass('active');
		
	}
	
	
	$('.menu .text').click(showText);
	$('.menu .brush').click(showBrush);
	$('.menu .colors').click(showColors);
	$('.menu .effects').click(showEffects);
	$('.menu .advanced').click(showAdvanced);
	$('.menu .save').click(showSave);
	
}