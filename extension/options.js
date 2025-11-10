document.addEventListener("DOMContentLoaded", async () => {
  const valueEl = document.getElementById("shortcutValue");
  try {
    const cmds = await browser.commands.getAll();
    const toggle = cmds.find((c) => c.name === "toggle-overlay");
    valueEl.textContent = (toggle && toggle.shortcut) ? toggle.shortcut : "Not set";
  } catch {
    valueEl.textContent = "Unavailable";
  }

  document.getElementById("openShortcuts").addEventListener("click", async () => {
    // Ask background to open the native Manage Extension Shortcuts UI.
    const res = await browser.runtime.sendMessage({ type: "OPEN_SHORTCUTS" }).catch(() => null);
    if (!res || !res.ok) {
      alert("Firefox blocked opening the shortcuts page automatically.\nOpen it manually: about:addons → gear icon → Manage Extension Shortcuts.");
    }
  });
});


