# WebJEM-Prototype

_This is a case study/prototype for a web-based version of JEM._

Additional information might be found in the blog entry [Creating an Online Python Environment](https://tobiaskohn.ch/index.php/2017/03/15/creating-an-online-python-environment/).

Please note that the web application might not be supported by all browsers. We have successfully run it in Chrome and Firefox.


## What is JEM

JEM stands for _Jython Environment for Music_ and is part of the [_Making Music with Computers_-project](https://jythonmusic.me/). The focus of this project is to teach programming through making music, unleashing the creativity, curiosity, and potential of the students. In order to do so, JEM provides a simple editor, bundled with [Jython](http://www.jython.org/) and a set of highly sophisticated libraries for composing, transforming, and playing MIDI music.

The present _WebJEM_-Prototype grew out of a case study if the JEM environment could be ported to a browser-based web application. Originally, it also had a backend that run on IBM's cloud, but the core features of WebJEM do not require a server beyond a simple http-server.


## Frameworks

The WebJEM project is based on, and requires, the following frameworks:
- [Skulpt](http://www.skulpt.org/) ([@GitHub](https://github.com/skulpt/skulpt)) is used to run Python code client-side (inside the browser).
- [MIDI.js](https://github.com/mudcube/MIDI.js/) is a JavaScript-library for playing, and interacting with MIDI. It cannot only play MIDI sounds, but also supports connecting to external MIDI-devices.
- [MIDI.js Soundfonts](https://github.com/gleitz/midi-js-soundfonts) is a collection of sound-fonts, necessary for MIDI to play various instruments.
- [ACE](https://ace.c9.io/) ([@GitHub](https://github.com/ajaxorg/ace)) is used as the browser-based editor of choice.


## Structure

Since this is a prototype/case study, it is not a completely coherent project adhering to rigorous software engineering standards. Parts of the project were written in JavaScript and Python, other parts are written in Scala and compiled to JavaScript using [scala.js](https://www.scala-js.org/).

The web application offers a set of examples of Python programs. In the original project, these examples were added to _index.html_ dynamically by the server-backend. In order to run without such a backend, we have included all links to the examples statically, which, unfortunately, led to an unwieldy large file.

**release**  
This folder contains the entire web application [as it is currently run](https://jem.tobiaskohn.ch/), except for the soundfonts. You will have to fetch them directly from [MIDI.js Soundfonts](https://github.com/gleitz/midi-js-soundfonts).

**src**  
The sources used for the project. This is mostly the libraries added to Skulpt, as well as some _glue code_ written in Scala. The Skulpt libraries need to be put into Skulpt's _Lib_-folder, before Skulpt is compiled to a JavaScript-library.


## Acknowledgment

The present WebJEM-project is part of a larger project, that was funded by IBM (US).


## Contributors

- [Tobias Kohn](https://tobiaskohn.ch)
- [Bill Manaris](https://blogs.cofc.edu/manaris/)
