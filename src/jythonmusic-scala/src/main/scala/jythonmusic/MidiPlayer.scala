package jythonmusic

import scala.scalajs.js.annotation.JSExport
import scala.scalajs.js

/**
  * @author Tobias Kohn
  *
  * Created by Tobias Kohn on 25.06.2016.
  * Updated by Tobias Kohn on 25.06.2016.
  */
@JSExport
object MidiPlayer {

  private val midiTracks = collection.mutable.ArrayBuffer[MidiTrack]()
  private var startTime: Double = 0.0

  @JSExport
  def initialize(): Unit = {
    startTime = js.Date.now()
  }

  @JSExport
  def addTrack(track: MidiTrack): Unit =
    if (track != null && midiTracks.length < 9) {
      val channel = midiTracks.length
      track.associated_channel = channel
      track.loadInstrument(channel)
      midiTracks += track
    }

  @JSExport
  def clearTracks(): Unit = {
    for (track <- midiTracks)
      track.associated_channel = -1
    midiTracks.clear()
  }

  @JSExport
  def tracksLoaded(): Boolean = {
    for (track <- midiTracks)
      if (!track.isInstrumentLoaded)
        return false
    true
  }

  @JSExport
  def stop(): Unit =
    MIDI.stopAllNotes()

  @JSExport
  def playTracks(delay: Double): Unit = {
    val startDelay =
      if (startTime > 0.0)
        (js.Date.now() - startTime) / 1000
      else
        0
    for (track <- midiTracks)
      if (track.associated_channel >= 0)
        track.writeToChannel(track.associated_channel, startDelay + delay)
  }

  @JSExport
  def loadAndPlayTracks(tracks: js.Array[MidiTrack]): Unit = {
    var loadingCount = tracks.length
    def trackLoaded(): Unit = {
      loadingCount -= 1
      if (loadingCount == 0)
        playTracks(0.01)
    }
    clearTracks()
    for (track <- tracks) {
      val channel = midiTracks.length
      midiTracks += track
      track.associated_channel = channel
      track.loadInstrumentAndCall(channel, trackLoaded)
    }
  }
}
