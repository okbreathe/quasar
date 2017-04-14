import Dexie from 'dexie'
import Fuse from 'fuse.js'
import format from 'date-fns/format'
import { dataURLToBlob, except } from '../'
import { replace } from 'react-router-redux'

// NOTE ids are integers in the database but strings in redux
const schema = {
  pages:      "++id,title,content,is_trashed,is_favorite,inserted_at,updated_at",
  pages_tags: "++,page_id,tag_id",
  tags:       "++id,&name",
  uploads:    "++id,name,file,content_type,size",
  versions:   "++id,event,item_id,content,snapshot,inserted_at",
  users:      "++id,name,email,settings"
}
const db = window.db = new Dexie("quasar")
const to_keep = 20 // Versions to keep
let seeding = null

db.version(1).stores(schema)

// In order to persist images across reloads we store all the generated URLs
// against the upload ID so we can substitute them in dynamically when
// transforming the document markdown
const UploadCache = {}

export function objectURL(url) {
  return url.substr(0,3) == "in:" ? UploadCache[url.replace(/[^\d]*/g, "")] : url
}

export async function transientStorage(name, req) {
  const { resolve, setFetched, dispatch, options: { data, params } } = req
  const Model = { pages: Page, search: Page, current_user: User, uploads: Upload, revisions: Revision }[name]

  setFetched()

  switch (req.action) {
    case 'create':
      await Model.create(resolve, data)
      break
    case 'update':
      await Model.update(resolve, data, params)
      break
    case 'destroy':
      await Model.destroy(resolve, data)
      break
    default:
      await data && data.query
        ? Model.search(resolve, data)
        : Model.fetch(resolve, data, dispatch)
  }
}

export function clearTransientStorage(){
  localStorage.removeItem("seeded")
  return db.delete().then(() => window.location.pathname = [process.env.BASENAME, "/app"].join(""))
}

const Upload = {
  create(resolve, data) {
    const files = data.getAll('upload[file][]')
    const uploads = []

    files.forEach(f => {
      const fr = new FileReader()
      fr.onload = (e) => {
        db.uploads.add({ file: e.target.result, name: f.name, content_type: f.type })
          .then(id => db.uploads.get(id))
          .then(upload => {
            uploads.push(upload)
            Upload.cache(upload)
            if (uploads.length == files.length) resolve(toJSON.upload(uploads))
          })
      }
      fr.readAsDataURL(f)
    })
  },

  cache(upload) {
    (upload instanceof Array ? upload : [upload])
      .reduce((acc,u) => {
        acc[u.id] = { url: URL.createObjectURL(dataURLToBlob(u.file)), filename: u.name }
        return acc
      }, UploadCache)
  }
}

const Revision = {
  fetch(resolve, data) {
    db.versions
      .where("item_id")
      .equals(parseInt(data.page_id))
      .reverse()
      .sortBy("inserted_at")
      .then(vs => resolve(toJSON.revision(vs)))
  },

  async create(resolve, data) {
    const page = await db.pages.get(parseInt(data.page_id))
    db.versions
      .put({ item_id: page.id, event: 'update', title: page.content, content: page.content, snapshot: true, inserted_at: now() })
      .then(id => db.versions.get(id))
      .then(r => resolve(toJSON.revision(r)))
  },

  destroy(resolve, data) {
    db.versions.delete(parseInt(data.id)).then(() => resolve(toJSON.empty()))
  },
}

const User = {
  async fetch(resolve, _data, dispatch) {
    await Wiki.seed(dispatch)
    resolve(toJSON.user(await db.users.get(1)))
  },

  async update(resolve, data) {
    const { user: { settings = {} } } = data
    const user = await db.users.get(1) || {}
    await db.users.put({ id: 1, ...data.user, settings: { ...user.settings, ...settings } })
    resolve(toJSON.user(await db.users.get(1)))
  }
}

const Page = {
  async fetch (resolve, _data, dispatch) {
    await Wiki.seed(dispatch)

    const pages = await db.pages.toArray()
    const pages_tags = await db.pages_tags.toArray()
    const tags = await db.tags.toArray()

    await Page.buildUploadCache()

    resolve(toJSON.page(pages.map(p => {
      return Page.mergeTags(
        p,
        // Associate tags
        pages_tags
          .filter(pt => pt.page_id == p.id)
          .map(pt => tags.find(t => pt.tag_id == t.id ))
      )
    })))
  },

  async search(resolve, data) {
    const pages = await db.pages.toArray()
    const fuse = new Fuse(pages, { shouldSort: true, keys: ["title", "content"], minMatchCharLength: 2 })
    resolve(toJSON.search(fuse.search(data.query)))
  },

  async create(resolve, data) {
    const date = now()
    const id = await db.pages.add({ title: "", content: "", is_trashed: false, is_favorite: false, inserted_at: date, updated_at: date })
    const page = await db.pages.get(id)
    const tags = await Page.createTags(id, empty(data.page.tags) ? [] : [{ name: data.page.tags }])
    resolve(toJSON.page(Page.mergeTags(page, tags)))
  },

  async update(resolve, data, params = {}) {
    const id = parseInt(params.id)
    const prevPage = await db.pages.get(id)
    let revision

    // Create revision if content changed
    if (prevPage.content != data.page.content) revision = await Page.createRevision(id, prevPage.content)

    // Update page
    await db.pages.update(id, { updated_at: now(), ...except(data.page, 'id', 'tags', 'tag_list', 'inserted_at', 'updated_at') })
    const page = await db.pages.get(id)
    const tags = await Page.createTags(id, data.page.tags)
    resolve(toJSON.page(Page.mergeTags(page, tags, revision)))
  },

  async createRevision(item_id, content){
    if (!content) return
    const id = await db.versions.put({ item_id, event: 'update', content, inserted_at: now() })
    // Remove old versions
    const ids = (
      await db.versions
      .where("item_id")
      .equals(item_id)
      .filter(v => !v.snapshot)
      .reverse()
      .sortBy("inserted_at")
    ).map(v => v.id).slice(to_keep)
    await db.versions.where("id").anyOf(ids).delete()
    return await db.versions.get(id)
  },

  // TODO This can be improved, we're doing the same thing twice
  async createTags(page_id, tags = []){
    if (tags && tags.length) {
      // Get existing tags
      const names = tags.map(t => t.name)
      const existing_tags = (await db.tags.where("name").anyOf(names).toArray()).reduce((acc,t) => { acc[t.name] = 1; return acc }, {})
      const new_names = tags.filter(t => !existing_tags[t.name])
      // Add tags which don't exist
      await db.tags.bulkAdd(new_names)
      // Insert tag/page links
      const all_tags = await db.tags.where("name").anyOf(names).toArray()
      await db.pages_tags.where("page_id").equals(page_id).delete()
      await db.pages_tags.bulkAdd(all_tags.map(t => ({ tag_id: t.id, page_id })))
    }

    const tag_ids = (await db.pages_tags.where("page_id").equals(page_id).toArray()).map(pt => pt.tag_id)

    return await db.tags.where("id").anyOf(tag_ids).toArray()
  },

  mergeTags (page, tags, revisions ) {
    return { ...page, tags, tag_list: tags.map(t => t.name).join(","), revisions: toJSON.asArray(revisions) }
  },

  async buildUploadCache (){
    return await db.uploads.toArray().then(us => Upload.cache(us))
  },

  async destroy (resolve, data) {
    return await db.pages.delete(parseInt(data.id)).then(() => resolve(toJSON.empty()))
  }
}

const toJSON = {
  search(results) {
    return { data: toJSON.asArray(results).map(r => ({ id: r.id.toString() })), included: [] }
  },

  page(results) {
    results = toJSON.asArray(results)
    return {
      data: results.map(r => {
        return {
          id: r.id.toString(),
          attributes: except(r, "tags", "id"),
          relationships: {
            tags: { data: r.tags.map(t => ({ id: t.id.toString(), type: "tag" })) },
            revisions: { data: r.revisions.map(v => ({ id: v.id.toString(), type: "revision" })) }
          }
        }
      }),
      included: toJSON.included(results, { tags: 'tag', revisions: 'revision' })
    }
  },

  revision(results) {
    return {
      data: toJSON.asArray(results).map(r => {
        const attrs = except(r, 'id')
        return { id: r.id.toString(), attributes: attrs }
      }),
      included: []
    }
  },

  upload(results) {
    results = toJSON.asArray(results)
    return {
      data: {
        type: "upload",
        relationships: { files: { data: results.map(u => ({ id: u.id.toString(), type: "file" })) } }
      },
      included: results.map(u => ({
        type: "file",
        id: u.id.toString(),
        attributes: {
          urls: { original: `in:memory:${u.id}`},
          file: { file_name: u.name },
          content_type: u.content_type
        }
      }))
    }
  },

  user(u) {
    return {
      data: {
        type: "user",
        id: u.id.toString(),
        attributes: except(u,'id')
      },
      included: []
    }
  },

  included(results, types){
    return results.reduce((acc, r) => {
      Object.keys(types).forEach(key => {
        acc = acc.concat(r[key].map(o => ({ id: o.id.toString(), attributes: except(o, 'id'), type: types[key] })))
      })
      return acc
    }, [])
  },

  empty() {
    return { data: {}, included: [], jsonapi: { version: "1.0" } }
  },

  asArray(objs) {
    return objs ? (objs instanceof Array ? objs : [objs]) : []
  }
}

const Wiki = {
  // Pull data from a seeds meta tag if available
  seed(dispatch) {
    const seedURL = document.querySelector("#seeds")

    if (!seedURL) seeding = new Promise(res => res())

    if (!(localStorage.getItem("seeded") || seeding)) {
      seeding = new Promise(async (res) => {
        const date = now()
        const resp = await fetch(seedURL.content)
        const data = await resp.json()
        // Generate user
        await db.users.add(data.user)
        // Generate pages
        const page_id = await db.pages.add({ ...data.page, inserted_at: date, updated_at: date })
        const tag_id = await db.tags.add(data.tag)
        await db.pages_tags.add({ tag_id, page_id })
        localStorage.setItem("seeded", true)
        // Navigate to generated page
        dispatch(replace(`/app/tags/${tag_id}/pages/${page_id}`))
        res(true)
      })
    }

    return seeding
  }
}

function empty(str) {
  return !str || str.trim() === ""
}

function now() {
  return format(Date.now())
}

if (module.hot) {
  module.hot.accept()
  module.hot.dispose(() => Page.buildUploadCache())
}
