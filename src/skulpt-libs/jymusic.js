var $builtinmodule = function(name)
{
    var mod = {};
	
	mod.loadAndPlayTracks = new Sk.builtin.func(function(tracks) {
		jythonmusic.MidiPlayer().loadAndPlayTracks(Sk.ffi.remapToJs(tracks));
	});
	
	midiTrackClass = function ($gbl, $loc) {
		
		$loc.__init__ = new Sk.builtin.func(function (self) {
			self.v = jythonmusic.MidiTrack();
		})
		
		$loc.addChord = new Sk.builtin.func(function (self, notes, velocity, duration) {
			self.v.addChord(Sk.ffi.remapToJs(notes), velocity.v, duration.v);
		})

		$loc.addNote = new Sk.builtin.func(function (self, note, velocity, duration) {
			self.v.addNote(note.v, velocity.v, duration.v);
		})

		$loc.addRest = new Sk.builtin.func(function (self, duration) {
			self.v.addRest(duration.v);
		})
		
		$loc.getInstrument = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.getInstrument);
		})

		$loc.setInstrument = new Sk.builtin.func(function (self, instrument) {
			self.v.setInstrument(instrument.v);
		})
		
		$loc.getInstrumentNumber = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.getInstrumentNumber);
		})

		$loc.getVolume = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.volume);
		})
		
		$loc.setVolume = new Sk.builtin.func(function (self, volume) {
			self.v.volume = volume.v;
		})
		
		$loc.getTempo = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.tempo);
		})
		
		$loc.setTempo = new Sk.builtin.func(function (self, tempo) {
			self.v.tempo = tempo.v;
		})
		
		$loc.getChannel = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.channel);
		})
		
		$loc.setChannel = new Sk.builtin.func(function (self, channel) {
			self.v.channel = channel.v;
		})
		
		$loc.getStartTime = new Sk.builtin.func(function (self) {
			return Sk.ffi.remapToPy(self.v.startTime);
		})
		
		$loc.setStartTime = new Sk.builtin.func(function (self, startTime) {
			self.v.startTime = startTime.v;
		})
	}
	
	mod.MidiTrack = Sk.misceval.buildClass(mod, midiTrackClass, 'MidiTrack', []);
	
    return mod;
}