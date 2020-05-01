var declareALGen = function() {
	if(typeof(ALGen) != "undefined") return;
	ALGen = {
		ambientBackgroundEnabled : true,
		ambientBackgroundInterval : 100,
		ambientBackgroundTargets : [],
		ambientBackgroundSource : null,
		ambientBackgroundDefaultColor : null,
		usePixelPercentage : 0.1,
		initialized : false,
		valueChangeListeners: [],
		
		addValueChangeListener: function(callback) {
			ALGen.valueChangeListeners.push(callback);
		},
		
		informValueChangeListeners: function() {
			for(var i = 0; i < ALGen.valueChangeListeners.length; i++){
				ALGen.valueChangeListeners[i]();
			}
		},

		hasSource: function() {
			return ALGen.ambientBackgroundSource !== null;
		},

		setSource: function(source) {
			if(typeof(source) != "undefined"){
				ALGen.ambientBackgroundSource = source;
			}
		},

		setSourceByClassName: function(className) {
			var objects = document.getElementsByClassName(className);
			for(var i = 0; i < objects.length; i++){
				ALGen.setSource(objects[0]);
				if(ALGen.hasSource()){
					break;
				}
			}
		},

		setSourceById: function(id) {
			var object = document.getElementById(id);
			ALGen.setSource(object);
		},

		setSourceByTagName: function(tagName) {
			var objects = document.getElementsByTagName(tagName);
			for(var i = 0; i < objects.length; i++){
				ALGen.setSource(objects[0]);
				if(ALGen.hasSource()){
					break;
				}
			}
		},

		addTarget: function(target) {
			if(typeof(target) != "undefined"){
				if(ALGen.ambientBackgroundTargets.includes(target)){
					return;
				}
				if(ALGen.ambientBackgroundDefaultColor === null){
					var originalColor = window.getComputedStyle(target).getPropertyValue("background-color");
					ALGen.ambientBackgroundDefaultColor = originalColor;
				}
				ALGen.ambientBackgroundTargets.push(target);
				ALGen.updateTransitionTimes();
			}
		},

		addTargetsByClassName: function(className) {
			var objects = document.getElementsByClassName(className);
			for(var i = 0; i < objects.length; i++){
				if(!(objects[i] in ALGen.ambientBackgroundTargets)){
					ALGen.addTarget(objects[i]);
				}
			}
		},

		addTargetsByTagName: function(tagName) {
			var objects = document.getElementsByTagName(tagName);
			for(var i = 0; i < objects.length; i++){
				if(!(objects[i] in ALGen.ambientBackgroundTargets)){
					ALGen.addTarget(objects[i]);
				}
			}
		},

		addTargetById: function(id) {
			var object = document.getElementById(id);
			if(!(object in ALGen.ambientBackgroundTargets)){
				ALGen.addTarget(object);
			}
		},

		updateTransitionTimes: function() {
			for(var i = 0; i < ALGen.ambientBackgroundTargets.length; i++){
				var target = ALGen.ambientBackgroundTargets[i];
				target.style.transition = "background "+(2*ALGen.ambientBackgroundInterval)+"ms ease-in-out";
			}
		},

		initAmbientBackgroundWithClass : function(containerClass) {
			var objects = document.getElementsByClassName(containerClass);
			if(objects.length > 0){
				ALGen.initAmbientBackground(objects[0]);
			}
		},

		initAmbientBackgroundWithTag : function(containerTag) {
			var objects = document.getElementsByTagName(containerTag);
			if(objects.length > 0){
				ALGen.initAmbientBackground(objects[0]);
			}
		},

		initAmbientBackgroundWithId : function(containerId) {
			var object = document.getElementById(containerId);
			if(object !== null){
				ALGen.initAmbientBackground(object);
			}
		},

		initAmbientBackground : function(containerObject) {
			if(this.initialized) return;
			this.initialized = true;
			this.updateTransitionTimes();
			var checkboxKey = "ambientBackgroundCheckbox";
			var checkbox = document.createElement("input");
			checkbox.id=checkboxKey;
			checkbox.type="checkbox";
			checkbox.checked = this.ambientBackgroundEnabled;
			checkbox.onchange = function(){
				ALGen.ambientBackgroundEnabled = document.getElementById(checkboxKey).checked;
				ALGen.informValueChangeListeners();
			};
			var inputKey = "ambientBackgroundInput";
			var input = document.createElement("input");
			input.id = inputKey;
			input.type = "text";
			input.value = ""+this.ambientBackgroundInterval;
			input.style.width = "2em";
			input.style.color = "rgb(0,0,0)";
			input.oninput = function(){
				ALGen.ambientBackgroundInterval = parseInt(document.getElementById(inputKey).value);
				ALGen.informValueChangeListeners();
			};
			var percentageKey = "ambientBackgroundPercentageInput";
			var percentage = document.createElement("input");
			percentage.id = percentageKey;
			percentage.type = "text";
			percentage.value = ""+this.usePixelPercentage;
			percentage.style.width = "2em";
			percentage.style.color = "rgb(0,0,0)";
			percentage.oninput = function(){
				var newPercentage = parseFloat(document.getElementById(percentageKey).value);
				if(newPercentage > 0){
					ALGen.usePixelPercentage = newPercentage;
					ALGen.informValueChangeListeners();
				}
			};
			containerObject.appendChild(document.createTextNode("Ambient background"));
			containerObject.appendChild(checkbox);
			containerObject.appendChild(document.createTextNode("every"));
			containerObject.appendChild(input);
			containerObject.appendChild(document.createTextNode("ms with "));
			containerObject.appendChild(percentage);
			containerObject.appendChild(document.createTextNode("% of pixels"));
			
			ALGen.ambientBackgroundRunner();
			
			this.addValueChangeListener(function() {
				checkbox.checked = ALGen.ambientBackgroundEnabled;
				input.value = ""+ALGen.ambientBackgroundInterval;
				percentage.value = ""+ALGen.usePixelPercentage;
				ALGen.updateTransitionTimes();
			});
		},

		ambientBackgroundRunner : function(){
			if(ALGen.ambientBackgroundEnabled){
				ALGen.ambientBackgroundWorker();
				setTimeout(ALGen.ambientBackgroundRunner, ALGen.ambientBackgroundInterval);
			} else {
				ALGen.setBackgroundColor(ALGen.ambientBackgroundDefaultColor, null);
				setTimeout(ALGen.ambientBackgroundRunner, 1000);
			}
		},

		ambientBackgroundWorker : function(){
			if(ALGen.ambientBackgroundTargets.length === 0) return;
			if(ALGen.ambientBackgroundSource !== null){
				var color = ALGen.getAverageColourAsRGB(ALGen.ambientBackgroundSource);
				var styleColor;
				var fontColor;
				if(color === null){
					styleColor = ALGen.ambientBackgroundDefaultColor;
					fontColor = null;
				}else{
					styleColor = "rgb("+color.r+","+color.g+","+color.b+")";
					var hslColor = ALGen.rgbToHsl(color);
					hslColor.h = (hslColor.h+.5)%1;
					hslColor.l = 1 - hslColor.l;
					if(hslColor.s < 0.2){
						hslColor.s *= 5*hslColor.s;
					}
					var lThreshold = 0.2;
					if(Math.abs(0.5-hslColor.l) < lThreshold){
						if(hslColor.l > 0.5){
							hslColor.l += (1-hslColor.l)*(1-Math.abs(0.5-hslColor.l)/lThreshold);
						}else{
							hslColor.l -= hslColor.l*(1-Math.abs(0.5-hslColor.l)/lThreshold);
						}
					}
					var cColor = ALGen.hslToRgb(hslColor);
					fontColor = "rgb("+cColor.r+","+cColor.g+","+cColor.b+")";
				}
				ALGen.setBackgroundColor(styleColor, fontColor);
			}
		},

		setBackgroundColor : function (color, fontColor) {
			for(var i = 0; i < ALGen.ambientBackgroundTargets.length; i++){
				var target = ALGen.ambientBackgroundTargets[i];
				target.style.setProperty("background", color, "important");
				target.style.setProperty("color", fontColor, "important");
				var shadow = window.getComputedStyle(target).getPropertyValue("box-shadow");
				if(shadow !== "none" && shadow !== ""){
					target.style.setProperty("box-shadow", color+" 0px 0px 800px 0px");
				}
			}
		},

		getAverageColourAsRGB : function (img) {
			var canvas = document.createElement('canvas'),
				context = canvas.getContext && canvas.getContext('2d'),
				rgb = {r:null,g:null,b:null}, // Set a base colour as a fallback for non-compliant browsers
				count = 0,
				data, length;

			// return the base colour for non-compliant browsers
			if (!context) { return null; }

			// set the height and width of the canvas element to that of the image
			var height = canvas.height = img.naturalHeight || img.offsetHeight || img.height,
				width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;
			var pixelInterval = Math.round(100.0/ALGen.usePixelPercentage); // Rather than inspect every single pixel in the image inspect only a few pixels

			context.drawImage(img, 0, 0);

			try {
				data = context.getImageData(0, 0, width, height);
			} catch(e) {
				return rgb;
			}

			data = data.data;
			length = data.length;
			var countThreshold = ALGen.usePixelPercentage*width*height/100;
			var pixelIndex = 0;
			while (count < countThreshold) {
				count++;
				pixelIndex += pixelInterval;
				pixelIndex %= length;
				var i = Math.floor(pixelIndex);
				i -= i%4;
				rgb.r += data[i];
				rgb.g += data[i+1];
				rgb.b += data[i+2];
			}

			// floor the average values to give correct rgb values (ie: round number values)
			rgb.r = Math.floor(rgb.r/count);
			rgb.g = Math.floor(rgb.g/count);
			rgb.b = Math.floor(rgb.b/count);

			return rgb;
		},
		
		rgbToHsl: function(rgb) {
			var r = rgb.r / 255.;
			var g = rgb.g / 255.;
			var b = rgb.b / 255.;
			var max = Math.max(r, g, b);
			var min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;
			if (max == min) {
				h = s = 0;
			} else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}
				h /= 6;
			}
			return {"h": h, "s": s, "l": l};
		},
		
		hue2rgb: function(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		},
		
		hslToRgb: function(hsl) {
			var h = hsl.h;
			var s = hsl.s;
			var l = hsl.l;
			var r, g, b;
			if (s == 0) {
				r = g = b = l;
			} else {
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = ALGen.hue2rgb(p, q, h + 1/3);
				g = ALGen.hue2rgb(p, q, h);
				b = ALGen.hue2rgb(p, q, h - 1/3);
			}
			return {"r":Math.round(r * 255), "g":Math.round(g * 255), "b":Math.round(b * 255)};
		}
	};
};

var injectScript = function(scriptText) {
	var scriptNode = document.createElement('script');
	scriptNode.appendChild(document.createTextNode('('+ scriptText +')();'));
	(document.body || document.head || document.documentElement).appendChild(scriptNode);
};

var objectToScript = function(object){
	var script = "{\n";
	for(var i in object){
		if(script.length > 2) script += ",\n";
		if(typeof object[i] == "object"){
			script += i + " : " + objectToScript(object[i]);
		} else {
			script += i + " : " + object[i];
		}
	}
	script += "\n}";
	return script;
};

var TYPE_CONTAINER = "container";
var TYPE_SOURCE = "source";
var TYPE_TARGET = "target";

var listenOnElement = function(type, selector){
	if(typeof(type) !== "object"){
		type = [type];
	}
	var action = "";
	for(var i = 0; i < type.length; i++){
		if(selector.startsWith(".")){
			/* Looking for a class */
			switch(type[i]){
				case TYPE_CONTAINER:
					action += "ALGen.initAmbientBackgroundWithClass(\""+selector.substring(1)+"\");";
					break;
				case TYPE_SOURCE:
					action += "ALGen.setSourceByClassName(\""+selector.substring(1)+"\");";
					break;
				case TYPE_TARGET:
					action += "ALGen.addTargetsByClassName(\""+selector.substring(1)+"\");";
					break;
			}
		}else if(selector.startsWith("#")){
			switch(type[i]){
				case TYPE_CONTAINER:
					action += "ALGen.initAmbientBackgroundWithId(\""+selector.substring(1)+"\");";
					break;
				case TYPE_SOURCE:
					action += "ALGen.setSourceById(\""+selector.substring(1)+"\");";
					break;
				case TYPE_TARGET:
					action += "ALGen.addTargetById(\""+selector.substring(1)+"\");";
					break;
			}
		}else{
			switch(type[i]){
				case TYPE_CONTAINER:
					action += "ALGen.initAmbientBackgroundWithTag(\""+selector+"\");";
					break;
				case TYPE_SOURCE:
					action += "ALGen.setSourceByTagName(\""+selector+"\");";
					break;
				case TYPE_TARGET:
					action += "ALGen.addTargetsByTagName(\""+selector+"\");";
					break;
			}
		}
	}
	action = "function(){"+action+"}";
	waitForKeyElements (selector, function(){injectScript(action);});
};

injectScript(declareALGen);

storeToGM = function() {
	GM_setValue("ambientBackgroundEnabled", unsafeWindow.ALGen.ambientBackgroundEnabled);
	GM_setValue("ambientBackgroundInterval", unsafeWindow.ALGen.ambientBackgroundInterval);
	GM_setValue("usePixelPercentage", ""+unsafeWindow.ALGen.usePixelPercentage);
};

loadFromGM = function() {
	unsafeWindow.ALGen.ambientBackgroundEnabled = GM_getValue("ambientBackgroundEnabled");
	unsafeWindow.ALGen.ambientBackgroundInterval = GM_getValue("ambientBackgroundInterval");
	unsafeWindow.ALGen.usePixelPercentage = parseFloat(GM_getValue("usePixelPercentage"));
};

addGMListeners = function() {
	var callback = function(){
		loadFromGM();
		ALGen.informValueChangeListeners();
	};
	GM_addValueChangeListener("ambientBackgroundEnabled", callback);
	GM_addValueChangeListener("ambientBackgroundInterval", callback);
	GM_addValueChangeListener("usePixelPercentage", callback);
};

/* If the user script has enabled storing values, use it! */
if(typeof(GM_getValue) !== "undefined" && typeof(GM_setValue) !== "undefined"){
	if(typeof(GM_getValue("ambientBackgroundEnabled")) !== "undefined"){
		loadFromGM();
	}
	unsafeWindow.ALGen.addValueChangeListener(storeToGM);
	if(typeof(GM_addValueChangeListener) !== "undefined"){
		addGMListeners();
	}
}