package jythonmusic

import scala.scalajs.js
import scala.scalajs.js.annotation.JSBracketAccess

/**
  * @author Tobias Kohn
  *
  * Created by Tobias Kohn on 25.06.2016.
  * Updated by Tobias Kohn on 25.06.2016.
  */
@js.native
object MIDI extends js.Object {

  @js.native
  trait GMByName extends js.Object {
    def number: Int = js.native
  }

  @js.native
  object GM extends js.Object {
    @js.native
    object byName extends js.Object {
      @JSBracketAccess
      def apply(name: String): GMByName = js.native
    }
  }

  def noteOn(channel: Int, note: Int, velocity: Int, delay: Double): Unit = js.native
  def noteOff(channel: Int, note: Int, delay: Double): Unit = js.native
  def chordOn(channel: Int, chord: js.Array[Int], velocity: Int, delay: Double): Unit = js.native
  def chordOff(channel: Int, chord: js.Array[Int], delay: Double): Unit = js.native
  def setVolume(channel: Int, volume: Int): Unit = js.native
  def stopAllNotes(): Unit = js.native
  def loadPlugin(param: MidiPluginParameter): Unit = js.native
  def programChange(channel: Int, instrumentNumber: Int): Unit = js.native
}
