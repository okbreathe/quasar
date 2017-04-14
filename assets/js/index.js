import React from "react"
import ReactDOM from "react-dom"
import configureStore from "./store"
import { createHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
import { useRouterHistory } from 'react-router'
import App from './containers'

import '../css/index.scss'

const store          = configureStore()
const browserHistory = useRouterHistory(createHistory)({ basename: process.env.BASENAME })
const history        = syncHistoryWithStore(browserHistory, store)
const target         = document.getElementById('app')
const node           = <App history={history} store={store} />

if (target) ReactDOM.render(node, target)

// https://www.garysieling.com/blog/3183-2
if (module.hot) module.hot.accept()

import { } from 'react-router'

