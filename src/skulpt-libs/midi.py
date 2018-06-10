################################################################################################################
# midi.py       Version 1.8     02-Aug-2016     David Johnson, Bill Manaris, Kenneth Hanson, Tobias Kohn

###########################################################################
#
# This file is part of Jython Music.
#
# Copyright (C) 2016 David Johnson, Bill Manaris, Kenneth Hanson, Tobias Kohn
#
#    Jython Music is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    Jython Music is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with Jython Music.  If not, see <http://www.gnu.org/licenses/>.
#
###########################################################################

#
# This module includes functionality to connect to MIDI devices from input and output.
#
#
# REVISIONS:
#
#   1.8     07-Jan-2016 (bm) Fixed pesky bug with closing MidiIn objects (was using the wrong variable,
#                       but error was not being printed because code is running inside Java - ouch!).  
#                       Now, _stopActiveMidiObjects_ corrently closes MidiIn objects by calling 
#                       midiIn.midiDevice.close().  Also, added MidiIn.open() and MidiIn.close()

# ****
# TODO:  If above works, also update variable names to match:
#      self.midiDevice = None           # holds MIDI input device asscociated with this instance
#      self.transmitter = None          # holds the selected device's MIDI transmitter (to receive MIDI messages from)
#
# with
#
#      self.midiOutput = None              # holds the selected output MIDI device (we may want to close it)
#      self.midiReceiver = None            # holds the selected device's MIDI receiver (to send MIDI messages to)
#      
# also remember to update     
#      _stopActiveMidiObjects_()
#
# for some reason, if there are Python errors in this code (since it is executed by Java, they are not reported
# on the console.
#  
#   1.7     06-Dec-2014 (bm) Added MidiIn showMessages() and hideMessages() to turn on and off printing 
#                       of incoming MIDI messages.  This allows to easily explore what messages are being send 
#                       by a particular device (so that they can be mapped to different functions).
#
#   1.6     19-Nov-2014 (bm) Fixed bug in cleaning up objects after JEM's stop button is pressed -
#                       if list of active objects already exists, we do not redefine it - thus, we 
#                       do not lose older objects, and can still clean them up.
#
#   1.5     06-Nov-2014 (bm)  Added functionality to stop midi objects via JEM's Stop button
#                       - see registerStopFunction().
#
#   1.4    13-May-2013  (bm) Function MidiIn.onInput() now has an eventType parameter (i.e., the number
#                       associated with a particular message type.  This makes it even more convenient
#                       for the end-programmer to specify callback functions for specific MIDI event types.
#                       MidiIn.onInput() can be used repeatedly to associate different event types with 
#                       different callback functions (one function per event type).  
#
#                       NOTE:  If called more than once for the same event type, only the latest callback 
#                       function is retained (the idea is that this function can contain all that is needed 
#                       to handle this event type).  If eventType is ALL_EVENTS, the associated callback function
#                       is called for all events not handled already. 
#
#   1.3    12-May-2013  (bm) Added MidiIn functions onNoteOn(), onNoteOff(), onSetInstrument()
#                       to specify callback functions to call when these MIDI events arrive.
#                       The rationale is that most MIDI applications will include code that
#                       handles these most-common MIDI events, so why require the end-programmer
#                       to always include the necessary "parsing" (if-else) code.  Let's hide this under
#                       the API abstraction.  For less-common MIDI messages, the end-programmer
#                       can still use the onInput() function to specify other callbacks for
#                       for different types of incoming MIDI messages.
#
import mididevices

if not mididevices.init():
    pass

ALL_EVENTS = -1
NOTE_ON    = 144   # 0x90
NOTE_OFF   = 128   # 0x80
SET_INSTRUMENT = 192   # 0xC0  (also known as MIDI program/patch change)

#################### MidiIn ##############################
#
# MidiIn is used to receive input from a MIDI device.
#
# This class may be instantiated several times to receive input from different MIDI devices
# by the same program.  Each MidiIn object is associated with a (callback) function to be called
# when a MIDI input event arrives from the corresponding MIDI device.  This function should
# accepts four integer parameters: msgType, msgChannel, msgData1, msgData2.  
#
# When instantiating, the constructor brings up a GUI with all available input MIDI devices.
#
# For example:
#
# midiIn = MidiIn()
#
# def processMidiEvent(msgType, msgChannel, msgData1, msgData2):
#   print "MIDI In - Message Type:", msgType, ", Channel:", msgChannel, ", Data 1:", msgData1, ", Data 2:", msgData2
#
# midiIn.onInput( ALL_EVENTS, processMidiEvent )   # register callback function to handle all input MIDI events
#
class MidiIn():

    def __init__(self):
        self.midiDevice = None
        self.showIncomingMessages = True
        self.eventHandlers = {}
        self.openme()
        
    def openme(self):
        midiDevice = mididevices.selectInput()
        if midiDevice is not None:
            self.midiDevice = midiDevice
            mididevices.setEventHandler(midiDevice, self.send)
            
    def send(self, m):
        msgType = (m[0] & 0xFF) >> 4     # get message type from byte array
        msgChannel = m[0] & 0x0F         # get message channel from byte array
        msgData1 = m[1]                  # get data 1 info from byte array
        msgData2 = -1                    # initialize data 2 to -1 if message doesn't contain data 2 info
        if len(m) > 2:                   # if message has data 2 info
            msgData2 = m[2]                  # get info from byte array

        # get eventType
        eventType = m[0] & 0xF0
        
        # normalize NOTE-OFF events (sometimes they are presented as NOTE_ON events with 0 velocity)
        if (eventType == NOTE_ON and msgData2 == 0):
           eventType = NOTE_OFF    # this is actually a NOTE_OFF event, so remember it as such
           
        # get callback function for this event (if any)
        eventHandler = None     # intialize
        if self.eventHandlers.has_key( eventType ):
            eventHandler = self.eventHandlers[ eventType ]
        elif self.eventHandlers.has_key( ALL_EVENTS ):
            eventHandler = self.eventHandlers[ ALL_EVENTS ]
            
        # call the event handler with the input message
        if eventHandler != None:
            eventHandler(eventType, msgChannel, msgData1, msgData2)

        # determine if we need to print out the message
        if self.showIncomingMessages:   # echo print incoming MIDI messages?
             print "(MidiIn) - Event Type:", eventType, ", Channel:", msgChannel, ", Data 1:", msgData1, ", Data 2:", msgData2
            
    def onNoteOn(self, function):
        """
        Set up a callback function to handle only noteOn MIDI input events.
        """
        self.eventHandlers[NOTE_ON] = function    

    def onNoteOff(self, function):
        """
        Set up a callback function to handle only noteOff MIDI input events.
        """
        self.eventHandlers[NOTE_OFF] = function    

    def onSetInstrument(self, function):
        """
        Set up a callback function to handle only setInstrument MIDI input events.
        """
        self.eventHandlers[SET_INSTRUMENT] = function    

    def onInput(self, eventType, function):
        """
        Associates an incoming event type with a callback function.  Can be used repeatedly to associate different
        event types with different callback functions (one function per event type).  If called more than once for the
        same event type, only the latest callback function is retained (the idea is that this function can contain all
        that is needed to handle this event type).  If eventType is ALL_EVENTS, the associated callback function is 
        called for all events not handled already.
        """
        self.eventHandlers[eventType] = function    # associate eventType with callback function

    def showMessages(self):
        """
        Turns on printing of incoming MIDI messages (useful for exploring what MIDI messages 
        are generated by a particular device).
        """
        self.showIncomingMessages = True

    def hideMessages(self):
        """
        Turns off printing of incoming MIDI messages.
        """
        self.showIncomingMessages = False
        
#################### MidiOut ##############################
#
# MidiOut is used to send output a MIDI device.
#
# This class may be instantiated several times to send output to different MIDI devices
# by the same program.  
#
# When instantiating, the constructor brings up a GUI with all available output MIDI devices.
# You may create several instances, one for every MIDI device you wish to send output to.
# Then, to output a MIDI message, call sendMidiMessage() with 4 parameters: msgType, msgChannel
# msgData1, msgData2.
#
# For example:
#
# midiOut = MidiOut()
#
# noteOn = 144   # msgType for starting a note
# noteOff = 128  # msgType for ending a note
# channel = 0    # channel to send message
# data1 = 64     # for NOTE_ON this is pitch
# data2 = 120    # for NOYE_ON this is velocity (volume)
#
# midiOut.sendMidiMessage(noteOn, channel, data1, data2)  # start note
# 
# midiOut.sendMidiMessage(noteOff, channel, data1, data2) # end note
# midiOut.sendMidiMessage(noteOn, channel, data1, 0)      # another way to end note (noteOn with 0 velocity)

# NOTE: The default synthesizer in Java 6 stops playing after a while, and then starts again.
#       One solution is to use Gervill with Java 6 - see http://stackoverflow.com/questions/7749172/why-java-midi-synth-on-mac-stop-playing-notes
#       Another solution is to use another software synthesizer, e.g., SimpleSynth - http://notahat.com/simplesynth/
#

class MidiOut():

    def __init__(self):
        self.midiDevice = None
        self.selectMidiOutput()
        
    def selectMidiOutput(self):
        midiDevice = mididevices.selectOutput()
        if midiDevice is not None:
            self.midiDevice = midiDevice
        
    def setInstrument(self, instrument, channel=0):
        """Sets 'channel' to 'instrument' through the selected output MIDI device.""" 
        
        self.sendMidiMessage(192, channel, instrument, 0)
        
    def noteOn(self, pitch, velocity=100, channel=0):
        """Send a NOTE_ON message for this pitch to the selected output MIDI device."""
            
        self.sendMidiMessage(144, channel, pitch, velocity)
      
    def noteOff(self, pitch, channel=0):
        """Send a NOTE_OFF message for this pitch to the selected output MIDI device."""
      
        self.sendMidiMessage(128, channel, pitch, 0)

    def playNote(self, pitch, start, duration, velocity=100, channel=0):
        cmd1 = 0x90 | channel
        cmd2 = 0x80 | channel
        mididevices.sendDataTimeout(self.midiDevice, [cmd1, pitch, velocity], start)
        mididevices.sendDataTimeout(self.midiDevice, [cmd2, pitch, 0], start + duration)
        
    ####### function to output MIDI message through selected output MIDI device ########
   
    def sendMidiMessage(self, msgType, msgChannel, msgData1, msgData2):
        if self.midiDevice is not None:
            cmd = msgType | msgChannel
            mididevices.sendData(self.midiDevice, [cmd, msgData1, msgData2])
