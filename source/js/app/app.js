import vkObserver from './main';
import Watcher from './watcher';

const vk = new vkObserver();
const watcher = new Watcher();

vk.syncStorage();
watcher.observe();
