const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // point Puppeteer’s cache into a folder that Render will preserve
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
