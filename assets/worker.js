onmessage = function (evt) {
	var fn = evt.data.fn;
	var val = evt.data.val;	
	var params = evt.data.params || {};
	var p = params.data;
	for (var i=0, n=p.length; i<n; i+=4) {
		params.i = i;
		var rgba = funcs[fn]({r:p[i], g:p[i+1], b:p[i+2], a:p[i+3]}, params);
		p[i] = rgba.r < 0 ? 0 : (rgba.r > 255) ? 255 : rgba.r;
		p[i+1] = rgba.g < 0 ? 0 : (rgba.g > 255) ? 255 : rgba.g;
		p[i+2] = rgba.b < 0 ? 0 : (rgba.b > 255) ? 255 : rgba.b;
		p[i+3] = rgba.a < 0 ? 0 : (rgba.a > 255) ? 255 : rgba.a;
	}
	postMessage(p);
};

var bcg = function(rgba, params) {
	rgba = brightness(rgba, params.brightness);
	rgba = contrast(rgba, params.contrast);
	rgba = gamma(rgba, params.gamma);
	return rgba;
}

var brightness = function(rgba, val) {
	val = Math.floor(255 * (val / 100));
	for (var chan in rgba) {
		if (rgba.hasOwnProperty(chan)) {
			rgba[chan] += val;
		}
	}
	return rgba;
}

var contrast = function(rgba, val) {
	if (val == 0) return rgba;
	val = Math.pow((100 + val) / 100, 2);
	for (var chan in rgba) {
		if (rgba.hasOwnProperty(chan) && chan != "a") {
			rgba[chan] = ((rgba[chan]/255-0.5)*val+0.5)*255;
		}
	}
	return rgba;
}

var gamma = function(rgba, val) {
	if (val == 0) return rgba;
	val = (val/100)+1;
	for (var chan in rgba) {
		if (rgba.hasOwnProperty(chan) && chan != "a") {
			rgba[chan] = rgba[chan]*val;
		}
	}
	return rgba;
}

var rgb = function(rgba, params) {
	rgba.r += (255/200)*params.red;
	rgba.g += (255/200)*params.green;
	rgba.b += (255/200)*params.blue;
	return rgba;
}


var hsl = function(rgba, params) {
	rgba = hue(rgba, params.hue);
	rgba = saturation(rgba, params.saturation);
	//rgba = lightness(rgba, params.lightness);
	return rgba;
}

var hue = function(rgba, val) {
	var hsv = convert.rgb2hsv(rgba.r, rgba.g, rgba.b);
	hsv.h = ((hsv.h * 100 + Math.abs(val)) % 100)/100;
	var rgb = convert.hsv2rgb(hsv.h, hsv.s, hsv.v);
	return {r: rgb.r, g: rgb.g, b: rgb.b, a: rgba.a};
}

var saturation = function(rgba, val) {
	val *= -1;
	var chan, max, diff;
	max = Math.max(rgba.r, rgba.g, rgba.b);
	for (chan in rgba) {
		if (rgba.hasOwnProperty(chan)) {
			if (rgba[chan] === max || chan === "a") continue;
			diff = max - rgba[chan];
			rgba[chan] += Math.ceil(diff * (val / 100));
		}
	}
	return rgba;
}

var colorize = function(rgba, params) {
	var val = params.colorize;
	var rgb = convert.hex2rgb(params.color);
	rgba.r -= (rgba.r - rgb.r) * (val / 100);
	rgba.g -= (rgba.g - rgb.g) * (val / 100);
	rgba.b -= (rgba.b - rgb.b) * (val / 100);
	return rgba;
}

var solarize = function(rgba) {
	if (rgba.r > 127) rgba.r = 255 - rgba.r;
	if (rgba.g > 127) rgba.g = 255 - rgba.g;
	if (rgba.b > 127) rgba.b = 255 - rgba.b;
	return rgba;
}

var invert = function(rgba) {
	rgba.r = 255 - rgba.r;
	rgba.g = 255 - rgba.g;
	rgba.b = 255 - rgba.b;
	return rgba;
}

var desaturate = function(rgba) {
	var grayscale = rgba.r*0.3 + rgba.g*0.59 + rgba.b*0.11;
	rgba.r = grayscale;
	rgba.g = grayscale;
	rgba.b = grayscale;
  return rgba;
}

var sepia = function(rgba) {
	rgba.r = rgba.r * 0.393 + rgba.g * 0.769 + rgba.b * 0.189;
	rgba.g = rgba.r * 0.349 + rgba.g * 0.686 + rgba.b * 0.168;
	rgba.b = rgba.r * 0.272 + rgba.g * 0.534 + rgba.b * 0.131;
	return rgba;
}

var glow = function(rgba, params) {
	rgba.r += params.amount * params.blur[params.i];
	rgba.g += params.amount * params.blur[params.i+1];
	rgba.b += params.amount * params.blur[params.i+2];
	return rgba;
}

var posterize = function(rgba, params) {
	rgba.r = params.numValues * ((rgba.r / params.numAreas)>>0);
	rgba.g = params.numValues * ((rgba.g / params.numAreas)>>0);
	rgba.b = params.numValues * ((rgba.b / params.numAreas)>>0);
	return rgba;
}

var noise = function(rgba, params) {
	var random = Math.random;
	if (random() < params.amount) {
		for (c in rgba) {
			if (rgba.hasOwnProperty(c) && c != "a") {
				rgba[c] = rgba[c] - params.noise2 + (random() * params.noise);
			}	
		}
	}
	return rgba;
}

funcs = {bcg:bcg, rgb: rgb, hsl: hsl, colorize:colorize, desaturate:desaturate, sepia:sepia, solarize:solarize, invert:invert, glow:glow, posterize: posterize, noise:noise};

var convert = {

	rgb2hsl: function(r, g, b) {
		var result;
		r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), 
    h, s, l = (max + min) / 2;
    if(max == min) {
			h = s = 0; // achromatic
    } else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
    }
    return {h: h, s: s, l: l};
	},

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 */
	hsl2rgb: function(h, s, l){

			if(s == 0){
					r = g = b = l; // achromatic
			} else {
					function hue2rgb(p, q, t){
							if(t < 0) t += 1;
							if(t > 1) t -= 1;
							if(t < 1/6) return p + (q - p) * 6 * t;
							if(t < 1/2) return q;
							if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
							return p;
					}

					var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
					var p = 2 * l - q;
					r = hue2rgb(p, q, h + 1/3);
					g = hue2rgb(p, q, h);
					b = hue2rgb(p, q, h - 1/3);
			}
			
			return {r: r * 255, g: g * 255, b: b * 255};
	},

	/**
	 * Converts an RGB color value to HSV. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and v in the set [0, 1].
	 */
	rgb2hsv: function(r, g, b){
			
			r = r/255, g = g/255, b = b/255;
			var max = Math.max(r, g, b), min = Math.min(r, g, b),
					h, s, v = max,
					d = max - min;
					
			s = max == 0 ? 0 : d / max;

			if(max == min){
					h = 0; // achromatic
			} else {
					switch(max){
							case r: h = (g - b) / d + (g < b ? 6 : 0); break;
							case g: h = (b - r) / d + 2; break;
							case b: h = (r - g) / d + 4; break;
					}
					h /= 6;
			}

			return {h: h, s: s, v: v};
	},

	/**
	 * Converts an HSV color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes h, s, and v are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 */
	hsv2rgb: function(h, s, v){
		
			var r, g, b,
					i = Math.floor(h * 6),
					f = h * 6 - i,
					p = v * (1 - s),
					q = v * (1 - f * s),
					t = v * (1 - (1 - f) * s);

			switch(i % 6){
					case 0: r = v, g = t, b = p; break;
					case 1: r = q, g = v, b = p; break;
					case 2: r = p, g = v, b = t; break;
					case 3: r = p, g = q, b = v; break;
					case 4: r = t, g = p, b = v; break;
					case 5: r = v, g = p, b = q; break;
			}

			return {r: r * 255, g: g * 255, b: b * 255};
	},

	/**
	 * Converts a RGB color value to the XYZ color space. Formulas
	 * are based on http://en.wikipedia.org/wiki/SRGB assuming that
	 * RGB values are sRGB.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns x, y, and z.
	 */
	rgb2xyz: function (r, g, b) {

		r = r / 255; g = g / 255; b = b / 255;

		if (r > 0.04045) {
			r = Math.pow((r + 0.055) / 1.055, 2.4);
		} else {
			r = r / 12.92;
		}

		if (g > 0.04045) {
			g = Math.pow((g + 0.055) / 1.055, 2.4);
		} else {
			g = g / 12.92;
		}

		if (b > 0.04045) {
			b = Math.pow((b + 0.055) / 1.055, 2.4);
		} else {
			b = b / 12.92;
		}

		var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
		var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
		var z = r * 0.0193 + g * 0.1192 + b * 0.9505;

		return {x: x * 100, y: y * 100, z: z * 100};
	},

	/**
	 * Converts a XYZ color value to the sRGB color space. Formulas
	 * are based on http://en.wikipedia.org/wiki/SRGB and the resulting
	 * RGB value will be in the sRGB color space.
	 * Assumes x, y and z values are whatever they are and returns
	 * r, g and b in the set [0, 255].
	 */
	xyz2rgb: function (x, y, z) {
		x = x / 100; y = y / 100; z = z / 100;

		var r, g, b;
		r = (3.2406  * x) + (-1.5372 * y) + (-0.4986 * z);
		g = (-0.9689 * x) + (1.8758  * y) + (0.0415  * z);
		b = (0.0557  * x) + (-0.2040 * y) + (1.0570  * z);

		if(r > 0.0031308) {
			r = (1.055 * Math.pow(r, 0.4166666667)) - 0.055;
		} else {
			r = 12.92 * r;
		}

		if(g > 0.0031308) {
			g = (1.055 * Math.pow(g, 0.4166666667)) - 0.055;
		} else {
			g = 12.92 * g;
		}

		if(b > 0.0031308) {
			b = (1.055 * Math.pow(b, 0.4166666667)) - 0.055;
		} else {
			b = 12.92 * b;
		}

		return {r: r * 255, g: g * 255, b: b * 255};
	},

	/**
	 * Converts a XYZ color value to the CIELAB color space. Formulas
	 * are based on http://en.wikipedia.org/wiki/Lab_color_space
	 * The reference white point used in the conversion is D65.
	 * Assumes x, y and z values are whatever they are and returns
	 * L*, a* and b* values
	 */
	xyz2lab: function(x, y, z) {

		// D65 reference white point
		var whiteX = 95.047, whiteY = 100.0, whiteZ = 108.883

		x = x / whiteX; y = y / whiteY; z = z / whiteZ;

		if (x > 0.008856451679) { // (6/29) ^ 3
			x = Math.pow(x, 0.3333333333);
		} else {
			x = (7.787037037 * x) + 0.1379310345; // (1/3) * ((29/6) ^ 2)c + (4/29)
		}

		if (y > 0.008856451679) {
			y = Math.pow(y, 0.3333333333);
		} else {
			y = (7.787037037 * y) + 0.1379310345;
		}

		if (z > 0.008856451679) {
			z = Math.pow(z, 0.3333333333);
		} else {
			z = (7.787037037 * z) + 0.1379310345;
		}

		var l = 116 * y - 16;
		var a = 500 * (x - y);
		var b = 200 * (y - z);

		return {l: l, a: a, b: b};
	},

	/**
	 * Converts a L*, a*, b* color values from the CIELAB color space
	 * to the XYZ color space. Formulas are based on
	 * http://en.wikipedia.org/wiki/Lab_color_space
	 * The reference white point used in the conversion is D65.
	 * Assumes L*, a* and b* values are whatever they are and returns
	 * x, y and z values.
	 */
	lab2xyz: function(l, a, b) {

		var y = (l + 16) / 116;
		var x = y + (a / 500);
		var z = y - (b / 200);

		if (x > 0.2068965517) { // 6 / 29
			x = x * x * x;
		} else {
			x = 0.1284185493 * (x - 0.1379310345); // 3 * ((6 / 29) ^ 2) * (c - (4 / 29))
		}

		if (y > 0.2068965517) {
			y = y * y * y;
		} else {
			y = 0.1284185493 * (y - 0.1379310345);
		}

		if (z > 0.2068965517) {
			z = z * z * z;
		} else {
			z = 0.1284185493 * (z - 0.1379310345);
		}

		// D65 reference white point
		return {x: x * 95.047, y: y * 100.0, z: z * 108.883};
	},

	hex2rgb: function(hex) {
		var r, g, b;
		
		if (hex.charAt(0) === "#") {
			hex = hex.substr(1);
		}
		
		r = parseInt(hex.substr(0, 2), 16);
		g = parseInt(hex.substr(2, 2), 16);
		b = parseInt(hex.substr(4, 2), 16);
		
		return {r: r, g: g, b: b};
	}
}

