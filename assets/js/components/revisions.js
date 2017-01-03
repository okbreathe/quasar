import React, { PropTypes } from "react"
import { Button } from "@blueprintjs/core"
import format from 'date-fns/format'

import { Formats } from '../constants'

const Revision = (props) => {
  const { revision, onClick, selected } = props
  const setRevision = (e) => {
    e.preventDefault()
    onClick(revision.id)
  }

  return (
    <li key={revision.id}>
      <a href='#' onClick={setRevision} className={selected && selected.id == revision.id ? 'active' : ''}>
        {revision.attributes.snapshot ? "Snapshot" : "AutoSave"}
        <br/>
        {format(revision.attributes.inserted_at, Formats.DATE_LONG)}
      </a>
    </li>
  )
}

export class Revisions extends React.PureComponent {
  state = { filter: 'all' }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open && nextProps.open != this.props.open) {
      this.props.onOpen()
    }
  }

  render() {
    const { revisions = [], revision, onShow, onCreate, onDestroy } = this.props
    const filtered = this.state.filter == 'all'
      ? revisions
      : ( this.state.filter == 'autosave' ? revisions.filter(r => !r.attributes.snapshot) : revisions.filter(r => r.attributes.snapshot))
    return (
      <div id='revisions' className='offscreen'>
        <header>
          <h5>
            {`${revisions.length} Revisions`}
          </h5>
          <div className='pt-select pt-minimal'>
            <select onChange={e => this.setState({ filter: e.target.value })}>
              <option value="all">All</option>
              <option value="autosave">Autosaves</option>
              <option value="snapshot">Snapshots</option>
            </select>
          </div>
        </header>
        <div className="pt-button-group pt-minimal pt-fill">
          <Button iconName="add" text="Snapshot" className="pt-minimal" onClick={() => onCreate()}/>
          <Button iconName="undo" text="Restore" className="pt-minimal" disabled={!revision} onClick={() => onCreate(revision)}/>
          <Button iconName="trash" text="Delete" className="pt-minimal pt-intent-danger" disabled={!revision} onClick={() => onDestroy(revision)}/>
        </div>
        <ul className='revisions'>
          {filtered.map(r => <Revision key={r.id} revision={r} selected={revision} onClick={onShow} />)}
        </ul>
      </div>
    )
  }
}

Revisions.propTypes = {
  revisions: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
}
