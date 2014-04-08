var vkMusic = {
    showLinks: function (audios) {
        var audioBlocks = audios || document.querySelectorAll('.audio');
        if (audioBlocks.length > 0) {
            for (i = 0; i < audioBlocks.length; i++) {
                var audioBlock = audioBlocks[i];
                var btn = audioBlock.querySelector('.play_btn_wrap');
                if (!btn.querySelector('.download-link')) {
                    var getLink = btn.parentNode.lastElementChild.value.split('?').splice(0, 1).toString();
                    var audioTitle = audioBlock.querySelector('.title_wrap.fl_l .title').innerText;
                    var audioArtist = audioBlock.querySelector('.title_wrap.fl_l').firstElementChild.firstElementChild.innerText;
                    var audioFullName  = audioArtist + "-" + audioTitle;
                    var audioDurationBlock = audioBlock.querySelector('.duration')
                    var audioDurationText = audioDurationBlock.innerText.split(':');
                    var audioDurationSeconds = audioDurationText[0] * 60 + +audioDurationText[1];
                    audioDurationBlock.setAttribute('data-duration', audioDurationSeconds);
                    var d = document.createElement('a');
                    var downloadData = 'audio/mpeg:' + audioFullName + '.mp3:' + getLink;
                    d.className = 'download-link';
                    d.href = getLink;
                    d.setAttribute('download', audioFullName);
                    d.setAttribute('data-download', downloadData);
                    d.addEventListener('click',
                        function (event) {
                            event.stopPropagation();
                        }, false);
                    audioBlock.setAttribute('draggable', 'true');
                    audioBlock.addEventListener('dragstart', function(e) {
                        var downloadLink = this.querySelector('.download-link');
                        if (downloadLink.dataset) {
                            e.dataTransfer.setData('DownloadURL', downloadLink.dataset.download);
                        }     
                    }, false);
                    btn.appendChild(d);
                    (function (audioBlock) {
                        audioBlock.addEventListener('mouseover', function (event) {
                            event.preventDefault();
                            var playBtn = event.target;
                            var audioContainer = playBtn.parentNode.parentNode.parentNode.parentNode;
                            var linkBtn = audioContainer.querySelector('.play_btn_wrap');
                            var audioLink = linkBtn.parentNode.lastElementChild.value.split('?').splice(0, 1).toString();
                            var audioDurationSeconds = audioContainer.querySelector('.duration').dataset.duration;
                            var bitRate = function (callback) {
                                var xmlhttp = new XMLHttpRequest();
                                xmlhttp.overrideMimeType('text/xml');

                                xmlhttp.onreadystatechange = function () {
                                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                        var size = xmlhttp.getResponseHeader('Content-Length');
                                        var kbit = size / 128;
                                        var kbps = Math.ceil(Math.round(kbit / audioDurationSeconds) / 16) * 16;
                                        if(kbps > 320) {
                                            kbps = 320;
                                        }
                                        callback(kbps);
                                    }
                                };
                                xmlhttp.open("HEAD", audioLink, true);
                                xmlhttp.send();
                            };
                            bitRate(
                                function (response) {
                                    if (!audioContainer.querySelector('.bitrate')) {
                                        if(isNaN(response) === true) {
                                            var text = '×';
                                        }else{
                                            var text = response + ' кбит/с';
                                        }
                                        var b = document.createElement('span');
                                        b.className = 'bitrate';
                                        b.innerText = text.replace('-', '');
                                        audioContainer.appendChild(b);
                                    }
                                }
                            );
                        }, false);
                    })(audioBlock);
                }
            }
        }

    },

    downloadAll: function (posts) {

        var posts = posts || document.querySelectorAll('.post');

        for (var i = 0; i < posts.length; i++) {
            var post = posts[i];
            var wallText = post.querySelector('.wall_text');
            if (post !== undefined && post !== null) {
                if (wallText.querySelectorAll('.audio').length > 1) {
                    var btn = document.createElement('a');
                    btn.href = '#';
                    btn.className = 'download-all-link';
                    btn.innerHTML = 'Загрузить все<span class="download-tooltip">Нажмите, чтобы загрузить все аудиозаписи</span>';
                    btn.addEventListener('click',
                        function (event) {
                            event.preventDefault();
                            var item = event.target.parentNode;
                            for (var z = 0; z < item.querySelectorAll('.audio').length; z++) {
                                var ev = document.createEvent("MouseEvents");
                                ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                                item.querySelectorAll('.download-link')[z].dispatchEvent(ev);
                            }
                        }, false);
                    //TODO: Deal with multi-download
                    if (!post.querySelector('.download-all-link')) {
                        wallText.appendChild(btn);
                    }
                }
            }
        }
    },

    pageMusic: function () {
        var page = document.querySelector('#page_body.fl_r');
        var pageConfig = {
            childList: true,
            subtree: true
        };

        var pageObserver = new window.WebKitMutationObserver(
            function (mutations) {
                mutations.forEach(function (mutation) {
                    var node = mutation.target;
                    var audios = node.querySelectorAll('.audio');
                    vkMusic.showLinks(audios);
                    var blocks = node.querySelectorAll('.post');

                    vkMusic.downloadAll(blocks);


                });

            });

        pageObserver.observe(page, pageConfig);
    },

    bodyMusic: function () {
        var body = document.body;
        var bodyConfig = {
            childList: true
        };

        var bodyObserver = new window.WebKitMutationObserver(
            function (mutations) {
                mutations.forEach(function (mutation) {
                    var node = mutation.target;
                    var playlist = node.querySelector('#pad_playlist_panel');
                    if (playlist) {
                        var playlistObserver = new window.WebKitMutationObserver(
                            function (mutations) {
                                mutations.forEach(function (mutation) {
                                    var node = mutation.target;
                                    var audios = node.querySelectorAll('.audio');
                                    vkMusic.showLinks(audios);
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
vkMusic.showLinks();
vkMusic.downloadAll();
vkMusic.pageMusic();
vkMusic.bodyMusic();
