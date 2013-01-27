var data = require("self").data;
var pagemod = require("page-mod");
var panel = require("panel");
var storage = require("storage").storage;
var tabs = require("tabs");
var widget = require("widget");

var utils = require("utils");


var workers = [];

function printWorkers() {
    console.log("workers list now: " + workers.map(function(w) {
        try {
            return w.passhashUrl;
        } catch(e) {
            return "(oops)";
        }
    }).join());
}

function removeWorker(worker) {
    var idx = workers.indexOf(worker);

    console.log("removing worker");

    if (idx != -1) {
	console.log("found it");
        workers.splice(idx, 1);
    }
    printWorkers();
}

function refreshTabs() {
    var badworkers = [];

    workers.forEach(function(worker) {
        try {
            var config = storage.loadConfig(worker.passhashUrl);

	    worker.port.emit('urlconfig', {update: config});
	} catch (e) {
	    badworkers.push(worker);
	}
    });

    badworkers.forEach(function(worker) {
	removeWorker(worker);
    });
}


var hash_panel = panel.Panel({
    contentURL: "about:blank",
    onHide: function() {
	hash_panel.contentURL = "about:blank";
    }
});
hash_panel.port.on("loadcfg", function(msg) {
    var url = tabs.activeTab.url;

    url = utils.grepUrl(url);
    hash_panel.port.emit("config", {url: url,
				    config: storage.loadConfig(url),
				    tags: storage.loadTags()});
});
hash_panel.port.on('savecfg', function(msg) {
    storage.saveConfig(msg.url, msg.config);
    refreshTabs();
});
hash_panel.port.on("optionstab", function() {
    hash_panel.hide();
    tabs.open({
        url: data.url("html/options.html")
    });
});


var hash_wiget = widget.Widget({
    id: "passwordhasherplus",
    label: "Password Hasher",
    contentURL: data.url("images/passhash.png"),
    panel: hash_panel,
    onClick: function() {
	hash_panel.contentURL = data.url("html/popup.html");
    }
});


var opt_mod = pagemod.PageMod({
    include: data.url("html/options.html"),
    contentScriptFile: [data.url("lib/compat.js"),
                        data.url("../lib/utils.js"),
                        data.url("lib/common.js"),
                        data.url("lib/jquery-1.7.1.min.js"),
                        data.url("lib/options.js")],
    onAttach: function(hash_tab) {
	hash_tab.port.on("loadopts", function() {
	    hash_tab.port.emit("options", {options: storage.loadOptions()});
	});
	hash_tab.port.on("saveopts", function(msg) {
	    storage.saveOptions(msg.options);
	    refreshTabs();
	});
	hash_tab.port.on("loadstorage", function() {
	    hash_tab.port.emit("storage", {entries: storage});
	});
	hash_tab.port.on("setstorage", function(msg) {
	    storage.setStorage(msg.entries);
	    refreshTabs();
	});
	hash_tab.port.on("cleanupstorage", function() {
	    storage.collectGarbage();
	});
    }
});


var hash_pagemod = pagemod.PageMod({
    include: ["http://*", "https://*"],
    contentScriptFile: [data.url("lib/compat.js"),
			data.url("lib/jquery-1.7.1.min.js"),
			data.url("lib/jquery.qtip.min.js"),
			data.url("lib/sha1.js"),
			data.url("lib/passhashcommon.js"),
			data.url("../lib/utils.js"),
			data.url("lib/common.js"),
			data.url("lib/content-script.js")],
    contentStyleFile: [data.url("css/jquery.qtip.min.css"),
		       data.url("css/styles.css")]
});

hash_pagemod.on('attach', function(worker) {
    var url = utils.grepUrl(worker.url);
    worker.passhashUrl = url;

    worker.port.on("loadurlconfig", function(msg) {
	var config = storage.loadConfig(url);

	console.log("worker attaching to " + url);
	if (workers.indexOf(worker) == -1) {
	    console.log("BAM!");
	    workers.push(worker);
	}
	printWorkers();
	worker.port.emit('urlconfig', {init: true, update: config});
    });
    worker.port.on("saveurlconfig", function(msg) {
	storage.saveConfig(url, msg.config);
	refreshTabs();
    });
    worker.on('detach', function() {
	console.log("detaching worker");
	removeWorker(worker);
    });
});
