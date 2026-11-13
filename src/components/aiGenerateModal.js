/**
 * AI Realistic Model Generation Modal
 * Handles auth gating, quota display, 4-angle PNG capture, prompt building,
 * generation request, result preview (photo + video), and user generation history.
 */

import { DEFAULT_PRODUCTS } from '../core/products.js';

function getProductById(productId) {
  return DEFAULT_PRODUCTS.find((p) => p.id === productId) || null;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeMediaUrl(url) {
  if (!url) return '';
  // If stored URL points to production CDN, rewrite to current domain /media/
  if (url.startsWith('https://cdn.sobral.ch/customizer/ai/')) {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    return `${origin}/media/customizer/ai/${url.slice('https://cdn.sobral.ch/customizer/ai/'.length)}`;
  }
  return url;
}

export class AiGenerateModal {
  constructor(viewer, state) {
    this.viewer = viewer;
    this.state = state;
    this.modalEl = null;
    this.activeTab = 'generate'; // 'generate' | 'history'
    this.statusData = null;
    this.isGenerating = false;
    this.latestResult = null;
    this.progressText = '';
    this.customPromptText = '';
  }

  getCustomerConfig() {
    return window.SOBRAL_CUSTOMER || {
      isLoggedIn: false,
      accountUrl: '/customer/account/login',
      registerUrl: '/customer/account/create',
      aiStatusUrl: '/customizer/ai/status',
      aiGenerateUrl: '/customizer/ai/generate',
      aiHistoryUrl: '/customizer/ai/history'
    };
  }

  async open() {
    this.close();

    const backdrop = document.createElement('div');
    backdrop.className = 'figma-draft-backdrop';
    backdrop.id = 'ai-generate-modal-root';
    backdrop.innerHTML = `
      <div class="figma-draft-card ai-modal-card">
        <button class="figma-draft-close" id="btn-ai-modal-close" title="Schließen">✕</button>
        <div id="ai-modal-body">
          <div class="ai-modal-loading">KI-Status wird geladen...</div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop && !this.isGenerating) this.close();
    });
    backdrop.querySelector('#btn-ai-modal-close')?.addEventListener('click', () => {
      if (!this.isGenerating) this.close();
    });

    await this.loadStatus();
    this.render();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

  async loadStatus() {
    const cfg = this.getCustomerConfig();
    const statusUrl = cfg.aiStatusUrl || '/customizer/ai/status';

    try {
      const res = await fetch(statusUrl, { credentials: 'same-origin' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        this.statusData = await res.json();
        return;
      }
    } catch (_) {
      // Standalone local dev fallback
    }

    this.statusData = {
      success: true,
      loggedIn: Boolean(cfg.isLoggedIn),
      loginUrl: cfg.accountUrl || '/customer/account/login',
      registerUrl: cfg.registerUrl || '/customer/account/create',
      quota: cfg.isLoggedIn
        ? { isUnlimited: false, freeLimit: 1, purchasedCredits: 0, usedCount: 0, remaining: 1, canGenerate: true }
        : null,
      history: []
    };
  }

  buildDefaultPrompt() {
    const product = getProductById(this.state?.productId);
    const productName = product?.name || this.state?.productId || 'Workwear Outfit';
    const colors = Object.entries(this.state?.colors || {})
      .map(([zone, hex]) => `${zone}: ${hex}`)
      .join(', ');
    const textCount = (this.state?.texts || []).length;
    const logoCount = (this.state?.logos || []).length;

    return [
      `Photorealistic studio lookbook photo & 360° video of "${productName}" on a realistic human model.`,
      colors ? `Exact colors (${colors}).` : '',
      (textCount || logoCount) ? `Preserve ${logoCount} logo(s) and ${textCount} text element(s) accurately.` : '',
      'Clean dark studio lighting, commercial fashion photography.'
    ].filter(Boolean).join(' ');
  }

  render() {
    const body = this.modalEl?.querySelector('#ai-modal-body');
    if (!body) return;

    if (!this.statusData?.loggedIn) {
      const loginUrl = escapeHtml(this.statusData?.loginUrl || '/customer/account/login');
      const registerUrl = escapeHtml(this.statusData?.registerUrl || '/customer/account/create');
      body.innerHTML = `
        <h2 class="figma-draft-title">REALISTISCHES KI-MODELL GENERIEREN</h2>
        <p class="figma-draft-subtitle">
          Melde dich in deinem Sobral-Kundenkonto an, um aus deinem 3D-Entwurf ein realistisches Studio-Foto und Video zu generieren.
          Jedes Konto erhält <strong>1 kostenlose KI-Generierung</strong> inklusive — alle Ergebnisse bleiben dauerhaft in deinem Konto gespeichert.
        </p>
        <div class="ai-auth-actions">
          <a href="${loginUrl}" class="figma-btn-primary-orange ai-auth-link">ANMELDEN</a>
          <a href="${registerUrl}" class="figma-btn-outline-white ai-auth-link">KOSTENLOS REGISTRIEREN</a>
        </div>
      `;
      return;
    }

    const quota = this.statusData.quota || {};
    const history = Array.isArray(this.statusData.history) ? this.statusData.history : [];
    const quotaBadge = quota.testMode
      ? `<span class="ai-quota-badge ai-quota-unlimited">TEST-MODUS: OHNE LIMIT &amp; LOGIN</span>`
      : quota.isUnlimited
        ? `<span class="ai-quota-badge ai-quota-unlimited">TEST-ACCOUNT: UNBEGRENZTE GENERIERUNGEN</span>`
        : quota.canGenerate
          ? `<span class="ai-quota-badge ai-quota-available">${quota.remaining} GENERIERUNG VERFÜGBAR</span>`
          : `<span class="ai-quota-badge ai-quota-empty">KONTINGENT AUFGEBRAUCHT (0 VERFÜGBAR)</span>`;

    body.innerHTML = `
      <div class="ai-modal-header-row">
        <div>
          <h2 class="figma-draft-title" style="margin-bottom: 6px;">REALISTISCHES KI-MODELL</h2>
          ${quotaBadge}
        </div>
      </div>

      <div class="ai-modal-tabs">
        <button type="button" class="ai-tab-btn ${this.activeTab === 'generate' ? 'active' : ''}" data-ai-tab="generate">
          NEUE GENERIERUNG
        </button>
        <button type="button" class="ai-tab-btn ${this.activeTab === 'history' ? 'active' : ''}" data-ai-tab="history">
          MEINE GENERIERUNGEN (${history.length})
        </button>
      </div>

      <div id="ai-tab-panel"></div>
    `;

    body.querySelectorAll('[data-ai-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.isGenerating) return;
        this.activeTab = btn.dataset.aiTab;
        this.render();
      });
    });

    const panel = body.querySelector('#ai-tab-panel');
    if (this.activeTab === 'history') {
      this.renderHistoryPanel(panel, history);
    } else {
      this.renderGeneratePanel(panel, quota);
    }
  }

  renderGeneratePanel(panel, quota) {
    const canGenerate = Boolean(quota.canGenerate);

    panel.innerHTML = `
      <p class="figma-draft-subtitle" style="margin-bottom: 14px;">
        Es werden automatisch 4 PNG-Ansichten (Vorne, Hinten, Links, Rechts) deines aktuellen 3D-Modells aufgenommen und mit der Prompt-Vorlage an die KI gesendet.
      </p>

      <label class="ai-field-label" for="ai-prompt-input">Zusätzliche Hinweise (optional)</label>
      <textarea id="ai-prompt-input" class="ai-prompt-textarea" rows="2" placeholder="Optional: z. B. Outdoor-Baustelle, Tageslicht, Nahaufnahme..." ${!canGenerate || this.isGenerating ? 'disabled' : ''}>${escapeHtml(this.customPromptText)}</textarea>

      ${!canGenerate ? `
        <div class="ai-quota-notice">
          Deine kostenlose Generierung wurde bereits verwendet. Weitere KI-Kontingente können in Kürze hinzugebucht oder durch den Support freigeschaltet werden.
        </div>
      ` : ''}

      <div id="ai-progress-status" class="ai-progress-box ${this.progressText ? '' : 'hidden'}">${escapeHtml(this.progressText)}</div>
      <div id="ai-latest-result"></div>

      <div class="ai-generate-footer">
        <button type="button" class="figma-btn-primary-orange" id="btn-start-ai-generate" ${!canGenerate || this.isGenerating ? 'disabled' : ''}>
          ${this.isGenerating ? 'GENERIERUNG LÄUFT...' : 'JETZT KI-MODELL (FOTO & VIDEO) GENERIEREN'}
        </button>
      </div>
    `;

    if (this.latestResult) {
      this.renderGenerationCard(panel.querySelector('#ai-latest-result'), this.latestResult);
    }

    const promptInput = panel.querySelector('#ai-prompt-input');
    promptInput?.addEventListener('input', () => {
      this.customPromptText = promptInput.value;
    });

    panel.querySelector('#btn-start-ai-generate')?.addEventListener('click', () => {
      const customPrompt = promptInput?.value || '';
      this.handleGenerate(customPrompt);
    });
  }

  renderHistoryPanel(panel, history) {
    if (!history.length) {
      panel.innerHTML = `
        <div class="ai-empty-history">
          Noch keine KI-Generierungen vorhanden. Starte deine erste Generierung im Tab „NEUE GENERIERUNG“.
        </div>
      `;
      return;
    }

    panel.innerHTML = `<div class="ai-history-list"></div>`;
    const list = panel.querySelector('.ai-history-list');
    history.forEach((item) => {
      const card = document.createElement('div');
      this.renderGenerationCard(card, item);
      list.appendChild(card);
    });
  }

  renderGenerationCard(container, item) {
    if (!container || !item) return;

    const statusLabels = {
      completed: 'FERTIG',
      generating_image: 'FOTO WIRD GENERIERT...',
      generating_video: 'VIDEO WIRD GENERIERT...',
      awaiting_api: 'VORBEREITET (API-KEY FEHLT)',
      processing: 'IN BEARBEITUNG',
      failed: 'FEHLER'
    };
    const badgeText = statusLabels[item.status] || escapeHtml(item.status).toUpperCase();
    const views = item.inputViews || {};
    const viewKeys = ['front', 'back', 'left', 'right'].filter((k) => views[k]);
    const imageUrl = normalizeMediaUrl(item.resultImageUrl);
    const videoUrl = normalizeMediaUrl(item.resultVideoUrl);

    container.innerHTML = `
      <div class="ai-result-card">
        <div class="ai-result-card-head">
          <div>
            <strong>${escapeHtml(item.productName || item.productId || '3D-Modell')}</strong>
            ${item.createdAt ? `<span class="ai-result-date">${escapeHtml(item.createdAt)}</span>` : ''}
          </div>
          <span class="ai-status-pill ai-status-${escapeHtml(item.status)}">${badgeText}</span>
        </div>

        ${(imageUrl || videoUrl) ? `
          <div class="ai-media-grid">
            ${imageUrl ? `
              <div class="ai-media-box">
                <img src="${escapeHtml(imageUrl)}" alt="KI-Foto" class="ai-result-img" />
                <a href="${escapeHtml(imageUrl)}" download class="ai-media-dl">Foto herunterladen</a>
              </div>
            ` : ''}
            ${videoUrl ? `
              <div class="ai-media-box">
                <video src="${escapeHtml(videoUrl)}" controls playsinline class="ai-result-video"></video>
                <a href="${escapeHtml(videoUrl)}" download class="ai-media-dl">Video herunterladen</a>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${viewKeys.length ? `
          <div class="ai-input-views-row">
            ${viewKeys.map((k) => `
              <div class="ai-input-thumb-wrap">
                <img src="${escapeHtml(normalizeMediaUrl(views[k]))}" alt="${escapeHtml(k)}" class="ai-input-thumb" />
                <span>${k.toUpperCase()}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${item.prompt ? `<p class="ai-result-prompt">${escapeHtml(item.prompt)}</p>` : ''}
        ${item.errorMessage && item.status !== 'completed' ? `<p class="ai-result-note">${escapeHtml(item.errorMessage)}</p>` : ''}
      </div>
    `;
  }

  async handleGenerate(customPrompt) {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const btn = this.modalEl?.querySelector('#btn-start-ai-generate');
    const setProgress = (msg) => {
      this.progressText = msg;
      const progressEl = this.modalEl?.querySelector('#ai-progress-status');
      if (progressEl) {
        progressEl.classList.remove('hidden');
        progressEl.textContent = msg;
      }
    };

    if (btn) {
      btn.disabled = true;
      btn.textContent = '4 ANSICHTEN WERDEN ERFASST...';
    }
    setProgress('1/3 — Erfasse Vorne, Hinten, Links & Rechts als PNG...');

    try {
      const views = {
        front: await this.viewer.captureAngle('front', 1024, 1024, true),
        back: await this.viewer.captureAngle('back', 1024, 1024, true),
        left: await this.viewer.captureAngle('left', 1024, 1024, true),
        right: await this.viewer.captureAngle('right', 1024, 1024, true)
      };

      if (btn) btn.textContent = 'ANFRAGE WIRD GESENDET...';
      setProgress('2/3 — Sende Modell-Ansichten & Prompt an KI-Backend...');

      const cfg = this.getCustomerConfig();
      const product = getProductById(this.state?.productId);
      const res = await fetch(cfg.aiGenerateUrl || '/customizer/ai/generate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: this.state?.productId || 'custom',
          productName: product?.name || this.state?.productId || 'Workwear',
          prompt: customPrompt,
          views,
          config: this.state
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.code === 'AUTH_REQUIRED') {
          this.statusData = { ...this.statusData, loggedIn: false, loginUrl: data.loginUrl, registerUrl: data.registerUrl };
          this.isGenerating = false;
          this.render();
          return;
        }
        throw new Error(data.message || 'Unbekannter Fehler bei der KI-Anfrage.');
      }

      if (data.quota) {
        this.statusData.quota = data.quota;
      }
      if (data.generation) {
        this.latestResult = data.generation;
        this.statusData.history = [data.generation, ...(this.statusData.history || [])];
        this.render();
      }

      const gen = data.generation;
      if (gen && (gen.status === 'generating_image' || gen.status === 'generating_video')) {
        await this.pollUntilDone(gen.id, setProgress);
      } else {
        setProgress(data.skeletonMode
          ? 'Vorbereitet (Magnific API-Key in Magento-Einstellungen hinterlegen).'
          : 'KI-Generierung abgeschlossen!');
      }
    } catch (err) {
      setProgress(`Fehler: ${err.message}`);
    } finally {
      this.isGenerating = false;
      this.render();
    }
  }

  async pollUntilDone(generationId, setProgress) {
    const cfg = this.getCustomerConfig();
    const pollBase = cfg.aiPollUrl || '/customizer/ai/poll';
    const sep = pollBase.includes('?') ? '&' : '?';

    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 3500));
      if (!this.modalEl) return;

      const res = await fetch(`${pollBase}${sep}id=${encodeURIComponent(generationId)}`, {
        credentials: 'same-origin'
      });
      const data = await res.json();
      const gen = data?.generation;
      if (!gen) continue;

      this.latestResult = gen;
      this.statusData.history = (this.statusData.history || []).map((item) =>
        item.id === gen.id ? gen : item
      );
      this.render();

      if (gen.status === 'generating_image') {
        setProgress('2/3 — Realistisches Studio-Foto wird generiert...');
      } else if (gen.status === 'generating_video') {
        setProgress('3/3 — Studio-Foto fertig! 360°-Video wird gerendert...');
      } else if (gen.status === 'completed') {
        setProgress('Fertig! Foto & Video gespeichert.');
        return;
      } else if (gen.status === 'failed') {
        throw new Error(gen.errorMessage || 'Generierung fehlgeschlagen.');
      }
    }
    throw new Error('Zeitüberschreitung beim Warten auf die KI-Generierung.');
  }
}
