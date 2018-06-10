var $builtinmodule = function(name)
{
    var mod = {};
	var loaded_instruments = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var setVolume = function(channel, volume) {
		var ch = Sk.ffi.remapToJs(channel);
		var vl = Sk.ffi.remapToJs(volume);
		return MIDI.setVolume(ch, vl);
	}
	var noteOn = function(channel, note, velocity, delay) {
		var ch = Sk.ffi.remapToJs(channel);
		var nt = Sk.ffi.remapToJs(note);
		var vc = Sk.ffi.remapToJs(velocity);
		var dl = Sk.ffi.remapToJs(delay);
		return MIDI.noteOn(ch, nt, vc, dl);
	}
	var noteOff = function(channel, note, delay) {
		var ch = Sk.ffi.remapToJs(channel);
		var nt = Sk.ffi.remapToJs(note);
		var dl = Sk.ffi.remapToJs(delay);
		return MIDI.noteOff(ch, nt, dl);
	}
	var chordOn = function(channel, cord, velocity, delay) {
		var ch = Sk.ffi.remapToJs(channel);
		var nt = Sk.ffi.remapToJs(cord);
		var vc = Sk.ffi.remapToJs(velocity);
		var dl = Sk.ffi.remapToJs(delay);
		return MIDI.chordOn(ch, nt, vc, dl);
	}
	var chordOff = function(channel, cord, delay) {
		var ch = Sk.ffi.remapToJs(channel);
		var nt = Sk.ffi.remapToJs(cord);
		var dl = Sk.ffi.remapToJs(delay);
		return MIDI.chordOff(ch, nt, dl);	
	}
	var stopAllNotes = function() {
		return MIDI.stopAllNotes();
	}
	var setInstrument = function(channel, instrument) {
		var ch = Sk.ffi.remapToJs(channel);
		var inst = Sk.ffi.remapToJs(instrument);
		var instNum = MIDI.GM.byName[inst].number;
		return MIDI.loadPlugin({
			soundfontUrl: "./soundfont/",
			instrument: inst,
			onsuccess: function() {
				MIDI.programChange(ch, instNum);
				loaded_instruments[ch] = instrument;
				console.log("Instrument loaded");
			}
		});
	}
	var getLoadedInstrument = function(channel) {
		var ch = Sk.ffi.remapToJs(channel);
		return loaded_instruments[ch];
	}
	
	mod.setVolume = new Sk.builtin.func(function(channel, volume) {
		return setVolume(channel, volume);
	});
	mod.noteOn = new Sk.builtin.func(function(channel, note, velocity, delay) {
		return noteOn(channel, note, velocity, delay);
	});
	mod.noteOff = new Sk.builtin.func(function(channel, note, delay) {
		return noteOff(channel, note, delay);
	});
	mod.chordOn = new Sk.builtin.func(function(channel, cord, velocity, delay) {
		return chordOn(channel, cord, velocity, delay);
	});
	mod.chordOff = new Sk.builtin.func(function(channel, cord, delay) {
		return chordOff(channel, cord, delay);
	});
	mod.stopAllNotes = new Sk.builtin.func(function() {
		return stopAllNotes();
	});
	mod.setInstrument = new Sk.builtin.func(function(channel, instrument) {
		return setInstrument(channel, instrument);
	});
	mod.getLoadedInstrument = new Sk.builtin.func(function(channel) {
		return getLoadedInstrument(channel);
	});
	
    return mod;
}