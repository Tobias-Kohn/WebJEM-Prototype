var markerId = null;
var tooltip = null;

var sendDataToURL = function(url, data, onSuccess) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && onSuccess)
            onSuccess();
    };
    xhr.send(JSON.stringify(data));
};

var sendTextToURL = function(url, data, onSuccess) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && onSuccess)
            onSuccess();
    };
    xhr.send(data);
};

var getDataFromURL = function(url, onReceive) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            onReceive(data);
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
};

var getTextFromURL = function(url, onReceive) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            onReceive(this.responseText);
        } else
        if (this.readyState == 4) {
            console.log(this.status);
        }
    };
    xhr.open('GET', url, true);
    xhr.send();
};

function showError(line, offset, err) {
	console.log(line);
	console.log(offset);
	console.log(err);
	if (markerId != null)
		editor.session.removeMarker(markerId);
	editor.gotoLine(line+1);
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

var outputClear = function() {
    var mypre = document.getElementById("output");
    mypre.innerHTML = '';
};

var outputPrint = function(text) {
    var mypre = document.getElementById("output");
    mypre.innerHTML = mypre.innerHTML + text;
    mypre.scrollTop = mypre.scrollHeight;
};

var outputPrintError = function(err) {
	var s = err.toString();
	if (!s.startsWith("TimeLimitError: Program exceeded run time limit.")) {
		console.log(s);
		var mypre = document.getElementById("output");
		mypre.innerHTML = mypre.innerHTML + "<span style='color: #F77;'>"+s+"</span><br/>";
	    var idx = s.indexOf(" on line ");
		if (idx > 0) {
			var lineNum = s.substring(idx + 9) | 0;
			if (lineNum > 0) {
				showError(lineNum-1, 0, s);
				return;
			}
		}
		window.focus();
	}
};

var outputStartRun = function() {
    console.log("Starting program...");
};

var outputStopRun = function() {
    console.log("Program stopped");
};

var runWindow;

var openRunWindow = function() {
    outputClear();
    runWindow = window.open("run.html", "JEM online",'width=800, height=600');
    runWindow.textFromParent = editor.getValue();
    runWindow.outputFunction = {
        'clear': outputClear,
        'print': outputPrint,
        'start': outputStartRun,
        'stop': outputStopRun,
        'error': outputPrintError
    };
    runWindow.addEventListener('load', function(){
      runWindow.focus();
      runWindow.runProgram();
    }, true);
}

var runAll = function() {
    stopAll();
    openRunWindow();
    editor.focus();
};

var stopAll = function() {
    if (runWindow) {
        runWindow.close();
    }
    editor.focus();
};

var newDocument = function() {
    editor.setValue("");
    document.getElementById("file-name").value = "";
    document.getElementById("learn-more-link").style.display = "none";
    editor.focus();
};

var saveDocument = function() {
    var data = editor.getValue();
    var blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    var name = document.getElementById("file-name").value;
    if (name == "") {
        name = "JythonMusic example.py";
    }
    saveAs(blob, name);
}

var showElement = function(id) {
    document.getElementById(id).style.display = 'block';
};

var hideElement = function(id) {
    document.getElementById(id).style.display = 'none';
};

var _currentWorkspace = undefined;

var selectWorkspace = function(id) {
    if (_currentWorkspace != undefined) {
        hideElement(_currentWorkspace + "-subitems");
    }
    _currentWorkspace = id;
    showElement(_currentWorkspace + "-subitems");
};

var selectInitialWorkspace = function(id) {
    _currentWorkspace = id;
    showElement(_currentWorkspace + "-subitems");
};

var selectDocument = function(id, name) {
    if (id && name && id != "" && name != "") {
		console.log("SELECT");
        enableEditor();
        //var url = window.location.origin + "/examples/" + id + ".py";
		var url = "examples/" + id + ".py";
		console.log(url);
        getTextFromURL(url, function(text) {
            editor.setValue(text);
            editor.gotoLine(1);
            document.getElementById("file-name").value = name;
            var learnMore = document.getElementById("learn-more-link");
            var url = _moreInfoUrls[id];
            if (url && (url.startsWith("https://jythonmusic.me/") || url.startsWith("https://console.ng.bluemix.net/catalog/") ||
                        url.startsWith("http://www.skulpt.org/"))) {
                learnMore.href = url;
                learnMore.style.display = "inline";
            } else {
                learnMore.style.display = "none";
            }
            editor.focus();
        });
    } else {
        newDocument();
    }
};

var extSelectDocument = function(id) {
    var element = document.getElementById(id + "-docItem");
    if (element) {
        var name = element.getAttribute("tooltip");
        var chapter = element.getAttribute("chapter");
        if (chapter && name) {
            selectWorkspace(chapter);
            selectDocument(id, name);
        }
    }
};

var showWelcome = function() {
    disableEditor();
};

var enableEditor = function() {
    var wrapperW = document.getElementById("welcome-wrapper");
    wrapperW.style.display = "none";
    var wrapperE = document.getElementById("editor-wrapper");
    wrapperE.style.display = "block";
    editor.focus();
}

var disableEditor = function() {
    var wrapperE = document.getElementById("editor-wrapper");
    wrapperE.style.display = "none";
    var wrapperW = document.getElementById("welcome-wrapper");
    wrapperW.style.display = "block";
}