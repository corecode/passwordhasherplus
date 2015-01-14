var compat = {};

if (typeof(chrome) !== "undefined" && typeof(chrome.extension) !== "undefined") {
    compat.port = new function() {
	var port = chrome.extension.connect ({name: "passhash"});

	this.emit = function(msg) {
	    port.postMessage(msg);
	};

	this.onMsg = function(who) {
	    port.onMessage.addListener(who);
	};
    };

    compat.loadUrlConfig = function() {
	compat.port.emit({init: true, url: location.href});
    };

    compat.saveUrlConfig = function(config) {
        compat.port.emit({url: location.href, save: config});
    };

    compat.onRecvConfig = function(cb) {
	compat.port.onMsg(cb);
    };

    compat.loadConfig = function(cb) {
        chrome.tabs.getSelected (null, function (tab) {
            var bgp = chrome.extension.getBackgroundPage();
            var url_ = bgp.grepUrl(tab.url);
            var config_ = bgp.loadConfig(url_);
            var tags_ = bgp.loadTags();

            cb(url_, config_, tags_);
	});
    };

    compat.saveConfig = function(url, config) {
	chrome.extension.getBackgroundPage().saveConfig(url, config);
    };

    compat.loadOptions = function(cb) {
        cb(localStorage.loadOptions());
    };

    compat.saveOptions = function(options, cb) {
        chrome.extension.getBackgroundPage().saveOptions(options);
	cb();
    };

    compat.loadStorage = function(cb) {
        var entries = {};
        var keys = toArray(localStorage);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = localStorage.getItem(key);
            var entry = {}
            if (key.slice(0, 7) == "option:") {
                entries[key] = value;
            } else {
                try {
                    entries[key] = JSON.parse(value);
                } catch (e) {
                    entries[key] = "BAD: " + value
                }
            }
	}
	cb(entries);
    };

    compat.setStorage = function(data, cb) {
        localStorage.clear();
        for (var key in data) {
            var value = data[key];
            if (key.slice(0, 7) != "option:") value = JSON.stringify(value);
            localStorage.setItem(key, value);
        }
        localStorage.migrate();
	cb();
    };

    compat.cleanupStorage = function(cb) {
	localStorage.collectGarbage();
	cb();
    };

    compat.createOptionsTab = function() {
        chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/data/html/options.html'});
    };

    compat.createOptionsTab = function() {
	chrome.tabs.create({url:'chrome-extension://'+location.hostname+'/data/html/passhashplus.html?tag=' + $('#tag').val()});
    };
} else {
    var port;

    if (typeof(addon) !== 'undefined' && typeof(addon.port) !== 'undefined') {
	port = addon.port;
    } else {
	port = self.port;
    }

    compat.port = new function() {
	this.emit = function(msg) {
	    port.emit("msg", msg);
	};

	this.onMsg = function(who) {
	    port.on("msg", who);
	};
    };

    compat.loadUrlConfig = function() {
	port.emit("loadurlconfig");
    };

    compat.saveUrlConfig = function(config) {
        port.emit("saveurlconfig", {config: config});
    };

    compat.onRecvConfig = (function() {
	var cb;

	port.on("urlconfig", function(msg) {
	    if (typeof(cb) === 'function') {
		cb(msg);
	    }
	});

	return function(cb_) {
	    cb = cb_;
	};
    })();

    compat.loadConfig = (function() {
	var cb;

        port.on("config", function(msg) {
            if (typeof(cb) === 'function') {
		cb(msg.url, msg.config, msg.tags);
	    }
	});

        return function(cb_) {
	    cb = cb_;
            port.emit("loadcfg");
	};
    })();

    compat.saveConfig = function(url, config) {
	port.emit("savecfg", {url: url, config: config});
    };

    compat.loadOptions = (function() {
	var cb;

	port.on("options", function(msg) {
	    if (typeof(cb) === 'function') {
		cb(msg.options);
	    }
	});

	return function(cb_) {
	    cb = cb_;
	    port.emit("loadopts");
	};
    })();

    compat.saveOptions = function(options, cb) {
	port.emit("saveopts", {options: options});
	cb();
    };

    compat.loadStorage = (function() {
	var cb;

	port.on("storage", function(msg) {
	    if (typeof(cb) === 'function') {
		cb(msg.entries);
	    }
	});

	return function(cb_) {
	    cb = cb_;
	    port.emit("loadstorage");
	};
    })();

    compat.setStorage = function(data, cb) {
	port.emit("setstorage", {entries: data});
        cb();
    };

    compat.cleanupStorage = function(cb) {
	port.emit("cleanupstorage");
	cb();
    };

    compat.createOptionsTab = function() {
	port.emit("optionstab");
    };
}
