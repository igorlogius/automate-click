/* global browser */

browser.browserAction.onClicked.addListener((tab, clickData) => {
  browser.tabs.create({
    url: "options.html?url=" + encodeURIComponent(tab.url),
  });
});

// url_regex => {...}
let store = [];

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

async function onStorageChanged(changes, area) {
  var res = await browser.storage.local.get("selectors");
  store = res.selectors;
}

function onWebNavigationCompleted(details) {
  const tmp = new Set();
  store.forEach((e) => {
    if (typeof e.enabled === "boolean" && e.enabled) {
      if (
        typeof e.urlregex === "string" &&
        new RegExp(e.urlregex).test(details.url)
      ) {
        tmp.add(e);
      }
    }
  });
  if (tmp.size > 0) {
    browser.tabs.sendMessage(details.tabId, tmp);
  }
}

browser.storage.onChanged.addListener(onStorageChanged);
browser.webNavigation.onCompleted.addListener(onWebNavigationCompleted);

onStorageChanged();
