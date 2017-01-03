import { combineReducers } from "redux"
import { routerReducer } from "react-router-redux"

import resources from "./resources"
import ui from "./ui"

export default combineReducers({
  ui,
  ...resources,
  routing: routerReducer,
})
