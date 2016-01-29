class vkObserver {

	constructor() {
		this.storageSettings = {
            'settings': {
                "bitrate": 'enabled',
                "cache": 'enabled',
                "scrobble": 'disabled'
            }
        }
	}

	clearStorage() {
		chrome.storage.sync.clear();
		chrome.storage.sync.set(this.storageSettings);
	}

	syncStorage() {
		const storage = chrome.storage.sync;
		storage.get('settings', (data) => {
			const storVal = data.settings;
			if (storVal === undefined) {
				this.clearStorage();
				localStorage.VkObserver_cache = 'enabled';
				localStorage.VkObserver_bitrate = 'enabled';
				localStorage.VkObserver_scrobble = 'disabled';
			}
			if (storVal.cache === 'enabled') {
				localStorage.VkObserver_cache = 'enabled';
			}
			if (storVal.bitrate === 'enabled') {
				localStorage.VkObserver_bitrate = 'enabled';
			}
			if (storVal.scrobble === 'enabled') {
				localStorage.VkObserver_scrobble = 'enabled';
			}
			if (storVal.cache === 'disabled') {
				localStorage.VkObserver_cache = 'disabled';
			}
			if (storVal.bitrate === 'disabled') {
				localStorage.VkObserver_bitrate = 'disabled';
			}
			if (storVal.scrobble === 'disabled') {
				localStorage.VkObserver_scrobble = 'disabled';
			}

		});
	}


	findClosest(el, selector) {
		let matchesFn;

		['matches','webkitMatchesSelector'].some((fn) => {
			if (typeof document.body[fn] === 'function') {
				matchesFn = fn;
				return true;
			}
			return false;
		})

		while (el!==null) {
			parent = el.parentElement;
			if (parent!==null && parent[matchesFn](selector)) {
				return parent;
			}
			el = parent;
		}

		return null;
	}

}

export default vkObserver
