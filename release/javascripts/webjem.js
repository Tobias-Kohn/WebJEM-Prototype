var baseURL = window.location.origin;

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

var sendData = function(data) {
    var url = window.location.origin + "/updatesession";
    console.log("Sending...");
    console.log(url);
    console.log(data);
    sendDataToURL(url, data);
};

var sendDataAndReload = function(data) {
    var url = window.location.origin + "/updatesession";
    console.log("Sending...");
    console.log(url);
    console.log(data);
    sendDataToURL(url, data, function() {
        location.reload();
    });
};

var getData = function(param, onReceive) {
    var url = window.location.origin + "/updatesession";
    if (name != undefined)
      url = url + "?name=" + name;
    getDataFromURL(url, onReceive);
};

var lock_text = 0;

var updateText = function(f) {
    lock_text += 1;
    try {
        f();
    } finally {
        lock_text -= 1;
    }
};

var openEditSocket = function(url, docId) {
    var ws = new WebSocket(url);
    ws.onopen = function() {
        console.log("Connection has been established!");
        ws.send("#"+docId+"#");
    }
    ws.onmessage = function(msg) {
        var data = JSON.parse(msg.data);
        if ("action" in data) {
            lock_text += 1;
            try {
                editor.getSession().doc.applyDelta(data);
            } finally {
                lock_text -= 1;
            }
        } else
        if ("message" in data) {
            if (data.message == 'settext') {
                lock_text += 1;
                try {
                    editor.setValue(data.text, 1);
                } finally {
                    lock_text -= 1;
                }
            } else
            if (data.message == 'applydeltas') {
                lock_text += 1;
                try {
                    editor.getSession().doc.applyDeltas(data.deltas);
                } finally {
                    lock_text -= 1;
                }
            }
        }
    }
    editor.getSession().on("change", function(e) {
        if (lock_text == 0) {
            var raw_data = JSON.stringify(e);
            ws.send(raw_data);
        }
    });
    return ws;
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
    sendData({ 'message': 'selectWorkspace', 'id': id });
};

var selectInitialWorkspace = function(id) {
    _currentWorkspace = id;
    showElement(_currentWorkspace + "-subitems");
};

var selectDocument = function(id) {
    window.location.href = window.location.origin + "/edit?docId=" + id;
};

var createDocument = function(workspaceName, workspaceId) {
    var name = prompt("Enter of document in " + workspaceName + ":");
    if (name != null) {
        sendDataAndReload({ 'message': 'createDocument', 'name': name, 'space': workspaceId });
    }
};