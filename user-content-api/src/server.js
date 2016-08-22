// Local server entry point, launched by `npm start --port 3333` command
require('dotenv').load()
const minimist = require('minimist')

const webtask = require('./lib/app')

const context = {
  data: {
    MONGO_URI: process.env.MONGO_URI,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET
  }
}

console.log('Starting manually the Express server', context)
const app = webtask(context)
const argv = minimist(process.argv.slice(2))
const PORT = argv.port || 3000
console.log('Express server listening on port', PORT)
app.listen(PORT)
