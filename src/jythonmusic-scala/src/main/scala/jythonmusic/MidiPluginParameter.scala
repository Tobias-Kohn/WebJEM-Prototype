package jythonmusic

import scala.scalajs.js

/**
  * @author Tobias Kohn
  *
  * Created by Tobias Kohn on 25.06.2016.
  * Updated by Tobias Kohn on 25.06.2016.
  */
@js.native
trait MidiPluginParameter extends js.Object {
  def soundfontUrl: String = js.native
  def instrument: String = js.native
  def onsuccess: js.Function0[Unit] = js.native
}
object MidiPluginParameter {

  def apply(soundfontUrl: String, instrument: String, onsuccess: js.Function0[Unit]): MidiPluginParameter =
    js.Dynamic.literal(soundfontUrl = soundfontUrl,
      instrument = instrument,
      onsuccess = onsuccess).asInstanceOf[MidiPluginParameter]

  def forInstrument(instrument: String, onsuccess: js.Function0[Unit] = ()=>{}): MidiPluginParameter =
    apply("./soundfont/", instrument, onsuccess)
}


