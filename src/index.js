import html from './template.html';
import css from './styles.css';
import Prism from 'prismjs';
import stripIndent from 'common-tags/lib/stripIndent';

const xml = new window.XMLSerializer();
const LINK_REGEX = /\[(?<textContent>[^\]]+)\]\((?<href>[^\)]+)\)/g;

class CodeAnatomy extends window.HTMLElement {

  /** Lifecycle methods */

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style type="text/css">${css}</style>${html}`;

    this._$slot = this.shadowRoot.getElementById('slot');
    this._$code = this.shadowRoot.getElementById('code');
    this._$area = this.shadowRoot.getElementById('area');
    this._$textarea = this.shadowRoot.getElementById('textarea');
    this._$list = this.shadowRoot.getElementById('list');
    this._$component = this.shadowRoot.getElementById('component');
  }

  static get observedAttributes() { 
    return [ 'definitions', 'edit' ]
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'definitions') this._render();
    if (attrName === 'edit') this._edit();
  }

  connectedCallback() {
    this._$slot.addEventListener('slotchange', () => this._init());
    this._$area.addEventListener('click', () => this._copy(this._$textarea));
    this._$code.addEventListener('click' , ev => this._click(ev));
    this.addEventListener('keyup' , ev => this._esc(ev));
  }

   /** Public methods */

  clear() {
    this.definitions = [];
    return this;
  }

  create(payload) {
    if (['match', 'occurrence', 'term'].every(key => key in payload)) {
      this.definitions = this.definitions.concat(payload);
    }
    return this;
  }

  remove(index) {
    this.definitions = this.definitions.filter((def, i) => i !== index);
    return this;
  }

  update(index, payload) {
    this.definitions = this.definitions.map((def, i) => i === index ? Object.assign(def, payload) : def);
    return this;
  }

  /** Private methods */

  _attributes(item) {
    if (this.edit) {
      item.setAttribute('contentEditable', '');
    } else {
      item.removeAttribute('contentEditable');
    }
  }

  _blur(index) {
    const { textContent } = this._$list.children[index];
    if (textContent.trim()) {
      this.update(index, { term: textContent });
    } else {
      this.remove(index);
    }
  }

  _clear() {
    this._$list.innerHTML = '';
    if (!this.language) return;
    const annotations = this._$code.querySelectorAll('.annotate');
    annotations && [...annotations].forEach((elem) => elem.classList.remove('annotate'));
  }

  _click({ target }) {
    if (!this.edit) return;
    const textNodes = this._getTextNodes(target);
    const match = textNodes.reduce((m, { nodeValue }) => {
      const clean = nodeValue.replace(/\W/g, '');
      return m.length < clean.length ? nodeValue : m;
    }, '');
    this.create({ match, occurrence: 0, term: this.placeholder });
  }

  _copy(elem) {
    elem.select();
    typeof document.execCommand === 'function' && document.execCommand("copy");
  }

  _create({ match, occurrence, term }) {
    if (!this.language) return;
    const filter = ({ data }) => RegExp(match).test(data);
    const textNodes = this._getTextNodes(this._$code, filter);
    const index = this._$list.children.length;
    if (textNodes[occurrence]) {
      this._createAnnotation(textNodes[occurrence], index);
      this._createDescription(term, index);
    }
  }

  _createAnnotation(node, index) {
    const $elem = node.parentElement;
    $elem.classList.add('annotate');
    $elem.dataset.index = index+1;
    $elem.setAttribute('aria-describedby', `item-${index}`);
    $elem.tabIndex = 0;
  }

  _createDescription(term, index) {
    const $term = document.createElement('li');
    this._processContent(term, $term);
    this._attributes($term);
    $term.id = `item-${index}`;

    $term.addEventListener('mouseenter', () => this._mouseenter(index));
    $term.addEventListener('mouseleave', () => this._mouseleave(index));
    $term.addEventListener('blur', () => this._blur(index));

    this._$list.appendChild($term);
  }

  _edit() {
    [...this._$list.children].forEach(this._attributes, this);
  }

  _esc(ev) {
    if (ev.key === 'Escape' && this.edit) {
      this.edit = false;
      this._copy(this._$component);
    }
  }

  _getAnnotationByIndex(index) {
    return this._$code.querySelector(`[data-index="${index+1}"]`);
  }

  _getTextNodes(parent, acceptNode) {
    const nodes = [];
    const args = [parent, window.NodeFilter.SHOW_TEXT];
    if (acceptNode) args.push({ acceptNode });
    const walker = document.createTreeWalker(...args);
    while(walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  _highlight() {
    if (this.language) {
      const args = [this.html, Prism.languages[this.language], this.language];
      this._$code.innerHTML = Prism.highlight(...args);
    }
  }

  _init() {
    this._$code.innerHTML = '';
    this._$textarea.textContent = this.html;
    this._highlight();
    this._render();
  }

  _mouseenter(index) {
    const $item = this._getAnnotationByIndex(index);
    $item && $item.setAttribute('aria-current', '');
  }

  _mouseleave(index) {
    const $item = this._getAnnotationByIndex(index);
    $item && $item.removeAttribute('aria-current');
  }

  _processContent(content, parent) {
    let node = document.createTextNode(content);
    parent.appendChild(node);

    [...content.matchAll(LINK_REGEX)].reduce((pointer, match) => {
      const { length } = match[0];
      node = node.splitText(match.index - pointer);
      node = node.splitText(length);
      const a = document.createElement('a');
      Object.assign(a, match.groups);
      parent.replaceChild(a, node.previousSibling);
      return match.index + length;
    }, 0);
  }

  _render() {
    this._clear();
    this.definitions.forEach(this._create, this);
    this._$component.value = this.outerHTML;
  }

  /** Getters/Setters */

  get definitions() {
    try {
      const result = JSON.parse(window.atob(this.getAttribute('definitions')));
      return [].concat(result).filter(Boolean);
    } catch (err) {
      return [];
    };
  }

  set definitions(value) {
    if (!value || !value.length) {
      this.removeAttribute('definitions');
    } else if (Array.isArray(value)) {
      this.setAttribute('definitions', window.btoa(JSON.stringify(value)));
    }
  }

  get edit() {
    return this.hasAttribute('edit');
  }

  set edit(value) {
    if (value) {
      this.setAttribute('edit', '');
    } else {
      this.removeAttribute('edit');
    }
  }

  get html() {
    const nodes = this._$slot.assignedNodes();
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

  get placeholder() {
    return this.getAttribute('placeholder') || 'placeholder';
  }

  set placeholder(value) {
    if (value) {
      this.setAttribute('placeholder', value);
    } else {
      this.removeAttribute('placeholder');
    }
  }
}

window.customElements.define('code-anatomy', CodeAnatomy);
