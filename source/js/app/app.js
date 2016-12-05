import vkObserver from './main';
import Audio from './audio';
import Video from './video';
import Watcher from './watcher';

let vk = new vkObserver(),
    audio = new Audio(),
    video = new Video(),
    watcher = new Watcher();

vk.syncStorage();
audio.showA();
// audio.getA();
video.showV();
watcher.pageM();
watcher.bodyM();
