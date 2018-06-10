var $builtinmodule = function(name)
{
    var mod = {};
	
	mod.init = new Sk.builtin.func(function() {
		if (!MIDILIB.initialized) {
			var susp = new Sk.misceval.Suspension();
			susp.resume = function() {
				if (susp.data["error"]) {
                    throw new Sk.builtin.IOError(susp.data["error"].message);
                } else {
                    return susp.data['result'];
                }
			};
			susp.data = {
				type: "Sk.promise",
				promise: new Promise(function (resolve, reject) {
					MIDILIB.init(function() {resolve(Sk.ffi.remapToPy(true));}, reject);
				})
			};
			return susp;
		} else
			return Sk.ffi.remapToPy(MIDILIB.support);
	});
	
	mod.selectInput = new Sk.builtin.func(function() {
		if (MIDILIB.midiSupport) {
			var susp = new Sk.misceval.Suspension();
			susp.resume = function() {
				if (susp.data["error"]) {
                    throw new Sk.builtin.IOError(susp.data["error"].message);
                } else {
                    return susp.data['result'];
                }
			};
			susp.data = {
				type: "Sk.promise",
				promise: new Promise(function (resolve, reject) {
					MIDILIB.selectInput(resolve);
				})
			};
			return susp;
		} else
			return Sk.ffi.remapToPy(null);
	});
	
	mod.selectOutput = new Sk.builtin.func(function() {
		if (MIDILIB.midiSupport) {
			var susp = new Sk.misceval.Suspension();
			susp.resume = function() {
				if (susp.data["error"]) {
                    throw new Sk.builtin.IOError(susp.data["error"].message);
                } else {
                    return susp.data['result'];
                }
			};
			susp.data = {
				type: "Sk.promise",
				promise: new Promise(function (resolve, reject) {
					MIDILIB.selectOutput(resolve);
				})
			};
			return susp;
		} else
			return Sk.ffi.remapToPy(null);
	});
	
	mod.setEventHandler = new Sk.builtin.func(function(inputDevice, eventHandler) {
		inputDevice.onmidimessage = function(message) {
			var data = message.data;
			var msgType = (data[0] & 0xF0) >> 4;
			if (msgType != 0 && msgType != 0x0F) {
				var lst = [];
				for (var i = 0; i < data.length; i++)
					lst.push(Sk.ffi.remapToPy(data[i]));
				var pyData = new Sk.builtin.list(lst);
				Sk.misceval.callsim(eventHandler, pyData);
			}
		}
	});
	
	mod.sendData = new Sk.builtin.func(function(outputDevice, data) {
		var msg = Sk.ffi.remapToJs(data);
		outputDevice.send(msg);
	});
	
	mod.sendDataTimeout = new Sk.builtin.func(function(outputDevice, data, delay) {
		var _delay = Sk.ffi.remapToJs(delay);
		console.log("Delay: " + _delay);
		var msg = Sk.ffi.remapToJs(data);
		setTimeout(function() { outputDevice.send(msg);	console.log(msg[0]); }, _delay);
	});
	
	mod.isValidDevice = new Sk.builtin.func(function(device) {
		return Sk.ffi.remapToPy(device != null);
	});
	
    return mod;
}