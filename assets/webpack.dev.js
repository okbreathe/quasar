#!/usr/bin/env node

const express = require('express')
const webpack = require('webpack')
const config  = require('./webpack.config')

const compiler = webpack(config)
const app = express()

app.use(require('cors')())

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler, {
  log: console.log
}))

app.listen(4001, '0.0.0.0', function (err) {
  if (err) return console.error(err)
  console.log('Asset server running on localhost:4001')
})

// Exit on end of STDIN
process.stdin.resume()
process.stdin.on('end', function () {
  process.exit(0)
})

