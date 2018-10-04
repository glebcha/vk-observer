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