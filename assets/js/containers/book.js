import React, { PropTypes } from "react"
import { bindActionCreators } from 'redux'
import { connect }  from 'react-redux'
import { push } from 'react-router-redux'
import { Button } from "@blueprintjs/core"

import uiActions from '../actions/ui'
import resourceActions from '../actions/resources'
import { Page, Sort, Search } from '../components/book'

let timeout = null, delay = 300

const NoResults = () => <div id='no-pages'><span>No Pages</span></div>

const Results = ({ pages, tag }) => <ul>{ pages.map(p => <Page key={p.id} page={p} tag={tag} />) }</ul>

const Searching = () => <div id='searching-pages'><div className='loading'></div></div>

class Book extends React.Component {
  onCreate = () => {
    const { tag, dispatch, actions } = this.props
    actions.create({ page: { tags: typeof(tag) == "object" ? tag.attributes.name : "" } })
      .then(({ payload }) => {
        // TODO This varies due to how transientStorage and the server send responses
        const page = payload.data instanceof Array ? payload.data[0] : payload.data
        dispatch(push(`/app/tags/${(typeof(tag) == "object" ? tag.id : tag) || 'all'}/pages/${page.id}`))
      })
  }

  onSearch = (val) => {
    const { uiActions } = this.props
    clearTimeout(timeout)
    timeout = setTimeout(() => val.toString().trim() === ""
                           ? uiActions.searchReset()
                           : uiActions.search(val), delay)
  }

  onSort = (field, dir) => this.props.uiActions.sort(field, dir)

  render(){
    const { ui: { sort, search: { searching, finished } }, tag, pages = [] } = this.props
    const search_loading = searching && !finished

    return (
      <section id='book' className='col'>
        <header>
          <div className={`top-bar${ searching ? ' searching' : '' }`}>
            <Search pages={pages} onChange={this.onSearch} />
            <Button iconName="plus" onClick={this.onCreate} className="pt-minimal" />
          </div>
          <Sort ui={sort} pages={pages} onChange={this.onSort} />
        </header>
        { search_loading ? <Searching /> : ((tag || searching) && pages.length ? <Results tag={tag} pages={pages} /> : <NoResults />) }
      </section>
    )
  }
}

Book.propTypes = {
  pages: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired
}

export default connect(
  (state) => ({ ui: state.ui }),
  (dispatch) => ({
    dispatch,
    uiActions: bindActionCreators(uiActions, dispatch),
    actions: bindActionCreators(resourceActions.pages, dispatch),
  })
)(Book)
