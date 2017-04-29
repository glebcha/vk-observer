import Audio from './audio';
import Video from './video';
import Scrobbler from './scrobbler';

const audio = new Audio();
const video = new Video();
const scrobbler = new Scrobbler();

class pageMedia {

    pageM() {
        const page = document.querySelector('#page_body.fl_r');
        const pageConfig = {
            childList: true,
            subtree: true
        };

        const pageObserver = new window.WebKitMutationObserver(

            (mutations) => {
                mutations.forEach( (mutation) => {
                    const node = mutation.target;
                    const audios = node.querySelectorAll('.audio_row');
                    const blocks = node.querySelectorAll('.post');

                    audio.showA(audios);
                    audio.getA(blocks);
                });
            }

        );

        pageObserver.observe(page, pageConfig);
    }

    bodyM() {
        const body = document.body;
        const bodyConfig = {
            childList: true,
            subtree: true
        };
        let checker;

        const bodyObserver = new window.WebKitMutationObserver(

            (mutations) => {
                mutations.forEach( (mutation) => {
                    const node = mutation.target;
                    const playlist = node.querySelector('.audio_page_sections');
                    const v = node.querySelector('#mv_layer_wrap');//video modal
                    const m = node.querySelector('#wk_layer_wrap ');//wall post modal
                    const ticker = node.querySelector('.eltt top_audio_layer');

                    if (v) {

                        const vObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    let node = mutation.target,
                                        videoBox = node.querySelector('#mv_box');
                                    video.showV(v, videoBox);
                                });
                            });
                        const vConfig = {
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
                        const playlistObserver = new window.WebKitMutationObserver(

                            (mutations) => {
                                mutations.forEach(function(mutation) {
                                    var node = mutation.target,
                                        audios = node.querySelectorAll('.audio_row');
                                    audio.showA(audios);
                                });
                            });
                        const playlistConfig = {
                            childList: true,
                            subtree: true
                        };
                        playlistObserver.observe(playlist, playlistConfig);
                        audio.showA(playlist.querySelectorAll('.audio_row'));
                    }

                    if (ticker) {
                        // let lastContainer = ticker
                        //                     .parentNode
                        //                     .querySelector('.last-controls'),
                        //     iconL = ticker
                        //             .parentNode
                        //             .querySelector('#like-icon'),
                        //     fullTitle = ticker
                        //                 .querySelector('.top_audio_player_title')
                        //                 .innerText
                        //                 .replace(/\s?([–-])\s?/g, '-')
                        //                 .split('-');
                        //
                        // setTimeout( () => {
                        //     localStorage.vkObserver_artist = fullTitle[0];
                        //     localStorage.vkObserver_title = fullTitle[1];
                        // }, 2000);
                        //
                        // if(!lastContainer){
                        //     let lastControls = document.createElement('div'),
                        //         scrobbleIcon = document.createElement('div'),
                        //         likeIcon = document.createElement('div');
                        //     lastControls.className = 'last-controls';
                        //     scrobbleIcon.id = 'scrobble-icon';
                        //     likeIcon.id = 'like-icon';
                        //     lastControls.appendChild(scrobbleIcon);
                        //     lastControls.appendChild(likeIcon);
                        //     ticker.appendChild(lastControls);
                        // }
                        //
                        // ticker
                        // .parentNode
                        // .querySelector('#like-icon')
                        // .onclick = (e) => {
                        //     e.stopPropagation();
                        //     scrobbler.likeSong(
                        //       localStorage.vkObserver_artist,
                        //       localStorage.vkObserver_title,
                        //       iconL
                        //     );
                        // };

                        const tickerObs = new MutationObserver(
                          (mutations, observer) => {
                            mutations.forEach( (mutation) => {
                                const playing = mutation.target;
                                const artist = playing
                                                .querySelector('.audio_page_player_title_performer')
                                                .innerHTML;
                                const title = playing
                                                .querySelector('.audio_page_player_title')
                                                .innerHTML;
                                // const iconStatus = ticker
                                //                     .parentNode
                                //                     .querySelector('#scrobble-icon');
                                // const iconLike = ticker
                                //                     .parentNode
                                //                     .querySelector('#like-icon');
                                //
                                // if (localStorage.VkObserver_scrobble !== 'disabled'){
                                //     iconStatus.style.visibility = 'visible';
                                //     iconLike.style.visibility = 'visible';
                                // } else {
                                //     iconStatus.style.visibility = 'hidden';
                                //     iconLike.style.visibility = 'hidden';
                                // }
                                //
                                // if (fullTitle && title !== localStorage.vkObserver_title) {
                                //     window.clearTimeout(checker);
                                //     iconStatus.className = '';
                                //     iconStatus.setAttribute('title', 'скробблится');
                                //     iconLike.className = 'changed';
                                //     iconLike.setAttribute('title', 'добавить в любимые');
                                //     localStorage.vkObserver_title = title;
                                //     localStorage.vkObserver_artist = artist;
                                //     checker = window.setTimeout(() => {
                                //         scrobbler.scrobble(
                                //           localStorage.vkObserver_artist,
                                //           localStorage.vkObserver_title,
                                //           iconStatus
                                //         );
                                //         iconLike.className = '';
                                //     }, 21000);
                                // }

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
