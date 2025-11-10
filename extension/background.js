// background.js
async function sendToggle(tabId) {
  try {
    await browser.tabs.sendMessage(tabId, { type: "TOGGLE_OVERLAY" });
    return;
  } catch (e) {
    // No receiver – attempt to inject the content script then try again.
  }
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["content-script.js"],
    });
    // First activation should only show the overlay with drawing OFF
    await browser.tabs.sendMessage(tabId, { type: "SHOW_OVERLAY" });
  } catch (e) {
    // Ignore if injection isn't allowed on this page.
  }
}

const SETTINGS_KEY = "coverlay:settings";
let runByDefault = true;

async function loadSettings() {
  try {
    const obj = await browser.storage.local.get(SETTINGS_KEY);
    const s = obj[SETTINGS_KEY];
    // Default to true unless explicitly set to false
    runByDefault = s ? (s.runByDefault !== false) : true;
  } catch {}
}

async function maybeInjectOnUpdate(tabId, changeInfo, tab) {
  if (!runByDefault) return;
  if (changeInfo.status !== "complete") return;
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      files: ["content-script.js"],
    });
  } catch {}
}

browser.tabs.onUpdated.addListener(maybeInjectOnUpdate);
browser.runtime.onInstalled.addListener(loadSettings);
browser.runtime.onStartup.addListener(loadSettings);
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[SETTINGS_KEY]) {
    const nv = changes[SETTINGS_KEY].newValue || {};
    runByDefault = (nv.runByDefault !== false);
    if (runByDefault) {
      // Best-effort: inject into active tab immediately
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tab = tabs[0];
        if (tab && tab.id != null) {
          browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content-script.js"],
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }
});
browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || tab.id == null) return;
  if (command === "toggle-overlay") {
    await sendToggle(tab.id);
    return;
  }
  if (command === "enable-draw-mode") {
    try {
      await browser.tabs.sendMessage(tab.id, { type: "ENABLE_DRAW_MODE" });
    } catch {
      try {
        await browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["content-script.js"] });
        await browser.tabs.sendMessage(tab.id, { type: "ENABLE_DRAW_MODE" });
      } catch {}
    }
    return;
  }
  if (command === "toggle-drawings-visibility") {
    try {
      await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_DRAWINGS_VISIBILITY" });
    } catch {
      // Try to inject then send
      try {
        await browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["content-script.js"] });
        await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_DRAWINGS_VISIBILITY" });
      } catch {}
    }
    return;
  }
  if (command === "toggle-ui-visibility") {
    try {
      await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_UI_VISIBILITY" });
    } catch {
      try {
        await browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["content-script.js"] });
        await browser.tabs.sendMessage(tab.id, { type: "TOGGLE_UI_VISIBILITY" });
      } catch {}
    }
    return;
  }
});

browser.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id != null) await sendToggle(tab.id);
});

browser.runtime.onMessage.addListener(async (msg, sender) => {
  if (!msg) return;
  if (msg.type === "OPEN_SHORTCUTS") {
    // Try updating current tab to about:addons (may be allowed in some versions)
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id != null) {
        await browser.tabs.update(tabs[0].id, { url: "about:addons" });
        return { ok: true };
      }
    } catch {}
    // Try opening a new tab
    try {
      await browser.tabs.create({ url: "about:addons" });
      return { ok: true };
    } catch {}
    // Try opening a new window
    try {
      await browser.windows.create({ url: "about:addons", type: "normal" });
      return { ok: true };
    } catch {}
    // Fall back: not permitted programmatically; instruct user
    return { ok: false, reason: "blocked" };
  }
});