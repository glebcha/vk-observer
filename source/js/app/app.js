import vkObserver from './main';
import Audio from './audio';
import Video from './video';
import Watcher from './watcher';

const vk = new vkObserver();
const audio = new Audio();
const video = new Video();
const watcher = new Watcher();

vk.syncStorage();
audio.showA();
// audio.getA();
video.showV();
watcher.pageM();
watcher.bodyM();
