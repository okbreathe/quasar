// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import React from "react"
import ReactDOM from "react-dom"
import configureStore from "./store"
import { syncHistoryWithStore } from 'react-router-redux'
import { browserHistory } from 'react-router'
import App from './containers'

import '../css/index.scss'

const store   = configureStore()
const history = syncHistoryWithStore(browserHistory, store)
const target  = document.getElementById('app')
const node    = <App history={history} store={store} />

if (target) ReactDOM.render(node, target)

// https://www.garysieling.com/blog/3183-2
if (module.hot) module.hot.accept()
