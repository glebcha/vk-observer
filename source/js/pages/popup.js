const storage = chrome.storage.sync;

let saveOption = (value) => {
    storage.set({'settings': value}, () => {
        chrome.tabs.query({'url': '*://vk.com/*'}, (tabs) => {
            tabs.forEach( (tab) => {
                chrome.tabs.executeScript(tab.id, {file: "js/vk-observer.js"});
            })
        });
    });
};

let saveLastKeys = (defaultKeys) => {
    storage.set({'lastkeys': defaultKeys}, () => {
        chrome.tabs.query({'url': '*://vk.com/*'}, (tabs) => {
            tabs.forEach( (tab) => {
                chrome.tabs.executeScript(tabs[k].id, {file: "js/vk-observer.js"});
            })
        });
    });
};

let getOption = () => {
    let toggleCache = document.querySelector('.toggle-cache'),
        toggleBitrate = document.querySelector('.toggle-bitrate'),
        toggleScrobble = document.querySelector('.toggle-scrobble');
    storage.get('settings', (data) => {
        let state = data.settings,
            defaultSettings = {
                "bitrate": 'enabled',
                "cache": 'enabled',
                "scrobble": 'disabled'
            };

        if (state === undefined || state.scrobble === undefined) {
            storage.clear();
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
    storage.get('lastkeys', (data) => {
        const keys = data.lastkeys;
        const defaultKeys = {
            "api": '488c3ca0fd22d7b5e8a0cd9650322d33',
            "secret": '783d2f7628431a0c954381cf3c342575'
        };
        if (keys === undefined) {
            saveLastKeys(defaultKeys);
        }
    });
};

window.onload = () => {
    let switcherCache = document.querySelector('.switcher-cache'),
        toggleCache = document.querySelector('.toggle-cache'),
        switcherBitrate = document.querySelector('.switcher-bitrate'),
        toggleBitrate = document.querySelector('.toggle-bitrate'),
        switcherScrobble = document.querySelector('.switcher-scrobble'),
        toggleScrobble = document.querySelector('.toggle-scrobble');

    let changeCache = (event) => {
        let bitrateStatus = '',
            scrobbleStatus = '';

        bitrateStatus = toggleBitrate.checked ? 'enabled' : 'disabled';
        scrobbleStatus = toggleScrobble.checked ? 'enabled' : 'disabled';

        storage.get('settings', (data) => {
            let state = data.settings,
                options = {
                    bitrate: bitrateStatus,
                    cache: 'enabled',
                    scrobble: scrobbleStatus
                };
            toggleCache.checked = true;
            if (state.cache === 'enabled') {
                toggleCache.checked = false;
                options.cache = 'disabled';
            }
            saveOption(options);
        });
    };

    let changeBitrate = (event) => {
        let cacheStatus = '',
            scrobbleStatus = '';

        cacheStatus = toggleCache.checked ? 'enabled' : 'disabled';
        scrobbleStatus = toggleScrobble.checked ? 'enabled' : 'disabled';

        storage.get('settings', function(data) {
            var state = data.settings,
                options = {
                    "bitrate": 'enabled',
                    "cache": cacheStatus,
                    "scrobble": scrobbleStatus
                };
            toggleBitrate.checked = true;
            if (state.bitrate === 'enabled') {
                toggleBitrate.checked = false;
                options.bitrate = 'disabled';
            }
            saveOption(options);
        });
    };

    let changeScrobble = (event) => {
        let cacheStatus = '',
            bitrateStatus = '';

        cacheStatus = toggleCache.checked ? 'enabled' : 'disabled';
        bitrateStatus = toggleBitrate.checked ? 'enabled' : 'disabled';

        storage.get('settings', (data) => {
            var state = data.settings,
                options = {
                    "bitrate": bitrateStatus,
                    "cache": cacheStatus,
                    "scrobble": 'enabled'
                };
            toggleScrobble.checked = true;
            if (state.scrobble === 'enabled') {
                toggleScrobble.checked = false;
                options.scrobble = 'disabled';
                storage.remove('lastsession', () => {
                  saveOption(options);
                })
            }
            saveOption(options);
        });

        storage.get('lastsession', (data) => {
            const sessionKey = data.lastsession,
                    apiKey = '488c3ca0fd22d7b5e8a0cd9650322d33';
            let apiUrl = 'http://www.lastfm.ru/api/auth?api_key=' + apiKey;

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
