const { resolve } = require('path');
const pkg = require('../package.json');
const { expect } = require('chai');
const DOM = require('./dom');

describe('<code-anatomy/>', function () {

  let dom, anatomy;

  before(function () {
    dom = new DOM();
    require(resolve(pkg.browser));
  });

  after(function () {
    dom.destroy();
  });

  beforeEach(function () {
    const def = 'W3sibWF0Y2giOiJtb3N0LWltcG9ydGFudCIsIm9jY3VycmVuY2UiOjAsInRlcm0iOiJTZXQgdGhlIGlkIG9mIHRoZSBtb3N0IGltcG9ydGFudCBoZWFkaW5nIn0seyJtYXRjaCI6ImgxIiwib2NjdXJyZW5jZSI6MCwidGVybSI6IlJlbWVtYmVyIHRvIHVzZSBvbmx5IDEgaDEgdGFnIn1d';
    anatomy = document.body.appendChild(document.createElement('code-anatomy'));
    anatomy.setAttribute('language', 'html');
    anatomy.setAttribute('definitions', def);
    anatomy.textContent = `
      <main>
        <h1 id="most-important">My First Heading</h1>
        <p>My first paragraph.</p>
      </main>
    `;
  });

  afterEach(function () {
    document.body.removeChild(anatomy);
  });

  it('should mount a component', function () {
    expect(anatomy.shadowRoot).to.exist;
  });

  it('should allow editing', function () {
    expect(anatomy.hasAttribute('edit')).to.be.false;
    anatomy.edit = true;
    expect(anatomy.hasAttribute('edit')).to.be.true;
  });

  it('should change placeholder', function () {
    expect(anatomy.placeholder).to.equal('placeholder');
    anatomy.setAttribute('placeholder', 'Testing change')
    expect(anatomy.placeholder).to.equal('Testing change');
  });

  it('should set language', function () {
    anatomy.setAttribute('language', 'css')
    expect(anatomy.language).to.equal('css');
  });

  it('should set definitions', function () {
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(2);
    expect(anatomy.definitions).to.deep.include({ match:'most-important', occurrence: 0, term:'Set the id of the most important heading' });
  });

  it('should create definitions', function () {
    anatomy.create({ match: 'main', occurrence: 0, term: 'Main element' });
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(3);
  });

  it('should update definitions by index', function () {
    anatomy.update(1, { term: 'Main content' });
    expect(anatomy.definitions).to.deep.include({ match: 'h1', occurrence: 0, term: 'Main content' });
  });

  it('should remove definitions by index', function () {
    anatomy.remove(1);
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(1);
    expect(anatomy.definitions).to.not.deep.include({ match: 'h1', occurrence: 0, term: 'Remember to use only 1 h1 tag' });
  });

  it('should clear definitions', function () {
    anatomy.clear();
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(0);
    expect(anatomy.hasAttribute('definitions')).to.be.false;
  });
});
