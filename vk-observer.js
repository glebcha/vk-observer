var vkObserver = {
    showAudioLinks: function(audios) {
        var audioBlocks = audios || document.querySelectorAll('.audio');
        var dragDownload = function(e) {
            var downloadLink = this.querySelector('.download-link');
            if (downloadLink.dataset) {
                e.dataTransfer.setData('DownloadURL', downloadLink.dataset.download);
            }
        };
        var noBubbling = function(event) {
            event.stopPropagation();
        };
        var displayBitrate = function(event) {
            event.preventDefault();
            var playBtn = event.target;
            var audioContainer = playBtn.parentNode.parentNode.parentNode.parentNode;
            var linkBtn = audioContainer.querySelector('.play_btn_wrap');
            var audioLink = linkBtn.parentNode.querySelector('input').value.split('?').splice(0, 1).toString();
            var audioDurationSeconds = audioContainer.querySelector('.duration').dataset.duration;
            var bitRate = function(callback) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.overrideMimeType('text/xml');

                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var size = xmlhttp.getResponseHeader('Content-Length');
                        var kbit = size / 128;
                        var kbps = Math.ceil(Math.round(kbit / audioDurationSeconds) / 16) * 16;
                        if (kbps > 320) {
                            kbps = 320;
                        }
                        callback(kbps);
                    }
                };
                xmlhttp.open("HEAD", audioLink, true);
                xmlhttp.send();
            };
            bitRate(
                function(response) {
                    if (!audioContainer.querySelector('.bitrate')) {
                        var text;
                        if (isNaN(response) === true) {
                            text = '×';
                        } else {
                            text = response + ' кбит/с';
                        }
                        var b = document.createElement('span');
                        b.className = 'bitrate';
                        b.innerText = text.replace('-', '');
                        audioContainer.appendChild(b);
                    }
                });
        };
        if (audioBlocks.length > 0) {
            for (var i = 0; i < audioBlocks.length; i++) {
                var audioBlock = audioBlocks[i];
                var btn = audioBlock.querySelector('.play_btn_wrap');
                if (!btn.querySelector('.download-link')) {
                    var getLink = btn.parentNode.querySelector('input').value.split('?').splice(0, 1).toString();
                    var audioTitle = audioBlock.querySelector('.title_wrap.fl_l .title').innerText;
                    var audioArtist = audioBlock.querySelector('.title_wrap.fl_l').firstElementChild.firstElementChild.innerText;
                    var audioName = audioArtist + "-" + audioTitle;
                    var audioFullName = audioName.replace('.', '');
                    var audioDurationBlock = audioBlock.querySelector('.duration');
                    var audioDurationText = audioDurationBlock.innerText.split(':');
                    var audioDurationSeconds = audioDurationText[0] * 60 + parseInt(audioDurationText[1], 10);
                    audioDurationBlock.setAttribute('data-duration', audioDurationSeconds);
                    var d = document.createElement('a');
                    var downloadData = 'audio/mpeg:' + audioFullName + '.mp3:' + getLink;
                    d.className = 'download-link';
                    d.href = getLink;
                    d.setAttribute('download', audioFullName);
                    d.setAttribute('data-download', downloadData);
                    d.addEventListener('click', noBubbling, false);
                    audioBlock.setAttribute('draggable', 'true');
                    audioBlock.addEventListener('dragstart', dragDownload, false);
                    btn.appendChild(d);
                    audioBlock.addEventListener('mouseover', displayBitrate, false);
                }
            }
        }

    },

    downloadAll: function(entries) {

        var posts = entries || document.querySelectorAll('.post');
        var getAllAudios = function(event) {
            event.preventDefault();
            var item = event.target.parentNode;
            for (var z = 0; z < item.querySelectorAll('.audio').length; z++) {
                var ev = document.createEvent("MouseEvents");
                ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                item.querySelectorAll('.download-link')[z].dispatchEvent(ev);
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
                    //TODO: Deal with multi-download
                    if (!post.querySelector('.download-all-link')) {
                        wallText.appendChild(btn);
                    }
                }
            }
        }
    },

    pageMusic: function() {
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
                    vkObserver.showAudioLinks(audios);
                    var blocks = node.querySelectorAll('.post');

                    vkObserver.downloadAll(blocks);


                });

            });

        pageObserver.observe(page, pageConfig);
    },

    bodyMedia: function() {
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
                    var quality = [240, 360, 480, 720];
                    var reg = new RegExp(quality.join("|"), "i");

                    if (b) {

                        var bObserver = new window.WebKitMutationObserver(

                            function(mutations) {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target;
                                    var videoBox = node.querySelector('.video_box');

                                    if (videoBox) {
                                        var sideBar = b.querySelector('#mv_narrow');
                                        var videoTitle = b.querySelector('.mv_min_title').innerText;
                                        var el = document.createElement('div');
                                        var elIcon = document.createElement('span');
                                        el.className = 'arr_div';
                                        elIcon.className = 'download-icon';
                                        el.appendChild(elIcon);
                                        if (!sideBar.querySelector('.arr_div')) {
                                            sideBar.appendChild(el);
                                        }
                                        var html5 = videoBox.querySelector('video');
                                        var embed = videoBox.querySelector('embed');
                                        if (html5) {
                                            var sourceString = html5.getAttribute('src');
                                            var videoDownload = document.createElement('a');
                                            videoDownload.className = 'html5-video';
                                            videoDownload.href = sourceString;
                                            videoDownload.setAttribute('download', videoTitle);
                                            videoDownload.innerText = 'Загрузить видео';
                                            el.appendChild(videoDownload);
                                            //TODO: Find video quality buttons inner text
                                            console.log(sourceString);
                                            //TODO: Create elements for all urls and push them to video links list
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
                                                    return '<li><a href="' + link + '" download="' + videoTitle + '">' + link.match(reg) + '</a></li>';
                                                });
                                                var uArr = document.createElement('ul');
                                                uArr.innerHTML = htmlUrls.join('');
                                                el.appendChild(uArr);

                                            }
                                        }
                                    }
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
                                    vkObserver.showAudioLinks(audios);
                                });
                            });
                        var playlistConfig = {
                            childList: true,
                            subtree: true
                        };
                        playlistObserver.observe(playlist, playlistConfig);
                    }


                });
            });

        bodyObserver.observe(body, bodyConfig);
    }
};
vkObserver.showAudioLinks();
vkObserver.downloadAll();
vkObserver.pageMusic();
vkObserver.bodyMedia();