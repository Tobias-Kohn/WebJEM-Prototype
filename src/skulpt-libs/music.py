#
# "music.py" for WEB-JEM
#
# (c) 2016, Bill Manaris, Tobias Kohn
#
# CREATED: JUNE-24-2016
# UPDATED: JUNE-25-2016
#
#########

import jymusic as _jymusic

#########

C1, CS1, D1, DS1, E1, F1, FS1, G1, GS1, A1, AS1, B1 = 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
C2, CS2, D2, DS2, E2, F2, FS2, G2, GS2, A2, AS2, B2 = 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47
C3, CS3, D3, DS3, E3, F3, FS3, G3, GS3, A3, AS3, B3 = 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59
C4, CS4, D4, DS4, E4, F4, FS4, G4, GS4, A4, AS4, B4 = 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71
C5, CS5, D5, DS5, E5, F5, FS5, G5, GS5, A5, AS5, B5 = 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83
C6, CS6, D6, DS6, E6, F6, FS6, G6, GS6, A6, AS6, B6 = 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95

GS2, GS3, GS4, GS5, GS6 = A2, A3, A4, A5, A6
AF2, AF3, AF4, AF5, AF6 = GS2, GS3, GS4, GS5, GS6
BF2, BF3, BF4, BF5, BF6 = AS2, AS3, AS4, AS5, AS6
DF2, DF3, DF4, DF5, DF6 = CS2, CS3, CS4, CS5, CS6
EF2, EF3, EF4, EF5, EF6 = DS2, DS3, DS4, DS5, DS6

TN, SN, EN, QN, HN, WN = 0.125, 0.25, 0.5, 1.0, 2.0, 4.0
DSN, DEN, DQN, DHN, DWN = 0.375, 0.75, 1.5, 3.0, 4.5
ENT = 0.3333333333333333
SQ = 0.25

REST = -2147483648

ACOUSTIC_BASS = "acoustic_bass"
FLUTE = "flute"
STRINGS = "string_ensemble_1"
SYNTH_BASS_2 = "synth_bass_2"
TRUMPET = "trumpet"
VIBES = "vibraphone"

#########

class Note():
	
	def __init__(self, pitch, duration, dynamic=85, panning=0.5):
		self.pitch = pitch
		self.duration = duration
		self.dynamic = dynamic
		self.panning = panning
		
#########
		
class Rest():
	
	def __init__(self, duration):
		self.duration = duration

#########

class Phrase():

	def __init__(self, *args):
		self.track = _jymusic.MidiTrack()
		for arg in args:
			if type(arg) == Note:
				self.addNote(arg)
			elif arg == args[0]:
				self.track.setStartTime(arg)
		
	def addChord(self, chord, duration, dynamic=85):
		self.track.addChord(chord, dynamic, duration)
		
	def addNote(self, note):
		if type(note) == Note:
			self.track.addNote(note.pitch, note.dynamic, note.duration)
		elif type(note) == Rest:
			self.track.addRest(note.duration)
		else:
			print "Invalid type: " + str(type(note))
			
	def addNoteList(self, pitches, durations, dynamic=85):
		track = self.track
		if len(pitches) == len(durations):
			for i in range(len(pitches)):
				if pitches[i] == REST:
					track.addRest(durations[i])
				elif type(pitches[i]) == list:
					track.addChord(pitches[i], dynamic, durations[i])
				else:
					track.addNote(pitches[i], dynamic, durations[i])
		else:
			print "Len of pitches and durations must be equal"
			
	def setChannel(self, channel):
		self.track.setChannel(channel)
			
	def setInstrument(self, instrument):
		self.track.setInstrument(instrument)
		
	def setTempo(self, tempo):
		self.track.setTempo(tempo)
		
		
#########
		
class Part():

	def __init__(self, *args):
		self.title = ""
		self.instrument = "acoustic_grand_piano"
		self.channel = 0
		self.phrases = []
		self.tempo = 0.0
		if len(args) == 3:
			self.title = args[0]
			self.instrument = args[1]
			self.channel = args[2]
		elif len(args) == 2:
			self.instrument = args[0]
			self.channel = args[1]
		elif len(args) == 1:
			self.instrument = args[0]
		
	def addPhrase(self, phrase):
		if type(phrase) == Phrase:
			self.phrases.append(phrase)
			phrase.setChannel(self.channel)
			phrase.setInstrument(self.instrument)
			phrase.setTempo(self.tempo)
		
	def setTempo(self, tempo):
		self.tempo = tempo
		for phrase in self.phrases:
			phrase.setTempo(tempo)
		
#########

class Score():

	def __init__(self, title, tempo = -1.0):
		self.title = title
		self.tempo = tempo
		self.parts = []
		
	def addPart(self, part):
		self.parts.append(part)
		if self.tempo > 0.0:
			part.setTempo(self.tempo)
		
	def setTempo(self, tempo):
		self.tempo = tempo
		if tempo > 0:
			for part in parts:
				part.setTempo(tempo)
		
#########
		
class Play():

	def midi(material):
		if type(material) == Note:
			material = Phrase(material)
		if type(material) == Phrase:
			track = material.track
			_jymusic.loadAndPlayTracks([track])
		elif type(material) == Part:
			if len(material.phrases) > 0:
				tracks = []
				for phrase in material.phrases:
					tracks.append(phrase.track)
				_jymusic.loadAndPlayTracks(tracks)
		elif type(material) == Score:
			tracks = []
			for part in material.parts:
				for phrase in part.phrases:
					tracks.append(phrase.track)
			if len(tracks) > 0:
				_jymusic.loadAndPlayTracks(tracks)
		else:
			print "Play.midi(): Unrecognized type " + str(type(material)) + ", expected Note, Phrase, Part, or Score."

