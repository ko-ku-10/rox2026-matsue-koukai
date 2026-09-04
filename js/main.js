/*
 * ROX2026 technical archive
 * This file reads the JSON files in /data and builds the interactive parts of the site.
 * Edit data files to add content; the page structure does not need to be changed.
 */

(function () {
  "use strict";

  const dataFiles = {
    components: "data/components.json",
    software: "data/software.json",
    history: "data/history.json"
  };

  const appState = {
    components: [],
    software: [],
    history: [],
    activeDownloadCategory: "all",
    lastFocusedElement: null
  };

  const elements = {
    hotspotLayer: document.getElementById("hotspot-layer"),
    systemGrid: document.getElementById("system-grid"),
    softwareGrid: document.getElementById("software-grid"),
    historyList: document.getElementById("history-list"),
    downloadFilters: document.getElementById("download-filters"),
    downloadList: document.getElementById("download-list"),
    panel: document.getElementById("detail-panel"),
    panelContent: document.getElementById("panel-content"),
    panelIndex: document.getElementById("detail-index"),
    panelClose: document.getElementById("panel-close"),
    panelBackdrop: document.getElementById("panel-backdrop"),
    heroSourceLink: document.getElementById("hero-source-link")
  };

  const categoryLabels = {
    all: "すべて",
    mechanical: "Mechanical",
    electrical: "Electrical",
    pneumatic: "Pneumatic",
    software: "Software",
    documents: "Documents"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`${path} (${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`${path} is not an array`);
    }
    return data;
  }

  function loadingMarkup() {
    return '<p class="loading-text">データを読み込んでいます…</p>';
  }

  function errorMarkup() {
    return '<p class="data-error">データを読み込めませんでした。<br>ローカル確認時は README.md の手順どおり、Webサーバー経由で開いてください。</p>';
  }

  function setInitialLoadingState() {
    [elements.systemGrid, elements.softwareGrid, elements.historyList, elements.downloadList].forEach((element) => {
      if (element) element.innerHTML = loadingMarkup();
    });
  }

  function getSoftwareById(id) {
    return appState.software.find((item) => item.id === id);
  }

  function getHistoryForComponent(componentId) {
    return appState.history.filter((item) => safeArray(item.relatedComponents).includes(componentId));
  }

  function renderHotspots() {
    if (!elements.hotspotLayer) return;
    if (!appState.components.length) {
      elements.hotspotLayer.innerHTML = errorMarkup();
      return;
    }

    elements.hotspotLayer.innerHTML = appState.components.map((component, index) => {
      const x = Number(component.hotspot?.x);
      const y = Number(component.hotspot?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return "";
      const isLeft = x > 66 ? " is-left" : "";
      const label = `${component.name} / ${component.nameEn || "SYSTEM"}`;
      return `
        <button class="hotspot${isLeft}" type="button" style="left:${x}%; top:${y}%;" data-component-id="${escapeHtml(component.id)}" aria-label="${escapeHtml(label)}の詳細を見る">
          <span class="hotspot-label">${escapeHtml(label)}</span>
        </button>`;
    }).join("");

    elements.hotspotLayer.querySelectorAll("[data-component-id]").forEach((button) => {
      button.addEventListener("click", () => openComponent(button.dataset.componentId));
    });
  }

  function renderSystems() {
    if (!elements.systemGrid) return;
    if (!appState.components.length) {
      elements.systemGrid.innerHTML = errorMarkup();
      return;
    }
    elements.systemGrid.innerHTML = appState.components.map((component, index) => `
      <button class="system-card" type="button" data-component-id="${escapeHtml(component.id)}" aria-label="${escapeHtml(component.name)}の詳細を見る">
        <span class="system-number">SYSTEM / ${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(component.name)}</h3>
        <p>${escapeHtml(component.shortDescription)}</p>
        <span class="system-arrow" aria-hidden="true">↗</span>
      </button>`).join("");

    elements.systemGrid.querySelectorAll("[data-component-id]").forEach((button) => {
      button.addEventListener("click", () => openComponent(button.dataset.componentId));
    });
  }

  function renderSoftware() {
    if (!elements.softwareGrid) return;
    if (!appState.software.length) {
      elements.softwareGrid.innerHTML = errorMarkup();
      return;
    }
    elements.softwareGrid.innerHTML = appState.software.map((software, index) => {
      const directUrl = software.source || software.repository;
      const linkLabel = software.source ? "該当コードを見る" : "Repositoryを見る";
      return `
        <article class="software-card">
          <p class="code-prefix">// ${String(index + 1).padStart(2, "0")} · ${escapeHtml(software.tag || "REFERENCE")}</p>
          <h3>${escapeHtml(software.name)}</h3>
          <p>${escapeHtml(software.description)}</p>
          ${directUrl ? `<a href="${escapeHtml(directUrl)}" target="_blank" rel="noreferrer">${linkLabel} <span aria-hidden="true">↗</span></a>` : ""}
        </article>`;
    }).join("");

    const primaryRepository = appState.software.find((item) => item.repository)?.repository;
    if (primaryRepository && elements.heroSourceLink) {
      elements.heroSourceLink.href = primaryRepository;
      elements.heroSourceLink.target = "_blank";
      elements.heroSourceLink.rel = "noreferrer";
    }
  }

  function renderHistory() {
    if (!elements.historyList) return;
    if (!appState.history.length) {
      elements.historyList.innerHTML = errorMarkup();
      return;
    }
    elements.historyList.innerHTML = appState.history.map((entry) => `
      <article class="history-item">
        <time datetime="${escapeHtml(entry.date || "")}">${escapeHtml(entry.period || entry.date || "UPDATE")}</time>
        <div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.description)}</p>
        </div>
        <div class="history-meta">
          <div><strong>ISSUE</strong>${escapeHtml(entry.issue || "記録準備中")}</div>
          <div><strong>UPDATE</strong>${escapeHtml(entry.improvement || "記録準備中")}</div>
        </div>
      </article>`).join("");
  }

  function getAllDownloads() {
    const componentDownloads = appState.components.flatMap((component) => safeArray(component.downloads).map((download) => ({
      ...download,
      owner: component.name,
      description: download.description || `${component.name}に関する公開資料`,
      category: download.category || "mechanical"
    })));
    const softwareDownloads = appState.software.map((software) => ({
      label: software.name,
      file: software.source || software.repository,
      description: software.description,
      category: "software",
      format: "GITHUB",
      size: "LINK",
      available: Boolean(software.source || software.repository),
      external: true
    }));
    return [...componentDownloads, ...softwareDownloads];
  }

  function renderDownloadFilters() {
    if (!elements.downloadFilters) return;
    const visibleCategories = ["all", ...new Set(getAllDownloads().map((item) => item.category).filter(Boolean))];
    elements.downloadFilters.innerHTML = visibleCategories.map((category) => `
      <button class="filter-button${category === appState.activeDownloadCategory ? " is-active" : ""}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === appState.activeDownloadCategory}">${escapeHtml(categoryLabels[category] || category)}</button>`).join("");
    elements.downloadFilters.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        appState.activeDownloadCategory = button.dataset.category;
        renderDownloadFilters();
        renderDownloads();
      });
    });
  }

  function renderDownloads() {
    if (!elements.downloadList) return;
    const downloads = getAllDownloads().filter((item) => appState.activeDownloadCategory === "all" || item.category === appState.activeDownloadCategory);
    if (!downloads.length) {
      elements.downloadList.innerHTML = '<p class="empty-state">このカテゴリには公開データがありません。</p>';
      return;
    }
    elements.downloadList.innerHTML = downloads.map((download) => {
      const available = download.available !== false && Boolean(download.file);
      const label = available ? (download.external ? "View" : "Download") : "準備中";
      const link = available
        ? `<a class="download-link" href="${escapeHtml(download.file)}" ${download.external ? 'target="_blank" rel="noreferrer"' : ""}>${label} <span aria-hidden="true">↗</span></a>`
        : '<span class="download-link is-unavailable" aria-label="このデータは準備中です">準備中</span>';
      return `
        <article class="download-row">
          <span class="download-category">${escapeHtml(categoryLabels[download.category] || download.category || "DOCUMENT")}</span>
          <div><div class="download-name">${escapeHtml(download.label)}</div><div class="download-description">${escapeHtml(download.description || "")}</div></div>
          <span class="download-format">${escapeHtml(download.format || "FILE")}</span>
          <span class="download-size">${escapeHtml(download.size || "—")}</span>
          ${link}
        </article>`;
    }).join("");
  }

  function listMarkup(items) {
    if (!items.length) return "<p>公開情報を準備中です。</p>";
    return `<ul class="detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function linksMarkup(items, externalDefault) {
    if (!items.length) return "<p>公開情報を準備中です。</p>";
    return `<div class="panel-links">${items.map((item) => {
      const available = item.available !== false && Boolean(item.file || item.url);
      const href = item.file || item.url;
      if (!available) return `<span class="panel-link is-unavailable">${escapeHtml(item.label)} <span>準備中</span></span>`;
      const isExternal = item.external ?? externalDefault;
      return `<a class="panel-link" href="${escapeHtml(href)}" ${isExternal ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHtml(item.label)} <span aria-hidden="true">↗</span></a>`;
    }).join("")}</div>`;
  }

  function openComponent(componentId) {
    const component = appState.components.find((item) => item.id === componentId);
    if (!component || !elements.panel) return;

    appState.lastFocusedElement = document.activeElement;
    const index = appState.components.indexOf(component) + 1;
    const relatedSoftware = safeArray(component.software).map(getSoftwareById).filter(Boolean).map((item) => ({
      label: item.name,
      url: item.source || item.repository,
      external: true,
      available: Boolean(item.source || item.repository)
    }));
    const history = getHistoryForComponent(component.id);
    const historyMarkup = history.length
      ? `<ol class="panel-history">${history.map((entry) => `<li><strong>${escapeHtml(entry.title)}</strong><br>${escapeHtml(entry.improvement || entry.description)}</li>`).join("")}</ol>`
      : "<p>この機構の開発履歴は準備中です。</p>";
    const imageGallery = safeArray(component.images).filter(Boolean);

    elements.panelIndex.textContent = `SYSTEM / ${String(index).padStart(2, "0")}`;
    elements.panelContent.innerHTML = `
      <img class="panel-image" src="${escapeHtml(component.image || "assets/robot/robot-hero.png")}" alt="${escapeHtml(component.imageAlt || component.name)}" onerror="this.src='assets/robot/robot-hero.png'">
      <h2 class="panel-title" id="detail-title">${escapeHtml(component.name)}</h2>
      <p class="panel-short">${escapeHtml(component.shortDescription)}</p>
      <section class="detail-block"><h3>OVERVIEW</h3><p>${escapeHtml(component.description || "詳細説明を準備中です。")}</p></section>
      <div class="detail-columns">
        <section class="detail-block"><h3>PURPOSE</h3><p>${escapeHtml(component.purpose || "準備中")}</p></section>
        <section class="detail-block"><h3>WHY THIS DESIGN</h3><p>${escapeHtml(component.reason || "準備中")}</p></section>
      </div>
      <div class="detail-columns">
        <section class="detail-block"><h3>DESIGN NOTES</h3><p>${escapeHtml(component.innovation || "準備中")}</p></section>
        <section class="detail-block"><h3>OWNER</h3><p>${escapeHtml(component.designer || "準備中")}</p></section>
      </div>
      <div class="detail-columns">
        <section class="detail-block"><h3>CHALLENGE / FAILURE</h3><p>${escapeHtml(component.challenge || "準備中")}</p></section>
        <section class="detail-block"><h3>IMPROVEMENT</h3><p>${escapeHtml(component.improvement || "準備中")}</p></section>
      </div>
      <section class="detail-block"><h3>PARTS</h3>${listMarkup(safeArray(component.parts))}</section>
      <section class="detail-block"><h3>DESIGN DATA</h3>${linksMarkup(safeArray(component.downloads), false)}</section>
      <section class="detail-block"><h3>RELATED SOFTWARE</h3>${linksMarkup(relatedSoftware, true)}</section>
      <section class="detail-block"><h3>DEVELOPMENT HISTORY</h3>${historyMarkup}</section>
      ${imageGallery.length ? `<section class="detail-block"><h3>RELATED PHOTOS</h3><p>${imageGallery.length} 枚の関連写真を data/components.json で登録しています。</p></section>` : ""}`;

    elements.panelBackdrop.hidden = false;
    document.body.classList.add("panel-open");
    elements.panel.classList.add("is-open");
    elements.panel.setAttribute("aria-hidden", "false");
    window.setTimeout(() => elements.panelClose.focus(), 20);
  }

  function closePanel() {
    if (!elements.panel.classList.contains("is-open")) return;
    elements.panel.classList.remove("is-open");
    elements.panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
    window.setTimeout(() => { elements.panelBackdrop.hidden = true; }, 260);
    if (appState.lastFocusedElement && typeof appState.lastFocusedElement.focus === "function") {
      appState.lastFocusedElement.focus();
    }
  }

  function setupPanelEvents() {
    elements.panelClose.addEventListener("click", closePanel);
    elements.panelBackdrop.addEventListener("click", closePanel);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab" && elements.panel.classList.contains("is-open")) {
        const focusable = elements.panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  async function initialise() {
    setInitialLoadingState();
    setupPanelEvents();
    const results = await Promise.allSettled(Object.values(dataFiles).map(fetchJson));
    const [components, software, history] = results;
    appState.components = components.status === "fulfilled" ? components.value : [];
    appState.software = software.status === "fulfilled" ? software.value : [];
    appState.history = history.status === "fulfilled" ? history.value : [];

    renderHotspots();
    renderSystems();
    renderSoftware();
    renderHistory();
    renderDownloadFilters();
    renderDownloads();

    if (results.some((result) => result.status === "rejected")) {
      console.warn("データを読み込めませんでした。", results);
    }
  }

  initialise().catch((error) => {
    console.error(error);
    [elements.hotspotLayer, elements.systemGrid, elements.softwareGrid, elements.historyList, elements.downloadList].forEach((element) => {
      if (element) element.innerHTML = errorMarkup();
    });
  });
})();
