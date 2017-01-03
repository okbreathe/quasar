import {
  CHANGE_SUCCESS,
  CHANGE_FAILURE,
  INIT_SUCCESS,
  INIT_FAILURE,
  SORT,
  SEARCH_START,
  SEARCH_SUCCESS,
  SEARCH_FAILURE,
  SEARCH_RESET,
} from '../actions/ui'

const initialState = {
  search: { value: null, searching: false, results: [], finished: false },
  sort:   { field: 'updated_at', direction: 'DESC' },
  settings: {},
}

export default function(state = initialState, action) {
  const { payload, type } = action
  const { search, settings }  = state
  let field, direction

  switch (type) {
    case CHANGE_SUCCESS: return { ...state, settings: { ...settings, [payload.key]: payload.value } }
    case INIT_SUCCESS:
      if (payload.sort) [field, direction] = payload.sort.split(".")
      return { ...state, settings: payload, sort: { field, direction } }
    case SORT: return { ...state, sort: payload }
    case SEARCH_START  : return { ...state, search: { ...search, searching: true, value: payload.value.trim() === "" ? null : payload.value, finished: false } }
    case SEARCH_SUCCESS: return { ...state, search: { ...search, ...payload, finished: true } }
    case SEARCH_FAILURE: return { ...state, search: { ...search, results: [], searching: false, finished: true } }
    case SEARCH_RESET:   return { ...state, search: { ...search, searching: false, results: [], value: null, finished: false } }
    default:             return state
  }
}
