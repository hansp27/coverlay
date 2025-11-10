// content-script.js
(() => {
  if (document.documentElement.querySelector("#pdw-host")) return;

  const host = document.createElement("div");
  host.id = "pdw-host";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = "2147483647";
  host.style.pointerEvents = "none";
  host.style.display = "block";
  host.style.isolation = "isolate";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  shadow.appendChild(container);

  // Styles for animations within the shadow DOM
  const styleEl = document.createElement("style");
  styleEl.textContent = `@keyframes coverlayRainbow{0%{background-position:0% 50%}100%{background-position:200% 50%}}`;
  shadow.appendChild(styleEl);

  const ui = document.createElement("div");
  ui.style.position = "fixed";
  ui.style.top = "12px";
  ui.style.right = "12px";
  ui.style.background = "rgba(32,32,32,0.92)";
  ui.style.color = "#fff";
  ui.style.padding = "8px";
  ui.style.borderRadius = "8px";
  ui.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ui.style.display = "flex";
  ui.style.gap = "6px";
  ui.style.alignItems = "center";
  ui.style.pointerEvents = "auto";
  ui.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
  ui.style.backdropFilter = "saturate(120%) blur(8px)";
  ui.style.userSelect = "none";
  ui.style.zIndex = "2";
  ui.style.visibility = "hidden";
  container.appendChild(ui);

  function makeBtn(label, title) {
    const b = document.createElement("button");
    b.textContent = label;
    b.title = title || label;
    b.style.background = "#444";
    b.style.border = "0";
    b.style.color = "#fff";
    b.style.padding = "6px 10px";
    b.style.borderRadius = "6px";
    b.style.cursor = "pointer";
    b.style.fontSize = "12px";
    b.onmouseenter = () => (b.style.background = "#555");
    b.onmouseleave = () => (b.style.background = "#444");
    return b;
  }

  const toggleBtn = makeBtn("Draw OFF", "Enable/disable drawing");
  const clearBtn = makeBtn("Clear", "Clear overlay");

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = "#6a0dad";
  colorInput.title = "Stroke color";
  colorInput.style.width = "28px";
  colorInput.style.height = "28px";
  colorInput.style.border = "none";
  colorInput.style.background = "transparent";
  colorInput.style.cursor = "pointer";
  colorInput.style.padding = "0";
  colorInput.style.marginLeft = "4px";

  const sizeInput = document.createElement("input");
  sizeInput.type = "range";
  sizeInput.min = "1";
  sizeInput.max = "64";
  sizeInput.value = String(Math.max(1, Math.floor(Number("64") * 0.3)));
  sizeInput.title = "Stroke size";
  sizeInput.style.width = "120px";
  sizeInput.style.marginLeft = "6px";

  // Settings rows
  const rememberRow = makeSetting("Remember YouTube channel");
  const rememberCheckbox = rememberRow.input;
  rememberCheckbox.title = "Remember drawing for this YT channel";

  const closeBtn = makeBtn("✕", "Close overlay");
  closeBtn.style.marginLeft = "6px";
  closeBtn.style.padding = "6px 10px";
  const gearBtn = makeBtn("⚙", "Settings");
  gearBtn.style.marginLeft = "6px";
  gearBtn.style.padding = "6px 10px";

  const menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.top = "100%";
  menu.style.right = "0";
  menu.style.marginTop = "8px";
  menu.style.background = "rgba(32,32,32,0.98)";
  menu.style.color = "#fff";
  menu.style.padding = "8px 10px";
  menu.style.borderRadius = "8px";
  menu.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
  menu.style.display = "none";
  menu.style.zIndex = "3";
  menu.style.minWidth = "260px";

  function makeSetting(labelText) {
    const row = document.createElement("label");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.gap = "8px";
    row.style.padding = "6px 2px";
    const span = document.createElement("span");
    span.textContent = labelText;
    span.style.fontSize = "12px";
    const input = document.createElement("input");
    input.type = "checkbox";
    row.append(span, input);
    return { row, input };
  }

  const runDefaultRow = makeSetting("Run extension without explicit triggering");
  const runDefaultCheckbox = runDefaultRow.input;
  const showUIAutoRow = makeSetting("Show UI without explicitly triggering");
  const showUIAutoCheckbox = showUIAutoRow.input;

  // Configure shortcuts button
  const shortcutsBtn = document.createElement("button");
  shortcutsBtn.textContent = "Configure shortcuts";
  shortcutsBtn.style.background = "#444";
  shortcutsBtn.style.color = "#fff";
  shortcutsBtn.style.border = "0";
  shortcutsBtn.style.padding = "8px 12px";
  shortcutsBtn.style.borderRadius = "6px";
  shortcutsBtn.style.cursor = "pointer";
  shortcutsBtn.style.fontSize = "12px";
  shortcutsBtn.style.display = "block";
  shortcutsBtn.style.width = "100%";
  shortcutsBtn.style.textAlign = "center";
  shortcutsBtn.style.marginTop = "6px";
  shortcutsBtn.onmouseenter = () => (shortcutsBtn.style.background = "#555");
  shortcutsBtn.onmouseleave = () => (shortcutsBtn.style.background = "#444");

  menu.append(rememberRow.row, runDefaultRow.row, showUIAutoRow.row, shortcutsBtn);

  const eyeBtn = makeBtn("Hide UI", "Hide UI");
  eyeBtn.style.marginLeft = "2px";
  eyeBtn.style.padding = "6px 10px";
  const stickBtn = makeBtn("Stick OFF", "Make drawing stick to page while scrolling");

  ui.append(toggleBtn, clearBtn, colorInput, sizeInput, stickBtn, eyeBtn, gearBtn, closeBtn, menu);

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.cursor = "default";
  canvas.style.zIndex = "1";
  container.appendChild(canvas);

  // Brush cursor preview
  const brushCursor = document.createElement("div");
  brushCursor.style.position = "fixed";
  brushCursor.style.left = "0";
  brushCursor.style.top = "0";
  brushCursor.style.width = "12px";
  brushCursor.style.height = "12px";
  brushCursor.style.border = "2px solid rgba(255,255,255,0.8)";
  brushCursor.style.borderRadius = "50%";
  brushCursor.style.boxSizing = "border-box";
  brushCursor.style.pointerEvents = "none";
  brushCursor.style.transform = "translate(-50%, -50%)";
  brushCursor.style.zIndex = "2";
  brushCursor.style.display = "none";
  container.appendChild(brushCursor);

  const ctx = canvas.getContext("2d", { alpha: true });
  let enabled = false;
  let drawing = false;
  let currentYTChannelKey = null;
  let closed = false;
  let menuOpen = false;
  let adjustingBrush = false;
  let draggingUI = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const SETTINGS_KEY = "coverlay:settings";

  const STORAGE_PREFIX = "coverlay:yt:channel:";
  const SITE_STORAGE_PREFIX = "coverlay:site:";
  function getSiteKey() {
    return location.origin;
  }
  async function getSiteData(key) {
    const k = SITE_STORAGE_PREFIX + key;
    const obj = await browser.storage.local.get(k);
    return obj[k] || null;
  }
  async function setSiteData(key, data) {
    const k = SITE_STORAGE_PREFIX + key;
    await browser.storage.local.set({ [k]: data });
  }

  // Sticky drawing state (document-space)
  let stickMode = false;
  let docCanvas = null;
  let docCtx = null;

  function setStickMode(v) {
    stickMode = v;
    stickBtn.textContent = v ? "Stick ON" : "Stick OFF";
    if (stickMode) {
      ensureDocCanvas();
      try {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        if (docCtx && canvas.width && canvas.height) {
          // Migrate current viewport content into document canvas at scroll offset
          docCtx.drawImage(
            canvas,
            0, 0, canvas.width, canvas.height,
            Math.floor(window.scrollX * dpr),
            Math.floor(window.scrollY * dpr),
            canvas.width, canvas.height
          );
        }
      } catch {}
      renderStickyToViewport();
    }
  }

  function ensureDocCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    if (!docCanvas) {
      docCanvas = document.createElement("canvas");
      docCtx = docCanvas.getContext("2d", { alpha: true });
    }
    const wantW = Math.floor(docW * dpr);
    const wantH = Math.floor(docH * dpr);
    if (docCanvas.width !== wantW || docCanvas.height !== wantH) {
      const old = docCanvas;
      const tmp = document.createElement("canvas");
      tmp.width = wantW;
      tmp.height = wantH;
      const tctx = tmp.getContext("2d", { alpha: true });
      if (old && old.width && old.height) {
        try { tctx.drawImage(old, 0, 0); } catch {}
      }
      docCanvas = tmp;
      docCtx = tctx;
    }
  }

  function renderStickyToViewport() {
    if (!stickMode || !docCanvas || !ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sx = Math.floor(window.scrollX * dpr);
    const sy = Math.floor(window.scrollY * dpr);
    const sw = Math.min(Math.floor(window.innerWidth * dpr), docCanvas.width - sx);
    const sh = Math.min(Math.floor(window.innerHeight * dpr), docCanvas.height - sy);
    if (sw > 0 && sh > 0) {
      ctx.drawImage(docCanvas, sx, sy, sw, sh, 0, 0, sw / dpr, sh / dpr);
    }
  }

  function isYouTubeWatch() {
    return /\.youtube\.com$/.test(location.hostname) && location.pathname.startsWith("/watch");
  }

  function getYTChannelKeyFromDOM() {
    if (!isYouTubeWatch()) return null;
    const selectors = [
      'ytd-video-owner-renderer a[href^="/@"]',
      'ytd-video-owner-renderer a[href^="/channel/"]',
      '#owner #channel-name a[href^="/@"]',
      '#owner a[href^="/channel/"]'
    ];
    for (const sel of selectors) {
      const a = document.querySelector(sel);
      if (a && a.getAttribute) {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("/@") || href.startsWith("/channel/")) {
          return href.split("?")[0];
        }
      }
    }
    const any = document.querySelector('a[href^="/@"], a[href^="/channel/"]');
    if (any && any.getAttribute) {
      const href = any.getAttribute("href") || "";
      if (href.startsWith("/@") || href.startsWith("/channel/")) {
        return href.split("?")[0];
      }
    }
    return null;
  }

  async function getChannelData(key) {
    const k = STORAGE_PREFIX + key;
    const obj = await browser.storage.local.get(k);
    return obj[k] || null;
  }

  async function setChannelData(key, data) {
    const k = STORAGE_PREFIX + key;
    await browser.storage.local.set({ [k]: data });
  }

  async function restoreChannelImage(data) {
    if (!ctx || !data || !data.image) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = data.image;
    });
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.drawImage(img, 0, 0, w, h);
  }

  async function saveChannelImage(key) {
    if (!key || !ctx) return;
    const image = canvas.toDataURL("image/png");
    const existing = (await getChannelData(key)) || {};
    await setChannelData(key, {
      ...existing,
      remember: true,
      image,
      w: window.innerWidth,
      h: window.innerHeight,
      updatedAt: Date.now()
    });
  }

  async function saveSiteImage() {
    const key = getSiteKey();
    if (!key || !ctx) return;
    const image = (stickMode && docCanvas) ? docCanvas.toDataURL("image/png") : canvas.toDataURL("image/png");
    const existing = (await getSiteData(key)) || {};
    const data = { ...existing,
      image,
      w: window.innerWidth,
      h: window.innerHeight,
      size: Number(sizeInput.value || getDefaultBrushSize()),
      color: String(colorInput.value || "#6a0dad"),
      updatedAt: Date.now()
    };
    if (stickMode && docCanvas) {
      data.stick = true;
      data.docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
      data.docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    } else {
      data.stick = false;
      data.docW = null;
      data.docH = null;
    }
    await setSiteData(key, data);
  }

  async function clearChannelImage(key) {
    if (!key) return;
    const existing = (await getChannelData(key)) || {};
    await setChannelData(key, { ...existing, image: null, updatedAt: Date.now() });
  }

  async function clearSiteImage() {
    const key = getSiteKey();
    if (!key) return;
    const existing = (await getSiteData(key)) || {};
    await setSiteData(key, { ...existing, image: null, updatedAt: Date.now() });
  }

  async function refreshYTState() {
    if (!isYouTubeWatch()) {
      currentYTChannelKey = null;
      // Default to ON even outside YT for consistency; no effect when not on watch page
      rememberCheckbox.checked = true;
      return;
    }
    const key = getYTChannelKeyFromDOM();
    if (key && key !== currentYTChannelKey) {
      currentYTChannelKey = key;
      const data = await getChannelData(key);
      rememberCheckbox.checked = data ? !!data.remember : true;
      if (data && data.remember && data.image) {
        await restoreChannelImage(data);
      }
    }
  }

  async function restoreSiteIfAny() {
    const key = getSiteKey();
    const data = await getSiteData(key);
    if (!data) {
      // No record: default to Stick ON
      setStickMode(true);
      return;
    }
    if (!data.image) {
      // Honor saved stick flag if present
      if (data.stick === false) setStickMode(false); else setStickMode(true);
      return;
    }
    if (data.stick) {
      setStickMode(true);
      ensureDocCanvas();
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        img.src = data.image;
      });
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const wantW = Math.floor((data.docW || document.documentElement.scrollWidth) * dpr);
      const wantH = Math.floor((data.docH || document.documentElement.scrollHeight) * dpr);
      if (!docCanvas) ensureDocCanvas();
      if (docCanvas.width !== wantW || docCanvas.height !== wantH) {
        const tmp = document.createElement("canvas");
        tmp.width = wantW;
        tmp.height = wantH;
        const tctx = tmp.getContext("2d", { alpha: true });
        docCanvas = tmp;
        docCtx = tctx;
      }
      docCtx.clearRect(0, 0, docCanvas.width, docCanvas.height);
      docCtx.drawImage(img, 0, 0, docCanvas.width, docCanvas.height);
      renderStickyToViewport();
    } else {
      // Non-sticky saved image → Switch Stick OFF and restore to viewport
      setStickMode(false);
      await restoreChannelImage(data);
    }
  }

  async function setSiteBrushSize(size) {
    const key = getSiteKey();
    if (!key) return;
    const existing = (await getSiteData(key)) || {};
    await setSiteData(key, { ...existing, size: Number(size), updatedAt: Date.now() });
  }

  function getDefaultBrushSize() {
    const max = Number(sizeInput.max || 64);
    return Math.max(1, Math.floor(max * 0.3));
  }

  async function restoreSiteBrushSize() {
    const key = getSiteKey();
    const data = await getSiteData(key);
    const min = Number(sizeInput.min || 1);
    const max = Number(sizeInput.max || 24);
    if (data && data.size != null) {
      const val = Math.max(min, Math.min(max, Number(data.size)));
      sizeInput.value = String(val);
      return;
    }
    const lb = await getLastBrush();
    if (lb && lb.size != null) {
      const val = Math.max(min, Math.min(max, Number(lb.size)));
      sizeInput.value = String(val);
    }
  }

  async function setSiteBrushColor(color) {
    const key = getSiteKey();
    if (!key) return;
    const existing = (await getSiteData(key)) || {};
    await setSiteData(key, { ...existing, color: String(color), updatedAt: Date.now() });
  }

  async function restoreSiteBrushColor() {
    const key = getSiteKey();
    const data = await getSiteData(key);
    if (data && data.color) {
      colorInput.value = String(data.color);
      return;
    }
    const lb = await getLastBrush();
    if (lb && lb.color) {
      colorInput.value = String(lb.color);
    }
  }

  async function getLastBrush() {
    const obj = await browser.storage.local.get("coverlay:lastBrush");
    const lb = obj["coverlay:lastBrush"];
    if (!lb) return { size: getDefaultBrushSize(), color: "#6a0dad" };
    return {
      size: lb.size != null ? Number(lb.size) : getDefaultBrushSize(),
      color: lb.color || "#6a0dad"
    };
  }

  async function setLastBrush(patch) {
    const cur = await getLastBrush();
    const next = { ...cur, ...patch };
    await browser.storage.local.set({ "coverlay:lastBrush": next });
    return next;
  }

  async function getSettings() {
    const obj = await browser.storage.local.get(SETTINGS_KEY);
    const s = obj[SETTINGS_KEY];
    // Defaults: runByDefault = true, hideUI = false, showUIByDefault = false
    if (!s) return { runByDefault: true, hideUI: false, showUIByDefault: false };
    return {
      runByDefault: (s.runByDefault !== false),
      hideUI: !!s.hideUI,
      showUIByDefault: !!s.showUIByDefault
    };
  }

  async function setSettings(patch) {
    const cur = await getSettings();
    const next = { ...cur, ...patch };
    await browser.storage.local.set({ [SETTINGS_KEY]: next });
    return next;
  }

  function applyHideUI(hide) {
    ui.style.display = hide ? "none" : "flex";
  }

  // ---- UI position persistence ----
  async function setSiteUIPosition(x, y) {
    const key = getSiteKey();
    if (!key) return;
    const existing = (await getSiteData(key)) || {};
    await setSiteData(key, { ...existing, uiX: Math.round(x), uiY: Math.round(y), updatedAt: Date.now() });
  }
  async function getSiteUIPosition() {
    const key = getSiteKey();
    const data = await getSiteData(key);
    if (!data) return null;
    const x = Number(data.uiX);
    const y = Number(data.uiY);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
    return null;
  }
  async function getLastUIPosition() {
    const obj = await browser.storage.local.get("coverlay:lastUIPos");
    const p = obj["coverlay:lastUIPos"];
    if (!p) return null;
    const x = Number(p.x);
    const y = Number(p.y);
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
    return null;
  }
  async function setLastUIPosition(pos) {
    const { x, y } = pos;
    await browser.storage.local.set({ "coverlay:lastUIPos": { x: Math.round(x), y: Math.round(y) } });
  }
  function clampUIToViewport(x, y) {
    const pad = 4;
    const w = ui.offsetWidth || 260;
    const h = ui.offsetHeight || 40;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad, window.innerHeight - h - pad);
    const nx = Math.min(Math.max(pad, x), maxX);
    const ny = Math.min(Math.max(pad, y), maxY);
    return { x: nx, y: ny };
  }
  function applyUIPosition(x, y) {
    const p = clampUIToViewport(x, y);
    ui.style.left = p.x + "px";
    ui.style.top = p.y + "px";
    ui.style.right = "auto";
  }
  async function restoreUIPosition() {
    // Try site-specific, then global last, else keep default top-right
    const sitePos = await getSiteUIPosition();
    if (sitePos) {
      applyUIPosition(sitePos.x, sitePos.y);
      return;
    }
    const lastPos = await getLastUIPosition();
    if (lastPos) {
      applyUIPosition(lastPos.x, lastPos.y);
    }
  }

  function updateBrushCursorStyle() {
    const size = Number(sizeInput.value || getDefaultBrushSize());
    brushCursor.style.width = size + "px";
    brushCursor.style.height = size + "px";
    const color = String(colorInput.value || "#6a0dad");
    // Use outline color; if very dark, keep visible via box-shadow
    brushCursor.style.border = "2px solid " + color;
  }

  function setBrushCursorVisible(v) {
    brushCursor.style.display = v ? "block" : "none";
  }

  function positionBrushCursor(clientX, clientY) {
    brushCursor.style.left = clientX + "px";
    brushCursor.style.top = clientY + "px";
  }

  function startAdjustingBrush(e) {
    adjustingBrush = true;
    updateBrushCursorStyle();
    setBrushCursorVisible(true);
    if (e && e.clientX != null && e.clientY != null) {
      positionBrushCursor(e.clientX, e.clientY);
    }
    const onMove = (ev) => {
      if (!adjustingBrush) return;
      if (ev && ev.clientX != null && ev.clientY != null) {
        positionBrushCursor(ev.clientX, ev.clientY);
      }
    };
    const onEnd = () => {
      adjustingBrush = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd, true);
      // Restore visibility depending on drawing state
      setBrushCursorVisible(enabled && !drawingsHidden);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onEnd, { capture: true, once: true });
  }

  // Drawings visibility toggle (not persisted)
  let drawingsHidden = false;
  function setDrawingsHidden(v) {
    drawingsHidden = v;
    canvas.style.visibility = v ? "hidden" : "visible";
    // When hidden, always pass clicks; when visible, follow enabled state
    if (v) {
      canvas.style.pointerEvents = "none";
      setBrushCursorVisible(false);
    } else {
      canvas.style.pointerEvents = enabled ? "auto" : "none";
    }
  }

  function applyToggleBtnStyle() {
    if (enabled) {
      toggleBtn.style.background = "linear-gradient(90deg,#ff3b30,#ff9500,#ffcc00,#34c759,#5ac8fa,#007aff,#af52de)";
      toggleBtn.style.backgroundSize = "200% 100%";
      toggleBtn.style.animation = "coverlayRainbow 4s linear infinite";
      // Keep gradient on hover
      toggleBtn.onmouseenter = () => {};
      toggleBtn.onmouseleave = () => {};
    } else {
      toggleBtn.style.animation = "";
      toggleBtn.style.backgroundSize = "";
      toggleBtn.style.background = "#444";
      toggleBtn.onmouseenter = () => (toggleBtn.style.background = "#555");
      toggleBtn.onmouseleave = () => (toggleBtn.style.background = "#444");
    }
  }

  function maybeRestoreForCurrentChannel() {
    if (!currentYTChannelKey) return;
    getChannelData(currentYTChannelKey).then((data) => {
      if (data && data.remember && data.image) restoreChannelImage(data);
    });
  }

  function setEnabled(v) {
    enabled = v;
    host.style.pointerEvents = enabled ? "auto" : "none";
    toggleBtn.textContent = enabled ? "Draw ON" : "Draw OFF";
    canvas.style.pointerEvents = enabled && !drawingsHidden ? "auto" : "none";
    canvas.style.cursor = enabled ? "none" : "default";
    setBrushCursorVisible(enabled && !drawingsHidden);
    applyToggleBtnStyle();
    if (enabled) {
      maybeRestoreForCurrentChannel();
    }
  }

  function resizeCanvas() {
    if (!ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (stickMode) {
      ensureDocCanvas();
      renderStickyToViewport();
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  toggleBtn.onclick = () => setEnabled(!enabled);
  closeBtn.onclick = () => {
    setEnabled(false);
    closed = true;
    host.style.display = "none";
  };
  stickBtn.onclick = () => setStickMode(!stickMode);

  sizeInput.addEventListener("input", () => {
    setSiteBrushSize(sizeInput.value);
    setLastBrush({ size: Number(sizeInput.value || getDefaultBrushSize()) });
    updateBrushCursorStyle();
  });
  sizeInput.addEventListener("pointerdown", (e) => {
    startAdjustingBrush(e);
  });
  sizeInput.addEventListener("pointerup", () => {
    // pointerup handled globally to ensure we end even if pointer leaves
  });
  colorInput.addEventListener("input", () => {
    setSiteBrushColor(colorInput.value);
    setLastBrush({ color: String(colorInput.value || "#6a0dad") });
    updateBrushCursorStyle();
  });
  gearBtn.onclick = (e) => {
    e.stopPropagation();
    menuOpen = !menuOpen;
    menu.style.display = menuOpen ? "block" : "none";
  };
  // Drag UI: start drag only when not interacting with controls
  ui.addEventListener("pointerdown", (e) => {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "button" || tag === "input" || tag === "select" || tag === "label") return;
    draggingUI = true;
    const rect = ui.getBoundingClientRect();
    // Switch to left/top coordinates if still right-anchored
    if (ui.style.right && ui.style.right !== "auto") {
      ui.style.left = rect.left + "px";
      ui.style.top = rect.top + "px";
      ui.style.right = "auto";
    }
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    ui.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  ui.addEventListener("pointermove", (e) => {
    if (!draggingUI) return;
    const nx = e.clientX - dragOffsetX;
    const ny = e.clientY - dragOffsetY;
    applyUIPosition(nx, ny);
  });
  ui.addEventListener("pointerup", async (e) => {
    if (!draggingUI) return;
    draggingUI = false;
    try { ui.releasePointerCapture(e.pointerId); } catch {}
    const rect = ui.getBoundingClientRect();
    const pos = clampUIToViewport(rect.left, rect.top);
    await setSiteUIPosition(pos.x, pos.y);
    await setLastUIPosition(pos);
  });
  document.addEventListener("click", (e) => {
    if (!menuOpen) return;
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    if (path.includes(menu) || path.includes(gearBtn)) return;
    menu.style.display = "none";
    menuOpen = false;
  });

  clearBtn.onclick = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (docCtx && docCanvas) {
      docCtx.clearRect(0, 0, docCanvas.width, docCanvas.height);
    }
    clearSiteImage();
    if (rememberCheckbox.checked && currentYTChannelKey) {
      clearChannelImage(currentYTChannelKey);
    }
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!enabled || !ctx || drawingsHidden) return;
    drawing = true;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    if (stickMode) {
      ensureDocCanvas();
      docCtx.globalCompositeOperation = "source-over";
      docCtx.globalAlpha = 1;
      docCtx.lineCap = "round";
      docCtx.lineJoin = "round";
      docCtx.lineWidth = Number(sizeInput.value || getDefaultBrushSize()) * dpr;
      docCtx.strokeStyle = colorInput.value || "#6a0dad";
      docCtx.beginPath();
      docCtx.moveTo(e.pageX * dpr, e.pageY * dpr);
      renderStickyToViewport();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Number(sizeInput.value || getDefaultBrushSize());
      ctx.strokeStyle = colorInput.value || "#6a0dad";
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    }
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!ctx || drawingsHidden) return;
    if (stickMode) {
      if (drawing) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        docCtx.lineTo(e.pageX * dpr, e.pageY * dpr);
        docCtx.stroke();
        renderStickyToViewport();
      }
    } else {
      if (drawing) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      }
    }
    if (enabled) positionBrushCursor(e.clientX, e.clientY);
  });

  function endStroke(e) {
    if (!drawing || !ctx) return;
    drawing = false;
    try {
      if (stickMode) {
        docCtx.closePath();
        renderStickyToViewport();
      } else {
        ctx.closePath();
      }
    } catch {}
    if (e && e.pointerId != null) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
    // Always save per-site image by default
    saveSiteImage();
    if (rememberCheckbox.checked && currentYTChannelKey) {
      saveChannelImage(currentYTChannelKey);
    }
  }

  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);
  canvas.addEventListener("pointerleave", endStroke);
  canvas.addEventListener("pointerenter", (e) => {
    if (enabled && !drawingsHidden) {
      positionBrushCursor(e.clientX, e.clientY);
      setBrushCursorVisible(true);
    }
  });
  canvas.addEventListener("pointerleave", () => {
    setBrushCursorVisible(false);
  });

  browser.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "TOGGLE_OVERLAY") {
      // Toggle overlay/UI intelligently:
      // - If overlay is closed → open overlay (UI visible), draw OFF
      // - If overlay is open but UI hidden → show UI (don't close overlay)
      // - Else overlay open and UI visible → close overlay
      const overlayHidden = closed || host.style.display === "none";
      const uiVisible = ui.style.display !== "none" && ui.style.visibility !== "hidden";
      if (overlayHidden) {
        closed = false;
        host.style.display = "block";
        getSettings().then((s) => {
          if (s.hideUI && ui.style.display === "none") applyHideUI(false);
        });
        if (enabled) setEnabled(false);
        ui.style.visibility = "visible";
      } else if (!uiVisible) {
        applyHideUI(false);
        setSettings({ hideUI: false });
        ui.style.visibility = "visible";
      } else {
        setEnabled(false);
        closed = true;
        host.style.display = "none";
      }
    } else if (msg && msg.type === "SHOW_OVERLAY") {
      if (closed) {
        closed = false;
        host.style.display = "block";
      }
      // Ensure drawing is OFF by default on first activation
      if (enabled) setEnabled(false);
      ui.style.visibility = "visible";
    } else if (msg && msg.type === "ENABLE_DRAW_MODE") {
      if (closed || host.style.display === "none") {
        closed = false;
        host.style.display = "block";
        setEnabled(true);
        ui.style.visibility = "visible";
      } else {
        setEnabled(!enabled);
      }
    } else if (msg && msg.type === "TOGGLE_DRAWINGS_VISIBILITY") {
      setDrawingsHidden(!drawingsHidden);
      if (!drawingsHidden && stickMode) renderStickyToViewport();
    } else if (msg && msg.type === "TOGGLE_UI_VISIBILITY") {
      const hidden = ui.style.display === "none";
      if (hidden) {
        applyHideUI(false);
        setSettings({ hideUI: false });
      } else {
        applyHideUI(true);
        setSettings({ hideUI: true });
      }
    }
  });

  document.addEventListener("fullscreenchange", () => {
    resizeCanvas();
  });

  window.addEventListener("scroll", () => {
    if (stickMode) renderStickyToViewport();
  }, { passive: true });
  window.addEventListener("resize", () => {
    // Ensure UI remains within viewport after resize
    const rect = ui.getBoundingClientRect();
    const pos = clampUIToViewport(rect.left, rect.top);
    applyUIPosition(pos.x, pos.y);
  });

  rememberCheckbox.addEventListener("change", async () => {
    if (!currentYTChannelKey) return;
    const existing = (await getChannelData(currentYTChannelKey)) || {};
    const updated = { ...existing, remember: rememberCheckbox.checked };
    await setChannelData(currentYTChannelKey, updated);
    if (rememberCheckbox.checked) {
      await saveChannelImage(currentYTChannelKey);
    }
  });

  runDefaultCheckbox.addEventListener("change", async () => {
    await setSettings({ runByDefault: runDefaultCheckbox.checked });
  });

  shortcutsBtn.addEventListener("click", async () => {
    const res = await browser.runtime.sendMessage({ type: "OPEN_SHORTCUTS" }).catch(() => null);
    if (!res || !res.ok) {
      alert("Firefox may block opening the shortcuts page automatically.\nOpen it manually: about:addons → gear icon → Manage Extension Shortcuts.");
    }
  });
  showUIAutoCheckbox.addEventListener("change", async () => {
    const next = await setSettings({ showUIByDefault: showUIAutoCheckbox.checked });
    if (next.showUIByDefault && ui.style.display !== "none") {
      ui.style.visibility = "visible";
    }
  });

  eyeBtn.onclick = async () => {
    const next = await setSettings({ hideUI: true });
    applyHideUI(next.hideUI);
  };

  if (/\.youtube\.com$/.test(location.hostname)) {
    refreshYTState();
    window.addEventListener("yt-navigate-finish", () => setTimeout(refreshYTState, 0), true);
    window.addEventListener("popstate", () => setTimeout(refreshYTState, 0));
    const mo = new MutationObserver(() => {
      const k = getYTChannelKeyFromDOM();
      if (k && k !== currentYTChannelKey) refreshYTState();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Restore per-site drawing automatically on load
  restoreSiteIfAny();
  // Restore brush settings, then reveal UI to avoid flicker
  (async () => {
    await Promise.all([restoreSiteBrushSize(), restoreSiteBrushColor()]);
    const s = await getSettings();
    // Show UI only if explicitly configured; otherwise keep hidden until user triggers
    if (!s.hideUI && s.showUIByDefault) {
      ui.style.visibility = "visible";
    } else {
      ui.style.visibility = "hidden";
    }
    await restoreUIPosition();
    updateBrushCursorStyle();
    applyToggleBtnStyle();
  })();

  // Load and apply global settings
  getSettings().then((s) => {
    runDefaultCheckbox.checked = !!s.runByDefault;
    showUIAutoCheckbox.checked = !!s.showUIByDefault;
    applyHideUI(!!s.hideUI);
  });
})();