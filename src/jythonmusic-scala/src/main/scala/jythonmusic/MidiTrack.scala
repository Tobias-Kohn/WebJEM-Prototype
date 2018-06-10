package jythonmusic

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExport

/**
  * @author Tobias Kohn
  *
  * Created by Tobias Kohn on 25.06.2016.
  * Updated by Tobias Kohn on 25.06.2016.
  */
@JSExport
class MidiTrack {
  import MidiTrack._

  private[jythonmusic] var associated_channel: Int = -1

  private var instrument: String = "acoustic_grand_piano"
  private var instrumentLoaded: Boolean = false
  private var instrumentNumber: Int = 0
  private val noteBuffer = collection.mutable.ArrayBuffer[NoteItem]()

  private def normalizeInstrumentName(name: String): String =
    name.toLowerCase.replace('-', '_').replace(' ', '_').replace("__", "_")

  @JSExport
  var volume = 127

  @JSExport
  def getInstrument: String = instrument

  @JSExport
  def getInstrumentNumber: Int = instrumentNumber

  @JSExport
  def setInstrument(instrumentName: String): Unit = {
    instrument = normalizeInstrumentName(instrumentName)
    instrumentNumber = MIDI.GM.byName(instrument).number
    instrumentLoaded = false
    if (associated_channel >= 0)
      loadInstrument(associated_channel)
  }

  @JSExport
  def isInstrumentLoaded = instrumentLoaded

  @JSExport
  def loadInstrument(channel: Int): Unit = {
    MIDI.loadPlugin(MidiPluginParameter.forInstrument(instrument, ()=>{
      MIDI.programChange(channel, instrumentNumber)
      MIDI.setVolume(channel, volume)
      instrumentLoaded = true
    }))
  }

  def loadInstrumentAndCall(channel: Int, feedback: ()=>Unit): Unit = {
    MIDI.loadPlugin(MidiPluginParameter.forInstrument(instrument, ()=>{
      MIDI.programChange(channel, instrumentNumber)
      MIDI.setVolume(channel, volume)
      instrumentLoaded = true
      feedback()
    }))
  }

  @JSExport
  def addChord(chord: js.Array[Int], velocity: Int, duration: Double): Unit =
    noteBuffer += Chord(chord, velocity, duration)

  @JSExport
  def addNote(note: Int, velocity: Int, duration: Double): Unit =
    noteBuffer += Note(note, velocity, duration)

  @JSExport
  def addRest(duration: Double): Unit =
    noteBuffer += Rest(duration)

  @JSExport
  def writeToChannel(channel: Int, startDelay: Double): Unit =
    if (0 <= channel && channel < 16 && noteBuffer.nonEmpty) {
      var delay: Double = startDelay
      for (noteItem <- noteBuffer)
        noteItem match {
          case Chord(notes, velocity, duration) =>
            MIDI.chordOn(channel, notes, velocity, delay)
            MIDI.chordOff(channel, notes, delay + duration)
            delay += duration
          case Note(note, velocity, duration) =>
            MIDI.noteOn(channel, note, velocity, delay)
            MIDI.noteOff(channel, note, delay + duration)
            delay += duration
          case Rest(duration) =>
            delay += duration
        }
    }
}
object MidiTrack {
  abstract class NoteItem {
    def duration: Double
  }
  case class Chord(notes: js.Array[Int], velocity: Int, duration: Double) extends NoteItem
  case class Note(note: Int, velocity: Int, duration: Double) extends NoteItem
  case class Rest(duration: Double) extends NoteItem
}
