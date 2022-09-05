/* global browser */

browser.browserAction.onClicked.addListener((tab) => {
	browser.tabs.create({
		url:"options.html?url=" + encodeURIComponent(tab.url)
	});
});

