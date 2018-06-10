/**
 * Support-library to access MIDI-devices. Works in Google Chrome only because
 * other browsers neither support MIDI nor dialogs.
 *
 * (c) 2016, Bill Manaris, Tobias Kohn
 */
var MIDILIB = {
	initialized: false,
	midiSupport: false
};

MIDILIB.init = function(onSuccess, onFailure) {
	function onMIDISuccess(midiAccess) {
		MIDILIB.midiAccess = midiAccess;
		MIDILIB.midiSupport = true;
		if (onSuccess)
			onSuccess();
	};

	function onMIDIFailure(error) {
		if (onFailure)
			onFailure(error);
	};

	initialized = true;
	if (navigator.requestMIDIAccess)
		navigator.requestMIDIAccess({sysex: false}).then(onMIDISuccess, onMIDIFailure);
	else if (onFailure)
		onFailure("MIDI not supported");
};

MIDILIB.getInputs = function() {
	var result = [];
	if (MIDILIB.midiSupport && MIDILIB.midiAccess) {
		var inputs = MIDILIB.midiAccess.inputs.values();
		for (var input = inputs.next(); input && !input.done; input = inputs.next())
			result.push(input.value);
	}
	return result;
};

MIDILIB.getOutputs = function() {
	var result = [];
	if (MIDILIB.midiSupport && MIDILIB.midiAccess) {
		var outputs = MIDILIB.midiAccess.outputs.values();
		for (var output = outputs.next(); output && !output.done; output = outputs.next())
			result.push(output.value);
	}
	return result;
};

MIDILIB._createDialog = function(title) {
	var result = document.createElement("dialog");
	if (result) {
		document.body.appendChild(result);
		var titleElement = document.createElement("p");
		var selector = document.createElement("select");
		var closeButton = document.createElement("button");
		result.titleElement = titleElement;
		result.selector = selector;
		result.closeButton = closeButton;
		titleElement.innerHTML = title;
		closeButton.innerHTML = "OK";
		closeButton.addEventListener("click", function(e) {
			e.preventDefault();
			result.close();
		});
		result.appendChild(titleElement);
		result.appendChild(selector);
		result.appendChild(closeButton);
		result.addItem = function(item, caption) {
			var option = document.createElement("option");
			option.extValue = item;
			option.text = caption;
			this.selector.add(option);
		};
		result.clearItems = function() {
			while (this.selector.length > 0)
				this.selector.remove(0);
		};
		result.onSelect = function() {};
		result.addEventListener("close", function(e) {
			result.onSelect(selector.options[result.selector.selectedIndex].extValue);
		});
	}
	return result;
}

MIDILIB.selectInput = function(onSelect) {
	if (MIDILIB.midiSupport && MIDILIB.midiAccess) {
		if (!MIDILIB.selectInputDialog)
			MIDILIB.selectInputDialog = MIDILIB._createDialog("Select a MIDI input device from the list");
		var dialog = MIDILIB.selectInputDialog;
		if (!dialog) {
			onSelect(null);
			return;
		}
		dialog.clearItems();
		var inputs = MIDILIB.midiAccess.inputs.values();
		for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
			if (input.value.manufacturer != "")
			    dialog.addItem(input.value, input.value.manufacturer + " : " + input.value.name);
			else
				dialog.addItem(input.value, input.value.name);
		}
		if (dialog.selector.length == 0) {
			onSelect(null);
			return;
		}
		dialog.onSelect = onSelect;
		dialog.showModal();
	} else
		onSelect(null);
};

MIDILIB.selectOutput = function(onSelect) {
	if (MIDILIB.midiSupport && MIDILIB.midiAccess) {
		if (!MIDILIB.selectOutputDialog)
			MIDILIB.selectOutputDialog = MIDILIB._createDialog("Select a MIDI output device from the list");
		var dialog = MIDILIB.selectOutputDialog;
		if (!dialog) {
			onSelect(null);
			return;
		}
		dialog.clearItems();
		var outputs = MIDILIB.midiAccess.outputs.values();
		for (var output = outputs.next(); output && !output.done; output = outputs.next()) {
			if (output.value.manufacturer != "")
			    dialog.addItem(output.value, output.value.manufacturer + " : " + output.value.name);
			else
				dialog.addItem(output.value, output.value.name);
		}
		if (dialog.selector.length == 0) {
			onSelect(null);
			return;
		}
		dialog.onSelect = onSelect;
		dialog.showModal();
	} else
		onSelect(null);
};
