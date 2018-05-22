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

                if (sourceString) {
                    const videoSrc = sourceString
                                &&
                                sourceString.split('?').slice(0, 1).toString();

                    const isBlob = new RegExp('blob', 'g').test(videoSrc);
                    const qualityItem = parent.querySelector('.videoplayer_quality_select_label_text');
                    const qualityValue = qualityItem && parseInt(qualityItem.innerHTML);
                    const quality = qualityValue && defineVideoQuality(qualityValue);
                    const sideBar = parent.querySelector('.mv_actions_block>.clear_fix');
                    const downloadBtn = sideBar && sideBar.querySelector('.video_btn');

                    let videoTitle = parent.querySelector('.mv_min_title').innerText;
                    videoTitle = /^\s*$/.test(videoTitle) ? 'VK-Video' : videoTitle;

                    if (!isBlob && sideBar && !downloadBtn) {
                        const btn = document.createElement('a');

                        btn.href = videoSrc;
                        btn.innerHTML = `<span class='like_button_label'>${quality}</span>`;
                        btn.setAttribute('download', videoTitle);
                        btn.className = 'like_btn video_btn';
                        btn.addEventListener('click', function(event) {
                            const {href, download} = this;

                            event.preventDefault();
                            chrome.runtime.sendMessage({
                                id: 'video', 
                                videoSrc: href, 
                                videoTitle: download.replace(/(<([^>]+)>)|([<>:"\/\\|?*.])/ig, '')
                            });
                        });
                        sideBar.appendChild(btn);
                        this.currentQuality = qualityValue;
                    }
                    else if(!isBlob && sideBar && downloadBtn && qualityValue !== this.currentQuality) {
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
