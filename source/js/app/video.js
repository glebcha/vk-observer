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
                name = el.getAttribute('download');

            chrome.runtime.sendMessage(
                {query: 'getvideo', url: url, name: name}, 
                (response) => {
                    console.log(response);
                }
            );

        };

        if (parent) {
            let videoBox = box || videoWrap.querySelector('.video_box'),
                quality = [240, 360, 480, 720],
                reg = new RegExp(quality.join("|"), "i");

            if (videoBox) {
                let sideBar = parent.querySelector('.mv_share_actions'),
                    videoTitle = parent.querySelector('.mv_min_title').innerText,
                    el = document.createElement('div');
                el.className = 'arr_div';
                if (!sideBar.querySelector('.arr_div')) {
                    sideBar.appendChild(el);
                }
                let html5 = videoBox.querySelector('video'),
                    embed = videoBox.querySelector('embed');
                if (html5) {
                    let sourceString = html5.getAttribute('src').split('mp4').slice(0, 1).toString() + "mp4",
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
                                    videoQuality = link.match(reg)[0];
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

                                return '<li><a href="' + link + '" download="' + videoTitle + '" class="flat_button">' + finalVideoQuality + '</a></li>';
                            }),
                            uArr = document.createElement('ul');
                            uArr.innerHTML = htmlUrls.join('');
                        el.appendChild(uArr);
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