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
                        audios = node.querySelectorAll('.audio'),
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
                        playlist = node.querySelector('#pad_playlist_panel'),
                        v = node.querySelector('#mv_layer_wrap'),
                        m = node.querySelector('#wk_layer_wrap '),
                        ticker = node.querySelector('#audio_global');

                    if (v) {

                        let vObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    let node = mutation.target,
                                        videoBox = node.querySelector('.video_box');
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
                        audio.showA(m.querySelectorAll('.audio'));
                        audio.getA(m.querySelectorAll('.wall_audio'));
                    } 

                    if (playlist) {
                        let playlistObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target,
                                        audios = node.querySelectorAll('.audio');
                                    audio.showA(audios);
                                });
                            });
                        let playlistConfig = {
                            childList: true,
                            subtree: true
                        };
                        playlistObserver.observe(playlist, playlistConfig);
                    }

                    if (ticker) {
                        let lastContainer = ticker.querySelector('.last-controls'),
                            iconL = ticker.querySelector('#like-icon');

                        setTimeout( () => {
                            localStorage.vkObserver_title = ticker.querySelector('#gp_title').innerText;
                            localStorage.vkObserver_artist = ticker.querySelector('#gp_performer').innerText;
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

                        ticker.onclick = () => {
                            scrobbler.likeSong(localStorage.vkObserver_artist, localStorage.vkObserver_title, iconL);
                        };
                        
                        let tickerObs = new MutationObserver( (mutations, observer) => {
                            mutations.forEach( (mutation) => {        
                                let playing = mutation.target,
                                    artist = playing.parentNode.querySelector('#gp_performer'),  
                                    title = playing.parentNode.querySelector('#gp_title'),
                                    iconStatus = ticker.querySelector('#scrobble-icon'),
                                    iconLike = ticker.querySelector('#like-icon');
                                
                                if (localStorage.VkObserver_scrobble !== 'disabled'){
                                    iconStatus.style.visibility = 'visible';
                                    iconLike.style.visibility = 'visible';
                                } else {
                                    iconStatus.style.visibility = 'hidden';
                                    iconLike.style.visibility = 'hidden';
                                }

                                if (title.innerText !== localStorage.vkObserver_title) {
                                    window.clearTimeout(checker);
                                    iconStatus.className = '';
                                    iconStatus.setAttribute('title', 'скробблится');
                                    iconLike.className = 'changed';
                                    iconLike.setAttribute('title', 'добавить в любимые');
                                    localStorage.vkObserver_title = title.innerText;
                                    localStorage.vkObserver_artist = artist.innerText;
                                    checker = window.setTimeout(function(){
                                        scrobbler.scrobble(localStorage.vkObserver_artist, localStorage.vkObserver_title, iconStatus);
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