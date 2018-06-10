var markerId = null;
var tooltip = null;


function loadPythonModule(name) {
  var xhttp = new XMLHttpRequest();
  var result = null;
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
	  result = xhttp.responseText;
    }
  };
  xhttp.open("GET", "/webjem/" + name, false);
  xhttp.send();
  return result;
}

function postPythonModule(name, prog) {
  var xhttp = new XMLHttpRequest();
  var result = null;
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
	  result = xhttp.responseText;
	  console.log(result);
    }
  };
  console.log("Sending: " + name);
  xhttp.open("POST", "deploy.php?name=" + name + ".py", true);
  xhttp.setRequestHeader("Content-type", "text/plain");
  xhttp.send(name + "\n" + prog);
  //return result;
}

function deploy() {
	var prog = editor.getValue();
	var nameEdit = document.getElementById("name_edit");
	postPythonModule(nameEdit.value, prog);
	window.open("http://bmp.tobiaskohn.ch/apps/" + nameEdit.value + ".html", "_blank");
	editor.focus();
}

function outf(text) {
   var mypre = document.getElementById("output");
   mypre.innerHTML = mypre.innerHTML + text;
   mypre.scrollTop = mypre.scrollHeight;
}

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
	    if (x.startsWith("src/") && x.endsWith(".py") && !x.startsWith("src/builtin/")) {
			var result = loadPythonModule(x.substring(4));
			if (result != null)
				return result;
		} else 
		if (x.startsWith("src/")) {
			var result = loadPythonModule(x.substring(4));
			if (result != null)
				return result;
		}
		throw "File not found: '" + x + "'";
	}
    return Sk.builtinFiles["files"][x];
}

function showError(err) {
	var s = err.toString();
	if (!s.startsWith("TimeLimitError: Program exceeded run time limit.")) {
		console.log(s);
	    var idx = s.indexOf(" on line ");
		if (idx > 0) {
			var lineNum = s.substring(idx + 9) | 0;
			if (lineNum > 0) {
				showError2(lineNum-1, 0, s);
				return;
			}
		}
		alert(err);
	}
}

function showError2(line, offset, err) {
	console.log(line);
	console.log(offset);
	console.log(err);
	if (markerId != null)
		editor.session.removeMarker(markerId);
	var Range = ace.require("ace/range").Range;
	markerId = editor.session.addMarker(new Range(line, 0, line+1, 0), 'error', 'line');
	if (tooltip != null) {
	    tooltip.parentElement.removeChild(tooltip);
		tooltip = null;
	}
	var lineHeight = editor.renderer.lineHeight;
	tooltip = document.createElement("div");
	tooltip.id = "error-tooltip";
	tooltip.innerHTML = err;
	var coords = editor.renderer.textToScreenCoordinates(line, offset);
	var editElement = document.getElementById("editor");
	tooltip.style.left = "12px";
	tooltip.style.top = (coords.pageY - editElement.getBoundingClientRect().top + lineHeight + 2) + "px";
	editElement.appendChild(tooltip);
	editor.focus();
}

function runProgram() {
	var prog = document.getElementById("editor").innerHTML;
    var mypre = document.getElementById("output");
    mypre.innerHTML = '';
	Sk.execLimit = 0; 
    Sk.configure({output:outf,
           read: builtinRead,
		   execLimit: Number.POSITIVE_INFINITY
    });
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";
	Sk.canvas = "mycanvas";
    var can = document.getElementById(Sk.canvas);
    can.style.display = 'block';
    if (can) {
	   can.width = can.width;
	   if (Sk.tg) {
		   Sk.tg.canvasInit = false;
		   Sk.tg.turtleList = [];
	   }
    }
    var myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
    },
    function(err) {
		console.log(err);
		alert("An error occurred!\n" + err);
    });
}

function runAll() {
    var prog = editor.getValue();
    var mypre = document.getElementById("output");
    mypre.innerHTML = '';
	var syntaxError = tigerjython.tpyparser.Parser().checkSyntax(prog);
	if (syntaxError != null) {
	   var errorMsg = syntaxError.msg;
	   mypre.innerHTML = "<span style='color: #F77;'>"+errorMsg+"</span>";
	   var sel = editor.selection;
	   sel.selectTo(syntaxError.line, syntaxError.offset);
	   sel.clearSelection();
	   showError2(syntaxError.line, syntaxError.offset, syntaxError.msg);
	   editor.focus();
	   return;
	}
	Sk.execLimit = 0; 
    Sk.configure({output:outf,
           read: builtinRead,
		   execLimit: Number.POSITIVE_INFINITY
    });
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";
	Sk.canvas = "mycanvas";
    var can = document.getElementById(Sk.canvas);
    can.style.display = 'block';
    if (can) {
	   can.width = can.width;
	   if (Sk.tg) {
		   Sk.tg.canvasInit = false;
		   Sk.tg.turtleList = [];
	   }
    }
    var myPromise = Sk.misceval.asyncToPromise(function() {
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "running...";
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "";
	    editor.focus();
    },
    function(err) {
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "";
		showError(err);
    });
}

function isFollowLine(session, line) {
	var token = session.getTokens(line)[0].value;
	if (token.startsWith(" ") || token.startsWith("\t") || token.startsWith("#"))
		return true;
	if (token == "else" || token == "elif" || token == "except" || token == "finally")
		return true;
	return false;
}

function selectNext() {
	var session = editor.getSession();
    var sel = editor.selection;
	var doc = session.getDocument();
    sel.selectLineStart();
    sel.clearSelection();
    sel.selectLineEnd();
	var line = sel.getSelectionLead().row;
	var lineCount = doc.getLength();
	if (doc.getLine(line) == "") {
		sel.moveCursorDown();
		return selectNext();
	}
	if (line < lineCount) {
		var token = session.getTokens(line)[0].value;
		if (token == "if" || token == "while" || token == "for" || token == "def" || 
		    token == "class" || token == "try" || token == "with") {
			var l = line+1;
			while (l < lineCount && isFollowLine(session, l)) {
				sel.selectDown();
				l = l + 1;
			}
		}
		sel.selectLineEnd();
	} else
		sel.clearSelection();
}

function runSel() {
	if (editor.selection.isEmpty()) {
	    selectNext();
	}
    var prog = editor.session.getTextRange(editor.getSelectionRange());
    var mypre = document.getElementById("output");
    Sk.configure({output:outf,
           read: builtinRead,
		   retainglobals: true
              });
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";
	Sk.canvas = "mycanvas";
    var can = document.getElementById(Sk.canvas);
    can.style.display = 'block';
    if (can) {
	   can.width = can.width;
	   if (Sk.tg) {
		   Sk.tg.canvasInit = false;
		   Sk.tg.turtleList = [];
	   }
    }
    var myPromise = Sk.misceval.asyncToPromise(function() {
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "running...";
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "";
	    editor.selection.moveCursorDown();
	    selectNext();
	    editor.focus();
    },
    function(err) {
		var run_label = document.getElementById("run_label");
		run_label.innerHTML = "";
		showError(err);
    });
}
function runStop() {
	MIDI.stopAllNotes();
	Sk.configure({execLimit:0});
	editor.focus();
}
