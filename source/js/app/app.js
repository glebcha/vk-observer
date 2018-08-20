import vkObserver from './main';
import Watcher from './watcher';

const vk = new vkObserver();
const watcher = new Watcher();

vk.syncStorage();
watcher.observe();

chrome.runtime.onMessage.addListener(({query, details}, sender, sendResponse) => {
  const pattern = new RegExp('queue_connection_events_queue', 'gi');

  if (query === 'relogin') {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.match(pattern)) {
        localStorage.setItem('VK_OBSERVER_ID', key.replace(/\D+/g, ''))
        break;
      }
    }
  }
});
