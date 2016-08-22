// webtask entry point used by Webpack
const Webtask = require('webtask-tools') /* express app as a webtask */
const createServer = require('./lib/app')
module.exports = Webtask.fromExpress(createServer({})) // webtask.io environment
