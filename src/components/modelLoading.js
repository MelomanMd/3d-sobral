export class ModelLoadingIndicator {
  constructor(container, onRetry) {
    this.container = container;
    this.element = document.createElement('div');
    this.element.className = 'model-load-overlay';
    this.element.hidden = true;
    this.element.innerHTML = `
      <div class="model-load-card" role="status" aria-live="polite">
        <span class="model-load-spinner" aria-hidden="true"></span>
        <strong class="model-load-label"></strong>
        <progress class="model-load-progress" max="100" aria-label="Modell laden"></progress>
        <span class="model-load-detail"></span>
        <button type="button" class="model-load-retry" hidden>Erneut versuchen</button>
      </div>`;
    container.appendChild(this.element);
    this.label = this.element.querySelector('.model-load-label');
    this.detail = this.element.querySelector('.model-load-detail');
    this.progress = this.element.querySelector('progress');
    this.retry = this.element.querySelector('button');
    this.retry.addEventListener('click', onRetry);
  }

  show() {
    this.element.hidden = false;
    this.element.dataset.state = 'loading';
    this.container.setAttribute('aria-busy', 'true');
    this.label.textContent = '3D-Modell wird geladen …';
    this.detail.textContent = 'Bitte einen Moment warten';
    this.progress.hidden = false;
    this.progress.removeAttribute('value');
    this.retry.hidden = true;
  }

  update(event) {
    const megabytes = (event.loaded / 1024 / 1024).toFixed(1);
    if (event.lengthComputable && event.total > 0) {
      const percent = Math.min(100, Math.round(event.loaded / event.total * 100));
      this.progress.value = percent;
      this.detail.textContent = `${percent}% · ${megabytes} MB`;
      if (event.loaded >= event.total) this.prepare();
    } else {
      this.detail.textContent = `${megabytes} MB geladen`;
    }
  }

  prepare() {
    this.label.textContent = '3D-Modell wird vorbereitet …';
    this.detail.textContent = 'Geometrie, Materialien & Texturen';
    this.progress.removeAttribute('value');
  }

  hide() {
    this.element.hidden = true;
    this.container.setAttribute('aria-busy', 'false');
  }

  fail() {
    this.element.dataset.state = 'error';
    this.label.textContent = 'Modell konnte nicht geladen werden';
    this.detail.textContent = 'Bitte erneut versuchen oder ein anderes Modell wählen.';
    this.progress.hidden = true;
    this.retry.hidden = false;
    this.container.setAttribute('aria-busy', 'false');
  }
}
