import resourceActions from './resources'

export const INIT_START     = 'UI/SETTINGS/INIT/START'
export const INIT_SUCCESS   = 'UI/SETTINGS/INIT/SUCCESS'
export const INIT_FAILURE   = 'UI/SETTINGS/INIT/FAILURE'
export const CHANGE_START   = 'UI/SETTINGS/CHANGE/START'
export const CHANGE_SUCCESS = 'UI/SETTINGS/CHANGE/SUCCESS'
export const CHANGE_FAILURE = 'UI/SETTINGS/CHANGE/FAILURE'
export const SORT           = 'UI/SORT '
export const SEARCH_START   = 'UI/SEARCH/START'
export const SEARCH_SUCCESS = 'UI/SEARCH/SUCCESS'
export const SEARCH_FAILURE = 'UI/SEARCH/FAILURE'
export const SEARCH_RESET   = 'UI/SEARCH/RESET'

const { current_user, search: searchResource } = resourceActions

export const init = () => (dispatch, getState) => {
  current_user.show()(dispatch, getState)
    .then(({ success, payload }) =>
      dispatch({ type: success ? INIT_SUCCESS : INIT_FAILURE, payload: success ? payload.data.attributes.settings : {} })
    )
}

export const change = (key, value) => (dispatch, getState) => {
  dispatch({ type: CHANGE_START })
  const user = { user: { settings: { [key]: value } }}
  current_user.update(user)(dispatch, getState)
    .then(resp => dispatch({ type: resp.success ? CHANGE_SUCCESS : CHANGE_FAILURE, payload: { key, value } }))
}

export const search = (value) => (dispatch, getState) => {
  dispatch({ type: SEARCH_START, payload: { value } })
  searchResource.index({ query: value })(dispatch, getState)
    .then(({ payload, success }) => {
      dispatch({ type: success ? SEARCH_SUCCESS : SEARCH_FAILURE, payload: { results: payload.data } })
    })
}

export const searchReset = () => (dispatch) => dispatch({ type: SEARCH_RESET })

export const sort = (field = null, direction = null) => (dispatch, getState) => {
  field = field || getState().ui.sort.field
  direction = direction || getState().ui.sort.direction
  direction = direction && direction.toUpperCase() == 'ASC' ? 'ASC' : 'DESC'
  dispatch({ type: SORT, payload: { field, direction } })
  change('sort', [field, direction].join("."))(dispatch, getState)
}

export default {
  change,
  init,
  search,
  searchReset,
  sort,
}
