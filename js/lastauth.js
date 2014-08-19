window.onload = function () {
    var token = window.location.search.replace('?token=', '');
    var storage = chrome.storage.sync;
    var userName = document.querySelector('.user');

    storage.get('lastkeys', function (data) {
        var apiKey = data.lastkeys.api;
        var apiSecret = data.lastkeys.secret;
        var lastfm = new LastFM({
            apiKey: apiKey,
            apiSecret: apiSecret
        });
        lastfm.auth.getSession({
            token: token
        }, {
            success: function (data) {

    		storage.set({
        		'lastsession': data.session.key
    		}, function() {
            	chrome.tabs.query({
                	'url': '*://vk.com/*'
            		}, function(tabs) {
            			for (var i = 0; i < tabs.length; i++) {
                			chrome.tabs.executeScript(tabs[i].id, {
                   			file: "js/vk-observer.js"
                		});
            		}
        		});
    		});
            	userName.innerText = data.session.name + ',';
            },
            error: function (code, message) {
                console.log("Ошибка: " + message + " код: " + code);
            }
        });
    });
};