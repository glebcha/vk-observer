var vkObserver = {
    clearStorage: function() {
        chrome.storage.sync.clear();
        chrome.storage.sync.set({
            'settings': {
                "bitrate": 'enabled',
                "cache": 'enabled',
                "scrobble": 'disabled'
            }
        });
    },

    syncStorage: function() {
        var storage = chrome.storage.sync;
        storage.get('settings', function(data) {
            var storVal = data.settings;
            if (storVal === undefined) {
                vkObserver.clearStorage();
                localStorage.VkObserver_cache = 'enabled';
                localStorage.VkObserver_bitrate = 'enabled';
                localStorage.VkObserver_scrobble = 'disabled';
            }
            if (storVal.cache == 'enabled') {
                localStorage.VkObserver_cache = 'enabled';
            }
            if (storVal.bitrate == 'enabled') {
                localStorage.VkObserver_bitrate = 'enabled';
            }
            if (storVal.scrobble == 'enabled') {
                localStorage.VkObserver_scrobble = 'enabled';
            }
            if (storVal.cache == 'disabled') {
                localStorage.VkObserver_cache = 'disabled';
            }
            if (storVal.bitrate == 'disabled') {
                localStorage.VkObserver_bitrate = 'disabled';
            }
            if (storVal.scrobble == 'disabled') {
                localStorage.VkObserver_scrobble = 'disabled';
            }

        });
    },

    showA: function(audios) {
        var audioBlocks = audios || document.querySelectorAll('.audio');
        var noBubbling = function(event) {
            event.stopPropagation();
        };

        var getblob = function(event) {
            var el = event.target;
            var wrap = el.parentNode;
            var url = el.href;
            var downloadBtn = wrap.querySelector('.download-link');
            var cacheStatus = localStorage.VkObserver_cache;
            if (cacheStatus == 'enabled') {
                event.preventDefault();
                event.stopPropagation();
                var winUrl = window.URL || window.webkitURL;
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                downloadBtn.style.display = 'none';
                var statusBlock = document.createElement('span');
                statusBlock.className = 'cached-status';
                wrap.appendChild(statusBlock);
                xhr.onprogress = function(completion) {
                    var cachedCompletion = Math.floor(completion.loaded / completion.total * 100);
                    var cachedPercent = cachedCompletion + '%';
                    statusBlock.innerHTML = '';
                    statusBlock.innerHTML = cachedPercent;
                    if (cachedPercent == '100%') {
                        statusBlock.remove();
                        downloadBtn.style.display = 'block';
                    }

                };
                xhr.onreadystatechange = function(response) {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var blob = new window.Blob([this.response], {
                            'type': 'audio/mpeg'
                        });
                        var link = winUrl.createObjectURL(blob);
                        el.href = link;
                        el.click();
                        el.removeEventListener('click', getblob, false);
                        winUrl.revokeObjectURL(link);
                        el.href = getLink;
                    }
                };
                xhr.open('GET', url, true);
                xhr.send(null);
            } else {}

        };
        var displayBitrate = function(event) {
            event.preventDefault();
            var audioContainer = this;
            var linkBtn = audioContainer.querySelector('.play_btn_wrap');
            var audioLink = linkBtn.parentNode.querySelector('input').value.split(',').splice(0, 1).toString();
            var audioDurationSeconds = audioContainer.querySelector('.duration').dataset.duration;
            var bitrateStatus = localStorage.VkObserver_bitrate;
            var bitRate = function(callback) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.overrideMimeType('text/xml');

                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 206) {
                        var range = xmlhttp.getResponseHeader('Content-Range');
	                    var size = range.split('/').pop();
                        var sizeLong = Math.floor(size / 1024) / 1024;
                        var sizeShort = sizeLong.toFixed(1);
                        var kbit = size / 128;
                        var kbps = Math.ceil(Math.round(kbit / audioDurationSeconds) / 16) * 16;
                        if (kbps > 320) {
                            kbps = 320;
                        }
                        callback([kbps, sizeShort]);
                    }
                };
                xmlhttp.open("GET", audioLink, true);
	            xmlhttp.setRequestHeader('Range', 'bytes=0-1');
                xmlhttp.send();
            };

            if (bitrateStatus == 'enabled') {
                bitRate(
                    function(response) {
                        var fileRate = response[0];
                        var fileSize = response[1];
                        if (!audioContainer.querySelector('.bitrate')) {
                            var text;
                            if (isNaN(fileRate) === true) {
                                text = '×';
                            } else {
                                text = fileRate + ' кбит/с' + '<span>' + fileSize + ' МБ</span>';
                            }
                            var b = document.createElement('span');
                            b.className = 'bitrate';
                            b.innerHTML = text.replace('-', '');
                            audioContainer.appendChild(b);
                            audioContainer.removeEventListener('mouseover', displayBitrate);
                        }
                    });
            }
        };
        if (audioBlocks.length > 0) {
            for (var i = 0; i < audioBlocks.length; i++) {
                var audioBlock = audioBlocks[i];
                var btn = audioBlock.querySelector('.play_btn_wrap');
                var btnPlay = btn.querySelector('.play_new');
                if (!btn.querySelector('.download-link')) {
                    var getLink = btn.parentNode.querySelector('input').value.split('?').splice(0, 1).toString();
                    var audioTitle = audioBlock.querySelector('.title_wrap.fl_l .title').innerText;
                    var audioArtist = audioBlock.querySelector('.title_wrap.fl_l').firstElementChild.firstElementChild.innerText;
                    var audioName = audioArtist + "-" + audioTitle;
                    var audioFullName = audioName.replace(/\./g, '');
                    var audioDurationBlock = audioBlock.querySelector('.duration');
                    var audioDurationText = audioDurationBlock.innerText.split(':');
                    var audioDurationSeconds = audioDurationText[0] * 60 + parseInt(audioDurationText[1], 10);
                    audioDurationBlock.setAttribute('data-duration', audioDurationSeconds);
                    var d = document.createElement('a');
                    d.className = 'download-link';
                    d.href = getLink;
                    d.setAttribute('download', audioFullName);
                    d.addEventListener('click', noBubbling, false);
                    d.addEventListener('click', getblob, false); 
                    btn.appendChild(d);
                    audioBlock.addEventListener('mouseover', displayBitrate, false);
                }
            }
        }

    },

    getA: function(entries) {

        var posts = entries || document.querySelectorAll('.post');
        var getAllAudios = function(event) {
            event.preventDefault();
            var item = event.target.parentNode;
            for (var z = 0; z < item.querySelectorAll('.audio').length; z++) {
                item.querySelectorAll('.download-link')[z].click();
            }
        };

        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var wallText = post.querySelector('.wall_text');
            if (post !== undefined && post !== null) {
                if (wallText.querySelectorAll('.audio').length > 1) {
                    var btn = document.createElement('a');
                    btn.href = '#';
                    btn.className = 'download-all-link';
                    btn.innerHTML = 'Загрузить все<span class="download-tooltip">Нажмите, чтобы загрузить все аудиозаписи</span>';
                    btn.addEventListener('click', getAllAudios, false);
                    if (!post.querySelector('.download-all-link')) {
                        wallText.appendChild(btn);
                    }
                }
            }
        }
    },

    pageM: function() {
        var page = document.querySelector('#page_body.fl_r');
        var pageConfig = {
            childList: true,
            subtree: true
        };

        var pageObserver = new window.WebKitMutationObserver(

        function(mutations) {
            mutations.forEach(function(mutation) {
                var node = mutation.target;
                var audios = node.querySelectorAll('.audio');
                vkObserver.showA(audios);
                var blocks = node.querySelectorAll('.post');
                vkObserver.getA(blocks); 
            });

        });

        pageObserver.observe(page, pageConfig);
    },

    showV: function(main, box) {
        var videoWrap = document.querySelector('#mv_layer_wrap');
        var parent = main || videoWrap;
        if (parent) {
            var videoBox = box || videoWrap.querySelector('.video_box');
            var quality = [240, 360, 480, 720];
            var reg = new RegExp(quality.join("|"), "i");

            if (videoBox) {
                var sideBar = parent.querySelector('#mv_narrow');
                var videoTitle = parent.querySelector('.mv_min_title').innerText;
                var el = document.createElement('div');
                el.className = 'arr_div';
                if (!sideBar.querySelector('.arr_div')) {
                    sideBar.appendChild(el);
                }
                var html5 = videoBox.querySelector('video');
                var embed = videoBox.querySelector('embed');
                if (html5) {
                    var sourceString = html5.getAttribute('src').split('mp4').slice(0, 1).toString() + "mp4";
                    var videoDownload = document.createElement('a');
                    videoDownload.className = 'html5-video';
                    videoDownload.href = sourceString;
                    videoDownload.setAttribute('download', videoTitle);
                    videoDownload.innerHTML = '<span class="download-icon"></span>Загрузить видео';
                    el.appendChild(videoDownload);
                } else {
                    if (!embed) {
                        return;
                    } else {
                        var arr = embed.getAttribute('flashvars').split('url');
                        var newArr = arr.filter(function(arg) {
                            return arg.match(reg);
                        });
                        var filtered = newArr.join().split(/=|extra|%3F/);
                        var urlArr = filtered.filter(function(val) {
                            return val.match(/http|https/);
                        });
                        var filteredUrlArr = urlArr.map(function(item) {
                            return decodeURIComponent(item);
                        });
                        var cleanUrlArr = filteredUrlArr.filter(function(url) {
                            return url.match(/mp4/);
                        });
                        var noDupsUrls = (function() {
                            var newArr = [];
                            for (var i = 0; i < quality.length; i++) {
                                var q = quality[i];
                                for (var k = 0; k < cleanUrlArr.length; k++) {
                                    var a = cleanUrlArr[k];
                                    if (a.indexOf(q) > 0) {
                                        newArr.push(a);
                                        break;
                                    }
                                }
                            }
                            return newArr;
                        })();
                        var htmlUrls = noDupsUrls.map(function(link) {
                            var finalVideoQuality = '';
                            var videoQuality = link.match(reg);
                            if (videoQuality == 240) {
                                finalVideoQuality = 'низкое (' + videoQuality + ')';
                            } else if (videoQuality == 360) {
                                finalVideoQuality = 'низкое (' + videoQuality + ')';
                            } else if (videoQuality == 480) {
                                finalVideoQuality = 'среднее (' + videoQuality + ')';
                            } else if (videoQuality == 720) {
                                finalVideoQuality = 'высокое (' + videoQuality + ')';
                            } else {
                                finalVideoQuality = videoQuality;
                            }

                            return '<li><span class="download-icon"></span><a href="' + link + '" download="' + videoTitle + '">качество - ' + finalVideoQuality + '</a></li>';
                        });
                        var uArr = document.createElement('ul');
                        uArr.innerHTML = htmlUrls.join('');
                        el.appendChild(uArr);

                    }
                }
            }
        }
    },

    scrobbler: function(songArtist, songTitle, statusIcon) {
        var scrobbleStatus = localStorage.VkObserver_scrobble;
        var storage = chrome.storage.sync;
        
                                
        storage.get('lastkeys', function(data) {
            var apiKey = data.lastkeys.api;
            var apiSecret = data.lastkeys.secret;
            var ts = Math.floor(new Date().getTime()/1000);
            var lastfm = new LastFM({
                apiKey: apiKey,
                apiSecret: apiSecret
            });
            
            storage.get('lastsession', function(data) {
                var sk = data.lastsession;
                var startScrobble = function() {
                    lastfm.track.scrobble({artist: songArtist, track: songTitle, timestamp: ts}, {key: sk}, {success: function(data){
                        statusIcon.className = 'scrobbled';
                        statusIcon.setAttribute('title', 'заскроблено');
                        //console.log("Заскробблен! " + songArtist + " " + songTitle);
                    }, error: function(code, message){
                        console.log("Ошибка: " + message + " код: " + code);
                    }});
                };

                if (scrobbleStatus == 'enabled' && songArtist !== null && songArtist !== undefined) {
                    startScrobble();
                }

            });

        });
        
    },


    likeSong: function(songArtist, songTitle, likeIcon) {
        var scrobbleStatus = localStorage.VkObserver_scrobble;
        var storage = chrome.storage.sync;
                                
        storage.get('lastkeys', function(data) {
            var apiKey = data.lastkeys.api;
            var apiSecret = data.lastkeys.secret;
            var ts = Math.floor(new Date().getTime()/1000);
            var lastfm = new LastFM({
                apiKey: apiKey,
                apiSecret: apiSecret
            });
            
            storage.get('lastsession', function(data) {
                var sk = data.lastsession;
                var like = function() {
                    lastfm.track.love({artist: songArtist, track: songTitle}, {key: sk}, {success: function(data){
                        likeIcon.className = 'liked';
                        likeIcon.setAttribute('title', 'добавлено в любимые');
                        //console.log("Добавлен в любимые! " + songArtist + " " + songTitle);
                    }, error: function(code, message){
                        console.log("Ошибка: " + message + " код: " + code);
                    }});
                };
                var unlike = function() {
                    lastfm.track.unlove({artist: songArtist, track: songTitle}, {key: sk}, {success: function(data){
                        likeIcon.className = 'unliked';
                        likeIcon.setAttribute('title', 'удалено из любимых');
                        //console.log("Удален из любимых! " + songArtist + " " + songTitle);
                    }, error: function(code, message){
                        console.log("Ошибка: " + message + " код: " + code);
                    }});
                };

                if (scrobbleStatus == 'enabled' && songArtist !== null && songArtist !== undefined && likeIcon.className !== 'changed') {
                    if(likeIcon.className !== 'liked' || likeIcon.className === 'unliked') {
                        like();
                    } else {
                        unlike();
                    } 
                }

            });

        });
        
    },

    bodyM: function() {
        var checker;
        var body = document.body;
        var bodyConfig = {
            childList: true,
            subtree: true
        };

        var bodyObserver = new window.WebKitMutationObserver(

            function(mutations) {
                mutations.forEach(function(mutation) {
                    var node = mutation.target;
                    var playlist = node.querySelector('#pad_playlist_panel');
                    var b = node.querySelector('#mv_layer_wrap');
                    var ticker = node.querySelector('#audio_global');

                    if (b) {

                        var bObserver = new window.WebKitMutationObserver(

                            function(mutations) {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target;
                                    var videoBox = node.querySelector('.video_box');
                                    vkObserver.showV(b, videoBox);
                                });
                            });
                        var bConfig = {
                            childList: true,
                            subtree: true
                        };
                        bObserver.observe(b, bConfig);
                    }

                    if (playlist) {
                        var playlistObserver = new window.WebKitMutationObserver(

                            function(mutations) {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target;
                                    var audios = node.querySelectorAll('.audio');
                                    vkObserver.showA(audios);
                                });
                            });
                        var playlistConfig = {
                            childList: true,
                            subtree: true
                        };
                        playlistObserver.observe(playlist, playlistConfig);
                    }

                    if (ticker) {

                        setTimeout(function(){
                            localStorage.vkObserver_title = ticker.querySelector('#gp_title').innerText;
                            localStorage.vkObserver_artist = ticker.querySelector('#gp_performer').innerText;
                        }, 2000);
                        
                        if(!ticker.querySelector('.last-controls')){
                            var lastControls = document.createElement('div');
                            var scrobbleIcon = document.createElement('div');
                            var likeIcon = document.createElement('div');
                            lastControls.className = 'last-controls';
                            scrobbleIcon.id = 'scrobble-icon';
                            likeIcon.id = 'like-icon';
                            lastControls.appendChild(scrobbleIcon);
                            lastControls.appendChild(likeIcon);
                            ticker.appendChild(lastControls);
                        }

                        var iconL = ticker.querySelector('#like-icon');
                        ticker.onclick = function(){
                            vkObserver.likeSong(localStorage.vkObserver_artist, localStorage.vkObserver_title, iconL);
                        };
                        
                        var tickerObs = new MutationObserver(function(mutations, observer) {
                            for(var k = 0; k < mutations.length; k++) {        
                                var playing = mutations[k].target;
                                var artist = playing.parentNode.querySelector('#gp_performer');  
                                var title = playing.parentNode.querySelector('#gp_title');
                                var iconStatus = ticker.querySelector('#scrobble-icon');
                                var iconLike = ticker.querySelector('#like-icon');

                                if (title.innerText !== localStorage.vkObserver_title) {
                                    window.clearTimeout(checker);
                                    iconStatus.className = '';
                                    iconStatus.setAttribute('title', 'скробблится');
                                    iconLike.className = 'changed';
                                    iconLike.setAttribute('title', 'добавить в любимые');
                                    localStorage.vkObserver_title = title.innerText;
                                    localStorage.vkObserver_artist = artist.innerText;
                                    checker = window.setTimeout(function(){
                                        vkObserver.scrobbler(localStorage.vkObserver_artist, localStorage.vkObserver_title, iconStatus);
                                        iconLike.className = '';
                                    }, 21000);
                                }
                        
                            }
                        });

                    tickerObs.observe(ticker, {
                        childList: true,
                        subtree: true
                    });
                }


                });
            });

        bodyObserver.observe(body, bodyConfig);
    }
};

vkObserver.syncStorage();
vkObserver.showA();
vkObserver.getA();
vkObserver.showV();
vkObserver.pageM();
vkObserver.bodyM();