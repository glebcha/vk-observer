import Audio from './audio';
import Video from './video';
import Scrobbler from './scrobbler';

const audio = new Audio();
const video = new Video();
const scrobbler = new Scrobbler();

class mediaWatcher {

    observe() {
        const body = document.body;
        const bodyConfig = {
            childList: true,
            subtree: true
        };
        let selectedQuality = '';
        let checker;

        const bodyObserver = new window.WebKitMutationObserver(

            (mutations) => {
                mutations.forEach( (mutation) => {
                    const node = mutation.target;
                    const audios = node.querySelectorAll('.audio_row');
                    const blocks = node.querySelectorAll('.post');
                    const videoModal = document.querySelector('.video_box_wrap');
                    const isVideoModal = node.className === 'video_box_wrap';
                    const isVideoQuality = node.className === '_label_text';
                    const canChangeQuality = isVideoModal || isVideoQuality;

                    if (videoModal && canChangeQuality) {
                        video.showV();
                    }

                    if (audios.length > 0) {
                        audio.showA(audios);
                    }

                    if (blocks.length > 0) {
                        audio.getA(blocks);
                    }   

                });
            }

        );

        bodyObserver.observe(body, bodyConfig);
    }

}

export default mediaWatcher;
