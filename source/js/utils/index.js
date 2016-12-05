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
      optional={}
    } = options
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

            if(calculateBitrate) {
                validStatus = 206;
            }

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

                        resolve({
                            result: this.response,
                            optional
                        });
                    }
                    else {
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
