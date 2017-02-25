import { xhr } from '../utils';

class Video {
    constructor() {}

    showV(main, box) {
        let videoWrap = document.querySelector('#mv_layer_wrap');
        let parent = main || videoWrap;

        function getvideo(event) {
            event.preventDefault();
            event.stopPropagation();

            const el = event.target;
            const url = el.getAttribute('href');
            const name = el.getAttribute('download')
                        .replace(/[\s\|\/:?~<>*]/g, '-');

            chrome.runtime.sendMessage(
                {query: 'getvideo', url, name},
                (response) => {
                    //console.log(response);
                }
            );

        };

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.query === 'downloadvideo') {
                console.log(request, sender, sendResponse)
                //console.log(request); -> fired multiple times - fix!
                sendResponse({message: "done"});
            }
        });

        if (parent) {
            const videoBox = box || videoWrap.querySelector('#mv_box');

            if (videoBox) {
                const html5 = videoBox.querySelector('video');
                const videoSrc = html5 && html5.getAttribute('src');
                const isBlob = new RegExp('blob', 'g').test(videoSrc);
                const qualityItems = parent.querySelectorAll('.videoplayer_quality_select ._item');
                const sideBar = parent.querySelector('.mv_actions_block>.clear_fix');

                let videoTitle = parent.querySelector('.mv_min_title').innerText;
                videoTitle = /^\s*$/.test(videoTitle) ? 'VK-Video' : videoTitle;

                if(isBlob) {

                }
                else if (html5 && !isBlob) {
                    const sourceString = videoSrc
                                        .split('mp4')
                                        .slice(0, 1)
                                        .toString()
                                        .replace(/\b\.?\d{3}\b/, '');

                    if (sideBar && !sideBar.querySelector('.arr_div')) {
                        const qualityRange = [].slice.call(qualityItems)
                                            .map(item => {

                                                if(item.style.display !== 'none') {
                                                    const videoQuality = parseInt(item.innerHTML);
                                                    let finalVideoQuality;

                                                    switch (videoQuality) {
                                                        case 240:
                                                            finalVideoQuality = `плохое качество (${ videoQuality })`;
                                                            break;
                                                        case 360:
                                                            finalVideoQuality = `низкое качество (${ videoQuality })`;
                                                            break;
                                                        case 480:
                                                            finalVideoQuality = `среднее качество (${ videoQuality })`;
                                                            break;
                                                        case 720:
                                                            finalVideoQuality = `высокое качество (${ videoQuality })`;
                                                            break;
                                                        default:
                                                            finalVideoQuality = `качество (${ videoQuality })`;
                                                            break;
                                                    }

                                                    return `<li><a href="${
                                                        sourceString
                                                    }${
                                                        videoQuality
                                                    }.mp4" download="${
                                                        videoTitle
                                                    }">${
                                                        finalVideoQuality
                                                    }</a></li>`;
                                                }

                                            });

                        const el = document.createElement('div');
                        const downloadBtn = document.createElement('div');
                        const popup = document.createElement('div');
                        const uArr = document.createElement('ul');

                        el.className = 'arr_div idd_wrap mv_more fl_l';
                        downloadBtn.innerHTML = 'Загрузить';
                        downloadBtn.className = 'idd_selected_value idd_arrow';
                        popup.className = 'idd_popup';
                        uArr.innerHTML = qualityRange.join('');
                        popup.appendChild(uArr);
                        el.appendChild(downloadBtn);
                        el.appendChild(popup);
                        sideBar.appendChild(el);
                        [].slice.call(el.querySelectorAll('ul>li>a'))
                        .forEach(btn => {
                            btn.addEventListener('click', getvideo, false);
                        })
                    }

                }

            }
        }
    }
}

export default Video
