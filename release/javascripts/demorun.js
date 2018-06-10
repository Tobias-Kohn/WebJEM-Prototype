function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
		throw "File not found: '" + x + "'";
	}
    return Sk.builtinFiles["files"][x];
}

function runProgram() {
    setTimeout(doRunProgram, 100);
}

function outf(text) {
    outputFunction['print'](text);
    var mypre = document.getElementById("output");
    mypre.innerHTML = mypre.innerHTML + text;
    mypre.scrollTop = mypre.scrollHeight;
}

function doRunProgram() {
    var prog = textFromParent;
	Sk.execLimit = 0;
    Sk.configure({
        output: outf, //outputFunction['print'],
        read: builtinRead,
		execLimit: Number.POSITIVE_INFINITY
    });
    Sk.debugging = true;
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
		outputFunction['start']();
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function(mod) {
        console.log('success');
		outputFunction['stop']();
    },
    function(err) {
		console.log('error: ' + err);
		outputFunction['error'](err);
        outputFunction['stop']();
        window.close();
    });
}
