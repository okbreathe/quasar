import React from "react"
import { bindActionCreators } from 'redux'
import { connect, Provider }  from 'react-redux'
import { Redirect, Router, Route } from 'react-router'
import { Library, Revisions } from '../components'
import resourceActions from '../actions/resources'
import uiActions from '../actions/ui'
import Settings from './settings'
import Book from './book'
import Page from './page'
import { compareDates, compareStrings } from '../lib/'
import { filter, toArray, map } from 'redux-api-resources'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = { collapsed : false, column: 3, menu_open: false, revisions_open: false }
  }

  componentWillMount(){
    this.props.pageActions.index()
      .then(() => document.querySelector("#app-loading").className = "loaded")
    this.props.uiActions.init()
  }

  onToggle = () => {
    this.setState({ collapsed : !this.state.collapsed  })
  }

  onChangeColumn = (val) =>{
    this.setState({ column: val, collapsed: false })
  }

  toggleMenu = (menu, state) => {
    let menu_open, revisions_open
    switch (menu) {
      case 'menu':
        menu_open = state
        revisions_open = false
        break
      case 'revisions':
        menu_open = false
        revisions_open = state
        break
    }
    this.setState({ menu_open, revisions_open })
  }

  fetchRevisions = () => {
    const { page_id } = this.props.params
    this.props.revisionsActions.index({ page_id })
      .then(resp => resp.success && this.setState({ revision: this.props.revisions[0] }))
  }

  toggleRevisions = () => {
    const revisions_open = !this.state.revisions_open
    this.setState({ revisions_open, revision: null })
  }

  showRevision = (id) => {
    const { revisions } = this.props
    const revision = revisions.filter(r => r.id == id)[0]
    this.setState({ revision })
  }

  // If there's a revision, we're restoring it, otherwise
  // creating a snap shot
  createRevision = (revision) => {
    const { page_id } = this.props.params
    revision
      ? this.props.pageActions.update({ page: { content: revision.attributes.content }}, { id: revision.attributes.item_id  })
      : this.props.revisionsActions.create({ page_id })
  }

  destroyRevision = (revision) => {
    const { id, attributes: { item_id } } = revision
    this.props.revisionsActions.destroy({ page_id: item_id , id })
    // TODO Might want to auto select another revision
  }

  uiColors = (_ui) => {
    // const rgb = ui.settings.ui_color
    //
    // if (rgb) {
    //   let { r,g,b } = rgb
    //   let val = `rgb(${r},${g},${b})`;
    //   return `
    //     :root {
    //       --qs-bg: ${val};
    //       --qs-bg-light: ${shadeBlendConvert(0.3,val)};
    //       --qs-bg-dark: ${shadeBlendConvert(-0.3,val)};
    //       --qs-bg-extra-dark: ${shadeBlendConvert(-0.6,val)};
    //     }
    //   `
    // }
    return ""
  }

  render(){
    const { page, pages, revisions, tag, tags, ui } = this.props
    const { collapsed , column } = this.state
    const col = collapsed ? (column == 1 ? 2 : 1) : column
    const className  = [
      this.state.menu_open ? 'menu-open' : false,
      this.state.revisions_open ? 'revisions-open' : false,
      `col-${col} pt-dark`
    ].filter(c => c).join(" ")

    return (
     <div id='root' className={className}>
       <main>
         <Library tags={tags} onSettings={ () => this.setState({ menu_open: !this.state.menu_open }) } />
         <Book page={page} tag={tag} pages={pages} />
         <Page page={page} tags={tags} onRevisions={this.toggleRevisions} revision={this.state.revision} />
       </main>
       <Settings />
       <Revisions
         revisions={revisions}
         revision={this.state.revision}
         onCreate={this.createRevision}
         onDestroy={this.destroyRevision}
         onOpen={this.fetchRevisions}
         onShow={this.showRevision}
         open={this.state.revisions_open}
       />
       <div id='menu-close' onClick={() => this.setState({ menu_open: !this.state.menu_open })} />
       <style>{this.uiColors(ui)}</style>
     </div>
    )
  }
}

function hasTag(p, tag_id) {
  const pageTags = p.relationships.tags.data.reduce((m, t) => { m[t.id] = 1; return m }, {})
  return !!pageTags[tag_id]
}

const ConnectedApp = connect(
  (state, props) => {
    const { ui, session } = state
    const { sort, search } = ui
    const { tag_id, page_id } = props.params
    const tags  = map(state.tags)
    const revisions = map(state.revisions).sort((a,b) => compareDates(a, b, 'inserted_at', 'DESC'))
    let pages, tag

    // Filter pages
    if (isNaN(parseInt(tag_id))) { // Special keyword
      tag = tag_id
      switch (tag_id) {
        case 'trash':
          pages = filter(state.pages, p => p.attributes.is_trashed)
          break
        case 'favorites':
          pages = filter(state.pages, p => p.attributes.is_favorite && !p.attributes.is_trashed)
          break
        default:
          // Only remove trashed if we're not searching
          pages = search.searching ? toArray(state.pages) : filter(state.pages, p => !p.attributes.is_trashed)
          if (tag_id == "recent") pages = pages.sort((a,b) => compareDates(a, b, 'updated_at', 'DESC')).slice(0,10)
      }
    } else {
      pages = filter(state.pages, p => hasTag(p, tag_id) && !p.attributes.is_trashed)
      tag = (tag_id ? tags.filter(t => t.id == tag_id) : tags)[0]
    }

    const page = pages.find(p => p.id == page_id)

    // Search pages
    if (search.searching && search.finished) {
      pages = search.results.map(r => state.pages.entities[ r.id ])
    }

    // Sort pages
    pages = pages.sort((a,b) => {
      switch (sort.field) {
        case 'title': return compareStrings(a, b, sort.field, sort.direction)
        default:      return compareDates(a, b, sort.field, sort.direction)
      }
    })

    return {
      ui,
      page,
      pages,
      revisions,
      session,
      tag,
      tags,
    }
  },
  (dispatch) => ({
    pageActions: bindActionCreators(resourceActions.pages, dispatch),
    tagActions: bindActionCreators(resourceActions.tags, dispatch),
    revisionsActions: bindActionCreators(resourceActions.revisions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  })
)(App)

const Root = (props) => {
  return (
    <Provider store={props.store}>
      <Router history={props.history}>
        <Route path="/app" component={ConnectedApp}>
          <Route path="/app/tags/(:tag_id)" component={ConnectedApp} >
            <Route path="pages/(:page_id)" component={ConnectedApp} />
          </Route>
        </Route>
        <Redirect from='*' to='/app' />
      </Router>
    </Provider>
  )
}

export default Root
