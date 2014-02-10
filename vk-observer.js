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
                    var audioDurationBlock = audioBlock.querySelector('.duration')
                    var audioDurationText = audioDurationBlock.innerText.split(':');
                    var audioDurationSeconds = audioDurationText[0] * 60 + +audioDurationText[1];
                    audioDurationBlock.setAttribute('data-duration', audioDurationSeconds);
                    var d = document.createElement('a');
                    d.className = 'download-link';
                    d.href = getLink;
                    d.setAttribute('download', audioTitle);
                    btn.appendChild(d);
                    (function(audioBlock) {
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
                                        kbps = Math.ceil(Math.round(kbit / audioDurationSeconds) / 16) * 16;
                                        callback(kbps);
                                    }
                                };
                                xmlhttp.open("HEAD", audioLink, true);
                                xmlhttp.send();
                            };
                            bitRate(
                                function (response) {
                                    if (!audioContainer.querySelector('.bitrate')) {
                                        var text = response + ' кбит/с';
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
vkMusic.pageMusic();
vkMusic.bodyMusic();
