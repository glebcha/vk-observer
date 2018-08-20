const storage = chrome.storage.sync;

chrome.tabs.onUpdated.addListener((tabId, { status, url }, tab) => {
  if (status && url && url.match(/\/login/g)) {
    storage.set({notifyLogin: true});
  }

  storage.get('notifyLogin', ({notifyLogin}) => {
    if (typeof notifyLogin === undefined) {
      storage.set({notifyLogin: false})
    }

    if (notifyLogin && !tab.url.match(/\/login/g)) {
      chrome.tabs.sendMessage(tabId, {query: 'relogin', details: notifyLogin});
      storage.set({notifyLogin: false})
    }
  })
  
})

chrome.runtime.onMessage.addListener((request) => {
  const {id, videoSrc, videoTitle} = request;
  const nameChunks = videoSrc.split('.');
  const extension = nameChunks[nameChunks.length - 1];
  
  if (id === 'video') {
    chrome.downloads.download({
      url: videoSrc,
      filename: `${videoTitle}.${extension}`,
    });
  }
});