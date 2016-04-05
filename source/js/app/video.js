class Video {
    constructor() {}

    showV(main, box) {
        let videoWrap = document.querySelector('#mv_layer_wrap');
        let parent = main || videoWrap;

        function getvideo(event) {
            event.preventDefault();
            event.stopPropagation();

            let el = event.target,
                url = el.getAttribute('href')
                name = el.getAttribute('download')
                        .replace(/[\s\|\/:?~<>*]/g, '-');

            chrome.runtime.sendMessage(
                {query: 'getvideo', url: url, name: name},
                (response) => {
                    //console.log(response);
                }
            );

        };

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.query === 'downloadvideo') {
                //console.log(request); -> fired multiple times - fix!
                sendResponse({message: "done"});
            }
        });

        if (parent) {
            let videoBox = box || videoWrap.querySelector('#mv_box'),
                quality = [240, 360, 480, 720],
                reg = new RegExp(quality.join("|"), "i");

            if (videoBox) {
                let sideBar = parent.querySelector('.mv_actions_panel>.clear_fix'),
                    videoTitle = parent.querySelector('.mv_min_title').innerText,
                    el = document.createElement('div'),
                    downloadBtn = document.createElement('div');
                videoTitle = /^\s*$/.test(videoTitle) ? 'VK-Video' : videoTitle;
                el.className = 'arr_div idd_wrap mv_more fl_l';
                downloadBtn.className = 'idd_selected_value idd_arrow';
                downloadBtn.innerHTML = 'Загрузить';
                el.appendChild(downloadBtn);
                if (!sideBar.querySelector('.arr_div')) {
                    sideBar.appendChild(el);
                }
                let html5 = videoBox.querySelector('video'),
                    embed = videoBox.querySelector('embed');
                if (html5) {
                    let sourceString = html5
                                        .getAttribute('src')
                                        .split('mp4')
                                        .slice(0, 1)
                                        .toString() + "mp4",
                        videoDownload = document.createElement('a');
                        videoDownload.className = 'html5-video';
                        videoDownload.href = sourceString;
                        videoDownload.setAttribute('download', videoTitle);
                        videoDownload.innerHTML = '<span class="download-icon"></span>Загрузить видео';
                    el.appendChild(videoDownload);
                } else {
                    if (!embed) {
                        return;
                    } else {
                        let arr = embed.getAttribute('flashvars').split('url'),
                            newArr = arr.filter(function(arg) {
                                return arg.match(reg);
                            }),
                            filtered = newArr.join().split(/=|extra|%3F/),
                            urlArr = filtered.filter(function(val) {
                                return val.match(/http|https/);
                            }),
                            filteredUrlArr = urlArr.map(function(item) {
                                return decodeURIComponent(item);
                            }),
                            cleanUrlArr = filteredUrlArr.filter(function(url) {
                                return url.match(/mp4/);
                            }),
                            noDupsUrls = (() => {
                                var newArr = [];
                                for (var i = 0; i < quality.length; i++) {
                                    var q = quality[i];
                                    for (var k = 0; k < cleanUrlArr.length; k++) {
                                        var a = cleanUrlArr[k];
                                        if (a.indexOf(q) > 0) {
                                            newArr.push(a);
                                            break;
                                        }
                                    }
                                }
                                return newArr;
                            })(),
                            htmlUrls = noDupsUrls.map( (link) => {
                                let finalVideoQuality = '',
                                    videoQuality = link
                                                    .split('/')
                                                    .pop()
                                                    .match(reg)[0];
                                switch (videoQuality) {
                                    case '240':
                                        finalVideoQuality = 'плохое качество (' + videoQuality + ')';
                                        break;
                                    case '360':
                                        finalVideoQuality = 'низкое качество (' + videoQuality + ')';
                                        break;
                                    case '480':
                                        finalVideoQuality = 'среднее качество (' + videoQuality + ')';
                                        break;
                                    case '720':
                                        finalVideoQuality = 'высокое качество (' + videoQuality + ')';
                                        break;
                                    default:
                                        finalVideoQuality = 'качество (' + videoQuality + ')';
                                        break;
                                }

                                return '<li><a href="' + link + '" download="' + videoTitle + '">' + finalVideoQuality + '</a></li>';
                            }),
                            popup = document.createElement('div'),
                            uArr = document.createElement('ul');
                        popup.className = 'idd_popup';
                        uArr.innerHTML = htmlUrls.join('');
                        popup.appendChild(uArr);
                        el.appendChild(popup);
                        [].slice.call(el.querySelectorAll('ul>li>a')).forEach( (btn) => {
                            btn.addEventListener('click', getvideo, false);
                        })

                    }
                }
            }
        }
    }
}

export default Video
