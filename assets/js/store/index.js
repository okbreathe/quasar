import { createStore, applyMiddleware, compose } from "redux"
import thunkMiddleware from "redux-thunk"
import { routerMiddleware } from 'react-router-redux'

import reducers from "../reducers"

const devToolsExt = window.__REDUX_DEVTOOLS_EXTENSION__
  ? window.__REDUX_DEVTOOLS_EXTENSION__()
  : f => f

export default function configureStore(browserHistory) {
  const store = createStore(
    reducers,
    compose(
      applyMiddleware(thunkMiddleware, routerMiddleware(browserHistory)),
      devToolsExt
    )
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers/index').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
