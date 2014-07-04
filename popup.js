var saveOption = function(value) {
    chrome.storage.sync.set({
        'settings': value
    }, function() {
        chrome.tabs.query({
            'url': '*://vk.com/*'
        }, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.executeScript(tabs[i].id, {
                    file: "vk-observer.js"
                });
            }
        });
    });
};

var getOption = function() {
    var storage = chrome.storage.sync;
    var toggleCache = document.querySelector('.toggle-cache');
    var toggleBitrate = document.querySelector('.toggle-bitrate');
    storage.get('settings', function(data) {
        var state = data.settings;
        var defaultSettings = {
            "bitrate": 'enabled',
            "cache": 'enabled'
        };
        if (state == undefined) {
            chrome.storage.sync.clear();
            saveOption(defaultSettings);
        }
        if (state.cache == 'enabled') {
            toggleCache.checked = true;
        }
        if (state.cache == 'disabled') {
            toggleCache.checked = false;
        }
        if (state.bitrate == 'enabled') {
            toggleBitrate.checked = true;
        }
        if (state.bitrate == 'disabled') {
            toggleBitrate.checked = false;
        }
    });
};

window.onload = function() {
    var switcherCache = document.querySelector('.switcher-cache');
    var toggleCache = document.querySelector('.toggle-cache');
    var switcherBitrate = document.querySelector('.switcher-bitrate');
    var toggleBitrate = document.querySelector('.toggle-bitrate');

    var changeCache = function(event) {
        var storage = chrome.storage.sync;
        var bitrateStatus = '';
        if (toggleBitrate.checked == true) {
            bitrateStatus = 'enabled';
        } else {
            bitrateStatus = 'disabled';
        }

        storage.get('settings', function(data) {
            var state = data.settings;
            if (state.cache == 'enabled') {
                toggleCache.checked = false;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": 'disabled'
                });
            }
            if (state.cache == 'disabled') {
                toggleCache.checked = true;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": 'enabled'
                });
            }
        });
    };

    var changeBitrate = function(event) {
        var storage = chrome.storage.sync;
        var cacheStatus = '';
        if (toggleCache.checked == true) {
            cacheStatus = 'enabled';
        } else {
            cacheStatus = 'disabled';
        }
        console.log('clicked' + toggleBitrate.checked);
        storage.get('settings', function(data) {
            var state = data.settings;
            if (state.bitrate == 'enabled') {
                toggleBitrate.checked = false;
                saveOption({
                    "bitrate": 'disabled',
                    "cache": cacheStatus
                });
            }
            if (state.bitrate == 'disabled') {
                toggleBitrate.checked = true;
                saveOption({
                    "bitrate": 'enabled',
                    "cache": cacheStatus
                });
            }
        });
    };

    getOption();
    switcherCache.addEventListener('click', changeCache, false);
    switcherBitrate.addEventListener('click', changeBitrate, false);
}