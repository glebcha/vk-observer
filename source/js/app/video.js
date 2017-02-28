import { xhr, defineVideoQuality } from '../utils';

class Video {
    constructor() {
        this.currentQuality = 0;
    }

    showV(main, box) {
        let videoWrap = document.querySelector('#mv_layer_wrap');
        let parent = main || videoWrap;

        if (parent) {
            const videoBox = box || videoWrap.querySelector('#mv_box');

            if (videoBox) {
                const html5 = videoBox.querySelector('video');
                const sourceString = html5 && html5.getAttribute('src');

                const videoSrc = sourceString
                                &&
                                sourceString.split('?').slice(0, 1).toString();

                const isBlob = new RegExp('blob', 'g').test(videoSrc);
                const qualityItem = parent.querySelector('.videoplayer_quality ._label_text');
                const qualityValue = qualityItem && parseInt(qualityItem.innerHTML);
                const quality = qualityValue && defineVideoQuality(qualityValue);
                const sideBar = parent.querySelector('.mv_actions_block>.clear_fix');
                const downloadBtn = sideBar && sideBar.querySelector('.mv_get_btn');

                let videoTitle = parent.querySelector('.mv_min_title').innerText;
                videoTitle = /^\s*$/.test(videoTitle) ? 'VK-Video' : videoTitle;

                if (html5 && !isBlob) {

                    if (sideBar && !downloadBtn) {
                        const btn = document.createElement('a');

                        btn.href = videoSrc;
                        btn.innerHTML = quality;
                        btn.setAttribute('download', videoTitle);
                        btn.className = 'mv_get_btn flat_button';
                        sideBar.appendChild(btn);
                        this.currentQuality = qualityValue;
                    }
                    else if(sideBar && downloadBtn && qualityValue !== this.currentQuality) {
                        downloadBtn.href = videoSrc;
                        downloadBtn.innerHTML = quality;
                        downloadBtn.setAttribute('download', videoTitle);
                        this.currentQuality = qualityValue;
                    }

                }

            }
        }
    }
}

export default Video
