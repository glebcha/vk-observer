import Audio from './audio';
import Video from './video';
import Scrobbler from './scrobbler';

let audio = new Audio(),
    video = new Video(),
    scrobbler = new Scrobbler();

class pageMedia {
    constructor() {}

    pageM() {
        let page = document.querySelector('#page_body.fl_r'),
            pageConfig = {
                childList: true,
                subtree: true
            };

        let pageObserver = new window.WebKitMutationObserver(

            (mutations) => {
                mutations.forEach( (mutation) => {
                    let node = mutation.target,
                        audios = node.querySelectorAll('.audio_row'),
                        blocks = node.querySelectorAll('.post');
                    audio.showA(audios);
                    audio.getA(blocks);
                });
            }

        );

        pageObserver.observe(page, pageConfig);
    }

    bodyM() {
        let checker,
            body = document.body,
            bodyConfig = {
                childList: true,
                subtree: true
            };

        let bodyObserver = new window.WebKitMutationObserver(

            (mutations) => {
                mutations.forEach( (mutation) => {
                    let node = mutation.target,
                        playlist = node.querySelector('.audio_playlist_wrap'),
                        v = node.querySelector('#mv_layer_wrap'),//video modal
                        m = node.querySelector('#wk_layer_wrap '),//wall post modal
                        ticker = node.querySelector('.top_audio_player');

                    if (v) {

                        let vObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    let node = mutation.target,
                                        videoBox = node.querySelector('#mv_box');
                                    video.showV(v, videoBox);
                                });
                            });
                        let vConfig = {
                            childList: true,
                            subtree: true
                        };
                        vObserver.observe(v, vConfig);
                    }

                    if (m) {
                        audio.showA(m.querySelectorAll('.audio_row'));
                        audio.getA(m.querySelectorAll('.wall_audio_rows'));
                    }

                    if (playlist) {
                        let playlistObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target,
                                        audios = node.querySelectorAll('.audio_row');
                                    audio.showA(audios);
                                });
                            });
                        let playlistConfig = {
                            childList: true,
                            subtree: true
                        };
                        playlistObserver.observe(playlist, playlistConfig);
                        audio.showA(playlist.querySelectorAll('.audio_row'));
                    }

                    if (ticker) {
                        let lastContainer = ticker
                                            .parentNode
                                            .querySelector('.last-controls'),
                            iconL = ticker
                                    .parentNode
                                    .querySelector('#like-icon'),
                            fullTitle = ticker
                                        .querySelector('.top_audio_player_title')
                                        .innerText
                                        .replace(/\s?([–-])\s?/g, '-')
                                        .split('-');

                        setTimeout( () => {
                            localStorage.vkObserver_artist = fullTitle[0];
                            localStorage.vkObserver_title = fullTitle[1];
                        }, 2000);

                        if(!lastContainer){
                            let lastControls = document.createElement('div'),
                                scrobbleIcon = document.createElement('div'),
                                likeIcon = document.createElement('div');
                            lastControls.className = 'last-controls';
                            scrobbleIcon.id = 'scrobble-icon';
                            likeIcon.id = 'like-icon';
                            lastControls.appendChild(scrobbleIcon);
                            lastControls.appendChild(likeIcon);
                            ticker.appendChild(lastControls);
                        }

                        ticker
                        .parentNode
                        .querySelector('#like-icon')
                        .onclick = (e) => {
                            e.stopPropagation();
                            scrobbler.likeSong(
                              localStorage.vkObserver_artist,
                              localStorage.vkObserver_title,
                              iconL
                            );
                        };

                        let tickerObs = new MutationObserver(
                          (mutations, observer) => {
                            mutations.forEach( (mutation) => {
                                const playing = mutation.target,
                                        fullTitle = playing
                                                    .parentNode
                                                    .parentNode
                                                    .querySelector('.top_audio_player_title');
                                const  formattedTitle = fullTitle
                                                        .innerText
                                                        .replace(/\s?([–-])\s?/g, '-')
                                                        .split('-');
                                const artist = formattedTitle[0],
                                        title = formattedTitle[1],
                                        iconStatus = ticker
                                                    .parentNode
                                                    .querySelector('#scrobble-icon'),
                                        iconLike = ticker
                                                    .parentNode
                                                    .querySelector('#like-icon');

                                if (localStorage.VkObserver_scrobble !== 'disabled'){
                                    iconStatus.style.visibility = 'visible';
                                    iconLike.style.visibility = 'visible';
                                } else {
                                    iconStatus.style.visibility = 'hidden';
                                    iconLike.style.visibility = 'hidden';
                                }

                                if (fullTitle && title !== localStorage.vkObserver_title) {
                                    window.clearTimeout(checker);
                                    iconStatus.className = '';
                                    iconStatus.setAttribute('title', 'скробблится');
                                    iconLike.className = 'changed';
                                    iconLike.setAttribute('title', 'добавить в любимые');
                                    localStorage.vkObserver_title = title;
                                    localStorage.vkObserver_artist = artist;
                                    checker = window.setTimeout(() => {
                                        scrobbler.scrobble(
                                          localStorage.vkObserver_artist,
                                          localStorage.vkObserver_title,
                                          iconStatus
                                        );
                                        iconLike.className = '';
                                    }, 21000);
                                }

                            })
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

}

export default pageMedia
