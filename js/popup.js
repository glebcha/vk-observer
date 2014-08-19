var saveOption = function(value) {
    chrome.storage.sync.set({
        'settings': value
    }, function() {
        chrome.tabs.query({
            'url': '*://vk.com/*'
        }, function(tabs) {
            for (var z = 0; z < tabs.length; z++) {
                chrome.tabs.executeScript(tabs[z].id, {
                    file: "js/vk-observer.js"
                });
            }
        });
    });
};

var saveLastKeys = function(defaultKeys) {
    chrome.storage.sync.set({
        'lastkeys': defaultKeys
    }, function() {
            chrome.tabs.query({
                'url': '*://vk.com/*'
            }, function(tabs) {
            for (var k = 0; k < tabs.length; k++) {
                chrome.tabs.executeScript(tabs[k].id, {
                    file: "js/vk-observer.js"
                });
            }
        });
    });
};

var getOption = function() {
    var storage = chrome.storage.sync;
    var toggleCache = document.querySelector('.toggle-cache');
    var toggleBitrate = document.querySelector('.toggle-bitrate');
    var toggleScrobble = document.querySelector('.toggle-scrobble');
    storage.get('settings', function(data) {
        var state = data.settings;
        var defaultSettings = {
            "bitrate": 'enabled',
            "cache": 'enabled',
            "scrobble": 'disabled'
        };
        if (state === undefined || state.scrobble === undefined) {
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

        if (state.scrobble == 'enabled') {
            toggleScrobble.checked = true;
        }
        if (state.scrobble == 'disabled') {
            toggleScrobble.checked = false;
        }  

        
    });
    storage.get('lastkeys', function(data) {
        var keys = data.lastkeys;
        var defaultKeys = {
            "api": '488c3ca0fd22d7b5e8a0cd9650322d33',
            "secret": '783d2f7628431a0c954381cf3c342575'
        };
        if (keys === undefined) {
            saveLastKeys(defaultKeys);
        }
    });
};

window.onload = function() {
    var switcherCache = document.querySelector('.switcher-cache'),
        toggleCache = document.querySelector('.toggle-cache'),
        switcherBitrate = document.querySelector('.switcher-bitrate'),
        toggleBitrate = document.querySelector('.toggle-bitrate'),
        switcherScrobble = document.querySelector('.switcher-scrobble'),
        toggleScrobble = document.querySelector('.toggle-scrobble');

    var changeCache = function(event) {
        var storage = chrome.storage.sync;
        var bitrateStatus = '';
        var scrobbleStatus = '';
        if (toggleBitrate.checked == true) {
            bitrateStatus = 'enabled';
        } else {
            bitrateStatus = 'disabled';
        }

        if (toggleScrobble.checked == true) {
            scrobbleStatus = 'enabled';
        } else {
            scrobbleStatus = 'disabled';
        }

        storage.get('settings', function(data) {
            var state = data.settings;
            if (state.cache == 'enabled') {
                toggleCache.checked = false;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": 'disabled',
                    "scrobble": scrobbleStatus
                });
            }
            if (state.cache == 'disabled') {
                toggleCache.checked = true;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": 'enabled',
                    "scrobble": scrobbleStatus
                });
            }
        });
    };

    var changeBitrate = function(event) {
        var storage = chrome.storage.sync;
        var cacheStatus = '';
        var scrobbleStatus = '';
        if (toggleCache.checked == true) {
            cacheStatus = 'enabled';
        } else {
            cacheStatus = 'disabled';
        }

        if (toggleScrobble.checked == true) {
            scrobbleStatus = 'enabled';
        } else {
            scrobbleStatus = 'disabled';
        }

        storage.get('settings', function(data) {
            var state = data.settings;
            if (state.bitrate == 'enabled') {
                toggleBitrate.checked = false;
                saveOption({
                    "bitrate": 'disabled',
                    "cache": cacheStatus,
                    "scrobble": scrobbleStatus
                });
            }
            if (state.bitrate == 'disabled') {
                toggleBitrate.checked = true;
                saveOption({
                    "bitrate": 'enabled',
                    "cache": cacheStatus,
                    "scrobble": scrobbleStatus
                });
            }
        });
    };

    var changeScrobble = function(event) {
        var storage = chrome.storage.sync;
        var cacheStatus = '';
        var bitrateStatus = '';
        if (toggleCache.checked == true) {
            cacheStatus = 'enabled';
        } else {
            cacheStatus = 'disabled';
        }

        if (toggleBitrate.checked == true) {
            bitrateStatus = 'enabled';
        } else {
            bitrateStatus = 'disabled';
        }

        storage.get('settings', function(data) {
            var state = data.settings;
            if (state.scrobble == 'enabled') {
                toggleScrobble.checked = false;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": cacheStatus,
                    "scrobble": 'disabled'
                });
            }
            if (state.scrobble == 'disabled') {
                toggleScrobble.checked = true;
                saveOption({
                    "bitrate": bitrateStatus,
                    "cache": cacheStatus,
                    "scrobble": 'enabled'
                });
            }
        });

        storage.get('lastsession', function(data) {
            var sessionKey = data.lastsession;
            var apiKey = '488c3ca0fd22d7b5e8a0cd9650322d33';
            var apiUrl = 'http://www.lastfm.ru/api/auth?api_key=' + apiKey;
             
            if (sessionKey === undefined) {
                chrome.tabs.create({url:apiUrl});
            }

        });

    };

    getOption();
    switcherCache.addEventListener('click', changeCache, false);
    switcherBitrate.addEventListener('click', changeBitrate, false);
    switcherScrobble.addEventListener('click', changeScrobble, false);
}