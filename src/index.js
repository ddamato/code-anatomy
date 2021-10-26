import html from './template.html';
import css from './styles.css';
import Prism from 'prismjs';
import stripIndent from 'common-tags/lib/stripIndent';

const xml = new window.XMLSerializer();

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
      this.annotations.forEach(this._annotate, this);
    }
  }

  _annotate({ match, occurrence, term }) {
    const acceptNode = (node) => RegExp(match).test(node.data);
    const args = [this.$code, window.NodeFilter.SHOW_TEXT, { acceptNode }];
    const tree = document.createTreeWalker(...args);
    while (tree.nextNode()) {
      if (!occurrence) {
        tree.currentNode.parentElement.classList.add('annotate');
        this.$list.appendChild(document.createElement('li')).textContent = term;
      } else {
        occurrence--
      }
    }
  }

  get annotations() {
    return [{
      match: 'aria-label',
      occurrence: 0,
      term: 'Where the wild things are',
    }];
  }

  get html() {
    const nodes = this.$slot.assignedNodes();
    const str = [...nodes]
      .map((node) => xml.serializeToString(node))
      .join('')
      .replace(/ xmlns="[^"]+"/g, '');
    return stripIndent(str);
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
