import { apiReducer } from 'redux-api-resources'

export default apiReducer(resource => {
  resource("pages")
  resource("tags")
  resource("revisions")
  resource("search", { readonly: true })
  resource("current_user", { singleton: true })
}, {
  entityReducer: (action, data) => data.data,
  // Unpack the errors into an object keyed by the field
  errorReducer: (action_type, payload) => {
    return payload.errors.reduce((acc, item) => {
      let chunks = item.source.pointer.split("/")
      acc[chunks[chunks.length - 1]] = item.detail
      return acc
    }, {})
  },
  formReducer: o => ({ ...o.attributes, id: o.id }),
})
