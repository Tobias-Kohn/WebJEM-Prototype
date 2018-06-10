var $builtinmodule = function(name)
{
    var mod = {};
	
	mod.getDisplay = new Sk.builtin.func(function(width, height) {
		var c = document.getElementById(Sk.canvas + "-jem-gui");
		if (c != null)
			c.parentElement.removeChild(c);
		var doc = document.getElementById(Sk.canvas);
		var canvas = document.createElement("canvas");
		canvas.id = Sk.canvas + "-jem-gui";
		canvas.width = Sk.ffi.remapToJs(width);
		canvas.height = Sk.ffi.remapToJs(height);
		doc.appendChild(canvas);
		return canvas;
	});
	
	mod.getContext = new Sk.builtin.func(function(canvas) {
		return canvas.getContext("2d");
	});
	
	mod.setFillColor = new Sk.builtin.func(function(context, color) {
		context.fillStyle = Sk.ffi.remapToJs(color);
	});
	
	mod.setStrokeColor = new Sk.builtin.func(function(context, color) {
		context.strokeStyle = Sk.ffi.remapToJs(color);
	});
	
	mod.drawCircle = new Sk.builtin.func(function(context, x, y, radius, fillCircle) {
		x = Sk.ffi.remapToJs(x);
		y = Sk.ffi.remapToJs(y);
		radius = Sk.ffi.remapToJs(radius);
		if (fillCircle)
			fillCircle = Sk.ffi.remapToJs(fillCircle);
		else
			fillCircle = false;
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI);
		if (fillCircle)
			context.fill();
		else
			context.stroke();
	});
	
	mod.drawLine = new Sk.builtin.func(function(context, x1, y1, x2, y2) {
		x1 = Sk.ffi.remapToJs(x1);
		y1 = Sk.ffi.remapToJs(y1);
		x2 = Sk.ffi.remapToJs(x2);
		y2 = Sk.ffi.remapToJs(y2);
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
	});
	
	mod.drawRectangle = new Sk.builtin.func(function(context, x1, y1, x2, y2, fillRect) {
		x1 = Sk.ffi.remapToJs(x1);
		y1 = Sk.ffi.remapToJs(y1);
		x2 = Sk.ffi.remapToJs(x2);
		y2 = Sk.ffi.remapToJs(y2);
		wd = x2 - x1;
		ht = y2 - y1;
		if (fillRect)
			fillRect = Sk.ffi.remapToJs(fillRect);
		else
			fillRect = false;
		context.rect(x1, y1, wd, ht);
		if (fillRect)
			context.fill()
		else
			context.stroke();
	});
	
	mod.createButton = new Sk.builtin.func(function(caption, callback) {
		caption = Sk.ffi.remapToJs(caption);
		var button = document.createElement("input");
		button.type = "button";
		button.value = caption;
		if (callback)
			button.onclick = function() {
				Sk.misceval.callsim(callback);
			};
		return button;
	});
	
	mod.addWidget = new Sk.builtin.func(function(widget, x, y) {
		var canvas = document.getElementById(Sk.canvas);
		x = Sk.ffi.remapToJs(x);
		y = Sk.ffi.remapToJs(y);
		widget.style.position = "absolute";
		widget.style.left = (canvas.offsetLeft + x) + "px";
		widget.style.top = (canvas.offsetTop + y) + "px";
		canvas.appendChild(widget);
	});
	
    return mod;
}