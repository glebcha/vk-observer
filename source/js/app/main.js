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

			localStorage.VkObserver_cache = storVal.cache === 'disabled'
											?
											'disabled'
											:
											'enabled';
			localStorage.VkObserver_bitrate = storVal.bitrate === 'disabled'
											?
											'disabled'
											:
											'enabled';
			localStorage.VkObserver_scrobble = storVal.scrobble === 'disabled'
											?
											'disabled'
											:
											'enabled';

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
