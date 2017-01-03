import React, { PropTypes } from "react"
import {
  Button,
  Popover,
  PopoverInteractionKind,
  Position
} from "@blueprintjs/core"
import TagAutocomplete  from 'react-tag-autocomplete'

let timeout

// const Info = (props) => {
//   const { page: { attributes: { inserted_at, updated_at } } } = props
//   return (
//     <div id='page-info'>
//       <time>
//         <span className='day'>{format(updated_at, Formats.DATE_DAY)}</span>
//         <span className='date-time'>
//           {format(updated_at, Formats.DATE_TIME)}
//           <span>Updated</span>
//         </span>
//       </time>
//       <time>
//         <span className='day'>{format(inserted_at, Formats.DATE_DAY)}</span>
//         <span className='date-time'>
//           {format(inserted_at, Formats.DATE_TIME)}
//           <span>Created</span>
//         </span>
//       </time>
//     </div>
//   )
// }

const View = (props) => {
  const { onChangeColumn } = props
  return (
    <div className="pt-button-group">
      <Button iconName="edit" onClick={_ => onChangeColumn(0)}/>
      <Button iconName="eye-open"  onClick={_ => onChangeColumn(1)}/>
      <Button iconName="comparison"  onClick={_ => onChangeColumn(2)}/>
    </div>
  )
}

export class Controls extends React.Component {
  constructor(props) {
    super(props)
    this.state = { editing: false }
  }

  // TODO Should probably take focus/blur into account
  normalize = (value, fieldData) => {
    const tags = (fieldData.previousValue || []).slice(0)
    const { time = 1000, onChange = _ => _ } = this.props

    if (fieldData.eventType == 'handleAddition') {
      tags.push(value)
    } else {
      tags.splice(value, 1)
    }

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(function(){
      timeout = null
      onChange(tags)
    }.bind(this), time)

    return tags
  }

  render(){
    const { field, page, suggestions, onToggleTrash, onDestroy, onFavorite, onChangeColumn } = this.props
    const attrs = page.attributes

    return (
      <div id='page-meta'>
        <div id='page-tags'>
          <span className="pt-icon-standard pt-icon-tag"/>
          <TagAutocomplete
            {...field("tags", { eventType: ['handleDelete', 'handleAddition'], valueKey: 'tags', normalize: this.normalize, defaultValue: [] })}
            handleInputChange={this.maybeUpdate}
            suggestions={suggestions}
            autofocus={false}
            allowNew={true}
          />
        </div>
        <div id='page-controls' >
          <div className="pt-button-group">
            <Popover content={<View onChangeColumn={onChangeColumn} />}
                     interactionKind={PopoverInteractionKind.CLICK}
                     useSmartPositioning={true}
                     position={Position.TOP}
                     >
                <Button iconName="comparison" className="pt-minimal" />
            </Popover>
            {/* <Popover content={<Info page={page} />} */}
            {/*          interactionKind={PopoverInteractionKind.CLICK} */}
            {/*          popoverClassName="pt-popover-content-sizing" */}
            {/*          useSmartPositioning={true} */}
            {/*          position={Position.TOP} */}
            {/*          > */}
            {/*     <Button iconName="info-sign" className="pt-minimal" /> */}
            {/* </Popover> */}
            <Button iconName={attrs.is_favorite ? "star" : "star-empty"} onClick={onFavorite} className="pt-minimal" />
            <Button iconName={attrs.is_trashed ? "undo" : "trash"} onClick={onToggleTrash} className="pt-minimal" />
            { attrs.is_trashed && <Button iconName={"trash"} onClick={onDestroy} className="pt-minimal pt-intent-danger" /> }
          </div>
        </div>
      </div>
    )
  }
}

Controls.propTypes = {
  page: PropTypes.object.isRequired,
  suggestions: PropTypes.array.isRequired,
  onToggleTrash: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onChangeColumn: PropTypes.func.isRequired,
}
