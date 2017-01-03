import { apiActions, jsonAPI, Headers } from 'redux-api-resources'

const getToken = () =>
  process.env.TRANSIENT
  ? null
  : document.querySelector("#token").content

const inPageUser = (name, req) => {
  let user
  if (name == "current_user" && req.action == "fetch") {
    user = JSON.parse(document.querySelector("#app").dataset.user)
    req.setFetched()
  }
  req.resolve(user)
}

export default apiActions(resource => {
  resource("pages")
  resource("search", { only: ["index"], readonly: true })
  resource("current_user", { singleton: true, path: "/users", only: ["show", "update"] })
  resource("revisions", {
    only: ["index", "create", "destroy"],
    prefix: "/api/pages/:page_id/",
    meta: (action) => action == "fetch" ? { replace: true } : {}
  })
  resource("uploads", { only: ["create"], readonly: true , options: () => ({ headers: { 'Authorization' : getToken() } }) })
  resource("tags")
}, {
  prefix: '/api',
  whiny: true,
  middleware: [
    process.env.TRANSIENT
      ? require("../lib/backends/transient").transientStorage
      : inPageUser,
    jsonAPI,
  ],
  options: () => ({
    headers:  { ...Headers["JSON-API"], 'Authorization' : getToken() }
  })
})
