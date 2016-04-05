import vkObserver from './main';

class Audio extends vkObserver {
	constructor() {
		super();
	}

	showA(audios) {
		let audioBlocks = audios || document.querySelectorAll('.audio_row');
		audioBlocks = [].slice.call(audioBlocks);

		function noBubbling(event) {
			event.stopPropagation();
		}

		function getblob(event) {
			const el = event.target,
				wrap = el.parentNode,
				url = el.href,
				cacheStatus = localStorage.VkObserver_cache
			if (cacheStatus === 'enabled') {
				event.preventDefault();
				event.stopPropagation();
				const winUrl = window.URL || window.webkitURL,
					xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				el.style.visibility = 'hidden';
				let statusBlock = document.createElement('span');
				statusBlock.className = 'cached-status';
				wrap.appendChild(statusBlock);
				xhr.onprogress = (completion) => {
					const cachedCompletion = Math.floor(completion.loaded / completion.total * 100),
						cachedPercent = cachedCompletion + '%';

					statusBlock.innerHTML = '';
					statusBlock.innerHTML = cachedPercent;

					if (cachedPercent === '100%') {
						statusBlock.remove();
						el.style.visibility = 'visible';
					}

				};
				xhr.onreadystatechange = function(response) {
					if (xhr.readyState === 4 && xhr.status === 200) {
						const blob = new window.Blob([this.response], {
							'type': 'audio/mpeg'
						});
						const link = winUrl.createObjectURL(blob);
						el.href = link;
						el.click();
						el.removeEventListener('click', getblob, false);
						//winUrl.revokeObjectURL(link);
						//el.href = getLink;
					}
				};
				xhr.open('GET', url, true);
				xhr.send(null);
			}

		};

		function displayBitrate(event) {
			event.preventDefault();
			let audioContainer = this,
				linkBtn = audioContainer.querySelector('.audio_play_wrap'),
				audioLink = audioContainer
							.getAttribute('data-url')
							.split('?')
							.splice(0, 1)
							.toString(),
				audioDurationSeconds = audioContainer
										.getAttribute('data-duration'),
				bitrateStatus = localStorage.VkObserver_bitrate;

			let bitRate = (callback) => {
				let xmlhttp = new XMLHttpRequest();
				xmlhttp.overrideMimeType('text/xml');

				xmlhttp.onreadystatechange = () => {
					if (xmlhttp.readyState === 4 && xmlhttp.status === 206) {
						let range = xmlhttp.getResponseHeader('Content-Range'),
							size = range.split('/').pop(),
							sizeLong = Math.floor(size / 1024) / 1024,
							sizeShort = sizeLong.toFixed(1),
							kbit = size / 128,
							kbps = Math.ceil(Math.round(kbit / audioDurationSeconds) / 16) * 16;

						if (kbps > 320) {
							kbps = 320;
						}

						callback([kbps, sizeShort]);
					}
				};
				xmlhttp.open("GET", audioLink, true);
				xmlhttp.setRequestHeader('Range', 'bytes=0-1');
				xmlhttp.send();
			};

			if (bitrateStatus === 'enabled') {
				bitRate(
					(response) => {
						let fileRate = response[0],
							fileSize = response[1];
						if (!audioContainer.querySelector('.bitrate')) {
							let text;
							if (isNaN(fileRate) === true) {
								text = '×';
							} else {
								text = fileRate + ' кбит/с' + '<span>' + fileSize + ' МБ</span>';
							}
							let b = document.createElement('span');
							b.className = 'bitrate';
							b.innerHTML = text.replace('-', '');
							audioContainer.appendChild(b);
							audioContainer.removeEventListener('mouseover', displayBitrate);
						}
					}
				);
			}
		};

		if (audioBlocks.length > 0) {
			audioBlocks.forEach( (audioBlock) => {
				let btn = audioBlock.querySelector('.audio_play_wrap'),
					btnPlay = btn.querySelector('.audio_play'),
					linkContainer = audioBlock.getAttribute('data-url'),
					getLink = linkContainer.split('?').splice(0, 1).toString();
				if (!btn.querySelector('.download-link') && linkContainer.indexOf('mp3') > 0) {
					const audioTitle = audioBlock.getAttribute('data-title'),
						audioArtist = audioBlock.getAttribute('data-performer'),
						audioName = audioArtist + "-" + audioTitle,
						audioFullName = audioName.replace(/\./g, ''),
						audioDurationBlock = audioBlock.getAttribute('data-duration');
					let d = document.createElement('a');
					d.className = 'download-link';
					d.href = getLink;
					d.setAttribute('download', audioFullName);
					d.addEventListener('click', noBubbling, false);
					d.addEventListener('click', getblob, false);
					btn.appendChild(d);
					audioBlock.addEventListener('mouseover', displayBitrate, false);
				} else if(
					!this.findClosest(audioBlock, '.feed_row') &&
					linkContainer.indexOf('mp3') < 0 &&
					audioBlock.className.indexOf('restricted') < 0
				) {
					audioBlock.className += ' restricted'
				}
			})
		}

	}

	getA(entries) {
		let posts = entries || document.querySelectorAll('.post');
		posts = [].slice.call(posts);
		let getAllAudios = function(event) {
			event.preventDefault();
			let item = event.target.parentNode;
			for (let z = 0; z < item.querySelectorAll('.audio_row').length; z++) {
				item.querySelectorAll('.download-link')[z].click();
			}
		}

		posts.forEach( (post) => {
			let wallText = post.querySelector('.wall_text');
			if(wallText === null) {
				wallText = post;
			}
			if (post !== undefined && post !== null) {
				if (wallText.querySelectorAll('.audio_row').length > 1) {
					let btn = document.createElement('a');
					btn.href = '#';
					btn.className = 'download-all-link';
					btn.innerHTML = 'Загрузить все<span class="download-tooltip">Нажмите, чтобы загрузить все аудиозаписи</span>';
					btn.addEventListener('click', getAllAudios, false);
					if (!post.querySelector('.download-all-link')) {
						wallText.appendChild(btn);
					}
				}
			}
		})
	}


}

export default Audio
