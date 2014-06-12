var saveOption = function(value) {
    chrome.storage.sync.set({
        'cache': value
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
    storage.get('cache', function(data) {
        var state = data.cache;
        if (state == undefined) {
            saveOption('enabled');
        }
        if (state == 'enabled') {
            toggle.checked = true;
        }
        if (state == 'disabled') {
            toggle.checked = false;
        }
    });
};

window.onload = function() {
    var switcher = document.querySelector('.switcher');
    var toggle = document.querySelector('#toggle');

    var changeState = function(event) {
        var storage = chrome.storage.sync;
        storage.get('cache', function(data) {
            var state = data.cache;
            if (state == 'enabled') {
                saveOption('disabled');
            }
            if (state == 'disabled') {
                saveOption('enabled');
            }
        });
    };

    getOption();
    switcher.addEventListener('click', changeState, false);

}