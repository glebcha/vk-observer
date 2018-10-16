import vkObserver from './main';
import { xhr, decodeURL, getJSON } from '../utils';

class Audio extends vkObserver {
	constructor() {
		super();
		this.getAllAudios = this.getAllAudios.bind(this);
	}

	getBlob(event) {
		const el = event.target;
		const wrap = el.parentNode;
		const url = el.href;
		const downloaded = event.target.getAttribute('data-enabled');

		if (!downloaded) {
			const statusBlock = document.createElement('span');

			event.target.setAttribute('data-enabled', true);
			event.preventDefault();
			event.stopPropagation();

			el.style.visibility = 'hidden';
			statusBlock.className = 'cached-status';
			wrap.appendChild(statusBlock);

			xhr({
				url,
				method: 'GET',
				responseType: 'blob',
				onProgress: (completion) => {
					const cachedCompletion = Math.floor(completion.loaded / completion.total * 100);
					const cachedPercent = cachedCompletion + '%';
	
					statusBlock.innerHTML = '';
					statusBlock.innerHTML = cachedPercent;
	
					if (cachedPercent === '100%') {
						statusBlock.remove();
						el.style.visibility = 'visible';
					}
				},
			}).then((response) => {
				const winUrl = window.URL || window.webkitURL;
				const blob = new window.Blob([response], {
					'type': 'audio/mpeg'
				});
				const link = winUrl.createObjectURL(blob);

				el.href = link;

				el.click();
				el.removeEventListener('click', this.getBlob, false);
				// winUrl.revokeObjectURL(link);
				// el.href = getLink;
			});
		}

	}

	displayBitrate(target, options) {
		const { url, id, title, duration } = options;
		const bitrateStatus = localStorage.VkObserver_bitrate;

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

			if (bitrateStatus === 'enabled' && !target.querySelector('.bitrate')) {
				let text;
				if (isNaN(bitrate.kbps) === true) {
					text = '×';
				} else {
					text = `${ bitrate.kbps } кбит/с<span>${ fileSize } МБ</span>`;
				}
				let b = document.createElement('span');

				b.className = 'bitrate';
				b.innerHTML = text.replace('-', '');
				target.appendChild(b);
			}

		})

	}

	setAudioUrl(target, options) {
		const { id, title, duration, userId, extensionId } = options;
		const isError = target.getAttribute('data-fetch-error');
		const isFetching = target.getAttribute('data-fetching');
		const downloadBtn = target.querySelector('.download-link');
		const audioInfo = target.querySelector('.audio_row__inner');

		if(isFetching) return;

		target.setAttribute('data-fetching', true);
		
		const form = new FormData();
		
		form.append('act', 'reload_audio');
		form.append('al', '1');
		form.append('ids', extensionId);
					
		return xhr({
			url: 'https://vk.com/al_audio.php',
			method: 'POST',
			body: form
		})
		.then(response => {
			const filteredUrls = response.result
									.split(',')
									.filter(item => item.indexOf('mp3') >= 0);
						
			const cleanUrl = filteredUrls[0].replace(/^"(.+(?="$))"$/, '$1');

			return decodeURL(cleanUrl, userId);
		})
		.then(url => {
			let error = false;

			target.removeAttribute('data-fetching');
			target.removeAttribute('data-fetch-error');
		
			if(url.indexOf('audio_api_unavailable') >= 0) {
				error = true;
				target.setAttribute('data-fetch-error', true);
			}
		
			if(!error && !downloadBtn) {
				const d = document.createElement('a');

				target.setAttribute('data-fetched', true);
		
				d.className = 'download-link';
				d.href = url;
				d.setAttribute('download', title);
				d.addEventListener('click', this.getBlob, false);
				audioInfo.insertBefore(d, audioInfo.firstChild);
		
				options.url = url;
				this.displayBitrate(target, options);
			}
		
		})
		.catch(err => {
			target.removeAttribute('data-fetching');
			target.setAttribute('data-fetch-error', true);
			// console.error('SET_AUDIO_URL', err, JSON.stringify(err))
		})
	}

	getAudioExtra(audioData) {
		const {
			content_id, 
			duration, 
			vk_id
		} = audioData.find(el => el && [].toString.call(el) === "[object Object]")
		const extensions = audioData.filter(el => el && [].toString.call(el) === "[object String]" && !el.match(/http?s/g) && el.match(/\/\//g))
		const extensionDatas = extensions.length && 
			extensions[0]
			.split('/')
			.map(item => item.replace('/', ''))
			.filter(item => item.length > 0) 
		const extensionId = `${content_id}_${extensionDatas[2]}_${extensionDatas[extensionDatas.length - 1]}, ${content_id}`

		return {
			extensionId,
			content_id, 
			duration, 
			vk_id,
		}
	}

	getAudioBlockOptions(audioBlock) {
		const audioData = getJSON(audioBlock.getAttribute('data-audio'));
		const {
			extensionId,
			content_id, 
			duration, 
			vk_id,
		} = this.getAudioExtra(audioData)
		const audioTitle = audioBlock.querySelector('.audio_row__title_inner').innerText;
		const audioArtist = audioBlock.querySelector('.audio_row__performers').innerText;
		const audioName = audioArtist + "-" + audioTitle;
		const audioFullName = audioName.replace(/(<([^>]+)>)|([<>:"\/\\|?*.])/ig, '');

		return {
			id: content_id, 
			title: audioFullName, 
			userId: vk_id,
			duration,
			extensionId,
		};
	}

	showA(audios) {
		let audioBlocks = audios || document.querySelectorAll('.audio_row');
		audioBlocks = [].slice.call(audioBlocks);

		if (audioBlocks.length > 0) {
			audioBlocks.forEach(audioBlock => {
				const btn = audioBlock.querySelector('.audio_row_content');

				if (!btn.querySelector('.download-link')) {
					const self = this;
					const options = this.getAudioBlockOptions(audioBlock);

					audioBlock.addEventListener(
						'mouseover',
						function handler(e) {
							const isClaimed = this.className.indexOf('claimed') >= 0;
							const isDeleted = this.className.indexOf('audio_deleted') >= 0;
							const isFetched = this.getAttribute('data-fetched');
					
							if(isFetched || isClaimed || isDeleted) {
								this.removeEventListener('mouseover', handler, false);
							}

							self.setAudioUrl(this, options);
						},
						false
					);

				}
			})
		}

	}

	getAllAudios(event) {
		event.preventDefault();
		const btn = event.target
		const item = btn.parentNode;
		const isFetching = btn.getAttribute('data-fetching');
		const notFetchedAudioRows = item.querySelectorAll('.audio_row:not([data-fetched]):not([data-fetching])')
		
		if (isFetching || notFetchedAudioRows.length === 0) return

		btn.setAttribute('data-fetching', true)

		Promise.all([].slice.call(notFetchedAudioRows).map(audioBlock => {
			const options = this.getAudioBlockOptions(audioBlock);
			return this.setAudioUrl(audioBlock, options)
				.then(() => {
					const downloadBtn = audioBlock.querySelector('.download-link')
					downloadBtn && downloadBtn.click()
				})
		}))
		.then(() => btn.removeAttribute('data-fetching'))
		.catch(() => btn.removeAttribute('data-fetching'))
	}

	getA(entries) {
		let posts = entries || document.querySelectorAll('.post');
		posts = [].slice.call(posts);

		posts.forEach((post) => {
			let wallText = post.querySelector('.wall_text');

			if(wallText === null) {
				wallText = post;
			}

			if (post !== undefined && post !== null) {
				if (wallText.querySelectorAll('.audio_row').length > 1) {
					const btn = document.createElement('a');
					const btnHTML = `Загрузить все
						<span class="download-tooltip">
							Нажмите, чтобы загрузить все аудиозаписи
						</span>
					`

					btn.href = '#';
					btn.className = 'download-all-link';
					btn.innerHTML = btnHTML;
					btn.addEventListener('click', this.getAllAudios, false);

					if (!post.querySelector('.download-all-link')) {
						wallText.appendChild(btn);
					}

				}
			}
		})
	}
}

export default Audio
