import vkObserver from './main';
import { xhr, decodeURL } from '../utils';

class Audio extends vkObserver {
	constructor() {
		super();
	}

	getblob(event) {
		const el = event.target;
		const wrap = el.parentNode;
		const url = el.href;
		const cacheStatus = localStorage.VkObserver_cache;
		const downloaded = event.target.getAttribute('data-enabled');

		if (cacheStatus === 'enabled' && !downloaded) {
			const winUrl = window.URL || window.webkitURL;
			const xhr = new XMLHttpRequest();
			const statusBlock = document.createElement('span');

			event.target.setAttribute('data-enabled', true);
			event.preventDefault();
			event.stopPropagation();

			xhr.responseType = 'blob';
			el.style.visibility = 'hidden';
			statusBlock.className = 'cached-status';
			wrap.appendChild(statusBlock);
			xhr.onprogress = (completion) => {
				const cachedCompletion = Math.floor(completion.loaded / completion.total * 100);
				const cachedPercent = cachedCompletion + '%';

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
					el.removeEventListener('click', this.getblob, false);
					//winUrl.revokeObjectURL(link);
					//el.href = getLink;
				}
			};
			xhr.open('GET', url, true);
			xhr.send(null);
		}

	}

	displayBitrate(e, options) {
		const { url, id, title, duration } = options;
		const bitrateStatus = localStorage.VkObserver_bitrate;

		e.preventDefault();

		xhr({
			url,
			method: 'GET',
			headers: [{
				name: 'Range',
				value: 'bytes=0-1'
			}],
			optional: {
				id,
				title,
				duration,
				calculateBitrate: true,
			}
		})
		.then(data => {
			const { fileSize, bitrate } = data.optional
			const audioContainer = e.target;

			if (bitrateStatus === 'enabled' && !audioContainer.querySelector('.bitrate')) {
				let text;
				if (isNaN(bitrate.kbps) === true) {
					text = '×';
				} else {
					text = `${ bitrate.kbps } кбит/с<span>${ fileSize } МБ</span>`;
				}
				let b = document.createElement('span');
				b.className = 'bitrate';
				b.innerHTML = text.replace('-', '');
				audioContainer.appendChild(b);
			}

		})

	}

	setAudioUrl(options, e) {
		const { id, title, duration } = options
		const isFetching = e.target.getAttribute('data-fetching');
		const isError = e.target.getAttribute('data-fetching-error');
		const isAudio = e.target.className.indexOf('_audio_row') >= 0;
		const isClaimed = e.target.className.indexOf('claimed') >= 0;
		const isDeleted = e.target.className.indexOf('audio_deleted') >= 0;
		const downloadBtn = e.target.querySelector('.download-link');

		// if(isAudio && isFetching && downloadBtn){
		// 	if(downloadBtn.href.indexOf('audio_api_unavailable') >= 0) {
		// 		const newUrl = decodeURL(downloadBtn.href)
		// 		console.log(downloadBtn.href, newUrl)
		// 	}
		// }

		if(isError || isFetching || isClaimed || isDeleted) return;

		if(isAudio && !downloadBtn) {
			e.target.setAttribute('data-fetching', true);

			const form = new FormData();

			form.append('act', 'reload_audio');
			form.append('al', '1');
			form.append('ids', id);

			xhr({
				url: 'https://vk.com/al_audio.php',
				method: 'POST',
				body: form
			})
			.then(response => {
				const filteredUrls = response.result
							.split(',')
							.filter(item => item.indexOf('mp3') >= 0);

				const cleanUrl = filteredUrls[0]
									.replace(/"/g, '')
									.split('?')[0];

				return cleanUrl;
				//return decodeURL(cleanUrl);
			})
			.then(url => {
				const btn = e.target.querySelector('.audio_row_cover_wrap');

				e.target.removeEventListener('mouseover', this.setAudioUrl, false);

				const d = document.createElement('a');

				d.className = 'download-link';
				d.href = url;
				d.setAttribute('download', title);
				d.addEventListener('click', this.getblob, false);
				btn.appendChild(d);

				options.url = url;
				this.displayBitrate(e, options);
			})
			.catch(err => {
				e.target.setAttribute('data-fetch-error', true);
				// console.error('SET_AUDIO_URL', err, JSON.stringify(err))
			})
		}
	}

	showA(audios) {
		let audioBlocks = audios || document.querySelectorAll('.audio_row');
		audioBlocks = [].slice.call(audioBlocks);

		function noBubbling(event) {
			event.stopPropagation();
		}

		if (audioBlocks.length > 0) {
			audioBlocks.forEach(audioBlock => {
				const btn = audioBlock.querySelector('.audio_row_cover_wrap');
				const btnPlay = btn.querySelector('.audio_row_cover_play_icon');
				const audioId = audioBlock.getAttribute('data-full-id');
				const durationBlock = audioBlock.querySelector('.audio_duration').innerText;
				const durationMinutes = durationBlock.split(':')[0];
				const durationSeconds = durationBlock.split(':')[1];
				const duration = (+durationMinutes * 60) + +durationSeconds;

				// if (!btn.querySelector('.download-link') && linkContainer.indexOf('mp3') > 0) {
				if (!btn.querySelector('.download-link')) {
					const audioTitle = audioBlock.querySelector('.audio_title').innerText;
					const audioArtist = audioBlock.querySelector('.audio_performer').innerText;
					const audioName = audioArtist + "-" + audioTitle;
					const audioFullName = audioName.replace(/(<([^>]+)>)|([<>:"\/\\|?*.])/ig, '');
					const options = {id: audioId, title: audioFullName, duration};

					// audioBlock.addEventListener('mouseover', this.displayBitrate.bind(this), false);
					audioBlock.addEventListener(
						'mouseover',
						this.setAudioUrl.bind(this, options),
						false
					);

				}
			})
		}

	}

	getA(entries) {
		let posts = entries || document.querySelectorAll('.post');
		posts = [].slice.call(posts);
		const getAllAudios = event => {
			event.preventDefault();
			const item = event.target.parentNode;

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
					const btn = document.createElement('a');

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
