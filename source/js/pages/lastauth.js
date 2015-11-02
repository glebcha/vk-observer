window.onload = () => {
	const token = window.location.search.replace('?token=', '');
	const storage = chrome.storage.sync;
	let userName = document.querySelector('.user');

	storage.get('lastkeys', (data) => {
		const apiKey = data.lastkeys.api;
		const apiSecret = data.lastkeys.secret;
		let lastfm = new LastFM({
			apiKey: apiKey,
			apiSecret: apiSecret
		});
		lastfm.auth.getSession({
			token: token
		}, {
			success: (data) => {

				storage.set({'lastsession': data.session.key}, () => {
						chrome.tabs.query({'url': '*://vk.com/*'}, (tabs) => {
							tabs.forEach( (tab) => {
								chrome.tabs.executeScript(tab.id, {
							  		file: "js/vk-observer.js"
								});
							});
						});
						userName.innerHTML = data.session.name + ',' + userName.innerHTML;
					}
				)
			},
			error: (code, message) => {
				console.log("Ошибка: " + message + " код: " + code);
			}
		});
	});
};