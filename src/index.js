import html from './template.html';
import css from './styles.css';
import Prism from 'prismjs';

const xml = new XMLSerializer();

class CodeAnatomy extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style type="text/css">${css}</style>${html}`;

    this.$slot = this.shadowRoot.getElementById('slot');
    this.$code = this.shadowRoot.getElementById('code');
    this.$textarea = this.shadowRoot.getElementById('textarea');
    this.$list = this.shadowRoot.getElementById('list');

    this.$slot.addEventListener('slotchange', () => {
      this.$textarea.textContent = this.html;
      this._highlight();
    });
  }

  _highlight() {
    if (this.language) {
      const args = [this.html, Prism.languages[this.language], this.language];
      this.$code.innerHTML = Prism.highlight(...args);
    }
  }

  get html() {
    const nodes = this.$slot.assignedNodes();
    return [...nodes]
      .map((node) => xml.serializeToString(node))
      .join('')
      .replace(/ xmlns="[^"]+"/g, '');
  }

  get language() {
    return this.getAttribute('language');
  }

  set language(newVal) {
    if (newVal) {
      this.setAttribute('language', newVal);
    } else {
      this.removeAttribute('language');
    }
  }
}

window.customElements.define('code-anatomy', CodeAnatomy);
