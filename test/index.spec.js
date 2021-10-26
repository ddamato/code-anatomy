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
    anatomy = document.body.appendChild(document.createElement('code-anatomy'));
  });

  afterEach(function () {
    document.body.removeChild(anatomy);
  });

  it('should mount a component', function () {
    expect(anatomy.shadowRoot).to.exist;
  });
});
