const extId = "automate-click";
const temporary = browser.runtime.id.endsWith("@temporary-addon"); // debugging?

let runningTIDs = [];

const log = (level, msg) => {
  level = level.trim().toLowerCase();
  if (
    ["error", "warn"].includes(level) ||
    (temporary && ["debug", "info", "log"].includes(level))
  ) {
    console[level](extId + "::" + level.toUpperCase() + "::" + msg);
    return;
  }
};

function getRandomInt(min, max) {
  if (max <= min) return 0;
  return Math.floor(Math.random() * (max - min)) + min;
}

function waitFor(selector) {
  log("debug", JSON.stringify(selector, null, 4));

  if (selector.repeatdelay > 0 && selector.maxrepeats === 0) {
    return;
  }

  if (selector.maxrepeats > 0) {
    selector.maxrepeats--;
  }

  if (selector.xclickpos > 0 || selector.yclickpos > 0) {
    const elem = document.elementFromPoint(
      selector.xclickpos,
      selector.yclickpos
    );
    if (typeof elem.click === "function") {
      elem.click();
      log("debug", "item by coordinates clicked");
    } else {
      log("warn", "item by coordinates has no click function");
    }
  } else {
    for (const item of document.querySelectorAll(selector.cssselector)) {
      if (item) {
        if (typeof item.click === "function") {
          item.click(); // click item
          log("debug", "item by selector clicked");
        } else {
          log("warn", "item by selector has no click function");
        }
      }
    }
  }

  if (selector.repeatdelay > 0) {
    const min = selector.repeatdelay - selector.randomrepeatvariance;
    const max = selector.repeatdelay + selector.randomrepeatvariance;
    const tovalue =
      max - min > 0 ? getRandomInt(min, max) : selector.repeatdelay;
    log("debug", "waitTime: " + tovalue);
    setTimeout(function () {
      waitFor(selector);
    }, tovalue);
  }
} // waitFor end

async function onMessage(selectors) {
  runningTIDs.forEach((tid) => {
    try {
      clearTimeout(tid);
    } catch (e) {
      // noop
    }
  });

  runningTIDs = [];

  selectors.forEach((selector) => {
    runningTIDs.push(
      setTimeout(function () {
        selector.maxrepeats--; // negativ maxrepeats will continue forever
        waitFor(selector);
      }, selector.initaldelay || 3000)
    ); // wait initaldelay
  });
}

browser.runtime.onMessage.addListener(onMessage);
