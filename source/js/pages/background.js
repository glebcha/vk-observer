let tabId;

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.query === 'getvideo') {
    	chrome.downloads.download({
            url: request.url,
            filename: request.name + '.mp4'
        }, (id) => {
        	tabId = sender.tab.id;
        	//console.info("started video " + id, tabId);
        	sendResponse({message: "started '" + request.name + "'' video with id" + id});
        });
        return true;
    }
});

chrome.downloads.onChanged.addListener((details) => {
   	if(details.state && details.state.current == "complete"){
  		chrome.tabs.sendMessage(
  		tabId,
  		{query: 'downloadvideo', details: details}, (response) => {
    		//console.log(response);
  		});
   	}
});
