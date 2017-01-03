import React, { PropTypes } from "react"
import { bindActionCreators } from 'redux'
import { connect }  from 'react-redux'
import resourceActions from '../actions/resources'
import { replace } from 'react-router-redux'
import { Queue } from '../lib'
import equal from 'deep-equal'
import { only } from '../lib'
import { Controls, Editable, NoPage } from '../components/page'

let scrolling, scrollingEditor = false, scrollingPreview = false, interval

const DEV = process.env.NODE_ENV == "development"

class Page extends React.Component {
  state = {
    column: 2,
    editor: null,
    preview: null,
    content: "",
    title: "",
    syncIn: 0,
    syncing: false,
    dirty: false,
    queue: new Queue((args, res, rej) => this.onUpdate(args).then(res).catch(rej), { debug: DEV })
      .complete(() => this.setState({ syncIn: this.syncIn() }))
      .empty(() => this.setState({ syncing: false }))
  }

  componentWillReceiveProps(props) {
    const { actions, page, ui } = props
    const column = parseInt(ui.settings.editor_column)

    // Sync if we're changing pages or if we've changde tags (and there will not be a page)
    if (page && !equal(page, this.props.page) || !page && this.props.page) {
      this.doSync()
    }

    // Actual page object changed, not just an edit of the current page
    // We only want to set the content / title on page load so background
    // saving doesn't interupt the user while editing
    if (this.pageChanged(this.props, props)) {
      const tags = page.attributes.tag_list.split(",").reduce((l,t) => t.trim() === "" ? l : l.concat([{name: t}]), [])
      const { attributes, id } = page

      actions.initializeForm({ id, attributes: { ...attributes, tags } })

      this.setState({ content: page.attributes.content, title: page.attributes.title, syncIn: this.syncIn(), dirty: false })
    // If the page has been updated sync the content state
    } else if (page && !equal(page, this.props.page)) {
      // If the page changes while the revision panel is open the user restored
      // a revision so update the form as well
      if (this.props.revision) {
        this.props.form.change({ ...only(page.attributes, 'title', 'content') })
      }

      this.setState({ content: page.attributes.content }, () => {
        this.setState({ dirty: this.hasChanges() })
      })
    // Mark the form as dirty if there are any changes to the form
    } else if (props.form.state().content != this.state.content ) {
      this.setState({ dirty: this.hasChanges() })
    }

    if (column && column != this.state.column) {
      this.setState({ column })
    }
  }

  componentDidMount() {
    interval = setInterval(() => {
      const timeLeft = this.state.syncIn - (new Date().getTime())
      if (timeLeft <= 0) this.doSync()
    }, 1000)

    // Ctrl+S saves
    window.addEventListener('keydown', this.onKeyDown)
    // Prompt user to save unsaved changes
    if (!DEV) window.addEventListener("beforeunload", this.onBeforeUnload)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown)
    if (!DEV) window.removeEventListener("beforeunload", this.onBeforeUnload)
    clearInterval(interval)
  }

  onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && String.fromCharCode(e.which).toLowerCase() == "s") {
      e.preventDefault()
      this.onUpdate()
    }
  }

  onBeforeUnload = (e) => {
    if (!this.state.dirty) return undefined
    const confirmationMessage = 'Please wait for the document to be saved'
    e.returnValue = confirmationMessage // Gecko, Trident, Chrome 34+
    return confirmationMessage // Gecko, WebKit, Chrome <34
  }

  onMount = (editor) => this.setState({ editor })

  onScroll = (component, ratio) => {
    const { ui } = this.props
    const { editor } = this.state
    const preview = document.getElementById("page-view")
    const revision = document.getElementById("revision-view")

    if (!ui.settings.scroll_sync) return

    scrolling = component

    this[revision ? 'scrollRevision' : 'scrollEditor'](component, ratio, preview, editor, revision)
  }

  // I think what's happening is that the element changes
  scrollEditor = (component, ratio, preview, editor) => {
    // Return unless both elements can scroll
    if (preview.scrollHeight <= preview.clientHeight || editor.renderer.layerConfig.maxHeight <= editor.renderer.$size.scrollerHeight) return

    if (component.renderer && scrolling == component && !scrollingPreview) { // Scrolling the editor
      scrollingEditor = true
      preview.scrollTop = Math.round(ratio * (preview.scrollHeight - preview.offsetHeight))
      scrollingEditor = false
    } else if (scrolling == component && !scrollingEditor) { // scrolling the preview
      scrollingPreview = true
      editor.getSession().setScrollTop(
        Math.round(ratio * (editor.renderer.layerConfig.maxHeight - editor.renderer.$size.scrollerHeight ))
      )
      scrollingPreview = false
    }
  }

  scrollRevision = (component, ratio, preview, _editor, revision) => {
    // Return unless both elements can scroll
    if (preview.scrollHeight <= preview.clientHeight || revision.scrollHeight <= revision.clientHeight) return

    if (scrolling == revision && !scrollingEditor) { // scrolling the revision
      scrollingPreview = true
      preview.scrollTop = Math.round(ratio * (preview.scrollHeight - preview.offsetHeight))
      scrollingPreview = false
    } else if (scrolling == component && !scrollingPreview) { // scrolling the preview
      scrollingEditor = true
      revision.scrollTop = Math.round(ratio * (revision.scrollHeight - revision.offsetHeight))
      scrollingEditor = false
    }
  }

  doSync = () => {
    const sync = this.canSync()
    sync
      ? this.state.queue.add(sync)
      : this.setState({ syncIn: this.syncIn() })
  }

  // Saves after 5 minutes have elapsed, or when user changes tabs
  // Don't save if there are no changes at all
  canSync = () => {
    if (!this.props.page) return false

    const { page, form } = this.props
    const args = { page: form.state(), id: page.id }

    if (this.state.queue.inQueue(args)) return false

    return this.hasChanges() ? args : false
  }

  // Just generates a time 3 minutes into the future
  syncIn = (n = 3) => new Date().getTime() + (n * 60 * 1000)

  hasChanges = () => {
    return !!(this.props.form.state().content && this.props.form.state().content !== this.state.content)
  }

  pageChanged = (oldProps, newProps) =>
    ((!oldProps.page && newProps.page) || ((oldProps.page && newProps.page) && oldProps.page.id != newProps.page.id))

  onUpdate = () => {
    const { actions, page, form } = this.props
    return actions.update({ page: form.state(), id: page.id })
  }

  // TODO Can combine toggleTrash and update
  onToggleTrash = () => {
    const { actions, dispatch, page } = this.props
    actions.update({ page: { is_trashed: !page.attributes.is_trashed } , id: page.id })
      .then(_ => dispatch(replace('/app/tags/recent')))
  }

  onDestroy = () => {
    const { actions, dispatch, page } = this.props
    actions.destroy({ id: page.id })
      .then(_ => dispatch(replace('/app/tags/trash')))
  }

  onFavorite = () => {
    const { actions, page } = this.props
    actions.update({ page: { is_favorite: !page.attributes.is_favorite } , id: page.id })
  }

  onChangeColumn = (column) => this.setState({ column })

  onCancel = () => {
    const { page, actions } = this.props
    actions.change(page.attributes.title, { field: "title" })
  }

  render(){
    const { form, uploadAction, revision, page, tags } = this.props
    const col = this.state.column
    const className=`col panel-${revision ? 2 : col}`

    return (
      <section id='page' className={className}>
        <div id='page-content' className='page-panel'>
          {page
             ? <Editable {...this.props}
                 field={form.field}
                 column={col}
                 revision={revision}
                 page={page}
                 dirty={this.state.dirty}
                 onUpload={uploadAction.create}
                 onMount={this.onMount}
                 onScroll={this.onScroll}
                 onUpdate={this.onUpdate}
                 onCancel={this.onCancel}
                 />
             : <NoPage />}
        </div>
        <footer>
          {page &&
          <Controls
            field={form.field}
            page={page}
            suggestions={tags.map(t => ({ ...t.attributes, id: t.id }))}
            onChange={this.onUpdate}
            onToggleTrash={this.onToggleTrash}
            onDestroy={this.onDestroy}
            onChangeColumn={this.onChangeColumn}
            onFavorite={this.onFavorite}
          />}
        </footer>
      </section>
    )
  }
}

Page.propTypes = {
  page: PropTypes.object,
  tags: PropTypes.array,
  onRevisions: PropTypes.func,
}

export default connect(
  (state, _props) => ({
    ui: state.ui,
    status: state.pages.status
  }),
  dispatch => {
    const actions = bindActionCreators(resourceActions.pages, dispatch),
          uploadAction = bindActionCreators(resourceActions.uploads, dispatch),
          form = actions.formFor()
    return { form, dispatch, actions, uploadAction }
  }
)(Page)
