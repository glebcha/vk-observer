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
                    var d = document.createElement('a');
                    d.className = 'download-link';
                    d.href = getLink;
                    d.setAttribute('download', audioTitle);
                    d.style.cssText = 'background-image: url(/images/emoji/2B07.png); width: 20px;' + '\r\n' +
                        'height: 20px; position: absolute; top: 5px; right: 27px; z-index: 100; background-repeat: no-repeat;';
                    btn.appendChild(d);
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