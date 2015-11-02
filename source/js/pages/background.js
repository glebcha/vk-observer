chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.query === 'getvideo') {
    	chrome.downloads.download({
            url: request.url,
            filename: request.name + '.mp4'
        });
        sendResponse({message: "started video"});
    }
});