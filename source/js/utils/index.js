export function declension(integer, titles, highlight=true, isFull=true) {
    const number = Math.abs(integer)
    const cases = [2, 0, 1, 1, 1, 2]
    const text = titles[
        (number % 100 > 4 && number % 100 < 20)
        ?
        2
        :
        cases[(number % 10 < 5) ? number % 10 : 5]
    ]

    return isFull
            ?
            `${ highlight ? `<i class='int'>${ integer }</i>` : integer } ${ text }`
            :
            `${ text }`
}

export function hash() {
    return Math.random().toString(16).slice(2, 10)
}

export function elementsActive(el, initial='active') {
    if(Array.isArray(el)) {
        el.forEach(
            item => item.className = item.className.indexOf(initial) >= 0
        )
    } else {
        el.className = el.className.indexOf(initial) >= 0
    }
}

export function toggleActive(el, classes={
    initial: 'active',
    active: ' active'
}) {
    const { initial, active } = classes

    if(Array.isArray(el)) {
        Array.prototype.slice.call(el).forEach(
            item => item.className = item.className.indexOf(initial) >= 0
                                    ?
                                    item.className.replace(active, '')
                                    :
                                    `${ item.className }${ active }`
        )
    } else {
        el.className = el.className.indexOf(initial) >= 0
                        ?
                        el.className.replace(active, '')
                        :
                        `${ el.className }${ active }`
    }

}

export function xhr(options) {
    const {
      url,
      method='GET',
      body=null,
      headers=[],
      responseType,
      optional={},
      onProgress = () => {},
    } = options
    const isBlob = responseType && responseType === 'blob';
    const calculateBitrate = optional && optional.calculateBitrate;

    return new Promise(
        (resolve, reject) => {
            const request = new XMLHttpRequest();
            let validStatus = 200;

            request.open(method, url)

            if(headers.length > 0) {
              headers.forEach(header =>
                request.setRequestHeader(header.name, header.value)
              )
            }

            if(responseType) {
                request.responseType = responseType
            }

            if(calculateBitrate) {
                validStatus = 206;
            }

            request.onprogress = onProgress

            request.onreadystatechange = function() {
                if(this.readyState === 4) {
                    if(this.status === validStatus) {
                        if(calculateBitrate) {
                            const duration = optional.duration;
                            const contentRange = request.getResponseHeader('Content-Range')
                            const size = contentRange.split('/').pop();
                        	const sizeLong = Math.floor(size / 1024) / 1024;
                        	const sizeShort = sizeLong.toFixed(1);
                        	const kbit = size / 128;
                        	let kbps = Math.ceil(Math.round(kbit / duration) / 16) * 16;

                        	if (kbps > 320) {
                        		kbps = 320;
                        	}

                            optional.bitrate = { kbit, kbps };
                            optional.fileSize = sizeShort;

                        }

                        resolve(
                            isBlob ? 
                            this.response : 
                            {
                                result: this.response,
                                optional
                            }
                        );
                    } else {
                        const { status, statusText } = this;

                        console.error('XHR Helper', status, statusText);
                        reject({status, statusText});
                    }
                }
            }

            request.send(body)
        }
    )
}

export function isJSON(json) {
  try {
    const obj = JSON.parse(json)
    if (obj && typeof obj === 'object' && obj !== null) {
      return true
    }
  } catch (err) {}
  return false
}

export function isFunction(func) {
    return Object.prototype.toString.call(func) === '[object Function]'
}

export function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}

export function decodeURL(t, userId) {
    function o(encodedURL) {
        if (~encodedURL.indexOf('audio_api_unavailable')) {
            
            let params = encodedURL.split("?extra=")[1].split("#");
            let additionalParams = '' === params[1] ? '' : mapper(params[1]);

            params = mapper(params[0]);

            if (typeof additionalParams != 'string' || !params) return encodedURL;

            additionalParams = additionalParams ? additionalParams.split(String.fromCharCode(9)) : [];
        
            for (let a, r, length = additionalParams.length; length--; ) {
                r = additionalParams[length].split(String.fromCharCode(11));
                a = r.splice(0, 1, params)[0];

                if (!stringModifier[a]) return encodedURL;

                params = stringModifier[a].apply(null, r)
            }

            if (params && "http" === params.substr(0, 4)) return params;

        }

        return encodedURL;
    }

    function mapper(params) {
        let r = "";

        if (!params || params.length % 4 === 1) return !1;

        for (let t, i, a = 0, o = 0; i = params.charAt(o++);) {
            i = vocabulary.indexOf(i);

            ~i
            &&
            (t = a % 4 ? 64 * t + i : i, a++ % 4)
            &&
            (r += String.fromCharCode(255 & t >> (-2 * a & 6)));
        }

        return r;
    }

    function bin(t, e) {
        const o = [];

        if (t.length) {
            let a = t.length;
            for (e = Math.abs(e); a--; )
                e = (t.length * (a + 1) ^ e + a) % t.length,
                o[a] = e
        }
        return o
    }

    const vocabulary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=";
    const stringModifier = {
        v: (t) => t.split("").reverse().join(""),
        r: (string, i) => {
            string = string.split("");

            for (let e, o = vocabulary + vocabulary, length = string.length; length--; )
                e = o.indexOf(string[length]),
                ~e && (string[length] = o.substr(e - i, 1));

            return string.join("")
        },
        s: (string, i) => {
            if (string.length) {
                const binData = bin(string, i);
                let a = 0;
                
                for (string = string.split(''); ++a < string.length;) {
                    const startIndex = binData[string.length - 1 - a];
                    const amount = 1;

                    string[a] = string.splice(startIndex, amount, string[a])[0];
                }
                
                string = string.join('');
            }
            
            return string;
        },
        i: (t, e) => stringModifier.s(t, e ^ userId),
        x: (t, e) => {
            var i = [];
            return e = e.charCodeAt(0),
            each(t.split(""), function(t, o) {
                i.push(String.fromCharCode(o.charCodeAt(0) ^ e))
            }),
            i.join("")
        }
    };
    
    return o(t);    
}

export function defineVideoQuality(quality) {
    let definition;

    switch (quality) {
        case 240:
            definition = 'SD';
            break;
        case 360:
            definition = 'SD';
            break;
        case 480:
            definition = 'SD';
            break;
        case 720:
            definition = 'HD';
            break;
        default:
            definition = 'FullHD';
            break;
    }

    return `Загрузить - ${ definition }`;
}
